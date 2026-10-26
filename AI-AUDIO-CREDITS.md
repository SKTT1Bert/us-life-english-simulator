# AI 学习音频与声线说明

这组音频使用原创练习文本和 Kokoro v1.0 通用声线生成，**不是真人录音，也不代表任何名人本人、授权代言或特定真人的声音复刻**。

| 界面名称 | 模型声线 | 口音 |
| --- | --- | --- |
| 轻柔美式女声（默认） | `af_nicole` | 美式英语 |
| 清晰美式女声 | `af_heart` | 美式英语 |
| 沉稳美式男声 | `am_michael` | 美式英语 |
| 英式女声 | `bf_emma` | 英式英语 |

轻柔声线的语速与停顿通常更舒缓。想先听清词语边界时，可以切换清晰声线；不同声音的试听偏好因人而异。AI 合成可能出现不自然的重音或停顿，不能把每个发音细节当作唯一标准。

24 段原创材料分布在 Pre-A1、A1、A2、B1、B2、C1，每段均有四种声音，共 96 个音频文件。阶段标签仅表示练习目标，不是经过校准的难度等级。原有 24 段真人录音的来源及许可见 [真人音频说明](AUDIO-CREDITS.md)。

在“练习 → 精听与跟读”选择“AI 合成 · 多种声线”，也可进入对应的口语反馈任务。换声线只更换示范音频，不清空听写草稿，不拆分或重复计算同一材料的学习进度。声线偏好保存在当前浏览器；学习结果继续使用原来的导出、导入及加密同步。不同设备可以各自选择喜欢的声音。

音频提前生成，点击播放才从本站加载。播放不需要额外下载生成模型，不向语音服务发送个人文本。未保存的原始录音仍只留在当前页面，遵循现有口语工坊的隐私规则。

## 来源与制作记录

- 模型及声线：[Hexgrad / Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)，[官方声线说明](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md)。模型按 Apache-2.0 许可提供；[许可副本](assets/ai-audio/KOKORO-LICENSE)。该许可对应模型与软件，不是“真人授权录音”的声明。
- ONNX 模型：[onnx-community/Kokoro-82M-v1.0-ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/1939ad2a8e416c0acfeecc08a694d14ef25f2231)，固定修订 `1939ad2a8e416c0acfeecc08a694d14ef25f2231`。
- 本机生成工具：`kokoro-js 1.2.1`、`@huggingface/transformers 3.8.1`、`onnxruntime-node 1.21.0`；使用 `lamejs 1.2.1` 编码为 24 kHz 单声道、64 kbps MP3。工具和模型不会随网页加载。
- [原创脚本](tools/ai-audio-script.json)、[生成参数与输入文件校验值](tools/ai-audio-build.json)、[生成方法](tools/generate-ai-audio.mjs)。每个输出文件的时长、字节数和 SHA-256 位于 [音频目录](data/aiAudio.js)。
- 文本及音频版本通过稳定编号关联。修改文本含义或断句时应增加新编号，不得让旧听写记录指向不同的内容。

现有测评仍使用原真人录音，题目及历史成绩不因新增声线而改变。旧版页面无法识别新材料的记录时会保留本地数据并提示更新；配对设备应先刷新到同一新版。
