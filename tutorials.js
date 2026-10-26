(() => {
  'use strict';
  const engine = window.FoundationProgress;
  const courses = [
    { id: 'word-parts', title: '词根词缀', english: 'Word Building', description: '先认识词根和词缀怎样组成单词，再学习同根词、学术用词和专业词汇，并结合上下文判断词义。', goal: '拆解单词 · 推测词义 · 联系上下文', parts: ['un', 'help', 'ful'], labels: ['前缀', '词基', '后缀'], example: 'unhelpful', meaning: '没有帮助的', lessons: FOUNDATION_CATALOG['word-parts'], other: 'phonics', otherLabel: '去自然拼读' },
    { id: 'phonics', title: '自然拼读', english: 'Phonics', description: '从字母与发音的对应关系开始，逐步练习多音节词、句子停顿、学术听力和课堂讨论。发音标注以美式英语为主。', goal: '认字母组合 · 练习拼读 · 听音跟读', parts: ['/k/', '/æ/', '/t/'], labels: ['c', 'a', 't'], example: 'cat', meaning: '/kæt/ · 猫', lessons: FOUNDATION_CATALOG.phonics, other: 'word-parts', otherLabel: '去词根词缀' }
  ];
  const tabs = [...document.querySelectorAll('[data-course]')];
  window.stopFoundationSpeech = () => window.EnglishSpeech.stop('foundation-example');
  function selectCourse(id, focus = false) {
    window.flushFoundationDrafts?.(); window.stopFoundationStudySpeech?.();
    window.stopFoundationSpeech();
    tabs.forEach((tab) => {
      const selected = tab.dataset.course === id;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focus) tab.focus({ preventScroll: true });
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCourse(tab.dataset.course));
    tab.addEventListener('keydown', (event) => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return; event.preventDefault(); selectCourse(tabs[next].dataset.course, true);
    });
  });
  const refreshers = [];
  const openers = {};
  courses.forEach((course) => {
    const root = document.getElementById(`view-${course.id}`);
    let current = 0, questionIndex = 0, study = null;
    const stages = [...new Set(course.lessons.map((lesson) => lesson.stage || '基础'))];
    root.innerHTML = `<div class="tutorial-hero"><div class="tutorial-hero-copy"><span class="eyebrow">${course.english} / Pre-A1 → C1 专项课程</span><h2>${course.title}<span>从规律开始，练到会用。</span></h2><p>${course.description}</p><div class="tutorial-meta"><span>${course.lessons.length} 节课</span><span>${stages.length} 个学习阶段</span><span>${course.lessons.reduce((sum, lesson) => sum + engine.questions(lesson).length, 0)} 道练习</span><span>${FOUNDATION_CATALOG.stages[course.id].reduce((sum, stage) => sum + stage.assessment.questions.length, 0)} 道测评题</span></div></div><div class="tutorial-preview" aria-label="${course.example} 拆解示例"><span class="tutorial-preview-label">${course.goal}</span><div class="tutorial-parts">${course.parts.map((part, index) => `${index ? '<span class="tutorial-plus" aria-hidden="true">+</span>' : ''}<div><strong lang="en">${part}</strong><span>${course.labels[index]}</span></div>`).join('')}</div><p><strong lang="en">${course.example}</strong><span>${course.meaning}</span></p></div></div>
      <div class="tutorial-dashboard"><div><strong class="tutorial-progress-label"></strong><p class="tutorial-progress-description"></p><progress class="tutorial-progress-bar" max="${course.lessons.length}" value="0" aria-label="${course.title}练习完成课数"></progress></div><button type="button" class="primary-btn tutorial-resume">继续学习 →</button></div><p class="tutorial-course-status" role="status"></p>
      <details class="tutorial-catalog"><summary><strong>课程目录</strong><span>${course.lessons.length} 节 · 查找主题或直接选课</span></summary><div class="tutorial-catalog-tools"><label>查找课程<input type="search" class="input tutorial-search" placeholder="标题、词根、例词…" /></label><label>学习阶段<select class="select tutorial-stage"><option value="all">全部阶段</option>${stages.map((stage) => `<option value="${escapeHTML(stage)}">${escapeHTML(stage)}</option>`).join('')}</select></label></div><nav class="tutorial-catalog-list" aria-label="${course.title}课程目录"></nav><p class="tutorial-empty" hidden>没有匹配的课程，试试其他关键词或阶段。</p></details><article class="tutorial-article" aria-labelledby="${course.id}-lesson-title"></article>`;
    const article = root.querySelector('.tutorial-article'), notice = root.querySelector('.tutorial-course-status');
    function save(progress) {
      try {
        const candidate = freshProgressCopy(); candidate.foundationProgress = progress;
        if (!persistReplacement(candidate)) throw new Error('存储不可用');
        notice.textContent = ''; study?.noteSaved(); return true;
      } catch { notice.textContent = '本次操作未保存，原有学习记录仍在。请先导出备份，再检查浏览器是否允许保存数据。'; return false; }
    }
    function statusLabel(lesson) {
      const info = engine.lessonStatus(state.foundationProgress, course.id, lesson);
      return info.fullComplete ? '本课已完成' : info.complete ? '随堂题已完成 · 继续写作与口语' : info.wrong.length ? '有错题待订正' : info.answered ? `${info.answered}/${info.total} 已答` : '未练习';
    }
    function renderCatalog() {
      const query = root.querySelector('.tutorial-search').value.trim().toLowerCase(), stage = root.querySelector('.tutorial-stage').value;
      let matches = 0;
      root.querySelector('.tutorial-catalog-list').innerHTML = stages.map((name) => {
        const lessons = course.lessons.map((lesson, index) => ({ lesson, index })).filter(({ lesson }) => (lesson.stage || '基础') === name && (stage === 'all' || stage === name) && `${lesson.title} ${lesson.subtitle} ${lesson.intro} ${lesson.examples.map((ex) => `${ex.word} ${ex.breakdown}`).join(' ')}`.toLowerCase().includes(query));
        matches += lessons.length;
        if (!lessons.length) return '';
        return `<section class="tutorial-stage-group"><h4 class="tutorial-stage-heading">${escapeHTML(name)} <span>${lessons.length} 节</span></h4><div class="tutorial-lessons">${lessons.map(({ lesson, index }) => `<button type="button" class="tutorial-lesson${index === current ? ' active' : ''}" data-lesson="${index}" ${index === current ? 'aria-current="step"' : ''}><span class="tutorial-lesson-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${escapeHTML(lesson.title)}</strong><small lang="en">${escapeHTML(lesson.subtitle)}</small><span class="tutorial-lesson-status" data-status="${engine.lessonStatus(state.foundationProgress, course.id, lesson).complete ? 'complete' : 'pending'}">${statusLabel(lesson)}</span></span></button>`).join('')}</div></section>`;
      }).join('');
      root.querySelector('.tutorial-empty').hidden = matches > 0;
      root.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', () => { root.querySelector('.tutorial-catalog').open = false; selectLesson(Number(button.dataset.lesson), true); }));
    }
    function renderDashboard() {
      const info = engine.summary(state.foundationProgress, course.id, course.lessons);
      root.querySelector('.tutorial-progress-label').textContent = `随堂题已完成 ${info.completed} / ${course.lessons.length} 课`;
      root.querySelector('.tutorial-progress-description').textContent = `已答 ${info.answered} 题，答对 ${info.correct} 题 · ${info.toReview} 课有错题。${info.fullCompleted} 课完成全部练习与自评 · ${info.due} 课待复习。进度条显示随堂题全部答对的课数。`;
      root.querySelector('progress').value = info.completed;
    }
    root.querySelector('.tutorial-search').addEventListener('input', renderCatalog);
    root.querySelector('.tutorial-stage').addEventListener('change', renderCatalog);
    root.querySelector('.tutorial-resume').addEventListener('click', () => {
      const lastId = state.foundationProgress.courses[course.id].lessonId;
      let index = course.lessons.findIndex((lesson) => lesson.id === lastId && !engine.lessonStatus(state.foundationProgress, course.id, lesson).fullComplete);
      if (index < 0) index = course.lessons.findIndex((lesson) => !engine.lessonStatus(state.foundationProgress, course.id, lesson).fullComplete);
      selectLesson(Math.max(0, index), true);
    });
    function selectLesson(index, focus = false, persist = true) {
      const lesson = course.lessons[index]; if (!lesson) return;
      const endOfStage = course.lessons[index + 1]?.levelId !== lesson.levelId;
      if (persist) study?.beforeLesson();
      window.stopFoundationSpeech(); current = index;
      if (persist) save(engine.visit(state.foundationProgress, FOUNDATION_CATALOG, course.id, lesson.id));
      const answers = state.foundationProgress.courses[course.id].records[lesson.id]?.answers || [];
      questionIndex = Math.max(0, engine.questions(lesson).findIndex((_, i) => answers[i] == null));
      article.innerHTML = `<div class="tutorial-article-heading"><div><span class="eyebrow">Lesson ${String(index + 1).padStart(2, '0')} / ${course.lessons.length} · ${escapeHTML(lesson.stage || '基础')}</span><h3 id="${course.id}-lesson-title" tabindex="-1">${escapeHTML(lesson.title)}</h3></div><span class="badge">${escapeHTML(lesson.duration)}</span></div><p class="tutorial-intro">${escapeHTML(lesson.intro)}</p><ul class="tutorial-goals" aria-label="本课目标">${(lesson.goals || []).map((goal) => `<li>${escapeHTML(goal)}</li>`).join('')}</ul>
        <div class="tutorial-body"><section class="tutorial-explanation" aria-label="本课讲解"><ol class="tutorial-steps">${lesson.steps.map((step) => `<li><h4>${escapeHTML(step.title)}</h4><p>${escapeHTML(step.text)}</p></li>`).join('')}</ol><div class="tutorial-tip"><strong>学习小提示</strong><p>${escapeHTML(lesson.tip)}</p></div></section><section class="tutorial-examples" aria-label="例词拆解"><h4>拆开看，再读一遍</h4>${lesson.examples.map((ex, i) => `<div class="tutorial-example"><div class="tutorial-example-heading"><div><strong lang="en">${escapeHTML(ex.word)}</strong><span>${escapeHTML(ex.meaning)}</span></div><button type="button" class="small-btn" data-speak-example="${i}" aria-label="朗读单词 ${escapeHTML(ex.word)}">朗读</button></div><p class="tutorial-breakdown" lang="en">${escapeHTML(ex.breakdown)}</p><p class="tutorial-example-note">${escapeHTML(ex.note)}</p></div>`).join('')}<p class="tutorial-audio-note">点击“朗读”可听完整单词、短语或句子。声线在页面顶部的“朗读设置”统一切换。示范为完整例词，不是单个音素录音；英式声线可能与课内美式音标不同。</p><p class="tutorial-speech-status" role="status"></p></section></div>
        <section class="tutorial-practice" aria-labelledby="${course.id}-quiz-title"></section><details class="tutorial-sources"><summary>本课参考与延伸阅读</summary><ul></ul></details><div class="tutorial-footer"><button type="button" class="ghost-btn tutorial-previous" ${index === 0 ? 'disabled' : ''}>← 上一课</button><span>${index + 1} / ${course.lessons.length}</span><button type="button" class="primary-btn tutorial-next">${endOfStage ? '进入本阶段测评 →' : '下一课 →'}</button></div>`;
      for (const source of lesson.sources || []) {
        try {
          const url = new URL(source.url); if (url.protocol !== 'https:' || url.username || url.password) continue;
          const li = document.createElement('li'), link = document.createElement('a');
          link.textContent = source.label; link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
          li.append(link); article.querySelector('.tutorial-sources ul').append(li);
        } catch { /* Invalid references never become links. */ }
      }
      article.querySelector('.tutorial-previous').addEventListener('click', () => selectLesson(current - 1, true));
      article.querySelector('.tutorial-next').addEventListener('click', () => { if (endOfStage) study.showAssessment(); else selectLesson(current + 1, true); });
      article.querySelectorAll('[data-speak-example]').forEach((button) => button.addEventListener('click', () => read(lesson.examples[Number(button.dataset.speakExample)].speak)));
      renderQuiz(); renderCatalog(); renderDashboard(); study?.onLesson(lesson);
      if (focus) { const heading = article.querySelector('h3'); heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start' }); }
    }
    function renderQuiz() {
      const lesson = course.lessons[current], qs = engine.questions(lesson);
      const answers = state.foundationProgress.courses[course.id].records[lesson.id]?.answers || qs.map(() => null);
      const question = qs[questionIndex], selected = answers[questionIndex], answered = selected !== null;
      const info = engine.lessonStatus(state.foundationProgress, course.id, lesson), practice = article.querySelector('.tutorial-practice');
      practice.innerHTML = `<span class="eyebrow">Try it / 随堂练习 ${questionIndex + 1} / ${qs.length}</span><div class="tutorial-quiz-nav" aria-label="随堂题目">${qs.map((q, index) => `<button type="button" class="small-btn" data-question="${index}" ${index === questionIndex ? 'aria-current="step"' : ''} data-status="${answers[index] == null ? 'pending' : answers[index] === q.answer ? 'correct' : 'wrong'}">第 ${index + 1} 题${answers[index] == null ? '' : answers[index] === q.answer ? ' ✓' : ' · 待订正'}</button>`).join('')}</div><h4 id="${course.id}-quiz-title" tabindex="-1">${escapeHTML(question.question)}</h4><div class="tutorial-options">${question.options.map((option, index) => `<button type="button" class="quiz-option${answered && index === question.answer ? ' correct' : ''}${answered && index === selected && index !== question.answer ? ' wrong' : ''}" data-answer="${index}" ${answered ? 'disabled' : ''}>${escapeHTML(option)}</button>`).join('')}</div><p class="tutorial-feedback" role="status">${answered ? escapeHTML(`${selected === question.answer ? '答对了！' : `正确答案是「${question.options[question.answer]}」。`} ${question.explanation}`) : '先选答案，再看解析。答题记录会自动保存在当前浏览器。'}</p><div class="tutorial-quiz-summary">本课已答 ${info.answered}/${qs.length} · 当前答对 ${info.correct}/${qs.length}${info.complete ? ' · 本课随堂题已完成' : ''}</div><div class="tutorial-quiz-actions"><button type="button" class="small-btn tutorial-retry" ${!info.answered ? 'hidden' : ''}>${info.wrong.length ? '重练错题' : '重新练本课'}</button><button type="button" class="small-btn tutorial-next-question" ${questionIndex === qs.length - 1 ? 'disabled' : ''}>下一题 →</button></div>`;
      practice.querySelectorAll('[data-question]').forEach((button) => button.addEventListener('click', () => { questionIndex = Number(button.dataset.question); renderQuiz(); focusQuestion(); }));
      practice.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
        if (answers[questionIndex] !== null) return;
        try {
          if (!save(engine.answer(state.foundationProgress, FOUNDATION_CATALOG, course.id, lesson.id, questionIndex, Number(button.dataset.answer)))) { practice.querySelector('.tutorial-feedback').textContent = '未能保存，本题还没有计入学习记录。请检查浏览器是否允许保存数据后重试。'; return; }
          renderQuiz(); renderCatalog(); renderDashboard();
          const feedback = practice.querySelector('.tutorial-feedback');
          feedback.tabIndex = -1;
          feedback.focus({ preventScroll: true });
        } catch (error) { notice.textContent = error.message; }
      }));
      practice.querySelector('.tutorial-next-question').addEventListener('click', () => { questionIndex += 1; renderQuiz(); focusQuestion(); });
      practice.querySelector('.tutorial-retry').addEventListener('click', () => {
        if (!save(engine.retry(state.foundationProgress, FOUNDATION_CATALOG, course.id, lesson.id, info.wrong.length > 0))) return;
        questionIndex = info.wrong[0] || 0; renderQuiz(); renderCatalog(); renderDashboard(); focusQuestion();
      });
    }
    function focusQuestion() { article.querySelector('[id$="-quiz-title"]').focus({ preventScroll: true }); }
    function read(text) {
      const status = article.querySelector('.tutorial-speech-status');
      window.EnglishSpeech.play(text, { owner: 'foundation-example', rate: .8, onStatus: message => { status.textContent = message; } });
    }
    study = window.createFoundationStudy({ course, root, save, selectLesson, renderDashboard });
    const refresh = () => {
      study.beforeRefresh();
      const savedId = state.foundationProgress.courses[course.id].lessonId;
      const index = Math.max(0, course.lessons.findIndex((lesson) => lesson.id === savedId));
      notice.textContent = ''; selectLesson(index, false, false);
    };
    refreshers.push(refresh); refresh();
    openers[course.id] = (lessonId) => {
      const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
      if (index < 0) return false;
      setView('foundations'); selectCourse(course.id); selectLesson(index, true); return true;
    };
  });
  window.refreshFoundations = () => refreshers.forEach((refresh) => refresh());
  window.openFoundationLesson = (courseId, lessonId) => openers[courseId]?.(lessonId) || false;
})();
