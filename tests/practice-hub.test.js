const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregate } = require('../practiceHub.js');
const q = (answer) => ({ options: ['a', 'b', 'c'], answer });
const catalogs = {
  pathway: [{ id: 'b1', label: 'B1', lessons: [{ id: 'route-lesson', title: '综合课', questions: [q(1), q(2), q(0), q(1)] }] }],
  foundation: {
    'word-parts': [{ id: 'roots-lesson', title: '词根课', levelId: 'a2', quizzes: [q(1), q(0), q(2)] }],
    phonics: [{ id: 'phonics-lesson', title: '拼读课', levelId: 'c1', quizzes: [q(0), q(2), q(1)] }],
    stages: { 'word-parts': [{ id: 'a2', label: 'A2' }], phonics: [{ id: 'c1', label: 'C1' }] }
  }
};
function sample() {
  return {
    pathwayProgress: { lessons: { 'route-lesson': { answers: [0, 2, null, 1] } }, assessments: { b1: [{ answers: [0, 0, 0, 0] }] } },
    foundationProgress: { courses: {
      'word-parts': { records: { 'roots-lesson': { answers: [0, 2, null] } }, assessments: { a2: [{ answers: [0, 0, 0] }] } },
      phonics: { records: { 'phonics-lesson': { answers: [0, null, 2] } } }
    } }
  };
}

test('empty and missing course records do not create work or claim mastery', () => {
  assert.deepEqual(aggregate(), { lessons: [], lessonCount: 0, questionCount: 0 });
  assert.deepEqual(aggregate({}, catalogs), { lessons: [], lessonCount: 0, questionCount: 0 });
});

test('aggregates current wrong answers across three courses with exact navigation identities', () => {
  const result = aggregate(sample(), catalogs);
  assert.equal(result.lessonCount, 3);
  assert.equal(result.questionCount, 4);
  assert.deepEqual(result.lessons.map((item) => [item.courseId, item.levelId, item.lessonId, item.wrongQuestions]), [
    ['word-parts', 'a2', 'roots-lesson', [0, 1]], ['pathway', 'b1', 'route-lesson', [0]], ['phonics', 'c1', 'phonics-lesson', [2]]
  ]);
});

test('historical assessments and unknown records are excluded from pending lesson mistakes', () => {
  const progress = sample();
  progress.pathwayProgress.lessons = { removed: { answers: [0, 0, 0, 0] } };
  progress.foundationProgress.courses['word-parts'].records = {};
  progress.foundationProgress.courses.phonics.records = {};
  assert.equal(aggregate(progress, catalogs).questionCount, 0);
  assert.equal(aggregate(progress, catalogs).lessonCount, 0);
});

test('correcting a lesson removes it from the hub without deleting other evidence', () => {
  const progress = sample();
  const before = structuredClone(progress);
  aggregate(progress, catalogs);
  assert.deepEqual(progress, before, 'summary must not mutate learning records');
  progress.foundationProgress.courses['word-parts'].records['roots-lesson'].answers = [1, 0, null];
  const result = aggregate(progress, catalogs);
  assert.equal(result.questionCount, 2);
  assert.equal(result.lessonCount, 2);
  assert.ok(!result.lessons.some((lesson) => lesson.courseId === 'word-parts'));
  assert.deepEqual(progress.foundationProgress.courses['word-parts'].assessments, before.foundationProgress.courses['word-parts'].assessments);
});

test('unanswered, malformed and out of range selections are not labelled as mistakes', () => {
  const progress = sample();
  progress.pathwayProgress.lessons['route-lesson'].answers = [null, undefined, '1', -1];
  progress.foundationProgress.courses['word-parts'].records['roots-lesson'].answers = [3, 1.5, false];
  progress.foundationProgress.courses.phonics.records['phonics-lesson'].answers = [0, 2, 1, 0];
  assert.equal(aggregate(progress, catalogs).questionCount, 0);
});

test('single-question foundation lessons keep their stage and current-answer semantics', () => {
  const legacy = { foundation: { 'word-parts': [{ id: 'first-root', title: '第一课', quiz: q(2) }] } };
  const progress = { foundationProgress: { courses: { 'word-parts': { records: { 'first-root': { answers: [0] } } } } } };
  const [lesson] = aggregate(progress, legacy).lessons;
  assert.equal(lesson.levelId, 'pre-a1');
  assert.equal(lesson.levelLabel, 'Pre-A1');
  assert.deepEqual(lesson.wrongQuestions, [0]);
});
