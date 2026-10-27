(function (root) {
  'use strict';
  const MODE_KEY = 'daily-english-speech-mode-v1';
  const EXPANDED_KEY = 'daily-english-ai-download-v1';
  function exampleText(text, voiceId) {
    const value = String(text || '').trim(), words = value.match(/[a-z]+(?:['’-][a-z]+)*/gi) || [];
    // Very short British examples need context to avoid unstable isolated sounds.
    return voiceId === 'bf_emma' && words.length > 0 && words.length <= 3 && value.length <= 40
      ? `Listen and repeat. ${value.replace(/[.!?]+$/, '')}.` : value;
  }
  const splitText = text => {
    const value = String(text || '').replace(/\s+/g, ' ').trim(), chunks = [];
    let rest = value;
    while (rest.length > 240) {
      const prefix = rest.slice(0, 240);
      const sentence = [...prefix.matchAll(/[.!?;:]\s/g)].at(-1);
      let end = sentence && sentence.index > 80 ? sentence.index + 1 : prefix.lastIndexOf(' ');
      if (end < 1) end = 240;
      chunks.push(rest.slice(0, end)); rest = rest.slice(end).trimStart();
    }
    if (rest) chunks.push(rest);
    return chunks;
  };
  if (typeof module === 'object' && module.exports) { module.exports = { splitText, exampleText }; return; }
  let mode = 'ai', active = null, serial = 0, worker = null, pending = null, idleTimer = null, context = null;
  let expanded = false;
  let cacheBytes = 0;
  const cache = new Map();
  try { if (root.localStorage.getItem(MODE_KEY) === 'device') mode = 'device'; } catch { /* Keep the default. */ }
  try { expanded = root.localStorage.getItem(EXPANDED_KEY) === 'allowed'; } catch { /* Ask at first use. */ }
  const emit = (message, options) => {
    options?.onStatus?.(message);
    root.dispatchEvent(new CustomEvent('daily-english-speech-status', { detail: { message } }));
  };
  function disposeWorker() {
    clearTimeout(idleTimer); idleTimer = null;
    worker?.terminate(); worker = null;
    if (pending) { const request = pending; pending = null; clearTimeout(request.timer); request.reject(new Error('cancelled')); }
  }
  function stop(owner, notifyLocal = false) {
    if (!active || (owner && active.owner !== owner)) return;
    const previous = active; active = null; serial++;
    previous.cleanup?.();
    if (pending) disposeWorker();
    previous.options.onCancel?.();
    if (notifyLocal) previous.options.onStatus?.('已停止朗读。');
    emit('已停止朗读。');
  }
  function setMode(value) {
    if (!['ai', 'device'].includes(value)) throw Error('Unknown speech mode');
    stop(undefined, true); mode = value;
    let saved = true; try { root.localStorage.setItem(MODE_KEY, value); } catch { saved = false; }
    root.dispatchEvent(new CustomEvent('daily-english-speech-mode', { detail: { mode, saved } }));
    return saved;
  }
  function setExpanded(value) {
    expanded = Boolean(value);
    let saved = true;
    try { root.localStorage.setItem(EXPANDED_KEY, expanded ? 'allowed' : 'ask'); } catch { saved = false; }
    root.dispatchEvent(new CustomEvent('daily-english-speech-download', { detail: { allowed: expanded, saved } }));
    return saved;
  }
  function choosePlayback(choice) {
    if (!['ai', 'device'].includes(choice) || !active?.choose) return;
    if (choice === 'ai') setExpanded(true);
    active.choose(choice);
  }
  function requestPlayback(run) {
    return new Promise(resolve => {
      function settle(choice) {
        if (active !== run && choice !== null) return;
        run.choose = null; run.cleanup = null;
        root.dispatchEvent(new CustomEvent('daily-english-speech-choice', { detail: { open: false } }));
        resolve(choice);
      }
      run.choose = settle; run.cleanup = () => settle(null);
      emit('请选择这段内容的朗读方式。', run.options);
      root.dispatchEvent(new CustomEvent('daily-english-speech-choice', { detail: { open: true } }));
    });
  }
  function remember(key, result) {
    const bytes = result.samples.byteLength;
    if (bytes > 12 * 1024 * 1024) return;
    while (cache.size && (cache.size >= 40 || cacheBytes + bytes > 12 * 1024 * 1024)) {
      const oldest = cache.keys().next().value; cacheBytes -= cache.get(oldest).samples.byteLength; cache.delete(oldest);
    }
    cache.set(key, result); cacheBytes += bytes;
  }
  function generate(text, voice, run, speed) {
    const key = `${voice}\n${speed}\n${text}`;
    if (cache.has(key)) { const result = cache.get(key); cache.delete(key); cache.set(key, result); return Promise.resolve(result); }
    clearTimeout(idleTimer);
    return new Promise((resolve, reject) => {
      if (!worker) {
        worker = new Worker(new URL('courseSpeech.worker.js', document.baseURI), { type: 'module' });
        worker.onmessage = ({ data }) => {
          const request = pending;
          if (!request || request.id !== data.id || active !== request.run) return;
          if (data.progress !== undefined) { emit(`正在准备 AI 语音资源 ${data.progress}%…首次约 110 MB，请保持页面打开。`, request.run.options); return; }
          if (data.generating) { emit(`正在用${request.voice.label}生成朗读…可随时停止。`, request.run.options); return; }
          clearTimeout(request.timer); pending = null;
          if (data.error) { disposeWorker(); request.reject(new Error(data.error)); return; }
          if (!(data.samples instanceof Float32Array) || data.sampleRate !== 24000 || !data.samples.length) { disposeWorker(); request.reject(new Error('语音生成结果不可用，请重试。')); return; }
          remember(request.key, data); request.resolve(data);
          idleTimer = setTimeout(disposeWorker, 120000);
        };
        worker.onerror = () => { const request = pending; pending = null; disposeWorker(); if (request) { clearTimeout(request.timer); request.reject(new Error('AI 朗读暂时不可用。请重试，或在“朗读设置”中改用设备朗读。')); } };
      }
      const id = ++serial;
      const timer = setTimeout(() => { if (pending?.id !== id) return; pending = null; disposeWorker(); reject(new Error('AI 朗读准备超时，请重试，或在“朗读设置”中改用设备朗读。')); }, 120000);
      pending = { id, resolve, reject, timer, key, run, voice: root.AudioVoices.current() };
      worker.postMessage({ id, text, voice, speed });
    });
  }
  function start(options) {
    stop();
    document.querySelectorAll('audio').forEach(audio => audio.pause());
    const run = { options, owner: options.owner || 'general', cleanup: null, lastIndex: -1, choose: null };
    active = run; return run;
  }
  function fail(run, error) {
    if (active !== run) return;
    active = null; run.cleanup?.();
    const message = error?.message || '朗读暂时不可用，请重试。';
    emit(message, run.options); run.options.onError?.(message);
  }
  function finish(run) {
    if (active !== run) return;
    active = null; run.cleanup?.(); emit('朗读结束，可以再听一遍或试着跟读。', run.options); run.options.onEnd?.();
  }
  function started(run, index) {
    if (active !== run || run.lastIndex === index) return;
    run.lastIndex = index; run.options.onStart?.(index);
  }
  function playRecording(source, run, index, rate, description) {
    return new Promise((resolve, reject) => {
      // Keep the same media element across a sentence sequence. Mobile Safari
      // can revoke autoplay permission when each sentence creates a new one.
      const audio = run.audio || (run.audio = new Audio(source.src));
      if (audio.getAttribute('src') !== source.src) audio.src = source.src;
      const timer = setTimeout(() => reject(new Error('音频加载超时，请检查网络后重试。')), 20000);
      audio.playbackRate = rate;
      audio.preservesPitch = true;
      const cleanup = () => {
        clearTimeout(timer); audio.onplaying = audio.onended = audio.onerror = null;
        audio.pause(); audio.removeAttribute('src'); audio.load();
      };
      run.cleanup = () => { cleanup(); resolve(); };
      audio.onplaying = () => { if (active !== run) return; clearTimeout(timer); emit(`正在播放${description}…`, run.options); started(run, index); };
      audio.onended = () => { cleanup(); run.cleanup = null; resolve(); };
      audio.onerror = () => reject(new Error('音频未能播放，请重试，或在“朗读设置”中选择设备朗读。'));
      emit(`正在加载本段音频 · ${description}`, run.options);
      audio.play().catch(() => reject(new Error('播放未启动，请再次点击播放。')));
    });
  }
  function playClip(clip, options = {}) {
    const run = start(options);
    let source;
    try { source = root.AudioVoices.resolve(clip); if (!source?.src) throw Error('这段音频暂时不可用，请换一段材料。'); }
    catch (error) { fail(run, error); return; }
    const description = source.synthetic ? `AI 合成 · ${source.speaker}` : '真人录音';
    playRecording(source, run, 0, options.rate || 1, description).then(() => finish(run), error => fail(run, error));
  }
  function play(texts, options = {}) {
    const run = start(options), voice = root.AudioVoices.current();
    const speed = Math.max(0.5, Math.min(1.5, Number(options.rate) || 1));
    const originals = Array.isArray(texts) ? texts : [texts];
    const entries = originals.flatMap((text, index) => {
      const value = options.example && mode === 'ai' ? exampleText(text, voice.id) : String(text || '').replace(/\s+/g, ' ').trim();
      const recording = root.CourseAudio?.find(value, voice.id);
      return recording ? [{ text: value, index, recording }] : splitText(value).map(text => ({ text, index, recording: root.CourseAudio?.find(text, voice.id) }));
    });
    if (!entries.length) { fail(run, new Error('没有可朗读的英文内容。')); return; }
    if (entries.reduce((n, part) => n + part.text.length, 0) > 20000) { fail(run, new Error('这段文字太长，请分段朗读。')); return; }
    function playDevice() {
      if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) { fail(run, new Error('当前设备不支持朗读，请在“朗读设置”中使用 AI 声线。')); return; }
      const voices = root.speechSynthesis.getVoices?.() || [];
      const systemVoice = voices.find(v => v.lang.toLowerCase().replace('_','-') === voice.accent.toLowerCase()) || voices.find(v => /^en[-_]/i.test(v.lang));
      if (!systemVoice) { fail(run, new Error('尚未找到英文朗读声音，请安装英文语音，或在“朗读设置”中使用 AI 声线。')); return; }
      const deviceEntries = originals.flatMap((text, index) => splitText(text).map(text => ({ text, index })));
      let timer;
      run.cleanup = () => { clearTimeout(timer); root.speechSynthesis.cancel(); };
      const next = i => {
        if (active !== run) return;
        if (i === deviceEntries.length) { finish(run); return; }
        const item = deviceEntries[i];
        // Device playback uses the original words; a British model cue is not
        // part of the course or of a learner's dictation reference.
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.voice = systemVoice; utterance.lang = systemVoice.lang; utterance.rate = options.rate || 1;
        emit('正在准备设备朗读（声音由设备提供）…', options);
        timer = setTimeout(() => fail(run, new Error('设备朗读没有正常启动，请重试或切换 AI 声线。')), 12000);
        utterance.onstart = () => { if (active !== run) return; clearTimeout(timer); emit('正在播放设备朗读…', options); started(run, item.index); };
        utterance.onend = () => { if (active === run) { clearTimeout(timer); next(i + 1); } };
        utterance.onerror = event => { if (active === run) fail(run, new Error(['canceled', 'interrupted'].includes(event.error) ? '已停止朗读。' : '设备朗读暂时失败，请重试或切换 AI 声线。')); };
        try { root.speechSynthesis.speak(utterance); } catch (error) { fail(run, error); }
      };
      next(0); return;
    }
    if (mode === 'device') { playDevice(); return; }
    const needsModel = entries.some(item => !item.recording);
    async function playAI() {
      let resumed;
      if (needsModel) {
        const AudioContext = root.AudioContext || root.webkitAudioContext;
        if (!AudioContext || !root.Worker) throw Error('当前浏览器不支持 AI 朗读，请更换浏览器或在“朗读设置”中改用设备朗读。');
        if (!context || context.state === 'closed') context = new AudioContext();
        // Resume during the playback/download-choice click, before inference.
        resumed = context.resume();
        emit(`正在准备${voice.label}…首次需要下载约 110 MB 语音资源，之后由本机生成。`, options);
      }
      if (resumed) {
        await resumed;
      }
      for (const item of entries) {
        if (active !== run) return;
        if (item.recording) {
          await playRecording(item.recording, run, item.index, speed, `${voice.label} · AI 合成`);
          continue;
        }
        const result = await generate(item.text, voice.id, run, speed);
        if (active !== run) return;
        if (context.state !== 'running') throw Error('声音被浏览器暂停，请再次点击播放。');
        const buffer = context.createBuffer(1, result.samples.length, result.sampleRate); buffer.copyToChannel(result.samples, 0);
        // Set speech tempo in the model; resampling playback would also shift pitch.
        const source = context.createBufferSource(); source.buffer = buffer; source.connect(context.destination);
        await new Promise(resolve => {
          run.cleanup = () => { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); resolve(); };
          source.onended = () => { source.disconnect(); run.cleanup = null; resolve(); };
          source.start();
          emit(`正在播放 · ${voice.label} · AI 合成`, options);
          started(run, item.index);
        });
      }
      finish(run);
    }
    if (needsModel && !expanded) {
      requestPlayback(run).then(choice => {
        if (active !== run || !choice) return;
        if (choice === 'device') playDevice();
        else playAI().catch(error => fail(run, error));
      });
    } else playAI().catch(error => fail(run, error));
  }
  root.EnglishSpeech = { play, playClip, stop, setMode, setExpanded, choosePlayback, expandedEnabled: () => expanded, mode: () => mode, isActive: () => Boolean(active), splitText };
  root.addEventListener('daily-english-voice', () => { stop(undefined, true); emit(`已切换为${root.AudioVoices.current().label}，下次朗读生效。`); });
  root.addEventListener('daily-english-view', () => stop());
  document.addEventListener('play', event => { if (event.target instanceof HTMLAudioElement) stop(); }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); disposeWorker(); } });
  root.addEventListener('pagehide', () => { stop(); disposeWorker(); cache.clear(); cacheBytes = 0; context?.close().catch(() => {}); context = null; });
  root.addEventListener('storage', event => {
    if (event.key === MODE_KEY) { stop(); mode = event.newValue === 'device' ? 'device' : 'ai'; root.dispatchEvent(new CustomEvent('daily-english-speech-mode', { detail: { mode, saved: true } })); }
    if (event.key === EXPANDED_KEY) { expanded = event.newValue === 'allowed'; root.dispatchEvent(new CustomEvent('daily-english-speech-download', { detail: { allowed: expanded, saved: true } })); }
  });
})(typeof window !== 'undefined' ? window : globalThis);
