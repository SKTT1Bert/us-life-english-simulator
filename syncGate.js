(function (root) {
  'use strict';

  // Every tab on this origin uses the same browser-local progress and device ID.
  // One lifetime lock therefore protects both autosaves and sync version clocks.
  const LOCK_NAME = 'daily-english-progress-writer-v1';
  let writable = false;
  let supported = Boolean(root.navigator?.locks && typeof root.navigator.locks.request === 'function');
  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });
  let notice = null;

  function renderWaiting() {
    if (writable || !root.document.body || notice) return;
    notice = root.document.createElement('dialog');
    notice.id = 'syncStorageGate';
    notice.className = 'sync-storage-gate';
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('aria-labelledby', 'syncStorageGateTitle');
    notice.setAttribute('aria-describedby', 'syncStorageGateDescription');
    notice.setAttribute('tabindex', '-1');
    const indicator = root.document.createElement('span');
    indicator.className = 'sync-storage-gate-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    const heading = root.document.createElement('h2');
    heading.id = 'syncStorageGateTitle';
    heading.textContent = '另一个学习页面正在使用记录';
    const explanation = root.document.createElement('p');
    explanation.id = 'syncStorageGateDescription';
    explanation.textContent = '为避免学习记录互相覆盖，同一浏览器一次只能使用一个学习页面。请关闭其他 Daily English Lab 页面；这里会自动读取最新记录，然后继续学习。';
    const note = root.document.createElement('p');
    note.className = 'sync-storage-gate-note';
    note.textContent = '手机和电脑仍可分别使用，不需要同时保持打开。';
    notice.append(indicator, heading, explanation, note);
    notice.addEventListener('cancel', (event) => event.preventDefault());
    root.document.body.append(notice);
    // Web Locks browsers also support modal dialogs. Keeping this as a native
    // modal blocks keyboard, touch and pointer interaction with the waiting app.
    if (typeof notice.showModal === 'function') notice.showModal();
    else notice.setAttribute('open', '');
    notice.focus();
  }
  function allowWrites() {
    writable = true;
    if (notice) {
      if (typeof notice.close === 'function' && notice.open) notice.close();
      notice.remove();
      notice = null;
    }
    resolveReady();
  }
  function offlineFallback() {
    supported = false;
    allowWrites();
  }
  root.DailyEnglishStorageGate = Object.freeze({
    ready,
    get canWrite() { return writable; },
    get supported() { return supported; }
  });
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', renderWaiting, { once: true });
  else renderWaiting();

  if (!supported) { offlineFallback(); return; }
  try {
    const request = root.navigator.locks.request(LOCK_NAME, { mode: 'exclusive' }, (lock) => {
      if (!lock) { offlineFallback(); return; }
      allowWrites();
      // Destruction of the document releases its lock. Do not release on blur,
      // visibility changes or network loss: background autosave can still run.
      return new Promise(() => {});
    });
    Promise.resolve(request).catch(offlineFallback);
  } catch { offlineFallback(); }
})(window);
