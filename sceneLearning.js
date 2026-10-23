// One selection coordinates visual vocabulary and the existing dialogue engine.
(() => {
  const root = document.getElementById('view-scenarios');
  const selector = document.getElementById('placeSelect');
  const lessons = window.PICTURE_LESSONS || [];
  if (!root || !selector || !lessons.length) return;
  const byPlace = new Map(lessons.map(lesson => [lesson.placeId, lesson]));
  const tabs = Array.from(root.querySelectorAll('[data-scene-tab]'));
  let selectedPlaceId = null;
  const categories = [
    { id: 'all', title: '全部场景', places: lessons.map(lesson => lesson.placeId) },
    { id: 'food', title: '餐饮购物', places: ['restaurant', 'supermarket', 'cafe'] },
    { id: 'travel', title: '交通住宿', places: ['gas-auto', 'airport', 'hotel', 'public-transit'] },
    { id: 'services', title: '生活办事', places: ['dmv', 'bank', 'apartment', 'post-office', 'customer-service', 'hair-salon', 'phone-internet', 'insurance-office'] },
    { id: 'care', title: '健康运动', places: ['clinic', 'gym', 'pharmacy', 'vet-pet-clinic', 'dentist'] },
    { id: 'study', title: '校园学习', places: ['campus-office', 'library'] }
  ];
  const gallery = root.querySelector('#sceneGallery');
  const search = root.querySelector('#sceneSearch');
  let category = 'all';
  let expanded = false;
  let visibleLessons = lessons;

  root.querySelector('#scenarioPictureCount').textContent = lessons.length;
  root.querySelector('#sceneCategories').innerHTML = categories.map(item => `
    <button type="button" class="scene-category" data-scene-category="${item.id}" aria-pressed="${item.id === category}">${item.title}<span>${item.places.filter(id => byPlace.has(id)).length}</span></button>
  `).join('');
  Array.from(selector.options).forEach(option => {
    if (byPlace.has(option.value)) option.textContent += ' · 有图';
  });

  function updateGalleryControls() {
    const overflows = gallery.scrollWidth > gallery.clientWidth + 2;
    root.querySelector('#sceneGalleryPrevious').disabled = expanded || !overflows || gallery.scrollLeft <= 2;
    root.querySelector('#sceneGalleryNext').disabled = expanded || !overflows || gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
  }

  function revealSelectedCard() {
    const card = gallery.querySelector('[aria-pressed="true"]');
    if (card && !expanded) {
      const offset = card.getBoundingClientRect().left - gallery.getBoundingClientRect().left;
      if (offset < 0) gallery.scrollLeft += offset - 3;
      else if (offset + card.offsetWidth > gallery.clientWidth) gallery.scrollLeft += offset + card.offsetWidth - gallery.clientWidth + 3;
    }
    updateGalleryControls();
  }

  function renderGallery() {
    const allowed = categories.find(item => item.id === category).places;
    const query = search.value.trim().toLocaleLowerCase();
    visibleLessons = lessons.filter(lesson => allowed.includes(lesson.placeId) && [
      lesson.title, lesson.english, lesson.category,
      ...lesson.words.flatMap(word => [word.word, word.meaning])
    ].join(' ').toLocaleLowerCase().includes(query));
    gallery.innerHTML = visibleLessons.map(lesson => `
      <button class="scene-card" type="button" data-scene-place="${escapeHTML(lesson.placeId)}" aria-pressed="${lesson.placeId === selector.value}" aria-label="选择${escapeHTML(lesson.title)}场景">
        <img src="${escapeHTML(lesson.thumbnail || lesson.image)}" width="1536" height="1024" alt="" loading="lazy" decoding="async">
        <span><strong>${escapeHTML(lesson.title)}</strong><small lang="en">${escapeHTML(lesson.english)}</small></span>
      </button>
    `).join('');
    root.querySelector('#sceneFilterCount').textContent = `${visibleLessons.length} / ${lessons.length} 个场景`;
    root.querySelector('#sceneSearchEmpty').hidden = visibleLessons.length > 0;
    root.querySelectorAll('[data-scene-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sceneCategory === category)));
    gallery.scrollLeft = 0;
    requestAnimationFrame(updateGalleryControls);
  }

  function selectMode(mode, moveFocus = false) {
    tabs.forEach(tab => {
      const selected = tab.dataset.sceneTab === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && moveFocus) tab.focus({ preventScroll: true });
    });
  }

  function syncPlace() {
    const placeId = selector.value;
    const lesson = byPlace.get(placeId);
    if (lesson && !visibleLessons.includes(lesson)) {
      category = 'all';
      search.value = '';
      renderGallery();
    }
    root.querySelectorAll('[data-scene-place]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.scenePlace === placeId));
    });
    // Reveal a selected card without moving the page or changing the learning mode.
    revealSelectedCard();
    const available = root.querySelector('#sceneAvailability');
    available.textContent = lesson
      ? `${lesson.title} · ${lesson.words.length} 个词 · ${lesson.sentences.length} 个例句 · ${lesson.exercises.length} 道填空；可接着练对话。`
      : '这个场所已有对话任务，图片课程正在补充。';
    const preview = root.querySelector('#scenarioImagePreview');
    preview.hidden = !lesson;
    root.querySelector('#view-picture-words').hidden = !lesson;
    root.querySelector('#scenePictureEmpty').hidden = Boolean(lesson);
    if (lesson) {
      const image = root.querySelector('#scenarioSceneImage');
      if (image.getAttribute('src') !== lesson.image) image.src = lesson.image;
      image.alt = lesson.imageAlt;
      root.querySelector('#scenarioSceneCaption').textContent = `${lesson.title} / ${lesson.english}`;
    } else {
      root.querySelector('#scenarioSceneImage').removeAttribute('src');
    }
    if (placeId !== selectedPlaceId) {
      window.PictureLearning.showLesson(lesson);
      selectedPlaceId = placeId;
    }
  }

  function selectPlace(placeId) {
    if (!Array.from(selector.options).some(option => option.value === placeId)) return;
    if (selector.value !== placeId) {
      selector.value = placeId;
      selector.dispatchEvent(new Event('change', { bubbles: true }));
    } else syncPlace();
  }

  window.SceneLearning = {
    openDialogue(placeId) {
      selectPlace(placeId);
      selectMode('dialogue', true);
      root.querySelector('.scene-mode-tabs').scrollIntoView({ block: 'start' });
    },
    openPicture(placeId) {
      selectPlace(placeId);
      selectMode('picture', true);
      root.querySelector('.scene-mode-tabs').scrollIntoView({ block: 'start' });
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectMode(tab.dataset.sceneTab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      selectMode(tabs[next].dataset.sceneTab, true);
    });
  });
  gallery.addEventListener('click', event => {
    const button = event.target.closest('[data-scene-place]');
    if (button) selectPlace(button.dataset.scenePlace);
  });
  root.querySelector('#sceneCategories').addEventListener('click', event => {
    const button = event.target.closest('[data-scene-category]');
    if (!button) return;
    category = button.dataset.sceneCategory;
    renderGallery();
  });
  search.addEventListener('input', renderGallery);
  root.querySelector('#sceneFilterReset').addEventListener('click', () => {
    category = 'all'; search.value = ''; renderGallery(); search.focus();
  });
  root.querySelector('#sceneGalleryExpand').addEventListener('click', event => {
    expanded = !expanded;
    gallery.classList.toggle('is-expanded', expanded);
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    event.currentTarget.textContent = expanded ? '收起场景列表' : '展开全部场景';
    revealSelectedCard();
  });
  root.querySelector('#sceneGalleryPrevious').addEventListener('click', () => gallery.scrollBy({left: -gallery.clientWidth * .85, behavior: 'smooth'}));
  root.querySelector('#sceneGalleryNext').addEventListener('click', () => gallery.scrollBy({left: gallery.clientWidth * .85, behavior: 'smooth'}));
  gallery.addEventListener('scroll', updateGalleryControls, {passive: true});
  new ResizeObserver(revealSelectedCard).observe(gallery);
  selector.addEventListener('change', syncPlace);
  document.addEventListener('scenario:started', syncPlace);
  root.querySelector('#sceneReturnPictureBtn').addEventListener('click', () => window.SceneLearning.openPicture(selector.value));
  root.querySelector('#sceneEmptyDialogueBtn').addEventListener('click', () => window.SceneLearning.openDialogue(selector.value));
  renderGallery();
  selectPlace(lessons[0].placeId);
  syncPlace();
})();
