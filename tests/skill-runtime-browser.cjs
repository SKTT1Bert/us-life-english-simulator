// Real, vendored WASM engines and real licensed audio, never mocked inference.
const assert = require('node:assert/strict');
const { startApp } = require('./browser-helpers.cjs');
(async()=>{
 const app=await startApp();
 try{
  const context=await app.newContext(),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  page.on('console',m=>{if(m.type()==='error')console.log('Browser engine:',m.text());});
  await page.goto(process.env.SKILL_PRODUCTION==='1'?'https://sktt1bert.github.io/us-life-english-simulator/':app.url);
  assert.equal(await page.evaluate(()=>dailyEnglishStudioReady),true);
  const grammar=await page.evaluate(async()=>await SkillMedia.request('languageFeedback.worker.js',{text:'She go to school every day. I has a book. This is teh best way to learn.'}).promise);
  assert.equal(grammar.engine,'Harper 2.13.0');assert.ok(grammar.issues.length>=2,JSON.stringify(grammar));
  assert.ok(grammar.issues.some(i=>i.excerpt.toLowerCase().includes('teh')));assert.ok(grammar.issues.some(i=>i.fixes.some(f=>f.text.includes('the best'))));
  console.log('PASS real Harper grammar and applicable suggestions',grammar.issues.map(i=>i.kind+':'+i.excerpt));
  const speech=await page.evaluate(async()=>{const b=await(await fetch('assets/human-audio/942476.mp3')).blob();const clip=await SkillMedia.decode(b);return await SkillMedia.request('speechFeedback.worker.js',{audio:clip.audio}).promise;});
  console.log('Real speech output:',speech.text);assert.match(speech.text,/Tokyo/i);assert.match(speech.text,/from/i);
  assert.match(speech.engine,/Whisper/);console.log('PASS real local Whisper transcription of human recording');
  const foreign=requests.filter(url=>!url.startsWith(new URL(page.url()).origin)&&!url.startsWith('http://127.0.0.1:8765')&&!url.startsWith('blob:'));
  assert.deepEqual(foreign,[],'Inference must use self-hosted assets only');assert.deepEqual(errors,[]);
  console.log('PASS no third-party inference requests or page errors');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
