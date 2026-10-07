# Recall and review: runtime progress schema v2

## What changed

The existing Practice & Review page has two modes: **Recall** (the default) and the original **Recognition** multiple-choice quiz. The Today page prioritizes up to three due expressions and assigns two to five new expressions, for a suggested five-item session. Its new-expression plan is pinned for the UTC day, so marking an expression does not silently replace it. Additional due items remain available in Recall mode. All existing expressions can be practiced using their Chinese meanings as prompts; no new content or model is required.

Recall hides the reference until the learner has tried to respond. Learners may type or speak to themselves; the app does not record audio, transcribe speech, or retain typed responses. After revealing the reference, learners self-report independent recall, prompted recall, or inability to recall. Alternative phrasings can be valid: there is no exact-string grading or automatic evaluation of speech. Using a hint disables the independent result. Results can only be submitted once per question.

An optional low/medium/high confidence prediction is stored separately from performance. It is not a probability estimate or a scheduling input. No claim is made that prediction prompts necessarily improve learning or calibration.

### Scheduling rules (product defaults, not experimentally optimized)

- A manual studied mark or first choice attempt adds the item to next-day review, without evidence of recall.
- Existing legacy learned marks become immediately due without fabricated practice events or recall successes.
- First independent recall schedules one day. An independent recall at least 24 hours after the preceding recall moves to 3, 7, and then 14 days; 14 is the current cap.
- Same-day repetitions do not advance the interval or postpone an already scheduled successful recall. The time of the most recent recall still becomes the reference for the next 24-hour delay calculation.
- Prompted recall resets the interval to one day; inability to recall schedules a retry in ten minutes. A future retry is not presented as currently due.
- Multiple-choice attempts never promote, reset, or postpone an existing recall schedule.
- Delay refers to the preceding recorded recall, not elapsed time since a choice answer, manual mark, or general app usage. An unsaved/revealed answer, unrecorded study, or external rehearsal cannot be accounted for. This is a practice proxy, not a controlled retention test.

The per-expression counts mean **ever reported success**, not present mastery. The UI separates legacy/studied marks, independent self-reported recall, and delayed self-reported recall. Recognition scores and recall scores have distinct denominators. The existing market module and branching scenarios are unchanged by this first release.

## Persistence and compatibility

Storage remains `daily-english-lab-state-v1` to preserve existing browsers. The payload now carries `schemaVersion: 2`. All 12 prior export keys remain, with four new keys: `schemaVersion`, `reviewSchedule`, `practiceHistory`, and `dailyPlan` (16 total). Existing `learned` values are preserved as studied/legacy marks, not reinterpreted as validated mastery. Old quiz counters are retained; individual historical responses are not reconstructed.

- Legacy JSON imports without a schema version remain supported. Restore validates new schedules/history, array shapes, and counter invariants before replacing the current state.
- New exports round-trip all new fields. Import and reset invalidate unfinished questions so answers are not credited to a different state.
- No recordings or free-text responses are written to progress. New data remain in the current browser and are downloaded only on explicit export.
- `practiceHistory` retains the most recent 5,000 events. Older events are removed at this limit, while per-item cumulative success counts remain. Reported history-based proportions are therefore not lifetime proportions. Export regularly if complete longitudinal logs are needed.
- `sessions` retains UTC-day keys for compatibility. New recall outcomes, including failed attempts, also count as activity. It remains a unique-item daily summary, not an event log. Local display times use the device timezone.
- A corrupt local record is not automatically overwritten; a notice is shown. Explicit import/reset can replace it. Storage failures show a backup notice rather than silently implying durable persistence.
- Clearing browser storage loses progress; GitHub Pages does not synchronize across browsers or devices.

## Field definitions

The full path dictionary is in [`metadata/data_dictionary.csv`](../metadata/data_dictionary.csv). Schedule keys and event item IDs refer to the unchanged `data/expressions.js` IDs.

| Path | Definition |
| --- | --- |
| `schemaVersion` | Integer 2 for this runtime; absent means legacy import. |
| `reviewSchedule` | Object keyed by expression ID; `{}` valid. |
| `reviewSchedule.<id>.stage` | Integer 0–3 indexing 1/3/7/14-day defaults, not a proficiency score. |
| `firstSeenAt` | ISO UTC timestamp when this scheduling record was created; legacy migration time is not original study time. |
| `lastReviewedAt` | Timestamp of preceding recorded recall, or null if none. Choice-only attempts do not update it. |
| `nextDueAt` | ISO UTC timestamp for next suggested review. |
| `lastOutcome` | `independent`, `hinted`, `forgot`, `correct`, `incorrect`, or null. Choice outcome is recorded here only when creating a new schedule. |
| `lastMode` | `recall`, `choice`, or null; the mode underlying the schedule outcome. |
| `independentSuccesses` | Nonnegative lifetime count of independently recalled self-reports. |
| `delayedRecallSuccesses` | Nonnegative lifetime count of independent successes separated by at least 24 hours from the preceding recall; <= independentSuccesses. |
| `practiceHistory` | Array of at most 5,000 retained events; `[]` valid. |
| `practiceHistory[].id` | Unique event ID, not a learner/participant identifier. |
| `itemId` | Expression ID. |
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
node --test tests/review.test.js
```

Browser integration checks require Playwright and its Chromium installation:

```sh
node tests/browser.cjs
```

The browser script uses `PLAYWRIGHT_MODULE` if supplied, then an installed `playwright`, or the configured Codex runtime dependency. It serves the app locally, uses isolated browser contexts, and never contacts GitHub or learner accounts. Screenshots are written only when `TEST_SCREENSHOT_DIR` is supplied.
