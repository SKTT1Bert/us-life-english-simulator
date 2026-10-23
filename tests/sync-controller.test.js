const test = require('node:test');
const assert = require('node:assert/strict');
const Controller = require('../syncController.js');
const Merge = require('../syncMerge.js');
const Crypto = require('../syncCrypto.js');
const Foundation = require('../foundationProgress.js');
const Pathway = require('../pathwayProgress.js');
const clone = value => JSON.parse(JSON.stringify(value));
const keys = Controller.keys;
function payload() {
  return { schemaVersion: 3, learned: [], favorites: [], marketLearned: [], marketFavorites: [], sessions: {}, theme: 'light', dailyPlan: null,
    reviewSchedule: {}, practiceHistory: [], customExpressions: [], deletedCustomExpressions: [],
    quiz: { correct: 0, total: 0 }, marketQuiz: { correct: 0, total: 0 }, scenarios: { runs: 0, completed: 0, success: 0 }, marketScenarios: { runs: 0, completed: 0, success: 0 },
    foundationProgress: Foundation.empty(), pathwayProgress: Pathway.empty() };
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
function memoryStorage() {
  const map = new Map();
  return { map, fail: null,
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { if (this.fail?.('set', key, value)) throw new Error('Storage full'); map.set(key, String(value)); },
    removeItem(key) { if (this.fail?.('remove', key)) throw new Error('Storage unavailable'); map.delete(key); },
  };
}
function server() {
  const rooms = new Map(), calls = [];
  const service = { rooms, calls, hook: null, throttle: null, conflicts: 0,
    async fetch(url, init) {
      const room = new URL(url).pathname.split('/').pop(), token = init.headers.Authorization;
      const body = init.body ? JSON.parse(init.body) : null;
      calls.push({ url, method: init.method, body: clone(body), token });
      if (service.hook) await service.hook({ method: init.method, room, body });
      if (service.throttle) {
        const seconds = service.throttle; service.throttle = null;
        return Response.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(seconds) } });
      }
      const current = rooms.get(room);
      if (current && current.token !== token) return Response.json({ error: 'invalid_pairing' }, { status: 403 });
      if (init.method === 'GET') return current ? Response.json({ revision: current.revision, updatedAt: new Date().toISOString(), document: current.document }) : Response.json({ error: 'room_not_found' }, { status: 404 });
      if (init.method === 'POST' && !current) {
        rooms.set(room, { token, revision: 1, document: clone(body.document) });
        return Response.json({ revision: 1, updatedAt: new Date().toISOString() }, { status: 201 });
      }
      if (!current) return Response.json({ error: 'room_not_found' }, { status: 404 });
      if (init.method === 'POST' || body.expectedRevision !== current.revision) {
        service.conflicts += 1;
        return Response.json({ error: 'conflict', revision: current.revision }, { status: 409 });
      }
      current.revision += 1; current.document = clone(body.document);
      return Response.json({ revision: current.revision, updatedAt: new Date().toISOString() });
    },
    async state(code) {
      const derived = await Crypto.derive(code), room = rooms.get(derived.room);
      return Merge.materialize(await Crypto.decrypt(room.document, derived));
    },
  };
  return service;
}
function host(service, id, initial = payload(), settings = {}) {
  const storage = settings.storage || memoryStorage(), timers = new Map();
  let clock = Date.UTC(2026, 9, 23, 12), timerId = 0;
  const instance = { storage, current: clone(initial), safe: true, connected: true, writable: true, failApply: false, applies: 0, controller: null,
    edit(change) {
      change(instance.current);
      const receipt = JSON.parse(storage.getItem(keys.primary))?.syncCommitId;
      storage.setItem(keys.primary, JSON.stringify({ ...instance.current, ...(receipt ? { syncCommitId: receipt } : {}) }));
      instance.controller.noteSaved();
    },
    reload() {
      instance.controller?.stop();
      instance.current = JSON.parse(storage.getItem(keys.primary));
      delete instance.current.syncCommitId;
      instance.controller = Controller.create({ storage, merge: Merge, crypto: settings.crypto || Crypto,
        endpoint: 'https://sync.example/api/sync', deviceId: id,
        getProgress: () => clone(instance.current), validate: value => { assert.equal(value.schemaVersion, 3); return value; },
        applyProgress(value, receiptId) {
          if (instance.failApply) return false;
          storage.setItem(keys.primary, JSON.stringify({ ...value, ...(receiptId ? { syncCommitId: receiptId } : {}) })); instance.current = clone(value); instance.applies += 1; return true;
        },
        canApply: () => instance.safe, onBeforeRead: () => instance.writable,
        online: () => instance.connected, now: () => clock,
        fetch: service.fetch.bind(service),
        setTimeout(fn, milliseconds) { const next = ++timerId; timers.set(next, { fn, at: clock + milliseconds }); return next; },
        clearTimeout(id) { timers.delete(id); },
      });
      return instance.controller;
    },
    async tick(milliseconds) {
      clock += milliseconds;
      const due = [...timers.entries()].filter(([, timer]) => timer.at <= clock);
      for (const [id, timer] of due) { timers.delete(id); timer.fn(); }
      if (due.length) await instance.controller.sync();
    },
  };
  if (!storage.getItem(keys.primary)) storage.setItem(keys.primary, JSON.stringify(initial));
  instance.reload();
  return instance;
}
async function pair() {
  const service = server(), a = host(service, 'desktop'), b = host(service, 'phone');
  assert.equal(await a.controller.create(), true);
  assert.equal(await b.controller.connect(a.controller.code()), true);
  await b.controller.sync();
  return { service, a, b, code: a.controller.code() };
}

