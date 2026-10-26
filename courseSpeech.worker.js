import { KokoroTTS } from './vendor/kokoro/kokoro.js';
import { StyleTextToSpeech2Model, PreTrainedTokenizer, env } from './vendor/transformers/transformers.js';

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL('./assets/tts-model/', import.meta.url).href;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.wasmPaths = {
  mjs: new URL('./vendor/transformers/ort-wasm-simd-threaded.mjs', import.meta.url).href,
  wasm: new URL('./vendor/transformers/ort-wasm-simd-threaded.wasm', import.meta.url).href,
};
let engine;
const json = async file => { const r = await fetch(new URL(`kokoro/${file}`, env.localModelPath)); if (!r.ok) throw Error('Speech resource unavailable'); return r.json(); };
self.onmessage = async ({ data }) => {
  try {
    if (!['af_nicole', 'af_heart', 'am_michael', 'bf_emma'].includes(data.voice)) throw Error('Unknown voice');
    if (typeof data.text !== 'string' || !data.text.trim() || data.text.length > 420) throw Error('Invalid speech segment');
    if (!engine) {
      const [model, tokenizer, config] = await Promise.all([
        StyleTextToSpeech2Model.from_pretrained('kokoro', { dtype: 'q8', device: 'wasm', progress_callback: p => {
          if (p.status === 'progress') self.postMessage({ id: data.id, progress: Math.round(p.progress) });
        } }), json('tokenizer.json'), json('tokenizer_config.json'),
      ]);
      engine = new KokoroTTS(model, new PreTrainedTokenizer(tokenizer, config));
    }
    self.postMessage({ id: data.id, generating: true });
    const result = await engine.generate(data.text, { voice: data.voice, speed: data.voice === 'af_nicole' ? 0.96 : 1 });
    self.postMessage({ id: data.id, samples: result.audio, sampleRate: result.sampling_rate }, [result.audio.buffer]);
  } catch (error) {
    console.error('Local course speech unavailable:', error.message);
    engine = null;
    self.postMessage({ id: data.id, error: error.message === 'Speech segment exceeds token limit' ? '这段内容的读音过长，请拆成更短的句子后重试。' : 'AI 朗读暂时不可用。请重试，或在“朗读设置”中改用设备朗读。' });
  }
};
