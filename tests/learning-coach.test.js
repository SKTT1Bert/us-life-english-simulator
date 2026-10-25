const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Coach = require('../learningCoach.js');
const now = '2026-10-25T10:00:00.000Z';
const before = '2026-10-24T10:00:00.000Z';
const q = { options: ['yes', 'no', 'maybe'], answer: 0 };
const lesson = (id, title, levelId = 'b1') => ({ id, title, levelId, questions: [q, q], quizzes: [q, q], listening: { text: 'One sentence. Another sentence.' } });
const catalogs = {
  pathway: [{ id: 'b1', lessons: [lesson('b1-daily', '日常经历'), lesson('b1-argument', '研究论证'), lesson('b1-email', '工作邮件')] },
    { id: 'c1', lessons: [lesson('c1-research', '研究材料', 'c1')] }],
  foundation: { 'word-parts': [lesson('b1-roots', '词族与构词')], phonics: [lesson('b1-sounds', '声音练习')] },
  expressions: [{ id: 'one' }, { id: 'two' }]
};
function progress(minutes = 10, goal = 'everyday') {
  return { learningStudio: { preferences: { minutes, levelId: 'b1', goal }, diagnostics: [], listeningAttempts: [] },
    pathwayProgress: { lessons: {}, assessments: {} }, foundationProgress: { courses: { 'word-parts': { records: {}, assessments: {} }, phonics: { records: {}, assessments: {} } } },
    reviewSchedule: {}, practiceHistory: [], learned: ['one'], sessions: { '2026-10-25': ['one'] } };
}
const record = (answers = [0, 0], more = {}) => ({ answers, writing: 'My paragraph.', speaking: 'My spoken notes.', checks: [true, true, true], updatedAt: before, dueAt: '2026-10-26T10:00:00.000Z', ...more });

