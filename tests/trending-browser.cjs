const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, navigate, storageKey } = require('./browser-helpers.cjs');

(async () => {
  const app = await startApp();
  const tests = [];
  const run = async (name, fn) => { await fn(); tests.push(name); console.log(`PASS ${name}`); };
  try {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    const stored = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    await page.goto(app.url);
    const pack = await page.evaluate(() => window.TRENDING_EXPRESSIONS);
    const ids = new Set(pack.map((item) => item.id));
    let selected;

    await run('new daily plans feature a contemporary expression without increasing the five-item workload', async () => {
      const data = await stored();
      assert.equal(data.dailyPlan.ids.length, 5);
      assert.ok(data.dailyPlan.ids.some((id) => ids.has(id)));
      selected = pack.find((item) => item.id === data.dailyPlan.ids.find((id) => ids.has(id)));
      assert.equal(await page.locator(`#todayList [data-id="${selected.id}"] .expression-usage`).count(), 1);
      assert.equal(await page.locator('.primary-nav-btn').count(), 4);
    });

    await run('an existing v2 same-day plan stays pinned through the content update and later interactions', async () => {
      const existing = await app.newContext();
      const oldPage = await existing.newPage();
      const data = await stored();
      const pinned = await page.evaluate(() => window.EXPRESSIONS.slice(0, 5).map((item) => item.id));
      data.schemaVersion = 2;
      data.dailyPlan.ids = pinned;
      delete data.customExpressions;
      delete data.deletedCustomExpressions;
      await oldPage.addInitScript(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: storageKey, data });
      await oldPage.goto(app.url);
      assert.deepEqual(await oldPage.locator('#todayList .expr-card').evaluateAll((cards) => cards.map((card) => card.dataset.id)), pinned);
      await oldPage.locator('#todayList .fav-btn').first().click();
      const after = await oldPage.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
      assert.deepEqual(after.dailyPlan.ids, pinned);
      assert.equal(after.schemaVersion, 3);
      await existing.close();
    });

    await run('browse shortcut resets unrelated filters and opens the existing expression library', async () => {
      await navigate(page, 'library');
      await page.locator('#expressionSource').selectOption('custom');
      await page.locator('#searchInput').fill('unrelated search');
      await page.locator('#levelFilter').selectOption('A1');
      await navigate(page, 'today');
      await page.locator('#browseTrendingBtn').click();
      assert.equal(await page.locator('#view-library').isVisible(), true);
      assert.equal(await page.locator('#expressionSource').inputValue(), 'all');
      assert.equal(await page.locator('#searchInput').inputValue(), '');
      assert.equal(await page.locator('#levelFilter').inputValue(), 'all');
      assert.equal(await page.locator('#categoryFilter').inputValue(), '流行口语');
      assert.equal(await page.locator('#libraryList .expr-card').count(), pack.length);
      const item = page.locator(`#libraryList .expr-card[data-id="${selected.id}"]`);
      assert.ok((await item.locator('.expression-usage').textContent()).includes(selected.usage_note));
      assert.equal(await item.locator('.usage-source').getAttribute('open'), null);
      await item.locator('.usage-source summary').click();
      assert.equal(await item.locator('.usage-source a').getAttribute('href'), selected.source_url);
      assert.ok((await item.locator('.usage-source').textContent()).includes(selected.verified_at));
    });

    await run('recall keeps usage guidance hidden until reveal and records the new expression normally', async () => {
      const item = page.locator(`#libraryList .expr-card[data-id="${selected.id}"]`);
      await item.locator('.fav-btn').click();
      await item.locator('.recall-btn').click();
      assert.equal(await page.locator('#recallReference').isVisible(), false);
      assert.equal(await page.locator('#recallReference .expression-usage').count(), 0);
      assert.equal(await page.locator('#view-quiz .expression-usage:visible').count(), 0);
      await page.locator('#revealRecallBtn').click();
      assert.equal(await page.locator('#recallReference .expression-usage').count(), 1);
      assert.ok((await page.locator('#recallReference').textContent()).includes(selected.neutral_alternative));
      await page.locator('#recallIndependent').click();
      const data = await stored();
      assert.ok(data.favorites.includes(selected.id));
      assert.ok(data.learned.includes(selected.id));
      assert.equal(data.reviewSchedule[selected.id].independentSuccesses, 1);
    });

    await run('new built-in IDs survive v3 export reset import and reload', async () => {
      const download = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      const exported = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
      assert.equal(exported.schemaVersion, 3);
      assert.ok(exported.favorites.includes(selected.id));
      await navigate(page, 'progress');
      await page.locator('#resetBtn').click();
      assert.equal((await stored()).favorites.includes(selected.id), false);
      await page.locator('#importInput').setInputFiles({ name: 'trending-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) });
      const confirmed = page.waitForEvent('dialog');
      await page.locator('#confirmImportBtn').click();
      await confirmed;
      await page.reload();
      const restored = await stored();
      assert.ok(restored.favorites.includes(selected.id));
      assert.deepEqual(restored.reviewSchedule[selected.id], exported.reviewSchedule[selected.id]);
      assert.deepEqual(restored.practiceHistory, exported.practiceHistory);
      assert.equal(await page.locator('#storageNotice').isVisible(), false);
    });

    await run('source and usage notes fit desktop and mobile layouts', async () => {
      await page.locator('#browseTrendingBtn').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (process.env.TEST_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'trending-desktop.png'), animations: 'disabled' });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('#libraryList .usage-source summary').first().click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (process.env.TEST_SCREENSHOT_DIR) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'trending-mobile.png'), animations: 'disabled' });
        await page.locator('#libraryList .expr-card').first().screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'trending-card-mobile.png'), animations: 'disabled' });
      }
    });
    await run('content integration emits no application runtime errors', async () => assert.deepEqual(errors, []));
    console.log(`${tests.length} contemporary expression browser checks passed.`);
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
