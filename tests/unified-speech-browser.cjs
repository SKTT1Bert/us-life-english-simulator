// Uses the real local Kokoro/ONNX engine. Instrumentation observes buffers and
// worker inputs; it does not fabricate generated audio or playback events.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startApp, navigate } = require('./browser-helpers.cjs');
const production = process.env.SPEECH_PRODUCTION === '1';
if (production) assert.notEqual(process.env.TEST_OFFLINE_FIXTURE, '1');
(async () => {
  const app = await startApp(), checks = [], errors = [], requests = [];
  const base = production ? 'https://sktt1bert.github.io/us-life-english-simulator/' : app.url;
  const run = async (name, action) => { await action(); checks.push(name); console.log(`PASS ${name}`); };
  try {
    const context = await app.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(() => {
      // This suite verifies the explicit expanded-AI mode. The separate
      // fast-audio suite checks the fresh-browser download choice.
      localStorage.setItem('daily-english-ai-download-v1', 'allowed');
      window.speechAudit = { inputs: [], starts: [], stopped: 0 };
      const OriginalWorker = window.Worker;
      window.Worker = function (url, options) {
        const worker = new OriginalWorker(url, options);
        if (String(url).includes('courseSpeech.worker.js')) {
          const post = worker.postMessage.bind(worker), terminate = worker.terminate.bind(worker);
          worker.postMessage = message => { speechAudit.inputs.push(message); post(message); };
          worker.terminate = () => { speechAudit.stopped++; terminate(); };
        }
        return worker;
      };
      window.Worker.prototype = OriginalWorker.prototype;
      const create = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function () {
        const source = create.call(this), start = source.start.bind(source);
        source.start = (...args) => {
          const samples = source.buffer.getChannelData(0); let energy = 0;
          for (const sample of samples) energy += sample * sample;
          speechAudit.starts.push({ voice: AudioVoices.current().id, rate: source.playbackRate.value, duration: source.buffer.duration, rms: Math.sqrt(energy / samples.length) });
          return start(...args);
        };
        return source;
      };
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message)); page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.goto(base); await page.evaluate(async () => { await dailyEnglishSyncReady; dailyEnglishSync.stop(); });
    const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(progressPayload())));
    const changeVoice = async voice => {
      await page.locator('#openSpeechSettings').click(); await page.locator('#globalVoice').selectOption(voice);
      await page.getByRole('button', { name: '关闭朗读设置', exact: true }).click();
    };
    const played = async action => {
      const count = await page.evaluate(() => speechAudit.starts.length);
      await action();
      await page.waitForFunction(n => speechAudit.starts.length > n, count, { timeout: 120000 });
      assert.ok(await page.evaluate(() => { const last = speechAudit.starts.at(-1); return last.duration > .1 && last.rms > .001; }));
    };
    await run('default soft voice and global settings load without downloading the synthesis model', async () => {
      assert.equal(await page.evaluate(() => AudioVoices.current().id), 'af_nicole');
      assert.equal(requests.some(r => /tts-model|courseSpeech.worker|vendor\/kokoro/.test(r.url)), false);
      await page.locator('#openSpeechSettings').click();
      assert.equal(await page.locator('#globalVoice option').count(), 4);
      assert.match(await page.locator('#speechSettingsDialog').innerText(), /110 MB/);
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#speechSettingsDialog').isVisible(), false);
    });
    await run('all four voices synthesize original root words and phonics whole words with unchanged progress', async () => {
      await navigate(page, 'foundations');
      for (const course of ['word-parts', 'phonics']) {
        await page.locator(`[data-course="${course}"]`).click();
        await page.locator(`#view-${course} [data-foundation-level="a1"]`).click();
        const before = await snapshot();
        for (const voice of ['af_nicole', 'af_heart', 'am_michael', 'bf_emma']) {
          await changeVoice(voice);
          await played(() => page.locator(`#view-${course} [data-speak-example="0"]`).click());
          assert.equal(await page.evaluate(() => speechAudit.inputs.at(-1).voice), voice);
          assert.equal(await page.evaluate(() => speechAudit.inputs.at(-1).speed), .8);
          assert.equal(await page.evaluate(() => speechAudit.starts.at(-1).rate), 1, 'slower speech does not lower the voice pitch by resampling');
          const expected = await page.evaluate(id => FOUNDATION_CATALOG[id].find(lesson => lesson.levelId === 'a1').examples[0].speak, course);
          assert.equal(await page.evaluate(() => speechAudit.inputs.at(-1).text), voice === 'bf_emma' ? `Listen and repeat. ${expected}.` : expected);
          await page.evaluate(() => EnglishSpeech.stop());
        }
        assert.deepEqual(await snapshot(), before);
      }
      const count = await page.evaluate(() => speechAudit.inputs.length);
      await played(() => page.locator('#view-phonics [data-speak-example="0"]').click());
      assert.equal(await page.evaluate(() => speechAudit.inputs.length), count, 'repeat audio reuses the in-memory result');
      await page.evaluate(() => EnglishSpeech.stop());
    });
    await run('original pathway, expression, picture example and foundation assessment buttons use the chosen voice', async () => {
      await changeVoice('af_heart');
      await navigate(page, 'pathway'); await page.locator('[data-pathway-level="a1"]').click(); await played(() => page.locator('.pathway-play').first().click()); await page.evaluate(() => EnglishSpeech.stop());
      await navigate(page, 'today'); await played(() => page.locator('.speak-btn').first().click()); await page.evaluate(() => EnglishSpeech.stop());
      await navigate(page, 'scenarios'); await page.locator('#placeSelect').selectOption('bank'); await played(() => page.locator('.picture-speak-example').first().click()); await page.evaluate(() => EnglishSpeech.stop());
      await navigate(page, 'foundations'); await page.locator('[data-course="word-parts"]').click();
      await page.locator('#view-word-parts [data-foundation-mode="assessment"]').click();
      const before = await snapshot(); await played(() => page.locator('#view-word-parts .foundation-listen').click());
      await page.locator('#view-word-parts .foundation-stop').click(); assert.deepEqual(await snapshot(), before);
      assert.equal(await page.evaluate(() => speechAudit.starts.slice(-4).every(sample => sample.voice === 'af_heart')), true);
    });
    await run('course listening counts actual starts and unified voice changes preserve current dictation and speaking drafts', async () => {
      await navigate(page, 'listening'); await page.locator('#listeningSource').selectOption('course');
      await page.locator('#listeningLevel').selectOption('a1');
      await page.locator('#listeningInput').fill('This draft stays.');
      await played(() => page.getByRole('button', { name: '播放这一句', exact: true }).click());
      await changeVoice('am_michael');
      assert.equal(await page.locator('#listeningVoice').inputValue(), 'am_michael');
      assert.equal(await page.locator('#listeningInput').inputValue(), 'This draft stays.');
      assert.equal(await page.evaluate(() => EnglishSpeech.isActive()), false);
      await page.locator('#listeningVoice').selectOption('af_nicole');
      await page.locator('#openSpeechSettings').click(); assert.equal(await page.locator('#globalVoice').inputValue(), 'af_nicole'); await page.keyboard.press('Escape');
      const material = await page.evaluate(() => ListeningLab.catalog(PATHWAY_CATALOG).find(item => item.lessonId === document.getElementById('listeningLesson').value));
      await page.locator('#listeningInput').fill(material.segments[0].text); await page.locator('#listeningCheck').click(); await page.locator('#listeningSave').click();
      const saved = await snapshot(), attempt = saved.learningStudio.listeningAttempts.at(-1);
      assert.equal(attempt.lessonId, material.lessonId); assert.equal(attempt.listenCount, 1);
      await page.locator('#listeningSource').selectOption('ai'); await page.getByRole('button', { name: '录音并查看口语反馈', exact: true }).click();
      await page.locator('#skillText').fill('A speaking draft stays too.'); await changeVoice('bf_emma');
      assert.equal(await page.locator('#skillVoice').inputValue(), 'bf_emma'); assert.equal(await page.locator('#skillText').inputValue(), 'A speaking draft stays too.');
    });
    await run('cancellation stops pending inference and long passages retain the final sentence', async () => {
      await navigate(page, 'today');
      const input = 'A long test sentence with a completely new phrase checks cancellation before playback begins.';
      const before = await page.evaluate(() => speechAudit.starts.length);
      const jobs = await page.evaluate(() => speechAudit.inputs.length), stopped = await page.evaluate(() => speechAudit.stopped);
      await page.evaluate(text => EnglishSpeech.play(text), input);
      await page.waitForFunction(n => speechAudit.inputs.length > n, jobs);
      await page.evaluate(() => EnglishSpeech.stop());
      assert.ok(await page.evaluate(n => speechAudit.stopped > n, stopped), 'an in-flight worker was terminated');
      await page.waitForTimeout(100); assert.equal(await page.evaluate(() => speechAudit.starts.length), before);
      await page.evaluate(() => {
        window.longSpeechDone = false; window.longSpeechError = '';
        EnglishSpeech.play('We study English together. '.repeat(11) + 'The final sentence is still included.', { onEnd: () => { longSpeechDone = true; }, onError: message => { longSpeechError = message; } });
      });
      await page.waitForFunction(() => longSpeechDone || longSpeechError, null, { timeout: 120000 }); assert.equal(await page.evaluate(() => longSpeechError), '');
      assert.match(await page.evaluate(() => speechAudit.inputs.at(-1).text), /The final sentence is still included\.$/);
    });
    await run('inference stays on this origin; preferences survive reload and mobile layouts have no horizontal overflow', async () => {
      assert.equal(requests.some(r => /huggingface|jsdelivr|unpkg/.test(r.url)), false);
      assert.equal(requests.some(r => r.method === 'POST' && !r.url.includes('/api/sync')), false);
      await changeVoice('af_nicole');
      // Close unsubmitted test drafts before reload; no user profile is used.
      await page.evaluate(() => { ListeningLab.resetSession(); SkillWorkshop.resetSession(); });
      await page.reload(); assert.equal(await page.evaluate(() => AudioVoices.current().id), 'af_nicole');
      const folder = process.env.TEST_SCREENSHOT_DIR; if (folder) fs.mkdirSync(folder, { recursive: true });
      for (const width of [320, 390, 844, 1440]) {
        await page.setViewportSize({ width, height: 900 }); await page.locator('#openSpeechSettings').click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
        assert.equal(await page.evaluate(() => { const d = document.getElementById('speechSettingsDialog'); return d.scrollWidth <= d.clientWidth + 1; }), true);
        if (folder) await page.screenshot({ path: path.join(folder, `speech-settings-${width}.png`) });
        await page.keyboard.press('Escape');
      }
    });
    await run('a failed resource gives a recoverable error and an explicit device option', async () => {
      const broken = await app.newContext(), p = await broken.newPage();
      await p.route('**/assets/tts-model/**', route => route.abort());
      await p.goto(base); await p.evaluate(() => EnglishSpeech.setExpanded(true)); await navigate(p, 'foundations');
      await p.locator('#view-word-parts [data-foundation-level="a1"]').click(); await p.locator('#view-word-parts [data-speak-example="0"]').click();
      await p.waitForFunction(() => document.querySelector('#view-word-parts .tutorial-speech-status').textContent.includes('暂时不可用'), null, { timeout: 120000 });
      assert.equal(await p.evaluate(() => EnglishSpeech.mode()), 'ai', 'no silent fallback to a different voice');
      await p.locator('#openSpeechSettings').click(); await p.locator('#speechMode').selectOption('device'); await p.keyboard.press('Escape');
      assert.equal(await p.evaluate(() => EnglishSpeech.mode()), 'device');
      await p.unroute('**/assets/tts-model/**');
      await p.locator('#openSpeechSettings').click(); await p.locator('#speechMode').selectOption('ai'); await p.keyboard.press('Escape');
      await p.locator('#view-word-parts [data-speak-example="0"]').click();
      await p.waitForFunction(() => /正在播放|朗读结束/.test(document.querySelector('#view-word-parts .tutorial-speech-status').textContent), null, { timeout: 120000 });
      await broken.close();
    });
    assert.deepEqual(errors, []);
    console.log(`\n${checks.length} ${production ? 'DEPLOYED' : 'LOCAL'} unified speech checks passed with real synthesized audio.`);
  } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
