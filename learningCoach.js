(function (root) {
  'use strict';
  const DAY = 86400000;
  const LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
  const LABELS = { pathway: '综合路线', 'word-parts': '词根词缀', phonics: '自然拼读' };
  const GOALS = { everyday: '日常交流', academic: '大学与研究生学习', work: '工作沟通' };
  const list = (value) => Array.isArray(value) ? value : [];
  const label = (id) => id === 'pre-a1' ? 'Pre-A1' : String(id).toUpperCase();
  const time = (value) => value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  const instant = (now) => now === undefined ? Date.now() : time(now);
  const preferences = (progress) => {
    const source = progress?.learningStudio?.preferences || {};
    return { minutes: [5, 10, 20].includes(source.minutes) ? source.minutes : 10,
      levelId: LEVELS.includes(source.levelId) ? source.levelId : 'pre-a1',
      goal: Object.hasOwn(GOALS, source.goal) ? source.goal : 'everyday' };
  };
  function lessons(progress = {}, catalogs = {}) {
    const items = [];
    function add(courseId, levelId, lesson, record, questions) {
      if (!lesson?.id) return;
      const qs = list(questions), answers = list(record?.answers);
      let answered = 0, correct = 0;
      qs.forEach((q, i) => {
        if (Number.isInteger(answers[i]) && answers[i] >= 0 && answers[i] < list(q.options).length) {
          answered++; correct += Number(answers[i] === q.answer);
        }
      });
      const output = Boolean(record?.writing?.trim() && record?.speaking?.trim()
        && list(record.checks).length === 3 && record.checks.every((value) => value === true));
      const completed = qs.length > 0 && correct === qs.length && output;
      items.push({ courseId, levelId, lesson, record, answered, correct, wrong: answered - correct,
        objectiveComplete: qs.length > 0 && correct === qs.length, output, completed, total: qs.length });
    }
    for (const level of list(catalogs.pathway)) for (const lesson of list(level.lessons)) {
      add('pathway', level.id, lesson, progress.pathwayProgress?.lessons?.[lesson.id], lesson.questions);
    }
    for (const courseId of ['word-parts', 'phonics']) for (const lesson of list(catalogs.foundation?.[courseId])) {
      add(courseId, lesson.levelId || 'pre-a1', lesson,
        progress.foundationProgress?.courses?.[courseId]?.records?.[lesson.id], lesson.quizzes || (lesson.quiz ? [lesson.quiz] : []));
    }
    return items;
  }
  const actionFor = (item) => item.courseId === 'pathway'
    ? { type: 'pathway', levelId: item.levelId, lessonId: item.lesson.id }
    : { type: 'foundation', courseId: item.courseId, lessonId: item.lesson.id };
  const lessonKey = (item) => `${item.courseId}:${item.lesson.id}`;
  function expressionDue(progress, catalogs, now) {
    const known = new Set(list(catalogs.expressions).map((item) => item.id));
    return Object.entries(progress.reviewSchedule || {}).filter(([id, value]) => known.has(id)
      && value?.nextDueAt && Number.isFinite(time(value.nextDueAt)) && time(value.nextDueAt) <= now)
      .sort((a, b) => time(a[1].nextDueAt) - time(b[1].nextDueAt));
  }
  function goalScore(item, goal) {
    const source = `${item.lesson.id} ${item.lesson.title} ${item.lesson.skill || ''}`;
    if (goal === 'academic') return Number(/academic|research|evidence|source|synthes|lecture|argument|project|study|学术|研究|论证|讲座|学习|词族|构词|来源/i.test(source));
    if (goal === 'work') return Number(/instruction|request|clarif|email|plan|meeting|present|propos|explain|compare|decis|schedule|协作|请求|安排|邮件|说明|澄清|展示|建议|工作/i.test(source));
    return Number(/greet|introduc|food|shop|travel|time|daily|experience|routine|生活|日常|介绍|购物|点餐|问路|经历/i.test(source));
  }
  function ranked(items, goal) {
    return [...items].sort((a, b) => Number(Boolean(b.record)) - Number(Boolean(a.record))
      || goalScore(b, goal) - goalScore(a, goal));
  }
  function latestListening(attempts) {
    const latest = new Map();
    for (const attempt of list(attempts)) {
      const key = `${attempt.lessonId}:${attempt.segmentId}`;
      const previous = latest.get(key);
      if (!previous || time(attempt.answeredAt) > time(previous.answeredAt)
        || (attempt.answeredAt === previous.answeredAt && String(attempt.id) > String(previous.id))) latest.set(key, attempt);
    }
    return [...latest.values()];
  }
  function buildPlan(progress = {}, catalogs = {}, now) {
    const current = instant(now), prefs = preferences(progress), all = lessons(progress, catalogs);
    const candidates = [], used = new Set();
    const expressionReviews = expressionDue(progress, catalogs, current);
    const due = all.filter((item) => item.completed && item.record?.dueAt && time(item.record.dueAt) <= current)
      .sort((a, b) => time(a.record.dueAt) - time(b.record.dueAt));
    const mistakes = all.filter((item) => item.wrong > 0).sort((a, b) => b.wrong - a.wrong);
    function courseTask(item, kind, title, detail, reason, minutes) {
      const key = lessonKey(item);
      if (used.has(key)) return;
      used.add(key);
      candidates.push({ id: `${kind}:${key}`, kind, title, detail, reason, minutes,
        label: `${LABELS[item.courseId]} · ${label(item.levelId)}`, action: actionFor(item) });
    }
    if (expressionReviews.length) candidates.push({ id: 'review:expressions', kind: 'review', title: '先回忆 1–3 条学过的表达',
      detail: '先看中文提示，试着说出英文，再核对答案。', reason: `${expressionReviews.length} 条表达已排入复习。`,
      minutes: 2, label: '表达复习', action: { type: 'expression-review' } });
    for (const item of due.slice(0, 2)) courseTask(item, 'review', '回忆一节学过的课',
      `${item.lesson.title}：先完成课内的主动回忆，再记录本次复习结果。`, '这节课已到计划复习时间。', 3);
    for (const item of mistakes.slice(0, 2)) courseTask(item, 'repair', '订正，再解释一次',
      `${item.lesson.title}：先处理其中一道题，并用自己的话解释理由。`, `这节课有 ${item.wrong} 道随堂题尚未订正。`, 3);
    const selected = all.filter((item) => item.levelId === prefs.levelId);
    const next = ranked(selected.filter((item) => item.courseId === 'pathway' && !item.completed), prefs.goal)[0];
    if (next) courseTask(next, 'learn', next.objectiveComplete ? '把理解变成自己的表达' : next.record ? '接着完成一小步' : '开始一段新的学习',
      next.objectiveComplete ? `${next.lesson.title}：先写 2–3 句，或准备一段口述要点。`
        : `${next.lesson.title}：先读一个知识点，再尝试一道题。`,
      next.record ? '优先接续已有记录，不必重新开始。' : `${label(prefs.levelId)} 阶段中，优先选择与“${GOALS[prefs.goal]}”相关的内容。`, 3);
    const selectedPathway = ranked(selected.filter((item) => item.courseId === 'pathway' && item.lesson.listening?.text), prefs.goal);
    const weak = latestListening(progress.learningStudio?.listeningAttempts).filter((attempt) => selectedPathway.some((item) => item.lesson.id === attempt.lessonId)
      && (attempt.exact !== true || attempt.revealed || !attempt.listenCount));
    const listeningLesson = selectedPathway.find((item) => weak.some((attempt) => attempt.lessonId === item.lesson.id)) || selectedPathway[0];
    const weakSentence = weak.find((attempt) => attempt.lessonId === listeningLesson?.lesson.id);
    if (listeningLesson) candidates.push({ id: `listen:${listeningLesson.lesson.id}`, kind: 'listen', title: weak.length ? '重听一句还不稳的句子' : '听清一句，再跟着说',
      detail: `${listeningLesson.lesson.title}：不看原文听一句，听写核对后，再跟读一次。`,
      reason: weak.length ? '这节课还有句子尚未留下“播放后、不看原文、听写全对”的记录。' : '用现有课程练细节听辨和跟读；一次只练一句。',
      minutes: 3, label: `逐句精听 · ${label(prefs.levelId)}`, action: { type: 'listening', lessonId: listeningLesson.lesson.id,
        ...(weakSentence ? { segmentId: weakSentence.segmentId } : {}) } });
    const foundationOrder = prefs.goal === 'academic' ? ['word-parts', 'phonics'] : ['phonics', 'word-parts'];
    for (const courseId of foundationOrder) {
      const item = ranked(selected.filter((entry) => entry.courseId === courseId && !entry.completed), prefs.goal)[0];
      if (item) courseTask(item, 'foundation', '补一小块基础', `${item.lesson.title}：读懂一条规则，尝试一个例子。`,
        `按你选择的 ${label(prefs.levelId)} 阶段衔接基础课。`, 3);
    }
    const tasks = [], budget = prefs.minutes;
    let plannedMinutes = 0;
    for (const task of candidates) {
      if (plannedMinutes + task.minutes > budget || tasks.length >= 5) continue;
      tasks.push(task); plannedMinutes += task.minutes;
    }
    return { preferences: prefs, tasks, plannedMinutes, budget,
      reviewCount: expressionReviews.length + due.length, wrongQuestions: mistakes.reduce((sum, item) => sum + item.wrong, 0),
      selectedComplete: selected.length > 0 && selected.every((item) => item.completed) };
  }
  function report(progress = {}, catalogs = {}, now) {
    const current = instant(now), all = lessons(progress, catalogs), currentDay = new Date(current).toISOString().slice(0, 10);
    const midnight = Date.parse(`${currentDay}T00:00:00.000Z`);
    const days = Array.from({ length: 7 }, (_, index) => ({ date: new Date(midnight - (6 - index) * DAY).toISOString().slice(0, 10),
      expression: 0, listening: 0, courseSaves: 0, assessments: 0, diagnostic: 0, total: 0 }));
    const byDay = new Map(days.map((day) => [day.date, day]));
    function activity(at, kind) {
      const stamp = time(at);
      if (!Number.isFinite(stamp) || stamp > current) return;
      const day = byDay.get(new Date(stamp).toISOString().slice(0, 10));
      if (day) { day[kind]++; day.total++; }
    }
    const seen = new Set(), expressionEvents = [];
    for (const event of list(progress.practiceHistory)) {
      if (seen.has(event.id)) continue; seen.add(event.id); expressionEvents.push(event); activity(event.at, 'expression');
    }
    for (const attempt of list(progress.learningStudio?.listeningAttempts)) activity(attempt.answeredAt, 'listening');
    for (const attempt of list(progress.learningStudio?.diagnostics)) activity(attempt.submittedAt, 'diagnostic');
    for (const item of all) if (item.record) activity(item.record.updatedAt, 'courseSaves');
    for (const collection of [progress.pathwayProgress?.assessments, ...['word-parts', 'phonics'].map((id) => progress.foundationProgress?.courses?.[id]?.assessments)]) {
      for (const attempts of Object.values(collection || {})) for (const attempt of list(attempts)) activity(attempt.submittedAt, 'assessments');
    }
    const courses = ['pathway', 'word-parts', 'phonics'].map((courseId) => {
      const subset = all.filter((item) => item.courseId === courseId);
      return { courseId, label: LABELS[courseId], total: subset.length, started: subset.filter((item) => item.record).length,
        completed: subset.filter((item) => item.completed).length, objectiveComplete: subset.filter((item) => item.objectiveComplete).length,
        outputComplete: subset.filter((item) => item.output).length,
        correct: subset.reduce((sum, item) => sum + item.correct, 0), answered: subset.reduce((sum, item) => sum + item.answered, 0) };
    });
    const attempts = list(progress.learningStudio?.listeningAttempts);
    const latest = latestListening(attempts);
    const unassisted = latest.filter((attempt) => attempt.tokenCount > 0 && attempt.exact === true && !attempt.revealed && attempt.listenCount > 0).length;
    const recentExpression = expressionEvents.filter((event) => Number.isFinite(time(event.at)) && time(event.at) >= midnight - 6 * DAY && time(event.at) <= current);
    const plan = buildPlan(progress, catalogs, current);
    return { days, activeDays: days.filter((day) => day.total > 0).length, courses,
      completed: courses.reduce((sum, course) => sum + course.completed, 0), totalLessons: all.length,
      reviewCount: plan.reviewCount, wrongQuestions: plan.wrongQuestions, recommendations: plan.tasks.slice(0, 2),
      listening: { attempts: attempts.length, sentences: latest.length, unassisted,
        needsPractice: latest.filter((attempt) => attempt.exact !== true || attempt.revealed || !attempt.listenCount).length,
        independentShadow: latest.filter((attempt) => attempt.shadow === 'independent').length },
      recall: { independent: recentExpression.filter((event) => event.mode === 'recall' && event.outcome === 'independent').length,
        delayed: recentExpression.filter((event) => event.mode === 'recall' && event.outcome === 'independent' && event.delayed).length },
      period: `${days[0].date} — ${days[6].date}`, preferences: plan.preferences };
  }

  let mounted = null;
  const api = { buildPlan, report, mount, refresh: () => mounted?.refresh(),
    hasPendingWork: () => mounted?.hasPendingWork() || false, resetSession: () => mounted?.resetSession() };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LearningCoach = api;
  function mount(options) {
    if (!root?.document) return null;
    const getCatalogs = options.getCatalogs || (() => ({}));
    const targetToday = typeof options.today === 'string' ? document.querySelector(options.today) : options.today;
    const targetReport = typeof options.report === 'string' ? document.querySelector(options.report) : options.report;
    let dirty = false, successMessage = '';
    function element(tag, className, text) {
      const node = document.createElement(tag); if (className) node.className = className;
      if (text !== undefined) node.textContent = text; return node;
    }
    function button(text, action, className = 'small-btn') {
      const node = element('button', className, text); node.type = 'button';
      node.addEventListener('click', () => {
        if (options.navigate(action) === false) {
          const status = targetToday?.querySelector('[role=status]') || targetReport?.querySelector('[role=status]');
          if (status) status.textContent = '暂时无法打开这项学习，请刷新页面后重试。';
        }
      }); return node;
    }
    function selection(id, title, values, selected) {
      const wrapper = element('label', 'coach-field', title), select = element('select'); select.id = id;
      for (const [value, text] of values) { const option = element('option', '', text); option.value = value; select.append(option); }
      select.value = String(selected); select.addEventListener('change', () => {
        dirty = true; const discard = select.closest('form')?.querySelector('[data-coach-discard]'); if (discard) discard.hidden = false;
        const status = targetToday?.querySelector('[role=status]'); if (status) status.textContent = '计划设置尚未保存。可以更新计划，或放弃这次修改。';
      });
      wrapper.append(select); return wrapper;
    }
    function drawToday() {
      if (!targetToday || dirty || targetToday.querySelector('form')?.contains(document.activeElement)) return;
      const data = buildPlan(options.getProgress(), getCatalogs());
      const section = element('section', 'learning-coach coach-today'); section.setAttribute('aria-labelledby', 'coachTodayTitle');
      const top = element('div', 'coach-top');
      const intro = element('div'); intro.append(element('span', 'coach-eyebrow', 'YOUR NEXT STEPS'));
      const heading = element('h2', '', '把今天的时间，用在最需要的地方'); heading.id = 'coachTodayTitle'; intro.append(heading);
      intro.append(element('p', 'coach-subtitle', '先巩固，再学一点。每项只安排一个小步骤，做多少由你决定。'));
      const budget = element('div', 'coach-budget'); budget.append(element('strong', '', String(data.budget)), element('span', '', '分钟预算'));
      top.append(intro, budget); section.append(top);
      const form = element('form', 'coach-preferences'); form.setAttribute('aria-label', '今日学习计划设置');
      form.append(selection('coachMinutes', '今天有多少时间', [[5, '轻松学 · 5 分钟'], [10, '稳步学 · 10 分钟'], [20, '多练一点 · 20 分钟']], data.preferences.minutes),
        selection('coachLevel', '当前想学的阶段', LEVELS.map((id) => [id, label(id)]), data.preferences.levelId),
        selection('coachGoal', '学习用途', Object.entries(GOALS), data.preferences.goal));
      const save = element('button', 'primary-btn', '更新计划'); save.type = 'submit'; form.append(save);
      const discard = element('button', 'ghost-btn', '放弃设置修改'); discard.type = 'button'; discard.dataset.coachDiscard = ''; discard.hidden = true;
      discard.addEventListener('click', () => { dirty = false; successMessage = '已恢复保存的计划设置。'; document.activeElement?.blur(); refresh(); }); form.append(discard);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const patch = { minutes: Number(form.querySelector('#coachMinutes').value), levelId: form.querySelector('#coachLevel').value, goal: form.querySelector('#coachGoal').value };
        try {
          const changedPatch = Object.fromEntries(Object.entries(patch).filter(([key, value]) => value !== data.preferences[key]));
          if (Object.keys(changedPatch).length && !options.commit({ type: 'preferences', patch: changedPatch })) throw new Error('save');
          dirty = false; successMessage = '计划已更新。课程与已有记录保持不变。';
          document.activeElement?.blur(); refresh(); targetToday.querySelector('[role=status]')?.focus();
        } catch (error) { section.querySelector('[role=status]').textContent = error?.message && error.message !== 'save'
          ? error.message : '设置未能保存，请先导出记录或检查浏览器存储，再重试。'; }
      });
      section.append(form);
      const info = element('div', 'coach-plan-info');
      info.append(element('p', '', `为你安排 ${data.tasks.length} 个小步骤，预计约 ${data.plannedMinutes} 分钟。时间仅供安排，不代表已完成整节课。`),
        button('不确定从哪开始？做起点诊断', { type: 'diagnostic' }, 'coach-link'));
      section.append(info);
      const tasks = element('ol', 'coach-tasks');
      data.tasks.forEach((task, index) => {
        const li = element('li', 'coach-task'), number = element('span', 'coach-step', String(index + 1)); number.setAttribute('aria-hidden', 'true');
        const body = element('div', 'coach-task-body'); body.append(element('span', 'coach-task-label', `${task.label} · 约 ${task.minutes} 分钟`),
          element('h3', '', task.title), element('p', '', task.detail), element('p', 'coach-reason', task.reason));
        const action = button('去练习 →', task.action); action.setAttribute('aria-label', `${task.title}：${task.detail}`);
        li.append(number, body, action); tasks.append(li);
      });
      section.append(tasks);
      if (!data.tasks.length) section.append(element('p', 'coach-empty', '这个阶段暂时没有待安排的小步骤。可以选择另一个阶段，或回到课程重温。'));
      const status = element('p', 'coach-status', successMessage); status.setAttribute('role', 'status'); status.tabIndex = -1; section.append(status);
      targetToday.replaceChildren(section);
    }
    function metric(value, title, detail) {
      const card = element('div', 'coach-metric'); card.append(element('strong', '', String(value)), element('span', '', title), element('p', '', detail)); return card;
    }
    function drawReport() {
      if (!targetReport || targetReport.contains(document.activeElement)) return;
      const data = report(options.getProgress(), getCatalogs());
      const section = element('section', 'learning-coach coach-report'); section.setAttribute('aria-labelledby', 'coachReportTitle');
      section.append(element('span', 'coach-eyebrow', 'PROGRESS WITH EVIDENCE'));
      const heading = element('h2', '', '看见积累，也看清下一步'); heading.id = 'coachReportTitle'; section.append(heading,
        element('p', 'coach-subtitle', '这里展示保存下来的学习证据。课程完成、自评和答案核对分开计算，不换算成英语能力等级。'));
      const grid = element('div', 'coach-metrics'); grid.append(metric(`${data.activeDays}/7`, '最近七天有记录的日期', '统计按 UTC 换日。'),
        metric(`${data.completed}/${data.totalLessons}`, '完成课内学习要求', '题目全对，并完成写作、口述要点和三项自评。'),
        metric(data.reviewCount, '当前待复习项目', '表达与已完成课程的复习计划。'),
        metric(data.wrongQuestions, '当前待订正题目', '不把未作答题计为错题。')); section.append(grid);
      const history = element('div', 'coach-section'); history.append(element('h3', '', '最近七天的记录'), element('p', 'coach-small', `${data.period} · UTC`));
      const chart = element('ol', 'coach-week'); chart.setAttribute('aria-label', '最近七天保存记录分布');
      const peak = Math.max(1, ...data.days.map((day) => day.total));
      for (const day of data.days) {
        const item = element('li'), barArea = element('div', 'coach-bar-area'), bar = element('span', 'coach-bar');
        bar.style.height = `${Math.max(day.total ? 6 : 0, day.total / peak * 100)}%`; bar.setAttribute('aria-hidden', 'true');
        barArea.append(bar); item.append(element('strong', '', String(day.total)), barArea, element('span', '', day.date.slice(5)));
        item.setAttribute('aria-label', `${day.date}：${day.expression} 次表达练习，${day.listening} 次精听记录，${day.courseSaves} 节课程的最近保存，${day.assessments} 次阶段测评，${day.diagnostic} 次起点诊断`);
        chart.append(item);
      }
      history.append(chart, element('p', 'coach-small', '记录数包含表达练习、精听、测评和每节课的最近一次保存。课程未保存完整修改历史；此图不表示学习时长或全部活动次数。')); section.append(history);
      const courseSection = element('div', 'coach-section'); courseSection.append(element('h3', '', '课程进展'));
      const courses = element('div', 'coach-course-grid');
      for (const course of data.courses) {
        const card = element('article', 'coach-course'); card.append(element('h4', '', course.label),
          element('p', 'coach-course-count', `${course.completed} / ${course.total} 课完成`));
        const progressBar = element('progress'); progressBar.max = Math.max(course.total, 1); progressBar.value = course.completed;
        progressBar.setAttribute('aria-label', `${course.label}完成 ${course.completed} 课，共 ${course.total} 课`); card.append(progressBar,
          element('p', '', course.answered ? `当前答案核对：${course.correct}/${course.answered} 道正确` : '尚无随堂作答记录'),
          element('p', 'coach-small', `输出练习及三项自评齐全：${course.outputComplete} 课。不是自动写作或发音评分。`)); courses.append(card);
      }
      courseSection.append(courses); section.append(courseSection);
      const skills = element('div', 'coach-skill-grid');
      const listening = element('article', 'coach-skill'); listening.append(element('h3', '', '听辨与跟读'),
        element('p', '', data.listening.sentences ? `已保存 ${data.listening.attempts} 次句子练习，覆盖 ${data.listening.sentences} 个句子。` : '还没有精听记录。从一句开始，听写、核对，再跟读。'),
        element('p', '', `各句最近一次：${data.listening.unassisted} 句已播放、未看原文且听写全对，${data.listening.needsPractice} 句建议再练。`),
        element('p', 'coach-small', `能独立跟读：${data.listening.independentShadow} 句（你的自评）。听写仅核对文本，不是听力等级或发音评分。`),
        button('去逐句精听 →', { type: 'listening' }));
      const recall = element('article', 'coach-skill'); recall.append(element('h3', '', '不看提示，还能说出多少'),
        element('p', '', `最近七天，${data.recall.independent} 次表达回忆记录为“独立说出”，其中 ${data.recall.delayed} 次距离上次复习至少 24 小时。`),
        element('p', 'coach-small', '这些是主动回忆时的自评，不能用选择题答对或“已学习”标记代替。'),
        button('去复习表达 →', { type: 'expression-review' })); skills.append(listening, recall); section.append(skills);
      const next = element('div', 'coach-section'); next.append(element('h3', '', '下一步，从这里开始'));
      if (data.recommendations.length) for (const task of data.recommendations) next.append(button(`${task.title} · ${task.label} →`, task.action, 'coach-next'));
      else next.append(button('重新选择学习起点 →', { type: 'diagnostic' }, 'coach-next'));
      const status = element('p', 'coach-status'); status.setAttribute('role', 'status'); next.append(status); section.append(next);
      targetReport.replaceChildren(section);
    }
    function refresh() { drawToday(); drawReport(); }
    mounted = { refresh, hasPendingWork: () => dirty, resetSession: () => {
      dirty = false; successMessage = ''; if (targetToday?.contains(document.activeElement)) document.activeElement.blur(); refresh();
    } }; refresh(); return mounted;
  }
})(typeof window !== 'undefined' ? window : null);
