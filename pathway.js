(() => {
  'use strict';
  const catalog = PATHWAY_CATALOG, engine = window.PathwayProgress;
  const root = document.getElementById('view-pathway');
  if (!catalog.length) return;
  let levelId = state.pathwayProgress.levelId, lessonId = state.pathwayProgress.lessonId, mode = 'lessons';
  let saveTimer = null, pendingLesson = null, speechRun = 0, speaking = false;
  let snapshot = JSON.stringify(state.pathwayProgress);
  const drafts = new Map(), checks = new Map();
  const esc = escapeHTML;
  const paragraphs = (text) => String(text).split(/\n+/).filter(Boolean).map((line) => `<p>${esc(line)}</p>`).join('');
  const level = () => catalog.find((item) => item.id === levelId) || catalog[0];
  const lesson = () => level().lessons.find((item) => item.id === lessonId) || level().lessons[0];
  const record = (id) => state.pathwayProgress.lessons[id];
  const notice = (message) => { const node = root.querySelector('#pathwayNotice'); if (node) node.textContent = message; };
  function save(next) {
    try {
      const candidate = freshProgressCopy(); candidate.pathwayProgress = next;
      if (!persistReplacement(candidate)) throw new Error('save');
      snapshot = JSON.stringify(state.pathwayProgress); notice(''); return true;
    } catch { notice('保存失败，原记录未改变。尚未保存的输入暂留在本页，请重试或复制文本备份。'); return false; }
  }
  function commitDraft(id) {
    const draft = drafts.get(id); if (!draft) return true;
    try {
      const next = engine.saveProduction(state.pathwayProgress, catalog, id, draft);
      next.levelId = state.pathwayProgress.levelId; next.lessonId = state.pathwayProgress.lessonId;
      const saved = save(next);
      if (saved) drafts.delete(id);
      const label = root.querySelector('#pathwayDraftStatus');
      if (label) label.textContent = saved ? '草稿已保存在当前浏览器。' : '草稿未保存，请重试或复制备份。';
      updateMetrics(); renderToday(); return saved;
    } catch (error) { notice(error.message); return false; }
  }
  window.flushPathwayDraft = () => {
    clearTimeout(saveTimer); saveTimer = null;
    pendingLesson = null;
    for (const id of [...drafts.keys()]) commitDraft(id);
    return drafts.size === 0;
  };
  window.addEventListener('beforeunload', (event) => {
    window.flushPathwayDraft();
    const assessmentPending = [...checks.values()].some((draft) => !draft.submitted && (draft.answers.some((answer) => answer !== null) || draft.writing.trim() || draft.speaking.trim()));
    if (drafts.size || assessmentPending) { event.preventDefault(); event.returnValue = ''; }
  });
  window.stopPathwaySpeech = () => { speechRun += 1; if (speaking) window.speechSynthesis?.cancel(); speaking = false; };
  function speak(text, status, rate = 1) {
    window.stopPathwaySpeech(); window.stopFoundationSpeech?.();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { status.textContent = '设备不支持朗读。可展开文本完成辅助阅读练习。'; return; }
    const run = ++speechRun, utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; utterance.rate = rate;
    const voice = window.speechSynthesis.getVoices?.().find((item) => /^en[-_]US$/i.test(item.lang));
    if (voice) utterance.voice = voice;
    speaking = true; status.textContent = '正在准备播放。';
    utterance.onstart = () => { if (run === speechRun) status.textContent = '正在播放，可随时停止或重听。'; };
    utterance.onend = () => { if (run === speechRun) { speaking = false; status.textContent = '播放结束。'; } };
    utterance.onerror = (event) => { if (run === speechRun) { speaking = false; status.textContent = ['canceled', 'interrupted'].includes(event.error) ? '已停止。' : '播放不可用，可展开文本完成辅助阅读练习。'; } };
    try { window.speechSynthesis.speak(utterance); } catch { speaking = false; status.textContent = '播放不可用，请使用文本。'; }
  }
  function sourceLinks(sources) {
    return sources.map((source) => {
      try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password ? `<li><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>` : ''; }
      catch { return ''; }
    }).join('');
  }
  function audioMarkup(item, testing = false) {
    return `<section class="pathway-listening"><h4>${esc(item.title)}</h4>${item.focus ? `<p>${esc(item.focus)}</p>` : ''}<div class="pathway-audio-controls"><button type="button" class="small-btn pathway-play">播放材料</button><button type="button" class="small-btn pathway-stop">停止</button><label>速度 <select class="pathway-rate" aria-label="播放速度"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select></label></div><p class="pathway-audio-status" role="status"></p><details class="pathway-transcript"><summary>查看听力文本${testing ? '（记录为使用文本辅助）' : '与核对'}</summary><div lang="en">${paragraphs(item.text)}</div></details><small>设备合成语音用于练习；语速、音色与真人讲座不同。${testing ? '不使用文本时建议先听两遍再作答。' : '先听并记关键词，再展开文本核对。'}</small></section>`;
  }
  function bindAudio(container, item, onTranscript) {
    const status = container.querySelector('.pathway-audio-status');
    container.querySelector('.pathway-play').addEventListener('click', () => speak(item.text, status, Number(container.querySelector('.pathway-rate').value)));
    container.querySelector('.pathway-stop').addEventListener('click', () => { window.stopPathwaySpeech(); status.textContent = '已停止。'; });
    if (onTranscript) container.querySelector('.pathway-transcript').addEventListener('toggle', (event) => { if (event.currentTarget.open) onTranscript(); });
  }
  function updateMetrics() {
    const info = engine.summary(state.pathwayProgress, catalog, level().id);
    const node = root.querySelector('#pathwayMetrics');
    if (node) node.innerHTML = `<span><strong>${info.completed}/${info.total}</strong> 课完成练习与自评</span><span><strong>${info.due}</strong> 课到期复习</span><span><strong>${info.assessmentCount}</strong> 次阶段测评记录</span>`;
  }
  function select(nextLevelId, nextLessonId, focus = false) {
    window.flushPathwayDraft(); window.stopPathwaySpeech();
    levelId = nextLevelId;
    lessonId = nextLessonId || level().lessons[0].id;
    save(engine.visit(state.pathwayProgress, catalog, levelId, lessonId));
    render();
    if (focus) { const heading = root.querySelector('#pathwayLessonTitle'); heading?.focus({ preventScroll: true }); heading?.scrollIntoView({ block: 'start' }); }
  }
  function render() {
    const current = level();
    root.innerHTML = `<div class="pathway-hero"><span class="eyebrow">A learning route / 从基础到学术应用</span><h2>从零开始，走向 C1</h2><p>先建立读音与句子基础，再练习理解、表达和学术交流。每阶段都有课程、主动复习与综合测评。</p><p class="pathway-boundary">阶段按 CEFR 能力描述设计。课程完成与自测成绩用于规划下一步，不作为 CEFR 等级认证。</p></div><nav class="pathway-levels" aria-label="学习阶段">${catalog.map((item) => `<button type="button" data-pathway-level="${item.id}" aria-pressed="${item.id === current.id}"><strong>${esc(item.label)}</strong><span>${esc(item.title)}</span></button>`).join('')}</nav><section class="pathway-stage"><div class="pathway-stage-heading"><div><span class="eyebrow">${esc(current.label)} / ${current.lessons.length} 节课程</span><h3>${esc(current.title)}</h3><p>${esc(current.description)}</p></div></div><ul class="pathway-can-do">${current.canDo.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div id="pathwayMetrics" class="pathway-metrics"></div><nav class="pathway-modes" aria-label="本阶段学习方式"><button type="button" class="small-btn" data-pathway-mode="lessons" aria-pressed="${mode === 'lessons'}">课程与练习</button><button type="button" class="small-btn" data-pathway-mode="review" aria-pressed="${mode === 'review'}">到期复习</button><button type="button" class="small-btn" data-pathway-mode="assessment" aria-pressed="${mode === 'assessment'}">阶段测评</button></nav><p id="pathwayNotice" role="status"></p><div id="pathwayBody"></div><details class="pathway-reference"><summary>阶段依据与学习建议</summary><p>课程分级为编辑对照，题目与文本由本项目编写。根据测评薄弱项回到相应课节，并结合持续的真实阅读、听力、交流和教师反馈。</p><ul>${sourceLinks(current.sources)}</ul><p>本路线不是完整词典或全部 C1 学时；发音与写作自评可请教师复核。学习记录仅保存在当前浏览器，包含你输入的文本，可通过右上角导出备份。</p></details></section>`;
    root.querySelectorAll('[data-pathway-level]').forEach((button) => button.addEventListener('click', () => select(button.dataset.pathwayLevel)));
    root.querySelectorAll('[data-pathway-mode]').forEach((button) => button.addEventListener('click', () => { window.flushPathwayDraft(); window.stopPathwaySpeech(); mode = button.dataset.pathwayMode; render(); }));
    updateMetrics();
    if (mode === 'lessons') renderLesson(); else if (mode === 'review') renderReview(); else renderAssessment();
    if (drafts.size) notice('有尚未成功保存的草稿，已暂留在对应课节。请返回该课重试保存。');
    renderToday();
  }
  function renderLesson() {
    const current = level(), item = lesson(); lessonId = item.id;
    const saved = record(item.id), draft = drafts.get(item.id) || saved || { writing: '', speaking: '', checks: [false, false, false] };
    const body = root.querySelector('#pathwayBody');
    body.innerHTML = `<details class="pathway-catalog"><summary>本阶段课程 · ${current.lessons.findIndex((entry) => entry.id === item.id) + 1}/${current.lessons.length} · ${esc(item.title)}</summary><div class="pathway-lesson-grid">${current.lessons.map((entry, index) => `<button type="button" class="small-btn" data-pathway-lesson="${entry.id}" ${entry.id === item.id ? 'aria-current="step"' : ''}>${String(index + 1).padStart(2, '0')} · ${esc(entry.title)}</button>`).join('')}</div></details><article class="pathway-lesson"><div class="pathway-lesson-heading"><div><span class="eyebrow">${esc(item.skill)}</span><h3 id="pathwayLessonTitle" tabindex="-1">${esc(item.title)}</h3></div><span class="badge">约 ${item.minutes} 分钟 · 可分次完成</span></div><ul class="pathway-goals">${item.goals.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div class="pathway-explanation">${item.explanation.map((part) => `<section><h4>${esc(part.title)}</h4>${paragraphs(part.text)}</section>`).join('')}</div><details class="pathway-foundation-links"><summary>需要补基础？打开配套词根与拼读课</summary><div>${current.foundations.map((link) => `<button type="button" class="small-btn" data-foundation-course="${link.course}" data-foundation-id="${link.lessonId}">${esc(link.label)}</button>`).join('')}</div></details><div class="pathway-vocabulary">${item.vocabulary.map((word) => `<div><strong lang="en">${esc(word.word)}</strong><span>${esc(word.meaning)}</span><p lang="en">${esc(word.example)}</p></div>`).join('')}</div><section class="pathway-reading"><span class="eyebrow">Read / 阅读与理解</span><h4>${esc(item.reading.title)}</h4><div class="pathway-text" lang="en">${paragraphs(item.reading.text)}</div><p class="pathway-support">${esc(item.reading.support)}</p></section>${audioMarkup(item.listening)}<section id="pathwayPractice" class="pathway-practice" aria-label="课内练习"></section><section class="pathway-production"><span class="eyebrow">Use it / 写出来，说出来</span><h4>把本课语言用在新任务中</h4><label for="pathwayWriting">写作任务：${esc(item.production.writing)}</label><textarea id="pathwayWriting" maxlength="8000" rows="6" placeholder="在这里完成或分次修改你的英文回答。"></textarea><label for="pathwaySpeaking">口头任务：${esc(item.production.speaking)}</label><p class="pathway-support">先实际说一遍，再记下口述稿、要点或卡住的位置。本页不录音、不自动评判发音。</p><textarea id="pathwaySpeaking" maxlength="8000" rows="4" placeholder="口述记录或排练要点"></textarea><fieldset class="pathway-rubric"><legend>对照任务自评 · 修改内容后请重新勾选</legend>${item.production.rubric.map((criterion, index) => `<label><input type="checkbox" data-pathway-check="${index}" />${esc(criterion)}</label>`).join('')}</fieldset><details class="pathway-model"><summary>完成尝试后，查看参考与改进方向</summary><div>${paragraphs(item.production.model)}</div></details><div class="pathway-save-row"><button type="button" class="small-btn" id="pathwaySaveDraft">保存草稿</button><span id="pathwayDraftStatus" role="status">输入自动保存到本机。每次最多 8000 字符。</span></div><p class="pathway-support">本课 4 题答对且两项输出完成自评后，安排次日主动复习。自评完成不等于语言能力认证。</p></section><div class="pathway-lesson-footer"><button type="button" class="ghost-btn" id="pathwayPrevious" ${current.lessons[0].id === item.id ? 'disabled' : ''}>← 上一课</button><button type="button" class="primary-btn" id="pathwayNext">${current.lessons.at(-1).id === item.id ? '进入阶段测评 →' : '下一课 →'}</button></div></article>`;
    body.querySelectorAll('[data-pathway-lesson]').forEach((button) => button.addEventListener('click', () => select(current.id, button.dataset.pathwayLesson, true)));
    body.querySelectorAll('[data-foundation-id]').forEach((button) => button.addEventListener('click', () => { window.flushPathwayDraft(); window.openFoundationLesson(button.dataset.foundationCourse, button.dataset.foundationId); }));
    bindAudio(body.querySelector('.pathway-listening'), item.listening);
    renderPractice();
    const writing = body.querySelector('#pathwayWriting'), speakingInput = body.querySelector('#pathwaySpeaking');
    writing.value = draft.writing; speakingInput.value = draft.speaking;
    body.querySelectorAll('[data-pathway-check]').forEach((input, index) => { input.checked = draft.checks[index]; });
    function capture(changedText = false) {
      if (changedText) body.querySelectorAll('[data-pathway-check]').forEach((input) => { input.checked = false; });
      drafts.set(item.id, { writing: writing.value, speaking: speakingInput.value, checks: [...body.querySelectorAll('[data-pathway-check]')].map((input) => input.checked) });
      body.querySelector('#pathwayDraftStatus').textContent = '正在等待保存…';
      pendingLesson = item.id; clearTimeout(saveTimer); saveTimer = setTimeout(() => window.flushPathwayDraft(), 450);
    }
    [writing, speakingInput].forEach((input) => input.addEventListener('input', () => capture(true)));
    body.querySelectorAll('[data-pathway-check]').forEach((input) => input.addEventListener('change', () => capture()));
    body.querySelector('#pathwaySaveDraft').addEventListener('click', () => { capture(); window.flushPathwayDraft(); });
    body.querySelector('#pathwayPrevious').addEventListener('click', () => select(current.id, current.lessons[current.lessons.findIndex((entry) => entry.id === item.id) - 1].id, true));
    body.querySelector('#pathwayNext').addEventListener('click', () => {
      const index = current.lessons.findIndex((entry) => entry.id === item.id);
      if (index + 1 < current.lessons.length) select(current.id, current.lessons[index + 1].id, true);
      else { window.flushPathwayDraft(); window.stopPathwaySpeech(); mode = 'assessment'; render(); root.querySelector('#pathwayAssessmentTitle')?.focus(); }
    });
  }
  function renderPractice() {
    const item = lesson(), answers = record(item.id)?.answers || item.questions.map(() => null);
    const container = root.querySelector('#pathwayPractice');
    container.innerHTML = `<span class="eyebrow">Check / 课内练习</span><h4>理解之后，独立作答</h4>${item.questions.map((question, index) => {
      const answer = answers[index], done = answer !== null;
      return `<fieldset><legend>${index + 1}. ${esc(question.prompt)} <small>${question.skill === 'listening' ? '听力' : '阅读与语言'}</small></legend><div class="pathway-options">${question.options.map((option, choice) => `<button type="button" class="quiz-option${done && choice === question.answer ? ' correct' : ''}${done && choice === answer && choice !== question.answer ? ' wrong' : ''}" data-pathway-question="${index}" data-pathway-answer="${choice}" ${done ? 'disabled' : ''}>${esc(option)}</button>`).join('')}</div><p class="pathway-feedback" id="pathwayFeedback-${index}" role="status" tabindex="-1">${done ? `${answer === question.answer ? '答对了。' : `参考答案：${esc(question.options[question.answer])}。`} ${esc(question.explanation)}` : '作答后显示解析。'}</p></fieldset>`;
    }).join('')}<button type="button" class="small-btn" id="pathwayRetry" ${answers.some((answer, index) => answer !== null && answer !== item.questions[index].answer) ? '' : 'hidden'}>重练错题</button>`;
    container.querySelectorAll('[data-pathway-answer]').forEach((button) => button.addEventListener('click', () => {
      window.flushPathwayDraft();
      const index = Number(button.dataset.pathwayQuestion);
      try {
        if (!save(engine.answer(state.pathwayProgress, catalog, item.id, index, Number(button.dataset.pathwayAnswer)))) return;
        renderPractice(); updateMetrics(); renderToday(); root.querySelector(`#pathwayFeedback-${index}`).focus({ preventScroll: true });
      } catch (error) { notice(error.message); }
    }));
    container.querySelector('#pathwayRetry').addEventListener('click', () => { if (save(engine.retry(state.pathwayProgress, catalog, item.id))) { renderPractice(); updateMetrics(); } });
  }
  function renderReview() {
    const current = level(), body = root.querySelector('#pathwayBody');
    const due = current.lessons.filter((item) => record(item.id)?.dueAt && Date.parse(record(item.id).dueAt) <= Date.now());
    const scheduled = current.lessons.filter((item) => record(item.id)?.dueAt).sort((a, b) => Date.parse(record(a.id).dueAt) - Date.parse(record(b.id).dueAt));
    if (!due.length) {
      body.innerHTML = `<div class="pathway-empty"><h4>本阶段暂时没有到期课程</h4><p>${scheduled.length ? `下一次复习：${esc(new Date(record(scheduled[0].id).dueAt).toLocaleString())}。` : '完成课内题目与两项输出自评后，课程会进入次日复习。'}</p><p>复习时先独立回忆，再核对参考。重新阅读课程仍可随时进行。</p><button type="button" class="primary-btn" id="pathwayBackToLessons">返回课程</button></div>`;
      body.querySelector('button').addEventListener('click', () => { mode = 'lessons'; render(); }); return;
    }
    const item = due[0];
    body.innerHTML = `<section class="pathway-recall"><span class="eyebrow">Active recall / 本阶段还有 ${due.length} 课到期</span><h4>${esc(item.title)}</h4><p>${esc(item.review.prompt)}</p><label for="pathwayRecallInput">先不看材料，写下你的回答或口述要点</label><textarea id="pathwayRecallInput" rows="5" maxlength="8000"></textarea><button type="button" class="primary-btn" id="pathwayReveal">完成回忆，核对参考</button><p id="pathwayRecallNotice" role="status"></p><div id="pathwayRecallAnswer" hidden><h4>核对要点</h4>${paragraphs(item.review.answer)}<p>依据刚才的独立回忆选择。自评结果只用于安排复习。</p><div class="pathway-grade-buttons"><button type="button" class="small-btn" data-pathway-grade="again">需要重学 · 1 天后</button><button type="button" class="small-btn" data-pathway-grade="hard">部分想起 · 3 天后</button><button type="button" class="small-btn" data-pathway-grade="good">独立完成 · 延长间隔</button></div></div></section>`;
    let revealed = false;
    body.querySelector('#pathwayReveal').addEventListener('click', () => {
      if (!body.querySelector('textarea').value.trim()) { body.querySelector('#pathwayRecallNotice').textContent = '先写下回忆结果；如果完全想不起来，也可以写“未能回忆”。'; return; }
      revealed = true; body.querySelector('#pathwayRecallAnswer').hidden = false; body.querySelector('textarea').readOnly = true; body.querySelector('#pathwayReveal').disabled = true;
    });
    body.querySelectorAll('[data-pathway-grade]').forEach((button) => button.addEventListener('click', () => {
      if (!revealed) return;
      try { if (save(engine.review(state.pathwayProgress, catalog, item.id, button.dataset.pathwayGrade))) { renderReview(); updateMetrics(); renderToday(); } }
      catch (error) { notice(error.message); }
    }));
  }
  function assessmentDraft() {
    if (!checks.has(level().id)) checks.set(level().id, { answers: level().assessment.questions.map(() => null), writing: '', speaking: '', checks: [false, false, false], transcriptUsed: false, submitted: false });
    return checks.get(level().id);
  }
  function renderAssessment() {
    const current = level(), assessment = current.assessment, draft = assessmentDraft(), body = root.querySelector('#pathwayBody');
    const history = state.pathwayProgress.assessments[current.id] || [];
    body.innerHTML = `<section class="pathway-assessment"><span class="eyebrow">Stage check / 使用新材料检查迁移</span><h3 id="pathwayAssessmentTitle" tabindex="-1">${esc(current.label)} 阶段测评</h3><p>完成 8 道理解题和两项输出，再统一查看反馈。客观题分数与输出自评分别记录；反复练习同一套材料不等于独立等级测定。</p><details class="pathway-assessment-history"><summary>本阶段记录 · 最近 ${history.length} 次</summary>${history.length ? `<ol>${history.slice().reverse().map((attempt) => `<li>${esc(new Date(attempt.submittedAt).toLocaleString())} · 理解题 ${attempt.answers.filter((answer, index) => answer === assessment.questions[index].answer).length}/${assessment.questions.length} · 输出自评 ${attempt.checks.filter(Boolean).length}/3 · ${attempt.transcriptUsed ? '使用听力文本辅助' : '未标记使用文本'}</li>`).join('')}</ol>` : '<p>还没有提交记录。阶段测评不要求先完成全部课程，可用于发现学习需求。</p>'}</details><section class="pathway-reading"><h4>${esc(assessment.reading.title)}</h4><div class="pathway-text" lang="en">${paragraphs(assessment.reading.text)}</div></section>${audioMarkup(assessment.listening, true)}<form id="pathwayAssessmentForm"><div class="pathway-assessment-questions">${assessment.questions.map((question, index) => `<fieldset><legend>${index + 1}. ${esc(question.prompt)} <small>${question.skill === 'listening' ? '听力' : '阅读'}</small></legend>${question.options.map((option, choice) => `<label class="pathway-radio"><input type="radio" name="pathwayAssessment${index}" data-assessment-question="${index}" value="${choice}" ${draft.answers[index] === choice ? 'checked' : ''} />${esc(option)}</label>`).join('')}</fieldset>`).join('')}</div><div class="pathway-production"><label for="pathwayAssessmentWriting">写作：${esc(assessment.writing)}</label><textarea id="pathwayAssessmentWriting" rows="7" maxlength="8000"></textarea><label for="pathwayAssessmentSpeaking">口头表达：${esc(assessment.speaking)}</label><p class="pathway-support">请先说一遍，再保存口述稿或反思记录；本系统不自动判断流利度和发音。</p><textarea id="pathwayAssessmentSpeaking" rows="5" maxlength="8000"></textarea><fieldset class="pathway-rubric"><legend>输出任务自评 · 未达到的项目保留未勾选</legend>${assessment.rubric.map((criterion, index) => `<label><input type="checkbox" data-assessment-check="${index}" ${draft.checks[index] ? 'checked' : ''} />${esc(criterion)}</label>`).join('')}</fieldset><label class="pathway-transcript-flag"><input type="checkbox" id="pathwayTranscriptUsed" ${draft.transcriptUsed ? 'checked' : ''} />我查看或使用了听力文本辅助</label><p class="pathway-support">提交前草稿暂存在此页面，刷新会丢失；提交后的答案和输出文本会随主进度保存与导出。</p></div><p id="pathwayAssessmentError" role="alert"></p><button type="submit" class="primary-btn">提交本阶段测评</button></form><div id="pathwayAssessmentResult" tabindex="-1"></div></section>`;
    const form = body.querySelector('form');
    body.querySelectorAll('.pathway-assessment-history li').forEach((node, index) => {
      const attempt = history[history.length - 1 - index], detail = document.createElement('details');
      detail.innerHTML = `<summary>回看本次输出与自评</summary><h4>写作记录</h4>${paragraphs(attempt.writing)}<h4>口述记录</h4>${paragraphs(attempt.speaking)}<ul>${assessment.rubric.map((criterion, i) => `<li>${attempt.checks[i] ? '已自评完成' : '仍需改进'}：${esc(criterion)}</li>`).join('')}</ul>`;
      node.append(detail);
    });
    const writing = form.querySelector('#pathwayAssessmentWriting'), speakingInput = form.querySelector('#pathwayAssessmentSpeaking');
    writing.value = draft.writing; speakingInput.value = draft.speaking;
    bindAudio(body.querySelector('.pathway-listening'), assessment.listening, () => { if (!draft.submitted) { draft.transcriptUsed = true; form.querySelector('#pathwayTranscriptUsed').checked = true; } });
    form.addEventListener('input', (event) => {
      if (event.target.matches('[data-assessment-question]')) draft.answers[Number(event.target.dataset.assessmentQuestion)] = Number(event.target.value);
      draft.writing = writing.value; draft.speaking = speakingInput.value;
      if (event.target === writing || event.target === speakingInput) form.querySelectorAll('[data-assessment-check]').forEach((input) => { input.checked = false; });
      draft.checks = [...form.querySelectorAll('[data-assessment-check]')].map((input) => input.checked);
      if (event.target.id === 'pathwayTranscriptUsed' && event.target.checked) draft.transcriptUsed = true;
      form.querySelector('#pathwayTranscriptUsed').checked = draft.transcriptUsed;
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault(); if (draft.submitted) return;
      const errorNode = form.querySelector('#pathwayAssessmentError');
      if (draft.answers.some((answer) => answer === null) || !draft.writing.trim() || !draft.speaking.trim()) { errorNode.textContent = '请完成所有理解题，并填写写作与口述记录。自评未达成项可以不勾选。'; errorNode.scrollIntoView({ block: 'center' }); return; }
      try {
        const { submitted, ...payload } = draft;
        if (!save(engine.assess(state.pathwayProgress, catalog, current.id, payload))) return;
        draft.submitted = true; window.stopPathwaySpeech(); showAssessmentResult(); updateMetrics(); renderToday();
      } catch (error) { errorNode.textContent = error.message; }
    });
    if (draft.submitted) showAssessmentResult(false);
  }
  function showAssessmentResult(focus = true) {
    const current = level(), draft = assessmentDraft(), assessment = current.assessment;
    const form = root.querySelector('#pathwayAssessmentForm'), result = root.querySelector('#pathwayAssessmentResult');
    form.querySelectorAll('input, textarea, button').forEach((input) => { input.disabled = true; });
    const correct = assessment.questions.filter((question, index) => draft.answers[index] === question.answer).length;
    const reading = assessment.questions.filter((question) => question.skill === 'reading');
    const listening = assessment.questions.filter((question) => question.skill === 'listening');
    const skillCorrect = (skill) => assessment.questions.filter((question, index) => question.skill === skill && draft.answers[index] === question.answer).length;
    result.innerHTML = `<h4>理解题 ${correct}/${assessment.questions.length} · ${Math.round(correct / assessment.questions.length * 100)}%</h4><p>阅读 ${skillCorrect('reading')}/${reading.length} · 听力 ${skillCorrect('listening')}/${listening.length}${draft.transcriptUsed ? '（使用文本辅助）' : ''} · 输出自评 ${draft.checks.filter(Boolean).length}/3</p><p>${correct < 6 ? '建议回到本阶段课程，按下方解析重练薄弱项。' : '理解题表现较好。继续检查输出任务，并用不同的真实材料验证迁移。'} 本结果不是 ${esc(current.label)} 等级证明。</p><ol class="pathway-assessment-feedback">${assessment.questions.map((question, index) => `<li><strong>${draft.answers[index] === question.answer ? '✓' : '待复习'} ${esc(question.prompt)}</strong><p>参考答案：${esc(question.options[question.answer])}。${esc(question.explanation)}</p></li>`).join('')}</ol><details><summary>输出任务参考与反馈方向</summary>${paragraphs(assessment.model)}</details><div class="pathway-result-actions"><button type="button" class="small-btn" id="pathwayRetake">重新练习本套材料</button><button type="button" class="primary-btn" id="pathwayReturn">返回课程改进</button></div>`;
    result.querySelector('#pathwayRetake').addEventListener('click', () => { checks.delete(current.id); window.stopPathwaySpeech(); renderAssessment(); });
    result.querySelector('#pathwayReturn').addEventListener('click', () => { mode = 'lessons'; render(); });
    if (focus) { result.focus({ preventScroll: true }); result.scrollIntoView({ block: 'start' }); }
  }
  function renderToday() {
    const target = document.getElementById('pathwayToday');
    const selected = catalog.find((item) => item.id === state.pathwayProgress.levelId) || catalog[0];
    const totalDue = catalog.reduce((sum, item) => sum + engine.summary(state.pathwayProgress, catalog, item.id).due, 0);
    target.innerHTML = `<div><span class="eyebrow">Your learning route</span><strong>零基础 → C1 · ${esc(selected.label)} ${esc(selected.title)}</strong><p>${totalDue ? `${totalDue} 课到期，先用主动回忆巩固。` : '每次完成一小步：课程、练习、表达、隔日复习。'}</p></div><button type="button" class="primary-btn" id="continuePathway">${totalDue ? '开始课程复习' : '继续学习路线'} →</button>`;
    target.querySelector('button').addEventListener('click', () => {
      const next = totalDue ? catalog.find((item) => engine.summary(state.pathwayProgress, catalog, item.id).due > 0) : selected;
      mode = totalDue ? 'review' : 'lessons'; setView('pathway'); select(next.id, next.id === state.pathwayProgress.levelId ? state.pathwayProgress.lessonId : null, !totalDue);
    });
  }
  window.refreshPathway = () => {
    const incoming = JSON.stringify(state.pathwayProgress);
    if (incoming !== snapshot) {
      clearTimeout(saveTimer); saveTimer = null; pendingLesson = null; drafts.clear(); checks.clear(); window.stopPathwaySpeech();
      snapshot = incoming; levelId = state.pathwayProgress.levelId; lessonId = state.pathwayProgress.lessonId;
    }
    render();
  };
  window.resetPathwaySession = () => {
    clearTimeout(saveTimer); saveTimer = null; pendingLesson = null; drafts.clear(); checks.clear(); window.stopPathwaySpeech();
    snapshot = JSON.stringify(state.pathwayProgress); levelId = state.pathwayProgress.levelId; lessonId = state.pathwayProgress.lessonId; mode = 'lessons';
  };
  render();
})();
