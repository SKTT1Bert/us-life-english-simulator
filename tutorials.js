(() => {
  const courses = [
    {id:'word-parts',title:'词根词缀',english:'Word Building',description:'把长单词拆小一点。从词根、前缀和后缀入手，读懂单词的结构，再用语境确认意思。',goal:'看结构 · 推词义 · 用语境验证',parts:['un','help','ful'],labels:['前缀','词基','后缀'],example:'unhelpful',meaning:'没有帮助的',lessons:window.WORD_PARTS_LESSONS || [],other:'phonics',otherLabel:'继续学习自然拼读'},
    {id:'phonics',title:'自然拼读',english:'Phonics',description:'把字母和声音连起来。从短元音到常见字母组合，练习看词、拆音、合音，再听完整单词。',goal:'认字母组合 · 逐音拼合 · 听词跟读',parts:['/k/','/æ/','/t/'],labels:['c','a','t'],example:'cat',meaning:'/kæt/ · 猫',lessons:window.PHONICS_LESSONS || [],other:'word-parts',otherLabel:'继续学习词根词缀'}
  ];
  const tabs = Array.from(document.querySelectorAll('[data-course]'));
  function selectCourse(id, focus=false) {
    tabs.forEach(tab => {
      const selected=tab.dataset.course===id;
      tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected?0:-1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
      if(selected && focus) tab.focus({preventScroll:true});
    });
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',()=>selectCourse(tab.dataset.course));
    tab.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'?(i+1)%tabs.length:event.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
      if(next===null)return; event.preventDefault();selectCourse(tabs[next].dataset.course,true);
    });
  });
  courses.forEach(course=>{
    const root=document.getElementById(`view-${course.id}`), answers=new Map(); let current=0, speechRun=0;
    root.innerHTML=`<div class="tutorial-hero"><div class="tutorial-hero-copy"><span class="eyebrow">${course.english} / 基础教程</span><h2>${course.title}<span>从规律开始，学得更明白。</span></h2><p>${course.description}</p><div class="tutorial-meta"><span>${course.lessons.length} 节入门课</span><span>每课约 5–7 分钟</span><span>讲解 + 例词 + 练习</span></div></div><div class="tutorial-preview" aria-label="${course.example} 拆解示例"><span class="tutorial-preview-label">${course.goal}</span><div class="tutorial-parts">${course.parts.map((part,i)=>`${i?'<span class="tutorial-plus" aria-hidden="true">+</span>':''}<div><strong lang="en">${part}</strong><span>${course.labels[i]}</span></div>`).join('')}</div><p><strong lang="en">${course.example}</strong><span>${course.meaning}</span></p></div></div>
      <div class="tutorial-course-heading"><h3>学习路线</h3><span>按顺序入门，也可以直接选课</span></div>
      <nav class="tutorial-lessons" aria-label="${course.title}课程目录">${course.lessons.map((lesson,i)=>`<button type="button" class="tutorial-lesson" data-lesson="${i}"><span class="tutorial-lesson-number">${String(i+1).padStart(2,'0')}</span><span><strong>${escapeHTML(lesson.title)}</strong><small lang="en">${escapeHTML(lesson.subtitle)}</small></span></button>`).join('')}</nav>
      <article class="tutorial-article" aria-labelledby="${course.id}-lesson-title"></article>`;
    const article=root.querySelector('.tutorial-article');
    root.querySelectorAll('[data-lesson]').forEach(btn=>btn.addEventListener('click',()=>selectLesson(Number(btn.dataset.lesson),true)));
    function selectLesson(i,focus=false){
      const lesson=course.lessons[i];if(!lesson)return;current=i;
      root.querySelectorAll('[data-lesson]').forEach(btn=>{const selected=Number(btn.dataset.lesson)===i;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','step');else btn.removeAttribute('aria-current');});
      article.innerHTML=`<div class="tutorial-article-heading"><div><span class="eyebrow">Lesson ${String(i+1).padStart(2,'0')} / ${String(course.lessons.length).padStart(2,'0')}</span><h3 id="${course.id}-lesson-title" tabindex="-1">${escapeHTML(lesson.title)}</h3></div><span class="badge">${escapeHTML(lesson.duration)}</span></div><p class="tutorial-intro">${escapeHTML(lesson.intro)}</p>
        <div class="tutorial-body"><section class="tutorial-explanation" aria-label="本课讲解"><ol class="tutorial-steps">${lesson.steps.map(step=>`<li><h4>${escapeHTML(step.title)}</h4><p>${escapeHTML(step.text)}</p></li>`).join('')}</ol><div class="tutorial-tip"><strong>记住这个小提醒</strong><p>${escapeHTML(lesson.tip)}</p></div></section>
        <section class="tutorial-examples" aria-label="例词拆解"><h4>拆开看，再读一遍</h4>${lesson.examples.map((ex,n)=>`<div class="tutorial-example"><div class="tutorial-example-heading"><div><strong lang="en">${escapeHTML(ex.word)}</strong><span>${escapeHTML(ex.meaning)}</span></div><button type="button" class="small-btn" data-speak-example="${n}" aria-label="朗读单词 ${escapeHTML(ex.word)}">朗读</button></div><p class="tutorial-breakdown" lang="en">${escapeHTML(ex.breakdown)}</p><p class="tutorial-example-note">${escapeHTML(ex.note)}</p></div>`).join('')}<p class="tutorial-audio-note">朗读使用设备的英语语音，播放完整单词；拆音请结合上方标注练习。</p><p class="tutorial-speech-status" role="status"></p></section></div>
        <section class="tutorial-practice" aria-labelledby="${course.id}-quiz-title"><span class="eyebrow">Try it / 随堂练习</span><h4 id="${course.id}-quiz-title">${escapeHTML(lesson.quiz.question)}</h4><div class="tutorial-options">${lesson.quiz.options.map((option,n)=>`<button type="button" class="quiz-option" data-answer="${n}">${escapeHTML(option)}</button>`).join('')}</div><p class="tutorial-feedback" role="status"></p><button type="button" class="small-btn tutorial-retry" hidden>再练一次</button></section>
        <div class="tutorial-footer"><button type="button" class="ghost-btn tutorial-previous" ${i===0?'disabled':''}>← 上一课</button><span>${i+1} / ${course.lessons.length}</span><button type="button" class="primary-btn tutorial-next">${i===course.lessons.length-1?course.otherLabel+' →':'下一课 →'}</button></div>`;
      article.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{if(answers.has(lesson.id))return;answers.set(lesson.id,Number(btn.dataset.answer));showAnswer(lesson);}));
      article.querySelector('.tutorial-retry').addEventListener('click',()=>{answers.delete(lesson.id);showAnswer(lesson);article.querySelector('[data-answer]').focus({preventScroll:true});});
      article.querySelector('.tutorial-previous').addEventListener('click',()=>selectLesson(current-1,true));
      article.querySelector('.tutorial-next').addEventListener('click',()=>{if(current<course.lessons.length-1)selectLesson(current+1,true);else {selectCourse(course.other,true);document.querySelector('.foundations-tabs').scrollIntoView({block:'start'});}});
      article.querySelectorAll('[data-speak-example]').forEach(btn=>btn.addEventListener('click',()=>read(lesson.examples[Number(btn.dataset.speakExample)].speak)));
      showAnswer(lesson);
      if(focus){const heading=article.querySelector('h3');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}
    }
    function showAnswer(lesson){
      const selected=answers.get(lesson.id), answered=selected!==undefined;
      article.querySelectorAll('[data-answer]').forEach(btn=>{const n=Number(btn.dataset.answer);btn.disabled=answered;btn.classList.toggle('correct',answered && n===lesson.quiz.answer);btn.classList.toggle('wrong',answered && n===selected && n!==lesson.quiz.answer);});
      article.querySelector('.tutorial-feedback').textContent=answered?`${selected===lesson.quiz.answer?'答对了！':`再想一想：正确答案是「${lesson.quiz.options[lesson.quiz.answer]}」。`} ${lesson.quiz.explanation}`:'选择一个答案，查看解析。练习结果仅在本次页面打开期间保留。';
      article.querySelector('.tutorial-retry').hidden=!answered;
    }
    function read(text){
      const status=article.querySelector('.tutorial-speech-status');
      if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){status.textContent='当前浏览器不支持朗读，请参考单词标注练习。';return;}
      const run=++speechRun;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.8;
      status.textContent=`正在准备朗读：${text}`;u.onend=()=>{if(run===speechRun)status.textContent='朗读结束，试着跟读一遍。';};u.onerror=e=>{if(run===speechRun && !['interrupted','canceled'].includes(e.error))status.textContent='暂时无法朗读，请检查设备英语语音或稍后重试。';};window.speechSynthesis.speak(u);
    }
    selectLesson(0);
  });
})();
