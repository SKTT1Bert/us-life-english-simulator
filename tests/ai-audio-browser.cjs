const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {startApp,navigate} = require('./browser-helpers.cjs');
(async()=>{
  const app=await startApp(), checks=[], errors=[], requests=[];
  const run=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
  const base=process.env.AI_AUDIO_PRODUCTION==='1'?'https://sktt1bert.github.io/us-life-english-simulator/':app.url;
  try {
    const context=await app.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('dialog',d=>d.accept());
    await page.addInitScript(()=>{const OriginalAudio=window.Audio;window.audioPlayers=[];window.Audio=function(src){const a=new OriginalAudio(src);audioPlayers.push(a);return a;};window.Audio.prototype=OriginalAudio.prototype;});
    await page.goto(base);assert.equal(await page.evaluate(()=>dailyEnglishStudioReady),true);
    await page.evaluate(async()=>{await dailyEnglishSyncReady;dailyEnglishSync.stop();const p=freshProgressCopy();p.learned.add(EXPRESSIONS[0].id);ReviewEngine.noteStudy(p,EXPRESSIONS[0].id);p.quiz={correct:3,total:4};if(!persistReplacement(p))throw Error('seed');});
    const snapshot=()=>page.evaluate(()=>JSON.parse(JSON.stringify(progressPayload())));
    const original=await snapshot();
    await run('AI audio is explicitly labeled, loaded on demand, and available in four voices at all six stages',async()=>{
      assert.equal(requests.some(u=>u.includes('/assets/ai-audio/')),false);
      await navigate(page,'listening');assert.equal(await page.locator('#listeningSource').inputValue(),'human');
      await page.locator('#listeningSource').selectOption('ai');
      assert.equal(await page.locator('#listeningVoice option').count(),4);assert.equal(await page.locator('#listeningVoice').inputValue(),'af_nicole');
      for(const level of ['pre-a1','a1','a2','b1','b2','c1']){await page.locator('#listeningLevel').selectOption(level);assert.equal(await page.locator('#listeningLesson option').count(),4);}
      await page.locator('#listeningLevel').selectOption('pre-a1');
      assert.match(await page.locator('#view-listening').innerText(),/AI 合成音频/);
    });
    await run('changing real audio voices stops previous playback and keeps the same draft and learning identity',async()=>{
      await page.locator('#listeningInput').fill('My draft survives voice changes.');
      for(const voice of ['af_nicole','af_heart','am_michael','bf_emma']){
        const previous=await page.evaluate(()=>audioPlayers.length);
        await page.locator('#listeningVoice').selectOption(voice);
        assert.equal(await page.evaluate(()=>audioPlayers.every(a=>a.paused)),true);
        assert.equal(await page.locator('#listeningInput').inputValue(),'My draft survives voice changes.');
        await page.getByRole('button',{name:'播放这一段',exact:true}).click();
        await page.waitForFunction(({previous,voice})=>audioPlayers.length>previous&&!audioPlayers.at(-1).paused&&audioPlayers.at(-1).src.includes('/'+voice+'/')&&document.querySelector('.listening-audio-status').textContent.includes('正在播放AI'),{previous,voice});
      }
      const text=await page.evaluate(()=>AI_AUDIO.clips[0].text);await page.locator('#listeningInput').fill(text);await page.locator('#listeningCheck').click();
      await page.locator('[name="listeningShadow"][value="independent"]').check();await page.locator('#listeningSave').click();
      const saved=await snapshot();assert.equal(saved.learningStudio.listeningAttempts.length,1);assert.equal(saved.learningStudio.listeningAttempts[0].lessonId,'ai-pre-a1-hello-v1');assert.equal(saved.learningStudio.listeningAttempts[0].listenCount,4);
      for(const key of Object.keys(original).filter(k=>!['learningStudio','dailyPlan'].includes(k)))assert.deepEqual(saved[key],original[key],key);
      await page.reload();await navigate(page,'listening');await page.locator('#listeningSource').selectOption('ai');
      assert.equal(await page.locator('#listeningVoice').inputValue(),'bf_emma');assert.match(await page.locator('#view-listening').innerText(),/这一段最近的练习/);
    });
    await run('AI listening leads into speaking feedback with shared voice preference and preserved revisions',async()=>{
      await page.getByRole('button',{name:'录音并查看口语反馈',exact:true}).click();
      assert.equal(await page.locator('#skillTask').inputValue(),'ai-pre-a1-hello-v1');assert.equal(await page.locator('#skillVoice').inputValue(),'bf_emma');
      await page.locator('#skillText').fill('This draft stays while I change the sample voice.');
      await page.locator('#skillVoice').selectOption('af_heart');assert.equal(await page.locator('#skillText').inputValue(),'This draft stays while I change the sample voice.');
      await page.getByRole('button',{name:'播放 AI 示范',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#view-workshop .skill-status').textContent.includes('正在播放AI'));
      await page.getByRole('button',{name:'保存这次练习',exact:true}).click();
      const saved=await snapshot();assert.equal(saved.skillWorkshop.attempts.length,1);assert.equal(saved.skillWorkshop.attempts[0].taskId,'ai-pre-a1-hello-v1');
      await navigate(page,'today');assert.equal(await page.evaluate(()=>audioPlayers.every(a=>a.paused)),true);
    });
    await run('all 96 generated audio variants decode as non-silent clips without a generation-model download',async()=>{
      const decoded=await page.evaluate(async()=>{const out=[];for(const clip of AI_AUDIO.clips)for(const [voice,file] of Object.entries(clip.variants)){const response=await fetch(file.src);if(!response.ok)throw Error(file.src);const audio=await SkillMedia.decode(await response.blob());let energy=0;for(const v of audio.audio)energy+=v*v;out.push({id:clip.id,voice,duration:audio.duration,rms:Math.sqrt(energy/audio.audio.length)});}return out;});
      assert.equal(decoded.length,96);assert.ok(decoded.every(x=>x.duration>1&&x.duration<30.5&&x.rms>0.001));
      assert.equal(requests.some(u=>u.includes('Kokoro')||u.includes('/onnx/model_quantized.onnx')),false);
    });
    await run('new audio attempts export and restore alongside all older learning records',async()=>{
      const expected=await snapshot();const download=page.waitForEvent('download');await page.locator('#exportBtn').click();const file=await(await download).path();
      const otherContext=await app.newContext(),other=await otherContext.newPage();other.on('dialog',d=>d.accept());await other.goto(base);await navigate(other,'progress');
      await other.locator('#importInput').setInputFiles(file);await other.locator('#importDialog').waitFor({state:'visible'});await other.locator('#confirmImportBtn').click();await other.locator('#importDialog').waitFor({state:'hidden'});
      const restored=await other.evaluate(()=>JSON.parse(JSON.stringify(progressPayload())));assert.deepEqual(restored,expected);await otherContext.close();
    });
    await run('failed audio is recoverable and voice controls fit mobile portrait and landscape',async()=>{
      await navigate(page,'listening');await page.locator('#listeningSource').selectOption('ai');await page.locator('#listeningVoice').selectOption('af_nicole');
      await page.route('**/assets/ai-audio/af_nicole/**',r=>r.abort());await page.getByRole('button',{name:'播放这一段',exact:true}).click();await page.waitForFunction(()=>/未能播放|未启动/.test(document.querySelector('.listening-audio-status').textContent));
      await page.unroute('**/assets/ai-audio/af_nicole/**');await page.locator('#listeningVoice').selectOption('af_heart');await page.getByRole('button',{name:'播放这一段',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.listening-audio-status').textContent.includes('正在播放AI'));
      await page.getByRole('button',{name:'停止朗读',exact:true}).click();
      const screenshotDir=process.env.TEST_SCREENSHOT_DIR;if(screenshotDir)fs.mkdirSync(screenshotDir,{recursive:true});
      for(const width of [390,844,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.equal(await page.locator('#listeningVoice').isVisible(),true);if(screenshotDir)await page.screenshot({path:path.join(screenshotDir,`ai-voices-${width}.png`),fullPage:true});}
    });
    assert.deepEqual(errors,[]);console.log(`\n${checks.length} ${process.env.AI_AUDIO_PRODUCTION==='1'?'DEPLOYED':'LOCAL'} AI voice browser checks passed.`);
  } finally {await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