test('enrollment preserves both devices and sends ciphertext without pairing codes or plaintext', async () => {
  const service = server(), left = payload(), right = payload();
  left.learned = ['desktop-word']; right.favorites = ['phone-word'];
  const a = host(service, 'desktop', left), b = host(service, 'phone', right);
  assert.equal(await a.controller.create(), true);
  const code = a.controller.code();
  assert.equal(await b.controller.connect(code), true);
  await b.controller.sync(); await a.controller.sync();
  assert.deepEqual(a.current.learned, ['desktop-word']); assert.deepEqual(a.current.favorites, ['phone-word']);
  assert.deepEqual(b.current, a.current);
  assert.deepEqual(JSON.parse(b.storage.getItem(keys.backup)), right);
  assert.equal(service.calls.filter(call => call.method === 'POST').length, 1);
  assert.ok(service.calls.every(call => !JSON.stringify(call).includes(code) && !JSON.stringify(call.body).includes('desktop-word')));
  assert.ok(!JSON.stringify(a.controller.backupEnvelope()).includes(code));
  assert.match(a.controller.status().message, /本机记录已与云端同步/);
});

test('a missing or malformed pairing code never creates or overwrites local connection state', async () => {
  const service = server(), original = payload(); original.learned = ['keep'];
  const h = host(service, 'phone', original), raw = h.storage.getItem(keys.primary);
  assert.equal(await h.controller.connect(Crypto.generateCode()), false);
  assert.equal(await h.controller.connect('1234'), false);
  assert.equal(h.storage.getItem(keys.primary), raw);
  assert.equal(h.storage.getItem(keys.metadata), null);
  assert.equal(h.storage.getItem(keys.backup), null);
  assert.equal(service.calls.filter(call => call.method === 'POST').length, 0);
});

test('identical imported records join without reseeding or doubling counters', async () => {
  const service = server(), original = payload(); original.quiz = { correct: 7, total: 10 };
  const a = host(service, 'desktop', original); await a.controller.create();
  a.edit(value => { value.quiz.total += 2; }); await a.controller.sync();
  const b = host(service, 'phone', a.current); await b.controller.connect(a.controller.code());
  assert.deepEqual(JSON.parse(b.storage.getItem(keys.metadata)).envelope, JSON.parse(a.storage.getItem(keys.metadata)).envelope);
  await b.controller.sync(); assert.equal((await service.state(a.controller.code())).quiz.total, 12);
});

test('unknown legacy enrollment takes maximum historical totals without adding known cloud increments twice', async () => {
  const service = server(), original = payload(); original.quiz.total = 10;
  const a = host(service, 'desktop', original); await a.controller.create();
  a.edit(value => { value.quiz.total += 2; }); await a.controller.sync();
  const local = clone(a.current); local.quiz.total = 13; local.theme = 'dark';
  const b = host(service, 'phone', local); await b.controller.connect(a.controller.code()); await b.controller.sync();
  assert.equal(b.current.quiz.total, 13); assert.equal((await service.state(a.controller.code())).quiz.total, 13);
});

