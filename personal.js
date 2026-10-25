let editingExpressionId = null;
let expressionProvenance = 'user';
let pendingProgressImport = null;

// Write before replacing the active state: a failed save leaves the old progress intact.
function persistReplacement(candidate, backup = false, receiptId = null) {
  try {
    if (window.DailyEnglishStorageGate?.canWrite === false) throw new Error('another-tab');
    if (stateWarning && !backup) throw new Error(stateWarning);
    const previous = localStorage.getItem(STORAGE_KEY);
    const payload = JSON.stringify(progressStoragePayload(candidate, previous, receiptId));
    if (previous !== null && (backup || JSON.parse(previous).schemaVersion !== 3)) localStorage.setItem(BACKUP_KEY, previous);
    localStorage.setItem(STORAGE_KEY, payload);
    Object.assign(state, candidate);
    stateWarning = '';
    $('#storageNotice').hidden = true;
    notifyLearningSyncSaved();
    return true;
  } catch (error) {
    $('#storageNotice').textContent = stateWarning || '保存失败：浏览器存储已满或被禁用。原有进度未改变，请先导出备份。';
    $('#storageNotice').hidden = false;
    return false;
  }
}

function freshProgressCopy() {
  return parseProgress(JSON.parse(JSON.stringify(progressPayload())));
}

function invalidatePersonalPractice() {
  activeRecall = null;
  currentQuizAnswer = null;
  quizAnswered = false;
  $('#recallResponse').value = '';
  if ($('#view-quiz').classList.contains('active')) setPracticeMode($('#practiceMode').value);
}

function openExpressionEditor(record = null, provenance = 'user') {
  editingExpressionId = record?.id || null;
  expressionProvenance = record?.provenance || provenance;
  $('#expressionForm').reset();
  $('#expressionDialogTitle').textContent = editingExpressionId ? '编辑个人表达' : '保存一条自己的表达';
  $('#customPhrase').value = record?.phrase || '';
  $('#customMeaning').value = record?.meaning_cn || '';
  $('#customExample').value = record?.example || '';
  $('#customSource').value = record?.source || '';
  $('#customProvenance').textContent = expressionProvenance === 'model-assisted'
    ? '来源：AI 辅助翻译 · 请核对含义、语法和使用场合后保存。' : '来源：自己添加 · 保存前请确认含义和使用场合。';
  $('#expressionError').textContent = '';
  $('#expressionEditNote').hidden = !editingExpressionId;
  $('#expressionDialog').showModal();
  $('#customPhrase').focus();
}

function addCustomCardActions(node, item) {
  const record = state.customExpressions.find((entry) => entry.id === item.id);
  const note = document.createElement('p');
  note.className = 'practice-note custom-source';
  note.textContent = `${record.provenance === 'model-assisted' ? 'AI 辅助翻译 · 已由你确认' : '自己添加'}${record.source ? ` · ${record.source}` : ''}`;
  node.querySelector('.card-actions').before(note);
  const actions = document.createElement('div');
  actions.className = 'custom-actions';
  const edit = document.createElement('button');
  edit.className = 'small-btn custom-edit-btn';
  edit.type = 'button';
  edit.textContent = '编辑';
  edit.addEventListener('click', () => openExpressionEditor(record));
  const remove = document.createElement('button');
  remove.className = 'small-btn custom-delete-btn';
  remove.type = 'button';
  remove.textContent = '删除';
  remove.addEventListener('click', () => {
    if (!confirm('删除这条个人表达？收藏和复习计划会移除，历史练习保留为“已删除表达”。如果曾开启同步，保留的不同版本仍可能包含原文；已连接时，此次删除也会同步到其他设备。')) return;
    try {
      const candidate = freshProgressCopy();
      Object.assign(candidate, CustomExpressions.remove(candidate, item.id));
      candidate.learned.delete(item.id);
      candidate.favorites.delete(item.id);
      delete candidate.reviewSchedule[item.id];
      if (candidate.dailyPlan) candidate.dailyPlan.ids = candidate.dailyPlan.ids.filter((id) => id !== item.id);
      if (!persistReplacement(candidate)) return;
      invalidatePersonalPractice();
      renderAll();
      $('#personalNotice').textContent = '个人表达已从学习与复习中移除。历史练习保留编号与结果；同步中已经保留的不同版本不会随之删除。';
    } catch (error) { alert(error.message); }
  });
  actions.append(edit, remove);
  node.append(actions);
}

