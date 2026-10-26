(function (root) {
  'use strict';
  const ENDPOINT = 'https://daily-english-private-sync.feyloom36.chatgpt.site/api/sync';
  const safeViews = new Set(['view-today', 'view-progress', 'view-library', 'view-favorites']);
  function showNotice(message) {
    const node = root.document.getElementById('storageNotice');
    if (node) { node.textContent = message; node.hidden = false; }
  }
  function checkStorage() {
    const gate = root.DailyEnglishStorageGate;
    if (!gate?.supported) throw new Error('当前浏览器暂不支持安全的多设备同步，学习记录仍可保存在本机。请使用较新的 Chrome、Edge、Firefox 或 Safari 再连接。');
    if (!gate.canWrite) throw new Error('另一个页面正在使用学习记录，请先关闭那个页面，再连接同步。');
    if (stateWarning) throw new Error('本机学习记录尚未正常读取，请先备份并恢复原有记录，再开启同步。');
  }
  function canApply() {
    if (stateWarning || !root.DailyEnglishStorageGate?.supported || !root.DailyEnglishStorageGate.canWrite) return false;
    if (!safeViews.has(root.document.querySelector('.view.active')?.id)) return false;
    if (root.document.querySelector('dialog[open]')) return false;
    const active = root.document.activeElement;
    if (active?.matches('input,textarea,select,[contenteditable="true"]') && !active.closest('#syncPanel')) return false;
    return !root.hasPendingFoundationWork?.() && !root.hasPendingPathwayWork?.()
      && !root.LearningDiagnostic?.hasPendingWork?.() && !root.ListeningLab?.hasPendingWork?.() && !root.LearningCoach?.hasPendingWork?.() && !root.SkillWorkshop?.hasPendingWork?.();
  }
  function beforeRead() {
    try {
      checkStorage();
      return root.flushFoundationDrafts?.() !== false && root.flushPathwayDraft?.() !== false;
    } catch (error) { showNotice(error.message); return false; }
  }
  function normalized(payload) {
    return JSON.parse(JSON.stringify(progressPayload(parseProgress(payload))));
  }
  function applyProgress(payload, receiptId) {
    if (!canApply()) return false;
    const priorFlag = root.dailyEnglishApplyingSync;
    root.dailyEnglishApplyingSync = true;
    try {
      const candidate = parseProgress(payload);
      // persistReplacement writes the primary record before changing live state.
      // Its backup also makes the prior local record available outside sync.
      if (!persistReplacement(candidate, true, receiptId)) return false;
      root.resetFoundationSession?.(); root.resetPathwaySession?.();
      root.LearningDiagnostic?.resetSession?.(); root.ListeningLab?.resetSession?.();
      root.LearningCoach?.resetSession?.();
      invalidatePersonalPractice(); resetScenario(); resetMarketScenario(); renderMarketQuiz();
      applyTheme(); renderAll();
      return true;
    } catch {
      showNotice('同步记录暂时未能完整显示，保留的本机记录和同步副本未被清空。请刷新页面后重试。');
      return false;
    } finally { root.dailyEnglishApplyingSync = priorFlag; }
  }
  root.dailyEnglishSyncReady = (root.dailyEnglishAppReady || Promise.resolve()).then(() => {
    if (!root.DailyEnglishSyncController || !root.SyncMerge || !root.DailyEnglishSyncCrypto) throw new Error('同步组件未能加载，请刷新页面重试。本机学习仍可继续。');
    const controller = root.DailyEnglishSyncController.create({
      storage: root.localStorage, merge: root.SyncMerge, crypto: root.DailyEnglishSyncCrypto,
      endpoint: ENDPOINT,
      getProgress: () => JSON.parse(JSON.stringify(progressPayload())),
      validate: normalized, applyProgress, canApply, onBeforeRead: beforeRead,
      online: () => root.navigator.onLine !== false
    });
    root.dailyEnglishSync = controller;
    // The controller recovers any interrupted local commit before enabling its
    // normal flow. UI preflight also rejects unsupported browsers before pairing.
    const uiController = {
      status: () => controller.status(), subscribe: (listener) => controller.subscribe(listener),
      create: () => { checkStorage(); return controller.create(); },
      connect: (code) => { checkStorage(); return controller.connect(code); },
      sync: () => { checkStorage(); return controller.sync(); },
      disconnect: () => controller.disconnect(), code: () => controller.code(),
      conflictCopies: () => controller.conflictCopies()
    };
    root.DailyEnglishSyncUI.mount(uiController);
    const resume = () => {
      if (root.document.visibilityState === 'hidden') return;
      try { controller.resume(); } catch { showNotice('自动同步暂未恢复，可以在“多设备同步”中重试。本机记录仍然保留。'); }
    };
    const pause = () => controller.stop();
    root.addEventListener('online', resume);
    root.addEventListener('focus', resume);
    root.addEventListener('daily-english-view', resume);
    root.addEventListener('pageshow', resume);
    root.addEventListener('pagehide', pause);
    root.document.addEventListener('visibilitychange', () => root.document.visibilityState === 'hidden' ? pause() : resume());
    root.document.addEventListener('focusout', () => root.setTimeout(() => {
      if (controller.status().pendingApply && canApply()) resume();
    }, 0));
    resume();
    return controller;
  }).catch((error) => {
    showNotice(typeof error?.message === 'string' ? error.message : '同步暂时不可用，本机学习记录仍然保留。');
    const target = root.document.getElementById('syncPanel');
    if (target && !target.children.length) {
      const message = root.document.createElement('p'); message.className = 'practice-note';
      message.textContent = '同步暂时不可用，请刷新重试。已有学习记录仍可在本机使用和导出。'; target.append(message);
    }
    return null;
  });
})(window);
