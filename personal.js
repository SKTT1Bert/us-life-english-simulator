let editingExpressionId = null;
let expressionProvenance = 'user';
let pendingProgressImport = null;

// Write before replacing the active state: a failed save leaves the old progress intact.
function persistReplacement(candidate, backup = false) {
  try {
    if (stateWarning && !backup) throw new Error(stateWarning);
    const payload = JSON.stringify(progressPayload(candidate));
    const previous = localStorage.getItem(STORAGE_KEY);
    if (previous !== null && (backup || JSON.parse(previous).schemaVersion !== 3)) localStorage.setItem(BACKUP_KEY, previous);
    localStorage.setItem(STORAGE_KEY, payload);
    Object.assign(state, candidate);
    stateWarning = '';
    $('#storageNotice').hidden = true;
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
    ? '来源：模型辅助 · 请核对含义、语法和使用场合后保存。' : '来源：用户提供 · 保存前请确认参考表达适合自己的使用场合。';
  $('#expressionError').textContent = '';
  $('#expressionEditNote').hidden = !editingExpressionId;
  $('#expressionDialog').showModal();
  $('#customPhrase').focus();
}

function addCustomCardActions(node, item) {
  const record = state.customExpressions.find((entry) => entry.id === item.id);
  const note = document.createElement('p');
  note.className = 'practice-note custom-source';
  note.textContent = `${record.provenance === 'model-assisted' ? '模型辅助 · 已由你确认' : '用户提供'}${record.source ? ` · ${record.source}` : ''}`;
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
    if (!confirm('删除这条个人表达？收藏和复习计划会移除，历史练习保留为“已删除表达”，不再保留原文。')) return;
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
      $('#personalNotice').textContent = '个人表达已删除。历史练习仅保留原来的编号与结果。';
    } catch (error) { alert(error.message); }
  });
  actions.append(edit, remove);
  node.append(actions);
}

function previewProgressImport(restored) {
  pendingProgressImport = restored;
  const courseAnswers = ['word-parts', 'phonics'].reduce((sum, id) => sum + FoundationProgress.summary(restored.foundationProgress, id, FOUNDATION_CATALOG[id]).answered, 0);
  const pathwayLessons = Object.keys(restored.pathwayProgress.lessons).length;
  $('#importSummary').textContent = `将载入 ${restored.learned.size} 条已学习标记、${restored.favorites.size} 条收藏、${restored.customExpressions.length} 条个人表达、${restored.practiceHistory.length} 条表达练习事件、基础课程 ${courseAnswers} 题的当前答案（含专项输出、复习和测评），以及学习路线 ${pathwayLessons} 课记录（包含写作和口述文本）。`;
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
      $('#personalNotice').textContent = '个人表达已保存，可以收藏或开始回忆。学习记录仍保存在当前浏览器。';
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
    if (!persistReplacement(pendingProgressImport, true)) {
      $('#importError').textContent = '浏览器未能保存导入内容。原有进度未改变，请导出备份后重试。';
      return;
    }
    window.resetPathwaySession?.();
    window.resetFoundationSession?.();
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
