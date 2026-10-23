(function (root) {
  'use strict';
  const KEY = 'daily-english-sync-v1';
  const JOURNAL = 'daily-english-sync-journal-v1';
  const BACKUP = 'daily-english-sync-before-connect-v1';
  const DETACHED = 'daily-english-sync-detached-v1';
  const DEVICE = 'daily-english-sync-device-v1';
  const RECOVERY_BACKUP = 'daily-english-sync-recovery-backup-v1';
  const PRIMARY = 'daily-english-lab-state-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const canonical = value => Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
    : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
  const equal = (left, right) => canonical(left) === canonical(right);
  class SyncError extends Error {
    constructor(code, message) { super(message); this.code = code; }
  }
  const cancelled = () => new SyncError('cancelled', '同步已暂停。');
  const deferred = () => new SyncError('deferred', '请先保存或完成当前练习，之后会继续同步。');

  function create(options) {
    const storage = options.storage, merge = options.merge, crypt = options.crypto;
    const fetcher = options.fetch || root.fetch.bind(root);
    const now = options.now || Date.now;
    const later = options.setTimeout || setTimeout, clear = options.clearTimeout || clearTimeout;
    const endpoint = String(options.endpoint || '').replace(/\/$/, '');
    const canApply = options.canApply || (() => true);
    const online = options.online || (() => true);
    const listeners = new Set();
    let meta = null, observed = null, flight = null, aborter = null, epoch = 0;
    let timer = null, stopped = true, generation = 0, rerun = false, retryAt = 0, applying = false;
    let pendingApply = false, phase = 'disconnected', message = '尚未开启自动同步。', busy = false;
    let deviceId = options.deviceId || null;
    let initializationError = null;
    const randomId = () => typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : 'device-' + crypt.generateCode().replace(/-/g, '');

    function status() {
      let conflictCount = 0;
      try { if (observed || meta) conflictCount = merge.conflicts(observed || meta.envelope).length; } catch { /* Report validation errors through sync. */ }
      return { connected: Boolean(meta), busy, phase, state: phase, message, needsRecovery: Boolean(initializationError),
        revision: meta?.revision || 0, lastSyncedAt: meta?.lastSyncedAt || null, conflictCount, pendingApply };
    }
    function announce(next, text) {
      if (next) phase = next;
      if (text !== undefined) message = text;
      const value = status();
      for (const listener of listeners) { try { listener(value); } catch { /* UI listeners cannot interrupt persistence. */ } }
    }
    function normalize(value) {
      const validated = options.validate(clone(value));
      if (!validated || typeof validated !== 'object') throw new SyncError('invalid', '学习记录暂时无法验证，原记录已保留。');
      return merge.materialize(merge.create(validated, 'snapshot-normalizer'));
    }
    function read() {
      if (options.onBeforeRead && options.onBeforeRead() === false) throw deferred();
      return normalize(options.getProgress());
    }
    function materialize(envelope) {
      merge.validate(envelope);
      const payload = merge.materialize(envelope), normalized = normalize(payload);
      if (!equal(payload, normalized)) throw new SyncError('invalid', '云端记录与当前课程版本不兼容，原记录已保留。');
      return payload;
    }
    function checkMeta(value) {
      if (!value || typeof value !== 'object' || typeof value.code !== 'string'
          || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(value.deviceId || '')
          || !Number.isSafeInteger(value.revision) || value.revision < 1
          || (value.lastSyncedAt !== null && (typeof value.lastSyncedAt !== 'string' || !Number.isFinite(Date.parse(value.lastSyncedAt))))) {
        throw new SyncError('settings', '同步设置暂时无法读取，请保留学习备份后重试。');
      }
      const code = crypt.normalizeCode(value.code);
      materialize(value.envelope);
      return { code, deviceId: value.deviceId, envelope: clone(value.envelope), revision: value.revision, lastSyncedAt: value.lastSyncedAt };
    }
    function persist(next) {
      storage.setItem(KEY, JSON.stringify(next));
      meta = next;
    }
    function apply(payload, receiptId) {
      applying = true;
      try {
        if (options.applyProgress(clone(payload), receiptId) !== true) throw new SyncError('storage', '设备没有保存成功，原记录和同步恢复备份都已保留。');
      } finally { applying = false; }
    }
    function finishJournal(journal, current) {
      const payload = materialize(journal.nextMeta.envelope);
      if (!equal(payload, journal.payload)) throw new SyncError('settings', '同步恢复备份无法验证，原记录已保留。');
      if (!equal(current, payload)) {
        if (!canApply()) throw deferred();
        apply(payload, journal.receiptId);
      }
      persist(journal.nextMeta);
      storage.removeItem(JOURNAL);
    }
    function adopt(next, beforeEnvelope, current, forceJournal = false) {
      const payload = materialize(next.envelope);
      if (equal(payload, current) && !forceJournal) { persist(next); return; }
      const journal = { version: 1, receiptId: randomId(), beforeEnvelope: clone(beforeEnvelope), nextMeta: clone(next), payload };
      storage.setItem(JOURNAL, JSON.stringify(journal));
      finishJournal(journal, current);
    }
    function recover() {
      const raw = storage.getItem(JOURNAL);
      if (!raw) return;
      let journal;
      try { journal = JSON.parse(raw); } catch { throw new SyncError('settings', '同步恢复备份无法读取，原记录已保留。'); }
      if (journal?.version !== 1 || !journal.beforeEnvelope || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(journal.receiptId || '')) throw new SyncError('settings', '同步恢复备份格式不正确，原记录已保留。');
      journal.nextMeta = checkMeta(journal.nextMeta);
      if (journal.nextMeta.deviceId !== deviceId) throw new SyncError('settings', '同步恢复备份属于另一台设备，原记录已保留。');
      const before = materialize(journal.beforeEnvelope), target = materialize(journal.nextMeta.envelope), current = read();
      if (!equal(target, journal.payload)) throw new SyncError('settings', '同步恢复备份无法验证，原记录已保留。');
      let wasApplied = false;
      try { wasApplied = JSON.parse(storage.getItem(PRIMARY))?.syncCommitId === journal.receiptId; } catch { /* The normalized primary read above remains authoritative. */ }
      if (!equal(current, target) && (wasApplied || !equal(current, before))) {
        // Learning can continue after a failed storage write. Replay those edits
        // against the pre-apply baseline instead of overwriting them on recovery.
        const local = merge.capture(wasApplied ? journal.nextMeta.envelope : journal.beforeEnvelope, current, deviceId);
        journal.nextMeta.envelope = merge.merge(journal.nextMeta.envelope, local);
        journal.nextMeta.lastSyncedAt = null;
        journal.beforeEnvelope = local;
        journal.payload = materialize(journal.nextMeta.envelope);
        storage.setItem(JOURNAL, JSON.stringify(journal));
      }
      finishJournal(journal, current);
      observed = meta.envelope;
    }
    function capture() {
      const payload = read();
      const envelope = merge.capture(meta.envelope, payload, deviceId);
      const projected = materialize(envelope);
      if (!equal(projected, payload)) {
        if (!canApply()) throw deferred();
        adopt({ ...meta, envelope, lastSyncedAt: null }, meta.envelope, payload);
      } else if (!equal(envelope, meta.envelope)) persist({ ...meta, envelope, lastSyncedAt: null });
      return { payload: projected, envelope: meta.envelope };
    }
    function check(ticket) { if (ticket !== epoch || aborter?.signal.aborted) throw cancelled(); }
    function schedule(delay = 30000) {
      if (timer !== null) clear(timer);
      timer = null;
      if (stopped || !meta) return;
      const wait = Math.max(delay, retryAt - Number(now()), 0);
      timer = later(() => { timer = null; void sync(); }, wait);
    }
    function report(error) {
      if (error?.code === 'cancelled' || error?.name === 'AbortError') return;
      if (error?.code === 'deferred') { pendingApply = true; announce('pending', error.message); return; }
      if (!online()) { announce('offline', '当前没有网络，学习记录已保存在这台设备，联网后会继续同步。'); return; }
      const messages = {
        INVALID_CODE: '同步码格式不正确，请完整复制后重试。',
        AUTHENTICATION_FAILED: '同步码或云端记录无法验证，原学习记录未被修改。',
        SIZE_LIMIT: '学习记录超过同步容量，请先导出完整备份；原记录没有被删减。',
        settings: error?.message, invalid: error?.message, storage: error?.message,
        missing: '没有找到这个同步空间，请检查同步码；设备上的记录未被修改。',
        pairing: '同步码无法验证，请检查后重试；设备上的记录未被修改。',
        rate: '同步操作比较频繁，稍后会自动重试，学习记录已保存在这台设备。',
        capacity: '云端暂时无法建立新的同步空间，设备上的学习记录已保留。',
        conflict: '另一台设备正在更新记录，稍后会继续合并，设备上的记录已保留。',
        connection: '这台设备已经连接同步，请先断开后再连接其他同步码。',
      };
      announce('error', messages[error?.code] || '暂时未能同步，学习记录已保存在这台设备，请稍后重试。');
    }
    async function responseJson(response) {
      const limit = 9 * 1024 * 1024;
      if (Number(response.headers.get('Content-Length')) > limit) throw new SyncError('invalid', '云端返回的记录过大，原记录已保留。');
      const reader = response.body?.getReader();
      if (!reader) return JSON.parse(await response.text());
      const chunks = []; let size = 0;
      try {
        while (true) {
          const next = await reader.read(); if (next.done) break;
          size += next.value.byteLength;
          if (size > limit) { await reader.cancel(); throw new SyncError('invalid', '云端返回的记录过大，原记录已保留。'); }
          chunks.push(next.value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    }
    async function request(method, keys, ticket, body) {
      check(ticket);
      if (!/^https:\/\//.test(endpoint) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(endpoint)) throw new SyncError('settings', '同步服务地址尚未设置。');
      const response = await fetcher(`${endpoint}/${keys.room}`, {
        method, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: aborter.signal,
        headers: { Authorization: `Bearer ${keys.auth}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      check(ticket);
      if (response.status === 429) {
        const seconds = Math.min(86400, Math.max(1, Number(response.headers.get('Retry-After')) || 60));
        retryAt = Number(now()) + seconds * 1000;
        throw new SyncError('rate');
      }
      const value = await responseJson(response);
      check(ticket);
      if (response.status === 409) return { conflict: true, value };
      if (response.status === 404) throw new SyncError('missing');
      if (response.status === 401 || response.status === 403) throw new SyncError('pairing');
      if (!response.ok) throw new SyncError(value?.error === 'service_capacity_reached' ? 'capacity' : 'network');
      if (!Number.isSafeInteger(value?.revision) || value.revision < 1) throw new SyncError('invalid', '云端同步版本无法验证，原记录已保留。');
      return { value };
    }
    function backup() {
      const raw = storage.getItem(PRIMARY);
      storage.setItem(BACKUP, raw === null ? JSON.stringify(read()) : raw);
    }
    function begin(work, enrollment = false) {
      if (flight) return flight;
      const ticket = epoch;
      aborter = new AbortController(); busy = true;
      announce(enrollment ? 'connecting' : 'syncing', enrollment ? '正在连接并保留两台设备上的记录…' : '正在同步学习记录…');
      const startGeneration = generation;
      flight = Promise.resolve().then(async () => {
        try {
          if (initializationError) throw initializationError;
          recover(); check(ticket);
          if (options.onBeforeRead && options.onBeforeRead() === false) throw deferred();
          return await work(ticket);
        }
        catch (error) { report(error); return false; }
      }).finally(() => {
        busy = false; flight = null; aborter = null;
        if (ticket !== epoch) announce(meta ? 'pending' : 'disconnected', meta ? '同步已暂停，学习记录保存在这台设备。' : '已断开同步，设备上的学习记录仍然保留。');
        else announce();
        const soon = rerun || generation !== startGeneration;
        rerun = false;
        schedule(soon ? 2000 : 30000);
      });
      return flight;
    }
    async function performSync(ticket) {
      if (!meta) { announce('disconnected', '尚未开启自动同步。'); return false; }
      capture();
      if (!online()) { announce('offline', '当前没有网络，学习记录已保存在这台设备，联网后会继续同步。'); return false; }
      if (retryAt > Number(now())) throw new SyncError('rate');
      const keys = await crypt.derive(meta.code); check(ticket);
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const remote = (await request('GET', keys, ticket)).value;
        const envelope = await crypt.decrypt(remote.document, keys); check(ticket);
        materialize(envelope);
        let local = capture(), combined = merge.merge(envelope, local.envelope);
        materialize(combined);
        let revision = remote.revision;
        if (!equal(combined, envelope)) {
          let document;
          for (let preparation = 0; preparation < 5; preparation += 1) {
            document = await crypt.encrypt(combined, keys); check(ticket);
            const latest = capture();
            if (equal(latest.envelope, local.envelope)) break;
            local = latest; combined = merge.merge(envelope, local.envelope); materialize(combined);
            if (preparation === 4) { rerun = true; announce('pending', '正在保存新的练习记录，稍后会继续同步。'); return false; }
          }
          const saved = await request('PUT', keys, ticket, { expectedRevision: revision, document });
          if (saved.conflict) continue;
          if (saved.value.revision !== revision + 1) throw new SyncError('invalid', '云端同步版本不连续，原记录已保留。');
          revision = saved.value.revision;
        }
        const latest = capture(), finalEnvelope = merge.merge(combined, latest.envelope);
        const payload = materialize(finalEnvelope), settled = equal(finalEnvelope, combined);
        observed = finalEnvelope;
        const safe = canApply() || equal(payload, latest.payload);
        if (!safe) {
          // Crucial: unseen remote values must not become the next local diff's
          // baseline. Otherwise their absence in the active editor looks like deletion.
          persist({ ...meta, revision });
          pendingApply = true;
          announce('pending', '学习记录已上传。完成当前练习后，会显示另一台设备的新记录。');
          return true;
        }
        const next = { ...meta, envelope: finalEnvelope, revision,
          lastSyncedAt: settled ? new Date(now()).toISOString() : null };
        adopt(next, latest.envelope, latest.payload);
        pendingApply = false;
        if (settled) announce('synced', '本机记录已与云端同步，其他设备联网后会继续更新。');
        else { rerun = true; announce('pending', '新的练习记录已保存，正在等待下一次同步。'); }
        return true;
      }
      rerun = true;
      throw new SyncError('conflict');
    }
    function sync() { return begin(performSync); }
    function createRoom() {
      return begin(async ticket => {
        if (meta) throw new SyncError('connection');
        if (!online()) throw new SyncError('offline');
        if (retryAt > Number(now())) throw new SyncError('rate');
        const code = crypt.generateCode(), keys = await crypt.derive(code); check(ticket);
        let payload = read(), envelope = merge.create(payload, deviceId), document;
        for (let preparation = 0; preparation < 5; preparation += 1) {
          document = await crypt.encrypt(envelope, keys); check(ticket);
          const latest = read(), captured = merge.capture(envelope, latest, deviceId);
          if (equal(captured, envelope)) break;
          payload = latest; envelope = captured;
          if (preparation === 4) throw deferred();
        }
        backup();
        const result = await request('POST', keys, ticket, { expectedRevision: 0, document });
        if (result.conflict || result.value.revision !== 1) throw new SyncError('conflict');
        const current = read(), latest = merge.capture(envelope, current, deviceId);
        const next = { code, deviceId, envelope: latest, revision: 1,
          lastSyncedAt: equal(latest, envelope) ? new Date(now()).toISOString() : null };
        adopt(next, latest, current, true);
        observed = latest; stopped = false; pendingApply = false;
        announce(next.lastSyncedAt ? 'synced' : 'pending', '自动同步已开启。在另一台设备输入同一个同步码即可连接。');
        if (!next.lastSyncedAt) rerun = true;
        return true;
      }, true);
    }
    function connect(code) {
      return begin(async ticket => {
        const normalizedCode = crypt.normalizeCode(code);
        if (meta) {
          if (meta.code === normalizedCode) return performSync(ticket);
          throw new SyncError('connection');
        }
        if (!online()) throw new SyncError('offline');
        if (retryAt > Number(now())) throw new SyncError('rate');
        const keys = await crypt.derive(normalizedCode); check(ticket);
        const remote = (await request('GET', keys, ticket)).value;
        const envelope = await crypt.decrypt(remote.document, keys); check(ticket);
        const remotePayload = materialize(envelope), current = read();
        let local = merge.create(current, deviceId), combined;
        const detachedRaw = storage.getItem(DETACHED);
        if (detachedRaw) {
          const detached = JSON.parse(detachedRaw);
          if (detached.room === keys.room && detached.deviceId === deviceId) {
            materialize(detached.envelope);
            local = merge.capture(detached.envelope, current, deviceId);
            combined = merge.merge(envelope, local);
          }
        }
        if (!combined) combined = equal(remotePayload, current) ? envelope : merge.importSnapshot(envelope, current, deviceId);
        const payload = materialize(combined);
        if (!equal(payload, current) && !canApply()) throw deferred();
        backup();
        const next = { code: normalizedCode, deviceId, envelope: combined, revision: remote.revision,
          lastSyncedAt: equal(combined, envelope) ? new Date(now()).toISOString() : null };
        adopt(next, local, current, true);
        observed = combined; stopped = false; pendingApply = false;
        announce(next.lastSyncedAt ? 'synced' : 'pending', '这台设备已连接，原有学习记录已合并保留。');
        if (!next.lastSyncedAt) rerun = true;
        return true;
      }, true);
    }
    async function disconnect() {
      epoch += 1; aborter?.abort();
      if (timer !== null) clear(timer); timer = null; stopped = true;
      try {
        if (initializationError) {
          // Explicit disconnect is the only escape from malformed settings.
          // Preserve raw bytes, including a possibly recoverable journal, first.
          storage.setItem(RECOVERY_BACKUP, JSON.stringify({ metadata: storage.getItem(KEY), journal: storage.getItem(JOURNAL), detached: storage.getItem(DETACHED), device: storage.getItem(DEVICE), deviceId }));
          storage.removeItem(KEY); storage.removeItem(JOURNAL);
          meta = null; observed = null; pendingApply = false;
          if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(deviceId || '')) {
            deviceId = randomId(); storage.setItem(DEVICE, deviceId);
          }
          initializationError = null;
          announce('disconnected', '已断开同步，原学习记录和无法读取的同步设置备份都已保留。');
          return true;
        }
        recover();
        if (storage.getItem(JOURNAL)) throw new SyncError('storage', '请先完成待恢复的保存，再断开同步。');
        if (meta) {
          capture();
          const keys = await crypt.derive(meta.code);
          storage.setItem(DETACHED, JSON.stringify({ room: keys.room, deviceId, envelope: meta.envelope }));
        }
        storage.removeItem(KEY); meta = null; observed = null; pendingApply = false; retryAt = 0;
        announce('disconnected', '已断开同步，设备和云端的学习记录都保留。');
        return true;
      } catch (error) { report(error); return false; }
    }
    function noteSaved() {
      if (applying) return;
      generation += 1;
      if (!meta) return;
      announce(online() ? 'pending' : 'offline', online() ? '新的学习记录已保存，稍后会自动同步。' : '当前没有网络，学习记录已保存在这台设备。');
      if (flight) rerun = true;
      schedule(2000);
    }
    function resume() { stopped = false; if (flight) rerun = true; else schedule(0); }
    function stop() {
      stopped = true; epoch += 1; aborter?.abort();
      if (timer !== null) clear(timer); timer = null;
    }
    function backupEnvelope() {
      if (!meta) return null;
      const current = merge.capture(meta.envelope, read(), deviceId);
      return clone(observed ? merge.merge(current, observed) : current);
    }
    try {
      if (!deviceId) {
        deviceId = storage.getItem(DEVICE);
        if (!deviceId) {
          deviceId = randomId();
          storage.setItem(DEVICE, deviceId);
        }
      }
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(deviceId)) throw new SyncError('settings', '设备标识无法读取，原学习记录已保留。');
      const stored = storage.getItem(KEY);
      if (stored) {
        meta = checkMeta(JSON.parse(stored));
        if (meta.deviceId !== deviceId) throw new SyncError('settings', '同步设置的设备标识不匹配，原记录已保留。');
      }
      recover();
      if (meta) announce('pending', '已连接自动同步，联网后会检查最新记录。');
    } catch (error) {
      if (error?.code !== 'storage' && error?.code !== 'deferred') {
        initializationError = new SyncError('settings', '同步设置暂时无法读取。请先导出学习记录，再断开同步并重新连接；原设置不会被覆盖。');
        meta = null;
      }
      report(initializationError || error);
    }
    return Object.freeze({ status, subscribe(listener) { listeners.add(listener); listener(status()); return () => listeners.delete(listener); },
      create: createRoom, connect, sync, disconnect, code: () => meta?.code || null,
      conflictCopies: () => clone(observed || meta ? merge.conflicts(observed || meta.envelope) : []),
      backupEnvelope, noteSaved, resume, stop });
  }
  const api = Object.freeze({ create, keys: Object.freeze({ metadata: KEY, journal: JOURNAL, backup: BACKUP, detached: DETACHED, device: DEVICE, primary: PRIMARY, recoveryBackup: RECOVERY_BACKUP }) });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DailyEnglishSyncController = api;
})(typeof window !== 'undefined' ? window : null);
