const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const Practice=require('../skillPractice.js'),Progress=require('../skillProgress.js'),Sync=require('../syncMerge.js'),Listening=require('../listeningLab.js');
const clips=require('../data/humanAudio.js'),forms=require('../data/skillAssessments.js');
const sandbox={window:{}};
for(const file of ['pathwayStarter','pathwayAdvanced','learningPath'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data',file+'.js'),'utf8'),sandbox);
const pathway=JSON.parse(JSON.stringify(sandbox.window.LEARNING_PATH));
const catalog={tasks:Practice.catalog(pathway,clips,forms),forms};
const now='2026-10-25T10:30:00.000Z',id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const record=()=>({taskId:catalog.tasks[0].id,source:'typed',original:'I has a book.',text:'I have a book.',rubric:[true,null,false],feedback:{engine:'Harper 2.13.0',issues:[]},parentId:null,duration:null});
const exam=()=>({formId:forms[0].id,answers:[0,1,null,null,null,null],listens:[1,0,0,0,0,0],writing:'I am Li.',speaking:'',speakingSource:'typed',rubric:[true,null,null,null,null,null]});
const clone=v=>JSON.parse(JSON.stringify(v));
const base=()=>({schemaVersion:3,learned:['legacy-1'],favorites:[],marketLearned:[],marketFavorites:[],sessions:{},theme:'dark',dailyPlan:null,reviewSchedule:{},practiceHistory:[],customExpressions:[],deletedCustomExpressions:[],quiz:{correct:2,total:3},marketQuiz:{correct:0,total:0},scenarios:{runs:0,completed:0,success:0},marketScenarios:{runs:0,completed:0,success:0},foundationProgress:{version:2,courses:Object.fromEntries(['word-parts','phonics'].map(c=>[c,{levelId:'pre-a1',lessonId:null,records:{},assessments:{}}]))},pathwayProgress:{version:1,levelId:'pre-a1',lessonId:null,lessons:{},assessments:{}}});
test('pinned local runtimes and model files match the distribution manifest',()=>{
 const manifest=require('../vendor/learning-assets.json');assert.equal(manifest.files.length,19);
 for(const file of manifest.files){const bytes=fs.readFileSync(path.join(__dirname,'..',file.path));assert.equal(bytes.length,file.bytes,file.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
});
test('24 licensed, unchanged human files cover six stages with attribution and integrity',()=>{
 assert.equal(clips.length,24);assert.equal(new Set(clips.map(c=>c.id)).size,24);
 for(const level of Practice.LEVELS)assert.equal(clips.filter(c=>c.levelId===level).length,4);
 for(const c of clips){assert.equal(c.audioLicense,'CC BY-SA 4.0');assert.equal(c.textLicense,'CC BY 2.0 FR');assert.ok(c.sentenceAuthor&&c.speaker&&c.translation);assert.match(c.sourceUrl,/^https:\/\/tatoeba.org\/en\/sentences\/show\/\d+$/);const bytes=fs.readFileSync(path.join(__dirname,'..',c.src));assert.equal(bytes.length,c.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),c.sha256);}
});
test('all 48 original lesson tasks connect to feedback without changing lesson identifiers',()=>{
 assert.equal(catalog.tasks.length,144);assert.equal(new Set(catalog.tasks.map(t=>t.id)).size,144);
 for(const level of pathway)for(const lesson of level.lessons)for(const mode of ['writing','speaking']){const t=catalog.tasks.find(t=>t.id===`${lesson.id}-${mode}`);assert.equal(t.prompt,lesson.production[mode]);assert.equal(t.lessonId,lesson.id);}
 const all=Listening.allCatalog(pathway,clips);assert.equal(all.length,72);assert.deepEqual(all.slice(0,48),Listening.catalog(pathway));
});
test('twelve fixed alternate forms have distinct passages, answer explanations, human listening and output tasks',()=>{
 assert.equal(forms.length,12);assert.equal(new Set(forms.map(f=>f.id)).size,12);assert.equal(new Set(forms.map(f=>f.passage)).size,12);
 for(const level of Practice.LEVELS)assert.deepEqual(forms.filter(f=>f.levelId===level).map(f=>f.variant),['A','B']);
 for(const f of forms){assert.equal(f.questions.length,6);assert.equal(f.rubric.length,3);assert.ok(f.writing.length>15&&f.speaking.length>15);for(const skill of ['listening','reading','language'])assert.equal(f.questions.filter(q=>q.skill===skill).length,2);for(const q of f.questions){assert.equal(q.options.length,3);assert.equal(new Set(q.options).size,3);assert.ok(q.explanation&&q.answer>=0&&q.answer<3);if(q.audioId)assert.equal(clips.find(c=>c.id===q.audioId).levelId,f.levelId);}}
});
test('old backups gain empty additive storage; new immutable revisions retain original text',()=>{
 assert.deepEqual(Progress.restore(undefined,catalog),Progress.empty());
 const first=Progress.append(undefined,'attempts',record(),catalog,{id:id(1),now});const snapshot=clone(first);
 const second=Progress.append(first,'attempts',{...record(),parentId:id(1),text:'I have a blue book.'},catalog,{id:id(2),now});
 assert.deepEqual(first,snapshot);assert.equal(second.attempts.length,2);assert.equal(second.attempts[0].original,'I has a book.');assert.equal(second.attempts[1].parentId,id(1));
});
test('malformed versions, IDs, transcripts, time, tasks and injected fields fail closed',()=>{
 const good=Progress.append(undefined,'attempts',record(),catalog,{id:id(1),now});
 for(const mutate of [v=>v.version=2,v=>v.audio='raw recording',v=>v.attempts[0].taskId='unknown',v=>v.attempts[0].text='',v=>v.attempts[0].source='AI assessed',v=>v.attempts[0].at='today',v=>v.attempts.push(v.attempts[0]),v=>v.attempts[0].feedback.issues.push({kind:'test',message:'test',excerpt:'test',html:'bad'}),v=>v.attempts[0].duration=3]){const bad=clone(good);mutate(bad);assert.throws(()=>Progress.restore(bad,catalog));}
});
test('speaking source, duration and human reference provenance survive round trip',()=>{
 const task=catalog.tasks.find(t=>t.audioId);const next=Progress.append(undefined,'attempts',{...record(),taskId:task.id,source:'edited-transcript',duration:3.2},catalog,{id:id(1),now});
 assert.deepEqual(Progress.restore(clone(next),catalog),next);const bad=clone(next);bad.attempts[0].duration=40;assert.throws(()=>Progress.restore(bad,catalog));
});
test('listening score requires playback and reports unanswered items separately',()=>{
 const next=Progress.append(undefined,'assessments',exam(),catalog,{id:id(1),now}),score=Progress.score(next.assessments[0],forms[0]);
 assert.deepEqual(score.listening,{correct:1,total:2,answered:2,heard:1});assert.deepEqual(score.reading,{correct:0,total:2,answered:0,heard:null});
 const bad=clone(next);bad.assessments[0].listens[2]=1;assert.throws(()=>Progress.restore(bad,catalog));bad.assessments[0].listens[2]=0;bad.assessments[0].formId='unknown';assert.throws(()=>Progress.restore(bad,catalog));
});
test('new private attempts merge concurrently, deduplicate and survive an older empty snapshot',()=>{
 const original=base(),common=Sync.create(original,'device-a');
 const left={...clone(original),skillWorkshop:Progress.append(undefined,'attempts',record(),catalog,{id:id(1),now})};
 const right={...clone(original),skillWorkshop:Progress.append(undefined,'assessments',exam(),catalog,{id:id(2),now})};
 const a=Sync.capture(common,left,'device-a'),b=Sync.capture(common,right,'device-b');
 const merged=Sync.merge(a,b),materialized=Sync.materialize(merged);
 assert.equal(materialized.skillWorkshop.attempts.length,1);assert.equal(materialized.skillWorkshop.assessments.length,1);assert.deepEqual(materialized.learned,original.learned);assert.deepEqual(materialized.quiz,original.quiz);Progress.restore(materialized.skillWorkshop,catalog);
 assert.deepEqual(Sync.materialize(Sync.merge(merged,a)),materialized);
 const older=Sync.capture(merged,original,'device-b');assert.deepEqual(Sync.materialize(older).skillWorkshop,materialized.skillWorkshop);
});
test('review recommendations use latest version per task and never remove older versions',()=>{
 const a={...record(),id:id(1),at:now},b={...a,id:id(2),at:'2026-10-25T11:30:00.000Z',rubric:[true,true,true]};
 assert.equal(Practice.review([a,b],Date.parse('2026-10-25T12:00:00.000Z')).length,0);
 assert.equal(Practice.review([a,b],Date.parse('2026-11-03T12:00:00.000Z'))[0].id,id(2));assert.equal(Practice.review([a],Date.parse(now)).length,1);
});
test('descriptive writing checks flag mixed language and reasoning review without fabricating a score',()=>{
 const result=Practice.structure('😀 This is my draft. 这是草稿。','c1');assert.equal(result.count,4);assert.ok(result.guidance.some(x=>x.includes('中文')));assert.ok(result.guidance.some(x=>x.includes('证据')));assert.equal(result.score,undefined);
});
