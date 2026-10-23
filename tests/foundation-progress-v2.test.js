const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../foundationProgress.js');

const copy = (value) => JSON.parse(JSON.stringify(value));
const courseIds = ['word-parts', 'phonics'];
const levels = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
const quizzes = (count) => Array.from({ length: count }, (_, index) => ({ options: ['A', 'B', 'C'], answer: index % 3 }));
const catalog = { stages: {} };
for (const courseId of courseIds) {
  catalog[courseId] = levels.flatMap((levelId) => Array.from({ length: 8 }, (_, index) => ({ id: `${courseId}-${levelId}-${index + 1}`, levelId, quizzes: quizzes(3) })));
  catalog.stages[courseId] = levels.map((id) => ({ id, assessment: { questions: quizzes(6) } }));
}
const courseId = 'word-parts';
const lesson = catalog[courseId][0];
const now = '2026-01-01T12:00:00.000Z';
const day = (number) => new Date(Date.parse(now) + number * 86400000).toISOString();
const draft = { writing: 'A written transfer response.', speaking: 'Notes for a spoken explanation.', checks: [true, true, true] };
const record = (state) => state.courses[courseId].records[lesson.id];
const submission = () => ({ answers: quizzes(6).map((question) => question.answer), ...copy(draft), transcriptUsed: false });
function objectives(progress = engine.empty(), date = now, selectedCourse = courseId, selectedLesson = lesson) {
  return selectedLesson.quizzes.reduce((state, question, index) => engine.answer(state, catalog, selectedCourse, selectedLesson.id, index, question.answer, date), progress);
}
function completed(date = now) { return engine.saveProduction(objectives(engine.empty(), date), catalog, courseId, lesson.id, draft, date); }

test('missing foundation state initializes both six-stage courses without evidence', () => {
  for (const missing of [undefined, null]) {
    const state = engine.restore(missing, catalog);
    assert.deepEqual(state, engine.empty());
    for (const id of courseIds) {
      const counts = engine.summary(state, id, catalog[id], now);
      assert.equal(counts.completed, 0); assert.equal(counts.fullCompleted, 0); assert.equal(counts.due, 0);
      assert.equal(counts.totalQuestions, 144); assert.equal(counts.totalLessons, 48);
      for (const level of levels) assert.equal(engine.stageSummary(state, catalog, id, level, now).total, 8);
    }
  }
});

test('all 48 previously answered lessons migrate with their exact objective evidence only', () => {
  const legacy = { version: 1, courses: {} };
  for (const id of courseIds) {
    const oldLessons = catalog[id].slice(0, 24);
    legacy.courses[id] = { lessonId: oldLessons[23].id, records: Object.fromEntries(oldLessons.map((item, index) => [item.id, { answers: index % 2 ? [0, 0, null] : [0, 1, 2], updatedAt: day(index) }])) };
  }
  const before = copy(legacy), migrated = engine.restore(legacy, catalog);
  assert.equal(migrated.version, 2);
  for (const id of courseIds) {
    assert.equal(migrated.courses[id].levelId, 'a2');
    assert.equal(Object.keys(migrated.courses[id].records).length, 24);
    assert.deepEqual(migrated.courses[id].assessments, {});
    for (const [lessonId, oldRecord] of Object.entries(legacy.courses[id].records)) {
      const updated = migrated.courses[id].records[lessonId];
      assert.deepEqual(updated.answers, oldRecord.answers); assert.equal(updated.updatedAt, oldRecord.updatedAt);
      assert.equal(updated.writing, ''); assert.equal(updated.speaking, ''); assert.deepEqual(updated.checks, [false, false, false]);
      assert.equal(updated.dueAt, null); assert.equal(updated.reviews, 0); assert.equal(updated.lastReviewAt, null);
    }
    const counts = engine.summary(migrated, id, catalog[id], day(40));
    assert.equal(counts.completed, 12); assert.equal(counts.fullCompleted, 0); assert.equal(counts.due, 0);
  }
  assert.deepEqual(legacy, before);
  migrated.courses[courseId].records[lesson.id].answers[0] = null;
  assert.deepEqual(legacy, before);
});

test('legacy optional courses and unversioned catalogues remain supported', () => {
  const oldCatalog = Object.fromEntries(courseIds.map((id) => [id, catalog[id].slice(0, 24).map(({ levelId, ...item }) => item)]));
  const legacy = { version: 1, courses: { [courseId]: { lessonId: lesson.id, records: { [lesson.id]: { answers: [0, null, null], updatedAt: now } } } } };
  const state = engine.restore(legacy, oldCatalog);
  assert.equal(state.courses[courseId].levelId, 'pre-a1');
  assert.deepEqual(state.courses.phonics.records, {});
  assert.equal(engine.lessonStatus(state, courseId, lesson, now).answered, 1);
  assert.throws(() => engine.assess(state, oldCatalog, courseId, 'pre-a1', submission(), now));
});

