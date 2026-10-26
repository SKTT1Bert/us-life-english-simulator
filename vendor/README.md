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

Local distribution patch: the official bundle's unused `mistral3` vision-model mapping at upstream line 33367 was replaced by an explanatory comment. Its public model-class name was incorrectly classified as an API key by GitHub push protection, including in the byte-for-byte official npm distribution. This app only constructs Whisper; the unused registration is unnecessary. No credential was added, and no repository security check was disabled or bypass-approved. Official package SHA-512 integrity was verified before making this one-line patch; the manifest records the resulting distributed file hash. The remaining runtime and model assets are unmodified.
