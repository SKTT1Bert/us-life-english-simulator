(function (root) {
  'use strict';
  const ids = ['word-parts', 'phonics'];
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const fields = (value, keys) => object(value) && keys.every((key) => own(value, key)) && Object.keys(value).every((key) => keys.includes(key));
  const fail = (message) => { throw new Error(message); };
  const questions = (lesson) => lesson.quizzes || [lesson.quiz];
  const pathway = () => {
    const engine = typeof module === 'object' && module.exports ? require('./pathwayProgress.js') : root?.PathwayProgress;
    if (!engine) fail('基础课程进度依赖的学习引擎尚未加载。');
    return engine;
  };
  function empty() {
    return { version: 2, courses: Object.fromEntries(ids.map((id) => [id, { levelId: 'pre-a1', lessonId: null, records: {}, assessments: {} }])) };
  }
  // Adapt both foundation courses to the same validated review/assessment engine
  // used by the integrated learning route. Legacy catalogues need no stage data.
  function courseCatalog(catalog, courseId) {
    if (!ids.includes(courseId) || !object(catalog) || !Array.isArray(catalog[courseId]) || !catalog[courseId].length) fail('没有找到这门基础课程。');
    const configured = catalog.stages?.[courseId];
    if (configured !== undefined && (!Array.isArray(configured) || !configured.length)) fail('基础课程的阶段配置无效。');
    const levels = configured === undefined
      ? [...new Set(catalog[courseId].map((lesson) => lesson.levelId || 'pre-a1'))].map((id) => ({ id }))
      : configured;
    const stages = levels.map((stage) => ({ ...stage, lessons: [], assessment: stage.assessment || { questions: [] } }));
    const byId = new Map(stages.map((stage) => [stage.id, stage]));
    for (const lesson of catalog[courseId]) {
      const stage = byId.get(lesson.levelId || 'pre-a1');
      if (!stage) fail('基础课程引用了未知学习阶段。');
      stage.lessons.push({ ...lesson, questions: questions(lesson) });
    }
    return stages;
  }
  const toPathway = (course) => ({ version: 1, levelId: course.levelId, lessonId: course.lessonId, lessons: course.records, assessments: course.assessments });
  const fromPathway = (course) => ({ levelId: course.levelId, lessonId: course.lessonId, records: course.lessons, assessments: course.assessments });
  function restore(value, catalog) {
    const engine = pathway();
    const catalogs = Object.fromEntries(ids.map((id) => [id, courseCatalog(catalog, id)]));
    if (value == null) return { version: 2, courses: Object.fromEntries(ids.map((id) => [id, fromPathway(engine.restore(null, catalogs[id]))])) };
    if (!fields(value, ['version', 'courses']) || ![1, 2].includes(value.version) || !object(value.courses)
      || Object.keys(value.courses).some((id) => !ids.includes(id))
      || (value.version === 2 && ids.some((id) => !own(value.courses, id)))) fail('基础课程进度格式或版本不支持。');
    const result = empty();
    for (const id of ids) {
      if (!own(value.courses, id)) {
        result.courses[id] = fromPathway(engine.restore(null, catalogs[id]));
        continue;
      }
      const source = value.courses[id];
      if (value.version === 2) {
        if (!fields(source, ['levelId', 'lessonId', 'records', 'assessments'])) fail('基础课程进度字段不正确。');
        result.courses[id] = fromPathway(engine.restore(toPathway(source), catalogs[id]));
        continue;
      }
      if (!fields(source, ['lessonId', 'records']) || !object(source.records)) fail('旧版基础课程进度格式不正确。');
      const lessons = new Map(catalog[id].map((lesson) => [lesson.id, lesson]));
      if (source.lessonId !== null && !lessons.has(source.lessonId)) fail('基础课程引用了未知课节。');
      const migrated = engine.restore(null, catalogs[id]);
      migrated.lessonId = source.lessonId;
      if (source.lessonId !== null) migrated.levelId = lessons.get(source.lessonId).levelId || 'pre-a1';
      for (const [lessonId, record] of Object.entries(source.records)) {
        if (!lessons.has(lessonId) || !fields(record, ['answers', 'updatedAt'])) fail('旧版基础课程包含未知课节或无效练习记录。');
        migrated.lessons[lessonId] = {
          answers: record.answers, writing: '', speaking: '', checks: [false, false, false],
          dueAt: null, reviews: 0, lastReviewAt: null, updatedAt: record.updatedAt
        };
      }
      // Preserve the original objective evidence without inventing output work,
      // self-assessments or review dates for users of the earlier course.
      result.courses[id] = fromPathway(engine.restore(migrated, catalogs[id]));
    }
    return result;
  }
  function lessonStatus(progress, courseId, lesson, now) {
    const record = progress.courses[courseId].records[lesson.id];
    const answers = record?.answers || [];
    const qs = questions(lesson);
    const answered = answers.filter((value) => value !== null).length;
    const correct = answers.filter((value, index) => value === qs[index].answer).length;
    const complete = correct === qs.length;
    const productionComplete = Boolean(record?.writing?.trim() && record?.speaking?.trim() && record?.checks?.length === 3 && record.checks.every((check) => check === true));
    const fullComplete = complete && productionComplete;
    const instant = now === undefined ? Date.now() : Date.parse(now);
    return { answered, correct, total: qs.length, complete, productionComplete, fullComplete,
      due: Boolean(fullComplete && record.dueAt !== null && Date.parse(record.dueAt) <= instant),
      wrong: answers.reduce((list, value, index) => value !== null && value !== qs[index].answer ? [...list, index] : list, []) };
  }
  function summary(progress, courseId, lessons, now) {
    const result = lessons.reduce((counts, lesson) => {
      const status = lessonStatus(progress, courseId, lesson, now);
      counts.completed += Number(status.complete);
      counts.answered += status.answered;
      counts.correct += status.correct;
      counts.totalQuestions += status.total;
      counts.toReview += Number(status.wrong.length > 0);
      counts.productionCompleted += Number(status.productionComplete);
      counts.fullCompleted += Number(status.fullComplete);
      counts.due += Number(status.due);
      return counts;
    }, { completed: 0, answered: 0, correct: 0, totalQuestions: 0, toReview: 0, productionCompleted: 0, fullCompleted: 0, practiced: 0, due: 0, assessmentCount: 0, totalLessons: lessons.length });
    result.practiced = result.fullCompleted;
    result.assessmentCount = Object.values(progress.courses[courseId].assessments || {}).reduce((sum, attempts) => sum + attempts.length, 0);
    return result;
  }
  function change(progress, catalog, courseId, mutate) {
    const adapted = courseCatalog(catalog, courseId);
    const next = restore(progress, catalog);
    next.courses[courseId] = fromPathway(mutate(pathway(), toPathway(next.courses[courseId]), adapted));
    return next;
  }
  function visit(progress, catalog, courseId, lessonId) {
    return change(progress, catalog, courseId, (engine, state, adapted) => {
      const stage = lessonId === null ? adapted.find((level) => level.id === state.levelId) : adapted.find((level) => level.lessons.some((lesson) => lesson.id === lessonId));
      if (!stage) fail('没有找到这节基础课程。');
      return engine.visit(state, adapted, stage.id, lessonId);
    });
  }
  function answer(progress, catalog, courseId, lessonId, index, option, now) {
    return change(progress, catalog, courseId, (engine, state, adapted) => engine.answer(state, adapted, lessonId, index, option, now));
  }
  function retry(progress, catalog, courseId, lessonId, wrongOnly = true, now) {
    if (typeof wrongOnly !== 'boolean') fail('请选择有效的重练方式。');
    return change(progress, catalog, courseId, (engine, state, adapted) => {
      const next = engine.retry(state, adapted, lessonId, now);
      if (!wrongOnly) {
        next.lessons[lessonId].answers.fill(null);
        next.lessons[lessonId].dueAt = null;
      }
      return next;
    });
  }
  function saveProduction(progress, catalog, courseId, lessonId, draft, now) {
    return change(progress, catalog, courseId, (engine, state, adapted) => engine.saveProduction(state, adapted, lessonId, draft, now));
  }
  function review(progress, catalog, courseId, lessonId, grade, now) {
    return change(progress, catalog, courseId, (engine, state, adapted) => engine.review(state, adapted, lessonId, grade, now));
  }
  function assess(progress, catalog, courseId, levelId, payload, now) {
    const stage = catalog.stages?.[courseId]?.find((entry) => entry.id === levelId);
    if (!stage || !Array.isArray(stage.assessment?.questions) || !stage.assessment.questions.length) fail('没有找到这个基础课程阶段的测评。');
    return change(progress, catalog, courseId, (engine, state, adapted) => engine.assess(state, adapted, levelId, payload, now));
  }
  function stageSummary(progress, catalog, courseId, levelId, now) {
    const adapted = courseCatalog(catalog, courseId), valid = restore(progress, catalog);
    const counts = pathway().summary(toPathway(valid.courses[courseId]), adapted, levelId, now);
    const stage = adapted.find((level) => level.id === levelId);
    const objective = summary(valid, courseId, stage.lessons, now);
    return { ...counts, answered: objective.answered, correct: objective.correct, totalQuestions: objective.totalQuestions, toReview: objective.toReview };
  }
  const api = Object.freeze({ restore, empty, questions, lessonStatus, summary, answer, retry, visit, saveProduction, review, assess, stageSummary });
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FoundationProgress = api;
})(typeof window === 'object' ? window : null);
