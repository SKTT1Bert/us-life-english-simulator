# Scene learning

The **场景模拟** navigation entry contains two modes: **看图识词** (picture vocabulary) and **对话模拟** (role play). **英语基础** contains the roots/affixes and phonics tutorials.

All 22 dialogue places have an illustrated course: gas station, restaurant, supermarket, cafe, airport, hotel, clinic, DMV, bank, gym, pharmacy, apartment office, post office, customer service, hair salon, campus office, library, public transit, phone/internet provider, vet, dentist and insurance office. They contain 222 vocabulary entries, 178 bilingual sentences and 90 fill-in questions. Vocabulary counts include terms that appear in multiple places.

The scene browser groups courses into food/shopping, travel/accommodation, everyday services, health/fitness and campus/learning. Search matches scene names and the English/Chinese vocabulary taught in each course. Filtering only browses the catalog and does not change an active lesson or dialogue. Use the arrows to browse the compact row or expand the entire catalog. Selecting a place from the shared dropdown or starting a random dialogue clears filters only when necessary to reveal that place.

Both modes use the same `placeSelect` value and image path. Selecting a new place resets an active dialogue so that its questions cannot remain attached to the previous picture. Starting a random dialogue updates the place selector, purpose picker, picture course and dialogue preview to the chosen place. All 311 original dialogue tasks remain available. An empty-state fallback remains for any future place added before its illustration is ready.

A scene image illustrates the place. The generated task and situation card determine the actual dialogue, which may describe a different errand or staff member.

Picture answers, grades, selected words and learning steps are retained for each scene during the page visit. Switching modes does not start a dialogue or change learning counters. Picture drills remain separate from expression recall records and progress exports.

## Adding a scene

- Add one illustration asset to `assets/`.
- Add a course to one of `data/sceneLessons*.js`, using an existing `SCENARIO_PACKS` ID for `placeId`.
- Supply `image`, `thumbnail`, Chinese and English image descriptions, `words`, `sentences`, `exercises` and `positions`. Register the place in a category in `sceneLearning.js`.
- `positions` maps word IDs to percent coordinates in the original image. Abstract vocabulary can omit a position and remain available in the word list.
- Visually verify each hotspot against the actual illustration. The same image is used in the scene gallery, picture board and dialogue preview.

New full-size illustrations use WebP; 384px-wide WebP thumbnails under `assets/thumbnails/` are used only in the gallery. The image composition is unchanged. The existing seven PNG illustrations are reused for the learning boards. The [image requirements and prompts](image-prompts.md) document all 15 additions and the explicit user authorization for direct generation in this update. The default image-generation preference in `AGENTS.md` continues to apply to future work.

`sceneLearning.js` coordinates places and modes. `pictureLearning.js` creates a picture course on first selection and retains its DOM in a per-course cache. The number of illustrated places is derived from the course data.

## Verification

Existing review and translator tests run with:

```sh
node --test tests/*.test.js
```

The scene browser regression suite uses the same real HTTP test server and navigation helpers as the latest course and personal-expression suites:

```sh
node tests/scenes-browser.cjs
```

Set `PLAYWRIGHT_EXECUTABLE_PATH` for a system Chromium installation and `TEST_SCREENSHOT_DIR` to save desktop, catalog, dialogue and mobile previews. It checks all 22 courses at 320, 390, 768, 980, 1100 and 1600px, including compact/expanded catalogs, grading, retained lesson state, random dialogue synchronization and shared illustrations. These checks are included in the existing GitHub Actions workflow.

This expansion is integrated on top of `89644ca` (PR #3), preserving the four-section navigation, 144-course learning pathway, foundation assessments, personal expressions and progress compatibility work.

`tests/scene-lessons.test.js` verifies complete dialogue-place coverage, asset existence, unique IDs, hotspot references, example coverage and taught exercise answers. Browser checks should cover all picture courses, correct and incorrect answers, accepted synonyms, per-course state after switching, picture-to-dialogue handoff, random dialogue synchronization, search/category filtering, expanded and compact catalogs, keyboard mode switching and mobile image zoom.
