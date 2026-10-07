const EXPRESSIONS = window.EXPRESSIONS || [];
const SCENARIO_PACKS = window.SCENARIO_PACKS || [];
const MARKET_VOCAB = window.MARKET_VOCAB || [];
const MARKET_SCENARIOS = window.MARKET_SCENARIOS || [];
const STORAGE_KEY = 'daily-english-lab-state-v1';
const ReviewEngine = window.ReviewEngine;
let stateWarning = '';

const state = loadState();
let currentQuizAnswer = null;
let quizAnswered = false;
let activeScenario = null;
let selectedTaskId = null;
let selectedMarketScenarioId = null;
let activeMarketScenario = null;
let currentMarketQuizAnswer = null;

const SCENARIO_MOODS = [
  { id: 'friendly', en: 'Friendly', cn: '友好', note: 'The staff member is patient and willing to explain.' },
  { id: 'neutral', en: 'Neutral', cn: '普通', note: 'The staff member is professional but brief.' },
  { id: 'busy', en: 'Busy', cn: '忙碌', note: 'The staff member speaks quickly because there is a line.' },
  { id: 'impatient', en: 'Impatient', cn: '不耐烦', note: 'You need to stay calm and ask clear questions.' },
  { id: 'confused', en: 'Confused', cn: '没听懂你', note: 'You need to rephrase your request more clearly.' }
];

