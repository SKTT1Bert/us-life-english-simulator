(function (root) {
  'use strict';
  const data = root.AI_AUDIO || (typeof module === 'object' && module.exports ? require('./data/aiAudio.js') : { voices: [], clips: [] });
  const key = 'daily-english-audio-voice-v1';
  let selected = data.voices[0]?.id || '';
  try { const saved = root.localStorage?.getItem(key); if (data.voices.some(v => v.id === saved)) selected = saved; } catch { /* Audio still works when preference storage is unavailable. */ }
  const current = () => data.voices.find(v => v.id === selected) || data.voices[0];
  function choose(id) {
    if (!data.voices.some(v => v.id === id)) throw new Error('请选择列表中的 AI 声线。');
    selected = id;
    try { root.localStorage?.setItem(key, id); return true; } catch { return false; }
  }
  function resolve(clip, voiceId = current()?.id) {
    if (!clip?.synthetic) return clip;
    const voice = data.voices.find(v => v.id === voiceId), variant = clip.variants[voiceId];
    if (!voice || !variant) throw new Error('这段材料暂时没有所选声线。');
    return { ...clip, ...variant, speaker: voice.label, voiceId, sourceUrl: data.generator.source };
  }
  const api = { voices: data.voices, clips: data.clips, current, choose, resolve, find: id => [...(root.HUMAN_AUDIO || []), ...data.clips].find(c => c.id === id) };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AudioVoices = api;
})(typeof window !== 'undefined' ? window : globalThis);
