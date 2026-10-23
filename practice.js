let activeRecall = null;

function isRecallMode() {
  return document.querySelector('#practiceMode').value === 'recall';
}

function setPracticeMode(mode) {
  $('#practiceMode').value = mode;
  $('#recallPanel').hidden = mode !== 'recall';
  $('#choicePanel').hidden = mode === 'recall';
  if (mode === 'recall' && !activeRecall) nextRecall();
  if (mode === 'choice' && !currentQuizAnswer) renderQuiz();
}

function startRecall(id) {
  const item = learningExpressions().find((entry) => entry.id === id);
  if (!item) return;
  activeRecall = { item, hintUsed: false, revealed: false, recorded: false, startedAt: new Date().toISOString() };
  $('#practiceMode').value = 'recall';
  setView('quiz');
  $('#recallPanel').hidden = false;
  $('#choicePanel').hidden = true;
  $('#recallCategory').textContent = `${item.category} · ${item.level}`;
  $('#recallPrompt').textContent = `请表达：“${item.meaning_cn}”`;
  $('#recallResponse').value = '';
  $('#recallResponse').disabled = false;
  $('#recallConfidence').value = '';
  $('#recallConfidence').disabled = false;
  $('#recallHint').hidden = true;
  $('#recallHint').textContent = '';
  $('#recallReference').hidden = true;
  $('#recallReference').replaceChildren();
  $('#recallResultButtons').hidden = true;
  $('#recallFeedback').textContent = '';
  $('#recallHintBtn').disabled = false;
  $('#revealRecallBtn').disabled = false;
  $$('#recallResultButtons button').forEach((button) => { button.disabled = false; });
  $('#recallQueueNote').textContent = `${ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule).length} 条表达待复习 · 先自己回答，再看参考答案`;
}

function nextRecall() {
  const due = ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule);
  const practicedToday = new Set(state.practiceHistory.filter((e) => e.at.slice(0, 10) === todayKey() && e.mode === 'recall').map((e) => e.itemId));
  const fresh = getDailyItems().filter((item) => !practicedToday.has(item.id));
  const unused = learningExpressions().filter((item) => !practicedToday.has(item.id));
  const item = due[0] || fresh[0] || sample(unused) || sample(learningExpressions());
  if (item) startRecall(item.id);
}

function showRecallHint() {
  if (!activeRecall || activeRecall.revealed) return;
  activeRecall.hintUsed = true;
  const words = activeRecall.item.phrase.trim().split(/\s+/);
  const hint = words.length > 3 ? words.slice(0, 2).join(' ') : activeRecall.item.phrase[0];
  $('#recallHint').textContent = `开头提示：${hint}…（看过提示后，请选择“提示后说出来了”或“看答案才想起／没想起”）`;
  $('#recallHint').hidden = false;
  $('#recallHintBtn').disabled = true;
}

function revealRecall() {
  if (!activeRecall || activeRecall.revealed) return;
  activeRecall.revealed = true;
  const item = activeRecall.item;
  $('#recallReference').innerHTML = `<h3>${escapeHTML(item.phrase)}</h3>
    <p>${escapeHTML(item.example)}</p><p>${escapeHTML(item.example_cn)}</p>
    <p class="practice-note">表达方式不止一种，意思清楚、语气适合就好。请根据看答案前的表现，选择下面的结果。</p>
    <button id="speakRecallReference" class="small-btn" type="button">朗读参考表达</button>`;
  const usage = window.createExpressionUsage?.(item);
  if (usage) $('#recallReference').append(usage);
  $('#recallReference').hidden = false;
  $('#speakRecallReference').addEventListener('click', () => speak(item.phrase));
  $('#recallResultButtons').hidden = false;
  $('#recallIndependent').disabled = activeRecall.hintUsed;
  $('#recallConfidence').disabled = true;
  $('#recallResponse').disabled = true;
  $('#recallHintBtn').disabled = true;
  $('#revealRecallBtn').disabled = true;
}

