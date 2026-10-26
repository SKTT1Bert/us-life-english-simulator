const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, navigate, storageKey } = require('./browser-helpers.cjs');

(async () => {
  const app = await startApp(), passed = [];
  const run = async (name, fn) => { await fn(); passed.push(name); console.log(`PASS ${name}`); };
  const screenshotDir = process.env.TEST_SCREENSHOT_DIR;
  if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
  try {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      localStorage.setItem('daily-english-speech-mode-v1', 'device');
      window.__speech = { canceled: 0, utterances: [] };
      window.SpeechSynthesisUtterance = function (text) { this.text = text; };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [{ lang: 'en-US' }], cancel: () => { window.__speech.canceled++; }, speak: (utterance) => { window.__speech.utterances.push(utterance); utterance.onstart?.(); } } });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    const current = () => page.evaluate(() => JSON.parse(JSON.stringify(state.pathwayProgress)));
    const selectLevel = async (id) => page.locator(`[data-pathway-level="${id}"]`).click();
    const mode = async (name) => page.locator(`[data-pathway-mode="${name}"]`).click();
    const upload = async (data) => {
      await page.locator('#importInput').setInputFiles({ name: 'pathway.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
      await page.locator('#importDialog').waitFor({ state: 'visible' });
      await page.locator('#confirmImportBtn').click();
      await page.locator('#importDialog').waitFor({ state: 'hidden' });
    };
    const shot = async (name) => { if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), animations: 'disabled' }); };
    await page.goto(app.url);
    const catalog = await page.evaluate(() => window.LEARNING_PATH);
    const first = catalog[0].lessons[0];

    await run('home continues into six stages without adding primary tabs or fabricated completion', async () => {
      assert.equal(await page.locator('[data-nav-group]').count(), 4);
      await page.locator('#continuePathway').click();
      assert.equal(await page.locator('#view-pathway').isVisible(), true);
      assert.equal(await page.locator('[data-pathway-level]').count(), 6);
      assert.equal(Object.keys((await current()).lessons).length, 0);
      assert.ok((await page.locator('#pathwayMetrics').textContent()).includes('0/8'));
    });

    await run('all stages render courses, original materials, four practice questions and productive tasks', async () => {
      for (const level of catalog) {
        await selectLevel(level.id);
        await page.locator('.pathway-catalog > summary').click();
        assert.equal(await page.locator('[data-pathway-lesson]').count(), 8);
        await page.locator(`[data-pathway-lesson="${level.lessons.at(-1).id}"]`).click();
        assert.equal(await page.locator('#pathwayLessonTitle').textContent(), level.lessons.at(-1).title);
        assert.equal(await page.locator('#pathwayPractice fieldset').count(), 4);
        assert.equal(await page.locator('[data-pathway-check]').count(), 3);
        assert.ok((await page.locator('.pathway-reading .pathway-text').textContent()).length > 30);
        assert.ok(await page.locator('#pathwayWriting').isVisible());
        assert.ok(await page.locator('#pathwaySpeaking').isVisible());
      }
      assert.equal(Object.keys((await current()).lessons).length, 0);
      await selectLevel('pre-a1');
    });

    await run('linked foundations open exact existing lesson and retain the learning shell', async () => {
      await page.locator('.pathway-foundation-links > summary').click();
      const link = catalog[0].foundations[0];
      await page.locator('[data-foundation-id]').first().click();
      assert.equal(await page.locator('#view-foundations').isVisible(), true);
      const saved = await page.evaluate(() => state.foundationProgress);
      assert.equal(saved.courses[link.course].lessonId, link.lessonId);
      assert.equal(await page.locator('[data-nav-group="learn"]').getAttribute('aria-current'), 'true');
      await navigate(page, 'pathway');
    });

    await run('practice locks answers, retries only mistakes and does not equate recognition with productive completion', async () => {
      for (let index = 0; index < 4; index++) {
        const option = index === 1 ? (first.questions[index].answer + 1) % first.questions[index].options.length : first.questions[index].answer;
        await page.locator(`[data-pathway-question="${index}"][data-pathway-answer="${option}"]`).click();
      }
      assert.equal((await current()).lessons[first.id].dueAt, null);
      await page.locator('#pathwayRetry').click();
      assert.equal((await current()).lessons[first.id].answers[1], null);
      assert.equal((await current()).lessons[first.id].answers[0], first.questions[0].answer);
      await page.locator(`[data-pathway-question="1"][data-pathway-answer="${first.questions[1].answer}"]`).click();
      assert.equal(await page.locator('[data-pathway-answer]:enabled').count(), 0);
      assert.ok((await page.locator('#pathwayMetrics').textContent()).includes('0/8'));
    });

    await run('productive drafts autosave, self-checks gate review and changing text invalidates self-checks', async () => {
      await page.locator('#pathwayWriting').fill('This is my independent written response.');
      await page.locator('#pathwaySpeaking').fill('I spoke aloud and noted the difficult sounds.');
      await page.locator('#pathwaySaveDraft').click();
      assert.equal((await current()).lessons[first.id].dueAt, null);
      for (const checkbox of await page.locator('[data-pathway-check]').all()) await checkbox.check();
      await page.locator('#pathwaySaveDraft').click();
      const saved = (await current()).lessons[first.id];
      assert.ok(Date.parse(saved.dueAt) > Date.now());
      assert.ok((await page.locator('#pathwayMetrics').textContent()).includes('1/8'));
      await page.reload(); await navigate(page, 'pathway');
      assert.equal(await page.locator('#pathwayWriting').inputValue(), saved.writing);
      assert.equal((await current()).lessons[first.id].dueAt, saved.dueAt);
    });

    await run('due review hides reference until an attempt and schedules once without touching expression recall', async () => {
      await page.evaluate((id) => {
        const candidate = freshProgressCopy(), record = candidate.pathwayProgress.lessons[id];
        record.updatedAt = new Date(Date.now() - 2 * 86400000).toISOString();
        record.dueAt = new Date(Date.now() - 86400000).toISOString();
        persistReplacement(candidate); refreshPathway();
      }, first.id);
      const expressionHistory = await page.evaluate(() => JSON.stringify(state.practiceHistory));
      await mode('review');
      assert.equal(await page.locator('#pathwayRecallAnswer').isVisible(), false);
      await page.locator('#pathwayReveal').click();
      assert.equal(await page.locator('#pathwayRecallAnswer').isVisible(), false);
      await page.locator('#pathwayRecallInput').fill('My independent recall attempt.');
      await page.locator('#pathwayReveal').click();
      assert.equal(await page.locator('#pathwayRecallAnswer').isVisible(), true);
      await page.locator('[data-pathway-grade="good"]').click();
      assert.equal((await current()).lessons[first.id].reviews, 1);
      assert.ok(Date.parse((await current()).lessons[first.id].dueAt) > Date.now() + 6 * 86400000);
      assert.equal(await page.locator('[data-pathway-grade]').count(), 0);
      assert.equal(await page.evaluate(() => JSON.stringify(state.practiceHistory)), expressionHistory);
      await mode('lessons');
    });

    let exported;
    await run('export flushes the latest debounced draft and export/import preserves pathway records', async () => {
      const downloadEvent = page.waitForEvent('download');
      await page.evaluate(() => {
        const input = document.getElementById('pathwayWriting'); input.value = 'The latest unsaved text must be exported immediately.';
        input.dispatchEvent(new Event('input', { bubbles: true })); exportProgress();
      });
      const download = await downloadEvent;
      exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
      assert.equal(exported.pathwayProgress.lessons[first.id].writing, 'The latest unsaved text must be exported immediately.');
      assert.deepEqual(exported.pathwayProgress.lessons[first.id].checks, [false, false, false]);
      assert.equal(exported.pathwayProgress.lessons[first.id].dueAt, null);
      await navigate(page, 'progress'); await upload(exported); await navigate(page, 'pathway');
      assert.equal(await page.locator('#pathwayWriting').inputValue(), exported.pathwayProgress.lessons[first.id].writing);
    });

    await run('stage assessment requires new comprehension and output, tracks transcript help and saves only once', async () => {
      await selectLevel('c1'); await mode('assessment');
      await page.locator('#pathwayAssessmentForm button[type="submit"]').click();
      assert.ok((await page.locator('#pathwayAssessmentError').textContent()).includes('请完成'));
      assert.equal((await current()).assessments.c1, undefined);
      const assessment = catalog.at(-1).assessment;
      for (let index = 0; index < 8; index++) {
        const option = index < 2 ? (assessment.questions[index].answer + 1) % assessment.questions[index].options.length : assessment.questions[index].answer;
        await page.locator(`[data-assessment-question="${index}"][value="${option}"]`).check();
      }
      await page.locator('#pathwayAssessmentWriting').fill('My synthesis separates evidence from assumptions. <img src=x onerror="window.__unsafe=true">');
      await page.locator('#pathwayAssessmentSpeaking').fill('I presented a qualified claim and addressed a counterargument.');
      await page.locator('[data-assessment-check="0"]').check();
      await page.locator('[data-assessment-check="2"]').check();
      await page.locator('.pathway-transcript > summary').click();
      await page.waitForFunction(() => document.getElementById('pathwayTranscriptUsed').checked);
      await page.locator('#pathwayAssessmentForm button[type="submit"]').click();
      assert.equal((await current()).assessments.c1.length, 1);
      assert.equal((await current()).assessments.c1[0].transcriptUsed, true);
      assert.ok((await page.locator('#pathwayAssessmentResult').textContent()).includes('6/8'));
      assert.ok((await page.locator('#pathwayAssessmentResult').textContent()).includes('2/3'));
      await page.locator('#pathwayAssessmentForm').evaluate((form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
      assert.equal((await current()).assessments.c1.length, 1);
      await page.reload(); await navigate(page, 'pathway'); await mode('assessment');
      await page.locator('.pathway-assessment-history > summary').click();
      await page.locator('.pathway-assessment-history details > summary').click();
      assert.ok((await page.locator('.pathway-assessment-history').textContent()).includes('My synthesis'));
      assert.equal(await page.locator('#view-pathway img').count(), 0);
      assert.equal(await page.evaluate(() => window.__unsafe), undefined);
    });

    await run('leaving listening cancels speech and stale callbacks cannot overwrite current status', async () => {
      await mode('lessons');
      await page.locator('.pathway-play').click();
      const before = await page.evaluate(() => window.__speech.canceled);
      await selectLevel('b2');
      assert.ok(await page.evaluate(() => window.__speech.canceled) > before);
      await page.evaluate(() => { const old = window.__speech.utterances.at(-1); old.onend?.(); old.onerror?.({ error: 'network' }); });
      assert.equal(await page.locator('.pathway-audio-status').textContent(), '');
      await page.locator('.pathway-play').click();
      const second = await page.evaluate(() => window.__speech.canceled);
      await navigate(page, 'library');
      assert.ok(await page.evaluate(() => window.__speech.canceled) > second);
      await navigate(page, 'pathway');
    });

    await run('legacy imports initialize empty records and identical-state reset cancels pending draft timers', async () => {
      const legacy = { ...exported }; delete legacy.pathwayProgress;
      await navigate(page, 'progress'); await upload(legacy); await navigate(page, 'pathway');
      assert.deepEqual((await current()).lessons, {}); assert.deepEqual((await current()).assessments, {});
      await page.evaluate(() => {
        const input = document.getElementById('pathwayWriting'); input.value = 'This must disappear after reset.'; input.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('resetBtn').click();
      });
      await page.waitForTimeout(550);
      assert.deepEqual((await current()).lessons, {});
      assert.equal(await page.locator('#pathwayWriting').inputValue(), '');
      await mode('assessment');
      await page.locator('#pathwayAssessmentWriting').fill('A temporary assessment draft.');
      await page.evaluate(() => document.getElementById('resetBtn').click());
      await mode('assessment');
      assert.equal(await page.locator('#pathwayAssessmentWriting').inputValue(), '');
    });

    await run('failed storage preserves answers and retains editable productive draft', async () => {
      const limited = await app.newContext(); const isolated = await limited.newPage(); isolated.on('dialog', (d) => d.accept());
      await isolated.goto(app.url); await navigate(isolated, 'pathway');
      await isolated.evaluate((key) => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('full', 'QuotaExceededError'); return original.call(this, name, value); }; }, storageKey);
      await isolated.locator('#pathwayWriting').fill('Keep this text when storage fails.');
      await isolated.locator('#pathwaySaveDraft').click();
      assert.ok((await isolated.locator('#pathwayDraftStatus').textContent()).includes('未保存'));
      assert.equal(await isolated.locator('#pathwayWriting').inputValue(), 'Keep this text when storage fails.');
      await isolated.locator('[data-pathway-answer]').first().click();
      assert.deepEqual(await isolated.evaluate(() => state.pathwayProgress.lessons), {});
      await isolated.locator('[data-pathway-level="a1"]').click();
      await isolated.locator('[data-pathway-level="pre-a1"]').click();
      assert.equal(await isolated.locator('#pathwayWriting').inputValue(), 'Keep this text when storage fails.');
      await limited.close();
    });

    await run('three themes at desktop and narrow mobile widths retain readable layouts and keyboard access', async () => {
      await mode('lessons'); await selectLevel('c1');
      for (const theme of ['light', 'dark', 'pink']) {
        await page.evaluate((theme) => { state.theme = theme; applyTheme(); }, theme);
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
          await page.evaluate(() => window.scrollTo(0, 0));
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          assert.equal(overflow, false, `${theme}/${width}`);
          await shot(`pathway-${theme}-${width}`);
          if (width === 1440 && theme === 'light') { await page.locator('#pathwayLessonTitle').scrollIntoViewIfNeeded(); await shot('pathway-c1-lesson'); }
          await mode('assessment');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `assessment ${theme}/${width}`);
          if (width === 390 && theme === 'dark') await shot('pathway-c1-assessment-mobile');
          await mode('lessons');
        }
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.pathway-hero').evaluate((node) => getComputedStyle(node).animationName), 'none');
      await page.locator('[data-pathway-level="pre-a1"]').focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-pathway-level="pre-a1"]').getAttribute('aria-pressed'), 'true');
      assert.deepEqual(errors, []);
    });
    console.log(`${passed.length} pathway browser checks passed`);
    await context.close();
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
