# 本地 Hy-MT2 翻译

现有 GitHub Pages 应用仍是静态页面。表达库中新增一个可选的中→英翻译区；服务不可用时，表达库、场景模拟和练习照常运行。没有 API key，也不会把原文发送到云端。

## Windows 启动

推荐 Python 3.12、已校验的官方 llama.cpp Windows 运行时及其随附 CUDA DLL、兼容的 NVIDIA 驱动，以及仓库外的 Tencent 官方 Q4_K_M GGUF。默认复用原生运行时，无需下载 Python CUDA wheel。以下命令在仓库目录执行：

```powershell
py -3.12 -m venv .venv-translator
.\.venv-translator\Scripts\python.exe -m pip install -r local_translator/requirements.txt
Copy-Item local-translator-config.example.bat local-translator-config.bat
.\start-local-translator.bat
```

若没有 `py -3.12`，可用明确的 Python 3.12 可执行文件替换。在本地配置中设置 `HY_MT_SERVER_EXE` 为已下载的官方 `llama-server.exe` 精确路径；保留随附 DLL 结构，后端不修改运行时目录。不需要完整 CUDA Toolkit。

可选 Python 绑定：清空 `HY_MT_SERVER_EXE`，用 `requirements-python-runtime.txt` 和官方 `https://abetlen.github.io/llama-cpp-python/whl/cu124` 索引安装 GPU wheel（可用 `--only-binary=:all:` 避免本机编译）。该路径与 Hy-MT2 兼容性须单独实测；本任务的原生运行时验证不能替它背书。

默认服务 `http://127.0.0.1:8765`，仅一个 uvicorn worker。启动脚本不写入 Windows Startup。关闭启动窗口或 Ctrl+C 停止服务并释放模型。首次翻译自动加载，后续翻译复用；也可调用显式加载接口。

默认模型：`C:\Users\25478\AI\Models\Hy-MT2-1.8B-Q4\Hy-MT2-1.8B-Q4_K_M.gguf`。后端只读取文件，不下载、不修改、不删除。官方文件 revision `a0c709d9fac510f2c807aa3af52872340dc37a4a`，大小 `1,133,080,448` bytes，SHA256 `dc5f44fcf1fa496ee7ad725982c0c8c553a4de00259b53af84c4b89fb0c06699`，安装任务已确认完整本机校验通过。

## 配置

在被 git 忽略的 `local-translator-config.bat` 或环境变量中配置：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `HY_MT_MODEL_PATH` | 上述模型路径 | 精确 GGUF 文件路径 |
| `HY_MT_SERVER_EXE` | 空；配置示例要求填写 | 已校验的官方原生运行时；为空时使用可选 Python 绑定 |
| `HY_MT_IDLE_SECONDS` | `600` | 从最后一次完成请求计算空闲时间 |
| `HY_MT_GPU_LAYERS` | `-1` | 支持 GPU 的运行时请求全部层 offload；`0` 为 CPU |
| `HY_MT_CONTEXT_SIZE` | `2048` | 为 3050 Ti 限制上下文占用 |
| `HY_MT_REQUEST_TIMEOUT` | `180` | 加载/生成单阶段超时秒数 |

`gpu_supported` 来自原生设备检测或 Python 绑定能力检测；`gpu_layers_requested` 表示请求配置。原生路径还返回从加载日志提取的 `gpu_layers_offloaded`，实际 RAM/VRAM 以测量为准。API 文本最多 1000 字符，生成上限 768 token，达到上限返回错误而非截断成功。

## API 和资源释放

| 接口 | 行为 |
| --- | --- |
| `GET /health` | 轻量状态；不导入模型运行时、不加载权重 |
| `GET /model/status` | 状态、load_count、worker_pid、空闲时间、运行时能力 |
| `POST /translate` | JSON `{"text":"中文"}`；懒加载并返回英文和总耗时 |
| `POST /model/load` | 显式加载，已加载时复用 |
| `POST /model/unload` | 等待使用中请求结束，然后释放 |

