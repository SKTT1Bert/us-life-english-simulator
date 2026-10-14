// One selection coordinates visual vocabulary and the existing dialogue engine.
(() => {
  const root = document.getElementById('view-scenarios');
  const selector = document.getElementById('placeSelect');
  const lessons = window.PICTURE_LESSONS || [];
  if (!root || !selector || !lessons.length) return;
  const byPlace = new Map(lessons.map(lesson => [lesson.placeId, lesson]));
  const tabs = Array.from(root.querySelectorAll('[data-scene-tab]'));
  let selectedPlaceId = null;

  root.querySelector('#scenarioPictureCount').textContent = lessons.length;
  root.querySelector('#sceneGallery').innerHTML = lessons.map(lesson => `
    <button class="scene-card" type="button" data-scene-place="${escapeHTML(lesson.placeId)}" aria-pressed="false" aria-label="选择${escapeHTML(lesson.title)}场景">
      <img src="${escapeHTML(lesson.image)}" width="1536" height="1024" alt="" loading="lazy">
      <span><strong>${escapeHTML(lesson.title)}</strong><small lang="en">${escapeHTML(lesson.english)}</small></span>
    </button>
  `).join('');
  Array.from(selector.options).forEach(option => {
    if (byPlace.has(option.value)) option.textContent += ' · 有图';
  });

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
    root.querySelectorAll('[data-scene-place]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.scenePlace === placeId));
    });
    // Keep the selected card visible in the mobile strip without moving the page.
    const gallery = root.querySelector('#sceneGallery');
    const card = gallery.querySelector('[aria-pressed="true"]');
    if (card && gallery.scrollWidth > gallery.clientWidth) {
      const offset = card.getBoundingClientRect().left - gallery.getBoundingClientRect().left;
      if (offset < 0) gallery.scrollLeft += offset;
      else if (offset + card.offsetWidth > gallery.clientWidth) gallery.scrollLeft += offset + card.offsetWidth - gallery.clientWidth;
    }
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
  root.querySelectorAll('[data-scene-place]').forEach(button => {
    button.addEventListener('click', () => selectPlace(button.dataset.scenePlace));
  });
  selector.addEventListener('change', syncPlace);
  document.addEventListener('scenario:started', syncPlace);
  root.querySelector('#sceneReturnPictureBtn').addEventListener('click', () => window.SceneLearning.openPicture(selector.value));
  root.querySelector('#sceneEmptyDialogueBtn').addEventListener('click', () => window.SceneLearning.openDialogue(selector.value));
  selectPlace(lessons[0].placeId);
  syncPlace();
})();
