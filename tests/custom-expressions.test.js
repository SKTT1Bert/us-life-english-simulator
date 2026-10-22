const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../customExpressions.js');

const now = Date.parse('2026-10-22T12:00:00.000Z');
const uuid = (number = 1) => `00000000-0000-4000-8000-${number.toString(16).padStart(12, '0')}`;
const draft = { phrase: 'Could you explain that?', meaning_cn: '你能解释一下吗？' };
const options = (number = 1, time = now) => ({ now: time, uuid: () => uuid(number) });
const fresh = () => C.create({}, draft, options());
const record = () => fresh().customExpressions[0];

test('legacy data restores empty additions and input remains untouched', () => {
  const saved = { schemaVersion: 2, learned: ['hello'], practiceHistory: [] };
  const snapshot = JSON.stringify(saved);
  assert.deepEqual(C.validate(saved), { customExpressions: [], deletedCustomExpressions: [] });
  const next = C.create(saved, draft, options());
  assert.equal(JSON.stringify(saved), snapshot);
  assert.equal(next.customExpressions[0].id, `custom:${uuid()}`);
  assert.equal(next.customExpressions[0].provenance, 'user');
  assert.equal(next.customExpressions[0].example, '');
  assert.equal(next.customExpressions[0].source, '');
  assert.equal(next.customExpressions[0].createdAt, next.customExpressions[0].updatedAt);
});

