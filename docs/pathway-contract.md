# Learning pathway authoring contract

This development contract defines the original bilingual curriculum and local learning records. Levels are editorial alignment to CEFR descriptors, not validated placement or certification. Pre-A1 is the beginner bridge. Existing foundation lessons remain usable and are linked by stable ID.

## Content

`data/pathwayStarter.js` exports `window.PATHWAY_STARTER` (pre-a1, a1, a2); `data/pathwayAdvanced.js` exports `window.PATHWAY_ADVANCED` (b1, b2, c1). Each contains three level objects:

```js
{
 id: 'a1', label: 'A1', title: '...', description: '...', canDo: ['...', '...', '...'],
 sources: [{label: '...', url: 'https://...'}],
 foundations: [{course: 'phonics', lessonId: '...', label: '...'}],
 lessons: [{
   id: 'a1-introductions', title: '...', skill: '...', minutes: 20,
   goals: ['...', '...'],
   explanation: [{title: '...', text: '...'}, {title: '...', text: '...'}],
   vocabulary: [{word:'...', meaning:'...', example:'...'}],
   reading: {title:'...', text:'...', support:'中文阅读支架，不是全文翻译'},
   listening: {title:'...', text:'英文原创听力文本', focus:'听前任务'},
   questions: [{id:'a1-introductions-q1', skill:'reading', prompt:'...', options:['...', '...', '...'], answer:0, explanation:'...'}],
   production: {writing:'...', speaking:'...', model:'...', rubric:['...', '...', '...']},
   review: {prompt:'不显示答案的主动回忆任务', answer:'核对要点及一个参考回答'},
 }],
 assessment: {
   reading: {title:'...', text:'新材料，与课内材料不同'},
   listening: {title:'...', text:'新材料'},
   questions: [{id:'a1-check-q1', skill:'reading', prompt:'...', options:['...', '...', '...'], answer:0, explanation:'...'}],
   writing:'...', speaking:'...', rubric:['...', '...', '...'], model:'...'
 }
}
```

Each level has 8 substantive lessons. Each lesson has 4 unique questions (at least one reading and one listening), 3+ vocabulary entries, two explanation sections, original reading and listening, both productive tasks and actionable rubric, and a distinct recall prompt. Each assessment has 8 NEW questions (4 reading, 4 listening) plus writing/speaking and a 3-item rubric. Upper-level texts/questions require inference, evidence, stance, synthesis and limitations, not merely identifying a word. All experimental findings in authored academic texts must be labeled fictional teaching examples. Sources verify instructional framing; don't reproduce protected passages or tests. Don't imply these 48 lessons exhaust C1 vocabulary or teaching hours.

## State API

`pathwayProgress.js`: UMD `window.PathwayProgress` and CommonJS. Pure immutable operations take `(progress, catalog, ...)` where catalog is the merged level array. State lives in optional schema-v3 `pathwayProgress`, version 1, included in main import/export. `empty()`, `restore(value, catalog)`, `visit(progress,catalog,levelId,lessonId)`, `answer(progress,catalog,lessonId,index,option,now?)`, `retry(progress,catalog,lessonId,now?)`, `saveProduction(progress,catalog,lessonId,{writing,speaking,checks},now?)`, `review(progress,catalog,lessonId,grade,now?)`, `assess(progress,catalog,levelId,{answers,writing,speaking,checks,transcriptUsed},now?)`, `summary(progress,catalog,levelId,now?)`.

State shape: `{version:1,levelId:'pre-a1',lessonId:null,lessons:{[id]:{answers:[null,...],writing:'',speaking:'',checks:[false,false,false],dueAt:null,reviews:0,lastReviewAt:null,updatedAt:ISO}},assessments:{[levelId]:[{answers:[0,...],writing:'',speaking:'',checks:[false,false,false],transcriptUsed:false,submittedAt:ISO}]}}`. `speaking` stores a rehearsal note/transcript, not audio. Missing optional field yields empty state. Strict lengths, IDs, enums, bounded text, timestamps, history cap 10 per level. Reject invalid payloads. Lesson objective completion and production self-check tracked separately; do not assert language mastery. Reviews schedule only after all four answers correct and productive work saved with all checks; review grade `again|hard|good`, due-only to prevent repeated immediate scheduling; preserve latest record, increment reviews, update dueAt (again 1 day, hard 3, good 7 initially then 14/30 capped). Assessments require every answer, both nonempty production texts and three boolean checks (false allowed); retain latest 10, do not change lesson progress or label CEFR achieved. Objective score derived, never trusted from imports. `summary` returns `{lessons,total,objectiveComplete,productionComplete,completed,due,assessmentCount,latestScore}` where lessons is total level lesson count (same as total), latestScore is null or correct count out of 8. Precise API refinements must be communicated to root.
