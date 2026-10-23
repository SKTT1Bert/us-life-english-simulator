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
      window.__foundationSpeech = { canceled: 0, utterances: [] };
      window.SpeechSynthesisUtterance = function (text) { this.text = text; };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
        getVoices: () => [{ lang: 'en-US' }], cancel: () => { window.__foundationSpeech.canceled++; },
        speak: (utterance) => { window.__foundationSpeech.utterances.push(utterance); }
      } });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    const current = () => page.evaluate(() => JSON.parse(JSON.stringify(state.foundationProgress)));
    const root = (id = 'word-parts') => page.locator(`#view-${id}`);
    const selectCourse = async (id) => page.locator(`[data-course="${id}"]`).click();
    const selectStage = async (id, level) => root(id).locator(`[data-foundation-level="${level}"]`).click();
    const mode = async (id, name) => root(id).locator(`[data-foundation-mode="${name}"]`).click();
    const upload = async (data) => {
      await page.locator('#importInput').setInputFiles({ name: 'foundation-study.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
      await page.locator('#importDialog').waitFor({ state: 'visible' });
      await page.locator('#confirmImportBtn').click();
      await page.locator('#importDialog').waitFor({ state: 'hidden' });
    };
    const shot = async (name) => { if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), animations: 'disabled' }); };
    await page.goto(app.url);
    const catalog = await page.evaluate(() => FOUNDATION_CATALOG);
    const first = catalog['word-parts'].find((lesson) => lesson.levelId === 'pre-a1');

    await run('both specialist courses expose six stages of eight lessons and all learning modes', async () => {
      await navigate(page, 'foundations');
      assert.equal(await page.locator('[data-nav-group]').count(), 4);
      for (const id of ['word-parts', 'phonics']) {
        await selectCourse(id);
        assert.equal(await root(id).locator('[data-foundation-level]').count(), 6);
        for (const stage of catalog.stages[id]) {
          await selectStage(id, stage.id);
          assert.equal(await root(id).locator(`[data-foundation-level="${stage.id}"]`).getAttribute('aria-pressed'), 'true');
          assert.equal(await root(id).locator('.tutorial-stage').inputValue(), catalog[id].find((lesson) => lesson.levelId === stage.id).stage);
          assert.equal(await root(id).locator('[data-lesson]').count(), 8);
          assert.equal(await root(id).locator('.tutorial-quiz-nav button').count(), 3);
          assert.equal(await root(id).locator('[data-foundation-check]').count(), 3);
          assert.equal(await root(id).locator('.foundation-writing').isVisible(), true);
          assert.equal(await root(id).locator('.foundation-speaking').isVisible(), true);
          assert.ok((await root(id).locator('.foundation-metrics').textContent()).includes('0/8'));
          await mode(id, 'review');
          assert.equal(await root(id).locator('.foundation-empty-review').isVisible(), true);
          await mode(id, 'assessment');
          assert.equal(await root(id).locator('.pathway-assessment-questions fieldset').count(), 6);
          assert.equal(await root(id).locator('[data-assessment-check]').count(), 3);
          await mode(id, 'lessons');
          const last = catalog[id].filter((lesson) => lesson.levelId === stage.id).at(-1);
          await root(id).locator('.tutorial-catalog > summary').click();
          await root(id).locator(`[data-lesson="${catalog[id].findIndex((lesson) => lesson.id === last.id)}"]`).click();
          assert.ok((await root(id).locator('.tutorial-next').textContent()).includes('本阶段测评'));
          await root(id).locator('.tutorial-next').click();
          assert.equal(await root(id).locator('.foundation-assessment-form').isVisible(), true);
          await mode(id, 'lessons');
        }
      }
      for (const course of Object.values((await current()).courses)) assert.deepEqual(course.records, {});
      await selectCourse('word-parts'); await selectStage('word-parts', 'pre-a1');
    });

    await run('quiz completion preserves legacy evidence while output self-checks gate the new review schedule', async () => {
      for (let index = 0; index < 3; index++) {
        await root().locator(`[data-question="${index}"]`).click();
        await root().locator(`[data-answer="${first.quizzes[index].answer}"]`).click();
      }
      assert.equal((await current()).courses['word-parts'].records[first.id].dueAt, null);
      assert.ok((await root().locator('.foundation-metrics').textContent()).includes('1/8'));
      await root().locator('.tutorial-resume').click();
      assert.equal(await page.locator('#word-parts-lesson-title').textContent(), first.title, 'resume must include unfinished output practice');
      await root().locator('.foundation-writing').fill('An independent written answer.');
      await root().locator('.foundation-speaking').fill('I read aloud and noted the difficult parts.');
      await root().locator('.foundation-save').click();
      assert.equal((await current()).courses['word-parts'].records[first.id].dueAt, null);
      for (const checkbox of await root().locator('[data-foundation-check]').all()) await checkbox.check();
      await root().locator('.foundation-save').click();
      const saved = (await current()).courses['word-parts'].records[first.id];
      assert.ok(Date.parse(saved.dueAt) > Date.now());
      await page.reload(); await navigate(page, 'foundations');
      assert.equal(await root().locator('.foundation-writing').inputValue(), saved.writing);
      assert.equal((await current()).courses['word-parts'].records[first.id].dueAt, saved.dueAt);
    });

    await run('only due completed lessons appear and a recall attempt is required before grading', async () => {
      await mode('word-parts', 'review');
      assert.equal(await root().locator('.foundation-review-card').count(), 0);
      await page.evaluate((id) => {
        const candidate = freshProgressCopy(), record = candidate.foundationProgress.courses['word-parts'].records[id];
        record.updatedAt = new Date(Date.now() - 2 * 86400000).toISOString();
        record.dueAt = new Date(Date.now() - 86400000).toISOString();
        persistReplacement(candidate); refreshFoundations();
      }, first.id);
      const expressionHistory = await page.evaluate(() => JSON.stringify(state.practiceHistory));
      await mode('word-parts', 'review');
      assert.equal(await root().locator('.foundation-review-card').count(), 1);
      await root().locator('.foundation-reveal').click();
      assert.equal(await root().locator('.foundation-review-answer').isVisible(), false);
      await root().locator('.foundation-review-card textarea').fill('My recall attempt before looking at the key.');
      await root().locator('.foundation-reveal').click();
      assert.equal(await root().locator('.foundation-review-answer').isVisible(), true);
      await root().locator('[data-review-grade="good"]').click();
      const reviewed = (await current()).courses['word-parts'].records[first.id];
      assert.equal(reviewed.reviews, 1); assert.ok(Date.parse(reviewed.dueAt) > Date.now() + 6 * 86400000);
      assert.equal(await root().locator('[data-review-grade]').count(), 0);
      assert.equal(await page.evaluate(() => JSON.stringify(state.practiceHistory)), expressionHistory);
      await mode('word-parts', 'lessons');
    });

    let exported;
    await run('export flushes debounced output immediately and editing invalidates prior self-checks and due dates', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.evaluate(() => {
        const input = document.querySelector('#view-word-parts .foundation-writing');
        input.value = 'Export this latest draft before the debounce fires.';
        input.dispatchEvent(new Event('input', { bubbles: true })); exportProgress();
      });
      exported = JSON.parse(fs.readFileSync(await (await downloadPromise).path(), 'utf8'));
      const saved = exported.foundationProgress.courses['word-parts'].records[first.id];
      assert.equal(saved.writing, 'Export this latest draft before the debounce fires.');
      assert.deepEqual(saved.checks, [false, false, false]); assert.equal(saved.dueAt, null);
      await navigate(page, 'progress'); await upload(exported); await navigate(page, 'foundations');
      assert.equal(await root().locator('.foundation-writing').inputValue(), saved.writing);
      assert.equal(saved.reviews, 1, 'editing retains the review event history');
      assert.equal(await root().locator('[data-foundation-check]:checked').count(), 0);
      for (const checkbox of await root().locator('[data-foundation-check]').all()) await checkbox.check();
      await root().locator('.foundation-save').click();
      const reconfirmed = (await current()).courses['word-parts'].records[first.id];
      assert.deepEqual(reconfirmed.checks, [true, true, true]);
      assert.ok(Date.parse(reconfirmed.dueAt) > Date.now() + 23 * 3600000);
      assert.ok(Date.parse(reconfirmed.dueAt) <= Date.now() + 86400000);
      assert.equal(reconfirmed.reviews, 1);
    });

    await run('both specialist stages and integrated learning lessons link back to their exact matching stage', async () => {
      for (const id of ['word-parts', 'phonics']) {
        await selectCourse(id); await selectStage(id, 'c1');
        const lesson = catalog[id].find((entry) => entry.levelId === 'c1');
        await root(id).locator('.foundation-route-link').click();
        assert.equal(await page.locator('#view-pathway').isVisible(), true);
        const selected = await page.evaluate(() => ({ levelId: state.pathwayProgress.levelId, lessonId: state.pathwayProgress.lessonId }));
        assert.equal(selected.levelId, 'c1'); assert.equal(selected.lessonId, lesson.pathwayLessonId);
        await page.locator('.pathway-foundation-links > summary').click();
        await page.locator(`[data-foundation-course="${id}"][data-foundation-id="${lesson.id}"]`).last().click();
        assert.equal(await root(id).isVisible(), true);
        assert.equal(await root(id).locator('[data-foundation-level="c1"]').getAttribute('aria-pressed'), 'true');
        assert.equal((await current()).courses[id].lessonId, lesson.id);
      }
      await selectCourse('word-parts');
    });

    await run('stage assessment stores six answers and productive evidence once with transcript help clearly recorded', async () => {
      await selectStage('word-parts', 'c1'); await mode('word-parts', 'assessment');
      await root().locator('form button[type="submit"]').click();
      assert.ok((await root().locator('.foundation-assessment-error').textContent()).trim());
      assert.equal((await current()).courses['word-parts'].assessments.c1, undefined);
      const item = catalog.stages['word-parts'].find((stage) => stage.id === 'c1').assessment;
      for (let index = 0; index < 6; index++) {
        const option = index === 0 ? (item.questions[index].answer + 1) % item.questions[index].options.length : item.questions[index].answer;
        await root().locator(`[data-assessment-question="${index}"][value="${option}"]`).check();
      }
      await root().locator('.foundation-assessment-writing').fill('An original analytical response. <img src=x onerror="window.__foundationUnsafe=true">');
      await root().locator('.foundation-assessment-speaking').fill('I gave an oral analysis and identified one unresolved point.');
      await root().locator('[data-assessment-check="0"]').check(); await root().locator('[data-assessment-check="2"]').check();
      assert.equal(await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true }))), true, 'unfinished assessment is protected on exit');
      await root().locator('.foundation-transcript > summary').click();
      await page.waitForFunction(() => document.querySelector('#view-word-parts .foundation-transcript-used').checked);
      await root().locator('form button[type="submit"]').click();
      const history = (await current()).courses['word-parts'].assessments.c1;
      assert.equal(history.length, 1); assert.equal(history[0].transcriptUsed, true);
      assert.ok((await root().locator('.foundation-assessment-result').textContent()).includes('5/6'));
      assert.ok((await root().locator('.foundation-assessment-result').textContent()).includes('2/3'));
      await root().locator('form').evaluate((form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
      assert.equal((await current()).courses['word-parts'].assessments.c1.length, 1);
      await page.reload(); await navigate(page, 'foundations'); await mode('word-parts', 'assessment');
      await root().locator('.foundation-history > summary').click(); await root().locator('.foundation-history details > summary').click();
      assert.ok((await root().locator('.foundation-history').textContent()).includes('An original analytical response.'));
      assert.equal(await root().locator('.foundation-history img').count(), 0); assert.equal(await page.evaluate(() => window.__foundationUnsafe), undefined);
    });

    await run('switching stages and courses cancels assessment speech and ignores stale speech callbacks', async () => {
      await root().locator('.foundation-listen').click();
      const previous = await page.evaluate(() => window.__foundationSpeech.canceled);
      await selectStage('word-parts', 'b2');
      assert.ok(await page.evaluate(() => window.__foundationSpeech.canceled) > previous);
      await mode('word-parts', 'assessment');
      await page.evaluate(() => { const stale = window.__foundationSpeech.utterances.at(-1); stale.onend?.(); stale.onerror?.(); });
      assert.equal(await root().locator('.foundation-audio-status').textContent(), '');
      await root().locator('.foundation-listen').click();
      const next = await page.evaluate(() => window.__foundationSpeech.canceled);
      await selectCourse('phonics');
      assert.ok(await page.evaluate(() => window.__foundationSpeech.canceled) > next);
      await selectCourse('word-parts');
    });

    await run('v1 imports migrate old answers without inventing output completion or review schedules', async () => {
      const legacy = JSON.parse(JSON.stringify(exported));
      legacy.foundationProgress = { version: 1, courses: {
        'word-parts': { lessonId: first.id, records: { [first.id]: { answers: first.quizzes.map((question) => question.answer), updatedAt: '2026-01-01T00:00:00.000Z' } } },
        phonics: { lessonId: null, records: {} }
      } };
      await navigate(page, 'progress'); await upload(legacy); await navigate(page, 'foundations');
      const migrated = await current(), record = migrated.courses['word-parts'].records[first.id];
      assert.equal(migrated.version, 2); assert.deepEqual(record.answers, first.quizzes.map((question) => question.answer));
      assert.equal(record.writing, ''); assert.equal(record.speaking, ''); assert.deepEqual(record.checks, [false, false, false]);
      assert.equal(record.dueAt, null); assert.deepEqual(migrated.courses['word-parts'].assessments, {});
      assert.equal(await root().locator('.foundation-writing').inputValue(), '');
    });

    await run('reset and identical-state import cancel pending drafts instead of restoring erased text later', async () => {
      await page.evaluate(() => document.getElementById('resetBtn').click());
      const baseline = await page.evaluate(() => ({ app: 'Daily English Lab', ...progressPayload() }));
      await page.evaluate(() => {
        const input = document.querySelector('#view-word-parts .foundation-writing'); input.value = 'Erase this delayed draft.';
        input.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('resetBtn').click();
      });
      await page.waitForTimeout(550);
      assert.deepEqual((await current()).courses['word-parts'].records, {});
      assert.equal(await root().locator('.foundation-writing').inputValue(), '');
      await page.locator('#importInput').setInputFiles({ name: 'same-state.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(baseline)) });
      await page.locator('#importDialog').waitFor({ state: 'visible' });
      await page.evaluate(() => {
        const input = document.querySelector('#view-word-parts .foundation-writing'); input.value = 'Import must also erase this pending text.';
        input.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('confirmImportBtn').click();
      });
      await page.locator('#importDialog').waitFor({ state: 'hidden' }); await page.waitForTimeout(550);
      assert.deepEqual((await current()).courses['word-parts'].records, {});
      assert.equal(await root().locator('.foundation-writing').inputValue(), '');
      await mode('word-parts', 'assessment');
      await root().locator('.foundation-assessment-writing').fill('A temporary assessment draft.');
      await page.evaluate(() => document.getElementById('resetBtn').click());
      await mode('word-parts', 'assessment');
      assert.equal(await root().locator('.foundation-assessment-writing').inputValue(), '');
    });

    await run('storage failure preserves durable evidence and editable drafts across stages as plain text', async () => {
      const limited = await app.newContext(), isolated = await limited.newPage();
      isolated.on('dialog', (dialog) => dialog.accept());
      try {
        await isolated.goto(app.url); await navigate(isolated, 'foundations');
        const before = await isolated.evaluate((key) => ({ raw: localStorage.getItem(key), state: JSON.stringify(state.foundationProgress) }), storageKey);
        await isolated.evaluate((key) => {
          window.__originalFoundationStorage = Storage.prototype.setItem;
          Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('full', 'QuotaExceededError'); return window.__originalFoundationStorage.call(this, name, value); };
        }, storageKey);
        const text = 'Keep this unsaved draft. <img src=x onerror="window.__unsafeFoundation=true">';
        await isolated.locator('#view-word-parts .foundation-writing').fill(text);
        await isolated.locator('#view-word-parts .foundation-save').click();
        assert.ok((await isolated.locator('#view-word-parts .foundation-draft-status').textContent()).includes('未保存'));
        await isolated.locator('#view-word-parts [data-answer]').first().click();
        assert.deepEqual(await isolated.evaluate((key) => ({ raw: localStorage.getItem(key), state: JSON.stringify(state.foundationProgress) }), storageKey), before);
        await isolated.locator('#view-word-parts [data-foundation-level="a1"]').click();
        await isolated.locator('#view-word-parts [data-foundation-level="pre-a1"]').click();
        assert.equal(await isolated.locator('#view-word-parts .foundation-writing').inputValue(), text);
        assert.equal(await isolated.locator('#view-word-parts .foundation-production img').count(), 0);
        assert.equal(await isolated.evaluate(() => window.__unsafeFoundation), undefined);
        await isolated.evaluate(() => { Storage.prototype.setItem = window.__originalFoundationStorage; });
        await isolated.locator('#view-word-parts .foundation-save').click();
        assert.equal(await isolated.evaluate((id) => state.foundationProgress.courses['word-parts'].records[id].writing, first.id), text);
      } finally { await limited.close(); }
    });

    await run('specialist stage controls and assessment fit all themes at desktop and narrow mobile widths', async () => {
      await mode('word-parts', 'lessons'); await selectStage('word-parts', 'c1');
      for (const theme of ['light', 'dark', 'pink']) {
        await page.evaluate((value) => { state.theme = value; applyTheme(); }, theme);
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
          await root().locator('.foundation-study').scrollIntoViewIfNeeded();
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${theme}/${width}`);
          await shot(`foundation-study-${theme}-${width}`);
          await mode('word-parts', 'assessment');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `assessment ${theme}/${width}`);
          if (theme === 'dark' && width === 390) await shot('foundation-c1-assessment-mobile');
          await mode('word-parts', 'lessons');
        }
      }
      await root().locator('[data-foundation-level="pre-a1"]').focus(); await page.keyboard.press('Enter');
      assert.equal(await root().locator('[data-foundation-level="pre-a1"]').getAttribute('aria-pressed'), 'true');
      assert.deepEqual(errors, []);
    });
    console.log(`${passed.length} foundation study browser checks passed (${process.env.TEST_OFFLINE_FIXTURE === '1' ? 'offline fixture' : 'real localhost HTTP'}).`);
    await context.close();
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
