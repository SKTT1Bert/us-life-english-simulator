const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = { window: {} };
for (const name of ['wordParts', 'phonics', 'wordPartsStages', 'phonicsStages', 'pathwayStarter', 'pathwayAdvanced', 'learningPath']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../data/${name}.js`), 'utf8'), sandbox);
const data = JSON.parse(JSON.stringify(sandbox.window));
const courses = { 'word-parts': data.WORD_PARTS_LESSONS, phonics: data.PHONICS_LESSONS };
const stages = { 'word-parts': data.WORD_PARTS_STAGES, phonics: data.PHONICS_STAGES };
const legacy = require('./fixtures/foundation-v1-questions.json');
const engine = require('../foundationProgress.js');
const text = (value, key) => assert.ok(typeof value === 'string' && value.trim(), key);
test('all 48 pre-upgrade lesson identities and 144 answer meanings remain unchanged', () => {
  for (const [course, lessons] of Object.entries(legacy)) for (const old of lessons) {
    const current = courses[course].find((item) => item.id === old.id);
    assert.ok(current, old.id); assert.deepEqual(current.quizzes, old.quizzes, old.id);
  }
});
test('both original courses contain six eight-lesson stages with distinct productive and recall work', () => {
  for (const [course, lessons] of Object.entries(courses)) {
    assert.deepEqual(stages[course].map((s) => s.id), ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1']);
    assert.ok(new Set(stages[course].map((s) => s.assessment.questions.map((q) => q.answer).join(','))).size >= 4, 'stage checks must not repeat an easily guessed answer-position pattern');
    const recalls = new Set(), tasks = new Set();
    for (const stage of stages[course]) {
      const group = lessons.filter((lesson) => lesson.levelId === stage.id);
      assert.equal(group.length, 8, `${course} ${stage.id}`);
      const route = data.LEARNING_PATH.find((level) => level.id === stage.id);
      assert.ok(route.lessons.some((lesson) => lesson.id === stage.pathwayLessonId));
      for (const lesson of group) {
        for (const key of ['writing', 'speaking', 'model']) text(lesson.production[key], lesson.id);
        assert.equal(lesson.production.rubric.length, 3);
        lesson.production.rubric.forEach((item) => text(item, lesson.id));
        text(lesson.review.prompt, lesson.id); text(lesson.review.answer, lesson.id);
        assert.ok(!recalls.has(lesson.review.prompt), `duplicate recall ${lesson.id}`); recalls.add(lesson.review.prompt);
        assert.ok(!tasks.has(lesson.production.writing), `duplicate output ${lesson.id}`); tasks.add(lesson.production.writing);
        assert.ok(route.lessons.some((item) => item.id === lesson.pathwayLessonId), `cross-stage link ${lesson.id}`);
      }
    }
  }
});
test('twelve independent stage checks contain 72 new explained questions and separate output rubrics', () => {
  const prompts = new Set(), ids = new Set();
  const lessonPrompts = new Set(Object.values(courses).flat().flatMap((l) => l.quizzes.map((q) => q.question)));
  for (const [course, levels] of Object.entries(stages)) for (const level of levels) {
    text(level.title, level.id); text(level.description, level.id); assert.ok(level.canDo.length >= 3);
    const assessment = level.assessment;
    assert.equal(assessment.questions.length, 6);
    for (const skill of ['reading', 'listening']) {
      assert.equal(assessment.questions.filter((q) => q.skill === skill).length, 3);
      text(assessment[skill].title, level.id); text(assessment[skill].text, level.id);
    }
    for (const question of assessment.questions) {
      assert.ok(!ids.has(question.id)); ids.add(question.id);
      assert.ok(!prompts.has(question.prompt), question.prompt); prompts.add(question.prompt);
      assert.ok(!lessonPrompts.has(question.prompt), `assessment repeats lesson ${question.id}`);
      text(question.explanation, question.id); assert.ok(question.options.length >= 3);
      assert.equal(new Set(question.options).size, question.options.length);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
    }
    for (const key of ['writing', 'speaking', 'model']) text(assessment[key], `${course} ${level.id}`);
    assert.equal(assessment.rubric.length, 3);
    assert.ok(level.sources.length);
    for (const source of level.sources) { const url = new URL(source.url); assert.equal(url.protocol, 'https:'); assert.ok(!url.username && !url.password); }
  }
  assert.equal(prompts.size, 72);
});
test('actual legacy answers migrate and every authored lesson and assessment round-trips through the engine', () => {
  const catalog = { ...courses, stages }, now = '2026-10-22T10:00:00.000Z';
  const old = { version: 1, courses: {} };
  for (const [course, lessons] of Object.entries(legacy)) old.courses[course] = { lessonId: lessons.at(-1).id, records: Object.fromEntries(lessons.map((lesson) => [lesson.id, { answers: lesson.quizzes.map((q) => q.answer), updatedAt: now }])) };
  let progress = engine.restore(old, catalog);
  for (const course of Object.keys(courses)) {
    assert.equal(engine.summary(progress, course, courses[course]).completed, 24);
    assert.equal(engine.summary(progress, course, courses[course]).fullCompleted, 0);
    for (const lesson of courses[course]) {
      for (let index = 0; index < 3; index++) if (!progress.courses[course].records[lesson.id] || progress.courses[course].records[lesson.id].answers[index] === null) progress = engine.answer(progress, catalog, course, lesson.id, index, lesson.quizzes[index].answer, now);
      progress = engine.saveProduction(progress, catalog, course, lesson.id, { writing: `Fixture ${lesson.title}`, speaking: 'Fixture spoken practice notes.', checks: [true, true, true] }, now);
    }
    for (const level of stages[course]) {
      progress = engine.assess(progress, catalog, course, level.id, { answers: level.assessment.questions.map((q) => q.answer), writing: 'Fixture written response.', speaking: 'Fixture oral response.', checks: [false, true, false], transcriptUsed: true }, now);
      const info = engine.stageSummary(progress, catalog, course, level.id, now);
      assert.equal(info.completed, 8); assert.equal(info.latestScore, 6); assert.equal(info.due, 0);
    }
    assert.equal(engine.summary(progress, course, courses[course], '2026-10-24T10:00:00.000Z').due, 48);
  }
  assert.deepEqual(engine.restore(JSON.parse(JSON.stringify(progress)), catalog), progress);
});
