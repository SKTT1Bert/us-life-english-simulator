# Recall and review: runtime progress schema v3

## What changed

The Practice & Review page has two modes: **Recall** (the default) and the original **Recognition** multiple-choice quiz. The Today page prioritizes up to three due expressions and assigns two to five new built-in expressions, for a suggested five-item session. A newly generated plan includes an unstudied contemporary expression when one is available. Its new-expression plan is pinned for the UTC day, so adding content or marking an expression does not silently replace it. The Today page also links directly to the [twelve contemporary expressions](trending-expressions.md). Additional due items remain available in Recall mode. Built-in and saved personal expressions can be practiced using their Chinese meanings as prompts; no model is required. Recognition continues to use the built-in library. See [personal expressions and schema v3](personal-expressions.md) for saving, editing, deletion, and backup behavior.

Recall hides the reference until the learner has tried to respond. Learners may type or speak to themselves; the app does not record audio, transcribe speech, or retain typed responses. After revealing the reference, learners self-report independent recall, prompted recall, or inability to recall. Alternative phrasings can be valid: there is no exact-string grading or automatic evaluation of speech. Using a hint disables the independent result. Results can only be submitted once per question.

An optional low/medium/high confidence prediction is stored separately from performance. It is not a probability estimate or a scheduling input. No claim is made that prediction prompts necessarily improve learning or calibration.

### Scheduling rules (product defaults, not experimentally optimized)

- A manual studied mark or first choice attempt adds the item to next-day review, without evidence of recall.
- Existing legacy learned marks become immediately due without fabricated practice events or recall successes.
- Saving a confirmed personal expression makes its first recall immediately available without adding a studied mark, practice event, or recall success. Changing its English phrase or Chinese cue resets its current schedule and studied mark; retained historical events still describe the version practiced at that time.
- First independent recall schedules one day. An independent recall at least 24 hours after the preceding recall moves to 3, 7, and then 14 days; 14 is the current cap.
- Same-day repetitions do not advance the interval or postpone an already scheduled successful recall. The time of the most recent recall still becomes the reference for the next 24-hour delay calculation.
- Prompted recall resets the interval to one day; inability to recall schedules a retry in ten minutes. A future retry is not presented as currently due.
- Multiple-choice attempts never promote, reset, or postpone an existing recall schedule.
- Delay refers to the preceding recorded recall, not elapsed time since a choice answer, manual mark, or general app usage. An unsaved/revealed answer, unrecorded study, or external rehearsal cannot be accounted for. This is a practice proxy, not a controlled retention test.

The per-expression counts mean **reported success in the current scheduling record**, not present mastery. Editing a personal expression's English phrase or Chinese cue resets that record, while its retained events remain in history-based totals. Deletion removes the schedule and retains text-free historical references. The UI separates legacy/studied marks, independent self-reported recall, and delayed self-reported recall. Recognition scores and recall scores have distinct denominators. The market module and branching scenarios retain their separate progress.

## Persistence and compatibility

Storage remains `daily-english-lab-state-v1` to preserve existing browsers. The payload now carries `schemaVersion: 3`. The 12 original export keys and four schema-v2 keys remain, with `customExpressions` and `deletedCustomExpressions` added (18 export keys including `app` and `exportedAt`). Existing `learned` values are preserved as studied/legacy marks, not reinterpreted as validated mastery. Old quiz counters are retained; individual historical responses are not reconstructed. The review engine accepts versions 1, 2, and 3 and returns its existing v2 review subset; the application combines that subset with personal data and explicitly writes version 3.

- Legacy JSON imports without a schema version, and versions 1 and 2, remain supported. Restore validates schedules/history, personal records, array shapes, and counter invariants before previewing a replacement. Version-3 files should not be opened with older runtimes; their version check rejects them rather than silently dropping personal records.
- New exports round-trip all current fields. Import replaces rather than merges, shows a preview, and requires confirmation. Import/reset preserve one operation-before backup and invalidate unfinished questions; failure to write the replacement leaves the active progress intact.
- No recordings or typed recall responses are written to progress. Personal reference phrases, Chinese cues, examples, and source notes are saved locally and included in exports; see [the personal-data documentation](personal-expressions.md). There is no account synchronization or automatic upload of learning progress.
- `practiceHistory` retains the most recent 5,000 events. Older events are removed at this limit, while per-item cumulative success counts remain. Reported history-based proportions are therefore not lifetime proportions. Export regularly if complete longitudinal logs are needed.
- `sessions` retains UTC-day keys for compatibility. New recall outcomes, including failed attempts, also count as activity. It remains a unique-item daily summary, not an event log. Local display times use the device timezone.
- A corrupt local record is not automatically overwritten; a notice is shown. Explicit import/reset can replace it. Storage failures show a backup notice rather than silently implying durable persistence.
- Clearing browser storage loses progress; GitHub Pages does not synchronize across browsers or devices.