test('plans remain inside budget, use small steps and never mutate original records', () => {
  for (const minutes of [5, 10, 20]) {
    const state = progress(minutes), copy = structuredClone(state);
    const plan = Coach.buildPlan(state, catalogs, now);
    assert.ok(plan.plannedMinutes <= minutes);
    assert.equal(plan.plannedMinutes, plan.tasks.reduce((n, task) => n + task.minutes, 0));
    assert.ok(plan.tasks.length > 0 && plan.tasks.length <= 5);
    assert.deepEqual(state, copy);
    assert.ok(plan.tasks.find((task) => task.kind === 'learn').detail.includes('一道题'));
  }
});
test('due expression and course reviews precede new material; unknown and future schedule entries are excluded', () => {
  const state = progress(5);
  state.reviewSchedule = { one: { nextDueAt: before }, two: { nextDueAt: '2026-10-30T00:00:00.000Z' }, deleted: { nextDueAt: before } };
  state.pathwayProgress.lessons['b1-daily'] = record([0, 0], { dueAt: before });
  const plan = Coach.buildPlan(state, catalogs, now);
  assert.equal(plan.reviewCount, 2);
  assert.deepEqual(plan.tasks.map((task) => task.kind), ['review', 'review']);
  assert.equal(plan.tasks[0].action.type, 'expression-review');
  assert.equal(plan.tasks[1].action.lessonId, 'b1-daily');
});
test('unanswered and invalid choices do not become wrong questions; incomplete courses cannot enter review', () => {
  const state = progress();
  state.pathwayProgress.lessons['b1-daily'] = record([null, 1], { writing: '', dueAt: before });
  state.pathwayProgress.lessons['b1-argument'] = record([99, null]);
  const plan = Coach.buildPlan(state, catalogs, now);
  assert.equal(plan.reviewCount, 0);
  assert.equal(plan.wrongQuestions, 1);
  assert.equal(plan.tasks[0].kind, 'repair');
});
test('learning goal changes recommendations within selected stage and does not unlock advanced levels', () => {
  const first = (goal) => Coach.buildPlan(progress(5, goal), catalogs, now).tasks[0].action.lessonId;
  assert.equal(first('everyday'), 'b1-daily');
  assert.equal(first('academic'), 'b1-argument');
  assert.equal(first('work'), 'b1-email');
  assert.ok(['everyday', 'academic', 'work'].every((goal) => first(goal) !== 'c1-research'));
});
for (const levelId of ['pre-a1', 'a1']) test(`${levelId}: real beginner lessons retain prerequisite order for every goal and listening advances with the next lesson`, () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/pathwayStarter.js'), 'utf8'), context);
  const level = context.window.PATHWAY_STARTER.find((entry) => entry.id === levelId);
  const real = { pathway: [level], foundation: {}, expressions: [] };
  for (const goal of ['everyday', 'academic', 'work']) {
    const state = progress(10, goal); state.learningStudio.preferences.levelId = levelId;
    const taskIds = () => {
      const plan = Coach.buildPlan(state, real, now);
      return { learn: plan.tasks.find((task) => task.kind === 'learn'), listen: plan.tasks.find((task) => task.kind === 'listen') };
    };
    let tasks = taskIds();
    assert.equal(tasks.learn.action.lessonId, level.lessons[0].id, `${goal}: first prerequisite`);
    assert.equal(tasks.listen.action.lessonId, level.lessons[0].id);
    assert.match(tasks.learn.reason, /课程顺序/);
    const first = level.lessons[0];
    state.pathwayProgress.lessons[first.id] = record(first.questions.map((question) => question.answer));
    tasks = taskIds();
    assert.equal(tasks.learn.action.lessonId, level.lessons[1].id, `${goal}: next unfinished prerequisite`);
    assert.equal(tasks.listen.action.lessonId, level.lessons[1].id, `${goal}: audio follows new lesson instead of completed first lesson`);
    const resumed = level.lessons[2];
    state.pathwayProgress.lessons[resumed.id] = record(resumed.questions.map(() => null), { writing: '', speaking: '', checks: [false, false, false], dueAt: null });
    tasks = taskIds();
    assert.equal(tasks.learn.action.lessonId, resumed.id, `${goal}: resume existing unfinished work`);
    assert.equal(tasks.listen.action.lessonId, resumed.id);
  }
});
test('listening retains a usable fallback when the next lesson has no listening material', () => {
  const state = progress(); state.learningStudio.preferences.levelId = 'a1';
  const first = lesson('a1-first', '基础起步', 'a1'); delete first.listening;
  const next = lesson('a1-second', '时间和日常交流', 'a1');
  const plan = Coach.buildPlan(state, { pathway: [{ id: 'a1', lessons: [first, next] }], foundation: {}, expressions: [] }, now);
  assert.equal(plan.tasks.find((task) => task.kind === 'learn').action.lessonId, first.id);
  assert.equal(plan.tasks.find((task) => task.kind === 'listen').action.lessonId, next.id);
});
test('an existing incomplete lesson takes precedence over a new goal match and incomplete output is still required', () => {
  const state = progress(10, 'academic');
  state.pathwayProgress.lessons['b1-daily'] = record([0, 0], { checks: [true, true, false] });
  const plan = Coach.buildPlan(state, catalogs, now);
  assert.equal(plan.tasks[0].action.lessonId, 'b1-daily');
  assert.match(plan.tasks[0].detail, /口述/);
  assert.equal(Coach.report(state, catalogs, now).completed, 0);
});
test('course report matches full completion requirements for all three existing engines', () => {
  const state = progress();
  state.pathwayProgress.lessons['b1-daily'] = record();
  state.pathwayProgress.lessons['b1-argument'] = record([0, 0], { speaking: '' });
  state.foundationProgress.courses['word-parts'].records['b1-roots'] = record();
  state.foundationProgress.courses.phonics.records['b1-sounds'] = record([1, 0]);
  const result = Coach.report(state, catalogs, now);
  assert.equal(result.completed, 2);
  assert.deepEqual(result.courses.map((course) => [course.correct, course.answered, course.completed]), [[4, 4, 1], [2, 2, 1], [1, 2, 0]]);
});
test('UTC weekly evidence excludes future timestamps and legacy learned/session marks; expression event IDs deduplicate', () => {
  const state = progress();
  const event = { id: 'same', at: '2026-10-19T00:00:00.000Z', mode: 'recall', outcome: 'independent', delayed: true };
  state.practiceHistory = [event, event, { id: 'old', at: '2026-10-18T23:59:59.999Z' }, { id: 'future', at: '2026-10-25T10:00:01.000Z' }];
  state.pathwayProgress.lessons['b1-daily'] = record([], { updatedAt: '2026-10-25T00:01:00.000Z' });
  const result = Coach.report(state, catalogs, now);
  assert.equal(result.days[0].date, '2026-10-19');
  assert.equal(result.days[0].expression, 1);
  assert.equal(result.days[6].total, 1);
  assert.equal(result.activeDays, 2);
  assert.equal(result.recall.independent, 1);
  assert.equal(result.recall.delayed, 1);
  assert.equal(Coach.report(progress(), catalogs, now).activeDays, 0);
});
test('listening evidence uses the latest result, exact match, no revealed transcript and actual playback', () => {
  const state = progress();
  const attempt = (id, segmentId, more) => ({ id, segmentId, lessonId: 'b1-daily', answeredAt: before,
    matchedTokens: 3, tokenCount: 3, exact: true, revealed: false, listenCount: 1, shadow: 'not-yet', ...more });
  state.learningStudio.listeningAttempts = [attempt('old', 's1', { exact: false, matchedTokens: 1 }),
    attempt('new', 's1', { answeredAt: now, shadow: 'independent' }), attempt('extra', 's2', { exact: false }),
    attempt('seen', 's3', { revealed: true }), attempt('silent', 's4', { listenCount: 0 })];
  const result = Coach.report(state, catalogs, now);
  assert.deepEqual(result.listening, { attempts: 5, sentences: 4, unassisted: 1, needsPractice: 3, independentShadow: 1 });
  const plan = Coach.buildPlan(state, catalogs, now);
  assert.match(plan.tasks.find((task) => task.kind === 'listen').reason, /原文/);
  assert.equal(plan.tasks.find((task) => task.kind === 'listen').action.segmentId, 's2');
});
test('assessments and diagnostic submissions add dated evidence without awarding course completion', () => {
  const state = progress();
  state.pathwayProgress.assessments.b1 = [{ submittedAt: now }];
  state.foundationProgress.courses.phonics.assessments.b1 = [{ submittedAt: before }];
  state.learningStudio.diagnostics = [{ id: 'test', submittedAt: now, answers: [] }];
  const result = Coach.report(state, catalogs, now);
  assert.equal(result.completed, 0);
  assert.equal(result.days[6].assessments, 1);
  assert.equal(result.days[5].assessments, 1);
  assert.equal(result.days[6].diagnostic, 1);
});
