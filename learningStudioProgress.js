(function (root) {
  'use strict';
  const LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
  const GOALS = ['everyday', 'academic', 'work'];
  const MAX_DIAGNOSTICS = 100, MAX_LISTENING = 10000;
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const fail = (message) => { throw new Error(message); };
  const fields = (value, names) => object(value) && names.every((name) => Object.hasOwn(value, name))
    && Object.keys(value).every((name) => names.includes(name));
  const uuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  function timestamp(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
      || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail('学习记录的时间格式不正确。');
    return value;
  }
  function empty() {
    return { version: 1, preferences: { minutes: 10, levelId: 'pre-a1', goal: 'everyday', updatedAt: null }, diagnostics: [], listeningAttempts: [] };
  }
  function preferences(value) {
    if (!fields(value, ['minutes', 'levelId', 'goal', 'updatedAt']) || ![5, 10, 20].includes(value.minutes)
      || !LEVELS.includes(value.levelId) || !GOALS.includes(value.goal)) fail('今日计划设置无效，请重新选择学习时间、阶段和目标。');
    if (value.updatedAt !== null) timestamp(value.updatedAt);
    return { ...value };
  }
  function answers(value, questions) {
    if (!Array.isArray(questions) || !questions.length || !Array.isArray(value) || value.length !== questions.length
      || Array.from(value).some((answer, index) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= questions[index].options.length))) fail('起点诊断的答案格式或题目版本不正确。');
    if (value.every((answer) => answer === null)) fail('请至少回答一道题，再查看起点建议。');
    return [...value];
  }
  function listening(value, catalog) {
    if (!fields(value, ['id', 'answeredAt', 'lessonId', 'segmentId', 'matchedTokens', 'tokenCount', 'exact', 'revealed', 'shadow', 'listenCount'])
      || !uuid(value.id) || typeof value.lessonId !== 'string' || typeof value.segmentId !== 'string') fail('精听记录格式不正确。');
    const lesson = catalog.find((item) => item.lessonId === value.lessonId);
    const segment = lesson?.segments.find((item) => item.id === value.segmentId);
    if (!segment || value.tokenCount !== segment.tokenCount || !Number.isInteger(value.tokenCount) || value.tokenCount < 1 || value.tokenCount > 512
      || !Number.isInteger(value.matchedTokens) || value.matchedTokens < 0 || value.matchedTokens > value.tokenCount
      || typeof value.exact !== 'boolean' || (value.exact && value.matchedTokens !== value.tokenCount)
      || typeof value.revealed !== 'boolean' || !['not-yet', 'supported', 'independent'].includes(value.shadow)
      || !Number.isInteger(value.listenCount) || value.listenCount < 0 || value.listenCount > 999) fail('精听记录与材料或练习结果不一致。');
    timestamp(value.answeredAt);
    return { ...value };
  }
  function restore(value, catalogs = {}) {
    if (value == null) return empty();
    if (!fields(value, ['version', 'preferences', 'diagnostics', 'listeningAttempts']) || value.version !== 1
      || !Array.isArray(value.diagnostics) || !Array.isArray(value.listeningAttempts)
      || value.diagnostics.length > MAX_DIAGNOSTICS || value.listeningAttempts.length > MAX_LISTENING) fail('学习计划与精听记录的格式、版本或数量超出范围。请保留原文件，不要清空已有进度。');
    const seen = new Set();
    const unique = (id) => {
      if (!uuid(id) || seen.has(id)) fail('学习记录的编号无效或重复。');
      seen.add(id);
    };
    const next = { version: 1, preferences: preferences(value.preferences), diagnostics: [], listeningAttempts: [] };
    for (const item of value.diagnostics) {
      if (!fields(item, ['id', 'submittedAt', 'answers'])) fail('起点诊断记录格式不正确。');
      unique(item.id); timestamp(item.submittedAt);
      next.diagnostics.push({ id: item.id, submittedAt: item.submittedAt, answers: answers(item.answers, catalogs.diagnostic) });
    }
    for (const item of value.listeningAttempts) {
      unique(item?.id); next.listeningAttempts.push(listening(item, catalogs.listening || []));
    }
    const sort = (field) => (a, b) => a[field].localeCompare(b[field]) || a.id.localeCompare(b.id);
    next.diagnostics.sort(sort('submittedAt')); next.listeningAttempts.sort(sort('answeredAt'));
    return next;
  }
  function apply(value, action, catalogs, options = {}) {
    const next = restore(value, catalogs);
    const now = timestamp(options.now || new Date().toISOString());
    if (!object(action)) fail('请选择一项学习操作。');
    if (action.type === 'preferences') {
      if (!object(action.patch) || !Object.keys(action.patch).length || Object.keys(action.patch).some((key) => !['minutes', 'levelId', 'goal'].includes(key))) fail('今日计划设置无效。');
      next.preferences = preferences({ ...next.preferences, ...action.patch, updatedAt: now });
    } else if (action.type === 'diagnostic' || action.type === 'listening') {
      const id = options.id || root?.crypto?.randomUUID?.();
      if (!uuid(id)) fail('无法为本次练习生成安全编号，请更新浏览器后重试。');
      if (action.type === 'diagnostic') {
        if (next.diagnostics.length >= MAX_DIAGNOSTICS) fail('起点诊断记录已达保存上限，请先导出备份。旧记录没有删减。');
        next.diagnostics.push({ id, submittedAt: now, answers: answers(action.answers, catalogs.diagnostic) });
      } else {
        if (next.listeningAttempts.length >= MAX_LISTENING) fail('精听记录已达保存上限，请先导出备份。旧记录没有删减。');
        next.listeningAttempts.push({ ...action.attempt, id, answeredAt: now });
      }
    } else fail('不支持这项学习操作。');
    return restore(next, catalogs);
  }
  const api = Object.freeze({ LEVELS, GOALS, MAX_DIAGNOSTICS, MAX_LISTENING, empty, restore, apply });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LearningStudioProgress = api;
})(typeof window !== 'undefined' ? window : globalThis);
