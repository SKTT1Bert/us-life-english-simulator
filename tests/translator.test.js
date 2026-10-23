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
  const editors = [];
  vm.runInNewContext(source, { document: {getElementById: element}, fetch,
    navigator: {clipboard: {writeText: async (text) => {copied = text;}}}, AbortController,
    openExpressionEditor(record) { editors.push(record); },
    setTimeout(fn, ms) {timers.set(++next, {fn, ms}); return next;},
    clearTimeout(id) {timers.delete(id);} });
  return {element, timers, copied: () => copied, editors};
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
  assert.equal(app.element('translatorSave').disabled, true);
  assert.equal(app.element('translatorInput').disabled, false);
  assert.equal(app.timers.size, 0);
});

test('saving a translation opens a confirmation editor with the original request and never auto-saves', async () => {
  const app = harness(async (url) => ({ok: true, json: async () => url.endsWith('/health')
    ? {service: 'daily-english-local-translator', state: 'Ready'} : {text: 'Could we reschedule?', state: 'Loaded'}}));
  await flush();
  app.element('translatorInput').value = '我们可以改时间吗？';
  await app.element('translateBtn').handlers.click();
  assert.equal(app.editors.length, 0);
  assert.equal(app.element('translatorSave').disabled, false);
  app.element('translatorInput').value = '后来修改的另一个问题';
  app.element('translatorSave').handlers.click();
  assert.equal(app.editors[0].phrase, 'Could we reschedule?');
  assert.equal(app.editors[0].meaning_cn, '我们可以改时间吗？');
  assert.equal(app.editors[0].provenance, 'model-assisted');
});

test('a late startup health response cannot overwrite a completed translation status', async () => {
  let finishHealth;
  const app = harness(async (url) => url.endsWith('/health')
    ? new Promise((resolve) => { finishHealth = resolve; })
    : {ok: true, json: async () => ({text: 'Hello.', state: 'Loaded'})});
  app.element('translatorInput').value = '你好';
  await app.element('translateBtn').handlers.click();
  finishHealth({ok: true, json: async () => ({service: 'daily-english-local-translator', state: 'Ready'})});
  await flush();
  assert.equal(app.element('translatorStatus').textContent, 'Loaded');
  assert.equal(app.element('translatorSave').disabled, false);
});
