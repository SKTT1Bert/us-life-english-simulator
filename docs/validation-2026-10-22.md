# 2026-10-22 本轮验证

基线：`1a6b55b95baa033ff167ee02ee36dca00f9b7fa0`；分支：`codex/daily-english-improvements-20261022`。

| 检查 | 结果 | 证据范围 |
| --- | --- | --- |
| Node 单元测试 | 37/37 通过 | 复习间隔、个人数据、翻译状态、流行口语；新增基础课程结构/144 题/旧 ID、进度恢复、错题重练、重复及非法作答拒绝 |
| 原有浏览器流程 | 13/13 通过 | 真实本机 HTTP、隔离 Chrome；首页、Recall/Recognition、进度、场景、市场测验、导入/导出/清空 |
| 个人表达浏览器流程 | 18/18 通过 | 确认保存、搜索/收藏、刷新保留、编辑调度、删除历史、纯文本安全、导入预览/备份、v2 迁移、超量/超大文件和存储失败；编辑与导入弹窗快速重开竞态 |
| 流行口语浏览器流程 | 7/7 通过 | 新计划包含新内容、同日 v2 计划保留、快捷入口重置筛选、答案揭晓后显示用法、收藏/调度/历史导出回导、桌面/390px 布局及无脚本错误 |
| 基础课程浏览器流程 | 10/10 通过 | 48 课目录/阶段/搜索、逐题解析/重练、刷新续学、键盘 tab、主存储导出/导入/清空、旧 v3 无新增字段、写入失败不改记录、语音缺失和过期回调、三主题/三宽度/减少动态 |
| 视觉与键盘检查 | 通过 | 1440px 桌面、320/390px 手机，浅色/深色/粉色，四个主导航、场景页和编辑器；无水平溢出或页面脚本错误 |
| `git diff --check` / JS 语法 | 通过 | 本次代码及文档 |
| 当前 CSV 字典 | 通过 | 60 个唯一字段路径，每行 5 列 |
| 真实 Hy-MT2、GPU 资源释放 | 未测试 | 翻译浏览器用例模拟响应；未启动本机模型或改动后端 |
| GitHub Pages 发布后行为 | 未测试 | 本次仅分支/PR，未合并或部署 |

执行命令：

```powershell
node --test tests/review.test.js tests/translator.test.js tests/custom-expressions.test.js tests/trending-content.test.js tests/foundations.test.js
# 使用已安装的 Playwright 模块和 Chrome；也支持 Playwright 自带 Chromium。
$env:PLAYWRIGHT_MODULE = '<installed-playwright-module>'
$env:PLAYWRIGHT_EXECUTABLE_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tests/browser.cjs
node tests/personal-browser.cjs
node tests/trending-browser.cjs
node tests/foundations-browser.cjs
```

四个浏览器套件共 48 项检查通过实际 localhost HTTP 提供页面，未使用 `TEST_OFFLINE_FIXTURE`；本地网络受限的初始截图检查使用过路由 fixture，不能替代这些 HTTP 结果。浏览器测试屏蔽或模拟可选翻译服务，不连接学习者账号。CI 工作流复用全部检查，远端运行结果以 PR checks 为准。并行回归暴露的测试时序假设已修正：文件上传用例现在等待 FileReader 生成实际可见的导入预览，而不是在文件选择刚结束时断言它已显示。

首个远端 CI 在导入预览取消后重新确认时失败。补充确定性测试后，先复现编辑器内容被清空、再复现新导入预览被清空：原生 `close` 事件延迟触发，旧事件会清理已重新打开的弹窗状态。两处关闭监听器现在只在弹窗仍关闭时清理；新增回归与完整套件均通过。此修复不改变导入确认或备份规则。

新增口语的桌面/手机截图位于本地 `D:\Agents\daily-english-trending-qa`，已目视检查。来源与学习定位见 [trending-expressions.md](trending-expressions.md)，词典收录与近期用例不等同于实时热度排名。

基础课程与新版视觉截图位于本地 `D:\Agents\daily-english-foundations-qa`。1440/390/320px × 浅色/深色/粉色均通过无横向溢出检查，已目视检查首页、课程、目录和练习。两位内容作者交叉核查了规则、词源、题目和音标；修正了 `stopped` 的构词标注及 `flat → flats` 的增音示例。此内容核查不等同于外部教师认证。设备真实 TTS 音质和学习者发音尚未实测；语音用例检验不可用提示与回调生命周期。详见 [基础课程](foundations.md)。
