const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, navigate, storageKey } = require('./browser-helpers.cjs');

(async () => {
  const app = await startApp();
  const tests = [];
  const run = async (name, fn) => { await fn(); tests.push(name); console.log(`PASS ${name}`); };
  const screenshots = process.env.TEST_SCREENSHOT_DIR;
  if (screenshots) fs.mkdirSync(screenshots, { recursive: true });
  try {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    const stored = () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
    const activeProgress = () => page.evaluate(() => JSON.parse(JSON.stringify(state.foundationProgress)));
    const courseRoot = (id = 'word-parts') => page.locator(`#view-${id}`);
    const selectLesson = async (index, id = 'word-parts') => {
      await page.locator(`[data-course="${id}"]`).click();
      const root = courseRoot(id);
      if (!(await root.locator('.tutorial-catalog').evaluate((el) => el.open))) await root.locator('.tutorial-catalog > summary').click();
      await root.locator('.tutorial-search').fill('');
      await root.locator('.tutorial-stage').selectOption('all');
      await root.locator(`[data-lesson="${index}"]`).click();
    };
    const confirmImport = async (data) => {
      await page.locator('#importInput').setInputFiles({ name: 'foundations-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
      await page.locator('#importDialog').waitFor({ state: 'visible' });
      const dialog = page.waitForEvent('dialog');
      await page.locator('#confirmImportBtn').click();
      await dialog;
      await page.locator('#importDialog').waitFor({ state: 'hidden' });
    };
    const shot = async (name) => {
      if (!screenshots) return;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(screenshots, `${name}.png`), animations: 'disabled' });
    };
    await page.goto(app.url);
    const catalog = await page.evaluate(() => ({ 'word-parts': window.WORD_PARTS_LESSONS, phonics: window.PHONICS_LESSONS }));

    await run('both complete courses expose 48 lessons, 144 questions, stages, goals and sources', async () => {
      await navigate(page, 'foundations');
      for (const [id, lessons] of Object.entries(catalog)) {
        assert.equal(lessons.length, 48, id);
        assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 48);
        assert.ok(new Set(lessons.map((lesson) => lesson.stage)).size >= 4);
        for (const lesson of lessons) {
          assert.equal(lesson.quizzes.length, 3, lesson.id);
          assert.ok(lesson.stage && lesson.goals.length && lesson.sources.length, lesson.id);
        }
        await page.locator(`[data-course="${id}"]`).click();
        const root = courseRoot(id);
        assert.equal(await root.locator('.tutorial-catalog').evaluate((el) => el.open), false);
        assert.ok((await root.locator('.tutorial-meta').textContent()).includes('144 道练习'));
        assert.equal(await root.locator('.tutorial-quiz-nav button').count(), 3);
        assert.equal(await root.locator('progress').getAttribute('max'), '48');
        assert.ok(await root.locator('.tutorial-goals li').count() > 0);
        assert.ok(await root.locator('.tutorial-sources a').count() > 0);
        const links = await root.locator('.tutorial-sources a').evaluateAll((nodes) => nodes.map((el) => ({ href: el.href, rel: el.rel })));
        assert.ok(links.every((link) => link.href.startsWith('https:') && link.rel.includes('noopener')));
      }
    });

    await run('collapsed catalog supports stages, search, empty results and focused lesson selection', async () => {
      await page.locator('[data-course="word-parts"]').click();
      const root = courseRoot();
      await root.locator('.tutorial-catalog > summary').click();
      assert.equal(await root.locator('[data-lesson]').count(), 48);
      const stage = catalog['word-parts'][0].stage;
      await root.locator('.tutorial-stage').selectOption(stage);
      assert.equal(await root.locator('[data-lesson]').count(), catalog['word-parts'].filter((lesson) => lesson.stage === stage).length);
      await root.locator('.tutorial-search').fill('NO_MATCH_846239');
      assert.equal(await root.locator('[data-lesson]').count(), 0);
      assert.equal(await root.locator('.tutorial-empty').isVisible(), true);
      await root.locator('.tutorial-stage').selectOption('all');
      await root.locator('.tutorial-search').fill(catalog['word-parts'][23].title);
      assert.equal(await root.locator('[data-lesson]').count(), 1);
      await root.locator('[data-lesson="23"]').click();
      assert.equal(await root.locator('.tutorial-catalog').evaluate((el) => el.open), false);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'word-parts-lesson-title');
      assert.equal(await page.locator('#word-parts-lesson-title').textContent(), catalog['word-parts'][23].title);
      await selectLesson(0);
    });

    let completedAnswers;
    await run('three answers, duplicate guard, wrong-only retry and completion stay separate from expression recall', async () => {
      const root = courseRoot();
      const lesson = catalog['word-parts'][0];
      const qs = lesson.quizzes;
      const before = await stored();
      await root.locator(`[data-answer="${qs[0].answer}"]`).click();
      const once = (await stored()).foundationProgress.courses['word-parts'].records[lesson.id];
      assert.equal(await root.locator('[data-answer]:enabled').count(), 0);
      await root.locator(`[data-answer="${qs[0].answer}"]`).evaluate((el) => el.click());
      assert.deepEqual((await stored()).foundationProgress.courses['word-parts'].records[lesson.id], once);
      await root.locator('.tutorial-next-question').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'word-parts-quiz-title');
      const wrong = (qs[1].answer + 1) % qs[1].options.length;
      await root.locator(`[data-answer="${wrong}"]`).click();
      assert.ok((await root.locator('.tutorial-feedback').textContent()).includes(qs[1].explanation));
      assert.ok((await root.locator('.tutorial-feedback').textContent()).includes('正确答案'));
      await root.locator('.tutorial-next-question').click();
      await root.locator(`[data-answer="${qs[2].answer}"]`).click();
      assert.equal(await root.locator('.tutorial-next-question').isDisabled(), true);
      assert.equal(await root.locator('.tutorial-retry').textContent(), '重练错题');
      assert.ok((await root.locator('.tutorial-quiz-summary').textContent()).includes('当前答对 2/3'));
      assert.equal(await root.locator('progress').getAttribute('value'), '0');
      await root.locator('.tutorial-retry').click();
      const retry = (await stored()).foundationProgress.courses['word-parts'].records[lesson.id];
      assert.deepEqual(retry.answers, [qs[0].answer, null, qs[2].answer]);
      assert.equal(await root.locator('[data-question="1"]').getAttribute('aria-current'), 'step');
      await root.locator(`[data-answer="${qs[1].answer}"]`).click();
      completedAnswers = qs.map((q) => q.answer);
      const after = await stored();
      assert.deepEqual(after.foundationProgress.courses['word-parts'].records[lesson.id].answers, completedAnswers);
      assert.equal(await root.locator('progress').getAttribute('value'), '1');
      assert.ok((await root.locator('.tutorial-quiz-summary').textContent()).includes('本课随堂题已完成'));
      assert.deepEqual(after.practiceHistory, before.practiceHistory);
      assert.deepEqual(after.reviewSchedule, before.reviewSchedule);
      assert.deepEqual(after.learned, before.learned);
    });

    await run('reload resumes the saved incomplete lesson and course tabs support arrow navigation', async () => {
      const lesson = catalog['word-parts'][3];
      await selectLesson(3);
      await courseRoot().locator(`[data-answer="${lesson.quizzes[0].answer}"]`).click();
      await page.reload();
      await navigate(page, 'foundations');
      await courseRoot().locator('.tutorial-resume').click();
      assert.equal(await page.locator('#word-parts-lesson-title').textContent(), lesson.title);
      assert.equal(await courseRoot().locator('[data-question="1"]').getAttribute('aria-current'), 'step');
      assert.equal((await stored()).foundationProgress.courses['word-parts'].lessonId, lesson.id);
      await page.locator('[data-course="word-parts"]').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await courseRoot('phonics').isVisible(), true);
      assert.equal(await page.locator('[data-course="phonics"]').evaluate((el) => el === document.activeElement), true);
      await page.keyboard.press('Home');
      assert.equal(await courseRoot().isVisible(), true);
      assert.equal(await page.locator('[data-course="word-parts"]').getAttribute('tabindex'), '0');
      assert.equal(await page.locator('[data-course="phonics"]').getAttribute('tabindex'), '-1');
    });

    await run('foundation records export, reset and import with the main progress key; older v3 defaults safely', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      const exported = JSON.parse(fs.readFileSync(await (await downloadPromise).path(), 'utf8'));
      assert.equal(exported.schemaVersion, 3);
      assert.deepEqual(exported.foundationProgress, await activeProgress());
      await navigate(page, 'progress');
      await page.locator('#resetBtn').click();
      for (const course of Object.values((await stored()).foundationProgress.courses)) {
        assert.equal(course.lessonId, null);
        assert.deepEqual(course.records, {});
      }
      await confirmImport(exported);
      assert.deepEqual((await stored()).foundationProgress, exported.foundationProgress);
      await page.reload();
      assert.deepEqual(await activeProgress(), exported.foundationProgress);
      assert.equal(await page.locator('#storageNotice').isVisible(), false);
      await navigate(page, 'progress');
      const legacy = { ...exported };
      delete legacy.foundationProgress;
      await confirmImport(legacy);
      for (const course of Object.values((await stored()).foundationProgress.courses)) {
        assert.equal(course.lessonId, null);
        assert.deepEqual(course.records, {});
      }
      assert.deepEqual((await stored()).learned, exported.learned);
      assert.equal((await stored()).schemaVersion, 3);
      await confirmImport(exported);
    });

    await run('a storage write failure leaves active and durable foundation records unchanged', async () => {
      const failureContext = await app.newContext();
      const failure = await failureContext.newPage();
      try {
        await failure.goto(app.url);
        await navigate(failure, 'foundations');
        const before = await failure.evaluate((key) => ({ raw: localStorage.getItem(key), active: JSON.stringify(state.foundationProgress) }), storageKey);
        await failure.evaluate((key) => {
          window.restoreFoundationStorage = Storage.prototype.setItem;
          Storage.prototype.setItem = function (name, value) {
            if (name === key) throw new DOMException('quota for foundation test', 'QuotaExceededError');
            return window.restoreFoundationStorage.call(this, name, value);
          };
        }, storageKey);
        await failure.locator('#view-word-parts [data-answer]').first().click();
        assert.ok((await failure.locator('#view-word-parts .tutorial-feedback').textContent()).includes('未能保存'));
        assert.equal(await failure.locator('#view-word-parts [data-answer]:enabled').count(), catalog['word-parts'][0].quizzes[0].options.length);
        const afterAnswer = await failure.evaluate((key) => ({ raw: localStorage.getItem(key), active: JSON.stringify(state.foundationProgress) }), storageKey);
        assert.deepEqual(afterAnswer, before);
        await failure.locator('#view-word-parts .tutorial-next').click();
        assert.ok((await failure.locator('#view-word-parts .tutorial-course-status').textContent()).includes('未保存'));
        assert.deepEqual(await failure.evaluate((key) => ({ raw: localStorage.getItem(key), active: JSON.stringify(state.foundationProgress) }), storageKey), before);
        await failure.evaluate(() => { Storage.prototype.setItem = window.restoreFoundationStorage; });
        await failure.locator(`#view-word-parts [data-answer="${catalog['word-parts'][1].quizzes[0].answer}"]`).click();
        const recovered = await failure.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
        assert.equal(recovered.foundationProgress.courses['word-parts'].records[catalog['word-parts'][0].id], undefined);
        assert.equal(recovered.foundationProgress.courses['word-parts'].records[catalog['word-parts'][1].id].answers[0], catalog['word-parts'][1].quizzes[0].answer);
      } finally { await failureContext.close(); }
    });

    await run('missing speech support shows guidance without breaking lesson navigation', async () => {
      const silentContext = await app.newContext();
      await silentContext.addInitScript(() => {
        localStorage.setItem('daily-english-speech-mode-v1', 'device');
        Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
        Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true });
      });
      const silent = await silentContext.newPage();
      const silentErrors = [];
      silent.on('pageerror', (error) => silentErrors.push(error.message));
      try {
        await silent.goto(app.url);
        await navigate(silent, 'foundations');
        await silent.locator('#view-word-parts [data-speak-example]').first().click();
        assert.ok((await silent.locator('#view-word-parts .tutorial-speech-status').textContent()).includes('不支持朗读'));
        await silent.locator('#view-word-parts .tutorial-next').click();
        assert.equal(await silent.locator('#word-parts-lesson-title').textContent(), catalog['word-parts'][1].title);
        assert.deepEqual(silentErrors, []);
      } finally { await silentContext.close(); }
    });

    await run('late speech callbacks cannot replace newer speech or lesson feedback', async () => {
      const voiceContext = await app.newContext();
      await voiceContext.addInitScript(() => {
          localStorage.setItem('daily-english-speech-mode-v1', 'device');
        window.foundationUtterances = [];
        window.foundationSpeechCancellations = 0;
        Object.defineProperty(window, 'SpeechSynthesisUtterance', {
          configurable: true, value: function (text) { this.text = text; },
        });
        Object.defineProperty(window, 'speechSynthesis', {
          configurable: true,
          value: {
            cancel() { window.foundationSpeechCancellations += 1; },
            speak(utterance) { window.foundationUtterances.push(utterance); },
            getVoices() { return [{ lang: 'en-US', name: 'Test English voice' }]; },
          },
        });
      });
      const voice = await voiceContext.newPage();
      try {
        await voice.goto(app.url);
        await navigate(voice, 'foundations');
        const root = voice.locator('#view-word-parts');
        await root.locator('[data-speak-example="0"]').click();
        await root.locator('[data-speak-example="1"]').click();
        const current = await root.locator('.tutorial-speech-status').textContent();
        await voice.evaluate(() => {
          foundationUtterances[0].onerror({ error: 'synthesis-failed' });
          foundationUtterances[0].onend();
        });
        assert.equal(await root.locator('.tutorial-speech-status').textContent(), current);
        await root.locator('.tutorial-next').click();
        await voice.evaluate(() => foundationUtterances[1].onend());
        assert.equal(await root.locator('.tutorial-speech-status').textContent(), '');
        await root.locator('[data-speak-example="0"]').click();
        await voice.locator('[data-course="phonics"]').click();
        await voice.evaluate(() => foundationUtterances[2].onerror({ error: 'synthesis-failed' }));
        assert.equal(await voice.locator('#view-phonics .tutorial-speech-status').textContent(), '');
        assert.ok(await voice.evaluate(() => foundationSpeechCancellations >= 3));
        await voice.locator('#view-phonics [data-speak-example="0"]').click();
        const beforeExit = await voice.evaluate(() => foundationSpeechCancellations);
        const pending = await voice.locator('#view-phonics .tutorial-speech-status').textContent();
        await navigate(voice, 'today');
        assert.ok(await voice.evaluate(() => foundationSpeechCancellations) > beforeExit);
        await voice.evaluate(() => foundationUtterances[3].onerror({ error: 'synthesis-failed' }));
        assert.equal(await voice.locator('#view-phonics .tutorial-speech-status').textContent(), pending);
      } finally { await voiceContext.close(); }
    });

    await run('all themes fit 1440, 390 and 320 pixels with an expanded catalog and reduced motion', async () => {
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
        for (const theme of ['light', 'dark', 'pink']) {
          await page.evaluate((value) => { state.theme = value; applyTheme(); }, theme);
          await navigate(page, 'today');
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `home ${width} ${theme}`);
          if (width === 1440 && theme !== 'pink') await shot(`home-desktop-${theme}`);
          await navigate(page, 'foundations');
          await page.locator('[data-course="word-parts"]').click();
          const root = courseRoot();
          await root.locator('.tutorial-catalog').evaluate((el) => { el.open = false; });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `foundation ${width} ${theme}`);
          await shot(`foundations-${width === 1440 ? 'desktop' : `mobile-${width}`}-${theme}`);
          if (screenshots && theme === 'light') {
            await root.locator('.tutorial-article').evaluate((el) => {
              const top = el.getBoundingClientRect().top + window.scrollY - (innerWidth > 920 ? 110 : 16);
              window.scrollTo(0, top);
            });
            await page.screenshot({ path: path.join(screenshots, `foundations-lesson-${width}.png`), animations: 'disabled' });
          }
          await root.locator('.tutorial-catalog > summary').click();
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `catalog ${width} ${theme}`);
          if (theme === 'light') {
            await root.locator('.tutorial-catalog > summary').scrollIntoViewIfNeeded();
            if (screenshots) await page.screenshot({ path: path.join(screenshots, `foundations-catalog-${width}.png`), animations: 'disabled' });
          }
          await root.locator('.tutorial-catalog > summary').click();
        }
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await navigate(page, 'today');
      assert.equal(await page.locator('#view-today').evaluate((el) => getComputedStyle(el).animationName), 'none');
      assert.equal(await page.locator('.expr-card').first().evaluate((el) => getComputedStyle(el).transitionDuration), '0s');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });

    await run('foundation integration emits no application runtime errors', async () => assert.deepEqual(errors, []));
    console.log(`${tests.length} foundation browser checks passed (${process.env.TEST_OFFLINE_FIXTURE === '1' ? 'offline fixture' : 'real localhost HTTP'}).`);
  } finally { await app.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
