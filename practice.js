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
  const item = EXPRESSIONS.find((entry) => entry.id === id);
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
  $('#recallQueueNote').textContent = `${ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule).length} 条到期 · 自评不等于自动验证的口语能力`;
}

function nextRecall() {
  const due = ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule);
  const practicedToday = new Set(state.practiceHistory.filter((e) => e.at.slice(0, 10) === todayKey() && e.mode === 'recall').map((e) => e.itemId));
  const fresh = getDailyItems().filter((item) => !practicedToday.has(item.id));
  const unused = EXPRESSIONS.filter((item) => !practicedToday.has(item.id));
  const item = due[0] || fresh[0] || sample(unused) || sample(EXPRESSIONS);
  if (item) startRecall(item.id);
}

function showRecallHint() {
  if (!activeRecall || activeRecall.revealed) return;
  activeRecall.hintUsed = true;
  const words = activeRecall.item.phrase.trim().split(/\s+/);
  const hint = words.length > 3 ? words.slice(0, 2).join(' ') : activeRecall.item.phrase[0];
  $('#recallHint').textContent = `开头提示：${hint}…（本题不能再记为无提示回忆）`;
  $('#recallHint').hidden = false;
  $('#recallHintBtn').disabled = true;
}

function revealRecall() {
  if (!activeRecall || activeRecall.revealed) return;
  activeRecall.revealed = true;
  const item = activeRecall.item;
  $('#recallReference').innerHTML = `<h3>${escapeHTML(item.phrase)}</h3>
    <p>${escapeHTML(item.example)}</p><p>${escapeHTML(item.example_cn)}</p>
    <p class="practice-note">参考表达不是唯一正确答案。意思、对象和语气合适的改写也可以；请根据看答案之前的表现自评。</p>
    <button id="speakRecallReference" class="small-btn" type="button">朗读参考表达</button>`;
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
  const labels = { independent: '独立回忆（自评）', hinted: '提示后回忆（自评）', forgot: '暂时未回忆出（自评）' };
  $('#recallFeedback').textContent = `${saved ? '已保存' : '仅本次页面记录，尚未保存'}：${labels[outcome]}。下次建议：${new Date(due).toLocaleString()}。`;
  renderToday();
  renderProgress();
  $('#recallQueueNote').textContent = `${ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule).length} 条到期 · 回答文本没有保存或上传`;
}

function renderReviewQueue() {
  const due = ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule);
  $('#dueReviewCount').textContent = due.length;
  $('#startReviewBtn').disabled = due.length === 0;
  const list = $('#dueReviewList');
  list.innerHTML = due.slice(0, 3).map((item) => `<div class="review-row">
    <div><strong>${escapeHTML(item.meaning_cn)}</strong><span>${escapeHTML(item.category)}</span></div>
    <button class="small-btn due-recall-btn" type="button" data-item-id="${escapeHTML(item.id)}">回忆这条</button></div>`).join('');
  if (!due.length) list.innerHTML = '<p class="practice-note">暂时没有到期表达。先学习新表达，或进入主动回忆模式练习。</p>';
  $$('.due-recall-btn').forEach((button) => button.addEventListener('click', () => startRecall(button.dataset.itemId)));
}

function renderPracticeProgress() {
  const result = ReviewEngine.summary(state.reviewSchedule, state.practiceHistory);
  $('#recalledMetric').textContent = result.recalledItems;
  $('#delayedMetric').textContent = result.delayedItems;
  const ratio = (good, total) => total ? `${good}/${total}（${Math.round(good / total * 100)}%）` : '尚无记录';
  $('#practiceBreakdown').innerHTML = `<p>选择题（答案核对）：${ratio(result.choiceCorrect, result.choiceTotal)}</p>
    <p>无提示回忆（自评）：${ratio(result.recallIndependent, result.recallTotal)}</p>
    <p>间隔至少 24 小时后的无提示回忆（自评）：${ratio(result.delayedIndependent, result.delayedTotal)}</p>`;
  const outcomes = { independent: '独立回忆', hinted: '提示后回忆', forgot: '未回忆出', correct: '选择正确', incorrect: '选择错误' };
  $('#recentPractice').innerHTML = state.practiceHistory.slice(-8).reverse().map((event) => {
    const item = EXPRESSIONS.find((entry) => entry.id === event.itemId);
    return `<li><strong>${escapeHTML(item?.meaning_cn || event.itemId)}</strong> · ${outcomes[event.outcome]}
      ${event.assessment === 'self-report' ? '（自评）' : '（答案核对）'}${event.delayed ? ' · 延迟练习' : ''}
      <span>${escapeHTML(new Date(event.at).toLocaleString())}</span></li>`;
  }).join('') || '<li>练习后会在这里留下记录；旧版累计成绩不会补造为逐次记录。</li>';
}

function setupPractice() {
  $('#practiceMode').addEventListener('change', (event) => setPracticeMode(event.target.value));
  $('#nextRecallBtn').addEventListener('click', nextRecall);
  $('#recallHintBtn').addEventListener('click', showRecallHint);
  $('#revealRecallBtn').addEventListener('click', revealRecall);
  $$('#recallResultButtons button').forEach((button) => button.addEventListener('click', () => finishRecall(button.dataset.outcome)));
  $('#startReviewBtn').addEventListener('click', () => {
    const due = ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule);
    if (due.length) startRecall(due[0].id);
  });
}
