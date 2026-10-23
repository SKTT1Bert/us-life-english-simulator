// Live release smoke test. Uses a fresh browser profile and never routes app files
// to local fixtures or touches the user's open browser/session.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { navigate, storageKey } = require('./browser-helpers.cjs');
const legacyQuestions = require('./fixtures/foundation-v1-questions.json');

const target = new URL(process.env.PRODUCTION_URL || 'https://sktt1bert.github.io/us-life-english-simulator/');
assert.ok(target.protocol === 'https:' || (target.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(target.hostname)), 'Use HTTPS or an explicit localhost rehearsal URL.');
assert.notEqual(process.env.TEST_OFFLINE_FIXTURE, '1', 'Release verification must use real HTTP responses.');
const preservedKeys = ['learned', 'favorites', 'sessions', 'theme', 'quiz', 'scenarios', 'marketLearned', 'marketFavorites', 'marketQuiz', 'marketScenarios', 'reviewSchedule', 'practiceHistory', 'customExpressions', 'deletedCustomExpressions'];
const pick = (payload, keys = preservedKeys) => Object.fromEntries(keys.map((key) => [key, payload[key]]));
const day = 86400000;

(async () => {
  let playwright;
  try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
  catch (error) {
    if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
    playwright = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright'));
  }
  const browser = await playwright.chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
  const contexts = [], passed = [], errors = [], failedAssets = [];
  const run = async (name, fn) => { await fn(); passed.push(name); console.log(`PASS ${name}`); };
  const watch = (page) => {
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (new URL(response.url()).origin === target.origin && response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => {
      if (new URL(request.url()).origin === target.origin) failedAssets.push(`${request.failure()?.errorText} ${request.url()}`);
    });
    page.on('dialog', (dialog) => dialog.accept());
  };
  const createPage = async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true });
    contexts.push(context);
    const page = await context.newPage(); watch(page);
    const response = await page.goto(target.href, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(new URL(page.url()).origin, target.origin);
    await page.waitForFunction(() => typeof FoundationProgress !== 'undefined' && typeof PathwayProgress !== 'undefined');
    return page;
  };
  const snapshot = (page) => page.evaluate(() => JSON.parse(JSON.stringify(progressPayload())));
  const upload = async (page, data) => {
    await navigate(page, 'progress');
    await page.locator('#importInput').setInputFiles({ name: 'release-check-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
    await page.locator('#importDialog').waitFor({ state: 'visible' });
    await page.locator('#confirmImportBtn').click();
    await page.locator('#importDialog').waitFor({ state: 'hidden' });
  };
  const download = async (page) => {
    const waiting = page.waitForEvent('download');
    await page.locator('#exportBtn').click();
    return JSON.parse(fs.readFileSync(await (await waiting).path(), 'utf8'));
  };
  try {
    const page = await createPage();
    const catalog = await page.evaluate(() => ({ path: LEARNING_PATH, foundations: FOUNDATION_CATALOG }));
    await run('published files contain all 144 lessons and preserve the original question identities', async () => {
      assert.equal(catalog.path.length, 6);
      assert.ok(catalog.path.every((level) => level.lessons.length === 8));
      for (const id of ['word-parts', 'phonics']) {
        assert.equal(catalog.foundations[id].length, 48);
        assert.equal(catalog.foundations.stages[id].length, 6);
        for (const lesson of legacyQuestions[id]) assert.deepEqual(catalog.foundations[id].find((item) => item.id === lesson.id).quizzes, lesson.quizzes);
      }
      assert.equal(await page.locator('[data-nav-group]').count(), 4);
    });

    const legacy = await page.evaluate(() => {
      const fixture = JSON.parse(JSON.stringify(progressPayload())), now = Date.parse('2026-01-01T12:00:00.000Z');
      const expressionId = EXPRESSIONS[0].id;
      fixture.learned = [expressionId]; fixture.favorites = [expressionId];
      fixture.sessions = { '2026-01-01': [expressionId] };
      fixture.quiz = { correct: 7, total: 9 }; fixture.scenarios = { runs: 5, completed: 4, success: 3 };
      fixture.marketLearned = [MARKET_VOCAB[0].id]; fixture.marketFavorites = [MARKET_VOCAB[1].id];
      fixture.marketQuiz = { correct: 2, total: 3 }; fixture.marketScenarios = { runs: 3, completed: 2, success: 1 };
      fixture.reviewSchedule = {}; fixture.practiceHistory = [];
      ReviewEngine.recordAttempt(fixture, expressionId, { mode: 'recall', outcome: 'independent', confidence: 'high' }, now);
      Object.assign(fixture, CustomExpressions.create(fixture, { phrase: 'Could you clarify the evidence?', meaning_cn: '你能解释一下这些证据吗？', example: 'Could you clarify the evidence behind that claim?', source: 'Release compatibility fixture', provenance: 'user' }, { now, uuid: () => '11111111-1111-4111-8111-111111111111' }));
      fixture.deletedCustomExpressions = [{ id: 'custom:22222222-2222-4222-8222-222222222222', deletedAt: '2026-01-02T12:00:00.000Z' }];
      fixture.foundationProgress = { version: 1, courses: Object.fromEntries(['word-parts', 'phonics'].map((id) => {
        const first = FOUNDATION_CATALOG[id][0];
        return [id, { lessonId: first.id, records: { [first.id]: { answers: [first.quizzes[0].answer, null, null], updatedAt: '2026-01-01T12:00:00.000Z' } } }];
      })) };
      return fixture;
    });
    await run('existing browser records migrate without losing marks, history, personal expressions or old answers', async () => {
      await page.evaluate(({ key, fixture }) => localStorage.setItem(key, JSON.stringify(fixture)), { key: storageKey, fixture: legacy });
      await page.reload({ waitUntil: 'networkidle' });
      const migrated = await snapshot(page);
      assert.deepEqual(pick(migrated), pick(legacy));
      assert.equal(migrated.foundationProgress.version, 2);
      for (const id of ['word-parts', 'phonics']) {
        const first = catalog.foundations[id][0], record = migrated.foundationProgress.courses[id].records[first.id];
        assert.deepEqual(record.answers, legacy.foundationProgress.courses[id].records[first.id].answers);
        assert.equal(record.updatedAt, legacy.foundationProgress.courses[id].records[first.id].updatedAt);
        assert.equal(record.writing, ''); assert.equal(record.speaking, '');
        assert.deepEqual(record.checks, [false, false, false]); assert.equal(record.dueAt, null);
      }
      await download(page);
      assert.deepEqual(pick(await snapshot(page)), pick(legacy));
    });

    await run('all six levels open courses, practice, review and assessments in the integrated route', async () => {
      await navigate(page, 'pathway');
      for (const level of catalog.path) {
        await page.locator(`[data-pathway-level="${level.id}"]`).click();
        assert.equal(await page.locator('#pathwayLessonTitle').textContent(), level.lessons[0].title);
        assert.equal(await page.locator('#pathwayPractice fieldset').count(), 4);
        assert.equal(await page.locator('#pathwayWriting').isVisible(), true);
        await page.locator('[data-pathway-mode="review"]').click();
        assert.equal(await page.locator('#view-pathway').isVisible(), true);
        await page.locator('[data-pathway-mode="assessment"]').click();
        assert.equal(await page.locator('#pathwayAssessmentForm fieldset').first().isVisible(), true);
        assert.equal(await page.locator('#pathwayAssessmentForm [data-assessment-question]').count(), level.assessment.questions.reduce((sum, item) => sum + item.options.length, 0));
        await page.locator('[data-pathway-mode="lessons"]').click();
      }
    });

    const firstPathway = catalog.path[0].lessons[0];
    await run('integrated practice feedback, writing, speaking and next review persist after reload', async () => {
      await page.locator('[data-pathway-level="pre-a1"]').click();
      for (let index = 0; index < firstPathway.questions.length; index++) await page.locator(`[data-pathway-question="${index}"][data-pathway-answer="${firstPathway.questions[index].answer}"]`).click();
      assert.equal(await page.locator('[data-pathway-answer]:enabled').count(), 0);
      await page.locator('#pathwayWriting').fill('I can introduce myself and explain what I need.');
      await page.locator('#pathwaySpeaking').fill('I practised the introduction aloud and checked the final consonants.');
      for (const box of await page.locator('[data-pathway-check]').all()) await box.check();
      await page.locator('#pathwaySaveDraft').click();
      const saved = (await snapshot(page)).pathwayProgress.lessons[firstPathway.id];
      assert.ok(Date.parse(saved.dueAt) > Date.now());
      await page.reload(); await navigate(page, 'pathway');
      assert.equal(await page.locator('#pathwayWriting').inputValue(), saved.writing);
      assert.equal(await page.locator('#pathwaySpeaking').inputValue(), saved.speaking);
      assert.deepEqual((await snapshot(page)).pathwayProgress.lessons[firstPathway.id], saved);
      await page.evaluate((id) => {
        const candidate = freshProgressCopy(), record = candidate.pathwayProgress.lessons[id];
        record.updatedAt = '2026-01-03T12:00:00.000Z'; record.dueAt = '2026-01-04T12:00:00.000Z';
        if (!persistReplacement(candidate)) throw new Error('Unable to prepare isolated review fixture.'); refreshPathway();
      }, firstPathway.id);
      await page.locator('[data-pathway-mode="review"]').click();
      await page.locator('#pathwayReveal').click(); assert.equal(await page.locator('#pathwayRecallAnswer').isVisible(), false);
      await page.locator('#pathwayRecallInput').fill('My introduction and request, recalled before viewing the answer.');
      await page.locator('#pathwayReveal').click(); assert.equal(await page.locator('#pathwayRecallAnswer').isVisible(), true);
      await page.locator('[data-pathway-grade="good"]').click();
      const reviewed = (await snapshot(page)).pathwayProgress.lessons[firstPathway.id];
      assert.equal(reviewed.reviews, 1); assert.ok(Date.parse(reviewed.dueAt) > Date.now() + 6 * day);
      await page.reload(); await navigate(page, 'pathway');
      assert.deepEqual((await snapshot(page)).pathwayProgress.lessons[firstPathway.id], reviewed);
      assert.deepEqual(pick(await snapshot(page)), pick(legacy));
    });

    await run('integrated C1 assessment saves answers, text and transcript assistance across reload', async () => {
      await page.locator('[data-pathway-level="c1"]').click(); await page.locator('[data-pathway-mode="assessment"]').click();
      const assessment = catalog.path.at(-1).assessment;
      for (let index = 0; index < assessment.questions.length; index++) await page.locator(`#pathwayAssessmentForm [data-assessment-question="${index}"][value="${assessment.questions[index].answer}"]`).check();
      await page.locator('#pathwayAssessmentWriting').fill('The conclusion is qualified by the limits of the available evidence.');
      await page.locator('#pathwayAssessmentSpeaking').fill('I explained the evidence and considered an alternative interpretation.');
      for (const box of await page.locator('#pathwayAssessmentForm [data-assessment-check]').all()) await box.check();
      await page.locator('.pathway-transcript > summary').click();
      await page.waitForFunction(() => document.getElementById('pathwayTranscriptUsed').checked);
      await page.locator('#pathwayAssessmentForm button[type="submit"]').click();
      assert.ok((await page.locator('#pathwayAssessmentResult').textContent()).includes('8/8'));
      const saved = (await snapshot(page)).pathwayProgress.assessments.c1;
      assert.equal(saved.length, 1); assert.equal(saved[0].transcriptUsed, true);
      await page.reload(); await navigate(page, 'pathway');
      assert.deepEqual((await snapshot(page)).pathwayProgress.assessments.c1, saved);
    });

    for (const courseId of ['word-parts', 'phonics']) {
      const root = page.locator(`#view-${courseId}`), lessons = catalog.foundations[courseId], first = lessons[0];
      const select = async () => { await navigate(page, 'foundations'); await page.locator(`[data-course="${courseId}"]`).click(); };
      await run(`${courseId}: every stage exposes lessons, practice, review and a six-question assessment`, async () => {
        await select();
        for (const level of catalog.foundations.stages[courseId]) {
          await root.locator(`[data-foundation-level="${level.id}"]`).click();
          assert.equal(await root.locator('[data-lesson]').count(), 8);
          assert.equal(await root.locator('.tutorial-quiz-nav button').count(), 3);
          await root.locator('[data-foundation-mode="review"]').click();
          assert.equal(await root.locator('.foundation-empty-review').isVisible(), true);
          await root.locator('[data-foundation-mode="assessment"]').click();
          assert.equal(await root.locator('.pathway-assessment-questions fieldset').count(), 6);
          await root.locator('[data-foundation-mode="lessons"]').click();
        }
      });
      await run(`${courseId}: legacy answers, new practice, written/spoken work and scheduled review persist`, async () => {
        await root.locator('[data-foundation-level="pre-a1"]').click();
        for (let index = 0; index < first.quizzes.length; index++) {
          await root.locator(`[data-question="${index}"]`).click();
          const option = root.locator(`[data-answer="${first.quizzes[index].answer}"]`);
          if (await option.isEnabled()) await option.click();
          assert.ok((await root.locator('.tutorial-feedback').textContent()).includes(first.quizzes[index].explanation));
        }
        await root.locator('.foundation-writing').fill(`An original written response for ${courseId}.`);
        await root.locator('.foundation-speaking').fill(`I practised the ${courseId} example aloud and noted what to improve.`);
        for (const box of await root.locator('[data-foundation-check]').all()) await box.check();
        await root.locator('.foundation-save').click();
        const saved = (await snapshot(page)).foundationProgress.courses[courseId].records[first.id];
        assert.ok(Date.parse(saved.dueAt) > Date.now());
        await page.reload(); await select();
        assert.equal(await root.locator('.foundation-writing').inputValue(), saved.writing);
        assert.equal(await root.locator('.foundation-speaking').inputValue(), saved.speaking);
        assert.deepEqual((await snapshot(page)).foundationProgress.courses[courseId].records[first.id], saved);
        await page.evaluate(({ courseId, id }) => {
          const candidate = freshProgressCopy(), record = candidate.foundationProgress.courses[courseId].records[id];
          record.updatedAt = '2026-01-03T12:00:00.000Z'; record.dueAt = '2026-01-04T12:00:00.000Z';
          if (!persistReplacement(candidate)) throw new Error('Unable to prepare isolated review fixture.'); refreshFoundations();
        }, { courseId, id: first.id });
        await root.locator('[data-foundation-mode="review"]').click();
        assert.equal(await root.locator('.foundation-review-card').count(), 1);
        await root.locator('.foundation-reveal').click(); assert.equal(await root.locator('.foundation-review-answer').isVisible(), false);
        await root.locator('.foundation-review-card textarea').fill('My answer before looking at the reference.');
        await root.locator('.foundation-reveal').click(); assert.equal(await root.locator('.foundation-review-answer').isVisible(), true);
        await root.locator('[data-review-grade="good"]').click();
        const reviewed = (await snapshot(page)).foundationProgress.courses[courseId].records[first.id];
        assert.equal(reviewed.reviews, 1); assert.ok(Date.parse(reviewed.dueAt) > Date.now() + 6 * day);
        assert.equal(await root.locator('.foundation-review-card').count(), 0);
        await page.reload(); await select();
        assert.deepEqual((await snapshot(page)).foundationProgress.courses[courseId].records[first.id], reviewed);
        assert.deepEqual(pick(await snapshot(page)), pick(legacy));
      });
      await run(`${courseId}: C1 assessment, transcript flag and submitted writing survive reload`, async () => {
        await root.locator('[data-foundation-level="c1"]').click(); await root.locator('[data-foundation-mode="assessment"]').click();
        const assessment = catalog.foundations.stages[courseId].at(-1).assessment;
        for (let index = 0; index < assessment.questions.length; index++) await root.locator(`[data-assessment-question="${index}"][value="${assessment.questions[index].answer}"]`).check();
        await root.locator('.foundation-assessment-writing').fill(`I applied the ${courseId} principles and explained the exceptions.`);
        await root.locator('.foundation-assessment-speaking').fill('I explained my reasoning aloud with one concrete example.');
        for (const box of await root.locator('[data-assessment-check]').all()) await box.check();
        await root.locator('.foundation-transcript > summary').click();
        await root.locator('.foundation-transcript-used').waitFor();
        await page.waitForFunction((id) => document.querySelector(`#view-${id} .foundation-transcript-used`).checked, courseId);
        await root.locator('.foundation-assessment-form button[type="submit"]').click();
        assert.ok((await root.locator('.foundation-assessment-result').textContent()).includes('6/6'));
        const saved = (await snapshot(page)).foundationProgress.courses[courseId].assessments.c1;
        assert.equal(saved.length, 1); assert.equal(saved[0].transcriptUsed, true);
        await page.reload(); await select();
        assert.deepEqual((await snapshot(page)).foundationProgress.courses[courseId].assessments.c1, saved);
      });
    }

    await run('existing expression recall still adds a result without overwriting any course records', async () => {
      const before = await snapshot(page);
      await navigate(page, 'quiz'); await page.locator('#practiceMode').selectOption('recall');
      assert.equal(await page.locator('#recallReference').isVisible(), false);
      await page.locator('#recallResponse').fill('TRANSIENT_RELEASE_CHECK_RESPONSE');
      await page.locator('#revealRecallBtn').click(); await page.locator('#recallIndependent').click();
      const after = await snapshot(page);
      assert.equal(after.practiceHistory.length, before.practiceHistory.length + 1);
      assert.deepEqual(after.practiceHistory.slice(0, -1), before.practiceHistory);
      assert.equal(after.practiceHistory.at(-1).itemId, legacy.learned[0]);
      assert.ok(Date.parse(after.reviewSchedule[legacy.learned[0]].nextDueAt) > Date.now());
      assert.deepEqual(after.foundationProgress, before.foundationProgress); assert.deepEqual(after.pathwayProgress, before.pathwayProgress);
      assert.equal(JSON.stringify(after).includes('TRANSIENT_RELEASE_CHECK_RESPONSE'), false);
      assert.deepEqual(pick(after, preservedKeys.filter((key) => !['practiceHistory', 'reviewSchedule', 'sessions'].includes(key))), pick(legacy, preservedKeys.filter((key) => !['practiceHistory', 'reviewSchedule', 'sessions'].includes(key))));
      for (const [date, ids] of Object.entries(before.sessions)) assert.deepEqual(after.sessions[date], ids, `existing study day ${date}`);
      assert.ok(Object.values(after.sessions).some((ids) => ids.includes(legacy.learned[0])));
    });

    await run('export and restore reproduce all records in a separate clean browser context', async () => {
      const expected = await snapshot(page), exported = await download(page);
      assert.equal(exported.app, 'Daily English Lab'); assert.equal(exported.schemaVersion, 3);
      for (const key of Object.keys(expected)) assert.deepEqual(exported[key], expected[key], `export ${key}`);
      const restoredPage = await createPage();
      await upload(restoredPage, exported); await restoredPage.reload({ waitUntil: 'networkidle' });
      const restored = await snapshot(restoredPage);
      for (const key of Object.keys(expected)) assert.deepEqual(restored[key], expected[key], `restore ${key}`);
      assert.deepEqual(await snapshot(page), expected, 'A separate-context restore must not alter the source context.');
    });

    await run('published course pages fit narrow mobile screens and load without script or asset failures', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const view of ['pathway', 'foundations']) {
        await navigate(page, view);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${view} mobile overflow`);
      }
      if (process.env.TEST_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.TEST_SCREENSHOT_DIR, 'production-mobile-foundations.png'), fullPage: true, animations: 'disabled' });
      }
      assert.deepEqual(errors, []); assert.deepEqual(failedAssets, []);
    });
    console.log(`${passed.length} live release checks passed at ${target.href}`);
    console.log('Only fresh isolated browser contexts and synthetic learning records were used. Real audio quality, microphone scoring and user-owned browser records were not tested.');
  } finally {
    for (const context of contexts) await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