test('legacy imports reject invalid times, unknown fields and hidden completion flags', () => {
  const legacy = { version: 1, courses: { [courseId]: { lessonId: lesson.id, records: { [lesson.id]: { answers: [0, null, null], updatedAt: now } } } } };
  for (const edit of [
    (state) => { state.extra = true; }, (state) => { state.courses[courseId].levelId = 'c1'; },
    (state) => { state.courses[courseId].records[lesson.id].complete = true; },
    (state) => { state.courses[courseId].records[lesson.id].updatedAt = '2026-02-30T12:00:00.000Z'; },
    (state) => { state.courses[courseId].records[lesson.id].updatedAt = '2026-01-01'; },
    (state) => { state.courses[courseId].records[lesson.id].answers = [0]; },
    (state) => { state.courses[courseId].records.missing = state.courses[courseId].records[lesson.id]; }
  ]) { const bad = copy(legacy); edit(bad); assert.throws(() => engine.restore(bad, catalog)); }
});

test('visits update the matching stage without creating practice or changing the other course', () => {
  const original = engine.empty(), target = catalog.phonics[40];
  const state = engine.visit(original, catalog, 'phonics', target.id);
  assert.equal(state.courses.phonics.levelId, 'c1'); assert.equal(state.courses.phonics.lessonId, target.id);
  assert.deepEqual(state.courses.phonics.records, {}); assert.deepEqual(state.courses[courseId], original.courses[courseId]);
  assert.deepEqual(original, engine.empty());
  assert.equal(engine.visit(state, catalog, 'phonics', null).courses.phonics.lessonId, null);
  assert.throws(() => engine.visit(state, catalog, courseId, target.id));
  assert.throws(() => engine.visit(state, catalog, 'unknown', target.id));
});

test('legacy quiz completion remains separate from output practice and full completion', () => {
  const state = objectives(), status = engine.lessonStatus(state, courseId, lesson, now);
  assert.equal(status.complete, true); assert.equal(status.productionComplete, false); assert.equal(status.fullComplete, false);
  assert.equal(record(state).dueAt, null);
  const counts = engine.summary(state, courseId, catalog[courseId], now);
  assert.equal(counts.completed, 1); assert.equal(counts.fullCompleted, 0); assert.equal(counts.practiced, 0);
  const stage = engine.stageSummary(state, catalog, courseId, 'pre-a1', now);
  assert.equal(stage.objectiveComplete, 1); assert.equal(stage.completed, 0); assert.equal(stage.correct, 3); assert.equal(stage.totalQuestions, 24);
});

test('partial drafts cannot schedule reviews and either completion order schedules exactly once', () => {
  let state = objectives();
  for (const partial of [{ writing: '', speaking: '', checks: [false, false, false] }, { ...draft, speaking: ' ' }, { ...draft, checks: [true, false, true] }]) {
    state = engine.saveProduction(state, catalog, courseId, lesson.id, partial, now);
    assert.equal(record(state).dueAt, null); assert.equal(engine.lessonStatus(state, courseId, lesson, now).fullComplete, false);
  }
  const done = completed();
  const reverse = objectives(engine.saveProduction(engine.empty(), catalog, courseId, lesson.id, draft, now));
  assert.deepEqual(record(done), record(reverse)); assert.equal(record(done).dueAt, day(1));
  const saved = engine.saveProduction(done, catalog, courseId, lesson.id, { ...draft, writing: 'A revised response.' }, day(0.5));
  assert.equal(record(saved).dueAt, day(1));
  assert.equal(engine.lessonStatus(saved, courseId, lesson, now).due, false);
  assert.equal(engine.lessonStatus(saved, courseId, lesson, day(1)).due, true);
  const counts = engine.summary(saved, courseId, catalog[courseId], day(1));
  assert.equal(counts.fullCompleted, 1); assert.equal(counts.practiced, 1); assert.equal(counts.productionCompleted, 1); assert.equal(counts.due, 1);
});

