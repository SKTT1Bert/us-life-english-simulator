(function (root) {
  'use strict';
  const courseLabels = { pathway: '综合路线', 'word-parts': '词根词缀', phonics: '自然拼读' };
  const list = (value) => Array.isArray(value) ? value : [];
  const levelLabel = (id) => id === 'pre-a1' ? 'Pre-A1' : String(id || '').toUpperCase();

  // Read current lesson evidence only. Historical assessments and unanswered
  // questions are intentionally excluded, and no progress is changed here.
  function aggregate(progress = {}, catalogs = {}) {
    const lessons = [];
    function add(courseId, stage, lesson, record, questions) {
      if (!lesson || typeof lesson.id !== 'string') return;
      const answers = list(record?.answers);
      const wrongQuestions = list(questions).reduce((indices, question, index) => {
        const answer = answers[index];
        if (question && Number.isInteger(question.answer)
          && Number.isInteger(answer) && answer >= 0 && answer < list(question.options).length
          && answer !== question.answer) indices.push(index);
        return indices;
      }, []);
      if (!wrongQuestions.length) return;
      lessons.push({ courseId, courseLabel: courseLabels[courseId], levelId: stage?.id || lesson.levelId || 'pre-a1',
        levelLabel: stage?.label || levelLabel(stage?.id || lesson.levelId || 'pre-a1'),
        lessonId: lesson.id, title: lesson.title || lesson.id, wrongCount: wrongQuestions.length, wrongQuestions });
    }
    for (const stage of list(catalogs.pathway)) {
      for (const lesson of list(stage?.lessons)) add('pathway', stage, lesson, progress?.pathwayProgress?.lessons?.[lesson.id], lesson.questions);
    }
    for (const courseId of ['word-parts', 'phonics']) {
      for (const lesson of list(catalogs.foundation?.[courseId])) {
        const stage = list(catalogs.foundation?.stages?.[courseId]).find((entry) => entry.id === lesson.levelId);
        add(courseId, stage, lesson, progress?.foundationProgress?.courses?.[courseId]?.records?.[lesson.id], lesson.quizzes || (lesson.quiz ? [lesson.quiz] : []));
      }
    }
    // Stable course order breaks ties; a larger unresolved set is shown first.
    lessons.sort((a, b) => b.wrongCount - a.wrongCount);
    return { lessons, lessonCount: lessons.length, questionCount: lessons.reduce((sum, lesson) => sum + lesson.wrongCount, 0) };
  }

  const api = { aggregate };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root?.document) return;
  root.PracticeHub = api;
  const rendered = new WeakMap();
  function element(tag, className, text) {
    const node = root.document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  root.refreshPracticeHub = function (progress, catalogs) {
    const target = root.document.getElementById('practiceHub');
    if (!target) return;
    const source = progress || (typeof state !== 'undefined' ? state : {});
    const content = catalogs || { pathway: root.LEARNING_PATH, foundation: {
      'word-parts': root.WORD_PARTS_LESSONS, phonics: root.PHONICS_LESSONS,
      stages: { 'word-parts': root.WORD_PARTS_STAGES, phonics: root.PHONICS_STAGES }
    } };
    const summary = aggregate(source, content);
    const visible = summary.lessons.slice(0, 3);
    const signature = JSON.stringify([summary.lessonCount, summary.questionCount, visible]);
    if (rendered.get(target) === signature) return;
    const focusedKey = target.contains(root.document.activeElement) ? root.document.activeElement.dataset.practiceLesson : null;
    const section = element('section', 'practice-hub');
    section.setAttribute('aria-labelledby', 'practiceHubHeading');
    const heading = element('h3', '', '需要再练');
    heading.id = 'practiceHubHeading';
    section.append(heading, element('p', 'practice-hub-intro', summary.lessonCount
      ? `${summary.lessonCount} 课有待订正的答案。回到课程查看解析，再试一次。`
      : '当前没有待订正的随堂题。可以继续学习，或按计划复习学过的内容。'));
    if (visible.length) {
      const cards = element('div', 'practice-hub-grid');
      for (const lesson of visible) {
        const card = element('article', 'practice-hub-card');
        card.append(element('span', 'practice-hub-label', `${lesson.courseLabel} · ${lesson.levelLabel}`),
          element('h4', '', lesson.title), element('p', '', `${lesson.wrongCount} 道题待订正`));
        const button = element('button', 'small-btn', '回到这节课 →');
        button.type = 'button';
        button.dataset.practiceLesson = `${lesson.courseId}:${lesson.lessonId}`;
        button.setAttribute('aria-label', `回到${lesson.courseLabel} ${lesson.levelLabel}：${lesson.title}，${lesson.wrongCount} 道题待订正`);
        button.addEventListener('click', () => {
          const opened = lesson.courseId === 'pathway'
            ? root.openPathwayLesson?.(lesson.levelId, lesson.lessonId)
            : root.openFoundationLesson?.(lesson.courseId, lesson.lessonId);
          if (!opened) section.querySelector('.practice-hub-status').textContent = '暂时无法打开这节课，请刷新后重试。';
        });
        card.append(button); cards.append(card);
      }
      section.append(cards);
      if (summary.lessonCount > visible.length) section.append(element('p', 'practice-hub-more', `先练这 ${visible.length} 课，订正后会继续显示其他需要练习的课程。`));
    }
    const status = element('p', 'practice-hub-status');
    status.setAttribute('role', 'status'); section.append(status);
    target.replaceChildren(section);
    rendered.set(target, signature);
    if (focusedKey) [...target.querySelectorAll('[data-practice-lesson]')].find((button) => button.dataset.practiceLesson === focusedKey)?.focus();
  };
})(typeof window !== 'undefined' ? window : globalThis);
