const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = { window: {} };
for (const file of ['wordParts', 'phonics', 'pathwayStarter', 'pathwayAdvanced', 'learningPath']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../data/${file}.js`), 'utf8'), sandbox);
const catalog = JSON.parse(JSON.stringify(sandbox.window.LEARNING_PATH));
const engine = require('../pathwayProgress.js');
const words = (text) => text.trim().split(/\s+/).length;
function text(value, label) { assert.equal(typeof value, 'string', label); assert.ok(value.trim().length > 0, label); }

test('six sequenced stages contain 48 substantive lessons and 240 unique objective questions', () => {
  assert.deepEqual(catalog.map((level) => level.id), ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1']);
  const ids = new Set(), prompts = new Set(), lessonIds = new Set();
  function questions(qs, count, label) {
    assert.equal(qs.length, count, label);
    for (const question of qs) {
      assert.ok(!ids.has(question.id), question.id); ids.add(question.id);
      assert.ok(!prompts.has(question.prompt), question.prompt); prompts.add(question.prompt);
      text(question.prompt, label); text(question.explanation, label);
      assert.ok(['reading', 'listening', 'language', 'vocabulary', 'grammar'].includes(question.skill), question.skill);
      assert.ok(question.options.length >= 3); assert.equal(new Set(question.options).size, question.options.length);
      question.options.forEach((option) => text(option, question.id));
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
    }
  }
  for (const level of catalog) {
    assert.equal(level.lessons.length, 8); assert.ok(level.canDo.length >= 3);
    for (const lesson of level.lessons) {
      assert.ok(!lessonIds.has(lesson.id)); lessonIds.add(lesson.id);
      for (const key of ['title', 'skill']) text(lesson[key], `${lesson.id}.${key}`);
      assert.ok(lesson.minutes > 0 && lesson.goals.length >= 2 && lesson.explanation.length >= 2);
      for (const part of lesson.explanation) { text(part.title, lesson.id); text(part.text, lesson.id); }
      assert.ok(lesson.vocabulary.length >= 3);
      for (const entry of lesson.vocabulary) for (const key of ['word', 'meaning', 'example']) text(entry[key], lesson.id);
      for (const material of [lesson.reading, lesson.listening]) { text(material.title, lesson.id); text(material.text, lesson.id); }
      text(lesson.reading.support, lesson.id); text(lesson.listening.focus, lesson.id);
      for (const key of ['writing', 'speaking', 'model']) text(lesson.production[key], lesson.id);
      assert.equal(lesson.production.rubric.length, 3);
      text(lesson.review.prompt, lesson.id); text(lesson.review.answer, lesson.id);
      questions(lesson.questions, 4, lesson.id);
      assert.ok(lesson.questions.some((q) => q.skill === 'reading'));
      assert.ok(lesson.questions.some((q) => q.skill === 'listening'));
    }
    const assessment = level.assessment;
    questions(assessment.questions, 8, level.id);
    assert.equal(assessment.questions.filter((q) => q.skill === 'reading').length, 4);
    assert.equal(assessment.questions.filter((q) => q.skill === 'listening').length, 4);
    assert.equal(assessment.rubric.length, 3);
    for (const key of ['writing', 'speaking', 'model']) text(assessment[key], level.id);
    for (const medium of ['reading', 'listening']) {
      assert.ok(!level.lessons.some((lesson) => lesson[medium].text === assessment[medium].text), `fresh ${level.id} ${medium} assessment`);
    }
  }
  assert.equal(ids.size, 240); assert.equal(lessonIds.size, 48);
});

test('supporting foundation links resolve and sources are safe references', () => {
  const foundations = { 'word-parts': sandbox.window.WORD_PARTS_LESSONS, phonics: sandbox.window.PHONICS_LESSONS };
  for (const level of catalog) {
    assert.ok(level.foundations.length >= 2); assert.ok(level.sources.length >= 1);
    for (const link of level.foundations) assert.ok(foundations[link.course]?.some((lesson) => lesson.id === link.lessonId), `${level.id} ${link.lessonId}`);
    for (const source of level.sources) { const url = new URL(source.url); assert.equal(url.protocol, 'https:'); assert.ok(!url.username && !url.password); text(source.label, level.id); }
  }
});

test('C1 includes sustained materials and independent assessment rather than word recognition alone', () => {
  const level = catalog.find((item) => item.id === 'c1');
  for (const lesson of level.lessons) {
    assert.ok(words(lesson.reading.text) >= 180, `${lesson.id}: reading too short`);
    assert.ok(words(lesson.listening.text) >= 115, `${lesson.id}: listening too short`);
  }
  assert.ok(words(level.assessment.reading.text) >= 350);
  assert.ok(words(level.assessment.listening.text) >= 200);
  const content = JSON.stringify(level).toLowerCase();
  for (const term of ['evidence', 'limitation', 'source', 'argument']) assert.ok(content.includes(term), term);
});

test('all authored records round-trip through the real progress engine', () => {
  let progress = engine.empty();
  const now = '2026-10-22T12:00:00.000Z';
  for (const level of catalog) {
    for (const lesson of level.lessons) {
      for (let index = 0; index < lesson.questions.length; index++) progress = engine.answer(progress, catalog, lesson.id, index, lesson.questions[index].answer, now);
      progress = engine.saveProduction(progress, catalog, lesson.id, { writing: 'An original written response.', speaking: 'A spoken response and reflection.', checks: [true, true, true] }, now);
    }
    progress = engine.assess(progress, catalog, level.id, { answers: level.assessment.questions.map((q) => q.answer), writing: 'A written assessment.', speaking: 'A spoken assessment.', checks: [true, false, true], transcriptUsed: true }, now);
    const summary = engine.summary(progress, catalog, level.id, now);
    assert.equal(summary.completed, 8); assert.equal(summary.due, 0); assert.equal(summary.latestScore, 8);
  }
  assert.deepEqual(engine.restore(JSON.parse(JSON.stringify(progress)), catalog), progress);
});
