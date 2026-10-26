const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { splitText } = require('../englishSpeech.js');

test('speech chunking preserves long passages and bounds every model input without dropping the tail', () => {
  for (const text of ['cat', 'Hello! What is your name?', 'An academic discussion needs careful evidence. '.repeat(180), 'extraordinary'.repeat(90), 'a '.repeat(900)]) {
    const chunks = splitText(text);
    assert.ok(chunks.every(chunk => chunk.length > 0 && chunk.length <= 240));
    assert.equal(chunks.join('').replace(/\s/g, ''), text.replace(/\s/g, ''));
  }
  assert.deepEqual(splitText('  '), []);
});

test('voice changes update existing selectors and other tabs without writing learning records', () => {
  const data = require('../data/aiAudio.js'), writes = [], events = [], handlers = {}, selectors = [{ value: '' }, { value: '' }];
  const root = { AI_AUDIO: data, localStorage: { getItem: () => 'bf_emma', setItem: (key, value) => writes.push([key, value]) }, document: { querySelectorAll: () => selectors }, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } }, dispatchEvent: event => events.push(event), addEventListener: (type, fn) => { handlers[type] = fn; } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../audioVoices.js'), 'utf8'), { window: root });
  assert.equal(root.AudioVoices.current().id, 'bf_emma');
  root.AudioVoices.choose('af_nicole');
  assert.ok(selectors.every(node => node.value === 'af_nicole'));
  handlers.storage({ key: 'daily-english-audio-voice-v1', newValue: 'am_michael' });
  assert.equal(root.AudioVoices.current().id, 'am_michael');
  assert.deepEqual(writes, [['daily-english-audio-voice-v1', 'af_nicole']]);
  assert.equal(events.length, 2);
});

test('distributed speech resources match pinned hashes and remain below individual GitHub file limits', () => {
  const manifest = require('../vendor/course-speech-assets.json');
  assert.equal(manifest.modelRevision, '1939ad2a8e416c0acfeecc08a694d14ef25f2231');
  for (const file of manifest.files) {
    const bytes = fs.readFileSync(require('node:path').join(__dirname, '..', file.path));
    assert.equal(bytes.length, file.bytes, file.path);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
    assert.ok(bytes.length < 100 * 1024 * 1024);
  }
});
