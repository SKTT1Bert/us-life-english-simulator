const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
let playwright;
try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright')); }
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(content);
  });
});
const storageKey = 'daily-english-lab-state-v1';
const tests = [];
const run = async (name, fn) => { await fn(); tests.push(name); console.log(`PASS ${name}`); };

(async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  let launch = { headless: true };
  if (process.env.CHROMIUM_MODULE) {
    const imported = require(process.env.CHROMIUM_MODULE);
    const chromium = imported.default || imported;
    launch = { ...launch, executablePath: await chromium.executablePath(), args: chromium.args };
  }
  const browser = await playwright.chromium.launch(launch);
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const stored = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    await page.goto(url);
    await run('fresh home and stable new-item plan', async () => {
      assert.equal(await page.locator('#todayList .expr-card').count(), 5);
      const before = (await stored()).dailyPlan.ids;
      await page.locator('#todayList .learned-btn').first().click();
      assert.deepEqual((await stored()).dailyPlan.ids, before);
      assert.equal((await stored()).reviewSchedule[before[0]].independentSuccesses, 0);
    });
    await run('recall hides reference, hint blocks independent result, duplicate click guarded', async () => {
      await page.locator('[data-view="quiz"]').click();
      assert.equal(await page.locator('#recallReference').isVisible(), false);
      assert.equal(await page.locator('#choicePanel').isVisible(), false);
      await page.locator('#recallResponse').fill('PRIVATE_TEXT_SHOULD_NOT_BE_STORED');
      await page.locator('#recallConfidence').selectOption('high');
      await page.locator('#recallHintBtn').click();
      await page.locator('#revealRecallBtn').click();
      assert.equal(await page.locator('#recallIndependent').isDisabled(), true);
      await page.locator('[data-outcome="hinted"]').click();
      assert.equal((await stored()).practiceHistory.length, 1);
      await page.evaluate(() => finishRecall('hinted'));
      const data = await stored();
      assert.equal(data.practiceHistory.length, 1);
      assert.equal(data.practiceHistory[0].confidence, 'high');
      assert.equal(JSON.stringify(data).includes('PRIVATE_TEXT'), false);
    });
    await run('independent self-report and recognition have separate evidence', async () => {
      await page.locator('#nextRecallBtn').click();
      await page.locator('#revealRecallBtn').click();
      await page.locator('#recallIndependent').click();
      await page.locator('#practiceMode').selectOption('choice');
      await page.locator('.quiz-option').first().click();
      const data = await stored();
      assert.equal(data.practiceHistory.length, 3);
      assert.equal(data.practiceHistory[2].mode, 'choice');
      assert.equal(data.quiz.total, 1);
      await page.locator('[data-view="progress"]').click();
      assert.equal(await page.locator('#recalledMetric').textContent(), '1');
      assert.equal(await page.locator('#delayedMetric').textContent(), '0');
    });
    let exported;
    await run('v2 export preserves all state and typed-answer privacy', async () => {
      const download = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      exported = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
      assert.equal(exported.schemaVersion, 2);
      assert.equal(exported.practiceHistory.length, 3);
      assert.equal(exported.app, 'Daily English Lab');
      assert.equal(JSON.stringify(exported).includes('PRIVATE_TEXT'), false);
    });
    page.on('dialog', (dialog) => dialog.accept());
    const importData = async (data) => {
      const dialog = page.waitForEvent('dialog');
      await page.locator('#importInput').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
      await dialog;
    };
    await run('v2 import round-trip and malformed import is atomic', async () => {
      await importData(exported);
      assert.deepEqual((await stored()).practiceHistory, exported.practiceHistory);
      const before = await stored();
      await importData({ app: 'Daily English Lab', learned: ['one'], practiceHistory: [{}] });
      assert.deepEqual(await stored(), before);
    });
    await run('legacy import preserves marks and counters but invents no recall events', async () => {
      const id = exported.dailyPlan.ids[0];
      await importData({ app: 'Daily English Lab', learned: [id], favorites: [id], sessions: {}, quiz: { correct: 7, total: 9 }, theme: 'dark' });
      const data = await stored();
      assert.deepEqual(data.learned, [id]);
      assert.deepEqual(data.quiz, { correct: 7, total: 9 });
      assert.equal(data.practiceHistory.length, 0);
      assert.equal(data.reviewSchedule[id].delayedRecallSuccesses, 0);
      assert.equal(await page.locator('#dueReviewCount').textContent(), '1');
      assert.equal(await page.locator('#delayedMetric').textContent(), '0');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    });
    await run('next-day recall creates genuine delayed self-report', async () => {
      const data = await stored();
      const id = data.learned[0];
      const past = new Date(Date.now() - 2 * 86400000).toISOString();
      data.reviewSchedule[id].lastReviewedAt = past;
      data.reviewSchedule[id].lastOutcome = 'independent';
      data.reviewSchedule[id].lastMode = 'recall';
      data.reviewSchedule[id].independentSuccesses = 1;
      await importData(data);
      await page.locator('[data-view="today"]').click();
      await page.locator('#startReviewBtn').click();
      await page.locator('#revealRecallBtn').click();
      await page.locator('#recallIndependent').click();
      assert.equal((await stored()).reviewSchedule[id].delayedRecallSuccesses, 1);
      assert.equal(await page.locator('#delayedMetric').textContent(), '1');
    });
    await run('existing scenario and market modules still work', async () => {
      await page.locator('[data-view="scenarios"]').click();
      await page.locator('#startScenarioBtn').click();
      assert.ok(await page.locator('#choiceBox .choice-btn').count());
      await page.locator('#choiceBox .choice-btn').first().click();
      await page.locator('#scenarioBackBtn').click();
      await page.locator('[data-view="market"]').click();
      await page.locator('[data-market-tab="quiz"]').click();
      await page.locator('#newMarketQuizBtn').click();
      assert.ok(await page.locator('.market-quiz-option').count());
      await page.locator('.market-quiz-option').first().click();
      assert.equal((await stored()).marketQuiz.total, 1);
    });
    await run('reset clears v2 history and schedules along with legacy progress', async () => {
      await page.locator('[data-view="progress"]').click();
      await page.locator('#resetBtn').click();
      const data = await stored();
      assert.deepEqual(data.reviewSchedule, {});
      assert.deepEqual(data.practiceHistory, []);
      assert.deepEqual(data.learned, []);
      assert.equal(data.quiz.total, 0);
    });
    await run('mobile recall and progress do not overflow', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('[data-view="quiz"]').click();
      await page.locator('#practiceMode').selectOption('recall');
      await page.locator('#revealRecallBtn').click();
      const overflows = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(await overflows(), false);
      if (process.env.TEST_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'recall-mobile.png'), fullPage: true });
      }
      await page.locator('[data-view="progress"]').click();
      assert.equal(await overflows(), false);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator('[data-view="quiz"]').click();
      if (process.env.TEST_SCREENSHOT_DIR) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'recall-desktop.png'), fullPage: true });
      }
    });
    await run('no application runtime errors', async () => assert.deepEqual(errors, []));
    await run('corrupt local data remains intact and shows warning', async () => {
      const corrupt = await browser.newContext();
      const p = await corrupt.newPage();
      await p.addInitScript((key) => localStorage.setItem(key, 'corrupt-original'), storageKey);
      await p.goto(url);
      assert.equal(await p.locator('#storageNotice').isVisible(), true);
      assert.equal(await p.evaluate((key) => localStorage.getItem(key), storageKey), 'corrupt-original');
    });
    console.log(`${tests.length} browser integration checks passed.`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
