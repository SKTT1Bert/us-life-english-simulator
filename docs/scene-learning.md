# Scene learning

The **场景模拟** navigation entry contains two modes: **看图识词** (picture vocabulary) and **对话模拟** (role play). **英语基础** contains the roots/affixes and phonics tutorials.

Seven illustrated places are available: gas station, restaurant, supermarket, cafe, airport, hotel and clinic. They contain 72 vocabulary entries, 58 bilingual sentences and 30 fill-in questions. Vocabulary counts include terms that appear in multiple places.

Both modes use the same `placeSelect` value and image path. Selecting a new place resets an active dialogue so that its questions cannot remain attached to the previous picture. Starting a random dialogue updates the place selector, purpose picker, picture course and dialogue preview to the chosen place. The 22 original dialogue places remain available; places without a picture show a message with a link to dialogue mode.

A scene image illustrates the place. The generated task and situation card determine the actual dialogue, which may describe a different errand or staff member.

Picture answers, grades, selected words and learning steps are retained for each scene during the page visit. Switching modes does not start a dialogue or change learning counters. Picture drills remain separate from expression recall records and progress exports.

## Adding a scene

- Add one illustration asset to `assets/`.
- Add a course to `data/sceneLessons.js`, using an existing `SCENARIO_PACKS` ID for `placeId`.
- Supply `image`, Chinese and English image descriptions, `words`, `sentences`, `exercises` and `positions`.
- `positions` maps word IDs to percent coordinates in the original image. Abstract vocabulary can omit a position and remain available in the word list.
- Visually verify each hotspot against the actual illustration. The same image is used in the scene gallery, picture board and dialogue preview.

`sceneLearning.js` coordinates places and modes. `pictureLearning.js` creates a picture course on first selection and retains its DOM in a per-course cache. The number of illustrated places is derived from the course data.

## Verification

Existing review and translator tests run with:

```sh
node --test tests/*.test.js
```

Browser checks should cover all picture courses, correct and incorrect answers, accepted synonyms, per-course state after switching, picture-to-dialogue handoff, random dialogue synchronization, unillustrated places, keyboard mode switching and mobile image zoom.
