const test = require('node:test');
const assert = require('node:assert/strict');
const items = require('../data/learningDiagnostic.js');
const { score } = require('../learningDiagnostic.js');

test('starting point data has 24 original stable questions with six balanced stages', () => {
  assert.equal(items.length, 24); assert.equal(new Set(items.map((item) => item.id)).size, 24);
  for (const level of ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1']) assert.equal(items.filter((item) => item.levelId === level).length, 4);
  for (const item of items) {
    assert.match(item.id, /^start-v1-(pre-a1|a1|a2|b1|b2|c1)-[1-4]$/);
    assert.ok(item.prompt.length > 10 && item.explanation.length > 20);
    assert.equal(item.options.length, 3); assert.equal(new Set(item.options).size, 3);
    assert.ok(item.answer >= 0 && item.answer < item.options.length);
  }
});
test('no answer evidence routes to the first stage without awarding achievement', () => {
  const result = score(Array(24).fill(null)); assert.equal(result.recommendedLevelId, 'pre-a1'); assert.equal(result.correct, 0); assert.equal(result.answered, 0); assert.equal(result.allSupported, false);
});
test('a gap in earlier evidence is not hidden by correct advanced answers', () => {
  const answers = items.map((item) => item.answer); answers[4] = (answers[4] + 1) % 3; answers[5] = (answers[5] + 1) % 3;
  const result = score(answers); assert.equal(result.recommendedLevelId, 'a1'); assert.equal(result.stages.at(-1).supported, true);
});
test('three correct plus a skipped question do not establish a fully attempted stage', () => {
  const answers = items.map((item) => item.answer); answers[11] = null; assert.equal(score(answers).recommendedLevelId, 'a2');
  answers[11] = (items[11].answer + 1) % 3; assert.equal(score(answers).recommendedLevelId, 'c1');
});
test('all correct answers recommend trying C1 without inventing a higher level', () => {
  const result = score(items.map((item) => item.answer)); assert.equal(result.recommendedLevelId, 'c1'); assert.equal(result.correct, 24); assert.equal(result.allSupported, true); assert.equal('certifiedLevel' in result, false);
});
test('invalid, sparse and out-of-range saved answers are rejected', () => {
  for (const answers of [null, [], Array(24), Array(24).fill(9), Array(24).fill('0'), Array(24).fill(false)]) assert.throws(() => score(answers));
});
test('critical interpretation questions preserve scope and distinguish conditions and evidence', () => {
  const correct = (id) => { const item = items.find((q) => q.id === id); return item.options[item.answer]; };
  assert.match(correct('start-v1-b2-2'), /associated in this survey/);
  assert.match(correct('start-v1-c1-1'), /does not, by itself, establish equivalence/);
  assert.match(correct('start-v1-c1-3'), /different retention intervals/);
  assert.match(correct('start-v1-a2-4'), /latest day/);
});