function finishRecall(outcome) {
  if (!activeRecall || !activeRecall.revealed || activeRecall.recorded) return;
  if (outcome === 'independent' && activeRecall.hintUsed) outcome = 'hinted';
  ReviewEngine.recordAttempt(state, activeRecall.item.id, {
    mode: 'recall', outcome, hintUsed: activeRecall.hintUsed || outcome === 'hinted',
    confidence: $('#recallConfidence').value || null,
  });
  activeRecall.recorded = true;
  state.learned.add(activeRecall.item.id);
  markSession(activeRecall.item.id);
  const saved = saveState();
  $$('#recallResultButtons button').forEach((button) => { button.disabled = true; });
  const due = state.reviewSchedule[activeRecall.item.id].nextDueAt;
  const labels = { independent: '独立说出来了（自评）', hinted: '提示后说出来了（自评）', forgot: '还需要再练（自评）' };
  $('#recallFeedback').textContent = `${saved ? '已保存' : '暂未保存，关闭页面后会丢失'}：${labels[outcome]}。建议下次复习：${new Date(due).toLocaleString()}。`;
  renderToday();
  renderProgress();
  $('#recallQueueNote').textContent = `${ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule).length} 条表达待复习 · 只记录练习结果，不保存或上传回答原文`;
}

function renderReviewQueue() {
  const due = ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule);
  $('#dueReviewCount').textContent = due.length;
  $('#startReviewBtn').disabled = due.length === 0;
  const list = $('#dueReviewList');
  list.innerHTML = due.slice(0, 3).map((item) => `<div class="review-row">
    <div><strong>${escapeHTML(item.meaning_cn)}</strong><span>${escapeHTML(item.category)}</span></div>
    <button class="small-btn due-recall-btn" type="button" data-item-id="${escapeHTML(item.id)}">复习这条</button></div>`).join('');
  if (!due.length) list.innerHTML = '<p class="practice-note">暂时没有待复习的表达。可以学一点新的，或到“练习”试着看中文说英文。</p>';
  $$('.due-recall-btn').forEach((button) => button.addEventListener('click', () => startRecall(button.dataset.itemId)));
}

function renderPracticeProgress() {
  const result = ReviewEngine.summary(state.reviewSchedule, state.practiceHistory);
  $('#recalledMetric').textContent = result.recalledItems;
  $('#delayedMetric').textContent = result.delayedItems;
  const ratio = (good, total) => total ? `${good}/${total}（${Math.round(good / total * 100)}%）` : '尚无记录';
  $('#practiceBreakdown').innerHTML = `<p>选择题答对：${ratio(result.choiceCorrect, result.choiceTotal)}</p>
    <p>不看提示就能说出（自评）：${ratio(result.recallIndependent, result.recallTotal)}</p>
    <p>至少隔 24 小时仍能独立说出（自评）：${ratio(result.delayedIndependent, result.delayedTotal)}</p>`;
  const outcomes = { independent: '独立说出来了', hinted: '提示后说出来了', forgot: '还需要再练', correct: '答对了', incorrect: '答错了' };
  $('#recentPractice').innerHTML = state.practiceHistory.slice(-8).reverse().map((event) => {
    const item = learningExpressions().find((entry) => entry.id === event.itemId);
    const deleted = state.deletedCustomExpressions.some((entry) => entry.id === event.itemId);
    return `<li><strong>${escapeHTML(deleted ? '已删除的个人表达' : item?.meaning_cn || event.itemId)}</strong> · ${outcomes[event.outcome]}${event.itemId.startsWith('custom:') ? ' · 个人表达（当时版本）' : ''}
      ${event.assessment === 'self-report' ? '（自评）' : '（答案核对）'}${event.delayed ? ' · 间隔至少 24 小时再练' : ''}
      <span>${escapeHTML(new Date(event.at).toLocaleString())}</span></li>`;
  }).join('') || '<li>完成练习后，可以在这里查看每次的表现。以往只有累计成绩的记录，仍保留在统计中。</li>';
}

function setupPractice() {
  $('#practiceMode').addEventListener('change', (event) => setPracticeMode(event.target.value));
  $('#nextRecallBtn').addEventListener('click', nextRecall);
  $('#recallHintBtn').addEventListener('click', showRecallHint);
  $('#revealRecallBtn').addEventListener('click', revealRecall);
  $$('#recallResultButtons button').forEach((button) => button.addEventListener('click', () => finishRecall(button.dataset.outcome)));
  $('#startReviewBtn').addEventListener('click', () => {
    const due = ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule);
    if (due.length) startRecall(due[0].id);
  });
}
