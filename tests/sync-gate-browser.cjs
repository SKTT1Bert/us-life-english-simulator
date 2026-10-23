const assert = require('node:assert/strict');
const { startApp, storageKey } = require('./browser-helpers.cjs');

(async () => {
  const app = await startApp(), passed = [];
  const run = async (name, action) => { await action(); passed.push(name); console.log(`PASS ${name}`); };
  const errors = [];
  const pageFor = async (context) => {
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    return page;
  };
  const ready = async (page) => {
    await page.waitForFunction(() => window.DailyEnglishStorageGate?.canWrite === true);
    await page.locator('#todayList .expr-card').first().waitFor({ state: 'visible' });
  };
  try {
    await run('a fresh disconnected browser acquires its writer lock and saves normal learning', async () => {
      const context = await app.newContext(), page = await pageFor(context);
      await page.goto(app.url); await ready(page);
      assert.equal(await page.evaluate(() => DailyEnglishStorageGate.supported), true);
      await page.locator('#todayList .learned-btn').first().click();
      const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
      assert.equal(stored.learned.length, 1);
      assert.equal(await page.locator('#syncStorageGate').count(), 0);
      await context.close();
    });

    await run('another tab cannot initialize or save until the first closes, then reads its latest records', async () => {
      const context = await app.newContext({ viewport: { width: 320, height: 640 } });
      const first = await pageFor(context); await first.goto(app.url); await ready(first);
      const second = await pageFor(context); await second.goto(app.url);
      await second.locator('#syncStorageGate').waitFor({ state: 'visible' });
      assert.equal(await second.evaluate(() => DailyEnglishStorageGate.canWrite), false);
      assert.equal(await second.locator('#todayList .expr-card').count(), 0);
      assert.equal(await second.evaluate(() => saveState()), false);
      const bounding = await second.locator('#syncStorageGate').boundingBox();
      assert.ok(bounding.x >= 0 && bounding.x + bounding.width <= 320);
      await second.keyboard.press('Escape');
      assert.equal(await second.locator('#syncStorageGate').isVisible(), true);
      await assert.rejects(second.locator('#themeToggle').click({ timeout: 350 }));
      await first.locator('#todayList .learned-btn').first().click();
      const latest = await first.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
      assert.equal(latest.learned.length, 1);
      await first.close();
      await ready(second);
      assert.equal(await second.locator('#syncStorageGate').count(), 0);
      assert.deepEqual(await second.evaluate(() => [...state.learned]), latest.learned);
      assert.deepEqual(await second.evaluate((key) => JSON.parse(localStorage.getItem(key)).learned, storageKey), latest.learned);
      await second.locator('#themeToggle').click();
      assert.equal(await second.evaluate((key) => JSON.parse(localStorage.getItem(key)).theme, storageKey), 'dark');
      await context.close();
    });

    await run('page reload releases its old lifetime lock and restores the saved learning record', async () => {
      const context = await app.newContext(), page = await pageFor(context);
      await page.goto(app.url); await ready(page);
      await page.locator('#todayList .learned-btn').first().click();
      const previous = await page.evaluate(() => [...state.learned]);
      await page.reload(); await ready(page);
      assert.deepEqual(await page.evaluate(() => [...state.learned]), previous);
      assert.equal(await page.locator('#syncStorageGate').count(), 0);
      await context.close();
    });

    await run('browsers without Web Locks can keep using local learning without claiming safe sync support', async () => {
      const context = await app.newContext();
      await context.addInitScript(() => Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined }));
      const page = await pageFor(context); await page.goto(app.url); await ready(page);
      assert.equal(await page.evaluate(() => DailyEnglishStorageGate.supported), false);
      await page.locator('#todayList .learned-btn').first().click();
      assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).learned.length, storageKey), 1);
      assert.equal(await page.locator('#syncStorageGate').count(), 0);
      await context.close();
    });

    await run('a failed lock request falls back to local learning instead of leaving an inaccessible page', async () => {
      const context = await app.newContext();
      await context.addInitScript(() => Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: () => Promise.reject(new Error('Web Locks unavailable')) } }));
      const page = await pageFor(context); await page.goto(app.url); await ready(page);
      assert.equal(await page.evaluate(() => DailyEnglishStorageGate.supported), false);
      await page.locator('#todayList .learned-btn').first().click();
      assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).learned.length, storageKey), 1);
      await context.close();
    });
    assert.deepEqual(errors, []);
    console.log(`\n${passed.length} storage gate browser checks passed.`);
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