test('answer mutations reject duplicates, invalid selections and foreign course IDs atomically', () => {
  const state = engine.answer(engine.empty(), catalog, courseId, lesson.id, 0, 0, now), before = copy(state);
  for (const [id, lessonId, index, option] of [[courseId, lesson.id, 0, 1], [courseId, lesson.id, -1, 0], [courseId, lesson.id, 3, 0], [courseId, lesson.id, 1.5, 0], [courseId, lesson.id, 1, 9], [courseId, lesson.id, 1, '0'], ['phonics', lesson.id, 1, 0], ['__proto__', lesson.id, 1, 0]]) {
    assert.throws(() => engine.answer(state, catalog, id, lessonId, index, option, now));
  }
  assert.deepEqual(state, before);
});

test('wrong-only retry preserves correct evidence while full retry clears completion and scheduling', () => {
  let state = engine.saveProduction(engine.empty(), catalog, courseId, lesson.id, draft, now);
  state = engine.answer(state, catalog, courseId, lesson.id, 0, 0, now);
  state = engine.answer(state, catalog, courseId, lesson.id, 1, 0, now);
  const retried = engine.retry(state, catalog, courseId, lesson.id, true, now);
  assert.deepEqual(record(retried).answers, [0, null, null]); assert.equal(record(retried).writing, draft.writing);
  assert.equal(engine.summary(state, courseId, catalog[courseId], now).toReview, 1);
  assert.equal(engine.summary(retried, courseId, catalog[courseId], now).toReview, 0);
  const reviewed = engine.review(completed(), catalog, courseId, lesson.id, 'good', day(1));
  const wrongOnly = engine.retry(reviewed, catalog, courseId, lesson.id, true, day(2));
  assert.equal(record(wrongOnly).dueAt, day(8));
  const restarted = engine.retry(reviewed, catalog, courseId, lesson.id, false, day(2));
  assert.deepEqual(record(restarted).answers, [null, null, null]); assert.equal(record(restarted).dueAt, null);
  assert.equal(record(restarted).writing, draft.writing); assert.deepEqual(record(restarted).checks, draft.checks);
  assert.equal(record(restarted).reviews, 1); assert.equal(record(restarted).lastReviewAt, day(1));
  assert.equal(engine.lessonStatus(restarted, courseId, lesson, day(2)).fullComplete, false);
  assert.deepEqual(engine.restore(restarted, catalog), restarted);
  assert.equal(record(objectives(restarted, day(2))).dueAt, day(3));
  assert.throws(() => engine.retry(reviewed, catalog, courseId, lesson.id, 'all', day(2)));
});

test('reviews require completed due lessons and duplicate clicks cannot advance the schedule', () => {
  const state = completed(), before = copy(state);
  assert.throws(() => engine.review(engine.empty(), catalog, courseId, lesson.id, 'good', day(1)));
  assert.throws(() => engine.review(state, catalog, courseId, lesson.id, 'good', now));
  assert.throws(() => engine.review(state, catalog, courseId, lesson.id, 'perfect', day(1)));
  const reviewed = engine.review(state, catalog, courseId, lesson.id, 'good', day(1));
  assert.equal(record(reviewed).reviews, 1); assert.equal(record(reviewed).dueAt, day(8));
  assert.throws(() => engine.review(reviewed, catalog, courseId, lesson.id, 'good', day(1)));
  assert.deepEqual(state, before);
});

test('review intervals share the route policy of 1, 3, 7, 14 and at most 30 days', () => {
  assert.equal(record(engine.review(completed(), catalog, courseId, lesson.id, 'again', day(1))).dueAt, day(2));
  assert.equal(record(engine.review(completed(), catalog, courseId, lesson.id, 'hard', day(1))).dueAt, day(4));
  let state = engine.review(completed(), catalog, courseId, lesson.id, 'good', day(1));
  state = engine.review(state, catalog, courseId, lesson.id, 'good', day(8)); assert.equal(record(state).dueAt, day(22));
  state = engine.review(state, catalog, courseId, lesson.id, 'good', day(22)); assert.equal(record(state).dueAt, day(52));
  state = engine.review(state, catalog, courseId, lesson.id, 'good', day(52)); assert.equal(record(state).dueAt, day(82));
});

test('withdrawing a self-check removes scheduled review without erasing its history', () => {
  const reviewed = engine.review(completed(), catalog, courseId, lesson.id, 'good', day(1));
  const edited = engine.saveProduction(reviewed, catalog, courseId, lesson.id, { ...draft, checks: [false, true, true] }, day(2));
  assert.equal(record(edited).dueAt, null); assert.equal(record(edited).reviews, 1); assert.equal(record(edited).lastReviewAt, day(1));
  assert.throws(() => engine.review(edited, catalog, courseId, lesson.id, 'good', day(8)));
});

