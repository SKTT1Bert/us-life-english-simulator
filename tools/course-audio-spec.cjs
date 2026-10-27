// Build a reproducible fast-play catalog from existing lessons. No lesson IDs,
// wording, sentence boundaries or learning records are changed.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
function normalize(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
function key(text, example = false) { return `${example ? 'example' : 'text'}\n${normalize(text)}`; }
function collect() {
  const context = { window: {} };
  for (const file of ['wordParts', 'phonics', 'wordPartsStages', 'phonicsStages', 'pathwayStarter', 'pathwayAdvanced', 'learningPath', 'pictureLessons']) {
    vm.runInNewContext(fs.readFileSync(path.join(root, 'data', `${file}.js`), 'utf8'), context);
  }
  const data = context.window, entries = new Map();
  function add(text, example, source) {
    const normalized = normalize(text), lookup = key(normalized, example);
    if (!normalized) throw Error(`Empty recording: ${source}`);
    if (!entries.has(lookup)) entries.set(lookup, { id: crypto.createHash('sha256').update(lookup).digest('hex').slice(0, 20), text: normalized, example, sources: [] });
    entries.get(lookup).sources.push(source);
  }
  for (const course of ['WORD_PARTS_LESSONS', 'PHONICS_LESSONS']) {
    for (const lesson of data[course].filter(item => item.levelId === 'pre-a1')) {
      lesson.examples.forEach((example, i) => add(example.speak, true, `${lesson.id}:example:${i}`));
    }
  }
  const Listening = require('../listeningLab.js');
  for (const level of data.LEARNING_PATH.filter(item => item.id === 'pre-a1')) for (const lesson of level.lessons) {
    add(lesson.listening.text, false, `${lesson.id}:full`);
    Listening.sentences(lesson.listening.text).forEach((text, i) => add(text, false, `${lesson.id}:sentence:${i}`));
  }
  for (const lesson of data.PICTURE_LESSONS) {
    for (const word of lesson.words) add(word.word, true, `${lesson.id}:word:${word.id}`);
    for (const sentence of lesson.sentences) add(sentence.text, true, `${lesson.id}:sentence:${sentence.id}`);
  }
  return [...entries.values()];
}
module.exports = { collect, normalize, key };
if (require.main === module) console.log(JSON.stringify(collect(), null, 2));
