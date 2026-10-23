const test = require('node:test');
const assert = require('node:assert/strict');
const Sync = require('../syncMerge.js');
const Foundation = require('../foundationProgress.js');
const Pathway = require('../pathwayProgress.js');
const Custom = require('../customExpressions.js');
const Review = require('../review.js');

const clone = (value) => JSON.parse(JSON.stringify(value));
const instant = '2026-10-23T10:00:00.000Z';
const questions = [{ options: ['A', 'B', 'C'], answer: 0 }, { options: ['A', 'B', 'C'], answer: 1 }, { options: ['A', 'B', 'C'], answer: 2 }];
const levels = ['pre-a1', 'c1'];
const catalog = levels.map((id) => ({ id, lessons: [{ id: `${id}-lesson`, questions }], assessment: { questions } }));
const foundations = { stages: {} };
for (const id of ['word-parts', 'phonics']) {
  foundations[id] = levels.map((levelId) => ({ id: `${id}-${levelId}`, levelId, quizzes: questions }));
  foundations.stages[id] = levels.map((levelId) => ({ id: levelId, assessment: { questions } }));
}
function payload() {
  return { schemaVersion: 3, learned: [], favorites: [], marketLearned: [], marketFavorites: [], sessions: {}, theme: 'light', dailyPlan: null,
    reviewSchedule: {}, practiceHistory: [], customExpressions: [], deletedCustomExpressions: [],
    quiz: { correct: 0, total: 0 }, marketQuiz: { correct: 0, total: 0 }, scenarios: { runs: 0, completed: 0, success: 0 }, marketScenarios: { runs: 0, completed: 0, success: 0 },
    foundationProgress: Foundation.empty(), pathwayProgress: Pathway.empty() };
}
function valid(value) {
  assert.deepEqual(Foundation.restore(value.foundationProgress, foundations), value.foundationProgress);
  assert.deepEqual(Pathway.restore(value.pathwayProgress, catalog), value.pathwayProgress);
  Custom.validate(value);
  const ids = new Set(['one', 'two', ...value.customExpressions.map((item) => item.id), ...value.deletedCustomExpressions.map((item) => item.id)]);
  Review.validateReviewData(value, ids);
  for (const group of ['quiz', 'marketQuiz']) assert.ok(value[group].correct <= value[group].total);
  for (const group of ['scenarios', 'marketScenarios']) assert.ok(value[group].success <= value[group].completed && value[group].completed <= value[group].runs);
  return value;
}
function change(envelope, actor, modify) {
  const value = Sync.materialize(envelope); modify(value);
  return Sync.capture(envelope, value, actor);
}
function text(envelope, actor, writing, speaking = 'Speaking notes') {
  return change(envelope, actor, (value) => {
    value.pathwayProgress = Pathway.saveProduction(value.pathwayProgress, catalog, 'pre-a1-lesson', { writing, speaking, checks: [false, false, false] }, instant);
  });
}

test('initial normalized snapshot round-trips without mutating any input', () => {
  const source = payload(); source.learned = ['one']; source.favorites = ['two']; source.sessions = { '2026-10-23': ['one'] };
  source.quiz = { correct: 3, total: 5 };
  const before = clone(source), envelope = Sync.create(source, 'desktop');
  assert.deepEqual(Sync.materialize(JSON.parse(JSON.stringify(envelope))), source);
  assert.deepEqual(source, before); assert.equal(Sync.conflicts(envelope).length, 0);
});

test('independent legacy foundation v1 answers survive normalization, pairing and later edits', () => {
  const source = payload();
  source.foundationProgress = Foundation.restore({ version: 1, courses: { phonics: { lessonId: 'phonics-pre-a1', records: { 'phonics-pre-a1': { answers: [0, null, 2], updatedAt: instant } } } } }, foundations);
  const first = Sync.create(source, 'desktop'), other = Sync.create(payload(), 'phone');
  const joined = Sync.merge(first, other), value = valid(Sync.materialize(joined));
  assert.deepEqual(value.foundationProgress.courses.phonics.records['phonics-pre-a1'].answers, [0, null, 2]);
  assert.equal(value.foundationProgress.courses.phonics.records['phonics-pre-a1'].dueAt, null);
  assert.equal(value.foundationProgress.courses.phonics.records['phonics-pre-a1'].writing, '');
});