模型由后端独占管理的子进程加载。一个操作锁串行处理加载、生成和卸载，防止复制权重和释放使用中的 context。空闲检查每秒运行，忙碌时跳过；默认 600 秒后关闭原生进程并等待退出，释放该进程持有的模型/context/tokenizer、清除连接引用并 `gc.collect()`。Windows Job Object 保证后端意外退出时也结束其原生模型进程。可选 Python 路径调用 `model.close()`、垃圾回收并退出其工作进程；若关闭超时则终止。均无 PyTorch，所以不调用 PyTorch CUDA cache API。OS 回收进程内的 RAM/VRAM；实际显存下降必须测量。磁盘模型文件保留。

CORS 仅接受 `https://sktt1bert.github.io` 与 localhost/127.0.0.1 的 HTTP(S) origin；拒绝其他 Origin 和非 loopback Host。GitHub Pages origin 必须不带项目路径。用户可通过该 origin 的其他页面触达服务，这属于 origin 级浏览器访问边界。服务没有对外网络绑定。

原生 llama-server 仅绑定临时 loopback 端口，禁用 Web UI、使用 `--offline` 和本地 `--model`；后端自动为内部连接生成一次性认证令牌，用户无需提供 API key，浏览器不直接调用这个内部端口。日志留在 B 的临时文件中，不写模型或运行时目录。

前端启动只有一次 1.5 秒超时 `/health`；用户可以手动检查连接。只在用户触发翻译进行期间每两秒查询模型状态，完成即停止，空闲不轮询。因而空闲自动卸载后显示的旧状态会在下次检查/请求时刷新。浏览器可能要求允许页面访问本地网络；跨源 HTTPS Pages → loopback 的实际浏览器政策需在部署后的页面确认。未部署的本地副本验证不能代替线上确认。

翻译使用官方单 user 消息指令，不添加默认 system prompt。准确翻译与自然化改写明确分层；未提供未经验证的 Natural/Casual/Formal。成功返回的翻译可通过“编辑并保存为个人表达”进入编辑框：英文结果和当次中文原文会一同带入，并标记为 `model-assisted`。用户必须核对内容并勾选确认后才会写入浏览器；点击翻译本身不会保存学习条目或生成练习成绩。个人英文最多 300 字符、中文提示最多 500 字符，比翻译接口的 1000 字符输入上限更短；超长结果需要在编辑框中拆分或缩短，不能静默截断保存。

保存后的表达可收藏、朗读和主动回忆，且可随 schema-v3 进度导出和导入。翻译服务离线时仍可手动添加个人表达、学习已有内容；多选识别题继续使用内置词库。模型辅助标签表示内容来源，不代表自动核验或教学质量认证。完整的数据字段、删除语义和备份行为见[个人表达说明](personal-expressions.md)。

## 验证

Mock 与真实模型分开：

```powershell
.\.venv-translator\Scripts\python.exe -m pip install httpx
.\.venv-translator\Scripts\python.exe -m unittest discover -s tests -p test_local_translator.py -v
.\.venv-translator\Scripts\python.exe -m unittest discover -s tests -p test_native_runtime.py -v
node --test tests/review.test.js tests/translator.test.js
```

Mock 测试不导入 llama_cpp、不访问权重、不占用 GPU。覆盖启动未加载、并发仅加载一次、连续复用、空闲卸载/重载、使用中不卸载、错误清理恢复、API 验证和 CORS；原生适配另用 CPU 假服务验证真实子进程生命周期、进程崩溃恢复和 Windows Job 清理。真实验证需在协调对话明确安排的独占窗口执行：确认 startup Ready；三句翻译；记录首请求、热请求耗时和 worker PID；临时 `HY_MT_IDLE_SECONDS=30`，等待 Ready/无 PID，测 RAM/VRAM；再次翻译重载；停服务后恢复默认 600 秒。不得同时与 SailKing 占用 GPU 测量。

## 官方参考

- [Tencent 模型卡、翻译提示与参数](https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF)
- [llama-cpp-python 官方安装与 CUDA wheel](https://github.com/abetlen/llama-cpp-python)
- [llama.cpp 官方 server 参数与 API](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

Tencent 模型卡提示 STQ kernel 依赖。旧运行时与该 Q4 文件是否兼容必须实际加载确认；无法加载时报告明确错误，不改用 1.25-bit 或其他模型冒充。
