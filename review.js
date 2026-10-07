(function (root) {
  'use strict';

  const DAY = 24 * 60 * 60 * 1000;
  const INTERVAL_DAYS = [1, 3, 7, 14];
  const HISTORY_LIMIT = 5000;
  const OUTCOMES = ['independent', 'hinted', 'forgot', 'correct', 'incorrect'];
  const CONFIDENCE = ['low', 'medium', 'high'];
  const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const count = (value) => Number.isInteger(value) && value >= 0;
  const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const iso = (now) => new Date(now).toISOString();

  function emptyRecord(now, due = now) {
    return { stage: 0, firstSeenAt: iso(now), lastReviewedAt: null, nextDueAt: iso(due),
      lastOutcome: null, lastMode: null, independentSuccesses: 0, delayedRecallSuccesses: 0 };
  }

  function validateReviewData(saved, validIds) {
    if (!object(saved)) throw new Error('进度必须是 JSON 对象。');
    if (saved.schemaVersion !== undefined && ![1, 2].includes(saved.schemaVersion)) {
      throw new Error('不支持这个进度版本。');
    }
    if (saved.reviewSchedule !== undefined) {
      if (!object(saved.reviewSchedule)) throw new Error('复习记录格式不正确。');
      for (const [id, record] of Object.entries(saved.reviewSchedule)) {
        if (!validIds.has(id) || !object(record) || !Number.isInteger(record.stage) || record.stage < 0 || record.stage > 3
          || !validDate(record.firstSeenAt) || !validDate(record.nextDueAt)
          || !(record.lastReviewedAt === null || validDate(record.lastReviewedAt))
          || ![null, ...OUTCOMES].includes(record.lastOutcome)
          || ![null, 'recall', 'choice'].includes(record.lastMode)
          || !count(record.independentSuccesses) || !count(record.delayedRecallSuccesses)
          || record.delayedRecallSuccesses > record.independentSuccesses) {
          throw new Error('复习条目格式不正确。');
        }
      }
    }
    if (saved.practiceHistory !== undefined) {
      if (!Array.isArray(saved.practiceHistory) || saved.practiceHistory.length > HISTORY_LIMIT) {
        throw new Error('练习历史格式不正确或超过上限。');
      }
      const eventIds = new Set();
      for (const event of saved.practiceHistory) {
        if (!object(event) || typeof event.id !== 'string' || !event.id || eventIds.has(event.id)
          || !validIds.has(event.itemId) || !validDate(event.at)
          || !['choice', 'recall'].includes(event.mode)
          || !(event.mode === 'choice' ? ['correct', 'incorrect'] : ['independent', 'hinted', 'forgot']).includes(event.outcome)
          || typeof event.hintUsed !== 'boolean' || typeof event.delayed !== 'boolean'
          || ![null, ...CONFIDENCE].includes(event.confidence)
          || event.assessment !== (event.mode === 'recall' ? 'self-report' : 'answer-key')
          || (event.mode === 'choice' && (event.delayed || event.hintUsed))
          || (event.hintUsed && event.outcome === 'independent')) {
          throw new Error('练习事件格式不正确。');
        }
        eventIds.add(event.id);
      }
    }
  }

  function restore(saved, validIds, now = Date.now()) {
    validateReviewData(saved, validIds);
    const reviewSchedule = Object.fromEntries(Object.entries(saved.reviewSchedule || {}).map(([id, r]) => [id, { ...r }]));
    // Old learned marks remain marks; no recalled/delayed success is inferred.
    for (const id of saved.learned || []) {
      if (validIds.has(id) && !reviewSchedule[id]) reviewSchedule[id] = emptyRecord(now);
    }
    return { schemaVersion: 2, reviewSchedule, practiceHistory: (saved.practiceHistory || []).map((event) => ({ ...event })) };
  }

  function noteStudy(state, id, now = Date.now()) {
    if (!state.reviewSchedule[id]) state.reviewSchedule[id] = emptyRecord(now, now + DAY);
  }

  function dueItems(items, schedule, now = Date.now()) {
    return items.filter((item) => schedule[item.id] && Date.parse(schedule[item.id].nextDueAt) <= now)
      .sort((a, b) => Date.parse(schedule[a.id].nextDueAt) - Date.parse(schedule[b.id].nextDueAt));
  }

  function recordAttempt(state, id, { mode, outcome, hintUsed = false, confidence = null }, now = Date.now()) {
    if (!['choice', 'recall'].includes(mode)
      || !(mode === 'choice' ? ['correct', 'incorrect'] : ['independent', 'hinted', 'forgot']).includes(outcome)) {
      throw new Error('无效的练习结果。');
    }
    if (hintUsed && outcome === 'independent') outcome = 'hinted';
    const previous = state.reviewSchedule[id];
    const record = previous ? { ...previous } : emptyRecord(now);
    // Delay is measured from the preceding recall, not from a choice or manual mark.
    const delayed = mode === 'recall' && record.lastReviewedAt !== null
      && now - Date.parse(record.lastReviewedAt) >= DAY;
    if (mode === 'recall') {
      if (outcome === 'independent') {
        record.independentSuccesses += 1;
        if (delayed) {
          record.delayedRecallSuccesses += 1;
          record.stage = Math.min(record.stage + 1, INTERVAL_DAYS.length - 1);
        }
        // Repeating a success within one day must not postpone an existing due date.
        if (!previous || delayed || record.lastOutcome !== 'independent') {
          record.nextDueAt = iso(now + INTERVAL_DAYS[record.stage] * DAY);
        }
      } else {
        record.stage = 0;
        record.nextDueAt = iso(now + (outcome === 'forgot' ? 10 * 60 * 1000 : DAY));
      }
      record.lastReviewedAt = iso(now);
      record.lastOutcome = outcome;
      record.lastMode = mode;
    } else if (!previous) {
      // Recognition starts a queue, but cannot promote recall evidence.
      record.nextDueAt = iso(now + DAY);
      record.lastOutcome = outcome;
      record.lastMode = mode;
    }
    state.reviewSchedule[id] = record;
    const event = { id: `${now}-${Math.random().toString(36).slice(2)}`, itemId: id, at: iso(now), mode, outcome,
      hintUsed: Boolean(hintUsed), confidence: CONFIDENCE.includes(confidence) ? confidence : null,
      delayed, assessment: mode === 'recall' ? 'self-report' : 'answer-key' };
    state.practiceHistory.push(event);
    if (state.practiceHistory.length > HISTORY_LIMIT) state.practiceHistory.splice(0, state.practiceHistory.length - HISTORY_LIMIT);
    return event;
  }

  function summary(schedule, history) {
    const records = Object.values(schedule);
    const choices = history.filter((e) => e.mode === 'choice');
    const recalls = history.filter((e) => e.mode === 'recall');
    const delayed = recalls.filter((e) => e.delayed);
    return { recalledItems: records.filter((r) => r.independentSuccesses > 0).length,
      delayedItems: records.filter((r) => r.delayedRecallSuccesses > 0).length,
      choiceTotal: choices.length, choiceCorrect: choices.filter((e) => e.outcome === 'correct').length,
      recallTotal: recalls.length, recallIndependent: recalls.filter((e) => e.outcome === 'independent').length,
      delayedTotal: delayed.length, delayedIndependent: delayed.filter((e) => e.outcome === 'independent').length };
  }

  const api = { DAY, INTERVAL_DAYS, HISTORY_LIMIT, restore, validateReviewData, noteStudy, dueItems, recordAttempt, summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ReviewEngine = api;
})(typeof window !== 'undefined' ? window : null);
