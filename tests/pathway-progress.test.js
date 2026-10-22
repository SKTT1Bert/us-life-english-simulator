const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../pathwayProgress.js');

const copy = (value) => JSON.parse(JSON.stringify(value));
const questions = (prefix, length) => Array.from({ length }, (_, index) => ({ id: `${prefix}-${index}`, options: ['A', 'B', 'C'], answer: index % 3 }));
const catalog = ['pre-a1', 'c1'].map((id) => ({ id, lessons: [1, 2].map((number) => ({ id: `${id}-lesson-${number}`, questions: questions(`${id}-${number}`, 4) })), assessment: { questions: questions(`${id}-check`, 8) } }));
const lesson = catalog[0].lessons[0];
const now = '2026-01-01T12:00:00.000Z';
const day = (number) => new Date(Date.parse(now) + number * 86400000).toISOString();
const draft = { writing: 'A complete writing response.', speaking: 'My speaking rehearsal notes.', checks: [true, true, true] };
const submission = () => ({ answers: catalog[0].assessment.questions.map((question) => question.answer), ...copy(draft), transcriptUsed: false });
function objectives(progress = engine.empty(), date = now) {
  return lesson.questions.reduce((state, question, index) => engine.answer(state, catalog, lesson.id, index, question.answer, date), progress);
}
function completed(date = now) { return engine.saveProduction(objectives(engine.empty(), date), catalog, lesson.id, draft, date); }

test('missing optional pathway state starts empty without fabricated evidence', () => {
  for (const missing of [undefined, null]) {
    const state = engine.restore(missing, catalog);
    assert.deepEqual(state, engine.empty());
    assert.deepEqual(engine.summary(state, catalog, 'pre-a1', now), { lessons: 2, total: 2, objectiveComplete: 0, productionComplete: 0, completed: 0, due: 0, assessmentCount: 0, latestScore: null });
  }
  assert.equal(engine.restore(null, [catalog[1]]).levelId, 'c1');
});

test('a visit only records navigation, and rejects mismatched or unknown lesson references', () => {
  const original = engine.empty();
  const visited = engine.visit(original, catalog, 'c1', catalog[1].lessons[0].id);
  assert.equal(visited.levelId, 'c1');
  assert.equal(visited.lessonId, 'c1-lesson-1');
  assert.deepEqual(visited.lessons, {});
  assert.deepEqual(original, engine.empty());
  assert.throws(() => engine.visit(original, catalog, 'c1', lesson.id));
  assert.throws(() => engine.visit(original, catalog, 'unknown', null));
  assert.equal(engine.visit(visited, catalog, 'pre-a1', null).lessonId, null);
});

test('answers reject duplicates, bad options and unknown IDs without mutating evidence', () => {
  const state = engine.answer(engine.empty(), catalog, lesson.id, 0, 0, now);
  const before = copy(state);
  for (const [id, index, option] of [[lesson.id, 0, 1], [lesson.id, -1, 0], [lesson.id, 4, 0], [lesson.id, 1.5, 0], [lesson.id, 1, 99], [lesson.id, 1, '0'], ['unknown', 1, 0]]) {
    assert.throws(() => engine.answer(state, catalog, id, index, option, now));
  }
  assert.deepEqual(state, before);
});

test('objective completion and production self-check are counted separately', () => {
  let state = objectives();
  let status = engine.summary(state, catalog, 'pre-a1', now);
  assert.equal(status.objectiveComplete, 1); assert.equal(status.productionComplete, 0); assert.equal(status.completed, 0);
  assert.equal(state.lessons[lesson.id].dueAt, null);
  state = engine.saveProduction(state, catalog, catalog[0].lessons[1].id, draft, now);
  status = engine.summary(state, catalog, 'pre-a1', now);
  assert.equal(status.objectiveComplete, 1); assert.equal(status.productionComplete, 1); assert.equal(status.completed, 0);
  assert.equal(engine.summary(state, catalog, 'c1', now).completed, 0);
});

