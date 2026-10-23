(function (root) {
  'use strict';
  const DAY = 86400000;
  const TEXT_LIMIT = 8000;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const fail = (message) => { throw new Error(message); };
  const fields = (value, keys) => object(value) && keys.every((key) => own(value, key)) && Object.keys(value).every((key) => keys.includes(key));
  function timestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) fail('学习记录的时间格式不正确。');
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) fail('学习记录包含无效日期。');
    return parsed;
  }
  function clock(now) {
    const iso = now === undefined ? new Date().toISOString() : now;
    timestamp(iso);
    return iso;
  }
  function after(iso, days) {
    const result = new Date(timestamp(iso) + DAY * days).toISOString();
    timestamp(result);
    return result;
  }
  function indexCatalog(catalog) {
    if (!Array.isArray(catalog) || !catalog.length) fail('学习路线没有可用课程。');
    const levels = new Map(), lessons = new Map();
    for (const level of catalog) {
      if (!object(level) || typeof level.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(level.id) || levels.has(level.id) || !Array.isArray(level.lessons)) fail('学习路线的阶段配置无效。');
      levels.set(level.id, level);
      for (const lesson of level.lessons) {
        if (!object(lesson) || typeof lesson.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(lesson.id) || lessons.has(lesson.id) || !Array.isArray(lesson.questions) || !lesson.questions.length) fail('学习路线的课节配置无效。');
        lessons.set(lesson.id, { lesson, level });
      }
    }
    return { levels, lessons, first: levels.has('pre-a1') ? 'pre-a1' : catalog[0].id };
  }
  function empty() {
    return { version: 1, levelId: 'pre-a1', lessonId: null, lessons: {}, assessments: {} };
  }
  function answers(value, questions, allowBlank) {
    if (!Array.isArray(value) || value.length !== questions.length) fail('学习记录的答题数量不正确。');
    return Array.from(value, (option, index) => {
      if (allowBlank && option === null) return null;
      if (!Number.isInteger(option) || option < 0 || option >= questions[index].options.length) fail('学习记录包含无效答案。');
      return option;
    });
  }
  function production(value, requireText) {
    if (!object(value) || typeof value.writing !== 'string' || typeof value.speaking !== 'string' || value.writing.length > TEXT_LIMIT || value.speaking.length > TEXT_LIMIT
      || !Array.isArray(value.checks) || value.checks.length !== 3 || Array.from(value.checks).some((check) => typeof check !== 'boolean')
      || (requireText && (!value.writing.trim() || !value.speaking.trim()))) fail('请检查写作、口语笔记和三项自评；每段最多 8000 字符。');
    return { writing: value.writing, speaking: value.speaking, checks: [...value.checks] };
  }
  const objectiveComplete = (record, lesson) => record.answers.every((answer, index) => answer === lesson.questions[index].answer);
  const productionComplete = (record) => Boolean(record.writing.trim() && record.speaking.trim() && record.checks.every(Boolean));
  const complete = (record, lesson) => objectiveComplete(record, lesson) && productionComplete(record);
  function restore(value, catalog) {
    const lookup = indexCatalog(catalog);
    if (value == null) return { ...empty(), levelId: lookup.first };
    if (!fields(value, ['version', 'levelId', 'lessonId', 'lessons', 'assessments']) || value.version !== 1 || !lookup.levels.has(value.levelId) || !object(value.lessons) || !object(value.assessments)
      || (value.lessonId !== null && lookup.lessons.get(value.lessonId)?.level.id !== value.levelId)) fail('学习路线进度格式、版本或课节引用不正确。');
    const next = { ...empty(), levelId: value.levelId, lessonId: value.lessonId };
    for (const [id, source] of Object.entries(value.lessons)) {
      const entry = lookup.lessons.get(id);
      if (!entry || !fields(source, ['answers', 'writing', 'speaking', 'checks', 'dueAt', 'reviews', 'lastReviewAt', 'updatedAt'])) fail('学习路线包含未知课节或无效练习记录。');
      const record = { answers: answers(source.answers, entry.lesson.questions, true), ...production(source, false), dueAt: source.dueAt, reviews: source.reviews, lastReviewAt: source.lastReviewAt, updatedAt: source.updatedAt };
      const updated = timestamp(record.updatedAt);
      if (!Number.isSafeInteger(record.reviews) || record.reviews < 0 || (record.reviews === 0 ? record.lastReviewAt !== null : record.lastReviewAt === null)) fail('复习次数与复习时间不一致。');
      const last = record.lastReviewAt === null ? null : timestamp(record.lastReviewAt);
      if (last !== null && last > updated) fail('复习时间不能晚于记录更新时间。');
      if (record.dueAt !== null) {
        const due = timestamp(record.dueAt);
        if (!complete(record, entry.lesson) || due > updated + 30 * DAY || (last !== null && due <= last)) fail('复习计划与课程完成记录不一致。');
      } else if (complete(record, entry.lesson)) fail('已完成的课程缺少复习计划。');
      next.lessons[id] = record;
    }
    for (const [id, history] of Object.entries(value.assessments)) {
      const level = lookup.levels.get(id);
      if (!level || !Array.isArray(history) || history.length > 10) fail('阶段测评历史格式不正确。');
      let previous = -Infinity;
      next.assessments[id] = Array.from(history, (source) => {
        if (!fields(source, ['answers', 'writing', 'speaking', 'checks', 'transcriptUsed', 'submittedAt']) || typeof source.transcriptUsed !== 'boolean') fail('阶段测评记录格式不正确。');
        const submitted = timestamp(source.submittedAt);
        if (submitted < previous) fail('阶段测评历史的时间顺序不正确。');
        previous = submitted;
        return { answers: answers(source.answers, level.assessment.questions, false), ...production(source, true), transcriptUsed: source.transcriptUsed, submittedAt: source.submittedAt };
      });
    }
    return next;
  }
  function visit(progress, catalog, levelId, lessonId) {
    const next = restore(progress, catalog), lookup = indexCatalog(catalog);
    if (!lookup.levels.has(levelId) || (lessonId !== null && lookup.lessons.get(lessonId)?.level.id !== levelId)) fail('没有找到这节学习路线课程。');
    next.levelId = levelId;
    next.lessonId = lessonId;
    return next;
  }
  function change(progress, catalog, lessonId, now, mutate) {
    const lookup = indexCatalog(catalog), entry = lookup.lessons.get(lessonId);
    if (!entry) fail('没有找到这节学习路线课程。');
    const next = restore(progress, catalog), iso = clock(now);
    const record = own(next.lessons, lessonId) ? next.lessons[lessonId] : { answers: Array.from(entry.lesson.questions, () => null), writing: '', speaking: '', checks: [false, false, false], dueAt: null, reviews: 0, lastReviewAt: null, updatedAt: iso };
    if (timestamp(iso) < timestamp(record.updatedAt)) fail('当前时间早于上次保存时间，请检查设备时钟。');
    mutate(record, entry.lesson, iso);
    // Autosaving a completed draft does not postpone an existing review.
    if (complete(record, entry.lesson)) {
      if (record.dueAt === null) record.dueAt = after(iso, 1);
    } else record.dueAt = null;
    record.updatedAt = iso;
    next.lessons[lessonId] = record;
    next.levelId = entry.level.id;
    next.lessonId = lessonId;
    return next;
  }
  function answer(progress, catalog, lessonId, index, option, now) {
    return change(progress, catalog, lessonId, now, (record, lesson) => {
      const question = lesson.questions[index];
      if (!Number.isInteger(index) || !question || !Number.isInteger(option) || option < 0 || option >= question.options.length) fail('练习答案无效。');
      if (record.answers[index] !== null) fail('本题已经作答，请先重练错题。');
      record.answers[index] = option;
    });
  }
  function retry(progress, catalog, lessonId, now) {
    return change(progress, catalog, lessonId, now, (record, lesson) => {
      record.answers = record.answers.map((value, index) => value === lesson.questions[index].answer ? value : null);
    });
  }
  function saveProduction(progress, catalog, lessonId, draft, now) {
    if (!fields(draft, ['writing', 'speaking', 'checks'])) fail('输出练习草稿格式不正确。');
    const validated = production(draft, false);
    return change(progress, catalog, lessonId, now, (record) => Object.assign(record, validated));
  }
  function review(progress, catalog, lessonId, grade, now) {
    if (!['again', 'hard', 'good'].includes(grade)) fail('请选择有效的复习结果。');
    return change(progress, catalog, lessonId, now, (record, lesson, iso) => {
      if (!complete(record, lesson) || record.dueAt === null || timestamp(record.dueAt) > timestamp(iso)) fail('这节课程尚未到复习时间。');
      if (record.reviews === Number.MAX_SAFE_INTEGER) fail('复习次数已超出可保存范围。');
      const interval = grade === 'again' ? 1 : grade === 'hard' ? 3 : record.reviews === 0 ? 7 : record.reviews === 1 ? 14 : 30;
      record.dueAt = after(iso, interval);
      record.lastReviewAt = iso;
      record.reviews += 1;
    });
  }
  function assess(progress, catalog, levelId, submission, now) {
    const lookup = indexCatalog(catalog), level = lookup.levels.get(levelId);
    if (!level || !fields(submission, ['answers', 'writing', 'speaking', 'checks', 'transcriptUsed']) || typeof submission.transcriptUsed !== 'boolean') fail('阶段测评提交格式不正确。');
    const next = restore(progress, catalog), submittedAt = clock(now);
    const history = own(next.assessments, levelId) ? next.assessments[levelId] : [];
    if (history.length && timestamp(submittedAt) < timestamp(history[history.length - 1].submittedAt)) fail('测评时间早于上次提交时间，请检查设备时钟。');
    const result = { answers: answers(submission.answers, level.assessment.questions, false), ...production(submission, true), transcriptUsed: submission.transcriptUsed, submittedAt };
    next.assessments[levelId] = [...history, result].slice(-10);
    return next;
  }
  function summary(progress, catalog, levelId, now) {
    const lookup = indexCatalog(catalog), level = lookup.levels.get(levelId);
    if (!level) fail('没有找到这个学习阶段。');
    const valid = restore(progress, catalog), instant = timestamp(clock(now));
    const result = { lessons: level.lessons.length, total: level.lessons.length, objectiveComplete: 0, productionComplete: 0, completed: 0, due: 0, assessmentCount: 0, latestScore: null };
    for (const lesson of level.lessons) {
      if (!own(valid.lessons, lesson.id)) continue;
      const record = valid.lessons[lesson.id];
      result.objectiveComplete += Number(objectiveComplete(record, lesson));
      result.productionComplete += Number(productionComplete(record));
      result.completed += Number(complete(record, lesson));
      result.due += Number(record.dueAt !== null && timestamp(record.dueAt) <= instant);
    }
    const history = own(valid.assessments, levelId) ? valid.assessments[levelId] : [];
    result.assessmentCount = history.length;
    if (history.length) result.latestScore = history[history.length - 1].answers.reduce((score, value, index) => score + Number(value === level.assessment.questions[index].answer), 0);
    return result;
  }
  const api = Object.freeze({ empty, restore, visit, answer, retry, saveProduction, review, assess, summary });
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PathwayProgress = api;
})(typeof window === 'object' ? window : null);
