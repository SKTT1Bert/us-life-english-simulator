(function(root) {
  'use strict';
  const doc = document;
  const el = (tag, cls, text) => { const n = doc.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const btn = (text, action, cls = 'secondary-btn') => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', action); return b; };
  const label = (text, field) => { const l = el('label', 'skill-field', text); l.append(field); return l; };
  const select = (id, options, value, change) => {
    const s = el('select'); s.id = id;
    for (const [v,t] of options) { const o = el('option', '', t); o.value = v; o.selected = v === value; s.append(o); }
    s.addEventListener('change', () => change(s.value)); return s;
  };
  const levels = SkillPractice.LEVELS.map(id => [id, id === 'pre-a1' ? 'Pre-A1 · 零基础' : id.toUpperCase()]);
  const formats = { typed: '手动输入', transcribed: '本机转写', 'edited-transcript': '转写后已人工修改' };
  const day = at => new Date(at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const categoryHelp = { Spelling: '核对拼写；人名和专业术语也可能被误报。', Agreement: '检查主语与动词、名词的单复数是否一致。', Capitalization: '检查句首、专有名词和 I 的大小写。', Punctuation: '检查标点与空格，确认句子的边界清楚。', Repetition: '这里可能重复输入了相同的词。', Redundancy: '这里可能有重复表达的意思，可以考虑精简。' };
  let mounted;
  root.SkillWorkshop = { hasPendingWork: () => mounted?.pending() || false, resetSession: () => mounted?.reset(), refresh: () => mounted?.refresh() };
  root.SkillWorkshop.mount = function(target, options) {
    const tasks = options.catalog.tasks, forms = options.catalog.forms, drafts = new Map(), exams = new Map();
    let taskId = tasks.find(t => t.levelId === options.level() && t.mode === 'writing')?.id || tasks[0].id;
    let pane = 'writing', formId = forms.find(f => f.levelId === options.level())?.id || forms[0].id;
    let pendingRequest = null, activeRecorder = null, player = null, runId = 0, notice = '', reviewOnly = false, requestCleanup = null;
    const task = () => tasks.find(t => t.id === taskId), form = () => forms.find(f => f.id === formId);
    const draft = () => {
      if (!drafts.has(taskId)) drafts.set(taskId, { text: '', original: null, source: 'typed', duration: null, feedback: null, feedbackText: '', rubric: task().rubric.map(() => null), parentId: null, dirty: false, audio: null });
      return drafts.get(taskId);
    };
    const exam = () => {
      if (!exams.has(formId)) exams.set(formId, { answers: form().questions.map(() => null), listens: form().questions.map(() => 0), writing: '', speaking: '', speakingSource: 'typed', rubric: Array(6).fill(null), dirty: false, submitted: null });
      return exams.get(formId);
    };
    const pending = () => [...drafts.values(), ...exams.values()].some(d => d.dirty) || Boolean(pendingRequest || activeRecorder?.active);
    function stopAudio() { if (player) { player.pause(); player.removeAttribute('src'); player.load(); player = null; } target.querySelectorAll('audio').forEach(a => a.pause()); }
    function cancel() { runId++; pendingRequest?.cancel(); pendingRequest = null; requestCleanup?.(); requestCleanup = null; activeRecorder?.cancel(); stopAudio(); }
    function reset() { cancel(); activeRecorder?.dispose(); for(const d of [...drafts.values(),...exams.values()]) if(d.audio?.url) URL.revokeObjectURL(d.audio.url); drafts.clear(); exams.clear(); notice = ''; render(); }
    function open(id, initial) {
      const found = tasks.find(t => t.id === id); if (!found) return false;
      cancel(); taskId = id; pane = found.mode; reviewOnly = false;
      const d = draft(); if (typeof initial === 'string' && !d.dirty) { d.text = initial; d.original = initial; d.dirty = Boolean(initial); d.feedback = null; }
      else if (typeof initial === 'string' && d.dirty && d.text !== initial) notice = '这个任务还有未保存的修改，已为你保留。课程里的文字没有覆盖这里的草稿。';
      root.setView('workshop'); render(); return true;
    }
    root.openSkillWorkshop = open; root.stopSkillWorkshopAudio = stopAudio;
    function play(clip, status, onPlaying) {
      stopAudio(); root.ListeningLab?.stop(); root.speechSynthesis?.cancel();
      clip = root.AudioVoices.resolve(clip);
      const description = clip.synthetic ? `AI 合成 · ${clip.speaker}` : '真人录音';
      const sound = new Audio(clip.src); player = sound; let counted = false;
      status.textContent = `正在加载${description}…`;
      sound.onplaying = () => { if (player !== sound) return; status.textContent = `正在播放${description}…`; if (!counted) { counted = true; onPlaying?.(); } };
      sound.onended = () => { if (player === sound) status.textContent = '播放结束，可以重听。'; };
      sound.onerror = () => { if (player === sound) status.textContent = '录音未能加载，请检查网络后重试。'; };
      sound.play().catch(() => { if (player === sound) status.textContent = '播放未启动，请再次点击。'; });
    }
    function renderChecks(container, titles, values, change) {
      titles.forEach((text,i) => {
        const l = el('label', 'skill-check'), c = el('input'); c.type = 'checkbox'; c.checked = values[i] === true;
        c.addEventListener('change', () => change(i, c.checked)); l.append(c, doc.createTextNode(text)); container.append(l);
      });
    }
    function speechControls(container, getText, setText, data, changed, status) {
      let audioData = data.audio || null;
      const bar = el('div', 'skill-actions'), audioEl = el('audio'); audioEl.controls = true; audioEl.preload = 'metadata'; audioEl.hidden = !audioData;
      if (audioData) audioEl.src = audioData.url;
      const transcribe = btn('本机转写', async () => {
        if (!audioData || pendingRequest) return;
        const current = ++runId, previous = getText(), savedAudio = audioData;
        if (previous.trim() && !confirm('转写结果将替换当前输入框。已有保存记录不会改变；如需保留这段草稿，请先保存或复制。继续转写？')) return;
        audioEl.pause(); stopAudio(); activeRecorder?.cancel(); transcribe.disabled = true; requestCleanup = () => { transcribe.disabled = !audioData; };
        status.textContent = '正在本机加载语音工具并转写。首次约下载 58 MB，请稍候；可以随时停止。';
        pendingRequest = SkillMedia.request('speechFeedback.worker.js', { audio: savedAudio.audio }, p => { if (current === runId) status.textContent = `正在准备语音工具：当前文件 ${p}%。录音只在本机处理。`; });
        try {
          const result = await pendingRequest.promise;
          if (current !== runId) return;
          if (getText() !== previous) { status.textContent = '输入已改变，本次转写没有覆盖你的修改。请重试。'; return; }
          if (!result.text.trim()) { status.textContent = '没有识别到清晰英文，请回放录音后重试。'; return; }
          setText(result.text); data.source = 'transcribed'; data.original = result.text; data.duration = savedAudio.duration; changed();
          status.textContent = '转写完成。请回放核对；识别也会出错，文字差异不能单独证明发音有误。';
        } catch (error) { if (current === runId) status.textContent = error.message; }
        finally { if (current === runId) { pendingRequest = null; transcribe.disabled = !audioData; requestCleanup = null; } }
      }, 'primary-btn'); transcribe.disabled = !audioData;
      activeRecorder?.dispose();
      activeRecorder = SkillMedia.recorder(ready => {
        if(audioData?.url) URL.revokeObjectURL(audioData.url);
        ready.url = URL.createObjectURL(ready.blob); audioData = ready; data.audio = ready; data.dirty = true; changed(); audioEl.src = ready.url; audioEl.hidden = false; transcribe.disabled = false;
      }, message => { status.textContent = message; });
      bar.append(btn('开始录音', () => { if (pendingRequest) return; stopAudio(); audioEl.pause(); activeRecorder.start(); }), btn('结束录音', () => activeRecorder.stop()), transcribe,
        btn('停止处理', () => { cancel(); transcribe.disabled = !audioData; status.textContent = '已停止处理，文字和录音仍在本页。'; }));
      const upload = el('input'); upload.type = 'file'; upload.accept = 'audio/*'; upload.setAttribute('aria-label','选择一段录音');
      upload.addEventListener('change', () => { if (!pendingRequest && upload.files[0]) { activeRecorder.cancel(); activeRecorder.load(upload.files[0]); } upload.value = ''; });
      container.append(el('p', 'skill-note', '录一段不超过 30 秒的英文，或选择不超过 8 MB 的音频。较长回答可分段练习。录音仅留在本页；保存的是文字与反馈，原始录音不参与同步。'), bar, label('也可以选择录音文件',upload), audioEl);
    }
    function renderFeedback(container, d, currentTask) {
      if (!d.feedback || d.feedbackText !== d.text) return;
      const stats = SkillPractice.structure(d.text, currentTask.levelId), section = el('section', 'skill-feedback');
      section.append(el('h3', '', '这次表达可以怎样改进'), el('p', 'skill-note', `${stats.count} 个英文词 · ${stats.sentences} 个句子 · ${stats.paragraphs} 段。Harper 在本机检查语言，不判断事实、论证质量或 CEFR 等级。`));
      for (const message of stats.guidance) section.append(el('p','skill-guidance',message));
      if (!d.feedback.issues.length) section.append(el('p','skill-guidance','本次未发现该工具能识别的语言问题。请继续核对任务是否完成、意思是否准确；这不等于表达没有问题。'));
      for (const issue of d.feedback.issues) {
        const card = el('article','skill-issue');
        card.append(el('strong','',`${SkillPractice.labels[issue.kind] || '语言建议'} · ${issue.excerpt}`), el('p','',categoryHelp[issue.kind] || '结合上下文检查这处表达。建议不一定适用，请确认意思后再修改。'));
        const detail = el('details'); detail.append(el('summary','','查看英文说明'),el('p','',issue.message)); card.append(detail);
        const actions = el('div','skill-actions');
        for (const fix of issue.fixes || []) actions.append(btn(fix.label ? `改为 ${fix.label}` : '删除这部分', () => {
          if (d.feedbackText !== d.text) return;
          d.original ??= d.text; d.text = fix.text; d.feedback = null; d.dirty = true;
          if (d.source === 'transcribed') d.source = 'edited-transcript'; render();
        }, 'small-btn'));
        card.append(actions); section.append(card);
      }
      container.append(section);
    }
    function renderPractice(body) {
      const currentTask = task(), d = draft(), mode = currentTask.mode;
      const filters = el('div','skill-filters');
      filters.append(label('阶段',select('skillLevel',levels,currentTask.levelId,v => { cancel(); taskId = tasks.find(t => t.levelId === v && t.mode === pane).id; render(); })),
        label('练习任务',select('skillTask',tasks.filter(t=>t.levelId===currentTask.levelId && t.mode===pane).map(t=>[t.id,t.title]),taskId,v=>{cancel();taskId=v;render();})));
      body.append(filters);
      const panel = el('section','skill-panel');
      panel.append(el('span','eyebrow',`${currentTask.levelId.toUpperCase()} · ${mode === 'writing' ? 'WRITE · REVISE' : 'SPEAK · REFLECT'}`),el('h3','',currentTask.title),el('p','skill-prompt',currentTask.prompt));
      if (currentTask.lessonId) panel.append(btn('回到这节课',()=>root.openPathwayLesson?.(currentTask.levelId,currentTask.lessonId),'small-btn'));
      const status = el('p','skill-status',notice); status.setAttribute('role','status'); notice = '';
      const input = el('textarea','skill-text'); input.id='skillText'; input.rows=mode==='writing'?10:6; input.maxLength=6000; input.value=d.text; input.spellcheck=false;
      const changed = () => { d.dirty=true; d.feedback=null; result.replaceChildren(); sourceNote.textContent=`文字来源：${formats[d.source]}。${d.source!=='typed'?'请回放确认识别结果。':''}`; };
      input.addEventListener('input',()=>{ if(d.original===null && d.feedbackText) d.original=d.feedbackText; d.text=input.value; if(d.source==='transcribed')d.source='edited-transcript'; changed(); });
      const sourceNote = el('p','skill-note',`文字来源：${formats[d.source]}`), result = el('div');
      if (currentTask.audioId) {
        const clip=root.AudioVoices.find(currentTask.audioId), sample=el('div','skill-example');
        if (clip.synthetic) {
          sample.append(label('AI 示范声线',select('skillVoice',root.AudioVoices.voices.map(v=>[v.id,v.label]),root.AudioVoices.current().id,v=>{stopAudio();const saved=root.AudioVoices.choose(v);status.textContent=`已切换为${root.AudioVoices.current().label}。${saved?'选择已在本机记住。':'本次选择可用，但浏览器未能记住偏好。'}你的文字和练习记录已保留。`;})));
        }
        sample.append(btn(clip.synthetic?'播放 AI 示范':'播放真人示范',()=>play(clip,status)),el('p','',clip.text),el('p','skill-note',clip.translation));
        const credit=el('a','skill-note',clip.synthetic?'AI 合成 · 通用声线 · 声音来源与说明':`录音：${clip.speaker} · CC BY-SA 4.0 · Tatoeba`);credit.href=clip.synthetic?'https://github.com/SKTT1Bert/us-life-english-simulator/blob/main/AI-AUDIO-CREDITS.md':clip.sourceUrl;credit.target='_blank';credit.rel='noopener noreferrer';sample.append(credit);panel.append(sample);
      }
      if (mode==='speaking') speechControls(panel,()=>d.text,t=>{d.text=t;input.value=t;},d,changed,status);
      panel.append(label(mode==='writing'?'写下你的英文（最多 6000 个字符）':'你的口语转写，也可以直接输入',input),sourceNote);
      const actions = el('div','skill-actions');
      const check = btn('检查表达并给出建议',async()=>{
        if(pendingRequest)return;
        const text=d.text;if(!text.trim()){status.textContent='先写下或转写一段英文，再检查。';return;}
        if(!SkillPractice.words(text).length){status.textContent='请先输入英文；检查工具不会评价中文。';return;}
        d.original??=text;const current=++runId;check.disabled=true;requestCleanup=()=>{check.disabled=false;};status.textContent='正在本机检查，首次约下载 20 MB。作文不会发送给分析服务。';
        pendingRequest=SkillMedia.request('languageFeedback.worker.js',{text});
        try{const feedback=await pendingRequest.promise;if(current!==runId)return;if(d.text!==text){status.textContent='文字已修改，旧反馈已忽略。请重新检查。';return;}d.feedback=feedback;d.feedbackText=text;d.dirty=true;result.replaceChildren();renderFeedback(result,d,currentTask);status.textContent='语言检查完成。请自行确认建议是否符合原意。';}
        catch(error){if(current===runId)status.textContent=error.message;}
        finally{if(current===runId){pendingRequest=null;check.disabled=false;requestCleanup=null;}}
      },'primary-btn');
      actions.append(check,btn('停止检查',()=>{cancel();check.disabled=false;status.textContent='已停止检查，输入保留。';}));
      if(currentTask.reference) actions.append(btn('对照原句找差异',()=>{
        if(!d.text.trim()){status.textContent='先录音转写或输入文字。';return;}
        try{const comparison=ListeningLab.evaluate(currentTask.reference,d.text);result.replaceChildren();result.append(el('p','skill-note',`${formats[d.source]}与原句有 ${comparison.matchedTokens}/${comparison.tokenCount} 个词匹配。这是文字核对，不是发音分数；先确认识别准确。`));
        const differences=comparison.alignment.filter(a=>a.kind!=='match');for(const item of differences)result.append(el('p','skill-guidance',item.kind==='missing'?`原句有“${item.expected}”，当前文字中没有。`:item.kind==='extra'?`当前文字多出“${item.actual}”。`:`原句是“${item.expected}”，当前文字是“${item.actual}”。`));if(!differences.length)result.append(el('p','skill-guidance','文字与原句一致。接着回放，留意重读和语调。'));}
        catch(error){status.textContent=error.message;}
      }));
      panel.append(actions,status,result);renderFeedback(result,d,currentTask);
      const checks=el('fieldset','skill-rubric');checks.append(el('legend','','任务完成自评（由你确认，不是机器评分）'));
      renderChecks(checks,currentTask.rubric,d.rubric,(i,v)=>{d.rubric[i]=v;d.dirty=true;});panel.append(checks);
      if(currentTask.model){const model=el('details','skill-model');model.append(el('summary','','查看参考表达'),el('p','',currentTask.model));panel.append(model);}
      panel.append(btn('保存这次练习',()=>{
        if(pendingRequest||activeRecorder?.active){status.textContent='请先结束录音或检查，再保存。';return;}
        if(!d.text.trim()){status.textContent='请先写下或转写表达。';return;}
        const feedback=d.feedback&&d.feedbackText===d.text?{engine:d.feedback.engine,issues:d.feedback.issues.map(({kind,message,excerpt})=>({kind,message,excerpt}))}:null;
        try{const record={taskId,source:d.source,original:d.original??d.text,text:d.text,rubric:d.rubric,feedback,parentId:d.parentId,duration:d.source==='typed'?null:d.duration};
          if(options.commit('attempts',record)===false){status.textContent='保存未成功，草稿仍在本页。请先复制文字或导出已有记录。';return;}
          const saved=options.progress().attempts.filter(a=>a.taskId===taskId).at(-1);d.parentId=saved.id;d.dirty=false;notice='已保存文字与反馈，并加入学习记录。录音只留在本页。';render();}
        catch(error){status.textContent=error.message;}
      },'primary-btn'));
      panel.append(btn('放弃这个任务的未保存修改',()=>{
        if(!d.dirty){status.textContent='当前没有未保存的文字修改。';return;}
        if(!confirm('放弃这个任务尚未保存的文字和录音？已保存的所有版本都会保留。'))return;
        cancel();if(d.audio?.url)URL.revokeObjectURL(d.audio.url);drafts.delete(taskId);notice='未保存的修改已放弃，历史记录保留。';render();
      },'small-btn'));
      body.append(panel);renderHistory(body,currentTask);
    }
    function renderHistory(body,currentTask){
      const records=options.progress().attempts.filter(a=>a.taskId===currentTask.id).slice().reverse();
      const section=el('section','skill-panel');section.append(el('h3','','这项任务的练习记录'),el('p','skill-note','每次保存都保留独立版本。继续修改会生成新记录，不覆盖原文。'));
      if(!records.length)section.append(el('p','','完成后保存，就能在这里回看。'));
      for(const a of records.slice(0,10)){
        const detail=el('details','skill-history');detail.append(el('summary','',`${day(a.at)} · ${formats[a.source]} · ${a.feedback?`${a.feedback.issues.length} 条语言建议`:'未做语言检查'}`));
        detail.append(el('p','skill-history-text',a.text));if(a.original!==a.text){detail.append(el('h4','','这一版修改前的文字'),el('p','skill-history-text',a.original));}
        if(a.feedback)for(const i of a.feedback.issues)detail.append(el('p','skill-note',`${i.excerpt} — ${i.message}`));
        detail.append(btn('从这一版继续修改',()=>{const d=draft();if(d.dirty&&!confirm('当前还有未保存的草稿。继续会用这条已保存记录开始修改，是否继续？'))return;cancel();Object.assign(d,{text:a.text,original:a.text,source:a.source,duration:a.duration,rubric:[...a.rubric],parentId:a.id,feedback:null,feedbackText:'',dirty:true});render();},'small-btn'));section.append(detail);
      }
      if(records.length>10)section.append(el('p','skill-note',`还有 ${records.length-10} 条更早记录，完整内容保存在导出文件中。`));body.append(section);
    }
    function renderAssessment(body){
      const f=form(),d=exam();
      const filters=el('div','skill-filters');filters.append(label('阶段',select('skillAssessmentLevel',levels,f.levelId,v=>{cancel();formId=forms.find(x=>x.levelId===v).id;render();})),
        label('试卷',select('skillAssessmentForm',forms.filter(x=>x.levelId===f.levelId).map(x=>[x.id,`${x.variant} 卷 · ${options.progress().assessments.filter(a=>a.formId===x.id).length} 次已保存`]),formId,v=>{cancel();formId=v;render();})));
      body.append(filters,el('p','skill-note','每卷 6 道客观题，再加写作与口语。阶段标签用于安排练习；题量有限，未经过难度校准，不能认证 CEFR 等级。重复同一卷会受到记忆影响，建议复测时换另一卷。'));
      if(d.submitted){renderAssessmentResult(body,d.submitted,f);return;}
      const status=el('p','skill-status',notice);status.setAttribute('role','status');notice='';
      const panel=el('section','skill-panel');panel.append(el('h3','',`${f.levelId.toUpperCase()} · ${f.variant} 卷`),el('p','skill-passage',f.passage));
      f.questions.forEach((q,i)=>{
        const field=el('fieldset','skill-question');field.append(el('legend','',`${i+1}. ${q.prompt}`));
        if(q.audioId){const clip=root.HUMAN_AUDIO.find(c=>c.id===q.audioId);const audioStatus=el('p','skill-note');audioStatus.setAttribute('role','status');field.append(btn('播放本题真人录音',()=>play(clip,audioStatus,()=>{d.listens[i]=Math.min(99,d.listens[i]+1);d.dirty=true;}),'small-btn'),audioStatus);}
        q.options.forEach((text,j)=>{const c=el('input');c.type='radio';c.name=`skill-q-${i}`;c.value=j;c.checked=d.answers[i]===j;c.addEventListener('change',()=>{d.answers[i]=j;d.dirty=true;});const option=el('label','skill-answer');option.append(c,doc.createTextNode(text));field.append(option);});
        panel.append(field);
      });
      const writing=el('textarea','skill-text');writing.id='assessmentWriting';writing.maxLength=6000;writing.rows=7;writing.value=d.writing;writing.addEventListener('input',()=>{d.writing=writing.value;d.dirty=true;});panel.append(el('h3','','写作任务'),el('p','',f.writing),label('独立写作后提交；语言建议在提交后使用',writing));
      const speaking=el('textarea','skill-text');speaking.id='assessmentSpeaking';speaking.maxLength=6000;speaking.rows=4;speaking.value=d.speaking;
      const speechData={source:d.speakingSource,original:null,duration:null,audio:d.audio||null};
      speaking.addEventListener('input',()=>{d.speaking=speaking.value;if(d.speakingSource==='transcribed')d.speakingSource='edited-transcript';speechData.source=d.speakingSource;d.dirty=true;});
      panel.append(el('h3','','口语任务'),el('p','',f.speaking));
      speechControls(panel,()=>d.speaking,t=>{d.speaking=t;speaking.value=t;},speechData,()=>{d.speakingSource=speechData.source;d.audio=speechData.audio;d.dirty=true;},status);
      panel.append(label('口语转写（手动输入会单独标注）',speaking));
      const checks=el('fieldset','skill-rubric');checks.append(el('legend','','表达任务自评；未勾选表示尚未确认'));
      renderChecks(checks,[...f.rubric.map(x=>`写作：${x}`),...f.rubric.map(x=>`口语：${x}`)],d.rubric,(i,v)=>{d.rubric[i]=v;d.dirty=true;});panel.append(checks,status);
      panel.append(btn('提交本次小测',()=>{
        if(pendingRequest||activeRecorder?.active){status.textContent='请先结束录音或转写，再提交。';return;}
        if(d.answers.every(a=>a===null)&&!d.writing.trim()&&!d.speaking.trim()){status.textContent='请至少完成一项任务后再提交。';return;}
        try{if(options.commit('assessments',{formId,answers:d.answers,listens:d.listens,writing:d.writing,speaking:d.speaking,speakingSource:d.speakingSource,rubric:d.rubric})===false){status.textContent='未能保存，作答仍在本页。';return;}d.submitted=options.progress().assessments.filter(a=>a.formId===formId).at(-1);d.dirty=false;cancel();render();}
        catch(error){status.textContent=error.message;}
      },'primary-btn'),btn('放弃本卷草稿',()=>{if(!d.dirty){status.textContent='当前没有作答草稿。';return;}if(!confirm('放弃本卷尚未提交的作答和录音？以前提交的成绩都会保留。'))return;cancel();if(d.audio?.url)URL.revokeObjectURL(d.audio.url);exams.delete(formId);render();},'small-btn'),el('p','skill-note','未作答或未播放音频的题目会如实标注。写作与口语不计入机器总分。'));body.append(panel);
      renderAssessmentHistory(body,f);
    }
    function renderAssessmentResult(body,record,f){
      const panel=el('section','skill-panel');panel.append(el('h3','',`已保存 · ${f.variant} 卷反馈`));const scores=SkillProgress.score(record,f),stats=el('div','skill-score-grid');
      for(const [key,name]of[['listening','听力'],['reading','阅读'],['language','语言运用']]){const s=scores[key],card=el('div','skill-score');card.append(el('strong','',`${s.correct}/${s.total}`),el('span','',name),el('small','',`作答 ${s.answered}/${s.total}${key==='listening'?` · 实际播放 ${s.heard}/${s.total}`:''}`));stats.append(card);}panel.append(stats);
      const speakingLabel=record.speaking.trim()?formats[record.speakingSource]:'未完成';panel.append(el('p','skill-note',`写作：${record.writing.trim()?'已提交文本':'未完成'}；口语：${speakingLabel}。文字检查和自评不等同于专业教师的口语、写作评分。`));
      f.questions.forEach((q,i)=>{const detail=el('details','skill-history');const ok=record.answers[i]===q.answer&&(q.skill!=='listening'||record.listens[i]>0);detail.append(el('summary','',`${i+1}. ${ok?'答对':record.answers[i]===null?'未作答':q.skill==='listening'&&!record.listens[i]?'未播放录音，未计入听力表现':'再看解析'} · ${q.prompt}`),el('p','',`你的答案：${record.answers[i]===null?'未作答':q.options[record.answers[i]]}`),el('p','',`参考答案：${q.options[q.answer]}`),el('p','',q.explanation));
        if(q.audioId){const clip=root.HUMAN_AUDIO.find(c=>c.id===q.audioId);detail.append(el('p','',clip.text),el('p','skill-note',clip.translation));const st=el('p','skill-note');detail.append(btn('重听真人录音',()=>play(clip,st),'small-btn'),st);}panel.append(detail);});
      for(const mode of ['writing','speaking']){const p=el('details','skill-history');p.append(el('summary','',mode==='writing'?'查看写作与自评':'查看口语与自评'),el('p','skill-history-text',record[mode]||'未提交文本'));for(let i=0;i<3;i++)p.append(el('p','skill-note',`${record.rubric[i+(mode==='writing'?0:3)]===true?'已自评完成':'尚未确认'}：${f.rubric[i]}`));panel.append(p);}
      panel.append(btn('修改写作并获取反馈',()=>open(`${f.id}-writing`,record.writing)),btn('改进口语表达',()=>open(`${f.id}-speaking`,record.speaking)),btn('返回阶段课程',()=>{const first=options.pathway.find(l=>l.id===f.levelId)?.lessons[0];if(first)root.openPathwayLesson(f.levelId,first.id);},'small-btn'));
      panel.append(btn('另做一份小测',()=>{cancel();exams.delete(formId);formId=forms.find(x=>x.levelId===f.levelId&&x.id!==f.id).id;render();},'primary-btn'));body.append(panel);renderAssessmentHistory(body,f);
    }
    function renderAssessmentHistory(body,f){const history=el('section','skill-panel');history.append(el('h3','','这个阶段的测评记录'));
      const records=options.progress().assessments.filter(a=>forms.find(x=>x.id===a.formId)?.levelId===f.levelId).slice().reverse();
      if(!records.length)history.append(el('p','','还没有已保存的小测。'));
      for(const a of records.slice(0,10)){const af=forms.find(x=>x.id===a.formId);history.append(btn(`${day(a.at)} · ${af.variant} 卷 · 查看反馈`,()=>{const existing=exams.get(a.formId);if(existing?.dirty&&!confirm('这份卷子有未提交的作答。放弃这份草稿并查看已保存的反馈？'))return;cancel();formId=a.formId;const current=exam();current.submitted=a;current.dirty=false;render();},'small-btn'));}body.append(history);}
    function renderReview(body){const items=reviewOnly?SkillPractice.review(options.progress().attempts):options.progress().attempts.slice().reverse();
      const header=el('div','skill-actions');header.append(btn(reviewOnly?'查看全部记录':'只看建议再练',()=>{reviewOnly=!reviewOnly;render();}));body.append(header,el('p','skill-note','语言建议尚未处理、自评尚未完成，或超过 7 天未练的任务会进入建议再练。每次练习仍保留原记录。'));
      const seen=new Set();for(const a of items){if(seen.has(a.taskId))continue;seen.add(a.taskId);const t=tasks.find(t=>t.id===a.taskId),card=el('article','skill-panel');card.append(el('span','eyebrow',`${t.levelId.toUpperCase()} · ${t.mode==='writing'?'写作':'口语'}`),el('h3','',t.title),el('p','skill-note',`最近保存：${day(a.at)} · ${a.feedback?`${a.feedback.issues.length} 条语言建议`:'未做语言检查'}`),btn('继续练习',()=>{const existing=drafts.get(a.taskId);if(!existing?.dirty)drafts.set(a.taskId,{text:a.text,original:a.text,source:a.source,duration:a.duration,rubric:[...a.rubric],feedback:null,feedbackText:'',parentId:a.id,dirty:false,audio:null});open(a.taskId);},'primary-btn'));body.append(card);}
      if(!seen.size)body.append(el('p','skill-empty',reviewOnly?'暂时没有建议再练的任务。可以挑一节新课试试。':'保存一段表达后，就能在这里回顾和改进。'));}
    function render(){
      cancel();activeRecorder?.dispose();activeRecorder=null;target.replaceChildren();
      const body=el('div','skill-workshop'),header=el('header','skill-header');header.append(el('span','eyebrow','YOUR VOICE · YOUR WORDS'),el('h2','','口语与写作工坊'),el('p','','让表达得到反馈，让修改留下痕迹。先完成任务，再听回放、改文字，最后用阶段小测检查进步。'));
      header.append(el('p','skill-note','工具按需加载：写作检查首次约 20 MB，语音转写首次约 58 MB。分析在本机完成；开启加密同步后，已保存的文字和反馈会随学习记录同步，原始录音不会上传。'));
      const tabs=el('nav','skill-tabs');tabs.setAttribute('aria-label','表达工坊功能');
      for(const [id,title]of[['writing','写作反馈'],['speaking','口语反馈'],['review','复习与修改'],['assessment','阶段小测']]){const b=btn(title,()=>{cancel();pane=id;if(['writing','speaking'].includes(id)&&task().mode!==id)taskId=tasks.find(t=>t.levelId===task().levelId&&t.mode===id).id;if(id==='review')reviewOnly=true;render();},id===pane?'primary-btn':'secondary-btn');if(id===pane)b.setAttribute('aria-current','page');tabs.append(b);}header.append(tabs);body.append(header);
      const unsavedTasks=[...drafts.entries()].filter(([,d])=>d.dirty),unsavedExams=[...exams.entries()].filter(([,d])=>d.dirty);
      if(unsavedTasks.length+unsavedExams.length){const pending=el('details','skill-panel');pending.append(el('summary','',`还有 ${unsavedTasks.length+unsavedExams.length} 项未保存内容`));for(const [id]of unsavedTasks){const t=tasks.find(t=>t.id===id);pending.append(btn(`${t.levelId.toUpperCase()} · ${t.title} · ${t.mode==='writing'?'写作':'口语'}`,()=>open(id),'small-btn'));}for(const [id]of unsavedExams){const f=forms.find(f=>f.id===id);pending.append(btn(`${f.levelId.toUpperCase()} · ${f.variant} 卷草稿`,()=>{cancel();pane='assessment';formId=id;exam().submitted=null;render();},'small-btn'));}body.append(pending);}
      if(pane==='assessment')renderAssessment(body);else if(pane==='review')renderReview(body);else renderPractice(body);target.append(body);
    }
    const viewChanged=e=>{if(e.detail?.view!=='workshop'){cancel();target.querySelectorAll('audio').forEach(a=>a.pause());}else if(!pending())render();};
    root.addEventListener('daily-english-view',viewChanged);root.addEventListener('pagehide',cancel);doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel();});
    root.addEventListener('beforeunload',e=>{if(pending()){e.preventDefault();e.returnValue='';}});
    mounted={pending,reset,refresh:()=>{if(!pending()&&target.classList.contains('active'))render();}};render();return mounted;
  };
})(window);
