const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const data = require('../data/aiAudio.js');
const spec = require('../tools/ai-audio-script.json');
const human = require('../data/humanAudio.js');
const Lab = require('../listeningLab.js');
const Practice = require('../skillPractice.js');
const Studio = require('../learningStudioProgress.js');
const Progress = require('../skillProgress.js');
const Sync = require('../syncMerge.js');

test('four labeled AI voices cover 24 original passages and 96 complete, distinct recordings', () => {
  assert.equal(data.voices.length, 4); assert.equal(data.clips.length, 24);
  assert.equal(data.voices[0].id, 'af_nicole');
  assert.equal(data.generator.revision, spec.modelRevision);
  for (const level of Practice.LEVELS) assert.equal(data.clips.filter(c => c.levelId === level).length, 4);
  const hashes = new Set();
  for (const clip of data.clips) {
    const original = spec.clips.find(c => c.id === clip.id);
    for (const key of ['text', 'translation', 'focus', 'levelId']) assert.equal(clip[key], original[key]);
    assert.equal(clip.synthetic, true);
    assert.deepEqual(Object.keys(clip.variants), data.voices.map(v => v.id));
    for (const voice of data.voices) {
      const variant = clip.variants[voice.id];
      assert.equal(variant.src, `assets/ai-audio/${voice.id}/${clip.id}.mp3`);
      const bytes = fs.readFileSync(path.join(__dirname, '..', variant.src));
      assert.equal(bytes.length, variant.bytes);
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), variant.sha256);
      assert.ok(variant.duration >= 1 && variant.duration <= 30);
      assert.ok(!hashes.has(variant.sha256), 'Each variant must be an actual distinct audio file'); hashes.add(variant.sha256);
    }
  }
  assert.equal(hashes.size, 96);
});

test('AI catalog additions leave every old material identity untouched and share IDs across voice choices', () => {
  const old = Lab.allCatalog([], human), added = Lab.allCatalog([], human, data.clips);
  assert.deepEqual(added.slice(0, old.length), old);
  assert.equal(new Set(added.map(x => x.lessonId)).size, 48);
  const catalog = Lab.syntheticCatalog(data.clips);
  for (const [i, item] of catalog.entries()) {
    assert.equal(item.segments[0].id, `${data.clips[i].id}-s1`);
    assert.equal(item.segments[0].text, data.clips[i].text);
    assert.equal(item.human, undefined);
  }
  assert.deepEqual(Practice.catalog([], human), Practice.catalog([], [...human, ...data.clips]).slice(0, 24));
  assert.ok(Practice.catalog([], data.clips).every(t => t.title.startsWith('AI 跟读')));
});

test('voice preference persists separately; invalid or unavailable storage never changes progress', () => {
  const storage = new Map([['daily-english-lab-state-v1', 'PRIVATE_PROGRESS'], ['daily-english-audio-voice-v1', 'unknown']]);
  const scope = { window: { AI_AUDIO: data, HUMAN_AUDIO: human, localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../audioVoices.js'), 'utf8'), scope);
  const api = scope.window.AudioVoices;
  assert.equal(api.current().id, 'af_nicole');
  const old = api.resolve(data.clips[0]); api.choose('bf_emma');
  const next = api.resolve(data.clips[0]);
  assert.equal(old.id, next.id); assert.notEqual(old.src, next.src);
  assert.equal(storage.get('daily-english-lab-state-v1'), 'PRIVATE_PROGRESS');
  assert.throws(() => api.choose('Amouranth'));
  scope.window.localStorage.setItem = () => { throw Error('quota'); };
  assert.equal(api.choose('af_heart'), false); assert.equal(api.current().id, 'af_heart');
  assert.equal(api.resolve(human[0]), human[0]);
});

test('new listening and speaking events restore and merge through the existing encrypted-sync data model', () => {
  const listening = Lab.allCatalog([], human, data.clips), tasks = Practice.catalog([], [...human, ...data.clips]);
  const studios = { diagnostic: [], listening }, skills = { tasks, forms: [] };
  const clip = data.clips[0], segment = listening.find(x => x.lessonId === clip.id).segments[0];
  const before = { schemaVersion: 3, learned: ['old-expression'], favorites: [], marketLearned: [], marketFavorites: [], sessions: {}, theme: 'light', dailyPlan: null,
    quiz: {correct: 2, total: 4}, marketQuiz: {correct:0,total:0}, scenarios:{runs:0,completed:0,success:0}, marketScenarios:{runs:0,completed:0,success:0},
    foundationProgress: {version:2,courses:Object.fromEntries(['word-parts','phonics'].map(id=>[id,{levelId:'pre-a1',lessonId:null,records:{},assessments:{}}]))},
    pathwayProgress: {version:1,levelId:'pre-a1',lessonId:null,lessons:{},assessments:{}}, learningStudio: Studio.empty(), skillWorkshop: Progress.empty() };
  const now = '2026-10-26T02:00:00.000Z';
  const learningStudio = Studio.apply(before.learningStudio, { type: 'listening', attempt: { lessonId: clip.id, segmentId: segment.id, matchedTokens: segment.tokenCount, tokenCount: segment.tokenCount, exact: true, revealed: false, shadow: 'independent', listenCount: 2 } }, studios, { id: '11111111-1111-4111-8111-111111111111', now });
  const skillWorkshop = Progress.append(before.skillWorkshop, 'attempts', { taskId: clip.id, source: 'typed', original: clip.text, text: clip.text, rubric: [true,true,true], feedback: null, parentId: null, duration: null }, skills, { id: '22222222-2222-4222-8222-222222222222', now });
  const common = Sync.create(before, 'device-a');
  const merged = Sync.materialize(Sync.merge(Sync.capture(common, {...before,learningStudio}, 'device-a'), Sync.capture(common, {...before,skillWorkshop}, 'device-b')));
  assert.deepEqual(Studio.restore(merged.learningStudio, studios), learningStudio);
  assert.deepEqual(Progress.restore(merged.skillWorkshop, skills), skillWorkshop);
  assert.deepEqual(merged.learned, before.learned); assert.deepEqual(merged.quiz, before.quiz);
});
