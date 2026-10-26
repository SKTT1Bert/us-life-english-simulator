(() => {
  'use strict';
  const controllers = [], engine = window.FoundationProgress, esc = escapeHTML;
  const paragraphs = (text) => String(text).split(/\n+/).filter(Boolean).map((line) => `<p>${esc(line)}</p>`).join('');
  window.stopFoundationStudySpeech = () => window.EnglishSpeech.stop('foundation-assessment');
  window.flushFoundationDrafts = () => controllers.map((controller) => controller.flush()).every(Boolean);
  window.resetFoundationSession = () => controllers.forEach((controller) => controller.reset());
  window.hasPendingFoundationWork = () => controllers.some((controller) => controller.dirty());
  window.addEventListener('beforeunload', (event) => {
    window.flushFoundationDrafts();
    if (controllers.some((controller) => controller.dirty())) { event.preventDefault(); event.returnValue = ''; }
  });
  window.createFoundationStudy = ({ course, root, save, selectLesson, renderDashboard }) => {
    const stages = FOUNDATION_CATALOG.stages[course.id], drafts = new Map(), assessments = new Map();
    let levelId = state.foundationProgress.courses[course.id].levelId || 'pre-a1', mode = 'lessons', currentLesson = course.lessons[0], timer;
    let snapshot = JSON.stringify(state.foundationProgress.courses[course.id]);
    const panel = document.createElement('section'); panel.className = 'foundation-study';
    const body = document.createElement('section'); body.className = 'foundation-study-body'; body.hidden = true;
    root.querySelector('.tutorial-catalog').before(panel, body);
    const safeSources = (sources) => sources.map((source) => {
      try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password ? `<li><a href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>` : ''; } catch { return ''; }
    }).join('');
    const stage = () => stages.find((item) => item.id === levelId) || stages[0];
    const records = () => state.foundationProgress.courses[course.id].records;
    const notice = (message) => { root.querySelector('.tutorial-course-status').textContent = message; };
    function persist(next) {
      const ok = save(next); if (ok) snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); return ok;
    }
    function flush() {
      clearTimeout(timer); timer = null;
      for (const [id, draft] of drafts) {
        try {
          const next = engine.saveProduction(state.foundationProgress, FOUNDATION_CATALOG, course.id, id, draft);
          // A delayed save must not move the user's current reading location.
          const location = state.foundationProgress.courses[course.id];
          next.courses[course.id].levelId = location.levelId; next.courses[course.id].lessonId = location.lessonId;
          if (persist(next)) drafts.delete(id);
        } catch (error) { notice(error.message); }
      }
      const label = root.querySelector('.foundation-draft-status');
      if (label) label.textContent = drafts.size ? '仍有草稿未保存，请重试或复制备份。' : '草稿已保存在当前浏览器。';
      metrics(); renderDashboard();
      return drafts.size === 0;
    }
    function metrics() {
      const info = engine.stageSummary(state.foundationProgress, FOUNDATION_CATALOG, course.id, levelId);
      const node = panel.querySelector('.foundation-metrics');
      if (node) node.innerHTML = `<span><strong>${info.objectiveComplete}/${info.total}</strong> 课随堂题全对</span><span><strong>${info.completed}/${info.total}</strong> 课完成全部练习与自评</span><span><strong>${info.due}</strong> 课待复习</span><span><strong>${info.assessmentCount}</strong> 次测评</span>`;
    }
    function setMode(next) { flush(); window.stopFoundationStudySpeech(); window.stopFoundationSpeech?.(); mode = next; renderPanel(); panel.querySelector(`[data-foundation-mode="${next}"]`)?.focus({ preventScroll: true }); }
    function renderPanel() {
      const current = stage();
      panel.innerHTML = `<nav class="pathway-levels foundation-levels" aria-label="${course.title}学习阶段">${stages.map((item) => `<button type="button" data-foundation-level="${item.id}" aria-pressed="${item.id === current.id}"><strong>${esc(item.label)}</strong><span>${esc(item.title)}</span></button>`).join('')}</nav><div class="foundation-stage-heading"><div><span class="eyebrow">${esc(current.label)} / 专项课程</span><h3>${esc(current.title)}</h3><p>${esc(current.description)}</p></div><button type="button" class="small-btn foundation-route-link">继续 ${esc(current.label)} 综合学习 →</button></div><ul class="pathway-can-do">${current.canDo.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div class="pathway-metrics foundation-metrics"></div><nav class="pathway-modes" aria-label="专项学习方式">${[['lessons', '课程与练习'], ['review', '复习巩固'], ['assessment', '阶段测评']].map(([id, label]) => `<button type="button" class="small-btn" data-foundation-mode="${id}" aria-pressed="${mode === id}">${label}</button>`).join('')}</nav><p class="pathway-support">按难度逐步学习词根与拼读，同时搭配综合路线练习听说读写。课程自测不能替代 C1 水平考试；朗读功能也不会评价你的发音。</p><details class="pathway-reference"><summary>本阶段参考依据</summary><ul>${safeSources(current.sources)}</ul></details>`;
      panel.querySelectorAll('[data-foundation-level]').forEach((button) => button.addEventListener('click', () => {
        flush(); window.stopFoundationStudySpeech();
        levelId = button.dataset.foundationLevel; mode = 'lessons';
        const lesson = course.lessons.find((item) => item.levelId === levelId);
        root.querySelector('.tutorial-search').value = '';
        root.querySelector('.tutorial-stage').value = lesson.stage;
        selectLesson(course.lessons.indexOf(lesson), false);
        panel.querySelector(`[data-foundation-level="${levelId}"]`)?.focus({ preventScroll: true });
      }));
      panel.querySelectorAll('[data-foundation-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.foundationMode)));
      panel.querySelector('.foundation-route-link').addEventListener('click', () => { flush(); window.openPathwayLesson?.(levelId, currentLesson.levelId === levelId ? currentLesson.pathwayLessonId : current.pathwayLessonId); });
      root.querySelector('.tutorial-article').hidden = mode !== 'lessons';
      root.querySelector('.tutorial-catalog').hidden = mode !== 'lessons'; body.hidden = mode === 'lessons';
      metrics();
      if (mode === 'review') renderReview(); else if (mode === 'assessment') renderAssessment(); else body.replaceChildren();
      if (drafts.size) notice('还有课程草稿未保存。返回对应课程重试，或先复制文字备份。');
    }
    function production(lesson) {
      const node = document.createElement('section'); node.className = 'pathway-production foundation-production';
      root.querySelector('.tutorial-practice').after(node);
      const draft = drafts.get(lesson.id) || records()[lesson.id] || { writing: '', speaking: '', checks: [false, false, false] };
      node.innerHTML = `<span class="eyebrow">Use it / 写作与口语练习</span><h4>写一写，说一说</h4><label>写作练习：${esc(lesson.production.writing)}<textarea class="foundation-writing" rows="5" maxlength="8000"></textarea></label><label>口语练习：${esc(lesson.production.speaking)}<textarea class="foundation-speaking" rows="4" maxlength="8000" placeholder="先开口说一遍，再记下你说的话、练习要点或需要改进的地方。"></textarea></label><p class="pathway-support">这里保存你的练习文字，不录音，也不会给发音打分。每段最多可输入 8000 个字符。</p><fieldset class="pathway-rubric"><legend>完成情况自评 · 修改文字后请重新核对</legend>${lesson.production.rubric.map((item, index) => `<label><input type="checkbox" data-foundation-check="${index}">${esc(item)}</label>`).join('')}</fieldset><details class="pathway-model"><summary>先试一试，再看参考答案</summary>${paragraphs(lesson.production.model)}</details><div class="pathway-save-row"><button type="button" class="small-btn foundation-save">保存草稿</button><span class="foundation-draft-status" role="status">输入内容会自动保存在当前浏览器。</span></div><p class="pathway-support">随堂题全部答对，完成写作、口语练习并勾选三项自评后，本课会在明天加入待复习列表。原有答题记录已保留，新增的写作与口语练习可以接着完成。</p>`;
      const writing = node.querySelector('.foundation-writing'), oral = node.querySelector('.foundation-speaking'), checks = [...node.querySelectorAll('[data-foundation-check]')];
      writing.value = draft.writing; oral.value = draft.speaking; checks.forEach((input, i) => { input.checked = draft.checks[i]; });
      function capture(textChanged = false) {
        if (textChanged) checks.forEach((input) => { input.checked = false; });
        drafts.set(lesson.id, { writing: writing.value, speaking: oral.value, checks: checks.map((input) => input.checked) });
        node.querySelector('.foundation-draft-status').textContent = '正在保存…';
        clearTimeout(timer); timer = setTimeout(flush, 450);
      }
      [writing, oral].forEach((input) => input.addEventListener('input', () => capture(true)));
      checks.forEach((input) => input.addEventListener('change', () => capture()));
      node.querySelector('.foundation-save').addEventListener('click', () => { capture(); flush(); });
    }
    function renderReview() {
      const due = course.lessons.filter((lesson) => lesson.levelId === levelId && records()[lesson.id]?.dueAt && Date.parse(records()[lesson.id].dueAt) <= Date.now());
      body.innerHTML = `<h3>复习巩固 · ${esc(stage().label)}</h3><p>先不看答案，写下你记得的内容，再对照要点检查。还没记住，明天再练；有些吃力，3 天后再练；能独立答出时，会根据复习次数安排在 7、14 或 30 天后再练。</p>${due.length ? '' : '<p class="foundation-empty-review">本阶段暂时没有待复习的课程。完成一课的随堂题、写作、口语练习和自评后，明天就会安排复习。</p>'}<div class="foundation-review-list"></div>`;
      for (const lesson of due) {
        const card = document.createElement('article'); card.className = 'foundation-review-card';
        card.innerHTML = `<h4>${esc(lesson.title)}</h4><p>${esc(lesson.review.prompt)}</p><label>我记得的内容（这里的文字不会保存）<textarea rows="3" maxlength="8000"></textarea></label><button type="button" class="small-btn foundation-reveal">查看参考要点</button><div class="foundation-review-answer" hidden>${paragraphs(lesson.review.answer)}<div class="pathway-modes">${[['again', '还没记住'], ['hard', '有些吃力'], ['good', '能独立答出']].map(([grade, label]) => `<button type="button" class="small-btn" data-review-grade="${grade}">${label}</button>`).join('')}</div></div><p class="foundation-review-error" role="status"></p><button type="button" class="ghost-btn foundation-review-lesson">返回本课</button>`;
        let revealed = false;
        card.querySelector('.foundation-reveal').addEventListener('click', () => {
          if (!card.querySelector('textarea').value.trim()) { card.querySelector('.foundation-review-error').textContent = '先写下你记得的内容。想不起来时，也可以记下哪里卡住了。'; return; }
          revealed = true; card.querySelector('.foundation-review-answer').hidden = false; card.querySelector('.foundation-review-error').textContent = '';
        });
        card.querySelectorAll('[data-review-grade]').forEach((button) => button.addEventListener('click', () => {
          if (!revealed) return;
          try { if (persist(engine.review(state.foundationProgress, FOUNDATION_CATALOG, course.id, lesson.id, button.dataset.reviewGrade))) { renderReview(); metrics(); renderDashboard(); } } catch (error) { notice(error.message); }
        }));
        card.querySelector('.foundation-review-lesson').addEventListener('click', () => selectLesson(course.lessons.indexOf(lesson), true));
        body.querySelector('.foundation-review-list').append(card);
      }
    }
    function assessmentDraft() {
      if (!assessments.has(levelId)) assessments.set(levelId, { answers: stage().assessment.questions.map(() => null), writing: '', speaking: '', checks: [false, false, false], transcriptUsed: false, submitted: false });
      return assessments.get(levelId);
    }
    function renderAssessment() {
      const current = stage(), item = current.assessment, draft = assessmentDraft();
      const history = state.foundationProgress.courses[course.id].assessments[current.id] || [];
      body.innerHTML = `<h3>${esc(current.label)} · ${course.title}阶段测评</h3><p>换一组材料，试试学得怎么样。理解题得分与写作、口语自评分开记录；再次练习同一套题时，可用来巩固所学。</p><details class="foundation-history"><summary>已保存 ${history.length} 次测评（最多保留最近 10 次）</summary><ol>${history.map((record) => `<li><strong>${esc(new Date(record.submittedAt).toLocaleString())} · ${record.answers.filter((a, i) => a === item.questions[i].answer).length}/${item.questions.length}</strong><p>${record.transcriptUsed ? '已用听力原文辅助' : '未标记使用听力原文'} · 写作与口语自评 ${record.checks.filter(Boolean).length}/3</p><details><summary>查看已提交的练习</summary><div>${paragraphs(record.writing)}${paragraphs(record.speaking)}</div></details></li>`).join('')}</ol></details><section class="pathway-reading"><h4>${esc(item.reading.title)}</h4><div lang="en">${paragraphs(item.reading.text)}</div></section><section class="pathway-listening"><h4>${esc(item.listening.title)}</h4><div class="pathway-audio-controls"><button type="button" class="small-btn foundation-listen">播放材料</button><button type="button" class="small-btn foundation-stop">停止</button></div><p class="foundation-audio-status" role="status"></p><details class="foundation-transcript"><summary>查看听力原文（会标记为使用了原文辅助）</summary><div lang="en">${paragraphs(item.listening.text)}</div></details><p class="pathway-support">本段采用全站朗读设置。可在页面顶部切换 AI 声线或设备朗读；示范不会给你的发音打分。</p></section><form class="foundation-assessment-form"><div class="pathway-assessment-questions">${item.questions.map((question, index) => `<fieldset><legend>${index + 1}. ${esc(question.prompt)} <small>· ${question.skill === 'listening' ? '听力' : '阅读与词句理解'}</small></legend>${question.options.map((option, choice) => `<label class="pathway-radio"><input type="radio" name="${course.id}-assessment-${index}" data-assessment-question="${index}" value="${choice}" ${draft.answers[index] === choice ? 'checked' : ''}>${esc(option)}</label>`).join('')}</fieldset>`).join('')}</div><div class="pathway-production"><label>写作练习：${esc(item.writing)}<textarea class="foundation-assessment-writing" rows="6" maxlength="8000"></textarea></label><label>口语练习：${esc(item.speaking)}<textarea class="foundation-assessment-speaking" rows="5" maxlength="8000"></textarea></label><fieldset class="pathway-rubric"><legend>写作与口语自评 · 只勾选已做到的项目</legend>${item.rubric.map((criterion, i) => `<label><input type="checkbox" data-assessment-check="${i}" ${draft.checks[i] ? 'checked' : ''}>${esc(criterion)}</label>`).join('')}</fieldset><label class="pathway-transcript-flag"><input type="checkbox" class="foundation-transcript-used" ${draft.transcriptUsed ? 'checked' : ''}>我看过听力原文</label><p class="pathway-support">提交前的测评草稿只在本页暂存，刷新页面会丢失。提交后，答案、自评和练习文字会保存在当前浏览器，并包含在导出的记录中；开启多设备同步后，也会加密同步。</p></div><p class="foundation-assessment-error" role="alert"></p><button type="submit" class="primary-btn">提交本阶段测评</button></form><div class="foundation-assessment-result" tabindex="-1"></div>`;
      const form = body.querySelector('form'), writing = form.querySelector('.foundation-assessment-writing'), oral = form.querySelector('.foundation-assessment-speaking');
      writing.value = draft.writing; oral.value = draft.speaking;
      function capture(event) {
        if (draft.submitted) return;
        if (event?.target === writing || event?.target === oral) form.querySelectorAll('[data-assessment-check]').forEach((input) => { input.checked = false; });
        draft.writing = writing.value; draft.speaking = oral.value;
        draft.answers = item.questions.map((_, i) => { const checked = form.querySelector(`[data-assessment-question="${i}"]:checked`); return checked ? Number(checked.value) : null; });
        draft.checks = [...form.querySelectorAll('[data-assessment-check]')].map((input) => input.checked);
        draft.transcriptUsed ||= form.querySelector('.foundation-transcript-used').checked;
        form.querySelector('.foundation-transcript-used').checked = draft.transcriptUsed;
      }
      form.addEventListener('input', capture); form.addEventListener('change', capture);
      body.querySelector('.foundation-transcript').addEventListener('toggle', (event) => { if (event.currentTarget.open && !draft.submitted) { draft.transcriptUsed = true; form.querySelector('.foundation-transcript-used').checked = true; } });
      body.querySelector('.foundation-listen').addEventListener('click', () => {
        window.stopFoundationStudySpeech(); window.stopFoundationSpeech?.(); window.stopPathwaySpeech?.();
        const status = body.querySelector('.foundation-audio-status');
        window.EnglishSpeech.play(item.listening.text, { owner: 'foundation-assessment', onStatus: message => { status.textContent = message; } });
      });
      body.querySelector('.foundation-stop').addEventListener('click', () => { window.stopFoundationStudySpeech(); body.querySelector('.foundation-audio-status').textContent = '已停止。'; });
      form.addEventListener('submit', (event) => {
        event.preventDefault(); if (draft.submitted) return; capture();
        try {
          const { submitted, ...payload } = draft;
          if (!persist(engine.assess(state.foundationProgress, FOUNDATION_CATALOG, course.id, levelId, payload))) return;
          draft.submitted = true; metrics(); renderAssessment();
          body.querySelector('.foundation-assessment-result').focus({ preventScroll: true }); body.querySelector('.foundation-assessment-result').scrollIntoView({ block: 'start' });
        } catch (error) { form.querySelector('.foundation-assessment-error').textContent = error.message; }
      });
      if (draft.submitted) {
        form.querySelectorAll('input,textarea,button').forEach((input) => { input.disabled = true; });
        const result = body.querySelector('.foundation-assessment-result'), score = item.questions.filter((q, i) => q.answer === draft.answers[i]).length;
        result.innerHTML = `<h4>理解题 ${score}/${item.questions.length} · 写作与口语自评 ${draft.checks.filter(Boolean).length}/3</h4><p>${draft.transcriptUsed ? '本次使用了听力原文辅助。' : ''}结果仅反映本次练习表现，不能作为达到 ${esc(current.label)} 水平的证明。可以按解析补练，再到综合路线练习应用。</p><ol>${item.questions.map((question, i) => `<li><strong>${draft.answers[i] === question.answer ? '✓' : '待改进'} ${esc(question.prompt)}</strong><p>${esc(question.options[question.answer])} — ${esc(question.explanation)}</p></li>`).join('')}</ol><details><summary>写作与口语参考答案</summary>${paragraphs(item.model)}</details><div class="pathway-modes"><button type="button" class="small-btn foundation-retake">再练一遍</button><button type="button" class="primary-btn foundation-return">回到本阶段课程</button></div>`;
        result.querySelector('.foundation-retake').addEventListener('click', () => { assessments.delete(levelId); window.stopFoundationStudySpeech(); renderAssessment(); });
        result.querySelector('.foundation-return').addEventListener('click', () => setMode('lessons'));
      }
    }
    const controller = {
      flush, metrics,
      showAssessment() { setMode('assessment'); body.scrollIntoView({ block: 'start' }); },
      dirty: () => drafts.size > 0 || [...assessments.values()].some((draft) => !draft.submitted && (draft.answers.some((answer) => answer !== null) || draft.writing.trim() || draft.speaking.trim() || draft.checks.some(Boolean) || draft.transcriptUsed)),
      reset() { clearTimeout(timer); drafts.clear(); assessments.clear(); mode = 'lessons'; levelId = state.foundationProgress.courses[course.id].levelId; snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); window.stopFoundationStudySpeech(); },
      beforeRefresh() { if (snapshot !== JSON.stringify(state.foundationProgress.courses[course.id])) this.reset(); },
      beforeLesson() { flush(); window.stopFoundationStudySpeech(); },
      onLesson(lesson) { currentLesson = lesson; levelId = lesson.levelId; mode = 'lessons'; snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); renderPanel(); production(lesson); },
      noteSaved() { snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); metrics(); },
    };
    controllers.push(controller); return controller;
  };
})();
