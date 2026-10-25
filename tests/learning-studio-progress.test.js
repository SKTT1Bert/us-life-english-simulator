const test = require('node:test');
const assert = require('node:assert/strict');
const Studio = require('../learningStudioProgress.js');
const Sync = require('../syncMerge.js');
const Foundation = require('../foundationProgress.js');
const Pathway = require('../pathwayProgress.js');
const diagnostic = require('../data/learningDiagnostic.js');
const catalogs = { diagnostic, listening: [{ lessonId: 'pre-a1-hello', segments: [{ id: 'pre-a1-hello-s1', tokenCount: 3 }] }] };
const now = '2026-10-25T14:00:00.000Z';
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const clone = (v) => JSON.parse(JSON.stringify(v));
function apply(value, action, n = 1) { return Studio.apply(value, action, catalogs, { now, id: id(n) }); }
const answers = diagnostic.map((item) => item.answer);
const attempt = { lessonId: 'pre-a1-hello', segmentId: 'pre-a1-hello-s1', tokenCount: 3, matchedTokens: 2, exact: false, revealed: false, shadow: 'not-yet', listenCount: 1 };
function payload(studio) {
  return { schemaVersion: 3, learned: ['old-expression'], favorites: [], marketLearned: [], marketFavorites: [], sessions: {}, theme: 'light', dailyPlan: null,
    reviewSchedule: {}, practiceHistory: [], customExpressions: [], deletedCustomExpressions: [],
    quiz: { correct: 2, total: 3 }, marketQuiz: { correct: 0, total: 0 }, scenarios: { runs: 0, completed: 0, success: 0 }, marketScenarios: { runs: 0, completed: 0, success: 0 },
    foundationProgress: Foundation.empty(), pathwayProgress: Pathway.empty(), ...(studio ? { learningStudio: studio } : {}) };
}
test('legacy records get empty optional studio data without invented results', () => {
  assert.deepEqual(Studio.restore(undefined, catalogs), Studio.empty());
  assert.equal(Studio.empty().preferences.updatedAt, null);
  const original = Studio.empty();
  const next = apply(original, { type: 'preferences', patch: { minutes: 20, levelId: 'b2', goal: 'academic' } });
  assert.equal(next.preferences.minutes, 20); assert.equal(original.preferences.minutes, 10);
  assert.equal(next.diagnostics.length, 0); assert.equal(next.listeningAttempts.length, 0);
});
test('diagnostic attempts preserve skipped evidence and refuse invalid answers and IDs', () => {
  const skipped = [...answers]; skipped[3] = null;
  const result = apply(Studio.empty(), { type: 'diagnostic', answers: skipped });
  assert.deepEqual(result.diagnostics[0].answers, skipped);
  assert.throws(() => apply(result, { type: 'diagnostic', answers: skipped }), /编号/);
  assert.throws(() => apply(result, { type: 'diagnostic', answers: Array(24).fill(null) }, 2), /至少/);
  assert.throws(() => apply(result, { type: 'diagnostic', answers: Array(24).fill(20) }, 2), /格式/);
  assert.deepEqual(Studio.restore(JSON.parse(JSON.stringify(result)), catalogs), result);
});
test('listening metrics are validated against real segment identity and do not store typed text', () => {
  const result = apply(Studio.empty(), { type: 'listening', attempt });
  assert.deepEqual(result.listeningAttempts[0], { ...attempt, id: id(1), answeredAt: now });
  for (const patch of [{ tokenCount: 8 }, { exact: true }, { listenCount: -1 }, { segmentId: 'invented' }, { response: 'PRIVATE' }, { shadow: 'fluent' }]) {
    assert.throws(() => apply(Studio.empty(), { type: 'listening', attempt: { ...attempt, ...patch } }));
  }
});
test('malformed, future-version, unknown-field and overflow records fail closed', () => {
  assert.throws(() => Studio.restore({ ...Studio.empty(), version: 2 }, catalogs));
  assert.throws(() => Studio.restore({ ...Studio.empty(), audio: 'blob' }, catalogs));
  assert.throws(() => apply(Studio.empty(), { type: 'preferences', patch: { minutes: 30 } }));
  assert.throws(() => apply(Studio.empty(), { type: 'preferences', patch: { certifiedLevel: 'c1' } }));
  const full = Studio.empty();
  full.diagnostics = Array.from({ length: 100 }, (_, n) => ({ id: id(n + 1), submittedAt: now, answers }));
  assert.throws(() => apply(full, { type: 'diagnostic', answers }, 101), /上限/);
  assert.equal(full.diagnostics.length, 100);
});
test('phone and desktop additions merge by immutable IDs without replay duplication', () => {
  const base = Sync.create(payload(), 'desktop');
  const pc = Sync.capture(base, payload(apply(Studio.empty(), { type: 'diagnostic', answers }, 1)), 'desktop');
  const phone = Sync.capture(base, payload(apply(Studio.empty(), { type: 'listening', attempt }, 2)), 'phone');
  const joined = Sync.merge(pc, phone), restored = Sync.materialize(joined);
  assert.deepEqual(Studio.restore(restored.learningStudio, catalogs), restored.learningStudio);
  assert.equal(restored.learningStudio.diagnostics.length, 1); assert.equal(restored.learningStudio.listeningAttempts.length, 1);
  assert.deepEqual(restored.quiz, { correct: 2, total: 3 }); assert.deepEqual(restored.learned, ['old-expression']);
  assert.deepEqual(Sync.merge(joined, phone), joined);
  assert.deepEqual(Sync.merge(pc, phone), Sync.merge(phone, pc));
  assert.deepEqual(Sync.capture(joined, restored, 'phone'), joined);
  assert.equal(Sync.retainedRecords(joined).length, 2);
});
test('untouched new device preserves cloud preferences; independent edits merge field by field', () => {
  const initial = apply(Studio.empty(), { type: 'preferences', patch: { minutes: 20, goal: 'academic' } });
  const base = Sync.create(payload(initial), 'desktop');
  const fresh = Sync.create(payload(Studio.empty()), 'new-phone');
  assert.deepEqual(Sync.materialize(Sync.merge(base, fresh)).learningStudio.preferences, initial.preferences);
  const pc = Sync.capture(base, payload(apply(initial, { type: 'preferences', patch: { minutes: 5 } })), 'desktop');
  const phone = Sync.capture(base, payload(apply(initial, { type: 'preferences', patch: { levelId: 'b1' } })), 'phone');
  const result = Sync.materialize(Sync.merge(pc, phone));
  assert.equal(result.learningStudio.preferences.minutes, 5); assert.equal(result.learningStudio.preferences.levelId, 'b1');
  assert.equal(result.learningStudio.preferences.goal, 'academic');
});
test('missing optional field on an old snapshot never removes diagnostic or listening history', () => {
  const value = apply(apply(Studio.empty(), { type: 'diagnostic', answers }), { type: 'listening', attempt }, 2);
  const base = Sync.create(payload(value), 'desktop');
  const changed = Sync.capture(base, payload(), 'phone');
  const result = Sync.materialize(changed);
  assert.equal(result.learningStudio.diagnostics.length, 1); assert.equal(result.learningStudio.listeningAttempts.length, 1);
});
test('an old or untouched local snapshot cannot delete chosen cloud preferences during capture', () => {
  const settings = apply(Studio.empty(), { type: 'preferences', patch: { minutes: 20, levelId: 'c1', goal: 'academic' } });
  const envelope = Sync.create(payload(settings), 'desktop');
  for (const local of [payload(), payload(Studio.empty())]) {
    const captured = Sync.capture(envelope, local, 'phone');
    assert.deepEqual(Sync.materialize(captured).learningStudio.preferences, settings.preferences);
  }
});
