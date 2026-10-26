(function (root) {
  'use strict';
  const MAX_TOKENS = 512;
  const LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'];
  const shadowLabels = { 'not-yet': '还没跟读', supported: '看着原文跟读过', independent: '不看原文也试说过' };
  const list = (value) => Array.isArray(value) ? value : [];

  // Segment IDs depend only on this deterministic splitter and the lesson ID.
  // Keep titles, initials, abbreviations and decimal numbers within a sentence.
  function sentences(value) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return [];
    const result = [];
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      if (!/[.!?]/.test(text[i])) continue;
      if (text[i] === '.') {
        if (/\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || '')) continue;
        if (/[A-Za-z]/.test(text[i + 1] || '') && text[i + 2] === '.') continue;
        const before = text.slice(start, i + 1);
        if (/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc|approx|No)\.$/i.test(before)
          || /\b(?:[A-Za-z]\.){2,}$/.test(before)
          || /(?:^|\s)[A-Z]\.$/.test(before)) continue;
      }
      let end = i + 1;
      while (end < text.length && /[.!?"'”’»\])]/.test(text[end])) end++;
      if (end < text.length && !/\s/.test(text[end])) continue;
      const part = text.slice(start, end).trim();
      if (part) result.push(part);
      start = end; i = end - 1;
    }
    const tail = text.slice(start).trim();
    if (tail) result.push(tail);
    return result;
  }
  function tokens(value) {
    const normalized = String(value || '').normalize('NFKC').toLocaleLowerCase('en-US')
      .replace(/[’‘`ʼ]/g, "'").replace(/(\d),(?=\d{3}(?:\D|$))/g, '$1');
    const result = normalized.match(/[\p{L}\p{M}\p{N}]+(?:'[\p{L}\p{M}\p{N}]+)*(?:\.\p{N}+)*/gu) || [];
    if (result.length > MAX_TOKENS) throw new Error('这一句太长，请把输入控制在 512 个词以内。');
    return result;
  }
  function evaluate(target, input) {
    const expected = tokens(target), actual = tokens(input);
    if (!expected.length) throw new Error('这一句暂无可核对的英文内容。');
    const rows = Array.from({ length: expected.length + 1 }, () => new Uint16Array(actual.length + 1));
    for (let i = 0; i <= expected.length; i++) rows[i][0] = i;
    for (let j = 0; j <= actual.length; j++) rows[0][j] = j;
    for (let i = 1; i <= expected.length; i++) for (let j = 1; j <= actual.length; j++) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (expected[i - 1] === actual[j - 1] ? 0 : 1));
    }
    const alignment = [];
    let i = expected.length, j = actual.length, matchedTokens = 0;
    while (i || j) {
      if (i && j && expected[i - 1] === actual[j - 1] && rows[i][j] === rows[i - 1][j - 1]) {
        alignment.push({ kind: 'match', expected: expected[--i], actual: actual[--j] }); matchedTokens++;
      } else if (i && j && rows[i][j] === rows[i - 1][j - 1] + 1) {
        alignment.push({ kind: 'changed', expected: expected[--i], actual: actual[--j] });
      } else if (i && rows[i][j] === rows[i - 1][j] + 1) {
        alignment.push({ kind: 'missing', expected: expected[--i] });
      } else {
        alignment.push({ kind: 'extra', actual: actual[--j] });
      }
    }
    return { exact: rows[expected.length][actual.length] === 0, matchedTokens, tokenCount: expected.length,
      inputTokenCount: actual.length, alignment: alignment.reverse() };
  }
  function catalog(pathway) {
    return list(pathway).flatMap((level) => list(level.lessons).flatMap((lesson) => {
      const segments = sentences(lesson.listening?.text).map((text, index) => ({ id: `${lesson.id}-s${index + 1}`, text, tokenCount: tokens(text).length }));
      return segments.length ? [{ lessonId: lesson.id, levelId: level.id, levelLabel: level.label || level.id.toUpperCase(), title: lesson.title,
        listeningTitle: lesson.listening.title || lesson.title, focus: lesson.listening.focus || '先听大意，再逐句核对，最后试着说出来。', segments }] : [];
    }));
  }
  function humanCatalog(clips) {
    return list(clips).map(clip => ({ lessonId: clip.id, levelId: clip.levelId, levelLabel: clip.levelId === 'pre-a1' ? 'Pre-A1' : clip.levelId.toUpperCase(),
      title: clip.title, listeningTitle: clip.title, focus: clip.focus, human: clip,
      segments: [{ id: `${clip.id}-s1`, text: clip.text, tokenCount: tokens(clip.text).length, audio: clip.src }] }));
  }
  function syntheticCatalog(clips) {
    return list(clips).map(clip => ({ lessonId: clip.id, levelId: clip.levelId, levelLabel: clip.levelId === 'pre-a1' ? 'Pre-A1' : clip.levelId.toUpperCase(),
      title: clip.title, listeningTitle: clip.title, focus: clip.focus, synthetic: clip,
      segments: [{ id: `${clip.id}-s1`, text: clip.text, tokenCount: tokens(clip.text).length, clipId: clip.id }] }));
  }
  const allCatalog = (pathway, clips, synthetic) => [...catalog(pathway), ...humanCatalog(clips), ...syntheticCatalog(synthetic)];
  function latestAttempts(attempts) {
    const found = new Map();
    for (const item of list(attempts)) {
      const previous = found.get(item.segmentId);
      if (!previous || `${item.answeredAt}|${item.id}` > `${previous.answeredAt}|${previous.id}`) found.set(item.segmentId, item);
    }
    return found;
  }
  function needsPractice(record) {
    return Boolean(record && (!record.exact || record.revealed || record.listenCount < 1 || record.shadow !== 'independent'));
  }
  function summary(items, attempts) {
    const latest = latestAttempts(attempts), segments = list(items).flatMap((item) => list(item.segments));
    const records = segments.map((segment) => latest.get(segment.id)).filter(Boolean);
    return { total: segments.length, attempted: records.length, independent: records.filter((record) => !needsPractice(record)).length,
      needsPractice: records.filter(needsPractice).length };
  }
  const api = { sentences, tokens, evaluate, catalog, humanCatalog, syntheticCatalog, allCatalog, latestAttempts, needsPractice, summary };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root?.document) return;
  root.ListeningLab = api;
  let mounted = null;
  api.hasPendingWork = () => mounted?.hasPendingWork() || false;
  api.resetSession = () => mounted?.resetSession();
  api.openLesson = (id, segmentId) => mounted?.openLesson(id, segmentId) || false;
  api.stop = () => mounted?.stop();
  api.refresh = () => mounted?.refresh();

  api.mount = function (target, options) {
    if (!target) throw new Error('精听练习缺少页面容器。');
    mounted?.destroy?.();
    const all = list(options.catalog)[0]?.segments ? options.catalog : allCatalog(options.catalog, root.HUMAN_AUDIO, root.AI_AUDIO?.clips);
    if (!all.length) { target.textContent = '精听材料暂时未加载，请刷新页面重试。'; return null; }
    const doc = root.document, drafts = new Map();
    const initial = options.getProgress()?.preferences?.levelId;
    let levelId = all.some((item) => item.levelId === initial) ? initial : all[0].levelId;
    let source = all.some(item => item.human) ? 'human' : 'course';
    const inSource = item => source === 'human' ? Boolean(item.human) : source === 'ai' ? Boolean(item.synthetic) : !item.human && !item.synthetic;
    let lessonId = all.find((item) => item.levelId === levelId && inSource(item)).lessonId;
    let segmentId = all.find((item) => item.lessonId === lessonId).segments[0].id;
    let difficultOnly = false, rate = 1, speechRun = 0, speaking = false, speechTimeout = null;
    let statusNode = null, savedNotice = '', progressSnapshot = '', audio = null;
    const lesson = () => all.find((item) => item.lessonId === lessonId);
    const segment = () => lesson().segments.find((item) => item.id === segmentId) || lesson().segments[0];
    const latest = () => latestAttempts(options.getProgress()?.listeningAttempts);
    const draftFor = (id = segmentId) => {
      if (!drafts.has(id)) drafts.set(id, { input: '', revealed: false, referenceSeen: false, shadow: 'not-yet', listenCount: 0, result: null, dirty: false, saved: false });
      return drafts.get(id);
    };
    const hasPendingWork = () => [...drafts.values()].some((draft) => draft.dirty);
    function element(tag, className, text) {
      const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node;
    }
    function button(label, action, className = 'small-btn') {
      const node = element('button', className, label); node.type = 'button'; node.addEventListener('click', action); return node;
    }
    function status(text) { if (statusNode) statusNode.textContent = text; }
    function stop() {
      speechRun++; clearTimeout(speechTimeout); speechTimeout = null;
      if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
      if (speaking) root.speechSynthesis?.cancel(); speaking = false;
    }
    function speak(parts) {
      stop(); root.stopPathwaySpeech?.(); root.stopFoundationSpeech?.(); root.stopFoundationStudySpeech?.();
      root.stopSkillWorkshopAudio?.();
      if (parts[0]?.audio || parts[0]?.clipId) {
        const run = ++speechRun, part = parts[0];
        const clip = part.clipId ? root.AudioVoices.resolve(root.AudioVoices.find(part.clipId)) : null;
        const description = clip ? `AI 合成 · ${clip.speaker}` : '真人录音';
        const player = new root.Audio(clip?.src || part.audio); audio = player; player.playbackRate = rate;
        let counted = false;
        status(`正在加载${description}…`);
        speechTimeout = root.setTimeout(() => { if (run === speechRun) { stop(); status('录音加载超时，请检查网络后重试。'); } }, 20000);
        player.onplaying = () => { if (run !== speechRun) return; clearTimeout(speechTimeout); if (!counted) { const draft = draftFor(part.id); draft.listenCount = Math.min(999, draft.listenCount + 1); counted = true; } status(`正在播放${description}…`); };
        player.onended = () => { if (run === speechRun) { clearTimeout(speechTimeout); status(`${description}播放结束。可以重听或录下自己的表达。`); } };
        player.onerror = () => { if (run === speechRun) { stop(); status(`${description}未能播放，请重试。也可以查看原文继续阅读练习。`); } };
        player.play().catch(() => { if (run === speechRun) { stop(); status('录音播放未启动，请再次点击播放。'); } });
        return;
      }
      if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) { status('当前设备不支持朗读。可以点击“查看原文”，先做阅读与跟读；换用支持英文朗读的浏览器后再听写。'); return; }
      const voices = root.speechSynthesis.getVoices?.() || [];
      const voice = voices.find((entry) => /^en[-_]US$/i.test(entry.lang)) || voices.find((entry) => /^en(?:[-_]|$)/i.test(entry.lang));
      if (!voice) { status('尚未找到英文朗读声音。请稍后重试，或在设备设置中安装英文语音；也可查看原文继续练习。'); return; }
      const run = ++speechRun;
      let index = 0;
      function next() {
        if (run !== speechRun || index >= parts.length) { if (run === speechRun) { speaking = false; status('播放结束。可以重听、核对，或试着跟读。'); } return; }
        const part = parts[index++], utterance = new root.SpeechSynthesisUtterance(part.text);
        utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = rate;
        speaking = true; status('正在准备设备朗读…');
        clearTimeout(speechTimeout);
        speechTimeout = root.setTimeout(() => { if (run === speechRun) { stop(); status('朗读没有正常启动，请重试或查看原文。'); } }, 12000);
        utterance.onstart = () => {
          if (run !== speechRun) return; clearTimeout(speechTimeout);
          status(parts.length === 1 ? '正在播放这一句…' : `正在播放全文：第 ${index}/${parts.length} 句。`);
          const draft = draftFor(part.id); draft.listenCount = Math.min(999, draft.listenCount + 1);
        };
        utterance.onend = () => { if (run === speechRun) { clearTimeout(speechTimeout); next(); } };
        utterance.onerror = (event) => {
          if (run !== speechRun) return;
          stop(); status(['canceled', 'interrupted'].includes(event.error) ? '已停止朗读。' : '朗读暂时失败。请重试，或查看原文继续练习。');
        };
        try { root.speechSynthesis.speak(utterance); } catch { stop(); status('朗读暂时不可用，请查看原文继续练习。'); }
      }
      next();
    }
    function activeSegments() {
      const records = latest();
      return difficultOnly ? lesson().segments.filter((item) => needsPractice(records.get(item.id))) : lesson().segments;
    }
    function choose(nextLessonId, nextSegmentId) {
      stop(); savedNotice = '';
      const item = all.find((entry) => entry.lessonId === nextLessonId); if (!item) return false;
      lessonId = item.lessonId; levelId = item.levelId; source = item.human ? 'human' : item.synthetic ? 'ai' : 'course';
      segmentId = item.segments.some((part) => part.id === nextSegmentId) ? nextSegmentId : item.segments[0].id;
      render(); return true;
    }
    function render() {
      stop();
      progressSnapshot = JSON.stringify(options.getProgress());
      const current = lesson(), records = latest(), unit = current.synthetic ? '段' : '句';
      const rootNode = element('div', 'listening-lab');
      const header = element('header', 'listening-lab-header');
      header.append(element('span', 'eyebrow', 'LISTEN · NOTICE · SAY IT'), element('h2', '', '逐句精听与跟读'),
        element('p', '', '先听大意，再写下听到的内容，最后开口跟读。记录哪里还没听清，比反复播放整篇更有针对性。'));
      const boundary = element('p', 'listening-boundary', `${all.filter(x => x.human).length} 段真人录音、${all.filter(x => x.synthetic).length} 段 AI 材料，以及 ${all.filter(x => !x.human && !x.synthetic).length} 篇设备朗读材料。AI 材料可换声线，练习记录按同一段内容保留。阶段是练习建议，听写核对不等于发音评分。`);
      header.append(boundary); rootNode.append(header);
      const filters = element('div', 'listening-filters');
      const sourceLabel = element('label', '', '声音来源'), sourceSelect = element('select'); sourceSelect.id = 'listeningSource';
      for (const [id, label] of [['human', '真人录音'], ['ai', 'AI 合成 · 多种声线'], ['course', '课程材料 · 设备朗读']]) {
        if (id === 'human' && !all.some(x => x.human)) continue;
        if (id === 'ai' && !all.some(x => x.synthetic)) continue;
        const option = element('option', '', label); option.value = id; option.selected = source === id; sourceSelect.append(option);
      }
      sourceSelect.addEventListener('change', () => { source = sourceSelect.value; difficultOnly = false; choose(all.find(x => x.levelId === levelId && inSource(x)).lessonId); }); sourceLabel.append(sourceSelect); filters.append(sourceLabel);
      const levelLabel = element('label', '', '阶段'), levelSelect = element('select'); levelSelect.id = 'listeningLevel';
      for (const id of LEVELS.filter((id) => all.some((item) => item.levelId === id))) {
        const option = element('option', '', all.find((item) => item.levelId === id).levelLabel); option.value = id; option.selected = id === levelId; levelSelect.append(option);
      }
      levelSelect.addEventListener('change', () => { difficultOnly = false; choose(all.find((item) => item.levelId === levelSelect.value && inSource(item)).lessonId); }); levelLabel.append(levelSelect);
      const lessonLabel = element('label', '', '材料'), lessonSelect = element('select'); lessonSelect.id = 'listeningLesson';
      for (const item of all.filter((entry) => entry.levelId === levelId && inSource(entry))) {
        const count = summary([item], options.getProgress()?.listeningAttempts).needsPractice;
        const option = element('option', '', `${item.title}${count ? ` · ${count} 句待练` : ''}`); option.value = item.lessonId; option.selected = item.lessonId === lessonId; lessonSelect.append(option);
      }
      lessonSelect.addEventListener('change', () => choose(lessonSelect.value)); lessonLabel.append(lessonSelect); filters.append(levelLabel, lessonLabel); rootNode.append(filters);
      if (current.synthetic) {
        const voiceLabel = element('label', '', 'AI 声线'), voiceSelect = element('select'); voiceSelect.id = 'listeningVoice';
        for (const voice of root.AudioVoices.voices) { const option = element('option', '', voice.label); option.value = voice.id; option.selected = root.AudioVoices.current().id === voice.id; voiceSelect.append(option); }
        voiceSelect.addEventListener('change', () => { stop(); const saved = root.AudioVoices.choose(voiceSelect.value); status(`已切换为${root.AudioVoices.current().label}。${saved ? '选择已在本机记住。' : '本次选择可用，但浏览器未能记住偏好。'}输入和已有练习记录已保留。`); });
        voiceLabel.append(voiceSelect); filters.append(voiceLabel);
      }
      const info = summary([current], options.getProgress()?.listeningAttempts);
      const panel = element('section', 'listening-workspace');
      panel.append(element('span', 'eyebrow', current.levelLabel), element('h3', '', current.listeningTitle), element('p', '', current.focus),
        element('p', 'listening-evidence', `已练 ${info.attempted}/${info.total} ${unit} · ${info.needsPractice} ${unit}建议再练。统计依据每${unit}最近一次已保存的练习，不代表能力等级。`));
      const controls = element('div', 'listening-audio-controls');
      controls.append(button('播放全文', () => speak(current.segments)), button(`播放这一${unit}`, () => speak([segment()]), 'primary-btn'), button('停止朗读', () => { stop(); status('已停止朗读。'); }));
      const rateLabel = element('label', '', '速度'), rateSelect = element('select'); rateSelect.id = 'listeningRate';
      for (const value of [0.7, 1, 1.2]) { const option = element('option', '', `${value}×`); option.value = String(value); option.selected = rate === value; rateSelect.append(option); }
      rateSelect.addEventListener('change', () => { rate = Number(rateSelect.value); stop(); status('速度已调整，下次播放生效。'); }); rateLabel.append(rateSelect); controls.append(rateLabel);
      statusNode = element('p', 'listening-audio-status'); statusNode.setAttribute('role', 'status'); panel.append(controls, statusNode);
      if (current.human) {
        const credits = element('p', 'listening-evidence', `真人录音：${current.human.speaker} · `);
        for (const [text, url] of [['Tatoeba 来源', current.human.sourceUrl], ['录音 CC BY-SA 4.0', current.human.audioLicenseUrl], ['原句 CC BY 2.0 FR', current.human.textLicenseUrl]]) {
          const link = element('a', '', text); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; credits.append(link, doc.createTextNode(' · '));
        }
        panel.append(credits, button('录音并查看口语反馈', () => { stop(); root.openSkillWorkshop?.(current.human.id); }, 'secondary-btn'));
      }
      if (current.synthetic) {
        const credits = element('p', 'listening-evidence', 'AI 合成音频 · 原创练习文本 · 通用声线。点击播放才加载音频，无需在手机上运行语音生成模型。');
        const link = element('a', '', '声音来源与说明'); link.href = 'https://github.com/SKTT1Bert/us-life-english-simulator/blob/main/AI-AUDIO-CREDITS.md'; link.target = '_blank'; link.rel = 'noopener noreferrer'; credits.append(doc.createTextNode(' '), link);
        panel.append(credits, button('录音并查看口语反馈', () => { stop(); root.openSkillWorkshop?.(current.synthetic.id); }, 'secondary-btn'));
      }
      const reviewFilter = element('label', 'listening-review-filter');
      const checkbox = element('input'); checkbox.type = 'checkbox'; checkbox.id = 'listeningDifficultOnly'; checkbox.checked = difficultOnly;
      checkbox.addEventListener('change', () => { difficultOnly = checkbox.checked; const filtered = activeSegments(); if (filtered.length && !filtered.some((item) => item.id === segmentId)) segmentId = filtered[0].id; render(); });
      reviewFilter.append(checkbox, doc.createTextNode('只看这篇需要再练的句子')); panel.append(reviewFilter);
      const visible = activeSegments();
      const nav = element('nav', 'listening-sentences'); nav.setAttribute('aria-label', '选择精听句子');
      for (const part of visible) {
        const position = current.segments.findIndex((item) => item.id === part.id) + 1, record = records.get(part.id);
        const label = record ? (needsPractice(record) ? '建议再练' : '已练并自评独立跟读') : '尚未练习';
        const item = button(String(position), () => { segmentId = part.id; savedNotice = ''; render(); });
        item.dataset.listeningSegment = part.id; item.setAttribute('aria-label', `第 ${position} 句，${label}`); item.setAttribute('aria-pressed', String(part.id === segmentId));
        if (record) item.classList.add(needsPractice(record) ? 'needs-practice' : 'practised'); nav.append(item);
      }
      panel.append(nav);
      if (!visible.length) {
        panel.append(element('p', 'listening-empty', '这篇当前没有需要再练的已记录句子。取消筛选，可以继续练习尚未作答的句子。'));
        if (savedNotice) { const saved = element('p', 'listening-save-status', savedNotice); saved.setAttribute('role', 'status'); panel.append(saved); }
      } else {
        if (!visible.some((item) => item.id === segmentId)) segmentId = visible[0].id;
        renderSentence(panel, current, visible);
      }
      rootNode.append(panel);
      if (hasPendingWork()) rootNode.append(element('p', 'listening-draft-note', '本页有未保存的练习，切换句子会暂存输入。关闭或刷新页面前，请先核对并保存；同步不会覆盖正在输入的内容。'));
      target.replaceChildren(rootNode);
    }
    function renderSentence(panel, current, visible) {
      const part = segment(), draft = draftFor(), position = current.segments.findIndex((item) => item.id === segmentId) + 1;
      const unit = current.synthetic ? '段' : '句';
      const title = element('h4', '', `第 ${position} ${unit} · 听写与跟读`); title.id = 'listeningSentenceTitle'; panel.append(title);
      const reveal = button(draft.revealed ? '原文已展开（本次使用了辅助）' : '查看原文（记为使用辅助）', () => {
        draft.revealed = true; draft.referenceSeen = true; draft.dirty = true; draft.saved = false;
        if (draft.result) draft.result.revealed = true; render();
      }); reveal.id = 'listeningReveal'; reveal.disabled = draft.revealed; panel.append(reveal);
      if (draft.revealed) { const transcript = element('p', 'listening-transcript', part.text); transcript.lang = 'en'; panel.append(transcript); }
      const label = element('label', 'listening-input-label', '写下听到的英文'); label.htmlFor = 'listeningInput';
      const input = element('textarea'); input.id = 'listeningInput'; input.rows = 3; input.maxLength = 3000; input.lang = 'en'; input.autocomplete = 'off'; input.spellcheck = false;
      input.placeholder = '先独立听写，暂时没听清的地方可以留空。'; input.value = draft.input;
      const note = element('p', 'listening-input-note', '忽略大小写和句末标点，统一弯引号；按原句核对词语和顺序，不判断同义改写。输入文字不保存、不上传。');
      const feedback = element('div', 'listening-feedback'); feedback.id = 'listeningFeedback'; feedback.setAttribute('aria-live', 'polite');
      const error = element('p', 'listening-save-status', savedNotice); error.id = 'listeningSaveStatus'; error.setAttribute('role', 'status');
      function changed() {
        if (draft.referenceSeen) draft.revealed = true;
        draft.input = input.value; draft.result = null; draft.dirty = Boolean(draft.input.trim() || draft.revealed || draft.shadow !== 'not-yet'); draft.saved = false;
        feedback.replaceChildren(); save.disabled = true; error.textContent = '输入暂存于本页。核对后可以保存这次练习。';
      }
      input.addEventListener('input', changed);
      const grade = button('核对听写', () => {
        try {
          if (!input.value.trim() || !tokens(input.value).length) { error.textContent = '请先写下你听到的词；也可以查看原文后再试。'; input.focus(); return; }
          draft.result = { ...evaluate(part.text, input.value), revealed: draft.revealed };
          draft.referenceSeen = true; draft.dirty = true; draft.saved = false;
          showFeedback(feedback, draft.result); save.disabled = false; error.textContent = '已核对。开口跟读后选择自评，再保存这次练习；也可以先保存听写结果。';
        } catch (failure) { error.textContent = failure.message; }
      }, 'primary-btn'); grade.id = 'listeningCheck';
      const shadow = element('fieldset', 'listening-shadow'); shadow.append(element('legend', '', '开口试一试 · 跟读情况由你自评'));
      const instruction = element('p', '', '重听一句，模仿停顿和重音。看着原文跟读后，可以移开视线再说一遍。本页不录音，也不自动判断发音。'); shadow.append(instruction);
      for (const [value, text] of Object.entries(shadowLabels)) {
        const row = element('label'), radio = element('input'); radio.type = 'radio'; radio.name = 'listeningShadow'; radio.value = value; radio.checked = value === draft.shadow;
        radio.addEventListener('change', () => { draft.shadow = value; draft.dirty = true; draft.saved = false; save.disabled = !draft.result; error.textContent = '跟读自评已选择，保存后会加入练习记录。'; }); row.append(radio, doc.createTextNode(text)); shadow.append(row);
      }
      const save = button(draft.saved ? '本次练习已保存' : '保存这次练习', () => {
        if (!draft.result || draft.saved) return;
        const attempt = { lessonId, segmentId, matchedTokens: draft.result.matchedTokens, tokenCount: draft.result.tokenCount, exact: draft.result.exact,
          revealed: draft.result.revealed, shadow: draft.shadow, listenCount: draft.listenCount };
        try {
          if (options.commit({ type: 'listening', attempt }) === false) throw new Error('storage');
          draft.dirty = false; draft.saved = true;
          savedNotice = '这次听写结果与跟读自评已保存。输入文字和声音没有保存。'; render();
        } catch { error.textContent = '保存失败，输入和核对结果仍留在本页。请先备份已有进度，再重试。'; }
      }, 'primary-btn'); save.id = 'listeningSave'; save.disabled = !draft.result || draft.saved;
      panel.append(label, input, note, grade, feedback, shadow, save, error);
      if (draft.result) showFeedback(feedback, draft.result);
      const footer = element('div', 'listening-footer'), index = visible.findIndex((item) => item.id === segmentId);
      const previous = button('← 上一句', () => { segmentId = visible[index - 1].id; savedNotice = ''; render(); }); previous.disabled = index <= 0;
      const next = button('下一句 →', () => { segmentId = visible[index + 1].id; savedNotice = ''; render(); }); next.disabled = index >= visible.length - 1;
      const retry = button('重新练这一句', () => {
        if (draft.dirty && !root.confirm('本句还有未保存的输入。重新练习会清空本句输入，已保存的历史记录会保留。继续吗？')) return;
        drafts.delete(segmentId); savedNotice = ''; render();
      }); retry.id = 'listeningRetry'; footer.append(previous, retry, next); panel.append(footer);
      const history = list(options.getProgress()?.listeningAttempts).filter((item) => item.segmentId === segmentId)
        .sort((a, b) => `${b.answeredAt}|${b.id}`.localeCompare(`${a.answeredAt}|${a.id}`)).slice(0, 5);
      if (history.length) {
        const section = element('section', 'listening-history'); section.append(element('h4', '', `这一${unit}最近的练习`));
        const entries = element('ul');
        for (const item of history) entries.append(element('li', '', `${new Date(item.answeredAt).toLocaleString()} · ${item.exact ? '听写词语与顺序一致' : `${item.matchedTokens}/${item.tokenCount} 个原词匹配，仍有差异`} · ${item.revealed ? '使用原文辅助' : '核对前未展开原文'} · ${shadowLabels[item.shadow]}（自评）`));
        section.append(entries); panel.append(section);
      }
    }
    function showFeedback(target, result) {
      target.replaceChildren(element('p', 'listening-result', result.exact ? '词语与顺序都对应上了。再听一遍，留意连读、停顿和重音。' : `${result.matchedTokens}/${result.tokenCount} 个原词匹配。看看漏听、听错或多写的地方，再重听一次。`));
      const differences = element('div', 'listening-token-feedback'); differences.setAttribute('aria-label', '逐词核对结果');
      for (const item of result.alignment) {
        const token = element('span', `listening-token ${item.kind}`);
        if (item.kind === 'match') token.textContent = item.expected;
        else if (item.kind === 'missing') token.textContent = `漏听：${item.expected}`;
        else if (item.kind === 'extra') token.textContent = `多写：${item.actual}`;
        else token.textContent = `${item.actual} → ${item.expected}`;
        differences.append(token);
      }
      target.append(differences, element('p', 'listening-feedback-note', result.revealed ? '本次核对前使用了原文辅助。' : '本次核对前没有展开原文。核对后若修改答案，后续结果会记为使用辅助。'));
    }
    const viewChanged = () => { if (!target.closest('.view')?.classList.contains('active')) stop(); };
    const hidden = () => { if (doc.visibilityState === 'hidden') stop(); };
    const beforeUnload = (event) => { if (hasPendingWork()) { event.preventDefault(); event.returnValue = ''; } };
    root.addEventListener('daily-english-view', viewChanged); root.addEventListener('pagehide', stop); root.addEventListener('beforeunload', beforeUnload); doc.addEventListener('visibilitychange', hidden);
    mounted = { hasPendingWork, stop, refresh: () => { if (!hasPendingWork() && progressSnapshot !== JSON.stringify(options.getProgress())) render(); },
      resetSession: () => { stop(); drafts.clear(); savedNotice = ''; render(); },
      openLesson: (id, segmentId) => { difficultOnly = false; return choose(id, segmentId); },
      destroy: () => { stop(); root.removeEventListener('daily-english-view', viewChanged); root.removeEventListener('pagehide', stop); root.removeEventListener('beforeunload', beforeUnload); doc.removeEventListener('visibilitychange', hidden); } };
    render(); return mounted;
  };
})(typeof window !== 'undefined' ? window : globalThis);
