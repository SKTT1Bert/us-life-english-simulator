const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, storageKey, appFile } = require('./browser-helpers.cjs');

const DEPLOYED_APP = process.env.SYNC_PRODUCTION === '1';
const LIVE = DEPLOYED_APP || process.env.SYNC_LIVE === '1';
const PRODUCTION = 'https://sktt1bert.github.io/us-life-english-simulator/';
const API = 'https://daily-english-private-sync.feyloom36.chatgpt.site/api/sync';
const clone = (value) => JSON.parse(JSON.stringify(value));
const PRIVATE_INITIAL = 'PRIVATE_INITIAL_COURSE_WRITING_947';
const PRIVATE_DESKTOP = 'PRIVATE_DESKTOP_CONCURRENT_947';
const PRIVATE_PHONE = 'PRIVATE_PHONE_OFFLINE_947';
const PRIVATE_TYPING = 'PRIVATE_PHONE_ACTIVE_EDITOR_947';

(async () => {
  const app = await startApp(), checks = [], errors = [], requests = [], rooms = new Map();
  const screenshotDir = process.env.TEST_SCREENSHOT_DIR;
  if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });
  const baseURL = LIVE ? PRODUCTION : app.url;
  let tamperNextGet = false;
  const run = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };

  async function contextFor(options) {
    const context = await app.newContext(options);
    if (LIVE && !DEPLOYED_APP) {
      // Only app assets are local in this explicit live mode. The HTTPS origin
      // matches production CORS; every sync API request reaches the real server.
      await context.route(`${PRODUCTION}**`, (route) => {
        const url = new URL(route.request().url());
        const pathname = url.pathname.slice('/us-life-english-simulator'.length) || '/';
        const file = appFile(`http://localhost${pathname}`);
        return route.fulfill(file || { status: 404, body: '' });
      });
    } else if (!LIVE) {
      await context.route(`${API}/**`, async (route) => {
        const request = route.request(), method = request.method();
        const origin = request.headers().origin || new URL(baseURL).origin;
        const headers = { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
          'access-control-allow-headers': 'authorization, content-type', 'cache-control': 'no-store', 'content-type': 'application/json' };
        const respond = (status, body) => route.fulfill({ status, headers, body: body === undefined ? '' : JSON.stringify(body) });
        if (method === 'OPTIONS') return respond(204);
        const roomId = new URL(request.url()).pathname.split('/').at(-1), auth = request.headers().authorization;
        if (!/^[a-f0-9]{64}$/.test(roomId) || !/^Bearer [A-Za-z0-9_-]{43}$/.test(auth || '')) return respond(400, { error: 'invalid_request' });
        const existing = rooms.get(roomId);
        if (method === 'GET') {
          if (!existing) return respond(404, { error: 'not_found' });
          if (auth !== existing.auth) return respond(403, { error: 'forbidden' });
          const document = clone(existing.document);
          if (tamperNextGet) { tamperNextGet = false; document.ciphertext = (document.ciphertext[0] === 'A' ? 'B' : 'A') + document.ciphertext.slice(1); }
          return respond(200, { revision: existing.revision, document });
        }
        const body = request.postDataJSON();
        if (!body || !body.document || body.document.version !== 1 || typeof body.document.ciphertext !== 'string') return respond(400, { error: 'invalid_request' });
        if (method === 'POST') {
          if (existing || body.expectedRevision !== 0) return respond(409, { error: 'revision_conflict' });
          rooms.set(roomId, { auth, revision: 1, document: clone(body.document) });
          return respond(201, { revision: 1 });
        }
        if (method === 'PUT') {
          if (!existing) return respond(404, { error: 'not_found' });
          if (auth !== existing.auth) return respond(403, { error: 'forbidden' });
          if (existing.revision !== body.expectedRevision) return respond(409, { error: 'revision_conflict', revision: existing.revision });
          existing.revision++; existing.document = clone(body.document);
          return respond(200, { revision: existing.revision });
        }
        return respond(405, { error: 'method_not_allowed' });
      });
    }
    context.on('request', (request) => {
      if (request.url().startsWith(`${API}/`) && request.method() !== 'OPTIONS') requests.push({ method: request.method(), body: request.postData() || '' });
    });
    return context;
  }
  async function pageFor(context) {
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto(baseURL);
    await page.waitForFunction(() => Boolean(window.dailyEnglishSync) && !window.dailyEnglishSync.status().busy);
    await page.evaluate(() => dailyEnglishSync.stop());
    return page;
  }
  const current = (page) => page.evaluate(() => JSON.parse(JSON.stringify(progressPayload())));
  const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey);
  const waitIdle = async (page) => {
    await page.waitForFunction(() => !dailyEnglishSync.status().busy);
    await page.evaluate(() => dailyEnglishSync.stop());
  };
  const showToday = async (page) => {
    await page.evaluate(() => { document.activeElement?.blur(); setView('today'); dailyEnglishSync.stop(); });
  };
  async function sync(page, expected = true) {
    const result = await page.evaluate(async () => {
      const ok = await dailyEnglishSync.sync();
      dailyEnglishSync.stop();
      return { ok, status: dailyEnglishSync.status() };
    });
    assert.equal(result.ok, expected, `sync result: ${result.status.phase}: ${result.status.message}`);
    return result.status;
  }
  const openPanel = async (page) => { await page.locator('#openSyncBtn').click(); await waitIdle(page); };
  const fixture = async (page, device) => page.evaluate(({ device, initialText }) => {
    const next = freshProgressCopy(), id = EXPRESSIONS[device === 'desktop' ? 0 : 1].id;
    next.learned.add(id); next.favorites.add(EXPRESSIONS[device === 'desktop' ? 2 : 3].id);
    ReviewEngine.noteStudy(next, id);
    next.quiz = device === 'desktop' ? { correct: 4, total: 10 } : { correct: 6, total: 13 };
    const courseId = device === 'desktop' ? 'word-parts' : 'phonics', lesson = FOUNDATION_CATALOG[courseId][0];
    next.foundationProgress = FoundationProgress.answer(next.foundationProgress, FOUNDATION_CATALOG, courseId, lesson.id, 0, lesson.quizzes[0].answer, new Date().toISOString());
    if (device === 'desktop') next.pathwayProgress = PathwayProgress.saveProduction(next.pathwayProgress, PATHWAY_CATALOG, PATHWAY_CATALOG[0].lessons[0].id,
      { writing: initialText, speaking: 'Initial private speaking notes', checks: [false, false, false] }, new Date().toISOString());
    if (!persistReplacement(next, true)) throw new Error('fixture was not saved');
    renderAll(); dailyEnglishSync.stop();
    return { learned: id, favorite: EXPRESSIONS[device === 'desktop' ? 2 : 3].id, lessonId: lesson.id, courseId,
      pathLessonId: PATHWAY_CATALOG[0].lessons[0].id, levelId: PATHWAY_CATALOG[0].id };
  }, { device, initialText: PRIVATE_INITIAL });
  async function modify(page, { expressionIndex, writing, increment = 1 }) {
    return page.evaluate(({ expressionIndex, writing, increment }) => {
      const next = freshProgressCopy(), id = EXPRESSIONS[expressionIndex].id;
      next.learned.add(id); ReviewEngine.noteStudy(next, id);
      next.quiz.total += increment;
      if (writing) next.pathwayProgress = PathwayProgress.saveProduction(next.pathwayProgress, PATHWAY_CATALOG, PATHWAY_CATALOG[0].lessons[0].id,
        { writing, speaking: 'Device rehearsal notes', checks: [false, false, false] }, new Date().toISOString());
      if (!persistReplacement(next)) throw new Error('local change was not saved');
      renderAll(); dailyEnglishSync.stop();
      return id;
    }, { expressionIndex, writing, increment });
  }
  async function connect(page, code) {
    await openPanel(page);
    await page.locator('#syncPairingInput').fill(code);
    // Keyboard submission leaves the pairing field focused. It is not a course
    // draft and must not prevent adoption of the other device's learning record.
    await page.locator('#syncPairingInput').press('Enter');
    await waitIdle(page);
    assert.equal(await page.evaluate(() => dailyEnglishSync.status().connected), true, 'device should be connected');
  }
  const screenshot = async (page, name) => {
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true, animations: 'disabled' });
  };
  let desktopContext, phoneContext;
  try {
    desktopContext = await contextFor({ viewport: { width: 1440, height: 1000 } });
    phoneContext = await contextFor({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const desktop = await pageFor(desktopContext), phone = await pageFor(phoneContext);
    let desktopSeed, phoneSeed, pairingCode;

    await run('learning remains local until explicit opt-in, preserving each device original course work', async () => {
      desktopSeed = await fixture(desktop, 'desktop'); phoneSeed = await fixture(phone, 'phone');
      assert.equal(requests.length, 0);
      assert.equal((await current(desktop)).learned.length, 1); assert.equal((await current(phone)).learned.length, 1);
      assert.equal((await current(desktop)).foundationProgress.courses['word-parts'].records[desktopSeed.lessonId].answers.filter((item) => item !== null).length, 1);
    });

    await run('explicit creation uploads encrypted data and keeps the pairing secret hidden', async () => {
      await openPanel(desktop); await desktop.locator('#syncCreateBtn').click(); await waitIdle(desktop);
      assert.equal(await desktop.evaluate(() => dailyEnglishSync.status().connected), true);
      pairingCode = await desktop.evaluate(() => dailyEnglishSync.code());
      assert.ok(/^DE1(?:-[A-Z2-7]{4}){8}$/.test(pairingCode), 'valid pairing code');
      assert.equal(await desktop.locator('#syncCodeArea').isVisible(), false);
      assert.equal(await desktop.locator('#syncCodeArea pre').textContent(), '');
      const creates = requests.filter((request) => request.method === 'POST');
      assert.equal(creates.length, 1);
      for (const request of creates) {
        const body = JSON.parse(request.body);
        assert.deepEqual(Object.keys(body.document).sort(), ['ciphertext', 'iv', 'version']);
        assert.ok(!request.body.includes(PRIVATE_INITIAL)); assert.ok(!request.body.includes(pairingCode));
        assert.ok(!request.body.includes('learned') && !request.body.includes('writing'));
      }
      const backup = await desktop.evaluate(() => JSON.parse(localStorage.getItem('daily-english-sync-before-connect-v1')));
      assert.deepEqual(backup.learned, [desktopSeed.learned]);
    });

    await run('a valid-looking unknown pairing code does not create a room or replace phone records', async () => {
      const before = await stored(phone), creates = requests.filter((request) => request.method === 'POST').length;
      const unknown = await phone.evaluate(() => DailyEnglishSyncCrypto.generateCode());
      await openPanel(phone); await phone.locator('#syncPairingInput').fill(unknown); await phone.locator('#syncConnectBtn').click(); await waitIdle(phone);
      assert.equal(await phone.evaluate(() => dailyEnglishSync.status().connected), false);
      assert.equal(await phone.evaluate(() => dailyEnglishSync.status().phase), 'error');
      assert.deepEqual(await stored(phone), before);
      assert.equal(requests.filter((request) => request.method === 'POST').length, creates);
    });

    await run('keyboard pairing merges both devices and uses conservative historical counts without replay inflation', async () => {
      await showToday(desktop);
      await desktop.evaluate(() => { state.quiz.total += 2; if (!saveState()) throw new Error('save failed'); dailyEnglishSync.stop(); });
      await sync(desktop);
      assert.equal((await current(desktop)).quiz.total, 12);
      await connect(phone, pairingCode); await sync(phone); await showToday(desktop); await sync(desktop);
      for (const page of [desktop, phone]) {
        const value = await current(page);
        assert.ok(value.learned.includes(desktopSeed.learned) && value.learned.includes(phoneSeed.learned));
        assert.ok(value.favorites.includes(desktopSeed.favorite) && value.favorites.includes(phoneSeed.favorite));
        assert.equal(value.quiz.total, 13);
        assert.ok(value.foundationProgress.courses['word-parts'].records[desktopSeed.lessonId]);
        assert.ok(value.foundationProgress.courses.phonics.records[phoneSeed.lessonId]);
      }
      await sync(phone); await sync(desktop);
      assert.equal((await current(desktop)).quiz.total, 13);
    });

    await run('offline phone edits and desktop edits both survive, with concurrent writing kept as accessible copies', async () => {
      await showToday(desktop); await showToday(phone);
      await phoneContext.setOffline(true);
      const phoneMark = await modify(phone, { expressionIndex: 5, writing: PRIVATE_PHONE });
      await sync(phone, false);
      assert.equal(await phone.evaluate(() => dailyEnglishSync.status().phase), 'offline');
      const desktopMark = await modify(desktop, { expressionIndex: 4, writing: PRIVATE_DESKTOP });
      await sync(desktop);
      await phoneContext.setOffline(false);
      // The browser online event starts the real automatic resume path.
      await phone.waitForFunction(() => dailyEnglishSync.status().phase === 'synced' && !dailyEnglishSync.status().busy);
      await waitIdle(phone); await sync(desktop);
      for (const page of [desktop, phone]) {
        const value = await current(page);
        assert.ok(value.learned.includes(phoneMark) && value.learned.includes(desktopMark));
        assert.equal(value.quiz.total, 15);
        const copies = await page.evaluate(() => dailyEnglishSync.conflictCopies());
        const writing = [value.pathwayProgress.lessons[desktopSeed.pathLessonId].writing, ...copies.map((copy) => copy.value?.writing)];
        assert.ok(writing.includes(PRIVATE_DESKTOP)); assert.ok(writing.includes(PRIVATE_PHONE));
      }
      await openPanel(phone); await phone.locator('#syncShowCopiesBtn').click();
      assert.ok(await phone.locator('#syncConflictCopies details').count() >= 1);
    });

    await run('an active course editor keeps its text while remote changes wait until returning to Today', async () => {
      await showToday(desktop);
      await phone.evaluate(({ levelId, lessonId }) => { openPathwayLesson(levelId, lessonId); dailyEnglishSync.stop(); }, { levelId: desktopSeed.levelId, lessonId: desktopSeed.pathLessonId });
      await phone.locator('#pathwayWriting').fill(PRIVATE_TYPING);
      const remoteMark = await modify(desktop, { expressionIndex: 6, increment: 0 });
      await sync(desktop);
      const status = await sync(phone);
      assert.equal(status.pendingApply, true);
      assert.equal(await phone.locator('#pathwayWriting').inputValue(), PRIVATE_TYPING);
      assert.equal(await phone.evaluate(() => document.querySelector('.view.active').id), 'view-pathway');
      assert.equal((await current(phone)).learned.includes(remoteMark), false);
      await showToday(phone); await sync(phone);
      assert.equal((await current(phone)).learned.includes(remoteMark), true);
      assert.equal((await current(phone)).pathwayProgress.lessons[desktopSeed.pathLessonId].writing, PRIVATE_TYPING);
      assert.equal(await phone.evaluate(() => dailyEnglishSync.status().pendingApply), false);
      await sync(desktop);
    });

    await run('connected reset and import are blocked, and exported backup contains the envelope without pairing secrets', async () => {
      await openPanel(desktop);
      const before = await stored(desktop), notices = [];
      const listener = (dialog) => notices.push(dialog.message()); desktop.on('dialog', listener);
      await desktop.locator('#resetBtn').click();
      await desktop.locator('#importInput').setInputFiles({ name: 'test-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(before)) });
      desktop.off('dialog', listener);
      assert.ok(notices.length >= 2 && notices.every((text) => text.includes('同步')));
      assert.deepEqual(await stored(desktop), before);
      const downloaded = desktop.waitForEvent('download'); await desktop.locator('#exportBtn').click();
      const text = fs.readFileSync(await (await downloaded).path(), 'utf8'), exported = JSON.parse(text);
      assert.ok(exported.syncEnvelope && exported.syncEnvelope.version === 1);
      assert.ok(!text.includes(pairingCode));
      assert.equal(exported.code, undefined); assert.equal(exported.auth, undefined);
      assert.deepEqual(exported.learned, before.learned);
    });

    await run('new plans, diagnostics and listening evidence sync while unsaved settings and tests remain protected', async () => {
      await showToday(desktop); await showToday(phone);
      const oldPhone = await current(phone);
      await phone.locator('#coachMinutes').selectOption('5');
      await desktop.evaluate(() => {
        const next = freshProgressCopy();
        let studio = LearningStudioProgress.apply(next.learningStudio, { type: 'preferences', patch: { minutes: 20, goal: 'academic' } }, STUDIO_CATALOG);
        studio = LearningStudioProgress.apply(studio, { type: 'diagnostic', answers: LEARNING_DIAGNOSTIC.map((q) => q.answer) }, STUDIO_CATALOG);
        const item = STUDIO_CATALOG.listening[0], sentence = item.segments[0];
        studio = LearningStudioProgress.apply(studio, { type: 'listening', attempt: { lessonId: item.lessonId, segmentId: sentence.id,
          matchedTokens: sentence.tokenCount, tokenCount: sentence.tokenCount, exact: true, revealed: false, shadow: 'independent', listenCount: 1 } }, STUDIO_CATALOG);
        next.learningStudio = studio; if (!persistReplacement(next)) throw new Error('Fixture save failed');
        dailyEnglishSync.stop();
      });
      await sync(desktop); await openPanel(phone);
      assert.equal((await sync(phone)).pendingApply, true);
      assert.deepEqual((await current(phone)).learningStudio, oldPhone.learningStudio);
      await showToday(phone);
      assert.equal(await phone.locator('#coachMinutes').inputValue(), '5');
      await phone.evaluate(() => setView('diagnostic'));
      await phone.getByRole('button', { name: '开始起点诊断', exact: true }).click();
      await phone.locator('input[name="learning-diagnostic-answer"]').nth(1).check();
      await showToday(phone);
      await phone.getByRole('button', { name: '放弃设置修改', exact: true }).click();
      assert.equal((await sync(phone)).pendingApply, true);
      await phone.evaluate(() => setView('diagnostic'));
      assert.equal(await phone.locator('input[name="learning-diagnostic-answer"]').nth(1).isChecked(), true);
      await phone.getByRole('button', { name: '放弃本次未提交答案', exact: true }).click();
      await showToday(phone); await sync(phone); await sync(desktop);
      const expected = (await current(desktop)).learningStudio;
      assert.deepEqual((await current(phone)).learningStudio, expected);
      assert.equal(expected.preferences.minutes, 20);
      assert.equal(expected.diagnostics.length, 1); assert.equal(expected.listeningAttempts.length, 1);
      assert.deepEqual((await current(phone)).quiz, oldPhone.quiz);
      assert.deepEqual((await current(phone)).learned, oldPhone.learned);
    });

    await run('writing revisions and multimedia assessments synchronize without overwriting an active draft', async () => {
      await showToday(desktop); await showToday(phone);
      await phone.evaluate(() => openSkillWorkshop(SKILL_CATALOG.tasks[0].id));
      await phone.locator('#skillText').fill('UNSAVED_PRIVATE_WORKSHOP_DRAFT');
      await showToday(phone);
      await desktop.evaluate(() => {
        const next=freshProgressCopy(),task=SKILL_CATALOG.tasks[0],form=SKILL_CATALOG.forms[0];
        next.skillWorkshop=SkillProgress.append(next.skillWorkshop,'attempts',{taskId:task.id,source:'typed',original:'PRIVATE_WORKSHOP_ORIGINAL',text:'PRIVATE_WORKSHOP_REVISED',rubric:[true,false,null],feedback:{engine:'Harper 2.13.0',issues:[]},parentId:null,duration:null},SKILL_CATALOG);
        next.skillWorkshop=SkillProgress.append(next.skillWorkshop,'assessments',{formId:form.id,answers:[0,1,null,null,null,null],listens:[1,1,0,0,0,0],writing:'PRIVATE_ASSESSMENT_WRITING',speaking:'',speakingSource:'typed',rubric:[true,null,null,null,null,null]},SKILL_CATALOG);
        if(!persistReplacement(next))throw Error('Fixture save failed');dailyEnglishSync.stop();
      });
      await sync(desktop);assert.equal((await sync(phone)).pendingApply,true);
      await phone.evaluate(()=>setView('workshop'));assert.equal(await phone.locator('#skillText').inputValue(),'UNSAVED_PRIVATE_WORKSHOP_DRAFT');
      await phone.getByRole('button',{name:'保存这次练习',exact:true}).click();await showToday(phone);
      await sync(phone);await sync(desktop);
      for(const page of [desktop,phone]){const data=(await current(page)).skillWorkshop;assert.equal(data.attempts.length,2);assert.equal(data.assessments.length,1);assert.ok(data.attempts.some(a=>a.text==='PRIVATE_WORKSHOP_REVISED'&&a.original==='PRIVATE_WORKSHOP_ORIGINAL'));assert.ok(data.attempts.some(a=>a.text==='UNSAVED_PRIVATE_WORKSHOP_DRAFT'));}
      const network=JSON.stringify(requests);for(const privateText of ['PRIVATE_WORKSHOP','PRIVATE_ASSESSMENT','UNSAVED_PRIVATE'])assert.equal(network.includes(privateText),false);
    });
    await run('AI listening and speaking records merge across devices while voice preference stays local', async () => {
      await showToday(desktop); await showToday(phone);
      const beforeDesktop=await current(desktop),beforePhone=await current(phone);
      await desktop.evaluate(()=>{
        AudioVoices.choose('af_nicole');const next=freshProgressCopy(),clip=AI_AUDIO.clips[0];
        const part=STUDIO_CATALOG.listening.find(x=>x.lessonId===clip.id).segments[0];
        next.learningStudio=LearningStudioProgress.apply(next.learningStudio,{type:'listening',attempt:{lessonId:clip.id,segmentId:part.id,tokenCount:part.tokenCount,matchedTokens:part.tokenCount,exact:true,revealed:false,shadow:'independent',listenCount:1}},STUDIO_CATALOG);
        if(!persistReplacement(next))throw Error('AI listening fixture save failed');dailyEnglishSync.stop();
      });
      await phone.evaluate(()=>{
        AudioVoices.choose('bf_emma');const next=freshProgressCopy(),clip=AI_AUDIO.clips[0];
        next.skillWorkshop=SkillProgress.append(next.skillWorkshop,'attempts',{taskId:clip.id,source:'typed',original:'',text:'PRIVATE_AI_VOICE_PRACTICE',rubric:[true,false,null],feedback:null,parentId:null,duration:null},SKILL_CATALOG);
        if(!persistReplacement(next))throw Error('AI speaking fixture save failed');dailyEnglishSync.stop();
      });
      await sync(desktop);await sync(phone);await sync(desktop);
      for(const page of [desktop,phone]){
        const value=await current(page);assert.equal(value.learningStudio.listeningAttempts.length,beforeDesktop.learningStudio.listeningAttempts.length+1);
        assert.equal(value.skillWorkshop.attempts.length,beforePhone.skillWorkshop.attempts.length+1);
        assert.ok(value.learningStudio.listeningAttempts.some(a=>a.lessonId==='ai-pre-a1-hello-v1'));
        assert.ok(value.skillWorkshop.attempts.some(a=>a.taskId==='ai-pre-a1-hello-v1'));
        assert.deepEqual(value.learned,beforeDesktop.learned);assert.deepEqual(value.quiz,beforeDesktop.quiz);
      }
      assert.equal(await desktop.evaluate(()=>AudioVoices.current().id),'af_nicole');assert.equal(await phone.evaluate(()=>AudioVoices.current().id),'bf_emma');
      assert.equal(JSON.stringify(requests).includes('PRIVATE_AI_VOICE_PRACTICE'),false);
    });
    await run('disconnect preserves records and reconnect merges known offline deltas without double counting', async () => {
      await openPanel(desktop); await desktop.locator('#syncDisconnectBtn').click(); await desktop.locator('#syncConfirmDisconnectBtn').click(); await waitIdle(desktop);
      assert.equal(await desktop.evaluate(() => dailyEnglishSync.status().connected), false);
      const previous = (await current(desktop)).quiz.total;
      const detachedMark = await modify(desktop, { expressionIndex: 7 });
      await showToday(phone); const phoneMark = await modify(phone, { expressionIndex: 8 }); await sync(phone);
      await connect(desktop, pairingCode); await sync(desktop); await sync(phone);
      for (const page of [desktop, phone]) {
        const value = await current(page);
        assert.equal(value.quiz.total, previous + 2);
        assert.ok(value.learned.includes(detachedMark) && value.learned.includes(phoneMark));
      }
    });

    if (!LIVE) await run('a corrupted encrypted response cannot replace saved learning records', async () => {
      await showToday(desktop); const before = await stored(desktop); tamperNextGet = true;
      const status = await sync(desktop, false);
      assert.equal(status.phase, 'error'); assert.deepEqual(await stored(desktop), before);
      await sync(desktop);
    });

    await run('sync controls remain readable in mobile portrait and landscape', async () => {
      await openPanel(phone);
      for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
        await phone.setViewportSize(viewport);
        assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        await screenshot(phone, `sync-${LIVE ? 'live' : 'mock'}-${viewport.width}x${viewport.height}`);
      }
      await screenshot(desktop, `sync-${LIVE ? 'live' : 'mock'}-desktop`);
    });
    assert.deepEqual(errors, []);
    const writes = requests.filter((request) => ['POST', 'PUT'].includes(request.method));
    assert.equal(requests.filter((request) => request.method === 'POST').length, 1, 'the suite creates only one room');
    if (LIVE) assert.ok(writes.length <= 15, 'live validation stays below the write-rate budget');
    console.log(`\n${checks.length} ${DEPLOYED_APP ? 'DEPLOYED app and LIVE API' : LIVE ? 'LIVE API (local app assets on production origin)' : 'MOCK encrypted API'} sync browser checks passed; ${writes.length} write requests.`);
    if (LIVE) console.log('Corrupted-response injection is covered by the default mock mode, not applied to the live service.');
  } finally {
    if (desktopContext) await desktopContext.close();
    if (phoneContext) await phoneContext.close();
    await app.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
