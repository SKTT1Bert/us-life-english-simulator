const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {startApp,navigate,storageKey}=require('./browser-helpers.cjs');
(async()=>{
 const app=await startApp(),contexts=[],checks=[],errors=[];let exportPayload;
 const run=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
 const base=process.env.SKILL_PRODUCTION==='1'?'https://sktt1bert.github.io/us-life-english-simulator/':app.url;
 try{
  const context=await app.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});contexts.push(context);const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(base);assert.equal(await page.evaluate(()=>dailyEnglishStudioReady),true);
  await page.evaluate(async()=>{await dailyEnglishSyncReady;dailyEnglishSync.stop();});
  const saved=()=>page.evaluate(()=>JSON.parse(JSON.stringify(progressPayload())));
  const seed=await page.evaluate(()=>{const p=freshProgressCopy();p.learned.add(EXPRESSIONS[0].id);ReviewEngine.noteStudy(p,EXPRESSIONS[0].id);p.favorites.add(EXPRESSIONS[1].id);p.quiz={correct:3,total:4};p.pathwayProgress=PathwayProgress.saveProduction(p.pathwayProgress,PATHWAY_CATALOG,PATHWAY_CATALOG[0].lessons[0].id,{writing:'OLD_PRIVATE_WRITING',speaking:'OLD_PRIVATE_SPEAKING',checks:[false,false,false]},'2026-10-23T10:00:00.000Z');if(!persistReplacement(p))throw Error('seed');return JSON.parse(JSON.stringify(progressPayload()));});
  await run('human listening loads 24 real decodable recordings with stable course alternatives',async()=>{
   await navigate(page,'listening');assert.equal(await page.locator('#listeningSource').inputValue(),'human');assert.equal(await page.locator('#listeningLesson option').count(),4);
   await page.getByRole('button',{name:'播放这一句',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.listening-audio-status').textContent.includes('真人录音'));
   await page.waitForTimeout(500);await page.getByRole('button',{name:'停止朗读',exact:true}).click();
   const clips=await page.evaluate(async()=>{const results=[];for(const clip of HUMAN_AUDIO){const response=await fetch(clip.src);const data=await SkillMedia.decode(await response.blob());results.push({id:clip.id,duration:data.duration,samples:data.audio.length});}return results;});assert.equal(clips.length,24);assert.ok(clips.every(c=>c.duration>0.25&&c.duration<=30.5&&c.samples>0));
   await page.locator('#listeningSource').selectOption('course');assert.equal(await page.locator('#listeningLesson option').count(),8);
  });
  await run('course writing opens the matching feedback task while preserving the original course draft',async()=>{
   await page.evaluate(()=>openPathwayLesson('pre-a1','pre-a1-alphabet'));await page.getByRole('button',{name:'检查这段写作',exact:true}).click();
   assert.equal(await page.locator('#skillTask').inputValue(),'pre-a1-alphabet-writing');assert.equal(await page.locator('#skillText').inputValue(),'OLD_PRIVATE_WRITING');
   assert.equal((await saved()).pathwayProgress.lessons['pre-a1-alphabet'].writing,'OLD_PRIVATE_WRITING');
  });
  await run('real grammar feedback applies a specific revision and preserves original and saved versions',async()=>{
   await page.locator('#skillText').fill('She go to school every day. This is teh best way to learn.');
   await page.getByRole('button',{name:'检查表达并给出建议',exact:true}).click();await page.locator('.skill-issue').first().waitFor();
   await page.getByRole('button',{name:'改为 the',exact:true}).click();assert.match(await page.locator('#skillText').inputValue(),/the best/);
   assert.equal(await page.locator('.skill-issue').count(),0);
   await page.getByRole('button',{name:'检查表达并给出建议',exact:true}).click();await page.locator('.skill-issue').first().waitFor();
   await page.getByRole('button',{name:'保存这次练习',exact:true}).click();const p=await saved();assert.equal(p.skillWorkshop.attempts.length,1);assert.equal(p.skillWorkshop.attempts[0].original,'OLD_PRIVATE_WRITING');assert.match(p.skillWorkshop.attempts[0].text,/the best/);assert.ok(p.skillWorkshop.attempts[0].feedback.issues.length);
   await page.locator('#skillText').fill('She goes to school every day. This is the best way to learn.');await page.getByRole('button',{name:'保存这次练习',exact:true}).click();const after=(await saved()).skillWorkshop.attempts;assert.equal(after.length,2);assert.equal(after[1].parentId,after[0].id);assert.deepEqual(after[0],p.skillWorkshop.attempts[0]);assert.equal(after[1].feedback,null);
  });
  await run('storage failures retain unsaved text and never append a false success',async()=>{
   await page.locator('#skillText').fill('Keep this unsaved revision.');await page.evaluate(key=>{window.realSkillSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new Error('quota');return realSkillSetItem.call(this,k,v);};},storageKey);
   await page.getByRole('button',{name:'保存这次练习',exact:true}).click();assert.match(await page.locator('#view-workshop .skill-status').innerText(),/保存未成功/);assert.equal((await saved()).skillWorkshop.attempts.length,2);assert.equal(await page.locator('#skillText').inputValue(),'Keep this unsaved revision.');
   await page.evaluate(()=>{Storage.prototype.setItem=realSkillSetItem;});await page.getByRole('button',{name:'保存这次练习',exact:true}).click();
  });
  await run('late feedback cannot overwrite a changed draft and cancellation releases controls',async()=>{
   await page.evaluate(()=>{window.realSkillRequest=SkillMedia.request;SkillMedia.request=()=>({promise:new Promise(resolve=>{window.finishSkillFixture=resolve;}),cancel(){window.finishSkillFixture({engine:'Harper 2.13.0',issues:[]});}});});
   await page.locator('#skillText').fill('First draft.');await page.getByRole('button',{name:'检查表达并给出建议',exact:true}).click();await page.locator('#skillText').fill('Second draft stays.');
   await page.evaluate(()=>finishSkillFixture({engine:'Harper 2.13.0',issues:[]}));await page.waitForFunction(()=>document.querySelector('#view-workshop .skill-status').textContent.includes('旧反馈已忽略'));assert.equal(await page.locator('.skill-feedback').count(),0);
   await page.getByRole('button',{name:'检查表达并给出建议',exact:true}).click();await page.getByRole('button',{name:'停止检查',exact:true}).click();assert.equal(await page.getByRole('button',{name:'检查表达并给出建议',exact:true}).isEnabled(),true);
   await page.evaluate(()=>{SkillMedia.request=realSkillRequest;});await page.getByRole('button',{name:'放弃这个任务的未保存修改',exact:true}).click();assert.equal(await page.locator('#skillText').inputValue(),'');assert.equal((await saved()).skillWorkshop.attempts.length,3);
  });
  await run('human recording upload transcribes locally; edits are labeled and comparison is not a pronunciation score',async()=>{
   await page.evaluate(()=>openSkillWorkshop('human-942476'));
   await page.getByLabel('选择一段录音',{exact:true}).setInputFiles(path.join(__dirname,'../assets/human-audio/942476.mp3'));
   await page.waitForFunction(()=>!Array.from(document.querySelectorAll('#view-workshop button')).find(b=>b.textContent==='本机转写').disabled);
   await page.getByRole('button',{name:'本机转写',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#skillText').value.includes('Tokyo'));
   assert.match(await page.locator('#view-workshop .skill-status').innerText(),/转写完成/);await page.getByRole('button',{name:'对照原句找差异',exact:true}).click();assert.match(await page.locator('#view-workshop').innerText(),/不是发音分数/);
   await page.locator('#skillText').fill('I am from Tokyo. Hello.');await page.getByRole('button',{name:'保存这次练习',exact:true}).click();const a=(await saved()).skillWorkshop.attempts.at(-1);assert.equal(a.source,'edited-transcript');assert.ok(a.duration>1);assert.equal(a.original,'I am from Tokyo.');assert.equal(Object.hasOwn(a,'audio'),false);
   await page.locator('#view-workshop audio').evaluate(a=>a.play());await page.locator('#view-workshop audio').evaluate(a=>a.pause());
  });
  await run('microphone denial is actionable; active capture stops when leaving or hiding the view',async()=>{
   await page.evaluate(()=>{window.realSkillGUM=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async()=>{throw Error('denied');};});
   await page.getByRole('button',{name:'开始录音',exact:true}).click();assert.match(await page.locator('#view-workshop .skill-status').innerText(),/麦克风|权限/);
   await page.evaluate(()=>{window.skillAudioContext=new AudioContext();const dest=skillAudioContext.createMediaStreamDestination(),osc=skillAudioContext.createOscillator();osc.connect(dest);osc.start();window.skillTestStream=dest.stream;navigator.mediaDevices.getUserMedia=async()=>skillTestStream;});
   await page.getByRole('button',{name:'开始录音',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#view-workshop .skill-status').textContent.includes('正在录音'));
   await navigate(page,'today');assert.equal(await page.evaluate(()=>skillTestStream.getTracks().every(t=>t.readyState==='ended')),true);
   await page.evaluate(async()=>{navigator.mediaDevices.getUserMedia=realSkillGUM;await skillAudioContext.close();});
  });
  await run('assessment separates unheard audio, omitted answers, self-evaluation and immutable retests',async()=>{
   await navigate(page,'workshop');await page.getByRole('button',{name:'阶段小测',exact:true}).click();
   await page.locator('input[name="skill-q-0"][value="0"]').check();await page.locator('input[name="skill-q-1"][value="1"]').check();
   await page.getByRole('button',{name:'播放本题真人录音',exact:true}).first().click();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.skill-question [role=status]')).some(n=>n.textContent.includes('正在播放')));
   await page.locator('#assessmentWriting').fill('I am Mei. This is my book.');await page.getByRole('button',{name:'提交本次小测',exact:true}).click();
   assert.equal(await page.locator('.skill-score strong').first().innerText(),'1/2');assert.match(await page.locator('#view-workshop').innerText(),/未播放录音，未计入听力表现/);const first=(await saved()).skillWorkshop.assessments[0];assert.equal(first.listens[0],1);assert.equal(first.listens[1],0);
   await page.getByRole('button',{name:'另做一份小测',exact:true}).click();assert.match(await page.locator('#skillAssessmentForm').inputValue(),/-b-v1$/);await page.locator('#assessmentWriting').fill('This is my blue cup. I need water.');await page.getByRole('button',{name:'提交本次小测',exact:true}).click();const p=await saved();assert.equal(p.skillWorkshop.assessments.length,2);assert.deepEqual(p.skillWorkshop.assessments[0],first);
  });
  await run('review, report, refresh and export retain new records and all older learning fields',async()=>{
   await page.getByRole('button',{name:'复习与修改',exact:true}).click();assert.ok(await page.getByRole('button',{name:'继续练习',exact:true}).count()>0);
   const before=await saved();for(const k of Object.keys(seed).filter(k=>k!=='skillWorkshop'))assert.deepEqual(before[k],seed[k],k);
   await navigate(page,'report');assert.match(await page.locator('.coach-report').innerText(),/4 次表达练习、2 次新版阶段小测/);
   await page.reload();await page.evaluate(()=>dailyEnglishStudioReady);assert.deepEqual(await saved(),before);
   await navigate(page,'progress');const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportBtn').click()]);const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));exportPayload=exported;assert.deepEqual(exported.skillWorkshop,before.skillWorkshop);assert.ok(!JSON.stringify(exported).includes('blob:'));
  });
  await run('independent profile restores full exports; invalid new records cannot replace existing progress',async()=>{
   const second=await app.newContext({viewport:{width:1000,height:900}});contexts.push(second);const receiver=await second.newPage();receiver.on('pageerror',e=>errors.push(e.message));receiver.on('dialog',d=>d.accept());await receiver.goto(base);await receiver.evaluate(()=>dailyEnglishStudioReady);await navigate(receiver,'progress');
   const upload=value=>receiver.locator('#importInput').setInputFiles({name:'feedback.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
   await upload(exportPayload);await receiver.locator('#importDialog').waitFor({state:'visible'});await receiver.locator('#confirmImportBtn').click();await receiver.locator('#importDialog').waitFor({state:'hidden'});
   assert.deepEqual(await receiver.evaluate(()=>progressPayload().skillWorkshop),exportPayload.skillWorkshop);
   const before=await receiver.evaluate(key=>localStorage.getItem(key),storageKey),bad=JSON.parse(JSON.stringify(exportPayload));bad.skillWorkshop.attempts[0].taskId='missing-task';const rejected=receiver.waitForEvent('dialog');await upload(bad);const error=await rejected;assert.match(error.message(),/格式或版本/);assert.equal(await receiver.evaluate(key=>localStorage.getItem(key),storageKey),before);
  });
  await run('six stages, mobile portrait/landscape and all themes have usable layouts',async()=>{
   await navigate(page,'workshop');await page.getByRole('button',{name:'写作反馈',exact:true}).click();
   for(const level of ['pre-a1','a1','a2','b1','b2','c1']){await page.locator('#skillLevel').selectOption(level);assert.equal(await page.locator('#skillTask option').count(),10);}
   const directory=process.env.TEST_SCREENSHOT_DIR;if(directory)fs.mkdirSync(directory,{recursive:true});
   for(const theme of ['light','dark','pink'])for(const viewport of [{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
    await page.setViewportSize(viewport);await page.evaluate(theme=>document.documentElement.setAttribute('data-theme',theme),theme);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${theme} ${viewport.width}`);
    if(directory)await page.screenshot({path:path.join(directory,`workshop-${theme}-${viewport.width}.png`),fullPage:true});
   }
  });
  assert.deepEqual(errors,[]);console.log(`\n${checks.length} ${process.env.SKILL_PRODUCTION==='1'?'DEPLOYED':'local'} workshop browser checks passed.`);
 }finally{for(const c of contexts)await c.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
