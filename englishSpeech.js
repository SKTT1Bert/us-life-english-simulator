(function (root) {
  'use strict';
  const MODE_KEY = 'daily-english-speech-mode-v1';
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
  if (typeof module === 'object' && module.exports) { module.exports = { splitText }; return; }
  let mode = 'ai', active = null, serial = 0, worker = null, pending = null, idleTimer = null, context = null;
  let cacheBytes = 0;
  const cache = new Map();
  try { if (root.localStorage.getItem(MODE_KEY) === 'device') mode = 'device'; } catch { /* Keep the default. */ }
  const emit = (message, options) => {
    options?.onStatus?.(message);
    root.dispatchEvent(new CustomEvent('daily-english-speech-status', { detail: { message } }));
  };
  function disposeWorker() {
    clearTimeout(idleTimer); idleTimer = null;
    worker?.terminate(); worker = null;
    if (pending) { const request = pending; pending = null; clearTimeout(request.timer); request.reject(new Error('cancelled')); }
  }
  function stop(owner) {
    if (!active || (owner && active.owner !== owner)) return;
    const previous = active; active = null; serial++;
    previous.cleanup?.();
    if (pending) disposeWorker();
    previous.options.onCancel?.();
    emit('已停止朗读。');
  }
  function setMode(value) {
    if (!['ai', 'device'].includes(value)) throw Error('Unknown speech mode');
    stop(); mode = value;
    let saved = true; try { root.localStorage.setItem(MODE_KEY, value); } catch { saved = false; }
    root.dispatchEvent(new CustomEvent('daily-english-speech-mode', { detail: { mode, saved } }));
    return saved;
  }
  function remember(key, result) {
    const bytes = result.samples.byteLength;
    if (bytes > 12 * 1024 * 1024) return;
    while (cache.size && (cache.size >= 40 || cacheBytes + bytes > 12 * 1024 * 1024)) {
      const oldest = cache.keys().next().value; cacheBytes -= cache.get(oldest).samples.byteLength; cache.delete(oldest);
    }
    cache.set(key, result); cacheBytes += bytes;
  }
  function generate(text, voice, run) {
    const key = `${voice}\n${text}`;
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
      worker.postMessage({ id, text, voice });
    });
  }
  function start(options) {
    stop();
    document.querySelectorAll('audio').forEach(audio => audio.pause());
    const run = { options, owner: options.owner || 'general', cleanup: null };
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
  function playClip(clip, options = {}) {
    const run = start(options);
    let source;
    try { source = root.AudioVoices.resolve(clip); if (!source?.src) throw Error('这段音频暂时不可用，请换一段材料。'); }
    catch (error) { fail(run, error); return; }
    const description = source.synthetic ? `AI 合成 · ${source.speaker}` : '真人录音';
    const audio = new Audio(source.src), timer = setTimeout(() => fail(run, new Error('音频加载超时，请检查网络后重试。')), 20000);
    audio.playbackRate = options.rate || 1;
    run.cleanup = () => { clearTimeout(timer); audio.onplaying = audio.onended = audio.onerror = null; audio.pause(); audio.removeAttribute('src'); audio.load(); };
    let started = false;
    audio.onplaying = () => { if (active !== run) return; clearTimeout(timer); emit(`正在播放${description}…`, options); if (!started) { started = true; options.onStart?.(0); } };
    audio.onended = () => finish(run);
    audio.onerror = () => fail(run, new Error('音频未能播放，请检查网络后重试。'));
    emit(`正在加载${description}…`, options);
    audio.play().catch(() => fail(run, new Error('播放未启动，请再次点击播放。')));
  }
  function play(texts, options = {}) {
    const run = start(options), voice = root.AudioVoices.current();
    const entries = (Array.isArray(texts) ? texts : [texts]).flatMap((text, index) => splitText(text).map(text => ({ text, index })));
    if (!entries.length) { fail(run, new Error('没有可朗读的英文内容。')); return; }
    if (entries.reduce((n, part) => n + part.text.length, 0) > 20000) { fail(run, new Error('这段文字太长，请分段朗读。')); return; }
    if (mode === 'device') {
      if (!root.speechSynthesis || !root.SpeechSynthesisUtterance) { fail(run, new Error('当前设备不支持朗读，请在“朗读设置”中使用 AI 声线。')); return; }
      const voices = root.speechSynthesis.getVoices?.() || [];
      const systemVoice = voices.find(v => v.lang.toLowerCase().replace('_','-') === voice.accent.toLowerCase()) || voices.find(v => /^en[-_]/i.test(v.lang));
      if (!systemVoice) { fail(run, new Error('尚未找到英文朗读声音，请安装英文语音，或在“朗读设置”中使用 AI 声线。')); return; }
      let timer, last = -1;
      run.cleanup = () => { clearTimeout(timer); root.speechSynthesis.cancel(); };
      const next = i => {
        if (active !== run) return;
        if (i === entries.length) { finish(run); return; }
        const item = entries[i], utterance = new SpeechSynthesisUtterance(item.text);
        utterance.voice = systemVoice; utterance.lang = systemVoice.lang; utterance.rate = options.rate || 1;
        emit('正在准备设备朗读（声音由设备提供）…', options);
        timer = setTimeout(() => fail(run, new Error('设备朗读没有正常启动，请重试或切换 AI 声线。')), 12000);
        utterance.onstart = () => { if (active !== run) return; clearTimeout(timer); emit('正在播放设备朗读…', options); if (last !== item.index) { last = item.index; options.onStart?.(item.index); } };
        utterance.onend = () => { if (active === run) { clearTimeout(timer); next(i + 1); } };
        utterance.onerror = event => { if (active === run) fail(run, new Error(['canceled', 'interrupted'].includes(event.error) ? '已停止朗读。' : '设备朗读暂时失败，请重试或切换 AI 声线。')); };
        try { root.speechSynthesis.speak(utterance); } catch (error) { fail(run, error); }
      };
      next(0); return;
    }
    try {
      const AudioContext = root.AudioContext || root.webkitAudioContext;
      if (!AudioContext || !root.Worker) throw Error('当前浏览器不支持 AI 朗读，请更换浏览器或在“朗读设置”中改用设备朗读。');
      if (!context || context.state === 'closed') context = new AudioContext();
      // Resume on the click itself so mobile browsers can play after asynchronous inference.
      const resumed = context.resume();
      emit(`正在准备${voice.label}…首次需要下载约 110 MB 语音资源，之后由本机生成。`, options);
      (async () => {
        await resumed;
        let last = -1;
        for (const item of entries) {
          if (active !== run) return;
          const result = await generate(item.text, voice.id, run);
          if (active !== run) return;
          if (context.state !== 'running') throw Error('声音被浏览器暂停，请再次点击播放。');
          const buffer = context.createBuffer(1, result.samples.length, result.sampleRate); buffer.copyToChannel(result.samples, 0);
          const source = context.createBufferSource(); source.buffer = buffer; source.playbackRate.value = options.rate || 1; source.connect(context.destination);
          await new Promise(resolve => {
            run.cleanup = () => { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); resolve(); };
            source.onended = () => { source.disconnect(); run.cleanup = null; resolve(); };
            source.start();
            emit(`正在播放 · ${voice.label} · AI 合成`, options);
            if (last !== item.index) { last = item.index; options.onStart?.(item.index); }
          });
        }
        finish(run);
      })().catch(error => fail(run, error));
    } catch (error) { fail(run, error); }
  }
  root.EnglishSpeech = { play, playClip, stop, setMode, mode: () => mode, isActive: () => Boolean(active), splitText };
  root.addEventListener('daily-english-voice', () => { stop(); emit(`已切换为${root.AudioVoices.current().label}，下次朗读生效。`); });
  root.addEventListener('daily-english-view', () => stop());
  document.addEventListener('play', event => { if (event.target instanceof HTMLAudioElement) stop(); }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); disposeWorker(); } });
  root.addEventListener('pagehide', () => { stop(); disposeWorker(); cache.clear(); cacheBytes = 0; context?.close().catch(() => {}); context = null; });
  root.addEventListener('storage', event => { if (event.key === MODE_KEY) { stop(); mode = event.newValue === 'device' ? 'device' : 'ai'; root.dispatchEvent(new CustomEvent('daily-english-speech-mode', { detail: { mode, saved: true } })); } });
})(typeof window !== 'undefined' ? window : globalThis);
