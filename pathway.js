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
    } catch { notice('保存失败，已有记录仍然保留。新输入暂存在本页，请重试，或先复制文字备份。'); return false; }
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
  window.hasPendingPathwayWork = () => drafts.size > 0 || [...checks.values()].some((draft) => !draft.submitted && (draft.answers.some((answer) => answer !== null) || draft.writing.trim() || draft.speaking.trim() || draft.checks.some(Boolean) || draft.transcriptUsed));
  window.addEventListener('beforeunload', (event) => {
    window.flushPathwayDraft();
    if (window.hasPendingPathwayWork()) { event.preventDefault(); event.returnValue = ''; }
  });
  window.stopPathwaySpeech = () => { speechRun += 1; if (speaking) window.speechSynthesis?.cancel(); speaking = false; };
  function speak(text, status, rate = 1) {
    window.stopPathwaySpeech(); window.stopFoundationSpeech?.(); window.stopFoundationStudySpeech?.();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { status.textContent = '设备不支持朗读，可以查看听力原文继续练习。'; return; }
    const run = ++speechRun, utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; utterance.rate = rate;
    const voice = window.speechSynthesis.getVoices?.().find((item) => /^en[-_]US$/i.test(item.lang));
    if (voice) utterance.voice = voice;
    speaking = true; status.textContent = '正在准备播放。';
    utterance.onstart = () => { if (run === speechRun) status.textContent = '正在播放，可随时停止或重听。'; };
    utterance.onend = () => { if (run === speechRun) { speaking = false; status.textContent = '播放结束。'; } };
    utterance.onerror = (event) => { if (run === speechRun) { speaking = false; status.textContent = ['canceled', 'interrupted'].includes(event.error) ? '已停止。' : '暂时无法播放，可以查看听力原文继续练习。'; } };
    try { window.speechSynthesis.speak(utterance); } catch { speaking = false; status.textContent = '暂时无法播放，请查看听力原文。'; }
  }
  function sourceLinks(sources) {
    return sources.map((source) => {
      try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password ? `<li><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>` : ''; }
      catch { return ''; }
    }).join('');
  }
  function audioMarkup(item, testing = false) {
    return `<section class="pathway-listening"><h4>${esc(item.title)}</h4>${item.focus ? `<p>${esc(item.focus)}</p>` : ''}<div class="pathway-audio-controls"><button type="button" class="small-btn pathway-play">播放听力</button><button type="button" class="small-btn pathway-stop">停止</button><label>速度 <select class="pathway-rate" aria-label="播放速度"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select></label></div><p class="pathway-audio-status" role="status"></p><details class="pathway-transcript"><summary>查看听力原文${testing ? '（会记录为使用原文辅助）' : '并核对'}</summary><div lang="en">${paragraphs(item.text)}</div></details><small>本段使用设备朗读，声音与真人录音有所不同。${testing ? '建议先听两遍，再独立作答。' : '先听并记下关键词，再查看原文核对。'}</small></section>`;
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
    if (node) node.innerHTML = `<span><strong>${info.completed}/${info.total}</strong> 课已完成练习与自评</span><span><strong>${info.due}</strong> 课待复习</span><span><strong>${info.assessmentCount}</strong> 次阶段测评</span>`;
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
    root.innerHTML = `<div class="pathway-hero"><span class="eyebrow">A learning route / 从基础到学术应用</span><h2>从零开始，走向 C1</h2><p>先建立读音与句子基础，再练习理解、表达和学术交流。每个阶段都有课程、练习、复习和测评。</p><p class="pathway-boundary">课程参考 CEFR（欧洲语言共同参考框架）分级。学习进度和测评结果帮助你安排下一步学习，不代表正式的等级认证。</p></div><nav class="pathway-levels" aria-label="学习阶段">${catalog.map((item) => `<button type="button" data-pathway-level="${item.id}" aria-pressed="${item.id === current.id}"><strong>${esc(item.label)}</strong><span>${esc(item.title)}</span></button>`).join('')}</nav><section class="pathway-stage"><div class="pathway-stage-heading"><div><span class="eyebrow">${esc(current.label)} / ${current.lessons.length} 节课程</span><h3>${esc(current.title)}</h3><p>${esc(current.description)}</p></div></div><ul class="pathway-can-do">${current.canDo.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div id="pathwayMetrics" class="pathway-metrics"></div><nav class="pathway-modes" aria-label="本阶段学习方式"><button type="button" class="small-btn" data-pathway-mode="lessons" aria-pressed="${mode === 'lessons'}">课程与练习</button><button type="button" class="small-btn" data-pathway-mode="review" aria-pressed="${mode === 'review'}">复习巩固</button><button type="button" class="small-btn" data-pathway-mode="assessment" aria-pressed="${mode === 'assessment'}">阶段测评</button></nav><p id="pathwayNotice" role="status"></p><div id="pathwayBody"></div><details class="pathway-reference"><summary>课程分级与学习建议</summary><p>本项目根据各阶段的能力目标编写课程和题目。测评后，可以回到还不熟悉的课程继续练习，也要多接触真实的英文阅读、听力和交流。</p><ul>${sourceLinks(current.sources)}</ul><p>达到 C1 还需要长期练习和实际运用，建议请教师点评发音与写作。学习记录和练习文字默认保存在当前浏览器；开启多设备同步后，会加密上传并同步到已连接的设备。也可以通过右上角导出备份。</p></details></section>`;
    root.querySelectorAll('[data-pathway-level]').forEach((button) => button.addEventListener('click', () => select(button.dataset.pathwayLevel)));
    root.querySelectorAll('[data-pathway-mode]').forEach((button) => button.addEventListener('click', () => { window.flushPathwayDraft(); window.stopPathwaySpeech(); mode = button.dataset.pathwayMode; render(); }));
    updateMetrics();
    if (mode === 'lessons') renderLesson(); else if (mode === 'review') renderReview(); else renderAssessment();
    if (drafts.size) notice('部分草稿尚未保存，暂存在对应课程中。请返回该课重试保存。');
    renderToday();
  }
  function renderLesson() {
    const current = level(), item = lesson(); lessonId = item.id;
    const saved = record(item.id), draft = drafts.get(item.id) || saved || { writing: '', speaking: '', checks: [false, false, false] };
    const body = root.querySelector('#pathwayBody');
    body.innerHTML = `<details class="pathway-catalog"><summary>本阶段课程 · ${current.lessons.findIndex((entry) => entry.id === item.id) + 1}/${current.lessons.length} · ${esc(item.title)}</summary><div class="pathway-lesson-grid">${current.lessons.map((entry, index) => `<button type="button" class="small-btn" data-pathway-lesson="${entry.id}" ${entry.id === item.id ? 'aria-current="step"' : ''}>${String(index + 1).padStart(2, '0')} · ${esc(entry.title)}</button>`).join('')}</div></details><article class="pathway-lesson"><div class="pathway-lesson-heading"><div><span class="eyebrow">${esc(item.skill)}</span><h3 id="pathwayLessonTitle" tabindex="-1">${esc(item.title)}</h3></div><span class="badge">约 ${item.minutes} 分钟 · 可分次完成</span></div><ul class="pathway-goals">${item.goals.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div class="pathway-explanation">${item.explanation.map((part) => `<section><h4>${esc(part.title)}</h4>${paragraphs(part.text)}</section>`).join('')}</div><details class="pathway-foundation-links"><summary>配套专项课程：词根词缀与自然拼读</summary><div>${[...current.foundations, ...['word-parts', 'phonics'].map((course) => ({course, lessonId: FOUNDATION_CATALOG[course].find((lesson) => lesson.levelId === current.id).id, label: `${current.label} ${course === 'phonics' ? '自然拼读与发音' : '词根词缀'}专项课程`}))].map((link) => `<button type="button" class="small-btn" data-foundation-course="${link.course}" data-foundation-id="${link.lessonId}">${esc(link.label)}</button>`).join('')}</div></details><div class="pathway-vocabulary">${item.vocabulary.map((word) => `<div><strong lang="en">${esc(word.word)}</strong><span>${esc(word.meaning)}</span><p lang="en">${esc(word.example)}</p></div>`).join('')}</div><section class="pathway-reading"><span class="eyebrow">Read / 阅读与理解</span><h4>${esc(item.reading.title)}</h4><div class="pathway-text" lang="en">${paragraphs(item.reading.text)}</div><p class="pathway-support">${esc(item.reading.support)}</p></section>${audioMarkup(item.listening)}<section id="pathwayPractice" class="pathway-practice" aria-label="课内练习"></section><section class="pathway-production"><span class="eyebrow">Use it / 写出来，说出来</span><h4>写作与口语练习</h4><label for="pathwayWriting">写作练习：${esc(item.production.writing)}</label><textarea id="pathwayWriting" maxlength="8000" rows="6" placeholder="写下你的英文回答，也可以分次完成。"></textarea><label for="pathwaySpeaking">口语练习：${esc(item.production.speaking)}</label><p class="pathway-support">先开口说一遍，再记下说了什么、表达要点或卡住的地方。本页不录音，也不会自动评价发音。</p><textarea id="pathwaySpeaking" maxlength="8000" rows="4" placeholder="记下你说的内容或准备表达的要点"></textarea><fieldset class="pathway-rubric"><legend>完成情况自评 · 修改后请重新勾选</legend>${item.production.rubric.map((criterion, index) => `<label><input type="checkbox" data-pathway-check="${index}" />${esc(criterion)}</label>`).join('')}</fieldset><details class="pathway-model"><summary>先自己试一试，再查看参考答案与建议</summary><div>${paragraphs(item.production.model)}</div></details><div class="pathway-save-row"><button type="button" class="small-btn" id="pathwaySaveDraft">保存草稿</button><span id="pathwayDraftStatus" role="status">输入会自动保存在当前浏览器。每栏最多 8000 个字符。</span></div><p class="pathway-support">答对本课 4 道题，完成写作、口语练习并勾选全部自评要求后，系统会安排你明天复习。</p></section><div class="pathway-lesson-footer"><button type="button" class="ghost-btn" id="pathwayPrevious" ${current.lessons[0].id === item.id ? 'disabled' : ''}>← 上一课</button><button type="button" class="primary-btn" id="pathwayNext">${current.lessons.at(-1).id === item.id ? '进入阶段测评 →' : '下一课 →'}</button></div></article>`;
    body.querySelectorAll('[data-pathway-lesson]').forEach((button) => button.addEventListener('click', () => select(current.id, button.dataset.pathwayLesson, true)));
    body.querySelectorAll('[data-foundation-id]').forEach((button) => button.addEventListener('click', () => { window.flushPathwayDraft(); window.openFoundationLesson(button.dataset.foundationCourse, button.dataset.foundationId); }));
    bindAudio(body.querySelector('.pathway-listening'), item.listening);
    renderPractice();
    const writing = body.querySelector('#pathwayWriting'), speakingInput = body.querySelector('#pathwaySpeaking');
    const feedbackActions = document.createElement('div'); feedbackActions.className = 'pathway-save-row';
    for (const [kind, label] of [['writing', '检查这段写作'], ['speaking', '录音与口语反馈']]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'small-btn'; button.textContent = label;
      button.addEventListener('click', () => {
        if (window.flushPathwayDraft() === false) return;
        const text = kind === 'writing' ? writing.value : speakingInput.value;
        if (text.length > 6000) { alert('工坊每次检查最多 6000 个字符。这份课程草稿已保留，请分段复制到工坊练习。'); window.openSkillWorkshop?.(`${item.id}-${kind}`); }
        else window.openSkillWorkshop?.(`${item.id}-${kind}`, text);
      }); feedbackActions.append(button);
    }
    body.querySelector('.pathway-production').append(feedbackActions);
    writing.value = draft.writing; speakingInput.value = draft.speaking;
    body.querySelectorAll('[data-pathway-check]').forEach((input, index) => { input.checked = draft.checks[index]; });
    function capture(changedText = false) {
      if (changedText) body.querySelectorAll('[data-pathway-check]').forEach((input) => { input.checked = false; });
      drafts.set(item.id, { writing: writing.value, speaking: speakingInput.value, checks: [...body.querySelectorAll('[data-pathway-check]')].map((input) => input.checked) });
      body.querySelector('#pathwayDraftStatus').textContent = '正在保存…';
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
      body.innerHTML = `<div class="pathway-empty"><h4>本阶段暂时没有待复习的课程</h4><p>${scheduled.length ? `下一次复习：${esc(new Date(record(scheduled[0].id).dueAt).toLocaleString())}。` : '答对课内题目，完成写作、口语练习并勾选全部自评要求后，系统会安排你明天复习。'}</p><p>复习时先试着自己回答，再查看参考答案。你也可以随时返回课程温习。</p><button type="button" class="primary-btn" id="pathwayBackToLessons">返回课程</button></div>`;
      body.querySelector('button').addEventListener('click', () => { mode = 'lessons'; render(); }); return;
    }
    const item = due[0];
    body.innerHTML = `<section class="pathway-recall"><span class="eyebrow">Review / 本阶段还有 ${due.length} 课待复习</span><h4>${esc(item.title)}</h4><p>${esc(item.review.prompt)}</p><label for="pathwayRecallInput">先不看答案，写下你的回答或口头表达的要点</label><textarea id="pathwayRecallInput" rows="5" maxlength="8000"></textarea><button type="button" class="primary-btn" id="pathwayReveal">查看参考答案</button><p id="pathwayRecallNotice" role="status"></p><div id="pathwayRecallAnswer" hidden><h4>核对要点</h4>${paragraphs(item.review.answer)}<p>根据刚才的作答情况选择，系统会据此安排下次复习。</p><div class="pathway-grade-buttons"><button type="button" class="small-btn" data-pathway-grade="again">还没记住 · 明天再练</button><button type="button" class="small-btn" data-pathway-grade="hard">有些吃力 · 3 天后再练</button><button type="button" class="small-btn" data-pathway-grade="good">能独立答出 · 之后再复习</button></div></div></section>`;
    let revealed = false;
    body.querySelector('#pathwayReveal').addEventListener('click', () => {
      if (!body.querySelector('textarea').value.trim()) { body.querySelector('#pathwayRecallNotice').textContent = '请先试着回答；如果想不起来，也可以写“想不起来”。'; return; }
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
    body.innerHTML = `<section class="pathway-assessment"><span class="eyebrow">Stage check / 换一组材料，看看能否学以致用</span><h3 id="pathwayAssessmentTitle" tabindex="-1">${esc(current.label)} 阶段测评</h3><p>完成 8 道理解题、写作和口语练习后，一起查看反馈。理解题得分与练习自评分别记录；重复做题的成绩不能代表正式的语言等级。</p><details class="pathway-assessment-history"><summary>本阶段记录 · 最近 ${history.length} 次</summary>${history.length ? `<ol>${history.slice().reverse().map((attempt) => `<li>${esc(new Date(attempt.submittedAt).toLocaleString())} · 理解题 ${attempt.answers.filter((answer, index) => answer === assessment.questions[index].answer).length}/${assessment.questions.length} · 练习自评 ${attempt.checks.filter(Boolean).length}/3 · ${attempt.transcriptUsed ? '查看过听力原文' : '未标记使用听力原文'}</li>`).join('')}</ol>` : '<p>你还没有完成过本阶段测评。也可以先做一次，看看哪些内容需要重点学习。</p>'}</details><section class="pathway-reading"><h4>${esc(assessment.reading.title)}</h4><div class="pathway-text" lang="en">${paragraphs(assessment.reading.text)}</div></section>${audioMarkup(assessment.listening, true)}<form id="pathwayAssessmentForm"><div class="pathway-assessment-questions">${assessment.questions.map((question, index) => `<fieldset><legend>${index + 1}. ${esc(question.prompt)} <small>${question.skill === 'listening' ? '听力' : '阅读'}</small></legend>${question.options.map((option, choice) => `<label class="pathway-radio"><input type="radio" name="pathwayAssessment${index}" data-assessment-question="${index}" value="${choice}" ${draft.answers[index] === choice ? 'checked' : ''} />${esc(option)}</label>`).join('')}</fieldset>`).join('')}</div><div class="pathway-production"><label for="pathwayAssessmentWriting">写作：${esc(assessment.writing)}</label><textarea id="pathwayAssessmentWriting" rows="7" maxlength="8000"></textarea><label for="pathwayAssessmentSpeaking">口语：${esc(assessment.speaking)}</label><p class="pathway-support">请先开口说一遍，再记下你说的内容或需要改进的地方。本页不会自动评价发音和流利度。</p><textarea id="pathwayAssessmentSpeaking" rows="5" maxlength="8000"></textarea><fieldset class="pathway-rubric"><legend>完成情况自评 · 做到的再勾选</legend>${assessment.rubric.map((criterion, index) => `<label><input type="checkbox" data-assessment-check="${index}" ${draft.checks[index] ? 'checked' : ''} />${esc(criterion)}</label>`).join('')}</fieldset><label class="pathway-transcript-flag"><input type="checkbox" id="pathwayTranscriptUsed" ${draft.transcriptUsed ? 'checked' : ''} />我看过听力原文</label><p class="pathway-support">提交前，草稿只暂存在本页，刷新后会丢失。提交后，答案和练习文字会保存在当前浏览器，并包含在导出的记录中；开启多设备同步后，也会加密同步。</p></div><p id="pathwayAssessmentError" role="alert"></p><button type="submit" class="primary-btn">提交本阶段测评</button></form><div id="pathwayAssessmentResult" tabindex="-1"></div></section>`;
    const form = body.querySelector('form');
    body.querySelectorAll('.pathway-assessment-history li').forEach((node, index) => {
      const attempt = history[history.length - 1 - index], detail = document.createElement('details');
      detail.innerHTML = `<summary>回看本次写作、口语与自评</summary><h4>写作记录</h4>${paragraphs(attempt.writing)}<h4>口语练习记录</h4>${paragraphs(attempt.speaking)}<ul>${assessment.rubric.map((criterion, i) => `<li>${attempt.checks[i] ? '已做到（自评）' : '仍需改进'}：${esc(criterion)}</li>`).join('')}</ul>`;
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
      if (draft.answers.some((answer) => answer === null) || !draft.writing.trim() || !draft.speaking.trim()) { errorNode.textContent = '请完成所有理解题，并填写写作和口语练习记录。自评中还没做到的项目可以不勾选。'; errorNode.scrollIntoView({ block: 'center' }); return; }
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
    result.innerHTML = `<h4>理解题 ${correct}/${assessment.questions.length} · ${Math.round(correct / assessment.questions.length * 100)}%</h4><p>阅读 ${skillCorrect('reading')}/${reading.length} · 听力 ${skillCorrect('listening')}/${listening.length}${draft.transcriptUsed ? '（查看过原文）' : ''} · 练习自评 ${draft.checks.filter(Boolean).length}/3</p><p>${correct < 6 ? '建议结合下方解析，回到还不熟悉的课程继续练习。' : '理解题表现较好。接着检查写作和口语，再试试把学到的内容用在真实场景中。'} 本次成绩仅供学习参考，不代表已达到 ${esc(current.label)} 等级。</p><ol class="pathway-assessment-feedback">${assessment.questions.map((question, index) => `<li><strong>${draft.answers[index] === question.answer ? '✓' : '待复习'} ${esc(question.prompt)}</strong><p>参考答案：${esc(question.options[question.answer])}。${esc(question.explanation)}</p></li>`).join('')}</ol><details><summary>写作与口语参考答案和建议</summary>${paragraphs(assessment.model)}</details><div class="pathway-result-actions"><button type="button" class="small-btn" id="pathwayRetake">再做一次测评</button><button type="button" class="primary-btn" id="pathwayReturn">返回课程继续练习</button></div>`;
    result.querySelector('#pathwayRetake').addEventListener('click', () => { checks.delete(current.id); window.stopPathwaySpeech(); renderAssessment(); });
    result.querySelector('#pathwayReturn').addEventListener('click', () => { mode = 'lessons'; render(); });
    if (focus) { result.focus({ preventScroll: true }); result.scrollIntoView({ block: 'start' }); }
  }
  function renderToday() {
    const target = document.getElementById('pathwayToday');
    const selected = catalog.find((item) => item.id === state.pathwayProgress.levelId) || catalog[0];
    const totalDue = catalog.reduce((sum, item) => sum + engine.summary(state.pathwayProgress, catalog, item.id).due, 0);
    target.innerHTML = `<div><span class="eyebrow">Your learning route</span><strong>零基础 → C1 · ${esc(selected.label)} ${esc(selected.title)}</strong><p>${totalDue ? `${totalDue} 课待复习，先巩固一下学过的内容。` : '从一节课开始，学一学、练一练，再按计划复习。'}</p></div><button type="button" class="primary-btn" id="continuePathway">${totalDue ? '开始复习' : '继续学习'} →</button>`;
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
  window.openPathwayLesson = (nextLevelId, nextLessonId) => {
    const target = catalog.find((item) => item.id === nextLevelId);
    if (!target || !target.lessons.some((item) => item.id === nextLessonId)) return false;
    mode = 'lessons'; setView('pathway'); select(nextLevelId, nextLessonId, true); return true;
  };
  render();
})();
