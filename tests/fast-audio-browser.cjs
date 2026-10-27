// Native MP3 playback and real HTTP requests. Only the optional device voice
// fallback uses a named test double, because CI has no installed system voices.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { startApp, navigate } = require('./browser-helpers.cjs');
(async () => {
  const app = await startApp(), checks = [], requests = [], errors = [];
  const run = async (name, fn) => { await fn(); checks.push(name); console.log(`PASS ${name}`); };
  const isModel = url => /courseSpeech\.worker|tts-model|vendor\/kokoro/.test(url);
  const folder = process.env.TEST_SCREENSHOT_DIR;
  if (folder) fs.mkdirSync(folder, { recursive: true });
  try {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      window.fastAudioAudit = { players: [], starts: [] };
      const NativeAudio = window.Audio;
      window.Audio = function (src) {
        const player = new NativeAudio(src); fastAudioAudit.players.push(player);
        player.addEventListener('playing', () => fastAudioAudit.starts.push({ src: player.src, rate: player.playbackRate, preservesPitch: player.preservesPitch, duration: player.duration, at: performance.now() }));
        return player;
      };
      window.Audio.prototype = NativeAudio.prototype;
    });
    const page = await context.newPage();
    page.on('request', req => requests.push(req.url())); page.on('pageerror', e => errors.push(e.message));
    await page.goto(app.url);
    await page.evaluate(async () => { await dailyEnglishSyncReady; dailyEnglishSync.stop(); });
    const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(progressPayload())));
    const played = async action => {
      const before = await page.evaluate(() => fastAudioAudit.starts.length);
      await action();
      await page.waitForFunction(n => fastAudioAudit.starts.length > n, before);
      assert.ok(await page.evaluate(() => fastAudioAudit.starts.at(-1).duration > 0));
    };
    const unknown = () => page.evaluate(() => { window.unpreparedStarts = 0; EnglishSpeech.play('This new sentence needs a freshly prepared voice.', { onStart: () => unpreparedStarts++ }); });

    await run('fresh page and all four beginner voices use small recordings without the synthesis model', async () => {
      assert.equal(requests.some(isModel), false);
      assert.equal(await page.evaluate(() => EnglishSpeech.expandedEnabled()), false);
      await navigate(page, 'foundations');
      for (const course of ['word-parts', 'phonics']) {
        await page.locator(`[data-course="${course}"]`).click();
        const before = await snapshot();
        for (const voice of ['af_nicole', 'af_heart', 'am_michael', 'bf_emma']) {
          await page.locator('#openSpeechSettings').click(); await page.locator('#globalVoice').selectOption(voice);
          await page.getByRole('button', { name: '关闭朗读设置', exact: true }).click();
          await played(() => page.locator(`#view-${course} [data-speak-example="0"]`).click());
          const audio = await page.evaluate(() => fastAudioAudit.starts.at(-1));
          assert.ok(audio.src.includes(`/assets/course-audio/${voice}/`));
          assert.equal(audio.rate, .8); assert.equal(audio.preservesPitch, true);
          await page.evaluate(() => EnglishSpeech.stop());
        }
        assert.deepEqual(await snapshot(), before);
      }
      assert.equal(requests.some(isModel), false);
    });
    await run('existing course and picture buttons reuse prepared clips; listening counts actual sentence starts', async () => {
      await navigate(page, 'pathway'); await played(() => page.locator('.pathway-play').first().click()); await page.evaluate(() => EnglishSpeech.stop());
      await navigate(page, 'scenarios'); await played(() => page.locator('.picture-speak-example').first().click()); await page.evaluate(() => EnglishSpeech.stop());
      await navigate(page, 'listening'); await page.locator('#listeningSource').selectOption('course');
      await played(() => page.getByRole('button', { name: '播放这一句', exact: true }).click()); await page.evaluate(() => EnglishSpeech.stop());
      const text = await page.evaluate(() => ListeningLab.catalog(PATHWAY_CATALOG).find(item => item.lessonId === document.getElementById('listeningLesson').value).segments[0].text);
      await page.locator('#listeningInput').fill(text); await page.locator('#listeningCheck').click(); await page.locator('#listeningSave').click();
      assert.equal((await snapshot()).learningStudio.listeningAttempts.at(-1).listenCount, 1);
      const playerCount = await page.evaluate(() => fastAudioAudit.players.length);
      await page.evaluate(() => { window.startedIndices = []; window.twoSentencesDone = false; EnglishSpeech.play(['Hello.', 'Hello.'], { onStart: i => startedIndices.push(i), onEnd: () => { twoSentencesDone = true; } }); });
      await page.waitForFunction(() => twoSentencesDone);
      assert.deepEqual(await page.evaluate(() => startedIndices), [0, 1]);
      assert.equal(await page.evaluate(() => fastAudioAudit.players.length), playerCount + 1, 'a sentence sequence reuses its unlocked media element');
      assert.equal(requests.some(isModel), false);
    });
    await run('unprepared text waits for a clear choice and Escape cancels without playback or a model request', async () => {
      await navigate(page, 'today'); const before = await snapshot();
      await unknown(); await page.locator('#speechDownloadDialog').waitFor({ state: 'visible' });
      assert.match(await page.locator('#speechDownloadDialog').innerText(), /110 MB/);
      assert.equal(requests.some(isModel), false);
      assert.equal(await page.evaluate(() => unpreparedStarts), 0);
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => EnglishSpeech.isActive()), false);
      assert.equal(await page.evaluate(() => EnglishSpeech.expandedEnabled()), false);
      assert.deepEqual(await snapshot(), before);
      await page.evaluate(() => {
        EnglishSpeech.play('First unprepared request.');
        EnglishSpeech.stop();
        EnglishSpeech.play('Second unprepared request.');
      });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.locator('#speechDownloadDialog').isVisible(), true, 'an old close event must not cancel a freshly reopened choice');
      assert.equal(await page.evaluate(() => EnglishSpeech.isActive()), true);
      await page.keyboard.press('Escape');
    });
    await run('one-time device fallback uses the original text and preserves the selected AI preference', async () => {
      await page.evaluate(() => {
        window.deviceTestTexts = [];
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [{ lang: 'en-GB' }], cancel: () => {}, speak: u => { deviceTestTexts.push(u.text); u.onstart?.(); u.onend?.(); } } });
      });
      const before = await snapshot();
      await page.evaluate(() => EnglishSpeech.play('unpreparedword', { example: true }));
      await page.locator('#useDeviceSpeechOnce').click();
      assert.deepEqual(await page.evaluate(() => deviceTestTexts), ['unpreparedword']);
      assert.equal(await page.evaluate(() => EnglishSpeech.mode()), 'ai');
      assert.equal(await page.evaluate(() => EnglishSpeech.expandedEnabled()), false);
      assert.equal(requests.some(isModel), false);
      assert.deepEqual(await snapshot(), before);
    });
    await run('failed prepared audio reports an error without silently starting a large model download', async () => {
      await page.route('**/assets/course-audio/**', route => route.abort());
      await page.evaluate(() => EnglishSpeech.play('cat', { example: true }));
      await page.waitForFunction(() => /未能播放|未启动/.test(document.getElementById('globalSpeechStatus').textContent));
      assert.equal(requests.some(isModel), false);
      await page.unroute('**/assets/course-audio/**');
      await played(() => page.evaluate(() => EnglishSpeech.play('cat', { example: true })));
      await page.evaluate(() => EnglishSpeech.stop());
    });
    await run('settings and download choice fit 320px through desktop with keyboard cancellation', async () => {
      for (const width of [320, 390, 844, 1440]) {
        await page.setViewportSize({ width, height: 940 });
        await page.locator('#openSpeechSettings').click();
        assert.equal(await page.locator('#allowExpandedSpeech').isChecked(), false);
        assert.equal(await page.evaluate(() => document.getElementById('speechSettingsDialog').scrollWidth <= document.getElementById('speechSettingsDialog').clientWidth + 1), true);
        if (folder && [390, 1440].includes(width)) await page.screenshot({ path: path.join(folder, `fast-audio-settings-${width}.png`) });
        await page.keyboard.press('Escape'); await unknown();
        await page.locator('#speechDownloadDialog').waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.getElementById('speechDownloadDialog').scrollWidth <= document.getElementById('speechDownloadDialog').clientWidth + 1), true);
        if (folder && [390, 1440].includes(width)) await page.screenshot({ path: path.join(folder, `fast-audio-choice-${width}.png`) });
        await page.keyboard.press('Escape');
      }
    });
    await run('a deliberate AI choice enables later downloads and can be turned off without changing study records', async () => {
      const before = await snapshot();
      await page.route('**/assets/tts-model/**', route => route.abort());
      await unknown(); await page.locator('#enableSpeechDownload').click();
      await page.waitForFunction(() => /暂时不可用/.test(document.getElementById('globalSpeechStatus').textContent), null, { timeout: 120000 });
      assert.equal(requests.some(isModel), true);
      assert.equal(await page.evaluate(() => EnglishSpeech.expandedEnabled()), true);
      assert.equal(await page.evaluate(() => localStorage.getItem('daily-english-ai-download-v1')), 'allowed');
      await page.locator('#openSpeechSettings').click(); await page.locator('#allowExpandedSpeech').uncheck(); await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => EnglishSpeech.expandedEnabled()), false);
      assert.deepEqual(await snapshot(), before);
      await page.unroute('**/assets/tts-model/**');
    });
    await run('prepared audio plays on a device without Worker support', async () => {
      const limited = await app.newContext(); await limited.addInitScript(() => { window.Worker = undefined; });
      const p = await limited.newPage(); await p.goto(app.url);
      await p.evaluate(() => { window.limitedStarted = false; EnglishSpeech.play('cat', { example: true, onStart: () => { limitedStarted = true; } }); });
      await p.waitForFunction(() => limitedStarted); await limited.close();
    });
    await run('every new MP3 decodes to audible samples with its published duration', async () => {
      const decoded = await page.evaluate(async () => {
        const context = new AudioContext(), out = [];
        try {
          for (const entry of COURSE_AUDIO.entries) for (const file of Object.values(entry.variants)) {
            const response = await fetch(file.src); if (!response.ok) throw Error(file.src);
            const audio = await context.decodeAudioData(await response.arrayBuffer());
            const samples = audio.getChannelData(0); let energy = 0;
            for (const sample of samples) energy += sample * sample;
            out.push({ src: file.src, duration: audio.duration, expected: file.duration, rms: Math.sqrt(energy / samples.length) });
          }
          return out;
        } finally { await context.close(); }
      });
      assert.equal(decoded.length, 512);
      for (const file of decoded) { assert.ok(file.rms > .001, file.src); assert.ok(Math.abs(file.duration - file.expected) < .2, file.src); }
    });
    assert.deepEqual(errors, []);
    console.log(`\n${checks.length} fast-audio browser checks passed. Native MP3 playback verified; device fallback uses a declared test double.`);
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
