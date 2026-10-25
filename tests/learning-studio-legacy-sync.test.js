const test = require('node:test');
const assert = require('node:assert/strict');
// Frozen source is required instead of git show HEAD at test time: checkout can
// be shallow in CI, and HEAD will become the new engine after this release.
const Legacy = require('./fixtures/sync-merge-v1-20261023.js');
const Sync = require('../syncMerge.js');
const Studio = require('../learningStudioProgress.js');
const Foundation = require('../foundationProgress.js');
const Pathway = require('../pathwayProgress.js');
const diagnostic = require('../data/learningDiagnostic.js');
const now = '2026-10-25T14:00:00.000Z';
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
const catalogs = { diagnostic, listening: [{ lessonId: 'pre-a1-hello', segments: [{ id: 'pre-a1-hello-s1', tokenCount: 3 }] }] };
const answers = diagnostic.map((item) => item.answer);
function payload(studio) {
  return { schemaVersion: 3, learned: ['baseline'], favorites: [], marketLearned: [], marketFavorites: [],
    sessions: {}, theme: 'light', dailyPlan: null, reviewSchedule: {}, practiceHistory: [], customExpressions: [], deletedCustomExpressions: [],
    quiz: { correct: 2, total: 3 }, marketQuiz: { correct: 0, total: 0 },
    scenarios: { runs: 0, completed: 0, success: 0 }, marketScenarios: { runs: 0, completed: 0, success: 0 },
    foundationProgress: Foundation.empty(), pathwayProgress: Pathway.empty(), ...(studio ? { learningStudio: studio } : {}) };
}
function studioRecords() {
  let value = Studio.apply(Studio.empty(), { type: 'preferences', patch: { minutes: 20, levelId: 'b2', goal: 'academic' } }, catalogs, { now });
  value = Studio.apply(value, { type: 'diagnostic', answers }, catalogs, { now, id: id(1) });
  return Studio.apply(value, { type: 'listening', attempt: { lessonId: 'pre-a1-hello', segmentId: 'pre-a1-hello-s1',
    matchedTokens: 2, tokenCount: 3, exact: false, revealed: false, shadow: 'not-yet', listenCount: 1 } }, catalogs, { now, id: id(2) });
}

test('historical engine still accepts legacy envelopes before new studio records exist', () => {
  const old = Legacy.create(payload(), 'phone');
  assert.deepEqual(Sync.materialize(old), Legacy.materialize(old));
  const untouchedUpgrade = Sync.create(payload(Studio.empty()), 'desktop');
  assert.deepEqual(Legacy.materialize(untouchedUpgrade), Sync.materialize(untouchedUpgrade));
});

test('historical engine rejects each new studio path without mutating local or remote envelopes', () => {
  const original = Legacy.create(payload(), 'phone');
  const local = clone(payload()); local.learned.push('offline-expression'); local.quiz = { correct: 3, total: 4 };
  const offline = Legacy.capture(original, local, 'phone');
  const all = studioRecords();
  const versions = [
    { ...Studio.empty(), preferences: all.preferences },
    { ...Studio.empty(), diagnostics: all.diagnostics },
    { ...Studio.empty(), listeningAttempts: all.listeningAttempts },
  ];
  for (const studio of versions) {
    const remote = Sync.capture(original, payload(studio), 'desktop');
    const beforeLocal = JSON.stringify(offline), beforeRemote = JSON.stringify(remote), beforePayload = JSON.stringify(local);
    assert.throws(() => Legacy.validate(remote), /同步记录类型无效/);
    assert.throws(() => Legacy.materialize(remote), /同步记录类型无效/);
    assert.throws(() => Legacy.merge(offline, remote), /同步记录类型无效/);
    assert.equal(JSON.stringify(offline), beforeLocal); assert.equal(JSON.stringify(remote), beforeRemote);
    assert.equal(JSON.stringify(local), beforePayload);
    assert.ok(Legacy.materialize(offline).learned.includes('offline-expression'));
  }
  // These are pure-engine boundaries. No HTTP request is made here, so this
  // test deliberately does not claim to verify a browser/controller write gate.
});

test('upgraded engine merges old phone offline additions and new desktop studio records without replay inflation', () => {
  const original = Legacy.create(payload(), 'phone');
  const local = payload(); local.learned.push('offline-expression'); local.quiz = { correct: 3, total: 4 };
  local.sessions['2026-10-25'] = ['offline-expression'];
  const offline = Legacy.capture(original, local, 'phone');
  const studio = studioRecords(), remotePayload = payload(studio);
  remotePayload.learned.push('desktop-expression'); remotePayload.quiz = { correct: 3, total: 4 };
  remotePayload.sessions['2026-10-25'] = ['desktop-expression'];
  const remote = Sync.capture(original, remotePayload, 'desktop');
  assert.throws(() => Legacy.merge(offline, remote), /同步记录类型无效/);

  const combined = Sync.merge(offline, remote), result = Sync.materialize(combined);
  assert.deepEqual(new Set(result.learned), new Set(['baseline', 'offline-expression', 'desktop-expression']));
  assert.deepEqual(new Set(result.sessions['2026-10-25']), new Set(['offline-expression', 'desktop-expression']));
  assert.deepEqual(result.quiz, { correct: 4, total: 5 });
  assert.deepEqual(result.learningStudio, studio);
  assert.deepEqual(Studio.restore(result.learningStudio, catalogs), studio);
  assert.deepEqual(result.foundationProgress, local.foundationProgress); assert.deepEqual(result.pathwayProgress, local.pathwayProgress);
  assert.deepEqual(Sync.merge(remote, offline), combined);
  assert.deepEqual(Sync.merge(combined, offline), combined);
  assert.deepEqual(Sync.capture(combined, result, 'phone'), combined);
});

test('studio restore rejects sparse answer arrays instead of converting holes into unstated skipped answers', () => {
  const sparse = Array(diagnostic.length); sparse[0] = diagnostic[0].answer;
  const value = Studio.empty(); value.diagnostics.push({ id: id(1), submittedAt: now, answers: sparse });
  assert.throws(() => Studio.restore(value, catalogs), /格式|答案/);
});