test('production drafts enforce bounds and boolean checks while preserving written whitespace', () => {
  const state = engine.saveProduction(engine.empty(), catalog, courseId, lesson.id, { ...draft, writing: ' x\n ' }, now);
  assert.equal(record(state).writing, ' x\n ');
  assert.doesNotThrow(() => engine.saveProduction(state, catalog, courseId, lesson.id, { ...draft, writing: 'x'.repeat(8000) }, now));
  for (const bad of [{ ...draft, writing: 'x'.repeat(8001) }, { ...draft, speaking: null }, { ...draft, checks: [true, true] }, { ...draft, checks: [true, true, 1] }, { ...draft, checks: Array(3) }, { ...draft, completed: true }]) {
    assert.throws(() => engine.saveProduction(state, catalog, courseId, lesson.id, bad, now));
  }
});

test('both course records and stage assessments remain independent', () => {
  const initial = completed(), other = catalog.phonics[40];
  let state = objectives(initial, now, 'phonics', other);
  state = engine.saveProduction(state, catalog, 'phonics', other.id, draft, now);
  state = engine.assess(state, catalog, 'phonics', 'c1', submission(), now);
  assert.deepEqual(state.courses[courseId], initial.courses[courseId]);
  assert.equal(engine.stageSummary(state, catalog, 'phonics', 'c1', day(1)).completed, 1);
  assert.equal(engine.stageSummary(state, catalog, 'phonics', 'c1', day(1)).assessmentCount, 1);
  assert.equal(engine.stageSummary(state, catalog, courseId, 'c1', day(1)).completed, 0);
  assert.equal(engine.stageSummary(state, catalog, courseId, 'c1', day(1)).assessmentCount, 0);
});

test('assessment scores are derived separately from output self-checks and lesson completion', () => {
  const original = completed(), value = submission();
  value.answers[0] = 1; value.checks = [true, false, false]; value.transcriptUsed = true;
  const state = engine.assess(original, catalog, courseId, 'pre-a1', value, now);
  const counts = engine.stageSummary(state, catalog, courseId, 'pre-a1', now);
  assert.equal(counts.latestScore, 5); assert.equal(counts.assessmentCount, 1); assert.equal(counts.completed, 1);
  assert.deepEqual(state.courses[courseId].records, original.courses[courseId].records);
  assert.equal(state.courses[courseId].lessonId, original.courses[courseId].lessonId);
  assert.equal(state.courses[courseId].assessments['pre-a1'][0].transcriptUsed, true);
  assert.equal(engine.summary(state, courseId, catalog[courseId], now).assessmentCount, 1);
});

test('assessment requires all answers, both responses and an explicit transcript flag', () => {
  for (const edit of [
    (value) => { value.answers.pop(); }, (value) => { value.answers[0] = null; }, (value) => { value.answers[0] = 9; },
    (value) => { value.answers = Array(6); }, (value) => { value.writing = ' '; }, (value) => { value.speaking = ''; },
    (value) => { value.checks = [true, false]; }, (value) => { delete value.transcriptUsed; },
    (value) => { value.transcriptUsed = 'no'; }, (value) => { value.score = 6; }
  ]) { const value = submission(); edit(value); assert.throws(() => engine.assess(engine.empty(), catalog, courseId, 'pre-a1', value, now)); }
  assert.throws(() => engine.assess(engine.empty(), catalog, courseId, 'unknown', submission(), now));
});

test('assessment keeps ten chronological attempts and rejects backwards submission clocks', () => {
  let state = engine.empty();
  for (let index = 0; index < 12; index += 1) state = engine.assess(state, catalog, courseId, 'pre-a1', submission(), day(index));
  const history = state.courses[courseId].assessments['pre-a1'];
  assert.equal(history.length, 10); assert.equal(history[0].submittedAt, day(2)); assert.equal(history[9].submittedAt, day(11));
  assert.throws(() => engine.assess(state, catalog, courseId, 'pre-a1', submission(), day(10)));
  const bad = copy(state); bad.courses[courseId].assessments['pre-a1'].reverse();
  assert.throws(() => engine.restore(bad, catalog));
});

