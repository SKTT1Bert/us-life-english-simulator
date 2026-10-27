# 入门朗读：直接播放与下载选择

本次在既有四种声线的基础上改善第一次朗读。学习课程、题目、素材编号和进度 schema 不变。

桌面与手机尺寸的界面预览：[朗读设置](previews/fast-audio-settings-desktop.png)、[首次下载选择](previews/fast-audio-choice-mobile.png)。截图来自独立测试配置，不包含真实学习者记录。

## 覆盖范围

- 词根词缀与自然拼读的全部 Pre-A1 例词：两个课程各 8 节。
- 综合路线的 8 节 Pre-A1 课程听力：全文和现有逐句版本。
- 加油站图解的 12 个词语与 10 个例句。
- 已有 24 段 AI 材料：其他入口请求完全相同的文本时复用既有音频。

新增 128 条朗读内容，每条四种声线，共 512 个 MP3。此计数含全文与分句，不作为新增课程数。其他内容继续使用原来的本机合成能力。

## 使用行为

已备好音频在点击播放时仅请求对应 MP3，不要求浏览器支持 Worker，也不加载 Kokoro 模型。声线保持用户选择，慢速播放保留音高。匹配保留大小写和标点，仅统一空白；不会为了命中缓存而改写听写原文。英式短例词中的教学提示也参与匹配，不会被错误复用到不含提示的听写材料中。

未备好内容首次需要扩展 AI 时显示原生对话框，说明约 110 MB 下载，支持取消、保留所选 AI 声线或仅这次使用设备朗读。选择设备朗读后 AI 模式和声线不变。确认扩展 AI 才记住允许按需下载；“朗读设置”可以关闭该偏好。设备没有英文语音时明确提示，不伪装为已播放。

下载选择期间不会增加听写播放次数。只有实际播放开始才调用原来的逐句计数；停止、导航、切换音色、页面隐藏会取消当前任务。音频请求失败不会自动回退到大模型下载，也不会悄悄更换音色。

独立偏好键为 daily-english-ai-download-v1，不进入课程进度、导出或加密同步。不同设备可以按照自身网络条件选择。原有 daily-english-speech-mode-v1 和声线偏好继续使用。

## 制作与校验

参见 [声音来源](../AI-AUDIO-CREDITS.md)。构建工具从课程数据提取原文，不维护另一套课程副本。模型和四个声线文件先按原清单校验，再在本地 CPU 生成。无需付费语音接口。

构建环境固定 kokoro-js 1.2.1、@huggingface/transformers 3.8.1、lamejs 1.2.1。模型目录使用原 tools/ai-audio-build.json 的校验文件。若仅使用随包 CPU 运行库，可以跳过安装阶段的可选 GPU 下载。构建命令：

```sh
node /path/to/repository/tools/generate-course-audio.mjs /path/to/repository
```

在含已校验 model/ 与 node_modules/ 的独立构建目录运行。构建线程数限制为 2；中间记录 tools/course-audio-build-progress.json 不进入版本控制。完成后生成 data/courseAudio.js 和 assets/course-audio/。

验证入口：

```sh
node --test tests/*.test.js
node tests/fast-audio-browser.cjs
node tests/unified-speech-browser.cjs
node tests/ai-audio-browser.cjs
```

快速播放测试使用真实 HTTP 和浏览器原生 MP3 播放；设备语音降级使用明确标注的测试替身。扩展合成仍由原有真实引擎套件检查。手机尺寸回归不等于真实 iPhone/Android 的声音、能耗或性能验证；本轮不宣称已完成真机测试、完整离线 PWA 或发音准确率认证。
