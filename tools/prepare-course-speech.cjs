// Run from the repository: node tools/prepare-course-speech.cjs <audio-builder>
// Requires the pinned, verified model used by generate-ai-audio.mjs and installed
// kokoro-js@1.2.1 / phonemizer@1.2.1. No network requests are made by this helper.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..'), builder = path.resolve(process.argv[2] || '.');
const build = require('./ai-audio-build.json');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
for (const input of build.files) {
  const bytes = fs.readFileSync(path.join(builder, 'model', input.path));
  if (digest(bytes) !== input.sha256 || bytes.length !== input.bytes) throw Error(`Unverified model input: ${input.path}`);
}
for (const name of ['kokoro-js', 'phonemizer']) {
  if (JSON.parse(fs.readFileSync(path.join(builder, 'node_modules', name, 'package.json'))).version !== '1.2.1') throw Error(`Wrong ${name} version`);
}
const output = relative => path.join(repo, relative);
fs.mkdirSync(output('vendor/kokoro'), { recursive: true });
fs.mkdirSync(output('assets/tts-model/kokoro/onnx'), { recursive: true });
fs.mkdirSync(output('assets/tts-model/kokoro/voices'), { recursive: true });
let source = fs.readFileSync(path.join(builder, 'node_modules/kokoro-js/dist/kokoro.js'), 'utf8');
for (const [before, after] of [
  ['from"@huggingface/transformers"', 'from"../transformers/transformers.js"'],
  ['from"phonemizer"', 'from"./phonemizer.js"'],
  ['import s from"path";import i from"fs/promises";', 'const s=null,i=null;'],
  ['`https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/${e}.bin`', 'new URL(`../../assets/tts-model/kokoro/voices/${e}.bin`,import.meta.url).href'],
  ['const r=await fetch(a),n=await r.arrayBuffer();', 'const r=await fetch(a);if(!r.ok)throw new Error("Voice unavailable");const n=await r.arrayBuffer();'],
  ['{input_ids:l}=this.tokenizer(n,{truncation:!0});return this.generate_from_ids(l,', '{input_ids:l}=this.tokenizer(n,{truncation:!1});if(l.dims.at(-1)>512)throw new Error("Speech segment exceeds token limit");return this.generate_from_ids(l,'],
]) { if (!source.includes(before)) throw Error('Runtime input does not match expected adapter'); source = source.replace(before, after); }
fs.writeFileSync(output('vendor/kokoro/kokoro.js'), source);
for (const [from, to] of [
  ['kokoro-js/LICENSE', 'LICENSE'], ['phonemizer/LICENSE', 'PHONEMIZER-LICENSE'], ['phonemizer/dist/phonemizer.js', 'phonemizer.js'],
]) fs.copyFileSync(path.join(builder, 'node_modules', from), output(`vendor/kokoro/${to}`));
for (const name of ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx', ...build.voices.map(voice => `voices/${voice}.bin`)]) fs.copyFileSync(path.join(builder, 'model', name), output(`assets/tts-model/kokoro/${name}`));
fs.copyFileSync(output('assets/ai-audio/KOKORO-LICENSE'), output('assets/tts-model/KOKORO-LICENSE'));
function walk(dir) { return fs.readdirSync(output(dir), { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(`${dir}/${item.name}`) : [`${dir}/${item.name}`]); }
const files = [...walk('assets/tts-model'), ...walk('vendor/kokoro'), 'vendor/transformers/transformers.js', 'vendor/transformers/ort-wasm-simd-threaded.mjs', 'vendor/transformers/ort-wasm-simd-threaded.wasm'].sort().map(file => { const bytes = fs.readFileSync(output(file)); return { path: file, bytes: bytes.length, sha256: digest(bytes) }; });
fs.writeFileSync(output('vendor/course-speech-assets.json'), JSON.stringify({ model: build.model, modelRevision: build.revision, kokoro: '1.2.1', phonemizer: '1.2.1', transformers: '4.3.1', files }, null, 2) + '\n');
console.log(`Prepared ${files.length} verified resource files (${files.reduce((n, f) => n + f.bytes, 0)} bytes).`);
