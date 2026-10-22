# 2026-10-22 本轮验证

基线：`1a6b55b95baa033ff167ee02ee36dca00f9b7fa0`；分支：`codex/daily-english-improvements-20261022`。

| 检查 | 结果 | 证据范围 |
| --- | --- | --- |
| Node 单元测试 | 29/29 通过 | 复习间隔、个人数据验证/增删改/ID、翻译确认入口和异步状态竞争、12 条新增口语的唯一 ID/字段/来源与原 306 条保留 |
| 原有浏览器流程 | 13/13 通过 | 真实本机 HTTP、隔离 Chrome；首页、Recall/Recognition、进度、场景、市场测验、导入/导出/清空 |
| 个人表达浏览器流程 | 18/18 通过 | 确认保存、搜索/收藏、刷新保留、编辑调度、删除历史、纯文本安全、导入预览/备份、v2 迁移、超量/超大文件和存储失败；编辑与导入弹窗快速重开竞态 |
| 流行口语浏览器流程 | 7/7 通过 | 新计划包含新内容、同日 v2 计划保留、快捷入口重置筛选、答案揭晓后显示用法、收藏/调度/历史导出回导、桌面/390px 布局及无脚本错误 |
| 视觉与键盘检查 | 通过 | 1440px 桌面、320/390px 手机，浅色/深色/粉色，四个主导航、场景页和编辑器；无水平溢出或页面脚本错误 |
| `git diff --check` / JS 语法 | 通过 | 本次代码及文档 |
| 当前 CSV 字典 | 通过 | 53 个唯一字段路径，每行 5 列 |
| 真实 Hy-MT2、GPU 资源释放 | 未测试 | 翻译浏览器用例模拟响应；未启动本机模型或改动后端 |
| GitHub Pages 发布后行为 | 未测试 | 本次仅分支/PR，未合并或部署 |

执行命令：

```powershell
node --test tests/review.test.js tests/translator.test.js tests/custom-expressions.test.js tests/trending-content.test.js
# 使用已安装的 Playwright 模块和 Chrome；也支持 Playwright 自带 Chromium。
$env:PLAYWRIGHT_MODULE = '<installed-playwright-module>'
$env:PLAYWRIGHT_EXECUTABLE_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tests/browser.cjs
node tests/personal-browser.cjs
node tests/trending-browser.cjs
```

最终三个浏览器套件共 38 项检查通过实际 localhost HTTP 提供页面，未使用 `TEST_OFFLINE_FIXTURE`；本地网络受限的初始截图检查使用过路由 fixture，不能替代上述最终 HTTP 结果。浏览器测试屏蔽或模拟可选翻译服务，不连接学习者账号。新 CI 工作流复用这些检查，远端运行结果以 PR checks 为准。

首个远端 CI 在导入预览取消后重新确认时失败。补充确定性测试后，先复现编辑器内容被清空、再复现新导入预览被清空：原生 `close` 事件延迟触发，旧事件会清理已重新打开的弹窗状态。两处关闭监听器现在只在弹窗仍关闭时清理；新增回归与完整套件均通过。此修复不改变导入确认或备份规则。

新增口语的桌面/手机截图位于本地 `D:\Agents\daily-english-trending-qa`，已目视检查。来源与学习定位见 [trending-expressions.md](trending-expressions.md)，词典收录与近期用例不等同于实时热度排名。
