// Isolated browser profiles and synthetic records only. Speech and sync transport
// are explicit fixtures; this suite does not measure audio quality or production API health.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, storageKey } = require('./browser-helpers.cjs');
const API = 'https://daily-english-private-sync.feyloom36.chatgpt.site/api/sync';
const DEPLOYED_APP = process.env.STUDIO_PRODUCTION === '1';
const PRODUCTION = 'https://sktt1bert.github.io/us-life-english-simulator/';
if (DEPLOYED_APP) assert.notEqual(process.env.TEST_OFFLINE_FIXTURE, '1', 'Production frontend verification requires real HTTP assets.');

(async () => {
  const app = await startApp(), checks = [], errors = [], rooms = new Map();
  // Production mode reads the published HTML/JS/CSS without intercepting app
  // assets. The cloud transport below remains an explicit in-memory fixture.
  const baseURL = DEPLOYED_APP ? PRODUCTION : app.url;
  const screenshotDir = process.env.TEST_SCREENSHOT_DIR;
  if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
  const run = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };
  const contexts = [];
  async function createPage() {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    contexts.push(context);
    await context.route(`${API}/**`, async (route) => {
      const request = route.request(), method = request.method(), key = new URL(request.url()).pathname.split('/').at(-1);
      const headers = { 'access-control-allow-origin': new URL(baseURL).origin, 'access-control-allow-methods': 'GET,POST,PUT,OPTIONS', 'access-control-allow-headers': 'authorization,content-type', 'content-type': 'application/json' };
      const send = (status, data) => route.fulfill({ status, headers, body: data === undefined ? '' : JSON.stringify(data) });
      if (method === 'OPTIONS') return send(204);
      const existing = rooms.get(key), auth = request.headers().authorization;
      if (existing && existing.auth !== auth) return send(403, { error: 'forbidden' });
      if (method === 'GET') return existing ? send(200, { revision: existing.revision, document: existing.document }) : send(404, { error: 'not_found' });
      const body = request.postDataJSON();
      if (method === 'POST') {
        if (existing) return send(409, { error: 'revision_conflict' });
        rooms.set(key, { auth, revision: 1, document: body.document }); return send(201, { revision: 1 });
      }
      if (!existing) return send(404, { error: 'not_found' });
      if (body.expectedRevision !== existing.revision) return send(409, { error: 'revision_conflict' });
      existing.document = body.document; existing.revision++; return send(200, { revision: existing.revision });
    });
    await context.addInitScript(() => localStorage.setItem('daily-english-speech-mode-v1', 'device'));
    const page = await context.newPage(); page.on('pageerror', (error) => errors.push(error.message));
    const dialogs = []; let dismissNext = false;
    page.on('dialog', async (dialog) => { dialogs.push(dialog.message()); if (dismissNext) { dismissNext = false; await dialog.dismiss(); } else await dialog.accept(); });
    page.dismissNextDialog = () => { dismissNext = true; };
    page.dialogMessages = dialogs;
    const response = await page.goto(baseURL);
    assert.equal(response.status(), 200); assert.equal(new URL(page.url()).origin, new URL(baseURL).origin);
    await page.waitForFunction(() => Boolean(window.dailyEnglishStudioReady));
    assert.equal(await page.evaluate(() => dailyEnglishStudioReady), true);
    await page.evaluate(async () => { await dailyEnglishSyncReady; dailyEnglishSync.stop(); });
    return page;
  }
  const saved = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
  const payload = (page) => page.evaluate(() => JSON.parse(JSON.stringify(progressPayload())));
  const view = async (page, name) => {
    if (['report', 'diagnostic', 'progress'].includes(name)) await page.locator('[data-nav-group="personal"]').click();
    else if (name === 'listening') await page.locator('[data-nav-group="practice"]').click();
    await page.locator(`[data-view="${name}"]`).first().click();
    if (name === 'listening') await page.locator('#listeningSource').selectOption('course');
  };
  const upload = async (page, value, confirm = true) => {
    await view(page, 'progress');
    await page.locator('#importInput').setInputFiles({ name: 'studio-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
    if (confirm) { await page.locator('#importDialog').waitFor({ state: 'visible' }); await page.locator('#confirmImportBtn').click(); await page.locator('#importDialog').waitFor({ state: 'hidden' }); }
  };
  const prefs = async (page, values) => {
    await view(page, 'today');
    for (const [key, value] of Object.entries(values)) await page.locator(`#coach${key}`).selectOption(String(value));
    await page.getByRole('button', { name: '更新计划', exact: true }).click();
  };
  const failStorage = (page) => page.evaluate((key) => {
    window.__originalStudioSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('fixture full', 'QuotaExceededError'); return window.__originalStudioSetItem.call(this, name, value); };
  }, storageKey);
  const restoreStorage = (page) => page.evaluate(() => { Storage.prototype.setItem = window.__originalStudioSetItem; delete window.__originalStudioSetItem; });
  const stopSync = (page) => page.evaluate(async () => { await dailyEnglishSyncReady; dailyEnglishSync.stop(); });
  const sync = (page) => page.evaluate(async () => { const ok = await dailyEnglishSync.sync(); const status = dailyEnglishSync.status(); dailyEnglishSync.stop(); return { ok, status }; });
  const lastDiagnostic = async (page) => {
    while (await page.getByRole('button', { name: '下一题', exact: true }).count()) await page.getByRole('button', { name: '下一题', exact: true }).click();
  };
  try {
    const page = await createPage(); let old;
    await run('legacy progress imports with unchanged quiz, learned marks and original course answers', async () => {
      old = await page.evaluate(() => {
        const p = progressPayload(); p.learned = [EXPRESSIONS[0].id]; p.quiz = { correct: 2, total: 3 };
        const lesson = FOUNDATION_CATALOG['word-parts'][0];
        p.foundationProgress = FoundationProgress.answer(p.foundationProgress, FOUNDATION_CATALOG, 'word-parts', lesson.id, 0, lesson.quizzes[0].answer);
        delete p.learningStudio; return p;
      });
      await upload(page, old);
      const after = await payload(page);
      for (const key of ['learned', 'quiz', 'foundationProgress']) assert.deepEqual(after[key], old[key]);
      assert.deepEqual(after.learningStudio.diagnostics, []); assert.deepEqual(after.learningStudio.listeningAttempts, []);
      assert.equal(await page.locator('[data-nav-group]').count(), 4);
    });
    await run('5/10/20 minute plans persist; purpose changes real tasks without changing prior evidence', async () => {
      for (const minutes of [5, 10, 20]) {
        await prefs(page, { Minutes: minutes, Level: 'b1', Goal: 'everyday' });
        assert.equal((await saved(page)).learningStudio.preferences.minutes, minutes);
        const budget = await page.evaluate(() => LearningCoach.buildPlan(progressPayload(), { pathway: PATHWAY_CATALOG, foundation: FOUNDATION_CATALOG, expressions: learningExpressions() }));
        assert.ok(budget.plannedMinutes <= minutes);
      }
      await prefs(page, { Goal: 'academic' }); const academic = await page.locator('.coach-tasks').innerText();
      await prefs(page, { Goal: 'work' }); const work = await page.locator('.coach-tasks').innerText();
      assert.notEqual(academic, work);
      await page.reload(); await page.evaluate(() => dailyEnglishStudioReady);
      assert.equal(await page.locator('#coachMinutes').inputValue(), '20'); assert.equal(await page.locator('#coachGoal').inputValue(), 'work');
      assert.deepEqual((await saved(page)).quiz, old.quiz);
    });
    await run('failed preference save keeps the old record and dirty choices can be explicitly discarded', async () => {
      const before = (await saved(page)).learningStudio.preferences;
      await page.locator('#coachMinutes').selectOption('5'); await failStorage(page);
      await page.getByRole('button', { name: '更新计划', exact: true }).click();
      assert.deepEqual((await saved(page)).learningStudio.preferences, before);
      assert.equal(await page.locator('#coachMinutes').inputValue(), '5');
      assert.equal(await page.evaluate(() => LearningCoach.hasPendingWork()), true);
      await restoreStorage(page); await page.getByRole('button', { name: '放弃设置修改', exact: true }).click();
      assert.equal(await page.locator('#coachMinutes').inputValue(), '20'); assert.equal(await page.evaluate(() => LearningCoach.hasPendingWork()), false);
    });
    await run('diagnostic back, skip and cancelled submission preserve answers; failed save retains the attempt', async () => {
      await view(page, 'diagnostic'); await page.getByRole('button', { name: '开始起点诊断', exact: true }).click();
      await page.locator('input[name="learning-diagnostic-answer"]').first().check();
      await page.getByRole('button', { name: '下一题', exact: true }).click();
      await page.getByRole('button', { name: '这题暂时不会', exact: true }).click();
      await page.getByRole('button', { name: '上一题', exact: true }).click();
      assert.equal(await page.locator('input[name="learning-diagnostic-answer"]:checked').count(), 0);
      await page.getByRole('button', { name: '上一题', exact: true }).click();
      assert.equal(await page.locator('input[name="learning-diagnostic-answer"]').first().isChecked(), true);
      await lastDiagnostic(page); page.dismissNextDialog(); await page.getByRole('button', { name: '提交起点诊断', exact: true }).click();
      assert.equal(await page.evaluate(() => LearningDiagnostic.hasPendingWork()), true);
      assert.equal((await saved(page)).learningStudio.diagnostics.length, 0);
      await failStorage(page); await page.getByRole('button', { name: '提交起点诊断', exact: true }).click();
      assert.match(await page.locator('.diagnostic-feedback').innerText(), /尚未保存|无法保存/);
      assert.equal((await saved(page)).learningStudio.diagnostics.length, 0);
      await restoreStorage(page); await page.getByRole('button', { name: '提交起点诊断', exact: true }).click();
      assert.equal((await saved(page)).learningStudio.diagnostics.length, 1);
      assert.equal((await saved(page)).learningStudio.diagnostics[0].answers.filter((answer) => answer !== null).length, 1);
      assert.equal(await page.evaluate(() => LearningDiagnostic.hasPendingWork()), false);
    });
    await run('diagnostic results and older attempts remain available after reload without inventing course completion', async () => {
      await page.reload(); await page.evaluate(() => dailyEnglishStudioReady); await view(page, 'diagnostic');
      assert.match(await page.locator('.diagnostic-result-title').innerText(), /Pre-A1/);
      await page.getByRole('button', { name: '重新做一次诊断', exact: true }).click();
      await page.locator('input[name="learning-diagnostic-answer"]').nth(1).check(); await lastDiagnostic(page);
      await page.getByRole('button', { name: '提交起点诊断', exact: true }).click();
      assert.equal(await page.getByLabel('已保存的诊断').locator('option').count(), 2);
      const records = (await saved(page)).learningStudio.diagnostics;
      await page.getByLabel('已保存的诊断').selectOption(records[0].id);
      assert.match(await page.locator('.learning-diagnostic').innerText(), /本次作答 1 \/ 24/);
      assert.deepEqual((await saved(page)).foundationProgress, old.foundationProgress);
    });
    let firstSegment;
    await run('all 48 listening materials are reachable through six stage filters and missing audio has a clear fallback', async () => {
      await view(page, 'listening');
      assert.equal(await page.evaluate(() => ListeningLab.catalog(PATHWAY_CATALOG).length), 48);
      for (const level of ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1']) {
        await page.locator('#listeningLevel').selectOption(level);
        assert.equal(await page.locator('#listeningLesson option').count(), 8);
      }
      await page.locator('#listeningLevel').selectOption('pre-a1');
      firstSegment = await page.evaluate(() => ListeningLab.catalog(PATHWAY_CATALOG)[0].segments[0]);
      await page.evaluate(() => { speechSynthesis.getVoices = () => []; });
      await page.getByRole('button', { name: '播放这一句', exact: true }).click();
      assert.match(await page.locator('.listening-audio-status').innerText(), /英文朗读声音|不支持/);
      assert.equal(await page.locator('.listening-transcript').count(), 0);
    });
    await run('assisted listening saves only result data and keeps records across retry and reload', async () => {
      await page.locator('#listeningReveal').click(); await page.locator('#listeningInput').fill(firstSegment.text);
      await page.locator('#listeningCheck').click(); await page.locator('input[name="listeningShadow"][value="supported"]').check();
      await page.locator('#listeningSave').click();
      const entry = (await saved(page)).learningStudio.listeningAttempts.at(-1);
      assert.equal(entry.exact, true); assert.equal(entry.revealed, true); assert.equal(entry.listenCount, 0);
      assert.deepEqual(Object.keys(entry).sort(), ['id', 'answeredAt', 'lessonId', 'segmentId', 'matchedTokens', 'tokenCount', 'exact', 'revealed', 'shadow', 'listenCount'].sort());
      assert.equal(await page.locator('.listening-history li').count(), 1);
      await page.locator('#listeningRetry').click(); assert.equal(await page.locator('#listeningInput').inputValue(), '');
      assert.equal((await saved(page)).learningStudio.listeningAttempts.length, 1);
      await page.reload(); await page.evaluate(() => dailyEnglishStudioReady); await view(page, 'listening');
      await page.locator('#listeningLevel').selectOption('pre-a1');
      assert.equal(await page.locator('.listening-history li').count(), 1);
    });
    await run('explicit speech fixture, exact dictation and self-reported shadowing survive storage failure', async () => {
      await page.evaluate(() => {
        speechSynthesis.getVoices = () => [{ lang: 'en-US', name: 'Synthetic test voice' }];
        speechSynthesis.cancel = () => {};
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        speechSynthesis.speak = (utterance) => { utterance.onstart?.(); setTimeout(() => utterance.onend?.(), 5); };
      });
      await page.getByRole('button', { name: '播放这一句', exact: true }).click();
      await page.locator('#listeningInput').fill(firstSegment.text); await page.locator('#listeningCheck').click();
      await page.locator('input[name="listeningShadow"][value="independent"]').check();
      await failStorage(page); await page.locator('#listeningSave').click();
      assert.match(await page.locator('#listeningSaveStatus').innerText(), /保存失败/);
      assert.equal(await page.locator('#listeningInput').inputValue(), firstSegment.text);
      assert.equal((await saved(page)).learningStudio.listeningAttempts.length, 1);
      await restoreStorage(page); await page.locator('#listeningSave').click();
      const entry = (await saved(page)).learningStudio.listeningAttempts.at(-1);
      assert.equal(entry.listenCount, 1); assert.equal(entry.revealed, false); assert.equal(entry.exact, true); assert.equal(entry.shadow, 'independent');
      await page.locator('#listeningDifficultOnly').check(); assert.match(await page.locator('.listening-empty').innerText(), /没有需要再练/);
      await page.locator('#listeningDifficultOnly').uncheck();
    });
    await run('learning report uses saved evidence and its lesson, review and listening actions open the real views', async () => {
      await view(page, 'report');
      assert.match(await page.locator('.coach-report').innerText(), /已保存 2 次句子练习/);
      assert.match(await page.locator('.coach-report').innerText(), /1 句已播放、未看原文且听写全对/);
      await page.getByRole('button', { name: '去逐句精听 →', exact: true }).click();
      assert.equal(await page.locator('#view-listening').isVisible(), true);
      await view(page, 'report'); await page.getByRole('button', { name: '去复习表达 →', exact: true }).click();
      assert.equal(await page.locator('#view-quiz').isVisible(), true);
      await view(page, 'report'); await page.locator('.coach-next').last().click();
      assert.equal(await page.locator('#view-pathway').isVisible(), true);
    });
    let exported;
    await run('exports restore new study records in an independent profile and malformed studio data cannot replace them', async () => {
      const download = page.waitForEvent('download'); await page.locator('#exportBtn').click();
      exported = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
      assert.equal(exported.learningStudio.diagnostics.length, 2); assert.equal(exported.learningStudio.listeningAttempts.length, 2);
      const restored = await createPage(); await upload(restored, exported);
      assert.deepEqual((await saved(restored)).learningStudio, exported.learningStudio);
      const bad = structuredClone(exported); bad.learningStudio.listeningAttempts[0].segmentId = 'unknown';
      const before = await saved(restored);
      // Exercise asynchronous import explicitly: a closed preview dialog alone
      // is not evidence that FileReader has finished rejecting the new file.
      await restored.evaluate(() => {
        const readAsText = FileReader.prototype.readAsText;
        window.__restoreStudioFileReader = () => { FileReader.prototype.readAsText = readAsText; delete window.__restoreStudioFileReader; };
        FileReader.prototype.readAsText = function (...args) { setTimeout(() => readAsText.apply(this, args), 50); };
      });
      try {
        const rejected = restored.waitForEvent('dialog', { predicate: (dialog) => dialog.type() === 'alert' && dialog.message().includes('导入失败') });
        await upload(restored, bad, false);
        const error = await rejected;
        assert.match(error.message(), /导入失败.*原有进度未改变/);
        assert.equal(await restored.locator('#importDialog').isVisible(), false);
        assert.deepEqual(await saved(restored), before);
      } finally { await restored.evaluate(() => window.__restoreStudioFileReader()); }
      await restored.close();
    });
    await run('an unsubmitted preference draft defers incoming sync; discarding it applies cloud choices and preserves records', async () => {
      await view(page, 'progress');
      assert.equal(await page.evaluate(async () => { const result = await dailyEnglishSync.create(); dailyEnglishSync.stop(); return result; }), true);
      const code = await page.evaluate(() => dailyEnglishSync.code());
      const remote = await createPage(); await view(remote, 'progress');
      assert.equal(await remote.evaluate(async (value) => { const result = await dailyEnglishSync.connect(value); dailyEnglishSync.stop(); return result; }, code), true);
      await stopSync(page); await stopSync(remote);
      await view(page, 'today'); await page.locator('#coachMinutes').selectOption('5'); await view(page, 'progress'); await stopSync(page);
      await prefs(remote, { Goal: 'academic' }); await stopSync(remote); assert.equal((await sync(remote)).ok, true);
      const pending = await sync(page); assert.equal(pending.status.pendingApply, true);
      assert.equal((await saved(page)).learningStudio.preferences.goal, 'work');
      await view(page, 'today'); assert.equal(await page.locator('#coachMinutes').inputValue(), '5');
      await page.getByRole('button', { name: '放弃设置修改', exact: true }).click(); await stopSync(page);
      assert.equal((await sync(page)).ok, true);
      assert.equal((await saved(page)).learningStudio.preferences.goal, 'academic');
      assert.equal((await saved(page)).learningStudio.preferences.minutes, 20);
      assert.equal((await saved(page)).learningStudio.listeningAttempts.length, 2);
      await page.evaluate(async () => { await dailyEnglishSync.disconnect(); });
      await remote.evaluate(async () => { await dailyEnglishSync.disconnect(); }); await remote.close();
    });
    await run('import clears an unsaved preference draft and keeps the imported settings', async () => {
      await view(page, 'today'); await page.locator('#coachMinutes').selectOption('5');
      assert.equal(await page.evaluate(() => LearningCoach.hasPendingWork()), true);
      await upload(page, exported); await view(page, 'today');
      assert.equal(await page.evaluate(() => LearningCoach.hasPendingWork()), false);
      assert.equal(await page.locator('#coachMinutes').inputValue(), '20');
      assert.equal(await page.locator('#coachGoal').inputValue(), 'work');
    });
    await run('new study screens fit 320px, mobile portrait and landscape in light, dark and pink themes', async () => {
      for (const sample of [{ width: 320, height: 740, theme: 'dark', view: 'today' }, { width: 390, height: 844, theme: 'pink', view: 'report' }, { width: 844, height: 390, theme: 'light', view: 'listening' }, { width: 320, height: 740, theme: 'light', view: 'diagnostic' }]) {
        await page.setViewportSize({ width: sample.width, height: sample.height });
        await page.evaluate((theme) => { state.theme = theme; applyTheme(); }, sample.theme); await view(page, sample.view);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${sample.width}px ${sample.view} overflow`);
        assert.ok(await page.locator(`#view-${sample.view}`).isVisible());
        if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `studio-${sample.view}-${sample.width}-${sample.theme}.png`), fullPage: true });
      }
    });
    assert.deepEqual(errors, []);
    console.log(`\n${checks.length} learning studio browser checks passed against the ${DEPLOYED_APP ? 'DEPLOYED frontend (real HTTP assets)' : 'local frontend'}. Speech and cloud transport were fixtures; records were synthetic. This does not verify production API health or real audio quality.`);
  } finally { for (const context of contexts) await context.close().catch(() => {}); await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
