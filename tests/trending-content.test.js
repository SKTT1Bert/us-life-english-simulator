const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadContent() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/expressions.js'), 'utf8'), context);
  const historical = JSON.stringify(context.window.EXPRESSIONS);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data/trendingExpressions.js'), 'utf8'), context);
  return { historical, builtIn: context.window.EXPRESSIONS, trending: context.window.TRENDING_EXPRESSIONS };
}

const canonical = (phrase) => phrase.normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/[.!?]+$/g, '').replace(/\s+/g, ' ').trim();

test('contemporary pack adds content without changing the historical 306 expressions', () => {
  const { historical, builtIn, trending } = loadContent();
  assert.equal(builtIn.length, 306);
  assert.equal(JSON.stringify(builtIn), historical);
  assert.ok(Array.isArray(trending) && trending.length >= 10);
  const combined = [...builtIn, ...trending];
  assert.equal(new Set(combined.map((item) => item.id)).size, combined.length, 'IDs must stay globally unique');
  // The historical pack intentionally repeats "I'm looking for..." in two contexts.
  // New content must not introduce another existing or internally duplicated phrase.
  const phrases = new Set(builtIn.map((item) => canonical(item.phrase)));
  for (const item of trending) {
    const phrase = canonical(item.phrase);
    assert.equal(phrases.has(phrase), false, `${item.id} duplicates an existing phrase`);
    phrases.add(phrase);
  }
});

test('new expressions supply teachable context and evidence with stable identifiers', () => {
  const { trending } = loadContent();
  for (const item of trending) {
    assert.match(item.id, /^[a-z][a-z0-9-]+$/);
    for (const key of ['phrase', 'meaning_cn', 'example', 'example_cn', 'usage_note', 'neutral_alternative', 'source_label']) {
      assert.equal(typeof item[key], 'string', `${item.id}.${key}`);
      assert.ok(item[key].trim().length > 0, `${item.id}.${key} cannot be blank`);
    }
    assert.equal(item.category, '流行口语');
    assert.ok(['A1', 'A2', 'B1', 'B2'].includes(item.level));
    assert.ok(Array.isArray(item.tags) && item.tags.includes('contemporary'));
    assert.ok(['朋友聊天', '网络语境'].includes(item.register));
    const source = new URL(item.source_url);
    assert.equal(source.protocol, 'https:');
    assert.ok(source.hostname.includes('.'));
    assert.match(item.verified_at, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(item.verified_at).toISOString().slice(0, 10), item.verified_at);
  }
});
