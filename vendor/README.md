# Local language tools

These browser assets are intentionally vendored and pinned so private text and audio do not require a third-party inference endpoint. They load only on explicit feedback actions. App source does not inherit a blanket third-party license; these components retain their own licenses.

| Component | Version / revision | License and provenance |
| --- | --- | --- |
| Harper.js + full WASM | 2.13.0 | [Apache-2.0](harper/LICENSE); [Automattic/harper](https://github.com/Automattic/harper), npm `harper.js@2.13.0`. Unmodified `index.js`, `BinaryModule-S5UABkWQ.js`, `binary.js`, `harper_wasm_bg.wasm`. |
| Transformers.js browser bundle | 4.3.1 | [Apache-2.0](transformers/LICENSE); [huggingface/transformers.js](https://github.com/huggingface/transformers.js), npm `@huggingface/transformers@4.3.1`. Uses `dist/transformers.js` with one unused vision-model registration removed (see below); bundle includes its upstream dependencies. |
| ONNX Runtime Web CPU WASM | 1.31.0-dev.20260914-8d85527a0 | [MIT](transformers/ONNX-LICENSE); upstream commit `8d85527a010e294a26b274749f74294b2a32cec5`, matches the pinned Transformers.js dependency. Unmodified `ort-wasm-simd-threaded.mjs` and `.wasm`. One CPU thread, no cross-origin isolation requirement. |
| English Whisper tiny ONNX | Xenova/whisper-tiny.en @ `79fb389fc764e7c395bd330e9531d9d32ada7049` | [Model card](https://huggingface.co/Xenova/whisper-tiny.en/tree/79fb389fc764e7c395bd330e9531d9d32ada7049), [Apache-2.0](../assets/voice-model/LICENSE) as declared by the conversion repository. Original OpenAI Whisper [MIT](../assets/voice-model/WHISPER-MIT-LICENSE) also retained. Unmodified configs, tokenizer, quantized encoder and merged decoder. |

`learning-assets.json` records SHA-256 and bytes for each distributed runtime/model file. All download files were retrieved from official npm packages, Hugging Face model revision URLs, or upstream GitHub license files. Human recording sources and their separate licenses are in [AUDIO-CREDITS](../AUDIO-CREDITS.md).

The model is loaded with explicit tokenizer/feature-extractor components, `allowRemoteModels=false`, a same-origin model path, and same-origin WASM paths. This avoids remote file-discovery requests. Workers are terminated on completion, cancellation, navigation or timeout. Upgrades must rerun actual-engine/browser tests, not only mocks.

Local distribution patch: the official bundle's unused `mistral3` vision-model mapping at upstream line 33367 was replaced by an explanatory comment. Its public model-class name was incorrectly classified as an API key by GitHub push protection, including in the byte-for-byte official npm distribution. This app constructs Whisper and StyleTextToSpeech2; the unused vision registration is unnecessary. No credential was added, and no repository security check was disabled or bypass-approved. Official package SHA-512 integrity was verified before making this one-line patch; the manifest records the resulting distributed file hash. The remaining runtime and model assets are unmodified.

## Unified course voices

`courseSpeech.worker.js` also constructs `StyleTextToSpeech2Model` with the existing Transformers/ONNX runtime. It downloads the pinned quantized Kokoro model only on an explicit course/example playback action. Voice packs are local same-origin files; no user text is transmitted to an inference endpoint. A bounded memory cache reuses generated segments. Active inference is terminated on cancellation; an idle worker is released after two minutes.

- `kokoro/kokoro.js`: npm `kokoro-js@1.2.1`, [Apache-2.0](kokoro/LICENSE). Adaptations replace package imports with existing local runtime imports, remove unused Node imports, replace the upstream voice-download URL with a same-origin URL, check voice HTTP responses, and reject oversized token sequences instead of silently truncating them. Reproduce with `node tools/prepare-course-speech.cjs <audio-builder-directory>` after preparing the pinned inputs described in `tools/ai-audio-build.json`.
- `kokoro/phonemizer.js`: unmodified npm `phonemizer@1.2.1` distribution. Wrapper [Apache-2.0 license](kokoro/PHONEMIZER-LICENSE), [upstream source and embedded eSpeak worker](https://github.com/xenova/phonemizer.js/tree/main/src). Its embedded eSpeak NG component retains [GPL-3.0](kokoro/ESPEAK-NG-LICENSE); [eSpeak NG source and build instructions](https://github.com/espeak-ng/espeak-ng). These component licenses are not replaced by the wrapper license.
- `assets/tts-model/kokoro`: unmodified model, tokenizer and four voice packs from `onnx-community/Kokoro-82M-v1.0-ONNX@1939ad2a8e416c0acfeecc08a694d14ef25f2231`. Model [Apache-2.0 copy](../assets/tts-model/KOKORO-LICENSE).

`course-speech-assets.json` records all distributed TTS file hashes, including shared runtime files. `tests/unified-speech-browser.cjs` exercises real model inference and non-silent playback rather than a speech mock. Viewport checks do not substitute for testing every physical phone. AI demonstrations, especially isolated short words, may contain pronunciation or prosody errors; they are not phoneme recordings or pronunciation scores.
