import { WhisperTokenizer, WhisperFeatureExtractor, WhisperProcessor, WhisperForConditionalGeneration, AutomaticSpeechRecognitionPipeline, env } from './vendor/transformers/transformers.js';
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL('./assets/voice-model/', import.meta.url).href;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.wasmPaths = {
  mjs: new URL('./vendor/transformers/ort-wasm-simd-threaded.mjs', import.meta.url).href,
  wasm: new URL('./vendor/transformers/ort-wasm-simd-threaded.wasm', import.meta.url).href,
};
let transcriber;
self.onmessage = async ({ data }) => {
  try {
    if (!transcriber) {
      const options = {
      dtype: 'q8', device: 'wasm', progress_callback: info => {
        if (info.status === 'progress') self.postMessage({ id: data.id, progress: Math.round(info.progress) });
      }
      };
      // Explicit components keep model discovery entirely on our own origin.
      const [tokenizerJSON, tokenizerConfig, featureConfig, model] = await Promise.all([
        fetch(new URL('whisper-tiny.en/tokenizer.json', env.localModelPath)).then(r => { if (!r.ok) throw Error('Tokenizer unavailable'); return r.json(); }),
        fetch(new URL('whisper-tiny.en/tokenizer_config.json', env.localModelPath)).then(r => { if (!r.ok) throw Error('Tokenizer configuration unavailable'); return r.json(); }),
        fetch(new URL('whisper-tiny.en/preprocessor_config.json', env.localModelPath)).then(r => { if (!r.ok) throw Error('Audio configuration unavailable'); return r.json(); }),
        WhisperForConditionalGeneration.from_pretrained('whisper-tiny.en', options)
      ]);
      const tokenizer = new WhisperTokenizer(tokenizerJSON, tokenizerConfig);
      const processor = new WhisperProcessor({}, { tokenizer, feature_extractor: new WhisperFeatureExtractor(featureConfig) }, null);
      transcriber = new AutomaticSpeechRecognitionPipeline({ task: 'automatic-speech-recognition', tokenizer, processor, model });
    }
    const output = await transcriber(data.audio, { max_new_tokens: 160, return_timestamps: false });
    self.postMessage({ id: data.id, text: output.text.trim(), engine: 'Whisper tiny.en (79fb389)' });
  } catch (error) { console.error('Speech engine unavailable:', error.stack); transcriber = null; self.postMessage({ id: data.id, error: '本机语音转写暂时不可用。可以保留录音，改为输入文字继续练习。' }); }
};