test('draft autosave permits empty and partial work without completing or scheduling a lesson', () => {
  let state = objectives();
  for (const partial of [{ writing: '', speaking: '', checks: [false, false, false] }, { writing: 'Draft', speaking: ' ', checks: [true, true, true] }, { ...draft, checks: [true, true, false] }]) {
    state = engine.saveProduction(state, catalog, lesson.id, partial, now);
    assert.equal(state.lessons[lesson.id].dueAt, null);
    assert.equal(engine.summary(state, catalog, 'pre-a1', now).completed, 0);
  }
});

test('either completion order schedules the first review once, and autosave does not postpone it', () => {
  const first = completed();
  let reverse = engine.saveProduction(engine.empty(), catalog, lesson.id, draft, now);
  reverse = objectives(reverse);
  assert.deepEqual(first.lessons[lesson.id], reverse.lessons[lesson.id]);
  assert.equal(first.lessons[lesson.id].dueAt, day(1));
  const saved = engine.saveProduction(first, catalog, lesson.id, { ...draft, writing: 'Revised writing.' }, day(0.5));
  assert.equal(saved.lessons[lesson.id].dueAt, day(1));
  assert.equal(engine.summary(saved, catalog, 'pre-a1', now).due, 0);
  assert.equal(engine.summary(saved, catalog, 'pre-a1', day(1)).due, 1);
  assert.equal(engine.summary(saved, catalog, 'pre-a1', day(1)).completed, 1);
});

test('wrong-only retry preserves correct answers, productive work and existing review dates', () => {
  let state = engine.saveProduction(engine.empty(), catalog, lesson.id, draft, now);
  state = engine.answer(state, catalog, lesson.id, 0, 0, now);
  state = engine.answer(state, catalog, lesson.id, 1, 0, now);
  const retry = engine.retry(state, catalog, lesson.id, now);
  assert.deepEqual(retry.lessons[lesson.id].answers, [0, null, null, null]);
  assert.equal(retry.lessons[lesson.id].writing, draft.writing);
  assert.equal(state.lessons[lesson.id].answers[1], 0);
  const done = completed();
  const again = engine.retry(done, catalog, lesson.id, day(0.5));
  assert.equal(again.lessons[lesson.id].dueAt, day(1));
  assert.equal(again.lessons[lesson.id].reviews, 0);
  assert.deepEqual(again.lessons[lesson.id].answers, done.lessons[lesson.id].answers);
});

test('review requires a completed due lesson and cannot be farmed by repeat clicks or retries', () => {
  assert.throws(() => engine.review(engine.empty(), catalog, lesson.id, 'good', day(1)));
  const state = completed();
  assert.throws(() => engine.review(state, catalog, lesson.id, 'good', now));
  assert.throws(() => engine.review(state, catalog, lesson.id, 'perfect', day(1)));
  const reviewed = engine.review(state, catalog, lesson.id, 'good', day(1));
  assert.equal(reviewed.lessons[lesson.id].reviews, 1);
  assert.equal(reviewed.lessons[lesson.id].lastReviewAt, day(1));
  assert.equal(reviewed.lessons[lesson.id].dueAt, day(8));
  assert.throws(() => engine.review(reviewed, catalog, lesson.id, 'good', day(1)));
  const retried = engine.retry(reviewed, catalog, lesson.id, day(2));
  assert.equal(retried.lessons[lesson.id].dueAt, day(8));
  assert.throws(() => engine.review(retried, catalog, lesson.id, 'again', day(2)));
  assert.equal(state.lessons[lesson.id].reviews, 0);
});

