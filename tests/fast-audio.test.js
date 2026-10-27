const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const data = require('../data/courseAudio.js'), ai = require('../data/aiAudio.js');
const { collect } = require('../tools/course-audio-spec.cjs');
const { exampleText } = require('../englishSpeech.js');
const { createIndex } = require('../courseAudio.js');

test('every published beginner example, course sentence and gas-station item has four verified recordings', () => {
  const spec = collect(), lookup = createIndex(data, ai);
  assert.equal(data.version, 1);
  assert.equal(data.entries.length, spec.length);
  assert.equal(new Set(data.entries.map(item => item.id)).size, spec.length);
  for (const item of spec) for (const voice of ai.voices) {
    const text = item.example ? exampleText(item.text, voice.id) : item.text;
    const file = lookup.find(text, voice.id);
    assert.ok(file, `${voice.id}: ${text}`);
    assert.ok(file.src.startsWith(`assets/course-audio/${voice.id}/`));
    const bytes = fs.readFileSync(path.join(__dirname, '..', file.src));
    assert.equal(bytes.length, file.bytes, file.src);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256, file.src);
    assert.ok(file.duration >= 0.15 && file.duration <= 35, file.src);
    assert.ok(file.bytes < 300000, 'a single beginner request must stay small');
  }
});

test('lookup reuses existing AI recordings and matches only the exact normalized spoken text and requested voice', () => {
  const lookup = createIndex(data, ai);
  for (const clip of ai.clips) for (const voice of ai.voices) {
    assert.equal(lookup.find(`  ${clip.text.replace(/ /g, '  ')}  `, voice.id).src, clip.variants[voice.id].src);
  }
  assert.equal(lookup.find('cat', 'bf_emma'), null, 'a teaching cue must not leak into dictation');
  assert.ok(lookup.find(exampleText('cat', 'bf_emma'), 'bf_emma'));
  assert.equal(lookup.find('cat.', 'af_nicole'), null, 'do not discard punctuation or alter requested text');
  assert.equal(lookup.find('A brand new personal sentence.', 'af_nicole'), null);
  assert.equal(lookup.find('cat', 'unknown'), null);
});
