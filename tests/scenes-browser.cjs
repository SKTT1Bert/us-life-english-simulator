const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {startApp, navigate} = require('./browser-helpers.cjs');
const checks = [];
const run = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };

(async () => {
  const app = await startApp();
  try {
    const context = await app.newContext({viewport:{width:1600,height:1100}});
    const page = await context.newPage();
    const errors = [], badResources = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {if(r.status() >= 400 && r.url().startsWith(app.url)) badResources.push(r.url());});
    await page.goto(app.url);
    await navigate(page, 'scenarios');
    const lessons = await page.evaluate(() => window.PICTURE_LESSONS);
    const host = page.locator('#view-picture-words');
    const select = async id => page.locator('#placeSelect').selectOption(id);
    const baseline = await page.evaluate(() => JSON.stringify({runs:state.scenarios.runs,quiz:state.quiz,history:state.practiceHistory}));
    await page.evaluate(() => {EnglishSpeech.setMode('device');window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en-US'}];window.sceneSpeech=[]; speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>{window.sceneSpeech.push(u.text);u.onend?.();};});

    await run('all dialogue places have a complete picture course and shared illustration', async () => {
      assert.equal(lessons.length,22);
      assert.equal(await page.locator('#placeSelect option').count(),22);
      assert.equal(await page.locator('#scenarioPictureCount').textContent(),'22');
      for(const lesson of lessons) {
        await select(lesson.placeId);
        assert.equal(await host.locator('.picture-lesson').getAttribute('data-lesson-id'),lesson.id);
        assert.equal(await host.locator('.picture-word-chip').count(),lesson.words.length);
        assert.equal(await host.locator('.picture-hotspot').count(),Object.keys(lesson.positions).length);
        assert.equal(await host.locator('.picture-scene img').getAttribute('src'),lesson.image);
        assert.equal(await page.locator('#scenarioSceneImage').getAttribute('src'),lesson.image);
        await host.locator('.picture-scene img').evaluate(image => image.decode());
        await host.locator('.picture-speak-word').click();
        assert.equal(await page.evaluate(()=>window.sceneSpeech.at(-1)),lesson.words.find(w=>lesson.positions[w.id]).word);
        await host.locator('#picture-stage-practice').click();
        const first = lesson.exercises[0];
        await host.locator(`#picture-answer-${first.id}`).fill('incorrect-test-answer');
        await host.locator('button[type="submit"]').click();
        assert.match(await host.locator(`#picture-result-${first.id}`).textContent(),/再试一次/);
        for(const ex of lesson.exercises) await host.locator(`#picture-answer-${ex.id}`).fill(`  ${(ex.acceptedAnswers[0] || ex.answer).toUpperCase()}  `);
        await host.locator('button[type="submit"]').click();
        assert.match(await host.locator('#picturePracticeScore').textContent(),new RegExp(`答对 ${lesson.exercises.length} 题`));
        await page.locator('#scene-tab-dialogue').click();
        assert.ok(await page.locator('#scenarioImagePreview').isVisible());
        await page.locator('#sceneReturnPictureBtn').click();
        assert.ok(await host.locator('#picture-panel-practice').isVisible());
      }
      for(const lesson of lessons) {
        await select(lesson.placeId);
        assert.match(await host.locator('#picturePracticeScore').textContent(),new RegExp(`答对 ${lesson.exercises.length} 题`));
      }
      assert.equal(await page.evaluate(() => JSON.stringify({runs:state.scenarios.runs,quiz:state.quiz,history:state.practiceHistory})),baseline);
    });

    await run('picture-to-dialogue handoff and switching preserve the correct scene and learning state', async () => {
      await select('bank');
      await host.locator('#picture-stage-words').click();
      const runs = await page.evaluate(()=>state.scenarios.runs);
      await host.locator('.picture-to-dialogue').click();
      assert.equal(await page.evaluate(()=>state.scenarios.runs),runs);
      await page.locator('#startScenarioBtn').click();
      assert.equal(await page.evaluate(()=>activeScenario.place.id),'bank');
      await page.locator('#scene-tab-picture').click();
      await page.locator('#scene-tab-dialogue').click();
      assert.equal(await page.evaluate(()=>activeScenario.place.id),'bank');
      await select('library');
      assert.equal(await page.evaluate(()=>activeScenario),null);
      await page.locator('#startScenarioBtn').click();
      assert.equal(await page.evaluate(()=>activeScenario.place.id),'library');
    });

    await run('catalog categories, bilingual search, empty state and external scene changes stay synchronized', async () => {
      for(const [category,count] of [['food',3],['travel',4],['services',8],['care',5],['study',2]]) {
        await page.locator(`[data-scene-category="${category}"]`).click();
        assert.equal(await page.locator('.scene-card').count(),count);
        assert.equal(await page.evaluate(()=>activeScenario.place.id),'library');
      }
      await page.locator('[data-scene-category="all"]').click();
      await page.locator('#sceneSearch').fill('PASSPORT');
      assert.equal(await page.locator('.scene-card').count(),1);
      assert.equal(await page.locator('.scene-card').getAttribute('data-scene-place'),'airport');
      await page.locator('#sceneSearch').fill('银行');
      assert.ok(await page.locator('[data-scene-place="bank"]').isVisible());
      await page.locator('#sceneSearch').fill('no-such-scene-xyz');
      assert.ok(await page.locator('#sceneSearchEmpty').isVisible());
      await page.locator('#sceneFilterReset').click();
      assert.equal(await page.locator('.scene-card').count(),22);
      await page.locator('[data-scene-category="study"]').click();
      await select('dentist');
      assert.equal(await page.locator('[data-scene-category="all"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(()=>activeScenario),null);
      await page.locator('#sceneGalleryExpand').click();
      assert.equal(await page.locator('#sceneGalleryExpand').getAttribute('aria-expanded'),'true');
      assert.ok(await page.locator('#sceneGallery').evaluate(g=>g.scrollWidth<=g.clientWidth));
      await page.locator('#sceneGalleryExpand').click();
    });

    await run('random dialogue reveals the selected new scene even when search excludes it', async () => {
      await page.locator('#sceneSearch').fill('no-match');
      await page.evaluate(()=>{window.savedSceneSample=sample;sample=list=>list===SCENARIO_PACKS?SCENARIO_PACKS.find(p=>p.id==='insurance-office'):list[0];});
      await page.locator('#randomScenarioBtn').click();
      assert.equal(await page.locator('#placeSelect').inputValue(),'insurance-office');
      assert.equal(await page.locator('#sceneSearch').inputValue(),'');
      assert.equal(await page.locator('#scenarioSceneImage').getAttribute('src'),'assets/insurance-office.webp');
      assert.equal(await page.evaluate(()=>selectedTaskId===activeScenario.task.id),true);
      await page.evaluate(()=>{sample=window.savedSceneSample;});
    });

    await run('keyboard mode tabs remain independent from vocabulary learning steps', async () => {
      await page.locator('#scene-tab-dialogue').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#scene-tab-picture').evaluate(e=>e===document.activeElement),true);
      await host.locator('#picture-stage-words').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await host.locator('#picture-stage-sentences').evaluate(e=>e===document.activeElement),true);
      assert.equal(await page.locator('#scene-tab-picture').getAttribute('aria-selected'),'true');
    });

    await run('all 22 courses fit phone, tablet and desktop widths with both catalog layouts', async () => {
      for(const width of [320,390,768,980,1100,1600]) {
        await page.setViewportSize({width,height:1100});
        for(const lesson of lessons) {
          await select(lesson.placeId);
          for(const stage of ['words','sentences','practice']) {
            await host.locator(`#picture-stage-${stage}`).click();
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${lesson.id} ${stage}`);
          }
          await page.locator('#scene-tab-dialogue').click();
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${lesson.id} dialogue`);
          await page.locator('#scene-tab-picture').click();
        }
        await page.locator('#sceneGalleryExpand').click();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px expanded catalog`);
        await page.locator('#sceneGalleryExpand').click();
        if(width===390) {
          await host.locator('#picture-stage-words').click();
          await host.locator('#pictureZoomToggle').click();
          assert.ok(await host.locator('.picture-scene-viewport').evaluate(e=>e.scrollWidth>e.clientWidth));
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
          await host.locator('#pictureZoomToggle').click();
        }
      }
    });

    if(process.env.TEST_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR,{recursive:true});
      const previewContext=await app.newContext({viewport:{width:1600,height:1100}});
      const clean=await previewContext.newPage();
      await clean.goto(app.url);await navigate(clean,'scenarios');
      for(const id of ['bank','public-transit']) {
        await clean.locator('#placeSelect').selectOption(id);
        await clean.locator('.picture-scene img').evaluate(image=>image.decode());
        await clean.evaluate(()=>window.scrollTo(0,0));
        await clean.screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,`all-scenes-${id}.png`),fullPage:true});
      }
      await clean.locator('#sceneGalleryExpand').click();
      await clean.mouse.move(0,0);
      await clean.locator('.scene-browser').screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,'all-scenes-catalog.png')});
      await clean.locator('#sceneGalleryExpand').click();
      await clean.locator('#scene-tab-dialogue').click();
      await clean.locator('#startScenarioBtn').click();
      await clean.screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,'all-scenes-dialogue.png'),fullPage:true});
      await clean.setViewportSize({width:390,height:844});
      await clean.locator('#scene-tab-picture').click();
      // Mobile lessons start with numbered markers, with labels available on demand.
      await clean.locator('#pictureLabelsToggle').uncheck();
      await clean.evaluate(()=>window.scrollTo(0,0));
      await clean.screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,'all-scenes-mobile.png'),fullPage:true});
    }
    await run('no application errors or missing scene resources', async () => {assert.deepEqual(errors,[]);assert.deepEqual(badResources,[]);});
    console.log(`${checks.length} scene browser checks passed (22 courses; real localhost HTTP).`);
  } finally { await app.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
