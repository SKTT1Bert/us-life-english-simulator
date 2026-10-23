(function (root) {
  'use strict';
  if (!root?.document) return;
  const phases = { disconnected: '尚未连接', connecting: '正在连接', syncing: '正在同步', synced: '已同步', offline: '等待联网', pending: '有记录等待同步', error: '同步暂未完成' };
  let activeCleanup = null;
  function node(tag, className, text) {
    const result = root.document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  }
  function button(text, className = 'small-btn') {
    const result = node('button', className, text); result.type = 'button'; return result;
  }
  function stamp(value) {
    const parsed = new Date(value);
    return value && Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : null;
  }
  function download(text, filename, type) {
    const url = root.URL.createObjectURL(new Blob([text], { type }));
    const anchor = node('a'); anchor.href = url; anchor.download = filename;
    root.document.body.append(anchor); anchor.click(); anchor.remove();
    root.setTimeout(() => root.URL.revokeObjectURL(url), 1000);
  }
  function mount(controller) {
    activeCleanup?.();
    const target = root.document.getElementById('syncPanel');
    if (!target) return () => {};
    let busy = false, destroyed = false, revealedCode = false, copiesOpen = false, recoveringDialog = false;
    const section = node('section', 'sync-panel'); section.setAttribute('aria-labelledby', 'syncHeading');
    const heading = node('h3', '', '多设备同步'); heading.id = 'syncHeading'; heading.tabIndex = -1;
    const statusRow = node('div', 'sync-status-row');
    const status = node('strong', 'sync-state'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const lastSync = node('span', 'sync-last-time'); statusRow.append(status, lastSync);
    const message = node('p', 'sync-message');
    const intro = node('p', 'sync-help', '需要云端中转，每台设备输入一次配对码即可。学习记录先加密再上传，手机和电脑不必同时在线。');
    const privacy = node('p', 'sync-help', '配对码可以读取和修改学习记录，请像密码一样保存。不要发到公开聊天或共享文档中。');
    const notice = node('p', 'sync-notice'); notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite');
    const recovery = node('div', 'sync-recovery'); recovery.hidden = true;
    const recover = button('保留备份并重新连接', 'primary-btn'); recover.id = 'syncRecoverBtn';
    recovery.append(node('p', 'sync-help', '同步设置暂时无法使用。可以先保留一份恢复备份，再用原配对码重新连接；本机学习记录会保留。'), recover);

    const setup = node('div', 'sync-setup');
    const create = button('创建我的同步空间', 'primary-btn'); create.id = 'syncCreateBtn';
    const createHelp = node('p', 'sync-help', '第一次使用：先创建，再把配对码保存到安全的地方。连接时会合并已有学习记录。');
    const form = node('form', 'sync-connect-form');
    const label = node('label', '', '已有配对码'); label.htmlFor = 'syncPairingInput';
    const input = node('input', 'input'); input.id = 'syncPairingInput'; input.type = 'password';
    input.autocomplete = 'off'; input.spellcheck = false; input.autocapitalize = 'none';
    input.placeholder = '粘贴另一台设备的配对码'; input.required = true;
    input.setAttribute('aria-describedby', 'syncPairingHelp');
    const pairingHelp = node('p', 'sync-help', '在另一台设备打开“多设备同步”，点击“查看配对码”。'); pairingHelp.id = 'syncPairingHelp';
    const connect = button('连接并合并记录', 'primary-btn'); connect.type = 'submit'; connect.id = 'syncConnectBtn';
    form.append(label, input, pairingHelp, connect); setup.append(create, createHelp, form);

    const connected = node('div', 'sync-connected');
    const actions = node('div', 'sync-actions');
    const sync = button('立即同步', 'primary-btn'); sync.id = 'syncNowBtn';
    const show = button('查看配对码'); show.id = 'syncShowCodeBtn'; show.setAttribute('aria-expanded', 'false'); show.setAttribute('aria-controls', 'syncCodeArea');
    const copy = button('复制配对码'); copy.id = 'syncCopyCodeBtn';
    const saveCode = button('下载配对码备份'); saveCode.id = 'syncDownloadCodeBtn';
    const disconnect = button('断开此设备', 'ghost-btn'); disconnect.id = 'syncDisconnectBtn';
    actions.append(sync, show, copy, saveCode, disconnect);
    const codeArea = node('div', 'sync-code-area'); codeArea.id = 'syncCodeArea'; codeArea.hidden = true;
    const code = node('pre', 'sync-code'); code.tabIndex = 0; code.setAttribute('aria-label', '配对码，请勿公开');
    const hide = button('隐藏配对码');
    codeArea.append(node('p', 'sync-help', '请在自己的另一台设备输入这份配对码。'), code, hide);
    connected.append(actions, codeArea, node('p', 'sync-help', '断开只停止这台设备同步，已经保存的学习记录仍会保留。'));

    const conflicts = node('div', 'sync-conflicts');
    const conflictIntro = node('p', 'sync-help');
    const conflictActions = node('div', 'sync-actions');
    const showCopies = button('查看保留的不同版本'); showCopies.id = 'syncShowCopiesBtn'; showCopies.setAttribute('aria-expanded', 'false'); showCopies.setAttribute('aria-controls', 'syncConflictCopies');
    const saveCopies = button('下载这些副本'); saveCopies.id = 'syncDownloadCopiesBtn';
    const copies = node('div', 'sync-conflict-copies'); copies.id = 'syncConflictCopies'; copies.hidden = true;
    conflictActions.append(showCopies, saveCopies); conflicts.append(conflictIntro, conflictActions, copies);

    const dialog = node('dialog', 'sync-dialog'); dialog.setAttribute('aria-labelledby', 'syncDisconnectHeading'); dialog.setAttribute('aria-describedby', 'syncDisconnectDescription');
    const dialogHeading = node('h3', '', '断开这台设备？'); dialogHeading.id = 'syncDisconnectHeading';
    const dialogDescription = node('p', '', '本机学习记录会保留，其他设备仍可继续同步。以后可以用同一配对码重新连接。'); dialogDescription.id = 'syncDisconnectDescription';
    const dialogNotice = node('p', 'sync-notice'); dialogNotice.setAttribute('role', 'alert');
    const dialogActions = node('div', 'sync-actions');
    const cancel = button('继续同步'); cancel.autofocus = true;
    const confirm = button('确认断开', 'primary-btn'); confirm.id = 'syncConfirmDisconnectBtn';
    dialogActions.append(cancel, confirm); dialog.append(dialogHeading, dialogDescription, dialogNotice, dialogActions);
    section.append(heading, statusRow, message, intro, privacy, recovery, setup, connected, conflicts, notice, dialog);
    target.replaceChildren(section);

    function hideCode() {
      revealedCode = false; code.textContent = ''; codeArea.hidden = true;
      show.textContent = '查看配对码'; show.setAttribute('aria-expanded', 'false');
    }
    function closeDialog() {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
      (recoveringDialog ? recover : disconnect).focus();
    }
    function readStatus() {
      try { return controller.status() || {}; }
      catch { return { phase: 'error', message: '暂时无法读取同步状态，请刷新后重试。', connected: false }; }
    }
    function readCode() {
      const value = controller.code();
      if (typeof value !== 'string' || !value.trim()) throw new Error('配对码暂不可用，请等待连接完成后重试。');
      return value;
    }
    function displayCopies() {
      const records = controller.conflictCopies();
      if (!Array.isArray(records)) throw new Error('暂时无法读取保留的副本。');
      copies.replaceChildren();
      if (!records.length) copies.append(node('p', 'sync-help', '目前没有保留的不同版本。'));
      records.forEach((record, index) => {
        const item = node('details', 'sync-conflict-copy');
        const time = stamp(record?.at || record?.createdAt || record?.updatedAt);
        item.append(node('summary', '', `副本 ${index + 1}${time ? ` · ${time}` : ''}`));
        const text = node('pre', '', JSON.stringify(record, null, 2)); text.tabIndex = 0;
        item.append(text); copies.append(item);
      });
    }
    function render() {
      if (destroyed) return;
      const value = readStatus(), connectedNow = value.connected === true;
      const needsRecovery = value.needsRecovery === true;
      const phase = Object.hasOwn(phases, value.phase) ? value.phase : 'error';
      const processing = busy || value.busy === true || phase === 'connecting' || phase === 'syncing';
      section.dataset.phase = phase;
      status.textContent = phases[phase];
      const when = stamp(value.lastSyncedAt);
      lastSync.textContent = when ? `上次同步：${when}` : '尚未完成首次同步';
      message.textContent = typeof value.message === 'string' ? value.message : '';
      message.hidden = !message.textContent;
      setup.hidden = connectedNow || needsRecovery; connected.hidden = !connectedNow;
      recovery.hidden = !needsRecovery; recover.disabled = processing;
      create.disabled = processing; connect.disabled = processing; input.disabled = processing;
      sync.disabled = processing || !connectedNow; disconnect.disabled = processing || !connectedNow;
      confirm.disabled = processing;
      for (const action of [show, copy, saveCode]) action.disabled = !connectedNow;
      create.textContent = busy && !connectedNow ? '请稍候…' : '创建我的同步空间';
      connect.textContent = processing && !connectedNow ? '正在连接…' : '连接并合并记录';
      sync.textContent = phase === 'syncing' ? '正在同步…' : '立即同步';
      if (!connectedNow) hideCode();
      const count = Number.isSafeInteger(value.conflictCount) && value.conflictCount > 0 ? value.conflictCount : 0;
      conflicts.hidden = count === 0;
      conflictIntro.textContent = `保留了 ${count} 份不同版本的记录，可查看或下载核对。`;
      if (!count) { copiesOpen = false; copies.hidden = true; copies.replaceChildren(); showCopies.setAttribute('aria-expanded', 'false'); }
    }
    async function run(action, after) {
      if (busy || destroyed) return false;
      busy = true; notice.textContent = ''; dialogNotice.textContent = ''; render();
      try {
        const result = await action();
        if (result === false) {
          const current = readStatus();
          const text = current.message || '暂时没有完成，请稍后重试。已有学习记录仍会保留。';
          notice.textContent = text;
          if (dialog.open) dialogNotice.textContent = text;
          return false;
        }
        after?.(); return true;
      }
      catch (error) {
        const text = typeof error?.message === 'string' ? error.message : '暂时没有完成，请稍后重试。已有学习记录仍会保留。';
        notice.textContent = text;
        if (dialog.open) dialogNotice.textContent = text;
        return false;
      } finally { busy = false; render(); }
    }
    create.addEventListener('click', () => run(() => controller.create(), () => { notice.textContent = '同步空间已创建。请下载或妥善保存配对码，再连接另一台设备。'; }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) { notice.textContent = '请先输入另一台设备的配对码。'; input.focus(); return; }
      run(() => controller.connect(value), () => { input.value = ''; notice.textContent = '已连接。学习记录会自动同步。'; });
    });
    sync.addEventListener('click', () => run(() => controller.sync()));
    show.addEventListener('click', () => {
      if (revealedCode) { hideCode(); return; }
      run(async () => {
        code.textContent = readCode(); revealedCode = true; codeArea.hidden = false;
        show.textContent = '隐藏配对码'; show.setAttribute('aria-expanded', 'true'); code.focus();
      });
    });
    hide.addEventListener('click', () => { hideCode(); show.focus(); });
    copy.addEventListener('click', () => run(async () => {
      if (!root.navigator.clipboard?.writeText) throw new Error('当前浏览器不支持直接复制，请查看配对码后手动复制。');
      await root.navigator.clipboard.writeText(readCode()); notice.textContent = '配对码已复制，请只粘贴到自己的设备上。';
    }));
    saveCode.addEventListener('click', () => run(async () => {
      download(readCode() + '\n', 'daily-english-pairing-code.txt', 'text/plain;charset=utf-8');
      notice.textContent = '已准备配对码备份，请把下载的文件保存到安全的地方。';
    }));
    function openDisconnect(recovering) {
      recoveringDialog = recovering;
      dialogHeading.textContent = recovering ? '保留备份并重新连接？' : '断开这台设备？';
      dialogDescription.textContent = recovering
        ? '先在本机保留现有同步设置的恢复备份，再清理连接设置。学习记录不会清空。之后请用原配对码连接；原来的云端记录仍会保留。'
        : '本机学习记录会保留，其他设备仍可继续同步。以后可以用同一配对码重新连接。';
      confirm.textContent = recovering ? '保留备份并继续' : '确认断开';
      hideCode(); dialogNotice.textContent = '';
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      cancel.focus();
    }
    disconnect.addEventListener('click', () => openDisconnect(false));
    recover.addEventListener('click', () => openDisconnect(true));
    cancel.addEventListener('click', closeDialog);
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(); });
    confirm.addEventListener('click', async () => {
      const recovered = recoveringDialog;
      const complete = await run(() => controller.disconnect(), () => {
        closeDialog(); notice.textContent = recovered ? '恢复备份已保留。请使用原配对码重新连接，本机学习记录仍在。' : '已断开此设备，本机学习记录仍然保留。';
      });
      if (complete) create.focus();
    });
    showCopies.addEventListener('click', () => run(async () => {
      copiesOpen = !copiesOpen;
      if (copiesOpen) displayCopies();
      copies.hidden = !copiesOpen;
      showCopies.textContent = copiesOpen ? '收起保留的版本' : '查看保留的不同版本';
      showCopies.setAttribute('aria-expanded', String(copiesOpen));
    }));
    saveCopies.addEventListener('click', () => run(async () => {
      const records = controller.conflictCopies();
      if (!Array.isArray(records)) throw new Error('暂时无法读取保留的副本。');
      download(JSON.stringify({ exportedAt: new Date().toISOString(), copies: records }, null, 2), 'daily-english-preserved-copies.json', 'application/json;charset=utf-8');
      notice.textContent = '已准备不同版本的备份，文件中包含你的学习记录，请妥善保存。';
    }));
    section.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && revealedCode && !dialog.open) { event.preventDefault(); hideCode(); show.focus(); }
    });
    const openButton = root.document.getElementById('openSyncBtn');
    const openPanel = () => {
      root.setView?.('progress');
      heading.scrollIntoView({ block: 'start', behavior: 'instant' }); heading.focus({ preventScroll: true });
    };
    openButton?.addEventListener('click', openPanel);
    let unsubscribe = null;
    try { unsubscribe = controller.subscribe(render); } catch { notice.textContent = '同步状态暂时无法自动更新，请刷新后重试。'; }
    render();
    const cleanup = () => {
      destroyed = true; hideCode(); if (dialog.open) closeDialog();
      openButton?.removeEventListener('click', openPanel);
      if (typeof unsubscribe === 'function') unsubscribe();
      if (activeCleanup === cleanup) activeCleanup = null;
    };
    activeCleanup = cleanup;
    return cleanup;
  }
  root.DailyEnglishSyncUI = Object.freeze({ mount });
})(typeof window !== 'undefined' ? window : globalThis);
