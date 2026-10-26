(function(root) {
  'use strict';
  async function decode(blob) {
    if (!blob || blob.size > 8 * 1024 * 1024) throw new Error('请选择不超过 8 MB、时长不超过 30 秒的录音。');
    const AudioContext = root.AudioContext || root.webkitAudioContext;
    if (!AudioContext || !root.OfflineAudioContext) throw new Error('此浏览器暂不支持本机音频处理。可以输入文字继续练习。');
    const context = new AudioContext(); let decoded;
    try { decoded = await context.decodeAudioData(await blob.arrayBuffer()); }
    catch { throw new Error('无法读取这段音频。请尝试 MP3、WAV、M4A 或浏览器录音。'); }
    finally { await context.close(); }
    if (decoded.duration < 0.25 || decoded.duration > 30.5) throw new Error('请使用 0.25–30 秒的短录音。较长回答可以分成几段练习。');
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
    const source = offline.createBufferSource(); source.buffer = decoded; source.connect(offline.destination); source.start();
    const output = await offline.startRendering(), audio = output.getChannelData(0).slice();
    const rms = Math.sqrt(audio.reduce((sum, x) => sum + x * x, 0) / audio.length);
    if (rms < 0.0008) throw new Error('这段录音几乎没有声音。请检查麦克风、靠近一些，再录一次。');
    return { audio, duration: Math.min(30.5, decoded.duration) };
  }
  function request(script, payload, progress) {
    let worker, timer, rejectRequest;
    const promise = new Promise((resolve, reject) => {
      rejectRequest = reject;
      worker = new Worker(new URL(script, document.baseURI), { type: 'module' });
      const finish = (error, result) => { clearTimeout(timer); worker.terminate(); error ? reject(new Error(error)) : resolve(result); };
      timer = setTimeout(() => finish('处理时间较长，已停止。请保留内容，尝试更短的录音或稍后重试。'), 180000);
      worker.onerror = () => finish('检查工具未能加载。请确认网络连接，更新浏览器后重试。');
      worker.onmessage = ({ data }) => { if (data.progress !== undefined) progress?.(data.progress); else finish(data.error, data); };
      worker.postMessage({ ...payload, id: 1 });
    });
    return { promise, cancel() { clearTimeout(timer); worker?.terminate(); rejectRequest?.(new Error('已停止处理，输入内容仍然保留。')); } };
  }
  function recorder(onReady, onStatus) {
    let stream, media, timeout, generation = 0, active = false;
    const release = () => { clearTimeout(timeout); stream?.getTracks().forEach(track => track.stop()); stream = null; active = false; };
    function cancel() { generation++; if (media?.state === 'recording') media.stop(); release(); }
    async function load(blob) {
      const run = ++generation;
      try {
        const decoded = await decode(blob); if (run !== generation) return;
        onReady({ ...decoded, blob }); onStatus('录音已就绪。可先回放，再点击“本机转写”。');
      } catch (error) { if (run === generation) onStatus(error.message); }
    }
    async function start() {
      if (!root.navigator.mediaDevices?.getUserMedia || !root.MediaRecorder) { onStatus('此浏览器不能直接录音，可以选择音频文件或输入文字。'); return; }
      cancel(); const run = generation; active = true; onStatus('正在请求麦克风权限…');
      try {
        const acquired = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
        if (run !== generation) { acquired.getTracks().forEach(t => t.stop()); return; }
        stream = acquired; const chunks = [], current = new MediaRecorder(stream); media = current;
        current.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        current.onerror = () => { if (run === generation) { cancel(); onStatus('录音中断，请重新录制。'); } };
        current.onstop = () => { acquired.getTracks().forEach(t => t.stop()); if (run !== generation) return; const blob = new Blob(chunks, { type: current.mimeType }); release(); load(blob); };
        current.start(); timeout = setTimeout(() => { if (current.state === 'recording') current.stop(); release(); }, 30000);
        onStatus('正在录音，最长 30 秒。说完后点击“结束录音”。');
      } catch { if (run === generation) { release(); onStatus('未能使用麦克风。请检查浏览器权限，或选择录音文件。'); } }
    }
    return { start, load, stop() { if (media?.state === 'recording') media.stop(); else cancel(); release(); }, cancel,
      get active() { return active; }, dispose() { cancel(); } };
  }
  root.SkillMedia = { decode, request, recorder };
})(window);