test('custom data round-trips without references or fabricated study evidence', () => {
  const state = fresh();
  const restored = C.validate(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  restored.customExpressions[0].phrase = 'Different';
  assert.equal(state.customExpressions[0].phrase, draft.phrase);
  assert.equal(Object.hasOwn(state, 'reviewSchedule'), false);
  assert.equal(Object.hasOwn(state, 'practiceHistory'), false);
});

test('required fields, per-field bounds, provenance, and control characters are checked', () => {
  for (const key of ['phrase', 'meaning_cn']) {
    for (const invalid of ['', ' \n\t ', null, 1, {}, []]) {
      assert.throws(() => C.create({}, { ...draft, [key]: invalid }, options()));
    }
  }
  for (const [key, maximum] of Object.entries(C.LIMITS)) {
    assert.doesNotThrow(() => C.create({}, { ...draft, [key]: 'x'.repeat(maximum) }, options()));
    assert.throws(() => C.create({}, { ...draft, [key]: 'x'.repeat(maximum + 1) }, options()));
    assert.throws(() => C.create({}, { ...draft, [key]: 'x\u0000' }, options()));
  }
  for (const provenance of ['official', 'builtin', '', null, {}, 1]) {
    assert.throws(() => C.create({}, { ...draft, provenance }, options()));
  }
  assert.equal(C.create({}, { ...draft, provenance: 'model-assisted' }, options()).customExpressions[0].provenance, 'model-assisted');
});

test('duplicates normalize Unicode width, apostrophes, case, and whitespace', () => {
  const state = C.create({}, { ...draft, phrase: '  Ｉｔ’ｓ   Fine.  ' }, options());
  assert.equal(C.normalizePhrase(state.customExpressions[0].phrase), "it's fine.");
  assert.throws(() => C.create(state, { ...draft, phrase: "IT'S\nFINE." }, options(2)), /相同/);
  assert.equal(C.findDuplicate(state.customExpressions, "It's fine.").id, `custom:${uuid()}`);
  assert.equal(C.findDuplicate(state.customExpressions, "It's fine.", `custom:${uuid()}`), null);
  const importedDuplicate = { ...state.customExpressions[0], id: `custom:${uuid(2)}`, phrase: "it's fine." };
  assert.throws(() => C.validate({ customExpressions: [...state.customExpressions, importedDuplicate] }));
});

test('edit preserves identity and creation time, permits partial drafts, and rejects duplicates', () => {
  let state = fresh();
  state = C.create(state, { ...draft, phrase: 'Thank you.' }, options(2));
  const snapshot = JSON.stringify(state);
  const next = C.update(state, `custom:${uuid()}`, { meaning_cn: '能请你说明一下吗？', source: 'Class discussion' }, { now: now + 1000 });
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(next.customExpressions[0].id, state.customExpressions[0].id);
  assert.equal(next.customExpressions[0].createdAt, state.customExpressions[0].createdAt);
  assert.equal(next.customExpressions[0].updatedAt, new Date(now + 1000).toISOString());
  assert.equal(next.customExpressions[0].phrase, draft.phrase);
  assert.throws(() => C.update(state, `custom:${uuid()}`, { phrase: 'THANK YOU.' }, { now }));
  assert.throws(() => C.update(state, `custom:${uuid(3)}`, {}, { now }));
  assert.throws(() => C.update(state, `custom:${uuid()}`, { id: `custom:${uuid(3)}` }, { now }));
  assert.throws(() => C.update(state, `custom:${uuid()}`, { createdAt: new Date(now).toISOString() }, { now }));
});

test('deletion leaves a text-free permanent tombstone and prevents all ID reuse', () => {
  const state = fresh();
  const deleted = C.remove(state, `custom:${uuid()}`, { now: now + 1000 });
  assert.equal(state.customExpressions.length, 1);
  assert.deepEqual(deleted.customExpressions, []);
  assert.deepEqual(deleted.deletedCustomExpressions, [{ id: `custom:${uuid()}`, deletedAt: new Date(now + 1000).toISOString() }]);
  assert.throws(() => C.create(deleted, draft, options()), /标识/);
  assert.throws(() => C.update(deleted, `custom:${uuid()}`, draft, { now: now + 2000 }));
  assert.throws(() => C.remove(deleted, `custom:${uuid()}`, { now: now + 2000 }));
  const recreated = C.create(deleted, draft, options(2, now + 2000));
  assert.equal(recreated.customExpressions[0].id, `custom:${uuid(2)}`);
  assert.deepEqual(recreated.deletedCustomExpressions, deleted.deletedCustomExpressions);
  assert.throws(() => C.validate({ ...deleted, customExpressions: state.customExpressions }));
});

test('malformed imports fail atomically, including forged IDs, duplicate IDs, and invalid dates', () => {
  for (const value of [null, [], 'value', 2]) assert.throws(() => C.validate(value));
  for (const key of ['customExpressions', 'deletedCustomExpressions']) {
    for (const value of [null, {}, 'value']) assert.throws(() => C.validate({ [key]: value }));
  }
  const base = record();
  for (const id of ['builtin-hello', '__proto__', 'custom:123', `custom:${uuid().replace('-4000-', '-1000-')}`]) {
    assert.throws(() => C.validate({ customExpressions: [{ ...base, id }] }));
  }
  assert.throws(() => C.validate({ customExpressions: [{ ...base, id: 'custom:aaaaaaaa-aaaa-4aaa-8aaa-AAAAAAAAAAAA' }] }));
  for (const date of ['yesterday', '2026-02-30T00:00:00.000Z', '2026-10-22', '2026-10-22T12:00:00Z', null, 9]) {
    assert.throws(() => C.validate({ customExpressions: [{ ...base, createdAt: date }] }));
  }
  assert.throws(() => C.validate({ customExpressions: [{ ...base, createdAt: new Date(now + 1).toISOString() }] }));
  assert.throws(() => C.validate({ customExpressions: [{ ...base, provenance: undefined }] }));
  assert.throws(() => C.validate({ customExpressions: [base, { ...base, phrase: 'Different' }] }));
  const tombstone = { id: base.id, deletedAt: base.createdAt };
  assert.throws(() => C.validate({ deletedCustomExpressions: [tombstone, tombstone] }));
  assert.throws(() => C.validate({ deletedCustomExpressions: [{ ...tombstone, phrase: 'Should not retain deleted text' }] }));
  assert.throws(() => C.validate({ customExpressions: Array(1) }));
  assert.throws(() => C.validate({ deletedCustomExpressions: Array(1) }));
});

test('prototype-shaped fields and inherited data are rejected without polluting objects', () => {
  for (const field of ['__proto__', 'constructor', 'prototype']) {
    const malicious = JSON.parse(JSON.stringify({ ...record(), [field]: { polluted: true } }));
    assert.throws(() => C.validate({ customExpressions: [malicious] }));
    const maliciousDraft = JSON.parse(JSON.stringify({ ...draft, [field]: { polluted: true } }));
    assert.throws(() => C.create({}, maliciousDraft, options()));
    assert.throws(() => C.validate(JSON.parse(`{"${field}": {"polluted": true}}`)));
  }
  assert.throws(() => C.create({}, Object.create(draft), options()));
  assert.throws(() => C.validate(Object.create({ customExpressions: [record()] })));
  assert.equal({}.polluted, undefined);
});

test('active and lifetime limits are bounded while deletion remains available at capacity', () => {
  const base = record();
  const active = Array.from({ length: C.MAX_ITEMS }, (_, index) => ({ ...base, id: `custom:${uuid(index + 1)}`, phrase: `Expression ${index}` }));
  const state = C.validate({ customExpressions: active });
  assert.throws(() => C.create(state, draft, options(C.MAX_ITEMS + 1)), /最多/);
  assert.throws(() => C.validate({ customExpressions: [...active, { ...base, id: `custom:${uuid(C.MAX_ITEMS + 1)}` }] }));
  const deletedCustomExpressions = Array.from({ length: C.MAX_TOTAL_IDS - 1 }, (_, index) => ({ id: `custom:${uuid(index + 2)}`, deletedAt: base.createdAt }));
  const full = { customExpressions: [base], deletedCustomExpressions };
  assert.doesNotThrow(() => C.validate(full));
  assert.throws(() => C.create(full, { ...draft, phrase: 'New' }, options(C.MAX_TOTAL_IDS + 1)), /上限/);
  const deleted = C.remove(full, base.id, { now });
  assert.equal(deleted.deletedCustomExpressions.length, C.MAX_TOTAL_IDS);
  assert.doesNotThrow(() => C.validate(deleted));
  assert.throws(() => C.validate({ deletedCustomExpressions: [...deleted.deletedCustomExpressions, { id: `custom:${uuid(C.MAX_TOTAL_IDS + 1)}`, deletedAt: base.createdAt }] }));
});

test('clock regressions, invalid clocks, and UUID collisions cannot mutate prior state', () => {
  const state = fresh();
  const snapshot = JSON.stringify(state);
  assert.throws(() => C.update(state, state.customExpressions[0].id, draft, { now: now - 1 }));
  assert.throws(() => C.remove(state, state.customExpressions[0].id, { now: now - 1 }));
  for (const time of [NaN, Infinity, '2026-10-22', null, 1e99]) assert.throws(() => C.create({}, draft, options(1, time)));
  assert.throws(() => C.create(state, { ...draft, phrase: 'New' }, options()), /标识/);
  assert.throws(() => C.create({}, draft, { now, uuid: () => '__proto__' }));
  assert.equal(JSON.stringify(state), snapshot);
});

test('projected expressions preserve text as data and supply compatible card fields', () => {
  const literal = '<img src=x onerror=alert(1)>';
  const state = C.create({}, { phrase: literal, meaning_cn: '这是需要原样显示的文本', example: '<script>example</script>', source: 'javascript:alert(1)', provenance: 'model-assisted' }, options());
  const item = C.asExpression(state.customExpressions[0]);
  assert.equal(item.phrase, literal);
  assert.equal(item.example, '<script>example</script>');
  assert.equal(item.source, 'javascript:alert(1)');
  assert.equal(item.category, '我的表达');
  assert.equal(item.level, '自定义');
  assert.equal(item.example_cn, '');
  assert.deepEqual(item.tags, ['custom']);
  assert.equal(item.provenance, 'model-assisted');
  item.phrase = 'changed';
  assert.equal(state.customExpressions[0].phrase, literal);
});

test('module publishes browser API and securely generates fresh default UUIDs', () => {
  const context = vm.createContext({ window: {}, crypto: require('node:crypto').webcrypto });
  vm.runInContext(fs.readFileSync(require.resolve('../customExpressions.js'), 'utf8'), context);
  assert.equal(typeof context.window.CustomExpressions.create, 'function');
  const results = vm.runInContext(`[
    window.CustomExpressions.create({}, {phrase: 'One', meaning_cn: '一'}),
    window.CustomExpressions.create({}, {phrase: 'One', meaning_cn: '一'})
  ]`, context);
  assert.match(results[0].customExpressions[0].id, /^custom:[0-9a-f-]{36}$/);
  assert.notEqual(results[0].customExpressions[0].id, results[1].customExpressions[0].id);
  const insecure = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(require.resolve('../customExpressions.js'), 'utf8'), insecure);
  assert.throws(() => vm.runInContext("window.CustomExpressions.create({}, {phrase:'One', meaning_cn:'一'})", insecure), /安全/);
});