function previewProgressImport(restored, hasSyncArchive = false) {
  pendingProgressImport = restored;
  const courseAnswers = ['word-parts', 'phonics'].reduce((sum, id) => sum + FoundationProgress.summary(restored.foundationProgress, id, FOUNDATION_CATALOG[id]).answered, 0);
  const pathwayLessons = Object.keys(restored.pathwayProgress.lessons).length;
  $('#importSummary').textContent = `准备导入：${restored.learned.size} 条已学习的表达、${restored.favorites.size} 条收藏、${restored.customExpressions.length} 条个人表达、${restored.practiceHistory.length} 次表达练习记录；基础课程中已作答的 ${courseAnswers} 道题，以及写作、口语、复习和测评记录；学习路线中 ${pathwayLessons} 课的记录（含写作内容和口述要点）。`;
  if (hasSyncArchive) $('#importSummary').textContent += '文件还包含同步副本；本次导入只恢复上述页面记录，不恢复配对信息或历史版本库。请保留原文件中的副本，以便核对。';
  $('#importSummary').textContent += `另含 ${restored.learningStudio.diagnostics.length} 次起点诊断、${restored.learningStudio.listeningAttempts.length} 次精听练习及今日计划设置。`;
  $('#importError').textContent = '';
  $('#importDialog').showModal();
}

function downloadLocalBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) { alert('还没有操作前备份。可以使用右上角“导出进度”保存当前记录。'); return; }
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-english-before-change-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch { alert('无法读取备份，请检查浏览器存储权限。'); }
}

function setupPersonalExpressions() {
  $('#addExpressionBtn').addEventListener('click', () => openExpressionEditor());
  $('#cancelExpressionBtn').addEventListener('click', () => $('#expressionDialog').close());
  $('#expressionDialog').addEventListener('close', () => {
    // close is queued; a newer edit may already have reopened this dialog.
    if ($('#expressionDialog').open) return;
    $('#expressionForm').reset();
    editingExpressionId = null;
  });
  $('#expressionForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!$('#customConfirmed').checked) return;
    try {
      const draft = { phrase: $('#customPhrase').value, meaning_cn: $('#customMeaning').value,
        example: $('#customExample').value, source: $('#customSource').value, provenance: expressionProvenance };
      const candidate = freshProgressCopy();
      const previous = candidate.customExpressions.find((item) => item.id === editingExpressionId);
      Object.assign(candidate, editingExpressionId
        ? CustomExpressions.update(candidate, editingExpressionId, draft)
        : CustomExpressions.create(candidate, draft));
      const saved = candidate.customExpressions.find((item) => item.id === editingExpressionId) || candidate.customExpressions.at(-1);
      if (!previous || previous.phrase !== saved.phrase || previous.meaning_cn !== saved.meaning_cn) {
        delete candidate.reviewSchedule[saved.id];
        candidate.learned.delete(saved.id);
        ReviewEngine.noteStudy(candidate, saved.id);
        // Confirming a reference is not studying or recalling it; make the first attempt available now.
        candidate.reviewSchedule[saved.id].nextDueAt = new Date().toISOString();
      }
      if (!persistReplacement(candidate)) {
        $('#expressionError').textContent = '保存失败，内容仍在编辑框中。请先导出备份或释放浏览器存储后重试。';
        return;
      }
      invalidatePersonalPractice();
      $('#expressionDialog').close();
      $('#expressionSource').value = 'custom';
      $('#searchInput').value = '';
      $('#categoryFilter').value = 'all';
      $('#levelFilter').value = 'all';
      renderAll();
      setView('library');
      $('#personalNotice').textContent = '个人表达已保存，可以收藏或试着说一说。学习记录保存在当前浏览器。';
      $('#personalNotice').focus();
    } catch (error) { $('#expressionError').textContent = error.message; }
  });
  $('#cancelImportBtn').addEventListener('click', () => $('#importDialog').close());
  $('#importDialog').addEventListener('close', () => {
    // Do not let an earlier close discard a preview opened by a later file read.
    if (!$('#importDialog').open) pendingProgressImport = null;
  });
  $('#importExportBtn').addEventListener('click', exportProgress);
  $('#backupDownloadBtn').addEventListener('click', downloadLocalBackup);
  $('#confirmImportBtn').addEventListener('click', () => {
    if (!pendingProgressImport) return;
    if (requiresSyncDisconnect()) {
      $('#importError').textContent = '同步已经连接。请先取消导入，在“多设备同步”中断开此设备，再重新选择文件。已有记录未改变。';
      return;
    }
    if (!persistReplacement(pendingProgressImport, true)) {
      $('#importError').textContent = '浏览器未能保存导入内容。原有进度未改变，请导出备份后重试。';
      return;
    }
    window.resetPathwaySession?.();
    window.resetFoundationSession?.();
    window.resetLearningStudioSession?.();
    $('#importDialog').close();
    invalidatePersonalPractice();
    resetScenario();
    resetMarketScenario();
    renderMarketQuiz();
    applyTheme();
    renderAll();
    alert('进度已导入，操作前的本地记录可从“下载操作前备份”取回。');
  });
}
