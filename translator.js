(function () {
  'use strict';
  const BASE = 'http://127.0.0.1:8765';
  const STATES = new Set(['Offline', 'Ready', 'Loading', 'Loaded', 'Unloading', 'Error']);
  const el = (id) => document.getElementById(id);
  let busy = false;
  let completedTranslation = null;
  let operationVersion = 0;

  function status(state, message = '') {
    el('translatorStatus').textContent = STATES.has(state) ? state : 'Error';
    el('translatorMessage').textContent = message;
  }

  async function request(path, options = {}, timeout = 180000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(BASE + path, { ...options, signal: controller.signal });
      const body = await response.json();
      if (!response.ok) {
        const error = new Error(typeof body.detail === 'string' ? body.detail : '请求内容无效，请缩短文本后重试。');
        error.backend = true;
        throw error;
      }
      return body;
    } finally {
      clearTimeout(timer);
    }
  }

  async function connect() {
    if (busy) return;
    const operation = ++operationVersion;
    try {
      const body = await request('/health', {}, 1500);
      if (body.service !== 'daily-english-local-translator') throw new Error('Unexpected local service');
      if (operation === operationVersion) status(body.state, body.error || '本地服务可用，翻译时才会加载模型。');
    } catch {
      if (operation === operationVersion) status('Offline', '先在电脑上运行 start-local-translator.bat，再点击“检查连接”。其他学习功能可继续使用。浏览器若询问本地网络访问，请允许此页面连接。');
    }
  }

  function setBusy(value) {
    busy = value;
    for (const id of ['translateBtn', 'translatorUnload', 'translatorConnect']) el(id).disabled = value;
    el('translatorInput').disabled = value;
  }

  async function translate() {
    const source = el('translatorInput').value.trim();
    if (!source || busy) return;
    operationVersion += 1;
    setBusy(true);
    el('translatorOutput').value = '';
    el('translatorCopy').disabled = true;
    el('translatorSave').disabled = true;
    completedTranslation = null;
    status(el('translatorStatus').textContent === 'Loaded' ? 'Loaded' : 'Loading', '正在翻译；首次加载可能需要较长时间。');
    // Poll only while this user-initiated operation is active, never at idle.
    let watching = true;
    const watch = async () => {
      if (!watching) return;
      try {
        const state = await request('/model/status', {}, 1500);
        if (watching) el('translatorStatus').textContent = STATES.has(state.state) ? state.state : 'Error';
      } catch { /* The main request reports a connection error. */ }
      if (watching) watcher = setTimeout(watch, 2000);
    };
    let watcher = setTimeout(watch, 1000);
    try {
      const body = await request('/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: source }) }, 370000);
      if (typeof body.text !== 'string' || !body.text.trim()) throw Object.assign(new Error('模型未返回翻译。'), { backend: true });
      el('translatorOutput').value = body.text;
      el('translatorCopy').disabled = false;
      completedTranslation = { phrase: body.text, meaning_cn: source, provenance: 'model-assisted', source: '本地 Hy-MT2 翻译，经用户确认' };
      el('translatorSave').disabled = false;
      status(body.state, '翻译完成。空闲时自动释放；显示状态可通过“检查连接”刷新。');
    } catch (error) {
      status(error.backend ? 'Error' : 'Offline', error.backend ? error.message : '本地服务未响应。请检查启动窗口及浏览器本地网络访问权限，然后重试。');
    } finally {
      watching = false;
      clearTimeout(watcher);
      setBusy(false);
    }
  }

  async function unload() {
    if (busy) return;
    operationVersion += 1;
    setBusy(true);
    status('Unloading', '正在释放模型…');
    try {
      const body = await request('/model/unload', { method: 'POST' }, 370000);
      status(body.state, '模型已释放，磁盘文件保留；下次翻译会自动加载。');
    } catch (error) {
      status(error.backend ? 'Error' : 'Offline', error.backend ? error.message : '本地服务未响应，请检查连接。');
    } finally {
      setBusy(false);
    }
  }

  el('translateBtn').addEventListener('click', translate);
  el('translatorConnect').addEventListener('click', connect);
  el('translatorUnload').addEventListener('click', unload);
  el('translatorSave').addEventListener('click', () => {
    if (completedTranslation && !busy) openExpressionEditor(completedTranslation, 'model-assisted');
  });
  el('translatorCopy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el('translatorOutput').value);
      el('translatorMessage').textContent = '英文结果已复制。';
    } catch {
      el('translatorOutput').focus();
      el('translatorOutput').select();
      el('translatorMessage').textContent = '请按 Ctrl+C 复制选中的英文结果。';
    }
  });
  // Existing learning/navigation scripts have already initialized.
  connect();
}());
