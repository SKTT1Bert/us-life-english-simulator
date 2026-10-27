(function (root) {
  'use strict';
  const normalize = text => String(text || '').replace(/\s+/g, ' ').trim();
  function createIndex(course, ai) {
    const index = new Map();
    for (const entry of course?.entries || []) for (const [voiceId, variant] of Object.entries(entry.variants)) {
      index.set(`${voiceId}\n${normalize(variant.spokenText)}`, { ...variant, voiceId, synthetic: true });
    }
    // Reuse the original listening recordings whenever their full text matches.
    for (const entry of ai?.clips || []) for (const [voiceId, variant] of Object.entries(entry.variants)) {
      const key = `${voiceId}\n${normalize(entry.text)}`;
      if (!index.has(key)) index.set(key, { ...variant, voiceId, synthetic: true });
    }
    return { find: (text, voiceId) => index.get(`${voiceId}\n${normalize(text)}`) || null };
  }
  if (typeof module === 'object' && module.exports) { module.exports = { normalize, createIndex }; return; }
  root.CourseAudio = createIndex(root.COURSE_AUDIO, root.AI_AUDIO);
})(typeof window !== 'undefined' ? window : globalThis);