const TIME_SLOTS = [
  { en: 'Monday 9:15 AM', cn: '周一上午 9:15' },
  { en: 'Tuesday 2:40 PM', cn: '周二下午 2:40' },
  { en: 'Friday 4:20 PM', cn: '周五下午 4:20' },
  { en: 'Saturday 11:05 AM', cn: '周六上午 11:05' },
  { en: 'Lunch break', cn: '午休时间' }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function parseProgress(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('进度必须是 JSON 对象。');
  if (saved.app !== undefined && saved.app !== 'Daily English Lab') throw new Error('这不是 Daily English Lab 的进度。');
  for (const key of ['learned', 'favorites', 'marketLearned', 'marketFavorites']) {
    if (saved[key] !== undefined && (!Array.isArray(saved[key]) || saved[key].some((id) => typeof id !== 'string'))) {
      throw new Error('条目标记格式不正确。');
    }
  }
  for (const key of ['quiz', 'marketQuiz', 'scenarios', 'marketScenarios']) {
    const value = saved[key];
    if (value === undefined) continue;
    const fields = key.toLowerCase().includes('quiz') ? ['correct', 'total'] : ['runs', 'completed', 'success'];
    if (!value || typeof value !== 'object' || fields.some((field) => !Number.isInteger(value[field]) || value[field] < 0)
      || (fields.includes('total') ? value.correct > value.total : value.success > value.completed || value.completed > value.runs)) {
      throw new Error('累计计数格式不正确。');
    }
  }
  if (saved.sessions !== undefined && (!saved.sessions || typeof saved.sessions !== 'object' || Array.isArray(saved.sessions)
    || Object.entries(saved.sessions).some(([day, ids]) => !/^\d{4}-\d{2}-\d{2}$/.test(day)
      || !Array.isArray(ids) || ids.some((id) => typeof id !== 'string')))) throw new Error('每日记录格式不正确。');
  const validIds = new Set(EXPRESSIONS.map((item) => item.id));
  if (saved.dailyPlan != null && (typeof saved.dailyPlan !== 'object'
    || !/^\d{4}-\d{2}-\d{2}$/.test(saved.dailyPlan.date) || !Array.isArray(saved.dailyPlan.ids)
    || saved.dailyPlan.ids.length > 5 || new Set(saved.dailyPlan.ids).size !== saved.dailyPlan.ids.length
    || saved.dailyPlan.ids.some((id) => !validIds.has(id)))) throw new Error('每日计划格式不正确。');
  const review = ReviewEngine.restore(saved, validIds);
  return {
    learned: new Set(saved.learned || []), favorites: new Set(saved.favorites || []),
    sessions: saved.sessions || {}, theme: ['light', 'dark', 'pink'].includes(saved.theme) ? saved.theme : 'light',
    quiz: saved.quiz || { correct: 0, total: 0 }, scenarios: saved.scenarios || { runs: 0, completed: 0, success: 0 },
    marketLearned: new Set(saved.marketLearned || []), marketFavorites: new Set(saved.marketFavorites || []),
    marketQuiz: saved.marketQuiz || { correct: 0, total: 0 }, marketScenarios: saved.marketScenarios || { runs: 0, completed: 0, success: 0 },
    dailyPlan: saved.dailyPlan || null, ...review,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parseProgress(saved || {});
  } catch {
    stateWarning = '本地进度读取失败，原始记录未被改写。请先备份浏览器数据；当前临时使用空进度。';
    return parseProgress({});
  }
}

function progressPayload() {
  return {
    learned: [...state.learned],
    favorites: [...state.favorites],
    sessions: state.sessions,
    theme: state.theme,
    quiz: state.quiz,
    scenarios: state.scenarios,
    marketLearned: [...state.marketLearned],
    marketFavorites: [...state.marketFavorites],
    marketQuiz: state.marketQuiz,
    marketScenarios: state.marketScenarios,
    schemaVersion: state.schemaVersion,
    reviewSchedule: state.reviewSchedule,
    practiceHistory: state.practiceHistory,
    dailyPlan: state.dailyPlan,
  };
}

function saveState() {
  try {
    // Do not silently overwrite a corrupt original record.
    if (stateWarning) throw new Error('blocked');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressPayload()));
    $('#storageNotice').hidden = true;
    return true;
  } catch {
    $('#storageNotice').textContent = stateWarning || '进度未能保存到浏览器（可能存储已满或被禁用）。请导出进度备份。';
    $('#storageNotice').hidden = false;
    return false;
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyItems(count = 5) {
  const key = todayKey();
  if (state.dailyPlan?.date === key) {
    return state.dailyPlan.ids.map((id) => EXPRESSIONS.find((item) => item.id === id)).filter(Boolean).slice(0, count);
  }
  const seed = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const newCount = Math.max(2, count - Math.min(3, ReviewEngine.dueItems(EXPRESSIONS, state.reviewSchedule).length));
  const items = EXPRESSIONS.filter((item) => !state.learned.has(item.id) && !state.reviewSchedule[item.id])
    .map((item, index) => ({ item, score: Math.sin((index + 1) * (seed + 17)) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, newCount)
    .map(({ item }) => item);
  state.dailyPlan = { date: key, ids: items.map((item) => item.id) };
  saveState();
  return items;
}

function markSession(id) {
  const key = todayKey();
  if (!state.sessions[key]) state.sessions[key] = [];
  if (!state.sessions[key].includes(id)) state.sessions[key].push(id);
}

function renderCard(item) {
  const template = $('#expressionCardTemplate');
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.id = item.id;
  node.querySelector('.category').textContent = item.category;
  node.querySelector('.level').textContent = item.level;
  node.querySelector('.phrase').textContent = item.phrase;
  node.querySelector('.meaning').textContent = item.meaning_cn;
  node.querySelector('.example').textContent = item.example;
  node.querySelector('.example-cn').textContent = item.example_cn;

  const learnedBtn = node.querySelector('.learned-btn');
  const favBtn = node.querySelector('.fav-btn');
  learnedBtn.textContent = state.learned.has(item.id) ? '已学习' : '标记已学习';
  learnedBtn.classList.toggle('active', state.learned.has(item.id));
  favBtn.textContent = state.favorites.has(item.id) ? '已收藏' : '收藏';
  favBtn.classList.toggle('active', state.favorites.has(item.id));

  node.querySelector('.speak-btn').addEventListener('click', () => speak(`${item.phrase}. ${item.example}`));
  learnedBtn.addEventListener('click', () => {
    if (state.learned.has(item.id)) state.learned.delete(item.id);
    else {
      state.learned.add(item.id);
      ReviewEngine.noteStudy(state, item.id);
      markSession(item.id);
    }
    saveState();
    renderAll();
  });
  node.querySelector('.recall-btn').addEventListener('click', () => startRecall(item.id));
  favBtn.addEventListener('click', () => {
    if (state.favorites.has(item.id)) state.favorites.delete(item.id);
    else state.favorites.add(item.id);
    saveState();
    renderAll();
  });
  return node;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function sample(list) {
  if (!list?.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.86;
  window.speechSynthesis.speak(utterance);
}

function renderList(container, list, emptyText = '暂无内容') {
  container.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }
  list.forEach((item) => container.appendChild(renderCard(item)));
}

function renderToday() {
  const daily = getDailyItems(5);
  renderList($('#todayList'), daily);
  const done = daily.filter((item) => state.learned.has(item.id)).length;
  $('#todayDone').textContent = `${done}/${daily.length}`;
  $('#totalCount').textContent = EXPRESSIONS.length;
  $('#streakCount').textContent = getStreak();
  renderReviewQueue();
}

function getStreak() {
  let count = 0;
  const date = new Date();
  while (true) {
    const key = date.toISOString().slice(0, 10);
    if (state.sessions[key]?.length) {
      count += 1;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

function setupFilters() {
  const categories = ['all', ...new Set(EXPRESSIONS.map((item) => item.category))];
  $('#categoryFilter').innerHTML = categories.map((category) => {
    const label = category === 'all' ? '全部场景' : category;
    return `<option value="${category}">${label}</option>`;
  }).join('');
  $('#searchInput').addEventListener('input', renderLibrary);
  $('#categoryFilter').addEventListener('change', renderLibrary);
  $('#levelFilter').addEventListener('change', renderLibrary);
}

function getFilteredExpressions() {
  const query = $('#searchInput')?.value.trim().toLowerCase() || '';
  const category = $('#categoryFilter')?.value || 'all';
  const level = $('#levelFilter')?.value || 'all';
  return EXPRESSIONS.filter((item) => {
    const text = [item.phrase, item.meaning_cn, item.example, item.example_cn, item.category, ...(item.tags || [])]
      .join(' ')
      .toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    const matchesLevel = level === 'all' || item.level === level;
    return matchesQuery && matchesCategory && matchesLevel;
  });
}

function renderLibrary() {
  const list = getFilteredExpressions();
  $('#resultCount').textContent = list.length;
  renderList($('#libraryList'), list, '没有找到匹配表达。');
}

function renderFavorites() {
  const list = EXPRESSIONS.filter((item) => state.favorites.has(item.id));
  renderList($('#favoriteList'), list, '还没有收藏表达。');
}

function renderProgress() {
  const learned = state.learned.size;
  const favorite = state.favorites.size;
  const completion = EXPRESSIONS.length ? Math.round((learned / EXPRESSIONS.length) * 100) : 0;
  $('#learnedMetric').textContent = learned;
  $('#favoriteMetric').textContent = favorite;
  $('#completionMetric').textContent = `${completion}%`;
  $('#sideLearned').textContent = learned;
  renderPracticeProgress();

  const categories = [...new Set(EXPRESSIONS.map((item) => item.category))];
  $('#categoryProgress').innerHTML = categories.map((category) => {
    const items = EXPRESSIONS.filter((item) => item.category === category);
    const done = items.filter((item) => state.learned.has(item.id)).length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    return `
      <div class="progress-row">
        <strong>${category}</strong>
        <div class="progress-bar" aria-label="${category} 完成度 ${pct}%">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <span>${done}/${items.length}</span>
      </div>
    `;
  }).join('');
}


function setupScenarioSelectors() {
  if (!$('#placeSelect') || !SCENARIO_PACKS.length) return;
  $('#placeSelect').innerHTML = SCENARIO_PACKS.map((place) => (
    `<option value="${escapeHTML(place.id)}">${escapeHTML(place.place)} / ${escapeHTML(place.placeCn)}</option>`
  )).join('');
  $('#placeSelect').addEventListener('change', () => {
    selectedTaskId = null;
    populateTaskSelect();
  });
  if ($('#taskSearch')) $('#taskSearch').addEventListener('input', renderTaskCards);
  if ($('#taskCategoryFilter')) $('#taskCategoryFilter').addEventListener('change', renderTaskCards);
  populateTaskSelect();
  renderScenarioStats();
  renderMarketVocabulary();
  renderMarketScenarioCards();
  renderMarketStats();
}

function populateTaskSelect() {
  const place = getSelectedPlace();
  if (!place || !$('#taskSelect')) return;
  if (!selectedTaskId || !place.tasks.some((task) => task.id === selectedTaskId)) selectedTaskId = place.tasks[0]?.id;
  $('#taskSelect').innerHTML = place.tasks.map((task) => (
    `<option value="${escapeHTML(task.id)}" ${task.id === selectedTaskId ? 'selected' : ''}>${escapeHTML(task.title)} / ${escapeHTML(task.titleCn)}</option>`
  )).join('');
  populateTaskCategoryFilter(place);
  renderTaskCards();
}

function populateTaskCategoryFilter(place) {
  const filter = $('#taskCategoryFilter');
  if (!filter || !place) return;
  const previous = filter.value || 'all';
  const categories = [...new Set(place.tasks.map((task) => task.category || 'General'))].sort();
  filter.innerHTML = '<option value="all">全部目的类型 / All categories</option>' + categories.map((cat) => (
    `<option value="${escapeHTML(cat)}">${escapeHTML(cat)}</option>`
  )).join('');
  filter.value = categories.includes(previous) ? previous : 'all';
}

function renderTaskCards() {
  const grid = $('#taskCardGrid');
  const place = getSelectedPlace();
  if (!grid || !place) return;
  const query = ($('#taskSearch')?.value || '').trim().toLowerCase();
  const category = $('#taskCategoryFilter')?.value || 'all';
  const tasks = place.tasks.filter((task) => {
    const text = `${task.title} ${task.titleCn} ${task.category || ''} ${task.requirement || ''}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesCategory = category === 'all' || task.category === category;
    return matchesQuery && matchesCategory;
  });
  if (!tasks.some((task) => task.id === selectedTaskId) && tasks.length) selectedTaskId = tasks[0].id;
  if ($('#taskSelect')) $('#taskSelect').value = selectedTaskId || '';
  grid.innerHTML = tasks.length ? tasks.map((task) => `
    <button class="task-card ${task.id === selectedTaskId ? 'selected' : ''}" data-task-id="${escapeHTML(task.id)}" type="button">
      <span class="task-category">${escapeHTML(task.category || 'General')}</span>
      <strong>${escapeHTML(task.title)}</strong>
      <em>${escapeHTML(task.titleCn)}</em>
      <small>${escapeHTML(task.level || 'A2-B1')}</small>
    </button>
  `).join('') : '<div class="empty-state task-empty">没有匹配的目的。换一个关键词试试。</div>';
  $$('.task-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectedTaskId = card.dataset.taskId;
      if ($('#taskSelect')) $('#taskSelect').value = selectedTaskId;
      renderTaskCards();
    });
  });
}

function getSelectedPlace() {
  const placeId = $('#placeSelect')?.value || SCENARIO_PACKS[0]?.id;
  return SCENARIO_PACKS.find((place) => place.id === placeId) || SCENARIO_PACKS[0];
}

function getSelectedTask(place) {
  const taskId = selectedTaskId || $('#taskSelect')?.value || place?.tasks?.[0]?.id;
  return place?.tasks?.find((task) => task.id === taskId) || place?.tasks?.[0];
}

function renderScenarioStats() {
  if (!$('#scenarioPlaceCount')) return;
  const taskCount = SCENARIO_PACKS.reduce((sum, place) => sum + place.tasks.length, 0);
  $('#scenarioPlaceCount').textContent = SCENARIO_PACKS.length;
  $('#scenarioTaskCount').textContent = taskCount;
  $('#scenarioRunCount').textContent = state.scenarios?.runs || 0;
}

function startScenario({ fullyRandom = false } = {}) {
  if (!SCENARIO_PACKS.length) return;
  const mode = fullyRandom ? 'challenge' : ($('#challengeMode')?.value || 'guided');
  let place = fullyRandom ? sample(SCENARIO_PACKS) : getSelectedPlace();
  if (mode === 'challenge' && Math.random() < 0.35) place = sample(SCENARIO_PACKS);
  let task = getSelectedTask(place);
  if (fullyRandom || mode === 'random' || mode === 'challenge') task = sample(place.tasks);
  const contextIndex = Math.floor(Math.random() * (task.contexts?.length || 1));
  const complicationChance = mode === 'challenge' ? 1 : mode === 'random' ? 0.75 : 0.55;
  const complication = (task.complications?.length && Math.random() < complicationChance) ? sample(task.complications) : null;

  const arrivalIndex = Math.floor(Math.random() * (place.arrivalLines?.length || 1));
  activeScenario = {
    place,
    task,
    context: task.contexts?.[contextIndex] || '',
    contextCn: task.contextsCn?.[contextIndex] || '',
    complication,
    mode,
    mood: sample(SCENARIO_MOODS),
    timeSlot: sample(TIME_SLOTS),
    arrival: place.arrivalLines?.[arrivalIndex] || '',
    arrivalCn: place.arrivalLinesCn?.[arrivalIndex] || '',
    nodeId: task.startNode || 'start',
    turns: 0,
    score: 0,
    maxScore: 0,
    transcript: [],
    complicationTriggered: false,
    outcomeMarked: false,
  };

  state.scenarios = state.scenarios || { runs: 0, completed: 0, success: 0 };
  state.scenarios.runs += 1;
  saveState();
  renderScenarioStats();
  renderCurrentScenario();
}

function resetScenario() {
  activeScenario = null;
  if ($('#dialogueTitle')) $('#dialogueTitle').textContent = '等待开始';
  if ($('#dialogueBox')) $('#dialogueBox').className = 'dialogue-box empty-state';
  if ($('#dialogueBox')) $('#dialogueBox').textContent = '点击“开始模拟”后，这里会出现沉浸式情景、工作人员问题和你的可选回答。';
  if ($('#choiceBox')) $('#choiceBox').innerHTML = '';
  if ($('#outcomeBox')) $('#outcomeBox').innerHTML = '';
  if ($('#transcriptList')) {
    $('#transcriptList').className = 'transcript-list empty-state';
    $('#transcriptList').textContent = '暂无记录。';
  }
  if ($('#missionCard')) {
    $('#missionCard').className = 'mission-card empty';
    $('#missionCard').textContent = '还没有开始模拟。选择场所和今天要办的事后点击开始。';
  }
}

function getCurrentScenarioNode() {
  if (!activeScenario) return null;
  if (activeScenario.nodeId === '__complication__') return activeScenario.complication?.node || null;
  return activeScenario.task.nodes[activeScenario.nodeId] || null;
}

function renderMissionCard() {
  if (!activeScenario || !$('#missionCard')) return;
  const { place, task, context, contextCn, complication, mode, mood, timeSlot, arrival, arrivalCn } = activeScenario;
  $('#missionCard').className = 'mission-card situation-card';
  $('#missionCard').innerHTML = `
    <div class="situation-head">
      <span class="eyebrow">Situation Card</span>
      <h3>${escapeHTML(place.place)} · ${escapeHTML(timeSlot?.en || '')}</h3>
      <p>${escapeHTML(place.placeCn)} · ${escapeHTML(timeSlot?.cn || '')}</p>
    </div>
    <div class="situation-story">
      <p>${escapeHTML(arrival)}</p>
      <p>${escapeHTML(arrivalCn)}</p>
    </div>
    <div class="situation-grid">
      <div><span>Today’s errand</span><strong>${escapeHTML(task.title)}</strong><em>${escapeHTML(task.titleCn)}</em></div>
      <div><span>Mode</span><strong>${escapeHTML(mode)}</strong><em>随机生成本次练习</em></div>
      <div><span>Staff mood</span><strong>${escapeHTML(mood?.en || '')} / ${escapeHTML(mood?.cn || '')}</strong><em>${escapeHTML(mood?.note || '')}</em></div>
      <div><span>Task type</span><strong>${escapeHTML(task.category || 'General')}</strong><em>${escapeHTML(task.level || 'A2-B1')}</em></div>
    </div>
    <div class="mission-context"><strong>随机背景 Random context</strong><p>${escapeHTML(context)}</p><p>${escapeHTML(contextCn)}</p></div>
    <div class="mission-context complication"><strong>随机突发 Complication</strong><p>${escapeHTML(complication ? complication.prompt : 'No major complication this time. Focus on completing the errand clearly.')}</p><p>${escapeHTML(complication ? complication.promptCn : '本次没有强制突发情况，重点练清楚完成办事目标。')}</p></div>
    <div class="mission-context phrase-preview"><strong>Opening phrase</strong><p>${escapeHTML(task.phrase || '')}</p><p>${escapeHTML(task.phraseCn || '')}</p></div>
  `;
}

function renderCurrentScenario() {
  if (!activeScenario) return;
  const node = getCurrentScenarioNode();
  renderMissionCard();
  renderTranscript();
  if (!node) {
    $('#dialogueBox').className = 'dialogue-box empty-state';
    $('#dialogueBox').textContent = '这个分支暂时没有后续节点。';
    $('#choiceBox').innerHTML = '';
    return;
  }

  $('#dialogueTitle').textContent = `${activeScenario.place.place} · ${activeScenario.task.titleCn} · ${activeScenario.mood?.cn || ''}`;
  $('#dialogueBox').className = 'dialogue-box';
  $('#dialogueBox').innerHTML = `
    <div class="speaker-chip">${escapeHTML(node.speaker)}</div>
    <p class="dialogue-en">${escapeHTML(node.en)}</p>
    <p class="dialogue-cn">${escapeHTML(node.cn)}</p>
  `;

  if (node.outcome) {
    $('#choiceBox').innerHTML = '';
    renderOutcome(node);
    return;
  }

  $('#outcomeBox').innerHTML = '';
  $('#choiceBox').innerHTML = (node.choices || []).map((choice, index) => `
    <button class="choice-btn" data-choice-index="${index}" type="button">
      <span class="choice-key">${String.fromCharCode(65 + index)}</span>
      <span><strong>${escapeHTML(choice.en)}</strong><em>${escapeHTML(choice.cn)}</em></span>
    </button>
  `).join('');

  $$('.choice-btn').forEach((btn) => {
    btn.addEventListener('click', () => chooseScenarioReply(Number(btn.dataset.choiceIndex)));
  });
}

function chooseScenarioReply(choiceIndex) {
  if (!activeScenario) return;
  const node = getCurrentScenarioNode();
  const choice = node?.choices?.[choiceIndex];
  if (!node || !choice) return;

  activeScenario.transcript.push({ speaker: node.speaker, en: node.en, cn: node.cn });
  activeScenario.transcript.push({ speaker: 'You', en: choice.en, cn: choice.cn });
  activeScenario.turns += 1;
  activeScenario.score += choice.score || 0;
  activeScenario.maxScore += 2;

  let nextNodeId = choice.next || 'success';
  const nextNode = activeScenario.task.nodes[nextNodeId];
  const shouldTriggerComplication = activeScenario.complication
    && !activeScenario.complicationTriggered
    && activeScenario.turns >= activeScenario.complication.afterTurns
    && nextNode
    && !nextNode.outcome;

  if (shouldTriggerComplication) {
    activeScenario.complicationTriggered = true;
    activeScenario.nodeId = '__complication__';
  } else {
    activeScenario.nodeId = nextNodeId;
  }

  renderCurrentScenario();
}

function renderTranscript() {
  if (!$('#transcriptList')) return;
  if (!activeScenario?.transcript?.length) {
    $('#transcriptList').className = 'transcript-list empty-state';
    $('#transcriptList').textContent = '暂无记录。';
    return;
  }
  $('#transcriptList').className = 'transcript-list';
  $('#transcriptList').innerHTML = activeScenario.transcript.map((line) => `
    <div class="transcript-item ${line.speaker === 'You' ? 'user-line' : ''}">
      <strong>${escapeHTML(line.speaker)}</strong>
      <p>${escapeHTML(line.en)}</p>
      <span>${escapeHTML(line.cn)}</span>
    </div>
  `).join('');
}

function renderOutcome(node) {
  if (!activeScenario.outcomeMarked) {
    activeScenario.outcomeMarked = true;
    state.scenarios = state.scenarios || { runs: 0, completed: 0, success: 0 };
    state.scenarios.completed += 1;
    if (node.outcome === 'success') state.scenarios.success += 1;
    saveState();
    renderScenarioStats();
  }
  const pct = activeScenario.maxScore ? Math.round((activeScenario.score / activeScenario.maxScore) * 100) : 0;
  const userLines = activeScenario.transcript.filter((line) => line.speaker === 'You').slice(-4);
  const label = node.outcome === 'success' ? '完成成功' : '部分完成';
  $('#outcomeBox').innerHTML = `
    <div class="result-card ${node.outcome}">
      <span class="result-label">${label}</span>
      <h3>${escapeHTML(node.cn)}</h3>
      <p>${escapeHTML(node.en)}</p>
      <div class="score-pill">Dialogue score: ${pct}%</div>
      <div class="review-list">
        <strong>本次可复习表达</strong>
        ${userLines.map((line) => `<p>${escapeHTML(line.en)}<br><span>${escapeHTML(line.cn)}</span></p>`).join('')}
      </div>
    </div>
  `;
}


function renderMarketStats() {
  if (!$('#marketTermCount')) return;
  $('#marketTermCount').textContent = MARKET_VOCAB.length;
  $('#marketScenarioCount').textContent = MARKET_SCENARIOS.length;
  $('#marketLearnedCount').textContent = state.marketLearned.size;
  if ($('#marketQuizScore')) $('#marketQuizScore').textContent = `${state.marketQuiz.correct} / ${state.marketQuiz.total}`;
}

function setupMarketModule() {
  if (!$('#marketCategoryFilter')) return;
  const vocabCategories = ['all', ...new Set(MARKET_VOCAB.map((item) => item.category))];
  $('#marketCategoryFilter').innerHTML = vocabCategories.map((category) => (
    `<option value="${escapeHTML(category)}">${category === 'all' ? '全部类别 / All categories' : escapeHTML(category)}</option>`
  )).join('');
  const scenarioCategories = ['all', ...new Set(MARKET_SCENARIOS.map((item) => item.category))];
  $('#marketScenarioCategory').innerHTML = scenarioCategories.map((category) => (
    `<option value="${escapeHTML(category)}">${category === 'all' ? '全部场景类型 / All scenarios' : escapeHTML(category)}</option>`
  )).join('');
  if (!selectedMarketScenarioId && MARKET_SCENARIOS.length) selectedMarketScenarioId = MARKET_SCENARIOS[0].id;
  ['#marketSearch', '#marketCategoryFilter', '#marketLevelFilter', '#marketStatusFilter'].forEach((selector) => {
    const element = $(selector);
    if (element) element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', renderMarketVocabulary);
  });
  if ($('#marketScenarioSearch')) $('#marketScenarioSearch').addEventListener('input', renderMarketScenarioCards);
  if ($('#marketScenarioCategory')) $('#marketScenarioCategory').addEventListener('change', renderMarketScenarioCards);
  $$('.market-tab').forEach((button) => button.addEventListener('click', () => setMarketTab(button.dataset.marketTab)));
  renderMarketVocabulary();
  renderMarketScenarioCards();
  renderMarketStats();
}

function setMarketTab(tabName) {
  $$('.market-tab').forEach((button) => button.classList.toggle('active', button.dataset.marketTab === tabName));
  $$('.market-tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `market-tab-${tabName}`));
  if (tabName === 'vocabulary') renderMarketVocabulary();
  if (tabName === 'situations') renderMarketScenarioCards();
  if (tabName === 'quiz' && !currentMarketQuizAnswer) renderMarketQuiz();
}

function getFilteredMarketVocabulary() {
  const query = ($('#marketSearch')?.value || '').trim().toLowerCase();
  const category = $('#marketCategoryFilter')?.value || 'all';
  const level = $('#marketLevelFilter')?.value || 'all';
  const status = $('#marketStatusFilter')?.value || 'all';
  return MARKET_VOCAB.filter((item) => {
    const text = [item.term, item.termCn, item.definition, item.definitionCn, item.example, item.exampleCn, item.category, ...(item.tags || [])].join(' ').toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    const matchesLevel = level === 'all' || item.level === level;
    const matchesStatus = status === 'all'
      || (status === 'learned' && state.marketLearned.has(item.id))
      || (status === 'favorite' && state.marketFavorites.has(item.id))
      || (status === 'unlearned' && !state.marketLearned.has(item.id));
    return matchesQuery && matchesCategory && matchesLevel && matchesStatus;
  });
}

function renderMarketVocabulary() {
  const grid = $('#marketVocabGrid');
  if (!grid) return;
  const list = getFilteredMarketVocabulary();
  $('#marketResultCount').textContent = list.length;
  grid.innerHTML = list.length ? list.map((item) => {
    const learned = state.marketLearned.has(item.id);
    const favorite = state.marketFavorites.has(item.id);
    return `
      <article class="market-term-card" data-market-term-id="${escapeHTML(item.id)}">
        <div class="expr-topline"><span class="badge category">${escapeHTML(item.category)}</span><span class="badge level">${escapeHTML(item.level)}</span></div>
        <h3>${escapeHTML(item.term)}</h3>
        <p class="market-term-cn">${escapeHTML(item.termCn)}</p>
        <p class="market-definition">${escapeHTML(item.definition)}</p>
        <p class="market-definition-cn">${escapeHTML(item.definitionCn)}</p>
        <div class="market-example"><strong>Example</strong><p>${escapeHTML(item.example)}</p><span>${escapeHTML(item.exampleCn)}</span></div>
        <div class="card-actions">
          <button class="small-btn market-speak-term" type="button">朗读</button>
          <button class="small-btn market-learn-btn ${learned ? 'active' : ''}" type="button">${learned ? '已掌握' : '标记掌握'}</button>
          <button class="small-btn market-fav-btn ${favorite ? 'active' : ''}" type="button">${favorite ? '已收藏' : '收藏'}</button>
        </div>
      </article>`;
  }).join('') : '<div class="empty-state">没有找到匹配的市场术语。</div>';
  $$('.market-term-card').forEach((card) => {
    const item = MARKET_VOCAB.find((entry) => entry.id === card.dataset.marketTermId);
    card.querySelector('.market-speak-term').addEventListener('click', () => speak(`${item.term}. ${item.definition}. ${item.example}`));
    card.querySelector('.market-learn-btn').addEventListener('click', () => {
      if (state.marketLearned.has(item.id)) state.marketLearned.delete(item.id); else state.marketLearned.add(item.id);
      saveState(); renderMarketVocabulary(); renderMarketStats();
    });
    card.querySelector('.market-fav-btn').addEventListener('click', () => {
      if (state.marketFavorites.has(item.id)) state.marketFavorites.delete(item.id); else state.marketFavorites.add(item.id);
      saveState(); renderMarketVocabulary();
    });
  });
}

function getFilteredMarketScenarios() {
  const query = ($('#marketScenarioSearch')?.value || '').trim().toLowerCase();
  const category = $('#marketScenarioCategory')?.value || 'all';
  return MARKET_SCENARIOS.filter((item) => {
    const text = [item.title, item.titleCn, item.category, item.setup, item.setupCn, item.objective, item.objectiveCn, ...(item.keywords || [])].join(' ').toLowerCase();
    return (!query || text.includes(query)) && (category === 'all' || item.category === category);
  });
}

function renderMarketScenarioCards() {
  const grid = $('#marketScenarioGrid');
  if (!grid) return;
  const list = getFilteredMarketScenarios();
  if (!list.some((item) => item.id === selectedMarketScenarioId) && list.length) selectedMarketScenarioId = list[0].id;
  grid.innerHTML = list.length ? list.map((item) => `
    <button class="market-scenario-card ${item.id === selectedMarketScenarioId ? 'selected' : ''}" data-market-scenario-id="${escapeHTML(item.id)}" type="button">
      <span>${escapeHTML(item.category)}</span>
      <strong>${escapeHTML(item.title)}</strong>
      <em>${escapeHTML(item.titleCn)}</em>
      <small>${escapeHTML(item.keywords.slice(0, 3).join(' · '))}</small>
    </button>
  `).join('') : '<div class="empty-state">没有找到匹配场景。</div>';
  $$('.market-scenario-card').forEach((card) => card.addEventListener('click', () => {
    selectedMarketScenarioId = card.dataset.marketScenarioId;
    renderMarketScenarioCards();
    previewMarketMission();
  }));
  previewMarketMission();
}

function getSelectedMarketScenario() {
  return MARKET_SCENARIOS.find((item) => item.id === selectedMarketScenarioId) || MARKET_SCENARIOS[0];
}

function previewMarketMission() {
  const item = getSelectedMarketScenario();
  if (!item || !$('#marketMissionCard') || activeMarketScenario) return;
  $('#marketMissionCard').className = 'market-mission-card';
  $('#marketMissionCard').innerHTML = `
    <span class="eyebrow">Selected Practice</span>
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.titleCn)}</p>
    <div class="market-mission-grid">
      <div><span>Role</span><strong>${escapeHTML(item.role)}</strong><em>${escapeHTML(item.roleCn)}</em></div>
      <div><span>Category</span><strong>${escapeHTML(item.category)}</strong><em>${escapeHTML(item.level)}</em></div>
    </div>
    <div class="mission-context"><strong>Situation</strong><p>${escapeHTML(item.setup)}</p><p>${escapeHTML(item.setupCn)}</p></div>
    <div class="mission-context phrase-preview"><strong>Communication goal</strong><p>${escapeHTML(item.objective)}</p><p>${escapeHTML(item.objectiveCn)}</p></div>`;
}

function startMarketScenario({ random = false } = {}) {
  if (!MARKET_SCENARIOS.length) return;
  const item = random ? sample(MARKET_SCENARIOS) : getSelectedMarketScenario();
  selectedMarketScenarioId = item.id;
  const complication = sample(item.complications || []);
  activeMarketScenario = {
    item,
    complication,
    nodeId: item.startNode || 'start',
    transcript: [],
    score: 0,
    maxScore: 0,
    outcomeMarked: false,
  };
  state.marketScenarios.runs += 1;
  saveState();
  renderMarketScenarioCards();
  renderMarketScenario();
  renderMarketStats();
}

function materializeMarketNode(node) {
  if (!node || !activeMarketScenario) return node;
  const complication = activeMarketScenario.complication || { en: 'The available information is incomplete.', cn: '现有信息并不完整。' };
  return {
    ...node,
    en: String(node.en || '').replaceAll('{complication}', complication.en),
    cn: String(node.cn || '').replaceAll('{complicationCn}', complication.cn),
  };
}

function getCurrentMarketNode() {
  if (!activeMarketScenario) return null;
  return materializeMarketNode(activeMarketScenario.item.nodes[activeMarketScenario.nodeId]);
}

function renderMarketScenario() {
  if (!activeMarketScenario) return;
  const { item, complication } = activeMarketScenario;
  $('#marketMissionCard').className = 'market-mission-card active';
  $('#marketMissionCard').innerHTML = `
    <div class="situation-head market-situation-head"><span class="eyebrow">Market Situation</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.titleCn)}</p></div>
    <div class="mission-context"><strong>Context</strong><p>${escapeHTML(item.setup)}</p><p>${escapeHTML(item.setupCn)}</p></div>
    <div class="mission-context"><strong>Your communication goal</strong><p>${escapeHTML(item.objective)}</p><p>${escapeHTML(item.objectiveCn)}</p></div>
    <div class="mission-context complication"><strong>Random complication</strong><p>${escapeHTML(complication?.en || '')}</p><p>${escapeHTML(complication?.cn || '')}</p></div>
    <div class="market-keywords"><strong>Key terms</strong>${item.keywords.map((term) => `<span>${escapeHTML(term)}</span>`).join('')}</div>`;
  const node = getCurrentMarketNode();
  $('#marketDialogueBox').className = 'dialogue-box';
  $('#marketDialogueBox').innerHTML = `<div class="speaker-chip">${escapeHTML(node.speaker)}</div><p class="dialogue-en">${escapeHTML(node.en)}</p><p class="dialogue-cn">${escapeHTML(node.cn)}</p>`;
  if (node.outcome) {
    $('#marketChoiceBox').innerHTML = '';
    renderMarketOutcome(node);
  } else {
    $('#marketOutcomeBox').innerHTML = '';
    $('#marketChoiceBox').innerHTML = (node.choices || []).map((choice,index) => `
      <button class="choice-btn market-choice" data-market-choice-index="${index}" type="button"><span class="choice-key">${String.fromCharCode(65+index)}</span><span><strong>${escapeHTML(choice.en)}</strong><em>${escapeHTML(choice.cn)}</em></span></button>`).join('');
    $$('.market-choice').forEach((button) => button.addEventListener('click', () => chooseMarketReply(Number(button.dataset.marketChoiceIndex))));
  }
  renderMarketTranscript();
}

function chooseMarketReply(index) {
  const node = getCurrentMarketNode();
  const choice = node?.choices?.[index];
  if (!choice) return;
  activeMarketScenario.transcript.push({ speaker: node.speaker, en: node.en, cn: node.cn });
  activeMarketScenario.transcript.push({ speaker: 'You', en: choice.en, cn: choice.cn });
  activeMarketScenario.score += choice.score || 0;
  activeMarketScenario.maxScore += 2;
  activeMarketScenario.nodeId = choice.next;
  renderMarketScenario();
}

function renderMarketTranscript() {
  const box = $('#marketTranscript');
  if (!box) return;
  if (!activeMarketScenario?.transcript.length) {
    box.className = 'transcript-list empty-state';
    box.textContent = '暂无记录。';
    return;
  }
  box.className = 'transcript-list';
  box.innerHTML = activeMarketScenario.transcript.map((line) => `<div class="transcript-item ${line.speaker === 'You' ? 'user-line' : ''}"><strong>${escapeHTML(line.speaker)}</strong><p>${escapeHTML(line.en)}</p><span>${escapeHTML(line.cn)}</span></div>`).join('');
}

function renderMarketOutcome(node) {
  if (!activeMarketScenario.outcomeMarked) {
    activeMarketScenario.outcomeMarked = true;
    state.marketScenarios.completed += 1;
    if (node.outcome === 'success') state.marketScenarios.success += 1;
    saveState();
  }
  const pct = activeMarketScenario.maxScore ? Math.round(activeMarketScenario.score / activeMarketScenario.maxScore * 100) : 0;
  $('#marketOutcomeBox').innerHTML = `<div class="result-card ${node.outcome}"><span class="result-label">${node.outcome === 'success' ? '完成成功' : '部分完成'}</span><h3>${escapeHTML(node.cn)}</h3><p>${escapeHTML(node.en)}</p><div class="score-pill">Communication score: ${pct}%</div><p class="market-outcome-note">重点：区分事实、解释和不确定性；本模块仅用于英语学习。</p></div>`;
  renderMarketStats();
}

function resetMarketScenario() {
  activeMarketScenario = null;
  $('#marketDialogueBox').className = 'dialogue-box empty-state';
  $('#marketDialogueBox').textContent = '尚未开始。';
  $('#marketChoiceBox').innerHTML = '';
  $('#marketOutcomeBox').innerHTML = '';
  $('#marketTranscript').className = 'transcript-list empty-state';
  $('#marketTranscript').textContent = '暂无记录。';
  previewMarketMission();
}

function renderMarketQuiz() {
  if (!MARKET_VOCAB.length) return;
  const answer = sample(MARKET_VOCAB);
  currentMarketQuizAnswer = answer;
  const distractors = MARKET_VOCAB.filter((item) => item.id !== answer.id && item.category !== answer.category).sort(() => Math.random() - 0.5).slice(0,3);
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  $('#marketQuizQuestion').textContent = `“${answer.definitionCn}” 对应哪个英文术语？`;
  $('#marketQuizFeedback').textContent = '';
  $('#marketQuizOptions').innerHTML = options.map((item) => `<button class="quiz-option market-quiz-option" data-market-id="${escapeHTML(item.id)}" type="button">${escapeHTML(item.term)}<br><small>${escapeHTML(item.termCn)}</small></button>`).join('');
  $$('.market-quiz-option').forEach((button) => button.addEventListener('click', handleMarketQuizAnswer));
  renderMarketStats();
}

function handleMarketQuizAnswer(event) {
  const button = event.currentTarget;
  const correct = button.dataset.marketId === currentMarketQuizAnswer.id;
  state.marketQuiz.total += 1;
  if (correct) {
    state.marketQuiz.correct += 1;
    state.marketLearned.add(currentMarketQuizAnswer.id);
  }
  $$('.market-quiz-option').forEach((option) => {
    option.disabled = true;
    if (option.dataset.marketId === currentMarketQuizAnswer.id) option.classList.add('correct');
  });
  if (!correct) button.classList.add('wrong');
  $('#marketQuizFeedback').textContent = correct ? '正确，已标记为掌握。' : `答案是：${currentMarketQuizAnswer.term} / ${currentMarketQuizAnswer.termCn}`;
  saveState();
  renderMarketStats();
}

function renderQuiz() {
  if (!EXPRESSIONS.length) return;
  const answer = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
  currentQuizAnswer = answer;
  quizAnswered = false;
  const pool = EXPRESSIONS
    .filter((item) => item.id !== answer.id && item.category !== answer.category)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [...pool, answer].sort(() => Math.random() - 0.5);
  $('#quizQuestion').textContent = `“${answer.meaning_cn}” 用英语怎么说？`;
  $('#quizFeedback').textContent = '';
  $('#quizOptions').innerHTML = options.map((item) => (
    `<button class="quiz-option" data-id="${item.id}" type="button">${item.phrase}</button>`
  )).join('');
  $$('.quiz-option').forEach((btn) => btn.addEventListener('click', handleQuizAnswer));
}

function handleQuizAnswer(event) {
  if (!currentQuizAnswer || quizAnswered) return;
  quizAnswered = true;
  const btn = event.currentTarget;
  const isCorrect = btn.dataset.id === currentQuizAnswer.id;
  state.quiz.total += 1;
  if (isCorrect) {
    state.quiz.correct += 1;
    state.learned.add(currentQuizAnswer.id);
    markSession(currentQuizAnswer.id);
  }
  ReviewEngine.recordAttempt(state, currentQuizAnswer.id, { mode: 'choice', outcome: isCorrect ? 'correct' : 'incorrect' });
  $$('.quiz-option').forEach((option) => {
    option.disabled = true;
    if (option.dataset.id === currentQuizAnswer.id) option.classList.add('correct');
  });
  if (!isCorrect) btn.classList.add('wrong');
  $('#quizFeedback').textContent = isCorrect
    ? '选择正确，已标记为已学习；主动回忆与延迟回忆另行记录。'
    : `答案是：${currentQuizAnswer.phrase}`;
  saveState();
  renderProgress();
  renderToday();
}

function setView(viewName) {
  $$('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewName));
  $$('.view').forEach((view) => view.classList.remove('active'));
  $(`#view-${viewName}`).classList.add('active');
  document.body.classList.toggle('scenario-focus', viewName === 'scenarios');
  if (viewName === 'library') renderLibrary();
  if (viewName === 'favorites') renderFavorites();
  if (viewName === 'progress') renderProgress();
  if (viewName === 'quiz') setPracticeMode($('#practiceMode').value);
  if (viewName === 'scenarios') renderScenarioStats();
  if (viewName === 'market') { renderMarketVocabulary(); renderMarketScenarioCards(); renderMarketStats(); }
}

function getNextTheme(theme) {
  const themes = ['light', 'dark', 'pink'];
  const index = themes.indexOf(theme);
  return themes[(index + 1) % themes.length];
}

function applyTheme() {
  const safeTheme = ['light', 'dark', 'pink'].includes(state.theme) ? state.theme : 'light';
  state.theme = safeTheme;
  document.documentElement.dataset.theme = safeTheme;
  const labels = {
    light: '深色模式',
    dark: '粉色模式',
    pink: '浅色模式',
  };
  $('#themeToggle').textContent = labels[safeTheme];
}

function exportProgress() {
  const payload = JSON.stringify({
    app: 'Daily English Lab',
    exportedAt: new Date().toISOString(),
    ...progressPayload(),
  }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily-english-lab-progress-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const restored = parseProgress(data);
      Object.assign(state, restored);
      stateWarning = '';
      activeRecall = null;
      currentQuizAnswer = null;
      quizAnswered = false;
      resetScenario();
      resetMarketScenario();
      applyTheme();
      const saved = saveState();
      renderAll();
      if ($('#view-quiz').classList.contains('active')) setPracticeMode($('#practiceMode').value);
      alert(saved ? '进度已导入。' : '进度已载入，但浏览器未能保存，请导出备份。');
    } catch (error) {
      alert(`导入失败：${error.message} 原有进度未改变。`);
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  renderToday();
  renderLibrary();
  renderFavorites();
  renderProgress();
  renderScenarioStats();
  renderMarketVocabulary();
  renderMarketScenarioCards();
  renderMarketStats();
}


function bindEvents() {
  setupPractice();
  $$('.nav-btn').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));
  $('#newQuizBtn').addEventListener('click', renderQuiz);
  $('#themeToggle').addEventListener('click', () => {
    state.theme = getNextTheme(state.theme);
    saveState();
    applyTheme();
  });
  $('#exportBtn').addEventListener('click', exportProgress);
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('确定要清空本地学习进度吗？')) return;
    state.learned.clear();
    state.favorites.clear();
    state.sessions = {};
    state.quiz = { correct: 0, total: 0 };
    state.scenarios = { runs: 0, completed: 0, success: 0 };
    state.marketLearned.clear();
    state.marketFavorites.clear();
    state.marketQuiz = { correct: 0, total: 0 };
    state.marketScenarios = { runs: 0, completed: 0, success: 0 };
    state.schemaVersion = 2;
    state.reviewSchedule = {};
    state.practiceHistory = [];
    state.dailyPlan = null;
    stateWarning = '';
    activeRecall = null;
    currentQuizAnswer = null;
    quizAnswered = false;
    resetScenario();
    resetMarketScenario();
    saveState();
    renderAll();
    if ($('#view-quiz').classList.contains('active')) setPracticeMode($('#practiceMode').value);
  });
  if ($('#startScenarioBtn')) $('#startScenarioBtn').addEventListener('click', () => startScenario());
  if ($('#randomScenarioBtn')) $('#randomScenarioBtn').addEventListener('click', () => startScenario({ fullyRandom: true }));
  if ($('#scenarioBackBtn')) $('#scenarioBackBtn').addEventListener('click', () => setView('today'));
  if ($('#resetScenarioBtn')) $('#resetScenarioBtn').addEventListener('click', resetScenario);
  if ($('#speakCurrentBtn')) $('#speakCurrentBtn').addEventListener('click', () => {
    const node = getCurrentScenarioNode();
    if (node) speak(node.en);
  });
  if ($('#startMarketScenarioBtn')) $('#startMarketScenarioBtn').addEventListener('click', () => startMarketScenario());
  if ($('#randomMarketScenarioBtn')) $('#randomMarketScenarioBtn').addEventListener('click', () => startMarketScenario({ random: true }));
  if ($('#resetMarketScenarioBtn')) $('#resetMarketScenarioBtn').addEventListener('click', resetMarketScenario);
  if ($('#speakMarketLineBtn')) $('#speakMarketLineBtn').addEventListener('click', () => { const node = getCurrentMarketNode(); if (node) speak(node.en); });
  if ($('#newMarketQuizBtn')) $('#newMarketQuizBtn').addEventListener('click', renderMarketQuiz);
  $('#importInput').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) importProgress(file);
  });
}

function init() {
  setupFilters();
  setupScenarioSelectors();
  setupMarketModule();
  bindEvents();
  applyTheme();
  renderAll();
  if (stateWarning) {
    $('#storageNotice').textContent = stateWarning;
    $('#storageNotice').hidden = false;
  }
}

init();
