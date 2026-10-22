# Daily English 首轮改进与交付边界

对应 [Issue #2](https://github.com/SKTT1Bert/us-life-english-simulator/issues/2)。基线为 `main` 的 `1a6b55b95baa033ff167ee02ee36dca00f9b7fa0`（2026-10-22 读取）；当时没有 open PR 或已有改进计划。用户本次进一步授权实际实现排版和 Issue 改进，因此本分支交付代码与说明，保留 Issue 跟踪后续工作。

## P0：现状与缺口

| 能力 | 已核对文件 | 本轮处理 |
| --- | --- | --- |
| 八个同级导航 | `index.html` / `app.js:setView` | 四个主入口，组内导航放在内容区；原视图全部保留 |
| 内置表达与收藏 | `app.js:renderCard/getFilteredExpressions` | 接入个人表达、来源筛选、纯文本编辑和删除 |
| Recall / Recognition / 到期队列 | `practice.js` / `review.js` | 复用 Recall 和间隔规则；Recognition 仍使用内置词库，避免自定义同义表达形成含糊选项 |
| 可选本地翻译 | `translator.js` | 完成结果进入编辑确认；服务离线仍可手动保存，模型输出不自动成为参考答案 |
| schema v2 与 v1 导入 | `app.js:parseProgress/progressPayload` | v3 增加个人表达和删除标识；v1/v2 继续导入；替换前预览、备份和原子持久化 |
| 历史 coursework v1.2 | `README.md` / `metadata/` | 保留历史叙述、署名和 DOI；只更新当前运行时提示及 CSV 字段字典 |

## P1：可独立核查的交付项

| 阶段任务 | 依赖 | 可观察完成标准 | 失败与回滚 |
| --- | --- | --- | --- |
| P1 导航精简 | 既有视图与 CSS | 四个主入口可到达八个原页面；320px 手机可用；键盘可切换 | 不变更学习存储；可独立撤回 `navigation.js/css` 和导航标记 |
| P1 个人表达数据 | 既有 v2 状态 | 稳定 UUID、重复判定、长度/数量边界、文本删除标记；纯函数单元测试 | 校验失败不变更旧数据；保留旧备份，用 v3 程序读取新导出 |
| P1 保存与回忆闭环 | 个人表达数据 + 既有 Recall | 手动或翻译结果 → 编辑确认 → 搜索/收藏 → 回忆 → 刷新保留 | 写入失败编辑器保留草稿，不声称成功；离线手动录入照常可用 |
| P1 导入与兼容 | v3 校验 + 备份 | v1/v2/v3 导入、取消预览、新导出回导、损坏与超量拒绝、旧进度不造成功证据 | 替换前下载当前进度；保留一份操作前备份；存储失败不替换活动状态 |
| P1 回归与交付 | 上述四项 | Node 单元测试、浏览器原有及新增流程、桌面/手机/主题截图检查 | mock、真实 HTTP 静态页面、本地模型、线上部署分别记录；不以其中一种代替另一种 |

具体接口、字段、删除后的历史引用和回滚步骤见 [个人表达](personal-expressions.md)，导航见 [导航与布局](navigation.md)。使用原有学习素材与 CSS/SVG，无图片生成、云端学习记录或新增常驻 GPU 服务。

## P2：候选工具取舍（仅静态核对）

2026-10-22 通过 GitHub 读取以下上游资料；未安装、未运行上游脚本，也未修改全局 agent 配置。

| 候选 | 已确认身份与依赖证据 | 取舍 |
| --- | --- | --- |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | Apache-2.0；[README](https://github.com/HKUDS/DeepTutor/blob/main/README.md) 与 [pyproject](https://github.com/HKUDS/DeepTutor/blob/main/pyproject.toml) 描述 Python、Next.js、模型客户端、检索和后端组件 | 暂缓引入运行时。现有提示 → 尝试 → 参考反馈 → 下次回忆可在静态页面完成；进一步的场景迁移练习先做人工策划内容试点。未验证其教学效果 |
| [mattpocock/skills](https://github.com/mattpocock/skills) | MIT；README 描述工程/生产力 skill 与安装入口 | 本轮不安装。当前纯函数测试、浏览器验收和明确任务拆分已覆盖实际缺口，无需叠加 agent 框架 |
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | [MIT](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/LICENSE)；[requirements](https://github.com/harry0703/MoneyPrinterTurbo/blob/main/requirements.txt) 包含 MoviePy、Streamlit、FFmpeg 包、TTS 和模型客户端 | 保留为离线内容制作候选，不引入网页运行服务。素材授权、内容质量、声音与成片质量需另行验证 |
| CodeGraph | Issue 未指定确切上游；当前定向搜索已能定位所有调用链 | unknown/defer；没有具体检索瓶颈，不搭建索引 |

后续 P2 若进行场景迁移练习，先手工选择一个已有生活场景：展示短解释、隐藏答案让用户尝试、核对参考、在另一个情境再尝试。用人工可审查内容，沿用现有自评；不自动评分、不宣称流利度或迁移效果已获验证。

## 发布与验证界线

本分支供审阅，合并前保留 v3 导出及操作前备份。旧版页面会拒绝 v3，因此不能把回退代码等同于数据向下兼容；回退旧程序时需使用旧版备份，新个人表达保留在 v3 导出中。

测试入口：`node --test tests/review.test.js tests/translator.test.js tests/custom-expressions.test.js`、`node tests/browser.cjs`、`node tests/personal-browser.cjs`。浏览器运行选项见 [复习文档](learning-review.md)。真实 Hy-MT2 推理、GPU 卸载和 GitHub Pages 部署后的跨源 loopback 行为需在相应环境单独验收，本分支不将 mock 结果表述为这些实测。