test('v2 restore deep-copies output, answer and assessment arrays without trusting imported totals', () => {
  const state = engine.assess(completed(), catalog, courseId, 'pre-a1', submission(), now);
  const imported = copy(state), restored = engine.restore(imported, catalog);
  assert.deepEqual(restored, state);
  record(restored).answers[0] = null; record(restored).checks[0] = false;
  restored.courses[courseId].assessments['pre-a1'][0].answers[0] = 1;
  restored.courses[courseId].assessments['pre-a1'][0].checks[0] = false;
  assert.deepEqual(imported, state);
  for (const edit of [
    (value) => { value.version = 3; }, (value) => { value.extra = true; }, (value) => { delete value.courses.phonics; },
    (value) => { value.courses[courseId].score = 6; }, (value) => { value.courses[courseId].levelId = 'c1'; },
    (value) => { value.courses[courseId].lessonId = catalog.phonics[0].id; },
    (value) => { value.courses[courseId].records.unknown = record(value); },
    (value) => { record(value).completed = true; }, (value) => { value.courses[courseId].assessments.unknown = []; },
    (value) => { value.courses[courseId].assessments['pre-a1'][0].score = 6; },
    (value) => { value.courses[courseId].assessments['pre-a1'] = Array(11).fill(value.courses[courseId].assessments['pre-a1'][0]); }
  ]) { const bad = copy(state); edit(bad); assert.throws(() => engine.restore(bad, catalog)); }
});

test('imports reject prototype-key payloads at every record map boundary', () => {
  for (const version of [1, 2]) {
    const value = version === 2 ? completed() : { version: 1, courses: { [courseId]: { lessonId: null, records: {} } } };
    for (const key of ['__proto__', 'constructor', 'prototype']) {
      const unknownCourse = copy(value); Object.defineProperty(unknownCourse.courses, key, { value: {}, enumerable: true });
      assert.throws(() => engine.restore(unknownCourse, catalog));
      const unknownLesson = copy(value); Object.defineProperty(unknownLesson.courses[courseId].records, key, { value: {}, enumerable: true });
      assert.throws(() => engine.restore(unknownLesson, catalog));
      if (version === 2) {
        const unknownStage = copy(value); Object.defineProperty(unknownStage.courses[courseId].assessments, key, { value: [], enumerable: true });
        assert.throws(() => engine.restore(unknownStage, catalog));
      }
    }
  }
  assert.equal({}.polluted, undefined);
});

test('v2 restore validates timestamps, sparse values and review chronology', () => {
  const state = completed();
  for (const edit of [
    (item) => { item.answers = [0]; }, (item) => { item.answers = Array(3); }, (item) => { item.answers[1] = -1; },
    (item) => { item.checks = Array(3); }, (item) => { item.reviews = -1; }, (item) => { item.reviews = 1.5; },
    (item) => { item.reviews = 1; }, (item) => { item.lastReviewAt = now; }, (item) => { item.dueAt = null; },
    (item) => { item.answers[0] = null; }, (item) => { item.dueAt = day(31); },
    (item) => { item.updatedAt = '2026-02-30T12:00:00.000Z'; }, (item) => { item.updatedAt = '2026-01-01T12:00:00+00:00'; },
    (item) => { item.dueAt = 'tomorrow'; }
  ]) { const bad = copy(state); edit(record(bad)); assert.throws(() => engine.restore(bad, catalog)); }
  const reviewed = engine.review(state, catalog, courseId, lesson.id, 'good', day(1));
  for (const edit of [(item) => { item.lastReviewAt = day(2); }, (item) => { item.dueAt = day(1); }]) {
    const bad = copy(reviewed); edit(record(bad)); assert.throws(() => engine.restore(bad, catalog));
  }
});

test('mutations reject backwards clocks and date overflow while restore stays clock independent', () => {
  const state = completed(), before = copy(state);
  assert.throws(() => engine.retry(state, catalog, courseId, lesson.id, false, day(-1)));
  assert.throws(() => engine.saveProduction(state, catalog, courseId, lesson.id, draft, 'yesterday'));
  assert.throws(() => completed('9999-12-31T12:00:00.000Z'));
  const future = engine.assess(engine.empty(), catalog, courseId, 'pre-a1', submission(), '2099-01-01T00:00:00.000Z');
  assert.deepEqual(engine.restore(future, catalog), future); assert.deepEqual(state, before);
});

test('browser adapter resolves the shared engine lazily and exports the same API', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../foundationProgress.js'), 'utf8'), sandbox);
  assert.equal(sandbox.window.FoundationProgress.empty().version, 2);
  assert.throws(() => sandbox.window.FoundationProgress.restore(null, catalog));
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../pathwayProgress.js'), 'utf8'), sandbox);
  assert.deepEqual(copy(sandbox.window.FoundationProgress.restore(null, catalog)), engine.empty());
});