test('same backup on two devices does not double old totals or create writing conflicts', () => {
  const source = payload(); source.quiz = { correct: 7, total: 10 };
  source.pathwayProgress = Pathway.saveProduction(source.pathwayProgress, catalog, 'pre-a1-lesson', { writing: 'Original', speaking: 'Notes', checks: [false, false, false] }, instant);
  const joined = Sync.merge(Sync.create(source, 'desktop'), Sync.create(source, 'phone'));
  assert.deepEqual(Sync.materialize(joined).quiz, source.quiz);
  assert.equal(Sync.conflicts(joined).length, 0);
  assert.deepEqual(Sync.merge(joined, joined), joined);
});

test('independent lessons, sets, sessions and new per-device totals merge without losses or replay duplication', () => {
  const source = payload(); source.quiz = { correct: 7, total: 10 };
  const base = Sync.create(source, 'desktop');
  const desktop = change(base, 'desktop', (value) => {
    value.learned.push('one'); value.favorites.push('one'); value.sessions['2026-10-23'] = ['one'];
    value.quiz.correct++; value.quiz.total++;
    value.pathwayProgress = Pathway.answer(value.pathwayProgress, catalog, 'pre-a1-lesson', 0, 0, instant);
  });
  const phone = change(base, 'phone', (value) => {
    value.learned.push('two'); value.sessions['2026-10-23'] = ['two']; value.quiz.total++;
    value.foundationProgress = Foundation.answer(value.foundationProgress, foundations, 'phonics', 'phonics-pre-a1', 0, 0, instant);
  });
  const joined = Sync.merge(desktop, phone), result = valid(Sync.materialize(joined));
  assert.deepEqual(result.learned, ['one', 'two']); assert.deepEqual(result.sessions['2026-10-23'], ['one', 'two']);
  assert.deepEqual(result.quiz, { correct: 8, total: 12 });
  assert.deepEqual(result.pathwayProgress.lessons['pre-a1-lesson'].answers, [0, null, null]);
  assert.deepEqual(result.foundationProgress.courses.phonics.records['phonics-pre-a1'].answers, [0, null, null]);
  assert.deepEqual(Sync.merge(joined, phone), joined);
  assert.deepEqual(Sync.capture(joined, result, 'phone'), joined);
  assert.deepEqual(Sync.merge(desktop, phone), Sync.merge(phone, desktop));
});

test('favorite removals propagate, stale offline snapshots cannot resurrect them, later re-addition works', () => {
  const source = payload(); source.favorites = ['one'];
  const base = Sync.create(source, 'desktop');
  const removed = change(base, 'phone', (value) => { value.favorites = []; });
  const other = change(base, 'desktop', (value) => { value.learned.push('two'); });
  const joined = Sync.merge(removed, other);
  assert.deepEqual(Sync.materialize(joined).favorites, []);
  assert.deepEqual(Sync.materialize(Sync.merge(joined, base)).favorites, []);
  const added = change(joined, 'desktop', (value) => { value.favorites = ['one']; });
  assert.deepEqual(Sync.materialize(Sync.merge(added, removed)).favorites, ['one']);
});

