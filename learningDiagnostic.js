(function (root) {
  'use strict';
  const items = typeof module === 'object' && module.exports ? require('./data/learningDiagnostic.js') : root.LEARNING_DIAGNOSTIC;
  const levels = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
  const label = (id) => id === 'pre-a1' ? 'Pre-A1' : id.toUpperCase();
  const instances = new Set();
  function score(answers) {
    if (!Array.isArray(answers) || answers.length !== items.length || Array.from(answers).some((answer, index) => answer !== null && (!Number.isInteger(answer) || answer < 0 || answer >= items[index].options.length))) throw new Error('起点诊断的答案格式不正确。');
    const stages = levels.map((levelId) => {
      const indices = items.flatMap((item, index) => item.levelId === levelId ? [index] : []);
      const answered = indices.filter((index) => answers[index] !== null).length;
      const correct = indices.filter((index) => answers[index] === items[index].answer).length;
      return { levelId, label: label(levelId), answered, correct, total: indices.length, supported: answered === indices.length && correct >= 3 };
    });
    // Later correct answers never erase a gap in earlier evidence. This is an
    // editorial routing rule, not a CEFR cut score or a proficiency certificate.
    const firstGap = stages.findIndex((stage) => !stage.supported);
    const recommendedLevelId = stages[firstGap < 0 ? stages.length - 1 : firstGap].levelId;
    return { stages, recommendedLevelId, answered: stages.reduce((sum, stage) => sum + stage.answered, 0), correct: stages.reduce((sum, stage) => sum + stage.correct, 0), total: items.length, allSupported: firstGap < 0 };
  }
  function mount(target, options) {
    if (!target || !root.document) return null;
    let draft = null, position = 0, selectedId = null, notice = '';
    const doc = root.document;
    const node = (tag, className, text) => { const el = doc.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
    const button = (text, action, style = 'ghost-btn') => { const el = node('button', style, text); el.type = 'button'; el.addEventListener('click', action); return el; };
    const history = () => options.getProgress()?.diagnostics || [];
    function focusQuestion() { target.querySelector('.diagnostic-question')?.focus(); }
    function begin() { draft = Array(items.length).fill(null); position = 0; notice = ''; render(); focusQuestion(); }
    function finish() {
      const blank = draft.filter((value) => value === null).length;
      if (blank && !root.confirm(`还有 ${blank} 题未作答。仍要提交吗？未作答只表示证据不足，不会算作已掌握。`)) return;
      try {
        if (options.commit({ type: 'diagnostic', answers: [...draft] }) === false) { notice = '尚未保存，答案仍在这里。请检查浏览器存储后重试。'; render(); return; }
        draft = null; selectedId = null; notice = '诊断已保存。可以查看解析，再选择从哪里开始。'; render(); target.querySelector('.diagnostic-result-title')?.focus();
      } catch (error) { notice = error.message || '暂时无法保存，答案仍在这里。'; render(); }
    }
    function renderTest(section) {
      const item = items[position];
      const status = node('p', 'diagnostic-position', `第 ${position + 1} / ${items.length} 题 · ${label(item.levelId)} · 已答 ${draft.filter((value) => value !== null).length} 题`);
      const progress = node('progress'); progress.max = items.length; progress.value = position + 1; progress.setAttribute('aria-label', '诊断题目进度');
      const field = node('fieldset', 'diagnostic-question'); field.tabIndex = -1;
      field.append(node('legend', '', item.prompt));
      item.options.forEach((text, index) => {
        const choice = node('label', 'diagnostic-option'); const input = node('input'); input.type = 'radio'; input.name = 'learning-diagnostic-answer'; input.value = String(index); input.checked = draft[position] === index;
        input.addEventListener('change', () => { draft[position] = index; notice = ''; status.textContent = `第 ${position + 1} / ${items.length} 题 · ${label(item.levelId)} · 已答 ${draft.filter((value) => value !== null).length} 题`; });
        choice.append(input, node('span', '', text)); field.append(choice);
      });
      const actions = node('div', 'diagnostic-actions');
      const back = button('上一题', () => { position--; render(); focusQuestion(); }); back.disabled = position === 0;
      const clear = button('这题暂时不会', () => { draft[position] = null; if (position < items.length - 1) position++; render(); focusQuestion(); });
      const next = position < items.length - 1 ? button('下一题', () => { position++; render(); focusQuestion(); }, 'primary-btn') : button('提交起点诊断', finish, 'primary-btn');
      actions.append(back, clear, next);
      const leave = button('放弃本次未提交答案', () => { if (!root.confirm('放弃本次未提交的诊断答案？以前保存的结果仍会保留。')) return; draft = null; notice = ''; render(); });
      section.append(status, progress, field, actions, node('p', 'practice-note', '不确定可以跳过，也可以返回修改。未提交的答案仅保留在当前页面，刷新后会丢失。'), leave);
    }
    function renderResult(section, attempt) {
      const result = score(attempt.answers);
      const title = node('h3', 'diagnostic-result-title', `建议从 ${label(result.recommendedLevelId)} 开始尝试`); title.tabIndex = -1;
      section.append(title, node('p', '', `本次作答 ${result.answered} / ${result.total} 题，答对 ${result.correct} 题。保存时间：${new Date(attempt.submittedAt).toLocaleString()}`),
        node('p', 'practice-note', result.allSupported ? '这组题未发现明显的前置内容缺口。可尝试 C1 课程，再用实际听说读写任务判断是否合适；本结果不表示已达到 C1。' : '建议从最早一组尚未得到充分支持的内容开始。每组完成全部 4 题且至少答对 3 题，才会继续建议下一组；这是选课规则，不是经过校准的等级分数。'));
      const grid = node('div', 'diagnostic-stage-grid');
      result.stages.forEach((stage) => { const card = node('article', 'diagnostic-stage'); card.append(node('h4', '', stage.label), node('strong', '', `${stage.correct} / ${stage.total} 题答对`), node('p', '', stage.answered < stage.total ? `有 ${stage.total - stage.answered} 题未作答，信息不足` : stage.supported ? '可尝试更进一步的内容' : '建议先复习这一组内容'), button(`打开 ${stage.label} 课程`, () => options.onStart(stage.levelId), 'small-btn')); grid.append(card); });
      const start = button(`试学 ${label(result.recommendedLevelId)} 课程`, () => options.onStart(result.recommendedLevelId), 'primary-btn');
      const actions = node('div', 'diagnostic-actions'); actions.append(start, button('重新做一次诊断', begin));
      section.append(grid, actions, node('p', 'practice-note', '试学不会跳过或标记完成任何课程，也不会改写旧成绩。你始终可以自由选择其他阶段。'));
      const explanations = node('details', 'diagnostic-explanations'); explanations.append(node('summary', '', '查看全部答案与解析'));
      items.forEach((item, index) => {
        const answer = attempt.answers[index]; const entry = node('article', 'diagnostic-explanation');
        entry.append(node('h4', '', `${index + 1}. ${item.prompt}`), node('p', '', answer === null ? '你的选择：未作答' : `你的选择：${item.options[answer]}`), node('p', '', `参考答案：${item.options[item.answer]}`), node('p', '', item.explanation)); explanations.append(entry);
      }); section.append(explanations);
    }
    function render() {
      const section = node('section', 'learning-diagnostic');
      section.append(node('span', 'eyebrow', 'FIND YOUR START'), node('h2', '', '找到适合的学习起点'), node('p', 'diagnostic-intro', '24 道文字题，覆盖从零基础到 C1 课程会遇到的阅读与语言知识。不会听说也没关系，可以先用它选择试学起点。'), node('p', 'practice-note', '这不是正式分级考试：未测听力、口语与写作，题目难度也未经过实测校准。结果只用于选课参考。'));
      if (draft) renderTest(section);
      else {
        const records = [...history()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt) || b.id.localeCompare(a.id));
        const attempt = records.find((entry) => entry.id === selectedId) || records[0];
        if (attempt) {
          if (records.length > 1) {
            const wrap = node('label', 'diagnostic-history', '查看已保存的诊断 '); const select = node('select'); select.setAttribute('aria-label', '已保存的诊断');
            records.forEach((entry, index) => { const option = node('option', '', `${index === 0 ? '最近一次 · ' : ''}${new Date(entry.submittedAt).toLocaleString()}`); option.value = entry.id; option.selected = entry.id === attempt.id; select.append(option); }); select.addEventListener('change', () => { selectedId = select.value; notice = ''; render(); }); wrap.append(select); section.append(wrap);
          }
          renderResult(section, attempt);
        } else section.append(node('p', '', '建议预留 10–15 分钟，不查答案。遇到不会的题直接跳过；后面答对的题不会掩盖前面的基础缺口。'), button('开始起点诊断', begin, 'primary-btn'), button('我想从零基础开始', () => options.onStart('pre-a1')));
      }
      const feedback = node('p', 'diagnostic-feedback', notice); feedback.setAttribute('role', 'status'); section.append(feedback); target.replaceChildren(section);
    }
    const instance = { refresh: () => { if (!draft) render(); }, hasPendingWork: () => draft !== null, resetSession: () => { draft = null; selectedId = null; notice = ''; render(); }, destroy: () => { instances.delete(instance); target.replaceChildren(); } };
    instances.add(instance); render(); return instance;
  }
  const api = { score, mount, hasPendingWork: () => [...instances].some((instance) => instance.hasPendingWork()), resetSession: () => instances.forEach((instance) => instance.resetSession()) };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LearningDiagnostic = api;
})(typeof window !== 'undefined' ? window : globalThis);