test('offline edits persist locally and upload after reconnecting without losing counters', async () => {
  const { service, a, code } = await pair();
  a.connected = false;
  a.edit(value => { value.learned.push('offline'); value.quiz.total += 1; });
  const before = service.calls.length;
  assert.equal(await a.controller.sync(), false);
  assert.equal(service.calls.length, before);
  assert.equal(a.controller.status().phase, 'offline');
  assert.deepEqual(Merge.materialize(JSON.parse(a.storage.getItem(keys.metadata)).envelope).learned, ['offline']);
  a.reload(); a.connected = true;
  assert.equal(await a.controller.sync(), true);
  assert.deepEqual((await service.state(code)).learned, ['offline']);
  assert.equal((await service.state(code)).quiz.total, 1);
});

test('deferred application never turns unseen remote records into local deletions', async () => {
  const { service, a, b, code } = await pair();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  b.safe = false;
  await b.controller.sync();
  assert.deepEqual(b.current.learned, []);
  assert.deepEqual(Merge.materialize(JSON.parse(b.storage.getItem(keys.metadata)).envelope).learned, []);
  assert.equal(b.controller.status().pendingApply, true);
  b.edit(value => value.learned.push('local')); await b.controller.sync();
  assert.deepEqual((await service.state(code)).learned, ['local', 'remote']);
  assert.deepEqual(b.current.learned, ['local']);
  assert.deepEqual(Merge.materialize(JSON.parse(b.storage.getItem(keys.metadata)).envelope).learned, ['local']);
  b.safe = true; await b.controller.sync();
  assert.deepEqual(b.current.learned, ['local', 'remote']);
  assert.equal(b.controller.status().pendingApply, false);
});

test('local changes made while GET is in flight join the outgoing snapshot', async () => {
  const { service, b, code } = await pair(), entered = deferred(), release = deferred();
  service.hook = async ({ method }) => { if (method === 'GET') { entered.resolve(); await release.promise; } };
  const running = b.controller.sync(); await entered.promise;
  b.edit(value => value.favorites.push('during-download'));
  release.resolve(); assert.equal(await running, true);
  assert.deepEqual((await service.state(code)).favorites, ['during-download']);
  assert.deepEqual(b.current.favorites, ['during-download']);
});

test('local changes made during PUT remain pending and are not overwritten by its older snapshot', async () => {
  const { service, b, code } = await pair(), entered = deferred(), release = deferred();
  b.edit(value => value.learned.push('first'));
  service.hook = async ({ method }) => { if (method === 'PUT') { entered.resolve(); await release.promise; } };
  const running = b.controller.sync(); await entered.promise;
  b.edit(value => value.learned.push('later')); release.resolve(); await running;
  assert.deepEqual(b.current.learned, ['first', 'later']);
  assert.equal(b.controller.status().phase, 'pending');
  assert.equal(b.controller.status().lastSyncedAt, null);
  service.hook = null; await b.controller.sync();
  assert.deepEqual((await service.state(code)).learned, ['first', 'later']);
});

test('simultaneous device writes retry CAS conflicts and retain both independent counter increments', async () => {
  const { service, a, b, code } = await pair(), gate = deferred();
  a.edit(value => { value.quiz.total += 1; value.learned.push('desktop'); });
  b.edit(value => { value.quiz.total += 2; value.learned.push('phone'); });
  let initialPuts = 0;
  service.hook = async ({ method }) => {
    if (method === 'PUT' && initialPuts < 2) { initialPuts += 1; if (initialPuts === 2) gate.resolve(); await gate.promise; }
  };
  assert.deepEqual(await Promise.all([a.controller.sync(), b.controller.sync()]), [true, true]);
  assert.ok(service.conflicts >= 1); service.hook = null;
  await a.controller.sync(); await b.controller.sync();
  assert.equal(a.current.quiz.total, 3); assert.equal(b.current.quiz.total, 3);
  assert.deepEqual((await service.state(code)).learned, ['desktop', 'phone']);
});

test('disconnect cancels late network responses without applying or erasing records', async () => {
  const { service, a, b } = await pair(), entered = deferred(), release = deferred();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  service.hook = async ({ method }) => { if (method === 'GET') { entered.resolve(); await release.promise; } };
  const running = b.controller.sync(); await entered.promise;
  const original = clone(b.current);
  assert.equal(await b.controller.disconnect(), true);
  release.resolve(); assert.equal(await running, false);
  assert.deepEqual(b.current, original);
  assert.equal(b.controller.code(), null); assert.equal(b.storage.getItem(keys.metadata), null);
  assert.ok(!service.calls.some(call => call.method === 'DELETE'));
});