test('concurrent same-lesson writing remains accessible after resolution and repeated replication', () => {
  const base = text(Sync.create(payload(), 'desktop'), 'desktop', 'Old text');
  const desktop = text(base, 'desktop', 'Desktop essay'), phone = text(base, 'phone', 'Phone essay', 'Different spoken notes');
  const joined = Sync.merge(desktop, phone), result = valid(Sync.materialize(joined));
  const all = [result.pathwayProgress.lessons['pre-a1-lesson'].writing, ...Sync.conflicts(joined).map((item) => item.value.writing)];
  assert.ok(all.includes('Desktop essay')); assert.ok(all.includes('Phone essay'));
  assert.equal(Sync.conflicts(joined).length, 1);
  const resolved = text(joined, 'desktop', 'Combined essay');
  assert.equal(Sync.conflicts(resolved).length, 1);
  assert.deepEqual(Sync.merge(resolved, phone), resolved);
  assert.deepEqual(Sync.merge(desktop, phone), Sync.merge(phone, desktop));
});

test('logical causality wins even when an old snapshot has a later wall clock', () => {
  const base = text(Sync.create(payload(), 'desktop'), 'desktop', 'Future clock text');
  const corrected = change(base, 'phone', (value) => { value.pathwayProgress.lessons['pre-a1-lesson'].writing = 'Actual later edit'; value.pathwayProgress.lessons['pre-a1-lesson'].updatedAt = '2026-01-01T10:00:00.000Z'; });
  assert.equal(valid(Sync.materialize(Sync.merge(corrected, base))).pathwayProgress.lessons['pre-a1-lesson'].writing, 'Actual later edit');
});

test('custom expression deletion dominates concurrent edits and retains the edited copy', () => {
  const source = payload(); Object.assign(source, Custom.create(source, { phrase: 'Works for me', meaning_cn: '我可以' }, { now: Date.parse(instant), uuid: () => '11111111-1111-4111-8111-111111111111' }));
  const id = source.customExpressions[0].id; source.learned = [id]; source.favorites = [id];
  Review.noteStudy(source, id, Date.parse(instant));
  const base = Sync.create(source, 'desktop');
  const removed = change(base, 'desktop', (value) => {
    Object.assign(value, Custom.remove(value, id, { now: Date.parse(instant) })); value.learned = []; value.favorites = []; delete value.reviewSchedule[id];
  });
  const edited = change(base, 'phone', (value) => Object.assign(value, Custom.update(value, id, { meaning_cn: '我没问题' }, { now: Date.parse(instant) })));
  const joined = Sync.merge(removed, edited), result = valid(Sync.materialize(joined));
  assert.equal(result.customExpressions.length, 0); assert.equal(result.deletedCustomExpressions.length, 1);
  assert.equal(result.reviewSchedule[id], undefined); assert.deepEqual(result.favorites, []);
  assert.ok(Sync.conflicts(joined).some((item) => item.value.meaning_cn === '我没问题'));
});

test('same phrase created independently keeps one usable card and an accessible full alternative', () => {
  const first = payload(), second = payload();
  Object.assign(first, Custom.create(first, { phrase: 'No worries', meaning_cn: '没关系' }, { now: Date.parse(instant), uuid: () => '11111111-1111-4111-8111-111111111111' }));
  Object.assign(second, Custom.create(second, { phrase: 'no worries', meaning_cn: '别担心' }, { now: Date.parse(instant), uuid: () => '22222222-2222-4222-8222-222222222222' }));
  const joined = Sync.merge(Sync.create(first, 'desktop'), Sync.create(second, 'phone'));
  const result = valid(Sync.materialize(joined));
  assert.equal(result.customExpressions.length, 1); assert.equal(result.deletedCustomExpressions.length, 1);
  assert.equal(Sync.conflicts(joined).length, 1); assert.equal(Sync.conflicts(joined)[0].value.meaning_cn, '别担心');
});

