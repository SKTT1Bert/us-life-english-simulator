(function (root) {
  'use strict';
  let coach, diagnostic, listening;
  const progress = () => progressPayload();
  function commit(action) {
    const next = root.LearningStudioProgress.apply(state.learningStudio, action, STUDIO_CATALOG);
    const candidate = freshProgressCopy();
    candidate.learningStudio = next;
    if (!persistReplacement(candidate)) return false;
    coach?.refresh();
    return true;
  }
  function navigate(action) {
    if (action.type === 'expression-review') {
      const due = ReviewEngine.dueItems(learningExpressions(), state.reviewSchedule);
      if (due.length) startRecall(due[0].id);
      else { setView('quiz'); setPracticeMode('recall'); }
    }
    else if (action.type === 'pathway') root.openPathwayLesson?.(action.levelId, action.lessonId);
    else if (action.type === 'foundation') root.openFoundationLesson?.(action.courseId, action.lessonId);
    else if (action.type === 'listening') { setView('listening'); if (action.lessonId) listening?.openLesson(action.lessonId, action.segmentId); }
    else if (action.type === 'diagnostic') setView('diagnostic');
    else if (action.type === 'report') setView('report');
  }
  root.refreshLearningStudio = () => { coach?.refresh(); diagnostic?.refresh(); listening?.refresh(); };
  root.resetLearningStudioSession = () => { coach?.resetSession(); diagnostic?.resetSession(); listening?.resetSession(); };
  root.dailyEnglishStudioReady = (root.dailyEnglishAppReady || Promise.resolve()).then(() => {
    coach = root.LearningCoach.mount({
      today: document.getElementById('learningCoachToday'), report: document.getElementById('learningCoachReport'),
      getProgress: progress, getCatalogs: () => ({ pathway: PATHWAY_CATALOG, foundation: FOUNDATION_CATALOG, expressions: learningExpressions() }),
      commit, navigate
    });
    diagnostic = root.LearningDiagnostic.mount(document.getElementById('view-diagnostic'), {
      getProgress: () => state.learningStudio, commit,
      onStart: (levelId) => {
        const level = PATHWAY_CATALOG.find((item) => item.id === levelId);
        if (level?.lessons[0]) root.openPathwayLesson(levelId, level.lessons[0].id);
      }
    });
    listening = root.ListeningLab.mount(document.getElementById('view-listening'), { catalog: PATHWAY_CATALOG, getProgress: () => state.learningStudio, commit });
    root.addEventListener('daily-english-view', () => coach?.refresh());
    root.addEventListener('beforeunload', (event) => {
      if (root.LearningDiagnostic.hasPendingWork() || root.ListeningLab.hasPendingWork() || root.LearningCoach.hasPendingWork?.()) { event.preventDefault(); event.returnValue = ''; }
    });
    return true;
  }).catch(() => {
    const notice = document.getElementById('storageNotice');
    notice.textContent = '今日计划或专项练习未能加载，请刷新后重试。已有课程与记录仍然保留。'; notice.hidden = false;
    return false;
  });
})(window);