test('review intervals respect again/hard/good and cap successful spacing at 30 days', () => {
  assert.equal(engine.review(completed(), catalog, lesson.id, 'again', day(1)).lessons[lesson.id].dueAt, day(2));
  assert.equal(engine.review(completed(), catalog, lesson.id, 'hard', day(1)).lessons[lesson.id].dueAt, day(4));
  let state = engine.review(completed(), catalog, lesson.id, 'good', day(1));
  state = engine.review(state, catalog, lesson.id, 'good', day(8));
  assert.equal(state.lessons[lesson.id].dueAt, day(22));
  state = engine.review(state, catalog, lesson.id, 'good', day(22));
  assert.equal(state.lessons[lesson.id].dueAt, day(52));
  state = engine.review(state, catalog, lesson.id, 'good', day(52));
  assert.equal(state.lessons[lesson.id].dueAt, day(82));
});

test('withdrawing a productive self-check stops reviews without erasing review history', () => {
  const reviewed = engine.review(completed(), catalog, lesson.id, 'good', day(1));
  const edited = engine.saveProduction(reviewed, catalog, lesson.id, { ...draft, checks: [true, false, true] }, day(2));
  assert.equal(edited.lessons[lesson.id].dueAt, null);
  assert.equal(edited.lessons[lesson.id].reviews, 1);
  assert.equal(edited.lessons[lesson.id].lastReviewAt, day(1));
  assert.throws(() => engine.review(edited, catalog, lesson.id, 'good', day(8)));
  assert.equal(engine.summary(edited, catalog, 'pre-a1', day(8)).completed, 0);
});

test('production bounds and booleans are enforced without trimming saved drafts', () => {
  const state = engine.saveProduction(engine.empty(), catalog, lesson.id, { ...draft, writing: ' x\n ' }, now);
  assert.equal(state.lessons[lesson.id].writing, ' x\n ');
  assert.doesNotThrow(() => engine.saveProduction(state, catalog, lesson.id, { ...draft, writing: 'x'.repeat(8000) }, now));
  for (const bad of [{ ...draft, writing: 'x'.repeat(8001) }, { ...draft, speaking: 'x'.repeat(8001) }, { ...draft, checks: [true, true] }, { ...draft, checks: [true, true, 1] }, { ...draft, checks: Array(3) }, { ...draft, writing: null }, { ...draft, score: 100 }]) assert.throws(() => engine.saveProduction(state, catalog, lesson.id, bad, now));
});

test('assessments derive scores, permit honest false self-checks, and leave lessons and navigation unchanged', () => {
  const original = completed();
  const value = submission();
  value.answers[0] = 1; value.checks = [true, false, false]; value.transcriptUsed = true;
  const state = engine.assess(original, catalog, 'pre-a1', value, now);
  const status = engine.summary(state, catalog, 'pre-a1', now);
  assert.equal(status.latestScore, 7); assert.equal(status.assessmentCount, 1);
  assert.deepEqual(state.lessons, original.lessons);
  assert.equal(state.levelId, original.levelId); assert.equal(state.lessonId, original.lessonId);
  assert.equal(state.assessments['pre-a1'][0].transcriptUsed, true);
  assert.deepEqual(original.assessments, {});
});

test('assessment requires all objective answers, both productive responses and the transcript flag', () => {
  for (const edit of [
    (value) => { value.answers.pop(); }, (value) => { value.answers[0] = null; }, (value) => { value.answers[0] = 3; },
    (value) => { value.answers = Array(8); }, (value) => { value.writing = ' '; }, (value) => { value.speaking = ''; },
    (value) => { value.checks = [true, false]; }, (value) => { delete value.transcriptUsed; }, (value) => { value.transcriptUsed = 'no'; },
    (value) => { value.score = 8; }
  ]) { const value = submission(); edit(value); assert.throws(() => engine.assess(engine.empty(), catalog, 'pre-a1', value, now)); }
});

test('assessment history keeps the latest ten attempts and rejects backwards event time', () => {
  let state = engine.empty();
  for (let index = 0; index < 12; index += 1) state = engine.assess(state, catalog, 'pre-a1', submission(), day(index));
  assert.equal(state.assessments['pre-a1'].length, 10);
  assert.equal(state.assessments['pre-a1'][0].submittedAt, day(2));
  assert.equal(state.assessments['pre-a1'][9].submittedAt, day(11));
  assert.throws(() => engine.assess(state, catalog, 'pre-a1', submission(), day(10)));
  assert.deepEqual(engine.restore(copy(state), catalog), state);
});