test('assessment union deduplicates legacy events while retaining full history beyond the display limit', () => {
  const source = payload(), submission = { answers: [0, 1, 2], writing: 'Written answer', speaking: 'Spoken answer', checks: [true, true, true], transcriptUsed: false };
  for (let index = 0; index < 10; index++) source.pathwayProgress = Pathway.assess(source.pathwayProgress, catalog, 'pre-a1', submission, new Date(Date.parse(instant) + index * 1000).toISOString());
  const base = Sync.create(source, 'desktop');
  const next = change(base, 'phone', (value) => { value.pathwayProgress = Pathway.assess(value.pathwayProgress, catalog, 'pre-a1', submission, new Date(Date.parse(instant) + 11000).toISOString()); });
  const joined = Sync.merge(base, next), result = valid(Sync.materialize(joined));
  assert.equal(result.pathwayProgress.assessments['pre-a1'].length, 10);
  assert.equal(Sync.retainedRecords(joined).length, 11);
  assert.deepEqual(Sync.merge(joined, base), joined);
});

test('practice IDs deduplicate and differing independent attempts both survive', () => {
  const base = Sync.create(payload(), 'desktop');
  const one = change(base, 'desktop', (value) => Review.recordAttempt(value, 'one', { mode: 'choice', outcome: 'correct' }, Date.parse(instant)));
  const two = change(base, 'phone', (value) => Review.recordAttempt(value, 'two', { mode: 'choice', outcome: 'incorrect' }, Date.parse(instant)));
  const joined = Sync.merge(one, two);
  assert.equal(valid(Sync.materialize(joined)).practiceHistory.length, 2);
  assert.equal(Sync.materialize(Sync.merge(joined, one)).practiceHistory.length, 2);
});

test('backup import uses historical maxima and repeated identical import is idempotent', () => {
  const source = payload(); source.quiz = { correct: 3, total: 5 };
  let current = Sync.create(source, 'desktop');
  current = change(current, 'desktop', (value) => { value.quiz.correct++; value.quiz.total++; });
  const imported = clone(source); imported.quiz = { correct: 7, total: 10 }; imported.favorites = ['one'];
  const joined = Sync.importSnapshot(current, imported, 'desktop');
  assert.deepEqual(Sync.materialize(joined).quiz, { correct: 7, total: 10 });
  assert.deepEqual(Sync.importSnapshot(joined, imported, 'phone'), joined);
  assert.deepEqual(Sync.importSnapshot(joined, Sync.materialize(joined), 'phone'), joined);
});

test('unknown legacy enrollment does not count existing cloud increments twice', () => {
  const source = payload(); source.quiz = { correct: 5, total: 10 };
  let cloud = Sync.create(source, 'desktop');
  cloud = change(cloud, 'desktop', (value) => { value.quiz.correct += 1; value.quiz.total += 2; });
  const incoming = payload(); incoming.quiz = { correct: 7, total: 13 };
  const enrolled = Sync.importSnapshot(cloud, incoming, 'phone');
  assert.deepEqual(valid(Sync.materialize(enrolled)).quiz, { correct: 7, total: 13 });
  assert.deepEqual(Sync.importSnapshot(enrolled, incoming, 'phone'), enrolled);
  const later = change(enrolled, 'phone', (value) => { value.quiz.correct += 1; value.quiz.total += 1; });
  assert.deepEqual(Sync.materialize(later).quiz, { correct: 8, total: 14 });
  assert.deepEqual(Sync.materialize(Sync.importSnapshot(later, incoming, 'phone')).quiz, { correct: 8, total: 14 });
});

test('an already shared legacy backup differing only in theme or daily plan does not inflate counters', () => {
  const source = payload(); source.quiz = { correct: 7, total: 10 };
  let cloud = Sync.create(source, 'desktop');
  cloud = change(cloud, 'desktop', (value) => { value.quiz.total += 2; });
  const copy = Sync.materialize(cloud); copy.theme = 'dark'; copy.dailyPlan = { date: '2026-10-23', ids: ['one'] };
  const enrolled = Sync.importSnapshot(cloud, copy, 'phone');
  assert.deepEqual(Sync.materialize(enrolled).quiz, { correct: 7, total: 12 });
});

