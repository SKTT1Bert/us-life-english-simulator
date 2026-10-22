(() => {
  'use strict';
  const controllers = [], engine = window.FoundationProgress, esc = escapeHTML;
  const paragraphs = (text) => String(text).split(/\n+/).filter(Boolean).map((line) => `<p>${esc(line)}</p>`).join('');
  let audioRun = 0, speaking = false;
  window.stopFoundationStudySpeech = () => { audioRun++; if (speaking) window.speechSynthesis?.cancel(); speaking = false; };
  window.flushFoundationDrafts = () => controllers.map((controller) => controller.flush()).every(Boolean);
  window.resetFoundationSession = () => controllers.forEach((controller) => controller.reset());
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
      if (node) node.innerHTML = `<span><strong>${info.objectiveComplete}/${info.total}</strong> 课答对随堂题</span><span><strong>${info.completed}/${info.total}</strong> 课完成练习与自评</span><span><strong>${info.due}</strong> 课到期</span><span><strong>${info.assessmentCount}</strong> 次测评</span>`;
    }
    function setMode(next) { flush(); window.stopFoundationStudySpeech(); window.stopFoundationSpeech?.(); mode = next; renderPanel(); panel.querySelector(`[data-foundation-mode="${next}"]`)?.focus({ preventScroll: true }); }
    function renderPanel() {
      const current = stage();
      panel.innerHTML = `<nav class="pathway-levels foundation-levels" aria-label="${course.title}学习阶段">${stages.map((item) => `<button type="button" data-foundation-level="${item.id}" aria-pressed="${item.id === current.id}"><strong>${esc(item.label)}</strong><span>${esc(item.title)}</span></button>`).join('')}</nav><div class="foundation-stage-heading"><div><span class="eyebrow">${esc(current.label)} / 专项课程</span><h3>${esc(current.title)}</h3><p>${esc(current.description)}</p></div><button type="button" class="small-btn foundation-route-link">衔接 ${esc(current.label)} 综合路线 →</button></div><ul class="pathway-can-do">${current.canDo.map((goal) => `<li>${esc(goal)}</li>`).join('')}</ul><div class="pathway-metrics foundation-metrics"></div><nav class="pathway-modes" aria-label="专项学习方式">${[['lessons', '课程与练习'], ['review', '到期复习'], ['assessment', '阶段测评']].map(([id, label]) => `<button type="button" class="small-btn" data-foundation-mode="${id}" aria-pressed="${mode === id}">${label}</button>`).join('')}</nav><p class="pathway-support">分级用于安排练习。词根与拼读是专项能力，需结合综合路线的听说读写；自测不认证 C1，合成语音不评判发音。</p><details class="pathway-reference"><summary>本阶段参考依据</summary><ul>${safeSources(current.sources)}</ul></details>`;
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
      if (drafts.size) notice('有尚未保存的课程草稿，已暂留在对应课节，请重试或复制备份。');
    }
    function production(lesson) {
      const node = document.createElement('section'); node.className = 'pathway-production foundation-production';
      root.querySelector('.tutorial-practice').after(node);
      const draft = drafts.get(lesson.id) || records()[lesson.id] || { writing: '', speaking: '', checks: [false, false, false] };
      node.innerHTML = `<span class="eyebrow">Use it / 专项应用</span><h4>用出来，再回头核对</h4><label>书面任务：${esc(lesson.production.writing)}<textarea class="foundation-writing" rows="5" maxlength="8000"></textarea></label><label>口头任务：${esc(lesson.production.speaking)}<textarea class="foundation-speaking" rows="4" maxlength="8000" placeholder="实际说一遍，再保存口述稿、标注或反思。"></textarea></label><p class="pathway-support">此处保存文本，不录音、不自动评分发音。每段最多 8000 字符。</p><fieldset class="pathway-rubric"><legend>对照任务自评 · 修改文字后重新勾选</legend>${lesson.production.rubric.map((item, index) => `<label><input type="checkbox" data-foundation-check="${index}">${esc(item)}</label>`).join('')}</fieldset><details class="pathway-model"><summary>完成尝试后查看参考</summary>${paragraphs(lesson.production.model)}</details><div class="pathway-save-row"><button type="button" class="small-btn foundation-save">保存草稿</button><span class="foundation-draft-status" role="status">输入自动保存到本机。</span></div><p class="pathway-support">随堂题全对、两项输出非空且三项自评完成后，安排次日主动复习。旧答题记录已保留，新增输出需另行完成。</p>`;
      const writing = node.querySelector('.foundation-writing'), oral = node.querySelector('.foundation-speaking'), checks = [...node.querySelectorAll('[data-foundation-check]')];
      writing.value = draft.writing; oral.value = draft.speaking; checks.forEach((input, i) => { input.checked = draft.checks[i]; });
      function capture(textChanged = false) {
        if (textChanged) checks.forEach((input) => { input.checked = false; });
        drafts.set(lesson.id, { writing: writing.value, speaking: oral.value, checks: checks.map((input) => input.checked) });
        node.querySelector('.foundation-draft-status').textContent = '正在等待保存…';
        clearTimeout(timer); timer = setTimeout(flush, 450);
      }
      [writing, oral].forEach((input) => input.addEventListener('input', () => capture(true)));
      checks.forEach((input) => input.addEventListener('change', () => capture()));
      node.querySelector('.foundation-save').addEventListener('click', () => { capture(); flush(); });
    }
    function renderReview() {
      const due = course.lessons.filter((lesson) => lesson.levelId === levelId && records()[lesson.id]?.dueAt && Date.parse(records()[lesson.id].dueAt) <= Date.now());
      body.innerHTML = `<h3>主动回忆 · ${esc(stage().label)}</h3><p>先写出回忆，再展开核对；按实际表现安排下一次。重学 1 天、吃力 3 天、顺利 7 / 14 / 30 天。</p>${due.length ? '' : '<p class="foundation-empty-review">本阶段暂时没有到期复习。完成随堂题和输出自评后，将安排次日复习。</p>'}<div class="foundation-review-list"></div>`;
      for (const lesson of due) {
        const card = document.createElement('article'); card.className = 'foundation-review-card';
        card.innerHTML = `<h4>${esc(lesson.title)}</h4><p>${esc(lesson.review.prompt)}</p><label>我的回忆（本次输入不保存）<textarea rows="3" maxlength="8000"></textarea></label><button type="button" class="small-btn foundation-reveal">查看核对要点</button><div class="foundation-review-answer" hidden>${paragraphs(lesson.review.answer)}<div class="pathway-modes">${[['again', '需要重学'], ['hard', '有些吃力'], ['good', '顺利回忆']].map(([grade, label]) => `<button type="button" class="small-btn" data-review-grade="${grade}">${label}</button>`).join('')}</div></div><p class="foundation-review-error" role="status"></p><button type="button" class="ghost-btn foundation-review-lesson">返回本课</button>`;
        let revealed = false;
        card.querySelector('.foundation-reveal').addEventListener('click', () => {
          if (!card.querySelector('textarea').value.trim()) { card.querySelector('.foundation-review-error').textContent = '先尝试回忆；想不起来也可以写下卡住的地方。'; return; }
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
      body.innerHTML = `<h3>${esc(current.label)} · ${course.title}阶段测评</h3><p>使用新材料检验迁移。理解题与输出自评分开记录；同一套题重做属于复习。</p><details class="foundation-history"><summary>已保存 ${history.length} 次测评（最多保留最近 10 次）</summary><ol>${history.map((record) => `<li><strong>${esc(new Date(record.submittedAt).toLocaleString())} · ${record.answers.filter((a, i) => a === item.questions[i].answer).length}/${item.questions.length}</strong><p>${record.transcriptUsed ? '使用了文本辅助' : '未勾选文本辅助'} · 输出自评 ${record.checks.filter(Boolean).length}/3</p><details><summary>查看已提交文本</summary><div>${paragraphs(record.writing)}${paragraphs(record.speaking)}</div></details></li>`).join('')}</ol></details><section class="pathway-reading"><h4>${esc(item.reading.title)}</h4><div lang="en">${paragraphs(item.reading.text)}</div></section><section class="pathway-listening"><h4>${esc(item.listening.title)}</h4><div class="pathway-audio-controls"><button type="button" class="small-btn foundation-listen">播放材料</button><button type="button" class="small-btn foundation-stop">停止</button></div><p class="foundation-audio-status" role="status"></p><details class="foundation-transcript"><summary>查看听力文本（记录为使用文本辅助）</summary><div lang="en">${paragraphs(item.listening.text)}</div></details><p class="pathway-support">设备语音用于理解练习，不能精确示范所有重音与语调，也不测你的发音。</p></section><form class="foundation-assessment-form"><div class="pathway-assessment-questions">${item.questions.map((question, index) => `<fieldset><legend>${index + 1}. ${esc(question.prompt)} <small>· ${question.skill === 'listening' ? '听力' : '阅读 / 语言分析'}</small></legend>${question.options.map((option, choice) => `<label class="pathway-radio"><input type="radio" name="${course.id}-assessment-${index}" data-assessment-question="${index}" value="${choice}" ${draft.answers[index] === choice ? 'checked' : ''}>${esc(option)}</label>`).join('')}</fieldset>`).join('')}</div><div class="pathway-production"><label>书面任务：${esc(item.writing)}<textarea class="foundation-assessment-writing" rows="6" maxlength="8000"></textarea></label><label>口头任务：${esc(item.speaking)}<textarea class="foundation-assessment-speaking" rows="5" maxlength="8000"></textarea></label><fieldset class="pathway-rubric"><legend>输出自评 · 未达到的项目保留未勾选</legend>${item.rubric.map((criterion, i) => `<label><input type="checkbox" data-assessment-check="${i}" ${draft.checks[i] ? 'checked' : ''}>${esc(criterion)}</label>`).join('')}</fieldset><label class="pathway-transcript-flag"><input type="checkbox" class="foundation-transcript-used" ${draft.transcriptUsed ? 'checked' : ''}>我使用了听力文本辅助</label><p class="pathway-support">提交前草稿暂存于本页，刷新会丢失；提交后的答案、自评和文本会保存并随主进度导出。</p></div><p class="foundation-assessment-error" role="alert"></p><button type="submit" class="primary-btn">提交本阶段测评</button></form><div class="foundation-assessment-result" tabindex="-1"></div>`;
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
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { status.textContent = '当前设备不支持朗读，请使用文本辅助并记录。'; return; }
        const run = ++audioRun, utterance = new SpeechSynthesisUtterance(item.listening.text); utterance.lang = 'en-US'; utterance.rate = 1;
        speaking = true; status.textContent = '正在播放。';
        utterance.onend = () => { if (run === audioRun) { speaking = false; status.textContent = '播放结束。'; } };
        utterance.onerror = () => { if (run === audioRun) { speaking = false; status.textContent = '播放不可用，可使用文本辅助。'; } };
        try { window.speechSynthesis.speak(utterance); } catch { speaking = false; status.textContent = '播放不可用，可使用文本辅助。'; }
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
        result.innerHTML = `<h4>理解题 ${score}/${item.questions.length} · 输出自评 ${draft.checks.filter(Boolean).length}/3</h4><p>${draft.transcriptUsed ? '本次使用了文本辅助。' : ''}这是本专项、本套材料的表现，不代表通过 ${esc(current.label)}。按解析重练，再到综合路线应用。</p><ol>${item.questions.map((question, i) => `<li><strong>${draft.answers[i] === question.answer ? '✓' : '待改进'} ${esc(question.prompt)}</strong><p>${esc(question.options[question.answer])} — ${esc(question.explanation)}</p></li>`).join('')}</ol><details><summary>输出参考与改进方向</summary>${paragraphs(item.model)}</details><div class="pathway-modes"><button type="button" class="small-btn foundation-retake">重新练习本套材料</button><button type="button" class="primary-btn foundation-return">回到本阶段课程</button></div>`;
        result.querySelector('.foundation-retake').addEventListener('click', () => { assessments.delete(levelId); window.stopFoundationStudySpeech(); renderAssessment(); });
        result.querySelector('.foundation-return').addEventListener('click', () => setMode('lessons'));
      }
    }
    const controller = {
      flush, metrics,
      showAssessment() { setMode('assessment'); body.scrollIntoView({ block: 'start' }); },
      dirty: () => drafts.size > 0 || [...assessments.values()].some((draft) => !draft.submitted && (draft.answers.some((answer) => answer !== null) || draft.writing.trim() || draft.speaking.trim())),
      reset() { clearTimeout(timer); drafts.clear(); assessments.clear(); mode = 'lessons'; levelId = state.foundationProgress.courses[course.id].levelId; snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); window.stopFoundationStudySpeech(); },
      beforeRefresh() { if (snapshot !== JSON.stringify(state.foundationProgress.courses[course.id])) this.reset(); },
      beforeLesson() { flush(); window.stopFoundationStudySpeech(); },
      onLesson(lesson) { currentLesson = lesson; levelId = lesson.levelId; mode = 'lessons'; snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); renderPanel(); production(lesson); },
      noteSaved() { snapshot = JSON.stringify(state.foundationProgress.courses[course.id]); metrics(); },
    };
    controllers.push(controller); return controller;
  };
})();
