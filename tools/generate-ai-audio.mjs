import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const { KokoroTTS } = require('kokoro-js');
const { env } = require('@huggingface/transformers');

// Run from a separate builder directory with pinned dependencies and ./model.
// node /path/to/repository/tools/generate-ai-audio.mjs /path/to/repository
const root = path.resolve(process.argv[2] || (() => { throw new Error('Pass the output repository directory.'); })());
const spec = JSON.parse(fs.readFileSync(path.join(root, 'tools/ai-audio-script.json'), 'utf8'));
const build = JSON.parse(fs.readFileSync(path.join(root, 'tools/ai-audio-build.json'), 'utf8'));
for (const file of build.files) {
  const bytes = fs.readFileSync(path.resolve('model', file.path));
  if (bytes.length !== file.bytes || crypto.createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Model input does not match the pinned manifest: ${file.path}`);
  if (file.path.startsWith('voices/')) {
    const bundled = path.resolve(path.dirname(require.resolve('kokoro-js')), '..', file.path);
    if (!bytes.equals(fs.readFileSync(bundled))) throw new Error(`Bundled voice does not match the pinned manifest: ${file.path}`);
  }
}
if (process.argv.includes('--verify-only')) { console.log('Pinned model files and all four bundled voices verified.'); process.exit(0); }
env.allowRemoteModels = false;
env.localModelPath = path.resolve('model') + '/..';
env.useFSCache = false;
const tts = await KokoroTTS.from_pretrained(path.resolve('model'), { dtype: 'q8', device: 'cpu' });
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(path.dirname(require.resolve('lamejs/package.json')), 'lame.all.js'), 'utf8'), context);
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const result = { version: 1, generator: { name: 'Kokoro v1.0', package: 'kokoro-js 1.2.1', model: spec.model, revision: spec.modelRevision, source: spec.modelSource, license: spec.modelLicense }, voices: spec.voices, clips: [] };
let count = 0;
for (const clip of spec.clips) {
  const entry = { ...clip, synthetic: true, variants: {} };
  for (const voice of spec.voices) {
    const src = `assets/ai-audio/${voice.id}/${clip.id}.mp3`;
    const destination = path.join(root, src);
    const wav = await tts.generate(clip.text, { voice: voice.id, speed: 0.96 });
    const duration = wav.audio.length / wav.sampling_rate;
    if (duration < 1 || duration > 30) throw new Error(`Invalid duration ${clip.id}/${voice.id}: ${duration}`);
    const samples = new Int16Array(wav.audio.length);
    let energy = 0;
    for (let i = 0; i < samples.length; i++) { const value = Math.max(-1, Math.min(1, wav.audio[i])); samples[i] = Math.round(value * 32767); energy += value * value; }
    if (Math.sqrt(energy / samples.length) < 0.001) throw new Error(`Silent ${src}`);
    const encoder = new context.lamejs.Mp3Encoder(1, wav.sampling_rate, 64), chunks = [];
    for (let start = 0; start < samples.length; start += 1152) chunks.push(Buffer.from(encoder.encodeBuffer(samples.subarray(start, start + 1152))));
    chunks.push(Buffer.from(encoder.flush()));
    const bytes = Buffer.concat(chunks);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
    entry.variants[voice.id] = { src, duration: Math.round(duration * 1000) / 1000, bytes: bytes.length, sha256: sha(bytes) };
    console.log(`${++count}/96 ${clip.id} ${voice.id} ${duration.toFixed(1)}s`);
  }
  result.clips.push(entry);
  fs.writeFileSync('generation-progress.json', JSON.stringify(result, null, 2));
}
fs.writeFileSync(path.join(root, 'data/aiAudio.js'), `// AI-generated original learning passages. Stable IDs are shared across voices.\n(function(root){const data=${JSON.stringify(result, null, 2)};if(typeof module==='object'&&module.exports)module.exports=data;if(root)root.AI_AUDIO=data;})(typeof window!=='undefined'?window:globalThis);\n`);
console.log('Generated all 96 AI audio variants and integrity catalog.');
await tts.model.dispose();
