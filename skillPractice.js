(function (root) {
  'use strict';
  const LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
  const labels = { Agreement: '主谓与单复数', Spelling: '拼写', Capitalization: '大小写', Punctuation: '标点', Repetition: '重复用词', Grammar: '语法', WordChoice: '用词', Redundancy: '冗余表达', Readability: '可读性', Style: '表达风格', Usage: '惯用表达' };
  function words(text) { return String(text).match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []; }
  function catalog(pathway, audio = [], forms = []) {
    const tasks = pathway.flatMap(level => level.lessons.flatMap(lesson => ['writing', 'speaking'].map(mode => ({
      id: `${lesson.id}-${mode}`, lessonId: lesson.id, levelId: level.id, mode, title: lesson.title,
      prompt: lesson.production[mode], rubric: [...lesson.production.rubric], model: lesson.production.model,
      reference: '', audioId: null,
    }))));
    for (const clip of audio) tasks.push({ id: clip.id, lessonId: null, levelId: clip.levelId, mode: 'speaking', title: `真人跟读 · ${clip.title}`,
      prompt: '听示范后，录下自己的朗读。先核对转写是否准确，再比较原句与自己说出的词。',
      rubric: ['我听了示范并完整说出句子', '我对照录音确认了转写文字', '我留意了重读、停顿和语调'], model: clip.text, reference: clip.text, audioId: clip.id });
    for (const form of forms) for (const mode of ['writing', 'speaking']) tasks.push({ id: `${form.id}-${mode}`, lessonId: null, levelId: form.levelId,
      mode, title: `小测 ${form.variant} · 表达改进`, prompt: form[mode], rubric: [...form.rubric], model: '', reference: '', audioId: null });
    return tasks;
  }
  function structure(text, levelId) {
    const count = words(text).length, sentences = text.split(/[.!?]+(?:\s|$)/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter(s => s.trim()).length;
    const guidance = [];
    if (!count) guidance.push('先输入英文，再检查表达。');
    if (/[\u4e00-\u9fff]/.test(text)) guidance.push('文中有中文。英文检查不会评判中文内容，试着把要表达的意思写成英文。');
    if (['b1', 'b2', 'c1'].includes(levelId) && count > 45 && paragraphs < 2) guidance.push('这段文字较长。检查不同观点是否适合分段，让读者更容易跟上。');
    if (['b2', 'c1'].includes(levelId)) guidance.push('再人工核对：论点是否回应任务，证据是否可靠，结论是否超出了证据。语言检查无法替你核实这些内容。');
    if (!guidance.length) guidance.push('对照任务要求，检查是否把信息说清楚。字数只是描述，不作为能力分数。');
    return { count, sentences, paragraphs, guidance };
  }
  function review(attempts, now = Date.now()) {
    const latest = new Map();
    for (const a of attempts) if (!latest.has(a.taskId) || `${a.at}|${a.id}` > `${latest.get(a.taskId).at}|${latest.get(a.taskId).id}`) latest.set(a.taskId, a);
    return [...latest.values()].filter(a => a.rubric.some(v => v !== true) || (a.feedback?.issues.length || 0) > 0 || now - Date.parse(a.at) >= 7 * 86400000)
      .sort((a, b) => a.at.localeCompare(b.at));
  }
  const api = { LEVELS, labels, words, catalog, structure, review };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SkillPractice = api;
})(typeof window !== 'undefined' ? window : globalThis);
