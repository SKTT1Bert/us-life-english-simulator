(function (root) {
  'use strict';
  const fail = () => { throw new Error('听说写记录的格式或版本不正确。请保留原备份，更新页面后再试。'); };
  const object = v => v && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
  const fields = (v, keys) => object(v) && keys.every(k => Object.hasOwn(v, k)) && Object.keys(v).every(k => keys.includes(k));
  const str = (v, max = 6000) => typeof v === 'string' && v.length <= max;
  const uuid = v => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  const date = v => str(v, 24) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
  const empty = () => ({ version: 1, attempts: [], assessments: [] });
  const rubric = (v, length) => Array.isArray(v) && v.length === length && v.every(x => x === null || typeof x === 'boolean');
  const sources = ['typed', 'transcribed', 'edited-transcript'];
  function feedback(value) {
    if (value === null) return null;
    if (!fields(value, ['engine', 'issues']) || value.engine !== 'Harper 2.13.0' || !Array.isArray(value.issues) || value.issues.length > 30) fail();
    return { engine: value.engine, issues: value.issues.map(i => {
      if (!fields(i, ['kind', 'message', 'excerpt']) || !str(i.kind, 50) || !str(i.message, 1200) || !str(i.excerpt, 6000)) fail();
      return { ...i };
    }) };
  }
  function restore(value, catalog = {}) {
    if (value == null) return empty();
    if (!fields(value, ['version', 'attempts', 'assessments']) || value.version !== 1 || !Array.isArray(value.attempts) || !Array.isArray(value.assessments)
      || value.attempts.length > 2000 || value.assessments.length > 300) fail();
    const seen = new Set(), next = empty();
    function identity(v) { if (!uuid(v.id) || seen.has(v.id) || !date(v.at)) fail(); seen.add(v.id); }
    for (const a of value.attempts) {
      if (!fields(a, ['id', 'at', 'taskId', 'source', 'original', 'text', 'rubric', 'feedback', 'parentId', 'duration'])) fail();
      identity(a);
      const task = catalog.tasks?.find(t => t.id === a.taskId);
      if (!task || !sources.includes(a.source) || (task.mode === 'writing' && a.source !== 'typed') || !str(a.original) || !str(a.text) || !a.text.trim()
        || !rubric(a.rubric, task.rubric.length) || (a.parentId !== null && !uuid(a.parentId))
        || (a.duration !== null && (!Number.isFinite(a.duration) || a.duration <= 0 || a.duration > 31))
        || (a.source === 'typed' && a.duration !== null) || (a.source !== 'typed' && a.duration === null)) fail();
      next.attempts.push({ ...a, rubric: [...a.rubric], feedback: feedback(a.feedback) });
    }
    for (const a of value.assessments) {
      if (!fields(a, ['id', 'at', 'formId', 'answers', 'listens', 'writing', 'speaking', 'rubric', 'speakingSource'])) fail();
      identity(a); const form = catalog.forms?.find(f => f.id === a.formId);
      if (!form || !Array.isArray(a.answers) || a.answers.length !== form.questions.length
        || Array.from(a.answers).some((x, i) => x !== null && (!Number.isInteger(x) || x < 0 || x >= form.questions[i].options.length))
        || !Array.isArray(a.listens) || a.listens.length !== form.questions.length || a.listens.some((x, i) => !Number.isInteger(x) || x < 0 || x > 99 || (form.questions[i].skill !== 'listening' && x !== 0))
        || !str(a.writing) || !str(a.speaking) || !sources.includes(a.speakingSource) || !rubric(a.rubric, 6)
        || (a.answers.every(x => x === null) && !a.writing.trim() && !a.speaking.trim())) fail();
      next.assessments.push({ ...a, answers: [...a.answers], listens: [...a.listens], rubric: [...a.rubric] });
    }
    // A parent may arrive in a later encrypted sync batch. Never discard its child.
    for (const group of ['attempts', 'assessments']) next[group].sort((a,b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
    return next;
  }
  function append(value, kind, record, catalog, options = {}) {
    const next = restore(value, catalog);
    if (!['attempts', 'assessments'].includes(kind)) fail();
    next[kind].push({ ...record, id: options.id || root.crypto.randomUUID(), at: options.now || new Date().toISOString() });
    return restore(next, catalog);
  }
  function score(record, form) {
    const result = {};
    for (const skill of ['listening', 'reading', 'language']) {
      const indices = form.questions.map((q,i) => q.skill === skill ? i : -1).filter(i => i >= 0);
      result[skill] = { total: indices.length, answered: indices.filter(i => record.answers[i] !== null).length,
        correct: indices.filter(i => record.answers[i] === form.questions[i].answer && (skill !== 'listening' || record.listens[i] > 0)).length,
        heard: skill === 'listening' ? indices.filter(i => record.listens[i] > 0).length : null };
    }
    return result;
  }
  const api = { empty, restore, append, score };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SkillProgress = api;
})(typeof window !== 'undefined' ? window : globalThis);