## Field definitions

The full path dictionary is in [`metadata/data_dictionary.csv`](../metadata/data_dictionary.csv). Schedule keys refer to built-in `data/expressions.js` or `data/trendingExpressions.js` IDs, or active personal IDs. Event item IDs may also refer to a personal deletion tombstone, preserving the historical result without its text.

| Path | Definition |
| --- | --- |
| `schemaVersion` | Integer 3 for the application runtime; absent means legacy import. |
| `reviewSchedule` | Object keyed by expression ID; `{}` valid. |
| `reviewSchedule.<id>.stage` | Integer 0–3 indexing 1/3/7/14-day defaults, not a proficiency score. |
| `firstSeenAt` | ISO UTC timestamp when this scheduling record was created; legacy migration time is not original study time. |
| `lastReviewedAt` | Timestamp of preceding recorded recall, or null if none. Choice-only attempts do not update it. |
| `nextDueAt` | ISO UTC timestamp for next suggested review. |
| `lastOutcome` | `independent`, `hinted`, `forgot`, `correct`, `incorrect`, or null. Choice outcome is recorded here only when creating a new schedule. |
| `lastMode` | `recall`, `choice`, or null; the mode underlying the schedule outcome. |
| `independentSuccesses` | Nonnegative count of independently recalled self-reports within this scheduling record; personal content edits reset it. |
| `delayedRecallSuccesses` | Nonnegative count of independent successes separated by at least 24 hours from the preceding recall; <= independentSuccesses; personal content edits reset it. |
| `practiceHistory` | Array of at most 5,000 retained events; `[]` valid. |
| `practiceHistory[].id` | Unique event ID, not a learner/participant identifier. |
| `itemId` | Built-in, active personal, or deleted personal expression ID. |
| `at` | ISO UTC time the result was recorded; not a timer or response-latency measure. |
| `mode` | `recall` or `choice`. |
| `outcome` | Recall: independent/hinted/forgot; choice: correct/incorrect. |
| `hintUsed` | Boolean: app hint or self-reported reliance on a prompt. |
| `confidence` | Optional low/medium/high prediction; null means skipped. |
| `delayed` | True only for recall at least 24 hours after the preceding recorded recall, whether successful or not. |
| `assessment` | `self-report` for recall, `answer-key` for choices. |
| `dailyPlan` | Null or object with UTC `date` (YYYY-MM-DD) and up to five unique expression `ids`; the current pinned new-item plan. |

## Research rationale and limits

- Roediger & Karpicke (2006), *Test-Enhanced Learning*: retrieval practice can improve delayed retention even when immediate performance or confidence favors rereading. Their prose experiments did not provide feedback.
- Larsen, Butler & Roediger (2009), *Repeated testing improves long-term retention relative to repeated study*: retrieval plus feedback outperformed spaced review after approximately six months in medical education. This app provides reference feedback but has not reproduced their results.
- Janes, Rivers & Dunlosky (2018), *The influence of making judgments of learning on memory performance*: learning judgments can change encoding; a confidence prompt is not a neutral measurement or a proven universal benefit.
- Gais, Lucas & Born (2006), *Sleep after learning aids memory recall*: post-learning sleep can support vocabulary retention. No sleep tracking, sleep-based score, bedtime notification, or sleep-based scheduling is implemented here.

These studies motivate features; they do not validate this app, its particular intervals, self-ratings, oral fluency, or transfer to new situations. A research pilot needs separate consent, design, and documentation. The v1.2 coursework documentation/PDF and synthetic snapshot describe the historical v1 export, not this updated runtime. Do not mix the schemas in a study without identifying versions.

## Verification

Pure scheduling tests require Node 18+:

```sh
node --test tests/review.test.js tests/custom-expressions.test.js tests/trending-content.test.js
```

Browser integration checks require Playwright and its Chromium installation:

```sh
node tests/browser.cjs
node tests/personal-browser.cjs
node tests/trending-browser.cjs
```

The browser suites use `PLAYWRIGHT_MODULE` if supplied, then an installed `playwright`, or the configured Codex runtime dependency. `PLAYWRIGHT_EXECUTABLE_PATH` can point to an installed Chrome/Chromium executable when Playwright's bundled browser is unavailable. By default the suites serve and load the app over real local HTTP, use isolated browser contexts, and never contact GitHub or learner accounts. The optional translation endpoint is blocked or mocked; these suites do not validate a live model.

Set `TEST_OFFLINE_FIXTURE=1` only when loopback navigation is unavailable: it fulfills the app requests from repository files inside the browser test harness. That mode validates the same UI and origin-backed storage as a fixture, not actual HTTP connectivity or deployed GitHub Pages behavior. Screenshots are written only when `TEST_SCREENSHOT_DIR` is supplied.