test('stop and resume support page lifecycle while debounce batches rapid local saves', async () => {
  const service = server(), h = host(service, 'desktop'); await h.controller.create();
  h.controller.stop(); h.edit(value => value.learned.push('one'));
  const count = service.calls.length; await h.tick(30000); assert.equal(service.calls.length, count);
  h.controller.resume(); await h.tick(0);
  assert.deepEqual((await service.state(h.controller.code())).learned, ['one']);
  const before = service.calls.filter(call => call.method === 'PUT').length;
  h.edit(value => value.learned.push('two')); await h.tick(1000);
  h.edit(value => value.learned.push('three')); await h.tick(1000);
  assert.equal(service.calls.filter(call => call.method === 'PUT').length, before);
  await h.tick(1000);
  assert.equal(service.calls.filter(call => call.method === 'PUT').length, before + 1);
});

test('metadata storage failure leaves primary progress intact and does not upload unpersisted versions', async () => {
  const { service, a, code } = await pair();
  a.edit(value => { value.learned.push('keep'); value.quiz.total += 1; });
  a.storage.fail = (method, key) => method === 'set' && key === keys.metadata;
  const count = service.calls.length; assert.equal(await a.controller.sync(), false);
  assert.equal(service.calls.length, count); assert.deepEqual(a.current.learned, ['keep']);
  a.storage.fail = null; assert.equal(await a.controller.sync(), true);
  assert.equal((await service.state(code)).quiz.total, 1);
});

test('failed primary application journals the target and startup recovery merges later local edits', async () => {
  const { a, b } = await pair();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  b.failApply = true; assert.equal(await b.controller.sync(), false);
  assert.ok(b.storage.getItem(keys.journal)); assert.deepEqual(b.current.learned, []);
  b.edit(value => value.learned.push('later-local'));
  b.failApply = false; b.reload();
  assert.deepEqual([...b.current.learned].sort(), ['later-local', 'remote']);
  assert.equal(b.storage.getItem(keys.journal), null);
  assert.deepEqual(Merge.materialize(JSON.parse(b.storage.getItem(keys.metadata)).envelope), b.current);
});

test('failure after primary application recovers journal without reverting subsequent learning', async () => {
  const { a, b } = await pair();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  b.storage.fail = (method, key) => method === 'set' && key === keys.metadata;
  assert.equal(await b.controller.sync(), false);
  assert.deepEqual(b.current.learned, ['remote']); assert.ok(b.storage.getItem(keys.journal));
  b.storage.fail = null; b.edit(value => value.learned.push('later-local')); b.reload();
  assert.deepEqual([...b.current.learned].sort(), ['later-local', 'remote']);
  assert.equal(b.storage.getItem(keys.journal), null);
});

test('atomic primary receipt prevents counting already-applied remote attempts twice during recovery', async () => {
  const { a, b } = await pair();
  a.edit(value => { value.quiz.total += 4; value.quiz.correct += 2; }); await a.controller.sync();
  b.storage.fail = (method, key) => method === 'set' && key === keys.metadata;
  assert.equal(await b.controller.sync(), false);
  assert.equal(b.current.quiz.total, 4);
  const journal = JSON.parse(b.storage.getItem(keys.journal));
  assert.equal(JSON.parse(b.storage.getItem(keys.primary)).syncCommitId, journal.receiptId);
  b.storage.fail = null;
  b.edit(value => { value.quiz.total += 1; value.quiz.correct += 1; });
  b.reload();
  assert.deepEqual(b.current.quiz, { correct: 3, total: 5 });
  await b.controller.sync(); await a.controller.sync();
  assert.deepEqual(a.current.quiz, { correct: 3, total: 5 });
});

test('a prepared but unapplied journal preserves separate local and remote attempt increments', async () => {
  const { a, b } = await pair();
  a.edit(value => { value.quiz.total += 4; value.quiz.correct += 2; }); await a.controller.sync();
  b.failApply = true; assert.equal(await b.controller.sync(), false);
  assert.equal(b.current.quiz.total, 0);
  b.edit(value => { value.quiz.total += 1; value.quiz.correct += 1; });
  b.failApply = false; b.reload();
  assert.deepEqual(b.current.quiz, { correct: 3, total: 5 });
});

test('failure to write recovery journal prevents primary application', async () => {
  const { a, b } = await pair();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  b.storage.fail = (method, key) => method === 'set' && key === keys.journal;
  assert.equal(await b.controller.sync(), false); assert.deepEqual(b.current.learned, []);
  b.storage.fail = null; await b.controller.sync(); assert.deepEqual(b.current.learned, ['remote']);
});