test('conservative legacy enrollment preserves coupled quiz and scenario inequalities', () => {
  const source = payload(); source.quiz = { correct: 5, total: 10 }; source.scenarios = { runs: 8, completed: 4, success: 2 };
  let cloud = Sync.create(source, 'desktop');
  cloud = change(cloud, 'desktop', (value) => {
    value.quiz.correct += 2; value.quiz.total += 2;
    value.scenarios.completed += 3; value.scenarios.success += 3;
  });
  const incoming = payload(); incoming.quiz = { correct: 11, total: 11 }; incoming.scenarios = { runs: 9, completed: 6, success: 6 };
  const enrolled = valid(Sync.materialize(Sync.importSnapshot(cloud, incoming, 'phone')));
  assert.deepEqual(enrolled.quiz, { correct: 11, total: 12 });
  assert.deepEqual(enrolled.scenarios, { runs: 9, completed: 7, success: 6 });
});

test('three-way merges are associative and deterministic with independent and conflicting work', () => {
  const base = Sync.create(payload(), 'desktop');
  const one = text(base, 'desktop', 'First essay'), two = text(base, 'phone', 'Second essay'), three = text(base, 'tablet', 'Third essay');
  assert.deepEqual(Sync.merge(Sync.merge(one, two), three), Sync.merge(one, Sync.merge(two, three)));
  const after = text(Sync.merge(one, two), 'phone', 'Combined');
  assert.deepEqual(Sync.merge(Sync.merge(one, after), three), Sync.merge(one, Sync.merge(after, three)));
});

test('malformed, oversized and identity-collision input fails without changing original records', () => {
  const base = Sync.create(payload(), 'desktop'), before = clone(base);
  const malformed = clone(base); malformed.clock.desktop = -1;
  assert.throws(() => Sync.merge(base, malformed));
  const future = clone(base); future.entries[Object.keys(future.entries)[0]][0].seq = 99;
  assert.throws(() => Sync.materialize(future));
  const polluted = JSON.parse('{"version":1,"__proto__":{"polluted":true}}');
  assert.throws(() => Sync.validate(polluted)); assert.equal({}.polluted, undefined);
  const changed = payload(); changed.theme = 'dark';
  assert.throws(() => Sync.merge(base, Sync.create(changed, 'desktop')), /重复版本/);
  const huge = payload(); huge.extra = 'x'.repeat(100001);
  assert.throws(() => Sync.create(huge, 'phone'), /过长/);
  assert.throws(() => Sync.create(payload(), '__proto__'));
  assert.deepEqual(base, before);
});

test('replicas converge after delayed delivery, repeated delivery and offline concurrent edits', () => {
  let seed = 93817;
  const random = (size) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % size; };
  const actors = ['desktop', 'phone', 'tablet'];
  const devices = actors.map(() => Sync.create(payload(), 'initial'));
  let attempts = 0;
  for (let step = 0; step < 90; step++) {
    const which = random(3);
    if (random(3) === 0) devices[which] = Sync.merge(devices[which], devices[random(3)]);
    else {
      attempts++;
      devices[which] = change(devices[which], actors[which], (value) => {
        value.quiz.total++;
        value.pathwayProgress = Pathway.saveProduction(value.pathwayProgress, catalog, 'pre-a1-lesson', { writing: `${actors[which]} essay ${step}`, speaking: 'Practice notes', checks: [false, false, false] }, instant);
      });
    }
  }
  const left = devices.reduce(Sync.merge), right = [...devices].reverse().reduce(Sync.merge);
  assert.deepEqual(left, right);
  assert.equal(valid(Sync.materialize(left)).quiz.total, attempts);
  for (const device of devices) assert.deepEqual(Sync.merge(left, device), left);
});

test('UTF-8 capacity limit fails before returning truncated records', () => {
  const source = payload(); source.extra = Array.from({ length: 24 }, () => '学'.repeat(95000));
  assert.throws(() => Sync.create(source, 'phone'), /安全容量/);
  assert.equal(source.extra.length, 24);
});
