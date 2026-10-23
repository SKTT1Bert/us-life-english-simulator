const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.createContext(context);
for (const file of ['scenarios', 'pictureLessons', 'sceneLessons', 'sceneLessonsCivic', 'sceneLessonsCare', 'sceneLessonsServices']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'data', `${file}.js`), 'utf8'), context);
}
const {PICTURE_LESSONS: lessons, SCENARIO_PACKS: places} = context.window;
const unique = (values, message) => assert.equal(new Set(values).size, values.length, message);
unique(lessons.map(l => l.id), 'Course IDs must be unique');
unique(lessons.map(l => l.placeId), 'Each dialogue place must have exactly one shared picture course');
assert.deepEqual(lessons.map(l => l.placeId).sort(), places.map(p => p.id).sort(), 'Every dialogue place needs a picture course');

for (const lesson of lessons) {
  const label = lesson.placeId;
  for (const key of ['title', 'english', 'description', 'imageAlt', 'imageAltEnglish']) {
    assert.ok(lesson[key]?.trim(), `${label}: missing ${key}`);
  }
  for (const asset of [lesson.image, lesson.thumbnail].filter(Boolean)) {
    assert.ok(asset.startsWith('assets/') && !asset.includes('..'), `${label}: use a local asset`);
    assert.ok(fs.statSync(path.join(root, asset)).size > 0, `${label}: missing ${asset}`);
  }
  assert.ok(lesson.words.length >= 10 && lesson.sentences.length >= 8 && lesson.exercises.length >= 4, `${label}: complete course`);
  for (const key of ['words', 'sentences', 'exercises']) unique(lesson[key].map(item => item.id), `${label}: duplicate ${key} IDs`);
  const words = new Map(lesson.words.map(word => [word.id, word]));
  assert.ok(Object.keys(lesson.positions).length >= 6, `${label}: enough objects to explore`);
  for (const [id, point] of Object.entries(lesson.positions)) {
    assert.ok(words.has(id), `${label}: hotspot must refer to a word`);
    assert.ok(point.length === 2 && point.every(n => Number.isFinite(n) && n >= 0 && n <= 100), `${label}: invalid hotspot position`);
  }
  for (const word of lesson.words) {
    assert.ok(word.word && word.meaning && word.note && /^\/.+\/$/.test(word.ipa), `${label}: complete vocabulary entry ${word.id}`);
    assert.ok(lesson.sentences.some(sentence => sentence.wordIds.includes(word.id)), `${label}: ${word.id} needs an example sentence`);
  }
  for (const sentence of lesson.sentences) {
    assert.ok(sentence.text && sentence.translation && sentence.wordIds.length, `${label}: complete example`);
    for (const id of sentence.wordIds) assert.ok(words.has(id), `${label}: unknown example word ${id}`);
  }
  for (const exercise of lesson.exercises) {
    assert.ok(exercise.before && exercise.after && exercise.translation && exercise.hint && exercise.explanation, `${label}: complete exercise ${exercise.id}`);
    assert.ok(Array.isArray(exercise.acceptedAnswers) && exercise.answer.trim(), `${label}: valid accepted answers`);
    assert.ok(lesson.words.some(word => word.word.toLowerCase() === exercise.answer.toLowerCase()), `${label}: answer must be taught ${exercise.answer}`);
  }
}
console.log(`${lessons.length} scenes: coverage, assets, vocabulary, examples and drills verified`);