test('disconnect waits for pending recovery and preserves the cloud room and local data', async () => {
  const { service, a, b } = await pair();
  a.edit(value => value.learned.push('remote')); await a.controller.sync();
  b.failApply = true; await b.controller.sync(); b.safe = false; b.failApply = false;
  assert.equal(await b.controller.disconnect(), false); assert.ok(b.controller.code()); assert.ok(b.storage.getItem(keys.journal));
  b.safe = true; assert.equal(await b.controller.disconnect(), true);
  assert.deepEqual(b.current.learned, ['remote']); assert.equal(service.rooms.size, 1);
});

test('reconnecting a known detached baseline counts only actual offline increments', async () => {
  const service = server(), initial = payload(); initial.quiz.total = 10;
  const h = host(service, 'desktop', initial); await h.controller.create(); const code = h.controller.code();
  h.edit(value => { value.quiz.total += 2; }); await h.controller.sync();
  assert.equal(await h.controller.disconnect(), true);
  assert.ok(!h.storage.getItem(keys.detached).includes(code));
  h.edit(value => { value.quiz.total += 1; });
  assert.equal(await h.controller.connect(code), true); await h.controller.sync();
  assert.equal(h.current.quiz.total, 13); assert.equal((await service.state(code)).quiz.total, 13);
});

test('rate limit Retry-After is honored without discarding pending progress', async () => {
  const { service, a, code } = await pair();
  a.edit(value => value.learned.push('pending')); service.throttle = 60;
  assert.equal(await a.controller.sync(), false); const count = service.calls.length;
  assert.equal(await a.controller.sync(), false); assert.equal(service.calls.length, count);
  await a.tick(59999); assert.equal(service.calls.length, count);
  await a.tick(1); assert.deepEqual((await service.state(code)).learned, ['pending']);
});

test('write gate preflight blocks enrollment before any network request', async () => {
  const service = server(), h = host(service, 'phone'); h.writable = false;
  assert.equal(await h.controller.create(), false); assert.equal(await h.controller.connect(Crypto.generateCode()), false);
  assert.equal(service.calls.length, 0); assert.equal(h.storage.getItem(keys.metadata), null);
});

test('corrupt settings fail closed until explicit disconnect preserves a raw recovery backup', async () => {
  const service = server(), storage = memoryStorage(); storage.setItem(keys.metadata, '{broken');
  const h = host(service, 'phone', payload(), { storage });
  assert.equal(h.controller.status().needsRecovery, true);
  assert.equal(await h.controller.create(), false); assert.equal(await h.controller.connect(Crypto.generateCode()), false); assert.equal(await h.controller.sync(), false);
  assert.equal(storage.getItem(keys.metadata), '{broken'); assert.equal(service.calls.length, 0);
  assert.equal(await h.controller.disconnect(), true);
  assert.equal(h.controller.status().needsRecovery, false);
  assert.equal(JSON.parse(storage.getItem(keys.recoveryBackup)).metadata, '{broken');
  assert.equal(await h.controller.create(), true);
});

test('explicit recovery regenerates a malformed device identity while preserving its raw backup', async () => {
  const service = server(), h = host(service, 'invalid device');
  assert.equal(h.controller.status().needsRecovery, true);
  assert.equal(await h.controller.create(), false);
  assert.equal(await h.controller.disconnect(), true);
  assert.equal(JSON.parse(h.storage.getItem(keys.recoveryBackup)).deviceId, 'invalid device');
  assert.match(h.storage.getItem(keys.device), /^[A-Za-z0-9_-]+$/);
  assert.equal(await h.controller.create(), true);
});

test('repeated sync calls share a single in-flight request sequence', async () => {
  const { service, a } = await pair(), entered = deferred(), release = deferred();
  service.hook = async ({ method }) => { if (method === 'GET') { entered.resolve(); await release.promise; } };
  const first = a.controller.sync(), second = a.controller.sync();
  assert.equal(first, second); await entered.promise; release.resolve();
  assert.equal(await first, true);
});

test('status subscriptions and full backup never expose a pairing code', async () => {
  const service = server(), h = host(service, 'phone'), events = [];
  const unsubscribe = h.controller.subscribe(value => events.push(value));
  await h.controller.create(); const code = h.controller.code();
  assert.ok(events.some(event => event.phase === 'connecting'));
  assert.ok(!JSON.stringify(events).includes(code)); assert.ok(!JSON.stringify(h.controller.backupEnvelope()).includes(code));
  unsubscribe(); const count = events.length; h.controller.noteSaved(); assert.equal(events.length, count);
});