test('restore deep-copies lesson and assessment arrays and rejects unknown fields and IDs', () => {
  const state = engine.assess(completed(), catalog, 'pre-a1', submission(), now);
  const imported = copy(state), restored = engine.restore(imported, catalog);
  assert.deepEqual(restored, imported);
  restored.lessons[lesson.id].answers[0] = null;
  restored.lessons[lesson.id].checks[0] = false;
  restored.assessments['pre-a1'][0].answers[0] = 1;
  restored.assessments['pre-a1'][0].checks[0] = false;
  assert.deepEqual(imported, state);
  for (const edit of [
    (value) => { value.version = 2; }, (value) => { value.levelId = 'unknown'; }, (value) => { value.lessonId = 'c1-lesson-1'; },
    (value) => { value.lessons.unknown = value.lessons[lesson.id]; }, (value) => { value.assessments.unknown = []; },
    (value) => { value.extra = true; }, (value) => { value.lessons[lesson.id].score = 4; },
    (value) => { value.assessments['pre-a1'][0].score = 8; },
    (value) => { value.assessments['pre-a1'] = Array(11).fill(value.assessments['pre-a1'][0]); }
  ]) { const bad = copy(state); edit(bad); assert.throws(() => engine.restore(bad, catalog)); }
});

test('restore validates answer lengths, sparse arrays, review relationships and real ISO dates', () => {
  const state = completed();
  for (const edit of [
    (record) => { record.answers = [0]; }, (record) => { record.answers = Array(4); }, (record) => { record.answers[1] = -1; },
    (record) => { record.checks = Array(3); }, (record) => { record.reviews = -1; }, (record) => { record.reviews = 1.5; },
    (record) => { record.reviews = 1; }, (record) => { record.lastReviewAt = now; }, (record) => { record.dueAt = null; },
    (record) => { record.answers[0] = null; }, (record) => { record.dueAt = day(31); },
    (record) => { record.updatedAt = '2026-02-30T12:00:00.000Z'; }, (record) => { record.updatedAt = '2026-01-01'; },
    (record) => { record.updatedAt = '2026-01-01T12:00:00+00:00'; }, (record) => { record.dueAt = 'tomorrow'; }
  ]) { const bad = copy(state); edit(bad.lessons[lesson.id]); assert.throws(() => engine.restore(bad, catalog)); }
  const reviewed = engine.review(state, catalog, lesson.id, 'good', day(1));
  for (const edit of [(record) => { record.lastReviewAt = day(2); }, (record) => { record.dueAt = day(1); }]) {
    const bad = copy(reviewed); edit(bad.lessons[lesson.id]); assert.throws(() => engine.restore(bad, catalog));
  }
});

test('restore validates assessment order and does not depend on the current machine clock', () => {
  let state = engine.assess(engine.empty(), catalog, 'pre-a1', submission(), '2099-01-01T00:00:00.000Z');
  assert.deepEqual(engine.restore(state, catalog), state);
  state = engine.assess(state, catalog, 'pre-a1', submission(), '2099-01-02T00:00:00.000Z');
  const bad = copy(state); bad.assessments['pre-a1'].reverse();
  assert.throws(() => engine.restore(bad, catalog));
});

test('mutations reject backward clocks and date overflow before changing saved evidence', () => {
  const state = completed(), before = copy(state);
  assert.throws(() => engine.retry(state, catalog, lesson.id, day(-1)));
  assert.throws(() => engine.saveProduction(state, catalog, lesson.id, draft, 'not-a-date'));
  assert.throws(() => completed('9999-12-31T12:00:00.000Z'));
  assert.deepEqual(state, before);
});
