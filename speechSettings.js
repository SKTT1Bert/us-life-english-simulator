(() => {
  'use strict';
  const dialog = document.getElementById('speechSettingsDialog'), voice = document.getElementById('globalVoice'), mode = document.getElementById('speechMode');
  const status = document.getElementById('speechSettingsStatus'), globalStatus = document.getElementById('globalSpeechStatus');
  const expanded = document.getElementById('allowExpandedSpeech'), download = document.getElementById('speechDownloadDialog');
  let awaitingChoice = false;
  for (const item of AudioVoices.voices) { const option = document.createElement('option'); option.value = item.id; option.textContent = item.label; voice.append(option); }
  function refresh() {
    voice.value = AudioVoices.current().id; mode.value = EnglishSpeech.mode();
    expanded.checked = EnglishSpeech.expandedEnabled();
    document.getElementById('voiceDescription').textContent = AudioVoices.current().description;
    const current = EnglishSpeech.mode() === 'device' ? '设备朗读' : AudioVoices.current().label;
    document.getElementById('openSpeechSettings').textContent = `朗读设置 · ${current}`;
  }
  document.getElementById('openSpeechSettings').addEventListener('click', () => { refresh(); dialog.showModal(); });
  voice.addEventListener('change', () => {
    const chosen = voice.value;
    EnglishSpeech.setMode('ai'); const saved = AudioVoices.choose(chosen); refresh();
    status.textContent = `已统一使用${AudioVoices.current().label}。${saved ? '本机已记住选择。' : '本次选择生效，但浏览器未能保存偏好。'}已有学习记录已保留。`;
  });
  mode.addEventListener('change', () => { const saved = EnglishSpeech.setMode(mode.value); refresh(); status.textContent = `朗读方式已切换。${saved ? '本机已记住选择。' : '本次选择生效，但浏览器未能保存偏好。'}`; });
  expanded.addEventListener('change', () => {
    const saved = EnglishSpeech.setExpanded(expanded.checked);
    status.textContent = `${expanded.checked ? '下次需要时可使用扩展 AI 朗读；现在不会下载。' : '已关闭自动扩展朗读，下次需要下载时会先让你选择。'}${saved ? '' : '本次设置生效，但浏览器未能保存偏好。'}`;
  });
  window.addEventListener('daily-english-speech-choice', event => {
    awaitingChoice = event.detail.open;
    if (awaitingChoice) {
      document.getElementById('downloadVoiceName').textContent = AudioVoices.current().label;
      if (!download.open) download.showModal();
    } else if (download.open) download.close();
  });
  document.getElementById('enableSpeechDownload').addEventListener('click', () => EnglishSpeech.choosePlayback('ai'));
  document.getElementById('useDeviceSpeechOnce').addEventListener('click', () => EnglishSpeech.choosePlayback('device'));
  document.getElementById('cancelSpeechDownload').addEventListener('click', () => EnglishSpeech.stop(undefined, true));
  download.addEventListener('cancel', event => { event.preventDefault(); EnglishSpeech.stop(undefined, true); });
  // A queued close event from the previous request must not cancel a dialog
  // that has already reopened for a new playback request.
  download.addEventListener('close', () => { if (!download.open && awaitingChoice) EnglishSpeech.stop(undefined, true); });
  document.getElementById('previewVoice').addEventListener('click', () => {
    const options = { owner: 'preview', onStatus: text => { status.textContent = text; } };
    if (EnglishSpeech.mode() === 'ai') EnglishSpeech.playClip(AudioVoices.clips[0], options);
    else EnglishSpeech.play(AudioVoices.clips[0].text, options);
  });
  document.getElementById('stopGlobalSpeech').addEventListener('click', () => { EnglishSpeech.stop(undefined, true); status.textContent = '已停止播放。'; globalStatus.textContent = '已停止播放。'; });
  document.getElementById('cancelSpeechPlayback').addEventListener('click', () => EnglishSpeech.stop(undefined, true));
  dialog.addEventListener('close', () => { if (!dialog.open) EnglishSpeech.stop('preview'); });
  window.addEventListener('daily-english-voice', refresh);
  window.addEventListener('daily-english-speech-mode', refresh);
  window.addEventListener('daily-english-speech-download', refresh);
  window.addEventListener('daily-english-speech-status', event => {
    globalStatus.textContent = event.detail.message;
    document.getElementById('globalSpeechBar').hidden = !event.detail.message;
    document.getElementById('cancelSpeechPlayback').hidden = !EnglishSpeech.isActive();
  });
  refresh();
})();
