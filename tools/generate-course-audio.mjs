// Run in the isolated builder used by generate-ai-audio.mjs:
// node /path/to/repository/tools/generate-course-audio.mjs /path/to/repository
// Reuses verified local weights; generation never requests a remote model.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const root = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw Error('Pass the repository directory.');
const local = createRequire(path.join(root, 'package.json'));
const { collect } = local('./tools/course-audio-spec.cjs');
const { exampleText } = local('./englishSpeech.js');
const build = local('./tools/ai-audio-build.json');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
for (const [name, version] of [['kokoro-js', build.kokoro], ['@huggingface/transformers', build.transformers], ['lamejs', '1.2.1']]) {
  const meta = JSON.parse(fs.readFileSync(path.resolve('node_modules', name, 'package.json')));
  if (meta.version !== version) throw Error(`Unpinned dependency ${name}`);
}
for (const file of build.files) {
  const bytes = fs.readFileSync(path.resolve('model', file.path));
  if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) throw Error(`Unverified model input ${file.path}`);
  if (file.path.startsWith('voices/')) {
    const bundled = path.resolve(path.dirname(require.resolve('kokoro-js')), '..', file.path);
    if (!bytes.equals(fs.readFileSync(bundled))) throw Error(`Unverified bundled voice ${file.path}`);
  }
}
const { KokoroTTS } = require('kokoro-js'), { env, StyleTextToSpeech2Model, AutoTokenizer } = require('@huggingface/transformers');
env.allowRemoteModels = false; env.localModelPath = path.resolve('model') + '/..'; env.useFSCache = false;
// Bound worker threads to avoid severe oversubscription in small CI containers.
const [model, tokenizer] = await Promise.all([
  StyleTextToSpeech2Model.from_pretrained(path.resolve('model'), { dtype: 'q8', device: 'cpu', session_options: { intraOpNumThreads: 2, interOpNumThreads: 1 } }),
  AutoTokenizer.from_pretrained(path.resolve('model'))
]);
const engine = new KokoroTTS(model, tokenizer);
const encoderContext = {};
vm.runInNewContext(fs.readFileSync(path.join(path.dirname(require.resolve('lamejs/package.json')), 'lame.all.js'), 'utf8'), encoderContext);
const progressPath = path.join(root, 'tools/course-audio-build-progress.json');
const previous = fs.existsSync(progressPath) ? JSON.parse(fs.readFileSync(progressPath)) : { entries: [] };
const result = { version: 1, generator: { model: build.model, revision: build.revision, kokoro: build.kokoro, transformers: build.transformers, encoder: build.encoder, sampleRate: 24000, bitrateKbps: 64 }, entries: [] };
const spec = collect(); let completed = 0;
try {
  for (const item of spec) {
    const entry = { ...item, variants: {} };
    const old = previous.entries.find(e => e.id === item.id);
    for (const voice of build.voices) {
      const src = `assets/course-audio/${voice}/${item.id}.mp3`, destination = path.join(root, src);
      const spokenText = item.example ? exampleText(item.text, voice) : item.text;
      const speed = voice === 'af_nicole' ? 0.96 : 1;
      const cached = old?.variants?.[voice];
      if (cached && cached.spokenText === spokenText && cached.speed === speed && fs.existsSync(destination) && hash(fs.readFileSync(destination)) === cached.sha256) entry.variants[voice] = cached;
      else {
        const wav = await engine.generate(spokenText, { voice, speed });
        const duration = wav.audio.length / wav.sampling_rate;
        if (duration < 0.15 || duration > 35 || wav.sampling_rate !== 24000) throw Error(`Invalid duration or sampling rate ${src}: ${duration}`);
        const samples = new Int16Array(wav.audio.length); let energy = 0;
        for (let i = 0; i < samples.length; i++) { const value = Math.max(-1, Math.min(1, wav.audio[i])); samples[i] = Math.round(value * 32767); energy += value * value; }
        if (Math.sqrt(energy / samples.length) < 0.001) throw Error(`Silent recording ${src}`);
        const encoder = new encoderContext.lamejs.Mp3Encoder(1, 24000, 64), chunks = [];
        for (let i = 0; i < samples.length; i += 1152) chunks.push(Buffer.from(encoder.encodeBuffer(samples.subarray(i, i + 1152))));
        chunks.push(Buffer.from(encoder.flush())); const bytes = Buffer.concat(chunks);
        fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, bytes);
        entry.variants[voice] = { src, spokenText, speed, duration: Math.round(duration * 1000) / 1000, bytes: bytes.length, sha256: hash(bytes) };
      }
      console.log(`${++completed}/${spec.length * build.voices.length} ${voice} ${item.text}`);
    }
    result.entries.push(entry);
    fs.writeFileSync(progressPath, JSON.stringify(result));
  }
  fs.writeFileSync(path.join(root, 'data/courseAudio.js'), `// Pre-rendered versions of existing course text; no new learning identities.\n(function(root){const data=${JSON.stringify(result)};if(typeof module==='object'&&module.exports)module.exports=data;if(root)root.COURSE_AUDIO=data;})(typeof window!=='undefined'?window:globalThis);\n`);
  fs.unlinkSync(progressPath);
  console.log(`COMPLETE: ${spec.length} texts, ${completed} files.`);
} finally { await engine.model.dispose(); }
