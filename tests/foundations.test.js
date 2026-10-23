const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../foundationProgress.js');
const sandbox = { window: {} };
for (const file of ['wordParts', 'phonics', 'wordPartsStages', 'phonicsStages']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../data/${file}.js`), 'utf8'), sandbox);
const catalog = { 'word-parts': sandbox.window.WORD_PARTS_LESSONS, phonics: sandbox.window.PHONICS_LESSONS, stages: { 'word-parts': sandbox.window.WORD_PARTS_STAGES, phonics: sandbox.window.PHONICS_STAGES } };
const copy = (value) => JSON.parse(JSON.stringify(value));
const first = catalog['word-parts'][0];

test('both course routes contain 48 structured lessons and 144 meaningful questions', () => {
  const ids = new Set();
  const questions = new Set();
  for (const lessons of [catalog['word-parts'], catalog.phonics]) {
    assert.equal(lessons.length, 48);
    assert.ok(new Set(lessons.map((lesson) => lesson.stage)).size >= 4);
    for (const lesson of lessons) {
      assert.match(lesson.id, /^[a-z][a-z0-9-]+$/);
      assert.ok(!ids.has(lesson.id), `duplicate lesson ${lesson.id}`); ids.add(lesson.id);
      for (const key of ['title', 'subtitle', 'intro', 'duration', 'stage', 'tip']) assert.ok(typeof lesson[key] === 'string' && lesson[key].trim());
      assert.ok(lesson.goals.length >= 2);
      assert.ok(lesson.steps.length >= 3);
      assert.ok(lesson.examples.length >= 3);
      for (const example of lesson.examples) for (const key of ['word', 'breakdown', 'meaning', 'note', 'speak']) assert.ok(typeof example[key] === 'string' && example[key].trim(), `${lesson.id} example ${key}`);
      assert.equal(lesson.quizzes.length, 3);
      assert.deepEqual(lesson.quiz, lesson.quizzes[0]);
      for (const quiz of lesson.quizzes) {
        assert.ok(!questions.has(quiz.question), `repeated prompt ${quiz.question}`); questions.add(quiz.question);
        assert.ok(quiz.question.trim() && quiz.explanation.trim());
        assert.ok(quiz.options.length >= 3);
        assert.equal(new Set(quiz.options.map((option) => option.trim())).size, quiz.options.length);
        assert.ok(Number.isInteger(quiz.answer) && quiz.answer >= 0 && quiz.answer < quiz.options.length);
      }
      assert.ok(lesson.sources.length > 0);
      for (const source of lesson.sources) { const url = new URL(source.url); assert.equal(url.protocol, 'https:'); assert.ok(!url.username && !url.password && source.label.trim()); }
    }
  }
  assert.equal(questions.size, 288);
});

test('the original twelve lesson identities remain available', () => {
  for (const id of ['word-parts-basics', 'useful-prefixes', 'noun-suffixes', 'adjective-adverb-suffixes', 'roots-port-spect-struct', 'combine-and-check']) assert.ok(catalog['word-parts'].some((lesson) => lesson.id === id));
  for (const id of ['sounds-and-blending', 'short-vowels', 'digraphs-and-blends', 'silent-e', 'vowel-teams', 'syllables-stress-schwa']) assert.ok(catalog.phonics.some((lesson) => lesson.id === id));
});

test('old exports acquire empty course progress without fabricated results', () => {
  const result = engine.restore(undefined, catalog);
  assert.equal(result.courses['word-parts'].lessonId, null);
  assert.equal(engine.summary(result, 'word-parts', catalog['word-parts']).completed, 0);
  assert.equal(engine.summary(result, 'phonics', catalog.phonics).answered, 0);
});

test('visiting a lesson remembers location without counting practice', () => {
  const original = engine.empty();
  const result = engine.visit(original, catalog, 'word-parts', first.id);
  assert.equal(result.courses['word-parts'].lessonId, first.id);
  assert.equal(engine.lessonStatus(result, 'word-parts', first).answered, 0);
  assert.equal(original.courses['word-parts'].lessonId, null);
});

test('wrong-only retry retains correct answers and completion needs every answer correct', () => {
  let progress = engine.empty();
  const qs = engine.questions(first);
  progress = engine.answer(progress, catalog, 'word-parts', first.id, 0, qs[0].answer);
  progress = engine.answer(progress, catalog, 'word-parts', first.id, 1, (qs[1].answer + 1) % qs[1].options.length);
  progress = engine.answer(progress, catalog, 'word-parts', first.id, 2, qs[2].answer);
  assert.equal(engine.lessonStatus(progress, 'word-parts', first).complete, false);
  const before = copy(progress);
  progress = engine.retry(progress, catalog, 'word-parts', first.id, true);
  assert.deepEqual(progress.courses['word-parts'].records[first.id].answers, [qs[0].answer, null, qs[2].answer]);
  assert.notDeepEqual(progress, before);
  progress = engine.answer(progress, catalog, 'word-parts', first.id, 1, qs[1].answer);
  assert.equal(engine.lessonStatus(progress, 'word-parts', first).complete, true);
  assert.equal(engine.summary(progress, 'word-parts', catalog['word-parts']).completed, 1);
  assert.equal(engine.summary(progress, 'phonics', catalog.phonics).completed, 0);
  const restarted = engine.retry(progress, catalog, 'word-parts', first.id, false);
  assert.equal(engine.lessonStatus(restarted, 'word-parts', first).answered, 0);
  assert.equal(engine.lessonStatus(progress, 'word-parts', first).complete, true);
});

test('duplicate and out-of-range answers are rejected without changing prior evidence', () => {
  const progress = engine.answer(engine.empty(), catalog, 'word-parts', first.id, 0, 0);
  const before = copy(progress);
  assert.throws(() => engine.answer(progress, catalog, 'word-parts', first.id, 0, 1));
  assert.throws(() => engine.answer(progress, catalog, 'word-parts', first.id, 99, 0));
  assert.throws(() => engine.answer(progress, catalog, 'word-parts', first.id, 1, 99));
  assert.deepEqual(progress, before);
});

test('course progress round-trips and restore does not alias imported answer arrays', () => {
  const progress = engine.answer(engine.empty(), catalog, 'word-parts', first.id, 0, first.quiz.answer);
  const exported = copy(progress), restored = engine.restore(exported, catalog);
  assert.deepEqual(restored, exported);
  restored.courses['word-parts'].records[first.id].answers[0] = null;
  assert.equal(exported.courses['word-parts'].records[first.id].answers[0], first.quiz.answer);
});

test('malformed or future course payloads are rejected instead of becoming completion', () => {
  const valid = engine.answer(engine.empty(), catalog, 'word-parts', first.id, 0, first.quiz.answer);
  for (const mutate of [
    (value) => { value.version = 999; },
    (value) => { value.courses.unknown = {}; },
    (value) => { value.courses.phonics.lessonId = first.id; },
    (value) => { value.courses['word-parts'].records.missing = {}; },
    (value) => { value.courses['word-parts'].records[first.id].answers = [0]; },
    (value) => { value.courses['word-parts'].records[first.id].answers[1] = -1; },
    (value) => { value.courses['word-parts'].records[first.id].answers[1] = '0'; },
    (value) => { value.courses['word-parts'].records[first.id].updatedAt = 'yesterday'; }
  ]) { const bad = copy(valid); mutate(bad); assert.throws(() => engine.restore(bad, catalog)); }
});
