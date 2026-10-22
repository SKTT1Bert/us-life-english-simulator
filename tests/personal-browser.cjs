const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { startApp, navigate, storageKey } = require('./browser-helpers.cjs');
const backupKey = 'daily-english-lab-backup-before-change';

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
    const raw = () => page.evaluate((key) => localStorage.getItem(key), storageKey);
    const stored = async () => JSON.parse(await raw());
    const upload = (data) => page.locator('#importInput').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    const confirmImport = async (data) => {
      await upload(data);
      const dialog = page.waitForEvent('dialog');
      await page.locator('#confirmImportBtn').click();
      await dialog;
    };
    const fillExpression = async (phrase, meaning, source = 'Personal note') => {
      await page.locator('#customPhrase').fill(phrase);
      await page.locator('#customMeaning').fill(meaning);
      await page.locator('#customExample').fill('');
      await page.locator('#customSource').fill(source);
      await page.locator('#customConfirmed').check();
    };
    const saveEditor = async () => {
      await page.locator('#saveExpressionBtn').click();
      await page.locator('#expressionDialog').waitFor({ state: 'hidden' });
    };
    const itemCard = (id) => page.locator(`#libraryList .expr-card[data-id="${id}"]`);
    await page.goto(app.url);

    await run('four primary destinations keep grouped views reachable and keyboard focus usable', async () => {
      assert.equal(await page.locator('.primary-nav-btn').count(), 4);
      assert.equal(await page.locator('#learnNavigation').isVisible(), false);
      await navigate(page, 'library');
      assert.equal(await page.locator('#learnNavigation').isVisible(), true);
      assert.equal(await page.locator('[data-view="library"]').getAttribute('aria-current'), 'page');
      await navigate(page, 'favorites');
      assert.equal(await page.locator('#personalNavigation').isVisible(), true);
      assert.equal(await page.locator('#learnNavigation').isVisible(), false);
      await page.locator('[data-nav-group="learn"]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-nav-group="practice"]').evaluate((el) => el === document.activeElement), true);
      await page.keyboard.press('Home');
      assert.equal(await page.locator('[data-nav-group="today"]').evaluate((el) => el === document.activeElement), true);
    });

    let customId;
    await run('manual expression requires explicit confirmation and persists without invented learning evidence', async () => {
      await navigate(page, 'library');
      await page.locator('#addExpressionBtn').click();
      await fillExpression('Could we move this meeting to Friday?', '我们能把会议改到周五吗？');
      await page.locator('#customConfirmed').uncheck();
      await page.locator('#saveExpressionBtn').click();
      assert.equal(await page.locator('#expressionDialog').isVisible(), true);
      assert.equal((await stored()).customExpressions.length, 0);
      await page.locator('#customConfirmed').check();
      await saveEditor();
      const data = await stored();
      assert.equal(data.schemaVersion, 3);
      assert.equal(data.customExpressions.length, 1);
      customId = data.customExpressions[0].id;
      assert.match(customId, /^custom:/);
      assert.equal(data.customExpressions[0].provenance, 'user');
      assert.equal(data.learned.includes(customId), false);
      assert.equal(data.practiceHistory.length, 0);
      await page.reload();
      assert.equal((await stored()).customExpressions[0].id, customId);
      await navigate(page, 'library');
      await page.locator('#expressionSource').selectOption('custom');
      assert.equal(await page.locator('#libraryList .expr-card').count(), 1);
      await page.locator('#searchInput').fill('会议');
      assert.equal(await page.locator('#libraryList .expr-card').count(), 1);
      await page.locator('#searchInput').fill('');
    });

    await run('normalized duplicate and cancelled edits preserve the durable original', async () => {
      const before = await raw();
      await page.locator('#addExpressionBtn').click();
      await fillExpression('  COULD WE MOVE THIS MEETING TO FRIDAY?  ', '重复');
      await page.locator('#saveExpressionBtn').click();
      assert.equal(await page.locator('#expressionDialog').isVisible(), true);
      assert.equal(await raw(), before);
      await page.locator('#cancelExpressionBtn').click();
      await itemCard(customId).locator('.custom-edit-btn').click();
      await page.locator('#customPhrase').fill('This cancelled change must disappear.');
      await page.locator('#cancelExpressionBtn').click();
      assert.equal(await raw(), before);
    });

    await run('personal recall saves evidence once and excludes the typed answer', async () => {
      await itemCard(customId).locator('.fav-btn').click();
      await itemCard(customId).locator('.recall-btn').click();
      assert.equal(await page.locator('#recallReference').isVisible(), false);
      await page.locator('#recallResponse').fill('TRANSIENT_RESPONSE_MUST_NOT_PERSIST');
      await page.locator('#revealRecallBtn').click();
      await page.locator('#recallIndependent').click();
      await page.evaluate(() => finishRecall('independent'));
      const data = await stored();
      assert.equal(data.practiceHistory.filter((event) => event.itemId === customId).length, 1);
      assert.equal(data.reviewSchedule[customId].independentSuccesses, 1);
      assert.equal(data.favorites.includes(customId), true);
      assert.equal(JSON.stringify(data).includes('TRANSIENT_RESPONSE'), false);
    });

    await run('changing expression text retains identity/history but resets stale mastery and schedule', async () => {
      await navigate(page, 'library');
      const before = await stored();
      await itemCard(customId).locator('.custom-edit-btn').click();
      await fillExpression('Could we move this meeting to Monday?', '我们能把会议改到周一吗？');
      await saveEditor();
      const after = await stored();
      assert.equal(after.customExpressions[0].id, customId);
      assert.equal(after.customExpressions[0].createdAt, before.customExpressions[0].createdAt);
      assert.deepEqual(after.practiceHistory, before.practiceHistory);
      assert.equal(after.learned.includes(customId), false);
      assert.equal(after.reviewSchedule[customId].independentSuccesses, 0);
      assert.equal(after.reviewSchedule[customId].delayedRecallSuccesses, 0);
      assert.equal(after.reviewSchedule[customId].lastReviewedAt, null);
      assert.ok(Date.parse(after.reviewSchedule[customId].nextDueAt) <= Date.now());
      assert.equal(after.favorites.includes(customId), true);
    });

    let unsafeId;
    await run('user text renders literally and cannot inject HTML in cards, recall, or progress', async () => {
      await page.locator('#addExpressionBtn').click();
      await fillExpression('<img src=x onerror="window.INJECTED=true"> Ask for help.', '<svg onload="window.INJECTED=true">提示', '<b>Source & notes</b>');
      await saveEditor();
      unsafeId = (await stored()).customExpressions.find((item) => item.phrase.startsWith('<img')).id;
      assert.equal(await itemCard(unsafeId).locator('img, svg, b').count(), 0);
      assert.ok((await itemCard(unsafeId).textContent()).includes('<img'));
      await itemCard(unsafeId).locator('.recall-btn').click();
      await page.locator('#revealRecallBtn').click();
      assert.equal(await page.locator('#recallReference img, #recallReference svg').count(), 0);
      await page.locator('[data-outcome="forgot"]').click();
      await navigate(page, 'progress');
      assert.equal(await page.evaluate(() => Boolean(window.INJECTED)), false);
      assert.equal(await page.locator('#recentPractice img, #recentPractice svg').count(), 0);
    });

    await run('deletion removes content and active links while retained history survives reload', async () => {
      await navigate(page, 'library');
      await itemCard(unsafeId).locator('.custom-delete-btn').click();
      const data = await stored();
      assert.equal(data.customExpressions.some((item) => item.id === unsafeId), false);
      assert.equal(data.deletedCustomExpressions.some((item) => item.id === unsafeId), true);
      assert.equal(data.learned.includes(unsafeId), false);
      assert.equal(data.favorites.includes(unsafeId), false);
      assert.equal(Object.hasOwn(data.reviewSchedule, unsafeId), false);
      assert.equal(data.dailyPlan.ids.includes(unsafeId), false);
      assert.equal(data.practiceHistory.some((event) => event.itemId === unsafeId), true);
      assert.equal(JSON.stringify(data).includes('window.INJECTED'), false);
      await page.reload();
      assert.equal(await page.locator('#storageNotice').isVisible(), false);
      assert.equal((await stored()).deletedCustomExpressions.some((item) => item.id === unsafeId), true);
    });

    await run('translation is an editable unconfirmed draft and saving preserves source provenance', async () => {
      await context.route('http://127.0.0.1:8765/**', (route) => {
        const pathname = new URL(route.request().url()).pathname;
        return route.fulfill({ json: pathname === '/translate'
          ? { text: 'I need to reschedule my appointment.', state: 'Loaded' }
          : { service: 'daily-english-local-translator', state: 'Ready' } });
      });
      await navigate(page, 'library');
      await page.locator('#translatorDisclosure summary').click();
      assert.equal(await page.locator('#translatorSave').isDisabled(), true);
      await page.locator('#translatorInput').fill('我需要改约时间。');
      await page.locator('#translateBtn').click();
      await page.locator('#translatorSave').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('#translatorSave').disabled);
      const count = (await stored()).customExpressions.length;
      await page.locator('#translatorSave').click();
      assert.equal(await page.locator('#customPhrase').inputValue(), 'I need to reschedule my appointment.');
      assert.equal(await page.locator('#customMeaning').inputValue(), '我需要改约时间。');
      assert.equal(await page.locator('#customConfirmed').isChecked(), false);
      assert.equal((await stored()).customExpressions.length, count);
      await page.locator('#customPhrase').fill('Could I reschedule my appointment?');
      await page.locator('#customConfirmed').check();
      await saveEditor();
      const item = (await stored()).customExpressions.find((entry) => entry.phrase === 'Could I reschedule my appointment?');
      assert.equal(item.provenance, 'model-assisted');
      assert.equal(item.meaning_cn, '我需要改约时间。');
    });

    let exported;
    await run('export includes personal content and import requires a preview before replacing or backing up', async () => {
      const download = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      exported = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
      assert.equal(exported.schemaVersion, 3);
      assert.equal(exported.customExpressions.length, 2);
      assert.equal(exported.deletedCustomExpressions.length, 1);
      assert.equal(JSON.stringify(exported).includes('TRANSIENT_RESPONSE'), false);
      const before = await raw();
      await navigate(page, 'progress');
      await upload(exported);
      assert.equal(await page.locator('#importDialog').isVisible(), true);
      assert.equal(await raw(), before);
      await page.locator('#cancelImportBtn').click();
      assert.equal(await raw(), before);
      await confirmImport(exported);
      assert.deepEqual((await stored()).customExpressions, exported.customExpressions);
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), backupKey), before);
      const backup = page.waitForEvent('download');
      await page.locator('#backupDownloadBtn').click();
      assert.deepEqual(JSON.parse(fs.readFileSync(await (await backup).path(), 'utf8')), JSON.parse(before));
    });

    await run('malformed or unsupported imports leave current progress intact', async () => {
      const before = await raw();
      for (const malformed of [{ ...exported, customExpressions: 'invalid' }, { ...exported, schemaVersion: 999 }]) {
        const rejected = page.waitForEvent('dialog');
        await upload(malformed);
        assert.match((await rejected).message(), /失败|版本|格式/);
        assert.equal(await raw(), before);
      }
    });

    await run('custom due expressions reduce new-item workload and imported personal daily plans render', async () => {
      const data = await stored();
      for (const item of data.customExpressions) data.reviewSchedule[item.id].nextDueAt = new Date(Date.now() - 1000).toISOString();
      data.dailyPlan = null;
      await confirmImport(data);
      assert.equal((await stored()).dailyPlan.ids.length, 3);
      assert.equal(await page.locator('#dueReviewCount').textContent(), '2');
      await confirmImport({ ...data, dailyPlan: { date: new Date().toISOString().slice(0, 10), ids: [customId] } });
      await navigate(page, 'today');
      assert.equal(await page.locator('#todayList .expr-card').count(), 1);
      assert.equal(await page.locator('#todayList .expr-card').getAttribute('data-id'), customId);
      await navigate(page, 'progress');
    });

    await run('oversized collections and files are rejected before changing progress', async () => {
      const before = await raw();
      const tooMany = Array.from({ length: 501 }, (_, index) => ({ ...exported.customExpressions[0], id: `custom:${randomUUID()}`, phrase: `Oversized entry ${index}` }));
      for (const data of [{ ...exported, customExpressions: tooMany }, { padding: 'x'.repeat(5 * 1024 * 1024) }]) {
        const rejected = page.waitForEvent('dialog');
        await upload(data);
        assert.match((await rejected).message(), /失败/);
        assert.equal(await page.locator('#importDialog').isVisible(), false);
        assert.equal(await raw(), before);
      }
    });

    await run('failed import backup or primary write preserves active progress and leaves preview open', async () => {
      const before = await raw();
      const beforeMemory = await page.evaluate(() => JSON.stringify(progressPayload()));
      for (const failingKey of [backupKey, storageKey]) {
        await upload({ ...exported, theme: 'pink' });
        await page.evaluate((failingKey) => {
          window.originalStorageSet = Storage.prototype.setItem;
          Storage.prototype.setItem = function (key, value) {
            if (key === failingKey) throw new DOMException('Full', 'QuotaExceededError');
            return window.originalStorageSet.call(this, key, value);
          };
        }, failingKey);
        await page.locator('#confirmImportBtn').click();
        assert.equal(await page.locator('#importDialog').isVisible(), true);
        assert.ok((await page.locator('#importError').textContent()).length > 0);
        assert.equal(await raw(), before);
        assert.equal(await page.evaluate(() => JSON.stringify(progressPayload())), beforeMemory);
        await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet; });
        await page.locator('#cancelImportBtn').click();
      }
    });

    await run('storage failure keeps a new draft open without mutating durable or in-memory content', async () => {
      await navigate(page, 'library');
      const before = await raw();
      await page.evaluate(() => {
        window.originalStorageSet = Storage.prototype.setItem;
        Storage.prototype.setItem = function () { throw new DOMException('Full', 'QuotaExceededError'); };
      });
      await page.locator('#addExpressionBtn').click();
      await fillExpression('This must remain an unsaved draft.', '这不能伪装成已保存。');
      await page.locator('#saveExpressionBtn').click();
      assert.equal(await page.locator('#expressionDialog').isVisible(), true);
      assert.equal(await raw(), before);
      assert.equal(await page.evaluate(() => state.customExpressions.length), JSON.parse(before).customExpressions.length);
      await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageSet; });
      await page.locator('#cancelExpressionBtn').click();
    });

    await run('personal expression editor and grouped navigation fit a mobile viewport', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('#addExpressionBtn').click();
      await fillExpression('A personal expression for narrow screens.', '移动端内容');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (process.env.TEST_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'personal-editor-mobile.png'), fullPage: true });
      }
      await page.locator('#cancelExpressionBtn').click();
      await navigate(page, 'progress');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });

    await run('personal expression flows have no application runtime errors', async () => assert.deepEqual(errors, []));
    if (process.env.TEST_SCREENSHOT_DIR) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.reload();
      await navigate(page, 'library');
      await page.locator('#expressionSource').selectOption('custom');
      await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'desktop-learning-final.png'), fullPage: true, animations: 'disabled' });
    }
    console.log(`${tests.length} personal expression browser checks passed.`);
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
