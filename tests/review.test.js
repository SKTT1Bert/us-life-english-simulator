const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../review.js');
const now = Date.parse('2026-10-07T12:00:00Z');
const ids = new Set(['one', 'two', 'three']);
const fresh = () => R.restore({}, ids, now);

test('legacy marks migrate to due items without fabricated evidence', () => {
  const state = R.restore({ learned: ['one'], quiz: { correct: 9, total: 10 } }, ids, now);
  assert.equal(state.schemaVersion, 2);
  assert.equal(state.reviewSchedule.one.nextDueAt, new Date(now).toISOString());
  assert.equal(state.reviewSchedule.one.lastReviewedAt, null);
  assert.equal(R.summary(state.reviewSchedule, state.practiceHistory).delayedItems, 0);
  assert.deepEqual(state.practiceHistory, []);
});

test('reading starts next-day review but supplies no recall evidence', () => {
  const state = fresh();
  R.noteStudy(state, 'one', now);
  assert.equal(Date.parse(state.reviewSchedule.one.nextDueAt), now + R.DAY);
  assert.equal(state.reviewSchedule.one.independentSuccesses, 0);
});

test('first success and same-day repeats cannot advance spacing or postpone due date', () => {
  const state = fresh();
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, now);
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, now + 60000);
  assert.equal(state.reviewSchedule.one.stage, 0);
  assert.equal(Date.parse(state.reviewSchedule.one.nextDueAt), now + R.DAY);
  assert.equal(state.reviewSchedule.one.delayedRecallSuccesses, 0);
  assert.equal(state.practiceHistory[1].delayed, false);
});

test('delayed successes progress through 3, 7, and 14 days with a cap', () => {
  const state = fresh();
  let time = now;
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, time);
  for (const days of [3, 7, 14, 14]) {
    time = Date.parse(state.reviewSchedule.one.nextDueAt);
    const event = R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, time);
    assert.equal(event.delayed, true);
    assert.equal(Date.parse(state.reviewSchedule.one.nextDueAt), time + days * R.DAY);
  }
  assert.equal(state.reviewSchedule.one.delayedRecallSuccesses, 4);
});

test('hints cannot be logged as independent; forgetting triggers ten-minute retry', () => {
  const state = fresh();
  const event = R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent', hintUsed: true }, now);
  assert.equal(event.outcome, 'hinted');
  assert.equal(state.reviewSchedule.one.independentSuccesses, 0);
  assert.equal(Date.parse(state.reviewSchedule.one.nextDueAt), now + R.DAY);
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'forgot' }, now + 1000);
  assert.equal(Date.parse(state.reviewSchedule.one.nextDueAt), now + 601000);
});

test('choice answers preserve recall schedule and never count as delayed recall', () => {
  const state = fresh();
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, now);
  const before = { ...state.reviewSchedule.one };
  R.recordAttempt(state, 'one', { mode: 'choice', outcome: 'correct' }, now + 4 * R.DAY);
  assert.deepEqual(state.reviewSchedule.one, before);
  assert.equal(state.practiceHistory[1].delayed, false);
  assert.equal(R.summary(state.reviewSchedule, state.practiceHistory).delayedItems, 0);
});

test('due queue is chronological and excludes future or unknown items', () => {
  const state = fresh();
  R.noteStudy(state, 'one', now);
  R.recordAttempt(state, 'two', { mode: 'recall', outcome: 'forgot' }, now);
  assert.deepEqual(R.dueItems([{ id: 'one' }, { id: 'two' }, { id: 'three' }], state.reviewSchedule, now + R.DAY).map((i) => i.id), ['two', 'one']);
});

test('v2 round-trip preserves history and evidence', () => {
  const state = fresh();
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent', confidence: 'high' }, now);
  const restored = R.restore(JSON.parse(JSON.stringify(state)), ids, now + R.DAY);
  assert.deepEqual(restored, state);
});

test('malformed imports reject unknown IDs, impossible evidence, and duplicate events', () => {
  const state = fresh();
  R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'forgot' }, now);
  assert.throws(() => R.restore({ schemaVersion: 99 }, ids, now));
  assert.throws(() => R.restore({ reviewSchedule: [] }, ids, now));
  assert.throws(() => R.restore({ reviewSchedule: { alien: state.reviewSchedule.one } }, ids, now));
  assert.throws(() => R.restore({ reviewSchedule: { one: { ...state.reviewSchedule.one, delayedRecallSuccesses: 100 } } }, ids, now));
  assert.throws(() => R.restore({ practiceHistory: [state.practiceHistory[0], state.practiceHistory[0]] }, ids, now));
});

test('history retention is bounded without discarding aggregate item evidence', () => {
  const state = fresh();
  for (let i = 0; i < R.HISTORY_LIMIT + 1; i++) R.recordAttempt(state, 'one', { mode: 'recall', outcome: 'independent' }, now + i);
  assert.equal(state.practiceHistory.length, R.HISTORY_LIMIT);
  assert.equal(state.reviewSchedule.one.independentSuccesses, R.HISTORY_LIMIT + 1);
  assert.equal(Date.parse(state.practiceHistory[0].at), now + 1);
});
