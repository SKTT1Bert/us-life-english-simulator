(function (root) {
  'use strict';

  // A JSON-only, state-based replication envelope. Callers must first normalize
  // app data through parseProgress, and validate materialize() the same way.
  // A device ID belongs to one browser installation, never to a copied backup.
  const VERSION = 1;
  const MAX_BYTES = 6 * 1024 * 1024;
  const MAX_ACTORS = 128;
  const MAX_ENTRIES = 40000;
  const SETS = ['learned', 'favorites', 'marketLearned', 'marketFavorites'];
  const COUNTERS = { quiz: ['correct', 'total'], marketQuiz: ['correct', 'total'], scenarios: ['runs', 'completed', 'success'], marketScenarios: ['runs', 'completed', 'success'] };
  const COURSES = ['word-parts', 'phonics'];
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const fail = (message) => { throw new Error(message); };
  const actorOK = (value) => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,95}$/.test(value);
  const numberOK = (value) => Number.isSafeInteger(value) && value >= 0;
  const copy = (value) => JSON.parse(JSON.stringify(value));
  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (object(value)) return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
    return JSON.stringify(value);
  }
  const equal = (left, right) => canonical(left) === canonical(right);
  function jsonSafe(value, depth = 0) {
    if (depth > 24) fail('同步记录层级过深。');
    if (value === null || typeof value === 'boolean') return;
    if (typeof value === 'string') { if (value.length > 100000) fail('同步记录文字过长。'); return; }
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('同步记录包含无效数字。'); return; }
    if (Array.isArray(value)) { if (value.length > MAX_ENTRIES) fail('同步记录过多。'); value.forEach((item) => jsonSafe(item, depth + 1)); return; }
    if (!object(value)) fail('同步记录必须是普通 JSON 数据。');
    for (const key of Object.keys(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('同步记录包含不支持的字段。');
      jsonSafe(value[key], depth + 1);
    }
  }
  function bounded(value) {
    jsonSafe(value);
    const serialized = JSON.stringify(value);
    const bytes = typeof TextEncoder === 'function' ? new TextEncoder().encode(serialized).length : unescape(encodeURIComponent(serialized)).length;
    if (bytes > MAX_BYTES) fail('同步记录已超过安全容量，请先导出完整备份。原记录没有被删减。');
    return value;
  }
  function fingerprint(value) {
    const source = canonical(value);
    let first = 2166136261, second = 2246822519;
    for (let index = 0; index < source.length; index++) {
      first = Math.imul(first ^ source.charCodeAt(index), 16777619);
      second = Math.imul(second ^ source.charCodeAt(index), 3266489917);
    }
    return `${(first >>> 0).toString(16)}-${(second >>> 0).toString(16)}-${source.length}`;
  }
  const keyOf = (parts) => JSON.stringify(parts);
  function pathOf(key) {
    let parts;
    try { parts = JSON.parse(key); } catch { fail('同步记录路径无效。'); }
    if (!Array.isArray(parts) || parts.length < 1 || parts.length > 4 || parts.some((part) => typeof part !== 'string' || !part || part.length > 300)
      || keyOf(parts) !== key) fail('同步记录路径无效。');
    const [kind, second] = parts;
    const allowed = (SETS.includes(kind) && parts.length === 2) || (['theme', 'dailyPlan', 'pathwayNavigation'].includes(kind) && parts.length === 1)
      || (['review', 'practice', 'expression', 'tombstone', 'pathwayLesson', 'foundationNavigation'].includes(kind) && parts.length === 2)
      || (['session', 'pathwayAssessment', 'foundationLesson'].includes(kind) && parts.length === 3)
      || (kind === 'foundationAssessment' && parts.length === 4)
      || (['studioDiagnostic', 'studioListening'].includes(kind) && parts.length === 2)
      || (kind === 'studioPreference' && parts.length === 2 && ['minutes', 'levelId', 'goal', 'updatedAt'].includes(second));
    if (!allowed || (kind.startsWith('foundation') && !COURSES.includes(second))) fail('同步记录类型无效。');
    return parts;
  }
  const permanent = (key) => ['practice', 'tombstone', 'pathwayAssessment', 'foundationAssessment', 'studioDiagnostic', 'studioListening', 'studioPreference'].includes(pathOf(key)[0]);
  const sensitive = (key) => ['pathwayLesson', 'foundationLesson', 'expression', 'review', 'studioDiagnostic', 'studioListening'].includes(pathOf(key)[0]);
  function flatten(payload) {
    bounded(payload);
    if (!object(payload) || payload.schemaVersion !== 3 || payload.foundationProgress?.version !== 2 || payload.pathwayProgress?.version !== 1) fail('请先升级并验证学习记录，再启用同步。');
    const entries = {};
    const put = (parts, value) => {
      const key = keyOf(parts); pathOf(key);
      if (own(entries, key) && !equal(entries[key], value)) fail('同步记录标识发生冲突。');
      entries[key] = copy(value);
    };
    for (const field of SETS) {
      if (!Array.isArray(payload[field])) fail('条目标记格式不正确。');
      for (const id of payload[field]) put([field, id], true);
    }
    for (const [day, ids] of Object.entries(payload.sessions || {})) for (const id of ids) put(['session', day, id], true);
    put(['theme'], payload.theme);
    put(['dailyPlan'], payload.dailyPlan);
    for (const [id, record] of Object.entries(payload.reviewSchedule || {})) put(['review', id], record);
    for (const event of payload.practiceHistory || []) put(['practice', event.id], event);
    for (const item of payload.customExpressions || []) put(['expression', item.id], item);
    for (const item of payload.deletedCustomExpressions || []) put(['tombstone', item.id], item);
    const studio = payload.learningStudio;
    if (studio !== undefined) {
      if (!object(studio) || studio.version !== 1 || !object(studio.preferences) || !Array.isArray(studio.diagnostics) || !Array.isArray(studio.listeningAttempts)) fail('学习计划与精听记录格式不正确。');
      // An untouched new device must not overwrite preferences already chosen
      // elsewhere. Fields replicate independently; attempts are immutable events.
      if (studio.preferences.updatedAt !== null) for (const field of ['minutes', 'levelId', 'goal', 'updatedAt']) put(['studioPreference', field], studio.preferences[field]);
      for (const attempt of studio.diagnostics) put(['studioDiagnostic', attempt.id], attempt);
      for (const attempt of studio.listeningAttempts) put(['studioListening', attempt.id], attempt);
    }
    const assessments = (prefix, history) => {
      for (const [stage, attempts] of Object.entries(history || {})) {
        const occurrences = {};
        for (const attempt of attempts) {
          const hash = fingerprint(attempt), ordinal = occurrences[hash] || 0;
          occurrences[hash] = ordinal + 1;
          put([...prefix, stage, `${hash}-${ordinal}`], attempt);
        }
      }
    };
    const route = payload.pathwayProgress;
    put(['pathwayNavigation'], { levelId: route.levelId, lessonId: route.lessonId });
    for (const [id, record] of Object.entries(route.lessons)) put(['pathwayLesson', id], record);
    assessments(['pathwayAssessment'], route.assessments);
    for (const id of COURSES) {
      const course = payload.foundationProgress.courses[id];
      if (!object(course)) fail('基础课程记录缺失。');
      put(['foundationNavigation', id], { levelId: course.levelId, lessonId: course.lessonId });
      for (const [lessonId, record] of Object.entries(course.records)) put(['foundationLesson', id, lessonId], record);
      assessments(['foundationAssessment', id], course.assessments);
    }
    for (const [group, fields] of Object.entries(COUNTERS)) {
      if (!object(payload[group]) || fields.some((field) => !numberOK(payload[group][field]))) fail('累计计数格式不正确。');
    }
    return entries;
  }
  function vector(value) {
    if (!object(value) || Object.keys(value).length > MAX_ACTORS || Object.entries(value).some(([actor, count]) => !actorOK(actor) || !numberOK(count))) fail('同步设备版本无效。');
  }
  const dot = (version) => `${version.actor}:${version.seq}`;
  const lexical = (left, right) => left < right ? -1 : left > right ? 1 : 0;
  const compare = (left, right) => left.seq - right.seq || lexical(left.actor, right.actor);
  function validate(envelope) {
    bounded(envelope);
    if (!object(envelope) || envelope.version !== VERSION || !object(envelope.entries) || !object(envelope.counters) || !object(envelope.archive)
      || Object.keys(envelope).sort().join(',') !== 'archive,clock,counters,entries,version') fail('不支持这个同步记录版本。');
    vector(envelope.clock);
    if (Object.keys(envelope.entries).length > MAX_ENTRIES || Object.keys(envelope.archive).length > MAX_ENTRIES) fail('同步记录过多，原记录未被删减。');
    for (const [key, versions] of Object.entries(envelope.entries)) {
      pathOf(key);
      if (!Array.isArray(versions) || !versions.length || versions.length > MAX_ACTORS) fail('同步记录版本数量无效。');
      const seen = new Set();
      for (const version of versions) {
        if (!object(version) || Object.keys(version).sort().join(',') !== 'actor,deleted,seq,value,seen'.split(',').sort().join(',')
          || !actorOK(version.actor) || !numberOK(version.seq) || version.seq < 1 || typeof version.deleted !== 'boolean'
          || (version.deleted && version.value !== null) || (envelope.clock[version.actor] || 0) < version.seq || seen.has(dot(version))) fail('同步记录版本无效。');
        vector(version.seen);
        if ((version.seen[version.actor] || 0) >= version.seq || Object.entries(version.seen).some(([actor, count]) => count > (envelope.clock[actor] || 0))) fail('同步记录的因果版本无效。');
        seen.add(dot(version));
      }
    }
    if (Object.keys(envelope.counters).sort().join(',') !== Object.keys(COUNTERS).sort().join(',')) fail('同步计数项目无效。');
    for (const [group, fields] of Object.entries(COUNTERS)) {
      const counter = envelope.counters[group];
      if (!object(counter) || Object.keys(counter).sort().join(',') !== 'base,devices' || !object(counter.base) || !object(counter.devices)) fail('同步计数格式无效。');
      const countsOK = (counts) => object(counts) && Object.keys(counts).sort().join(',') === [...fields].sort().join(',') && fields.every((field) => numberOK(counts[field]));
      if (!countsOK(counter.base) || Object.keys(counter.devices).length > MAX_ACTORS || Object.entries(counter.devices).some(([actor, counts]) => !actorOK(actor) || !own(envelope.clock, actor) || !countsOK(counts))) fail('同步计数格式无效。');
    }
    for (const [id, item] of Object.entries(envelope.archive)) {
      if (!object(item) || item.id !== id || typeof item.reason !== 'string' || !Array.isArray(item.path) || !actorOK(item.actor) || !numberOK(item.sequence)) fail('保留副本格式无效。');
      pathOf(keyOf(item.path));
    }
    return envelope;
  }
  function ordered(value) { return copy(JSON.parse(canonical(bounded(value)))); }
  function archiveVersion(envelope, key, version, reason = 'concurrent-edit') {
    if (version.deleted) return;
    const path = pathOf(key), id = `${fingerprint([path, version.value])}-${version.actor}-${version.seq}`;
    const item = { id, path, value: copy(version.value), actor: version.actor, sequence: version.seq, reason };
    if (own(envelope.archive, id) && !equal(envelope.archive[id], item)) {
      // A copy may first be retained by a general conflict, then by a deletion.
      if (!equal({ ...envelope.archive[id], reason }, item)) fail('保留副本标识冲突。');
      item.reason = [reason, envelope.archive[id].reason].sort()[0];
    }
    envelope.archive[id] = item;
  }
  function pick(versions) {
    // A concurrent removal wins over an addition. A later observed addition can
    // restore an ordinary favorite; custom-expression tombstones are permanent.
    const removed = versions.filter((version) => version.deleted);
    return [...(removed.length ? removed : versions)].sort(compare).at(-1);
  }
  function retainConflicts(envelope) {
    for (const [key, versions] of Object.entries(envelope.entries)) {
      if (!sensitive(key) || versions.length < 2) continue;
      const winner = pick(versions);
      for (const version of versions) if (!equal(version.value, winner.value) && !version.deleted) archiveVersion(envelope, key, version);
    }
    for (const [key, versions] of Object.entries(envelope.entries)) {
      const [kind, id] = pathOf(key);
      if (kind !== 'expression') continue;
      if (envelope.entries[keyOf(['tombstone', id])]) for (const version of versions) archiveVersion(envelope, key, version, 'deleted-expression');
    }
  }
  function create(payload, deviceId) {
    if (!actorOK(deviceId)) fail('同步设备标识无效。');
    const entries = flatten(payload);
    const envelope = { version: VERSION, clock: { [deviceId]: 1 }, entries: {}, counters: {}, archive: {} };
    for (const [key, value] of Object.entries(entries)) envelope.entries[key] = [{ actor: deviceId, seq: 1, seen: {}, value, deleted: false }];
    for (const [group, fields] of Object.entries(COUNTERS)) envelope.counters[group] = { base: Object.fromEntries(fields.map((field) => [field, payload[group][field]])), devices: {} };
    return ordered(validate(envelope));
  }
  function merge(left, right) {
    validate(left); validate(right);
    const result = copy(left);
    for (const [actor, count] of Object.entries(right.clock)) result.clock[actor] = Math.max(result.clock[actor] || 0, count);
    for (const [key, incoming] of Object.entries(right.entries)) {
      const byDot = new Map((result.entries[key] || []).map((version) => [dot(version), version]));
      for (const version of incoming) {
        if (byDot.has(dot(version)) && !equal(byDot.get(dot(version)), version)) fail('同一设备产生了重复版本，请为这个浏览器重新生成设备标识。');
        byDot.set(dot(version), copy(version));
      }
      const versions = [...byDot.values()];
      result.entries[key] = versions.filter((candidate) => !versions.some((other) => other !== candidate && (other.seen[candidate.actor] || 0) >= candidate.seq)).sort(compare);
    }
    for (const [group, fields] of Object.entries(COUNTERS)) {
      const target = result.counters[group], source = right.counters[group];
      for (const field of fields) target.base[field] = Math.max(target.base[field], source.base[field]);
      for (const [actor, counts] of Object.entries(source.devices)) {
        if (!target.devices[actor]) target.devices[actor] = Object.fromEntries(fields.map((field) => [field, 0]));
        for (const field of fields) target.devices[actor][field] = Math.max(target.devices[actor][field], counts[field]);
      }
    }
    for (const [id, item] of Object.entries(right.archive)) {
      if (result.archive[id] && !equal({ ...result.archive[id], reason: item.reason }, item)) fail('保留副本标识冲突。');
      result.archive[id] = copy(item);
      if (left.archive[id]) result.archive[id].reason = [left.archive[id].reason, item.reason].sort()[0];
    }
    retainConflicts(result);
    return ordered(validate(result));
  }
  function capture(envelope, payload, deviceId) {
    validate(envelope);
    if (!actorOK(deviceId)) fail('同步设备标识无效。');
    const before = materialize(envelope), oldEntries = flatten(before), current = flatten(payload), result = copy(envelope);
    const changed = [...new Set([...Object.keys(oldEntries), ...Object.keys(current)])].filter((key) => {
      if (permanent(key) && !own(current, key)) return false;
      return !equal(oldEntries[key], current[key]);
    });
    let counterChanged = false;
    for (const [group, fields] of Object.entries(COUNTERS)) for (const field of fields) {
      const delta = Math.max(0, payload[group][field] - before[group][field]);
      if (!delta) continue;
      counterChanged = true;
      const counter = result.counters[group];
      if (!counter.devices[deviceId]) counter.devices[deviceId] = Object.fromEntries(fields.map((name) => [name, 0]));
      counter.devices[deviceId][field] += delta;
      if (!numberOK(counter.devices[deviceId][field])) fail('累计计数超出范围，原记录未被修改。');
    }
    if (!changed.length && !counterChanged) return ordered(result);
    // Lamport sequence is above every observed device sequence. It is unrelated
    // to date/time, so a phone clock being wrong cannot overwrite newer work.
    const sequence = Math.max(0, ...Object.values(result.clock)) + 1;
    if (!numberOK(sequence)) fail('同步版本超出范围，原记录未被修改。');
    retainConflicts(result);
    for (const key of changed) result.entries[key] = [{ actor: deviceId, seq: sequence, seen: copy(envelope.clock), deleted: !own(current, key), value: own(current, key) ? current[key] : null }];
    result.clock[deviceId] = sequence;
    return ordered(validate(result));
  }
  function importSnapshot(envelope, payload, deviceId) {
    // A plain backup does not say which recorded device increments it already
    // includes. Enrollment therefore keeps max(local total, cloud total), rather
    // than treating that unknowable history as additional attempts. Future known
    // per-device increments continue to merge exactly through capture()/merge().
    if (!actorOK(deviceId)) fail('同步设备标识无效。');
    if (equal(materialize(envelope), payload)) return ordered(envelope);
    const seed = create(payload, `seed-${fingerprint(payload)}`);
    for (const [group, fields] of Object.entries(COUNTERS)) for (const field of fields) {
      const observedIncrements = Object.values(envelope.counters[group].devices).reduce((sum, device) => sum + device[field], 0);
      seed.counters[group].base[field] = Math.max(0, payload[group][field] - observedIncrements);
    }
    return merge(envelope, seed);
  }
  function materialize(envelope) {
    validate(envelope);
    const output = { schemaVersion: 3, learned: [], favorites: [], marketLearned: [], marketFavorites: [], sessions: {}, theme: 'light', dailyPlan: null,
      reviewSchedule: {}, practiceHistory: [], customExpressions: [], deletedCustomExpressions: [],
      foundationProgress: { version: 2, courses: Object.fromEntries(COURSES.map((id) => [id, { levelId: 'pre-a1', lessonId: null, records: {}, assessments: {} }])) },
      pathwayProgress: { version: 1, levelId: 'pre-a1', lessonId: null, lessons: {}, assessments: {} } };
    for (const key of Object.keys(envelope.entries).sort()) {
      const version = pick(envelope.entries[key]);
      if (version.deleted) continue;
      const value = copy(version.value), [kind, second, third] = pathOf(key);
      if (kind.startsWith('studio')) {
        output.learningStudio ||= { version: 1, preferences: { minutes: 10, levelId: 'pre-a1', goal: 'everyday', updatedAt: null }, diagnostics: [], listeningAttempts: [] };
        if (kind === 'studioPreference') output.learningStudio.preferences[second] = value;
        else if (kind === 'studioDiagnostic') output.learningStudio.diagnostics.push(value);
        else if (kind === 'studioListening') output.learningStudio.listeningAttempts.push(value);
        continue;
      }
      if (SETS.includes(kind)) output[kind].push(second);
      else if (kind === 'session') (output.sessions[second] ||= []).push(third);
      else if (kind === 'theme' || kind === 'dailyPlan') output[kind] = value;
      else if (kind === 'review') output.reviewSchedule[second] = value;
      else if (kind === 'practice') output.practiceHistory.push(value);
      else if (kind === 'expression') output.customExpressions.push(value);
      else if (kind === 'tombstone') output.deletedCustomExpressions.push(value);
      else if (kind === 'pathwayNavigation') Object.assign(output.pathwayProgress, value);
      else if (kind === 'foundationNavigation') Object.assign(output.foundationProgress.courses[second], value);
      else if (kind === 'pathwayLesson') output.pathwayProgress.lessons[second] = value;
      else if (kind === 'foundationLesson') output.foundationProgress.courses[second].records[third] = value;
      else if (kind === 'pathwayAssessment') (output.pathwayProgress.assessments[second] ||= []).push(value);
      else if (kind === 'foundationAssessment') (output.foundationProgress.courses[second].assessments[third] ||= []).push(value);
    }
    const deleted = new Set(output.deletedCustomExpressions.map((item) => item.id));
    const phrases = new Set();
    output.customExpressions = output.customExpressions.filter((item) => {
      if (deleted.has(item.id)) return false;
      const normalized = normalizePhrase(item.phrase);
      if (phrases.has(normalized)) {
        deleted.add(item.id);
        output.deletedCustomExpressions.push({ id: item.id, deletedAt: item.updatedAt });
        return false;
      }
      phrases.add(normalized); return true;
    });
    // A deleted card can retain practice history, but is never put back into the
    // study queue by an offline device that has not seen its deletion yet.
    for (const id of deleted) delete output.reviewSchedule[id];
    for (const field of ['learned', 'favorites']) output[field] = output[field].filter((id) => !deleted.has(id));
    if (output.dailyPlan) output.dailyPlan.ids = output.dailyPlan.ids.filter((id) => !deleted.has(id));
    const chronological = (field) => (left, right) => lexical(String(left[field]), String(right[field])) || lexical(canonical(left), canonical(right));
    output.practiceHistory.sort(chronological('at'));
    if (output.learningStudio) {
      output.learningStudio.diagnostics.sort(chronological('submittedAt'));
      output.learningStudio.listeningAttempts.sort(chronological('answeredAt'));
    }
    output.practiceHistory = output.practiceHistory.slice(-5000);
    for (const histories of [output.pathwayProgress.assessments, ...COURSES.map((id) => output.foundationProgress.courses[id].assessments)]) {
      for (const stage of Object.keys(histories)) histories[stage] = histories[stage].sort(chronological('submittedAt')).slice(-10);
    }
    for (const [group, fields] of Object.entries(COUNTERS)) {
      const counter = envelope.counters[group];
      output[group] = Object.fromEntries(fields.map((field) => [field, counter.base[field] + Object.values(counter.devices).reduce((sum, device) => sum + device[field], 0)]));
      if (fields.includes('total')) output[group].total = Math.max(output[group].total, output[group].correct);
      else { output[group].completed = Math.max(output[group].completed, output[group].success); output[group].runs = Math.max(output[group].runs, output[group].completed); }
      if (Object.values(output[group]).some((count) => !numberOK(count))) fail('累计计数超出范围，原记录未被修改。');
    }
    return output;
  }
  const normalizePhrase = (phrase) => String(phrase).normalize('NFKC').replace(/[\u2018\u2019]/g, "'").replace(/\s+/gu, ' ').trim().toLowerCase();
  function conflicts(envelope) {
    validate(envelope);
    const result = copy(envelope);
    retainConflicts(result);
    const actual = new Set(materialize(result).customExpressions.map((item) => item.id));
    for (const [key, versions] of Object.entries(result.entries)) {
      const [kind, id] = pathOf(key);
      if (kind === 'expression' && !actual.has(id)) for (const version of versions) archiveVersion(result, key, version, 'expression-copy');
    }
    return Object.values(result.archive).sort((left, right) => lexical(left.id, right.id));
  }
  function retainedRecords(envelope) {
    // Full event history remains in the envelope even when legacy UI limits only
    // show its latest 10 assessments / 5000 expression attempts.
    validate(envelope);
    return Object.entries(envelope.entries).filter(([key]) => ['practice', 'pathwayAssessment', 'foundationAssessment', 'studioDiagnostic', 'studioListening'].includes(pathOf(key)[0]))
      .sort(([left], [right]) => lexical(left, right)).flatMap(([key, versions]) => versions.filter((version) => !version.deleted).map((version) => ({ path: pathOf(key), value: copy(version.value) })));
  }
  const api = Object.freeze({ VERSION, MAX_BYTES, create, capture, merge, materialize, importSnapshot, validate, conflicts, retainedRecords });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SyncMerge = api;
})(typeof window !== 'undefined' ? window : null);
