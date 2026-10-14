const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../translator.js'), 'utf8');
const flush = () => new Promise((resolve) => setImmediate(resolve));

function harness(fetch) {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { value: '', textContent: '', disabled: false,
      handlers: {}, addEventListener(event, handler) { this.handlers[event] = handler; },
      focus() {}, select() {} });
    return elements.get(id);
  };
  const timers = new Map();
  let next = 0;
  let copied = null;
  vm.runInNewContext(source, { document: {getElementById: element}, fetch,
    navigator: {clipboard: {writeText: async (text) => {copied = text;}}}, AbortController,
    setTimeout(fn, ms) {timers.set(++next, {fn, ms}); return next;},
    clearTimeout(id) {timers.delete(id);} });
  return {element, timers, copied: () => copied};
}

test('offline startup checks health once and leaves no background retry', async () => {
  const calls = [];
  const app = harness(async (url) => {calls.push(url); throw new Error('offline');});
  await flush();
  assert.equal(calls.length, 1);
  assert.ok(calls[0].endsWith('/health'));
  assert.equal(app.element('translatorStatus').textContent, 'Offline');
  assert.equal(app.timers.size, 0);
  assert.equal(app.element('translateBtn').disabled, false);
});

test('translation sends plain text only, allows copy, and stops operation polling', async () => {
  const calls = [];
  const app = harness(async (url, options) => {
    calls.push({url, options});
    return {ok: true, json: async () => url.endsWith('/health')
      ? {service: 'daily-english-local-translator', state: 'Ready'}
      : {text: 'I may arrive a little late today.', state: 'Loaded'}};
  });
  await flush();
  app.element('translatorInput').value = '我今天可能会晚一点到。';
  await app.element('translateBtn').handlers.click();
  assert.equal(app.element('translatorStatus').textContent, 'Loaded');
  assert.deepEqual(JSON.parse(calls[1].options.body), {text: '我今天可能会晚一点到。'});
  assert.equal(app.element('translatorCopy').disabled, false);
  await app.element('translatorCopy').handlers.click();
  assert.equal(app.copied(), 'I may arrive a little late today.');
  assert.equal(app.timers.size, 0);
});

test('backend errors clear stale output and do not imply success', async () => {
  const app = harness(async (url) => ({ok: url.endsWith('/health'), json: async () =>
    url.endsWith('/health') ? {service: 'daily-english-local-translator', state: 'Ready'}
      : {detail: 'Missing model'}}));
  await flush();
  app.element('translatorInput').value = '你好';
  app.element('translatorOutput').value = 'old translation';
  await app.element('translateBtn').handlers.click();
  assert.equal(app.element('translatorStatus').textContent, 'Error');
  assert.equal(app.element('translatorOutput').value, '');
  assert.equal(app.element('translatorCopy').disabled, true);
  assert.equal(app.element('translatorInput').disabled, false);
  assert.equal(app.timers.size, 0);
});
