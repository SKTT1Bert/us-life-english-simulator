(function (root) {
  'use strict';
  const ids = ['word-parts', 'phonics'];
  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const questions = (lesson) => lesson.quizzes || [lesson.quiz];
  function empty() {
    return { version: 1, courses: Object.fromEntries(ids.map((id) => [id, { lessonId: null, records: {} }])) };
  }
  function restore(value, catalog) {
    if (value == null) return empty();
    if (!isObject(value) || value.version !== 1 || !isObject(value.courses)
      || Object.keys(value.courses).some((id) => !ids.includes(id))) throw new Error('基础课程进度格式或版本不支持。');
    const result = empty();
    for (const id of ids) {
      const source = value.courses[id];
      if (source === undefined) continue;
      const lessons = new Map(catalog[id].map((lesson) => [lesson.id, lesson]));
      if (!isObject(source) || !isObject(source.records)
        || (source.lessonId !== null && !lessons.has(source.lessonId))) throw new Error('基础课程引用了未知课节。');
      result.courses[id].lessonId = source.lessonId;
      for (const [lessonId, record] of Object.entries(source.records)) {
        const lesson = lessons.get(lessonId);
        if (!lesson || !isObject(record) || !Array.isArray(record.answers)
          || record.answers.length !== questions(lesson).length
          || record.answers.some((answer, index) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= questions(lesson)[index].options.length))
          || typeof record.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(record.updatedAt)
          || !Number.isFinite(Date.parse(record.updatedAt))) throw new Error('基础课程练习记录格式不正确。');
        result.courses[id].records[lessonId] = { answers: [...record.answers], updatedAt: record.updatedAt };
      }
    }
    return result;
  }
  function lessonStatus(progress, courseId, lesson) {
    const answers = progress.courses[courseId].records[lesson.id]?.answers || [];
    const qs = questions(lesson);
    const answered = answers.filter((value) => value !== null).length;
    const correct = answers.filter((value, index) => value === qs[index].answer).length;
    return { answered, correct, total: qs.length, complete: correct === qs.length,
      wrong: answers.reduce((list, value, index) => value !== null && value !== qs[index].answer ? [...list, index] : list, []) };
  }
  function summary(progress, courseId, lessons) {
    return lessons.reduce((result, lesson) => {
      const status = lessonStatus(progress, courseId, lesson);
      result.completed += Number(status.complete);
      result.answered += status.answered;
      result.correct += status.correct;
      result.totalQuestions += status.total;
      result.toReview += Number(status.wrong.length > 0);
      return result;
    }, { completed: 0, answered: 0, correct: 0, totalQuestions: 0, toReview: 0 });
  }
  function change(progress, catalog, courseId, lessonId, mutate) {
    const next = restore(progress, catalog);
    const lesson = catalog[courseId]?.find((item) => item.id === lessonId);
    if (!lesson) throw new Error('没有找到这节课程。');
    next.courses[courseId].lessonId = lessonId;
    if (mutate) {
      const record = next.courses[courseId].records[lessonId] || { answers: Array.from(questions(lesson), () => null), updatedAt: '' };
      mutate(record, lesson);
      record.updatedAt = new Date().toISOString();
      next.courses[courseId].records[lessonId] = record;
    }
    return next;
  }
  function answer(progress, catalog, courseId, lessonId, index, option) {
    return change(progress, catalog, courseId, lessonId, (record, lesson) => {
      const question = questions(lesson)[index];
      if (!Number.isInteger(index) || !question || !Number.isInteger(option) || option < 0 || option >= question.options.length) throw new Error('练习答案无效。');
      if (record.answers[index] !== null) throw new Error('本题已经作答，请先选择重练。');
      record.answers[index] = option;
    });
  }
  function retry(progress, catalog, courseId, lessonId, wrongOnly = true) {
    return change(progress, catalog, courseId, lessonId, (record, lesson) => {
      record.answers = record.answers.map((value, index) => wrongOnly && value === questions(lesson)[index].answer ? value : null);
    });
  }
  const api = Object.freeze({ restore, empty, questions, lessonStatus, summary, answer, retry,
    visit: (progress, catalog, courseId, lessonId) => change(progress, catalog, courseId, lessonId) });
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FoundationProgress = api;
})(typeof window === 'object' ? window : null);
