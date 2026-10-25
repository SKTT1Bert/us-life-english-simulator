const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const lab = require('../listeningLab.js');
const context = { window: {} };
for (const name of ['pathwayStarter', 'pathwayAdvanced', 'learningPath']) vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../data/${name}.js`), 'utf8'), context);
const pathway = JSON.parse(JSON.stringify(context.window.LEARNING_PATH));

test('all 48 original listening materials are available with deterministic sentence identities', () => {
  const catalog = lab.catalog(pathway);
  assert.equal(catalog.length, 48);
  assert.deepEqual([...new Set(catalog.map((item) => item.levelId))], ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1']);
  assert.deepEqual(lab.catalog(JSON.parse(JSON.stringify(pathway))), catalog);
  const ids = new Set();
  for (const item of catalog) {
    const original = pathway.find((stage) => stage.id === item.levelId).lessons.find((lesson) => lesson.id === item.lessonId);
    assert.ok(item.segments.length > 1, item.lessonId);
    assert.equal(item.segments.map((segment) => segment.text).join(' '), original.listening.text.replace(/\s+/g, ' ').trim(), item.lessonId);
    for (const [index, segment] of item.segments.entries()) {
      assert.equal(segment.id, `${item.lessonId}-s${index + 1}`);
      assert.ok(!ids.has(segment.id)); ids.add(segment.id);
      assert.ok(segment.tokenCount > 0 && segment.tokenCount <= 512);
      assert.equal(lab.evaluate(segment.text, segment.text).exact, true);
    }
  }
  assert.ok(ids.size > 300, 'Substantive sentence-level coverage');
});

test('sentence segmentation preserves abbreviations, decimals, quotations, and letter spellings', () => {
  assert.deepEqual(lab.sentences('Dr. Lee paid 3.50 dollars. "Is that right?" Yes!'), ['Dr. Lee paid 3.50 dollars.', '"Is that right?"', 'Yes!']);
  assert.deepEqual(lab.sentences('U.S. students arrived. Use e.g. a bus. Wait... Then leave.'), ['U.S. students arrived.', 'Use e.g. a bus.', 'Wait...', 'Then leave.']);
  assert.deepEqual(lab.sentences('My name is Eva. E-V-A. Repeat, please.'), ['My name is Eva.', 'E-V-A.', 'Repeat, please.']);
  assert.deepEqual(lab.sentences('One line\nAnother part without a full stop'), ['One line Another part without a full stop']);
  assert.deepEqual(lab.sentences(''), []);
});

test('dictation comparison ignores case and punctuation but preserves contraction and number meaning', () => {
  assert.equal(lab.evaluate('I’m ready. Are you?', "I'M ready, are YOU!").exact, true);
  assert.equal(lab.evaluate('The cost is 1,000.50 dollars.', 'The cost is 1000.50 dollars').exact, true);
  assert.equal(lab.evaluate("I can't go.", 'I can go.').exact, false);
  assert.equal(lab.evaluate('The cost is 3.50.', 'The cost is 350.').exact, false);
  assert.equal(lab.evaluate('I am here.', "I'm here.").exact, false, 'No semantic equivalence claim');
  assert.equal(lab.evaluate('Café is open.', 'CAFÉ is open!').exact, true);
});

test('extra words are never marked exact even when all reference words match', () => {
  const result = lab.evaluate('I am here.', 'I am right here.');
  assert.equal(result.matchedTokens, 3);
  assert.equal(result.tokenCount, 3);
  assert.equal(result.exact, false);
  assert.equal(result.alignment.filter((part) => part.kind === 'extra').length, 1);
  assert.equal(lab.evaluate('I am here.', 'here am I').exact, false);
});

test('word feedback distinguishes missing, changed and repeated extra tokens', () => {
  const changed = lab.evaluate('Bring your book.', 'Bring my book.');
  assert.deepEqual(changed.alignment.find((part) => part.kind === 'changed'), {kind: 'changed', expected: 'your', actual: 'my'});
  assert.equal(lab.evaluate('Bring your blue book.', 'Bring your book.').alignment.some((part) => part.kind === 'missing' && part.expected === 'blue'), true);
  assert.equal(lab.evaluate('Bring your book.', 'Bring your your book.').alignment.some((part) => part.kind === 'extra'), true);
  assert.equal(lab.evaluate('Hello there.', '').matchedTokens, 0);
  assert.throws(() => lab.evaluate('', 'hello'), /暂无/);
  assert.throws(() => lab.evaluate('hello', 'word '.repeat(513)), /512/);
});

test('difficult review uses the latest saved attempt and does not infer independent listening from text alone', () => {
  const items = [{ segments: [{id: 's1'}, {id: 's2'}, {id: 's3'}, {id: 's4'}, {id: 's5'}] }];
  const original = { id: 'a', segmentId: 's1', answeredAt: '2026-10-25T12:00:00.000Z', exact: false, revealed: false, shadow: 'not-yet', listenCount: 1 };
  const corrected = { ...original, id: 'b', answeredAt: '2026-10-25T13:00:00.000Z', exact: true, shadow: 'independent' };
  const assisted = { ...corrected, id: 'c', segmentId: 's2', revealed: true };
  const noAudio = { ...corrected, id: 'd', segmentId: 's3', listenCount: 0 };
  const extraWords = { ...corrected, id: 'e', segmentId: 's4', exact: false, matchedTokens: 3, tokenCount: 3 };
  const attempts = [corrected, assisted, original, noAudio, extraWords];
  assert.equal(lab.latestAttempts(attempts).get('s1').id, 'b');
  assert.deepEqual(lab.summary(items, attempts), { total: 5, attempted: 4, independent: 1, needsPractice: 3 });
  assert.equal(lab.needsPractice(null), false, 'Unanswered sentences are not mistakes');
  assert.equal(lab.needsPractice(noAudio), true);
});
