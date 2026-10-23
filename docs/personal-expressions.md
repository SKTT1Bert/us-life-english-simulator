# Personal expressions and runtime schema v3

The expression library supports personal reference phrases alongside the built-in library. Add an English phrase and a Chinese recall cue manually, or use a completed local translation as a draft. Examples and source notes are optional. Both paths require checking the content and explicitly confirming it before saving. The app labels manually supplied content `user` and translation drafts `model-assisted`; neither label is an independent quality assessment.

Personal expressions support search, source/category filtering, favorites, speech synthesis, and active recall. A saved phrase enters the due queue immediately but receives no studied mark, practice event, or success count until the learner actually records activity. Recognition questions and their distractors continue to use built-in expressions. Manual entry and practice work without the optional local translation service; browser-provided voice availability varies by device.

## Data contract

The application writes `schemaVersion: 3` under the existing `daily-english-lab-state-v1` storage key. Versions 1 and 2 and legacy files without a version remain readable. The review engine accepts v3 but still returns its existing v2 review subset; `parseProgress` combines that subset with the personal collections and explicitly sets the final version to 3. Older runtime versions reject v3 rather than silently dropping the new collections. The historical coursework README narrative, archived PDF, and synthetic v1 example have not been rewritten as current-runtime observations.

`customExpressions` is an array of active records:

| Field | Meaning and validation |
| --- | --- |
| `id` | `custom:` followed by a lowercase UUID v4, generated with browser cryptographic randomness. Built-in IDs have a separate namespace. |
| `phrase` | Required English reference text, at most 300 JavaScript string units, matching browser `maxlength` counting. |
| `meaning_cn` | Required Chinese recall cue, at most 500 string units. |
| `example` | Optional example text, at most 1,000 string units; an empty string when omitted. |
| `source` | Optional source or note, at most 500 string units; an empty string when omitted. It is displayed as text, not opened as a link. |
| `provenance` | `user` or `model-assisted`; required on imported records. Editing a model-assisted record retains that source label. |
| `createdAt` | Canonical UTC timestamp including milliseconds, such as `2026-10-22T12:00:00.000Z`. |
| `updatedAt` | Same timestamp format; must be at or after `createdAt`. Editing keeps the original ID and creation time. |

The engine rejects missing required text, excessive field lengths, forbidden control characters, unknown record fields, invalid provenance, malformed IDs/timestamps, and duplicate IDs. Text is trimmed at the ends. Active duplicate English phrases are detected after Unicode NFKC normalization, lowercasing, whitespace collapsing, and normalizing curly apostrophes. Built-in phrases are not part of this duplicate check: a learner can intentionally keep a personal cue/source for the same phrase. Imported text is rendered as text or escaped before HTML rendering; it cannot introduce executable markup or source links.

The active limit is 500 records. Active IDs plus deletion tombstones have a combined limit of 5,000. Creating new records stops at that combined limit, while deletion remains available. Tombstones are not silently pruned to make room. Export before an intentional full reset if the accumulated record needs to be preserved.

## Editing, deletion, and historical results

Changing the English phrase or Chinese cue retains the ID and historical practice events, but clears the studied mark and replaces the current review schedule with a fresh, immediately due record. Old successes do not become evidence for the edited text. Editing only the example or source preserves the current schedule. Historical events retain their result and timestamp, not a snapshot of the earlier phrase; the UI labels personal events as results for the version practiced at that time. Consequently, aggregate history proportions can include earlier versions, while current schedule counts refer to the current reference.

Deleting removes the active phrase, its favorite/studied marks, review schedule, and any pinned daily-plan reference. It adds a `deletedCustomExpressions` entry containing only `{id, deletedAt}`. This permanent tombstone reserves the ID within that progress record and allows old events to remain valid. A deleted phrase is shown as a deleted personal expression in history; its English, Chinese cue, example, and source are not retained in the active progress payload. Daily activity summaries can retain its ID. Recreating the same phrase generates a new ID and does not inherit its old results. Unfinished practice is invalidated after create/edit/delete, import, and reset.

Earlier downloaded exports or the single operation-before backup can still contain earlier text. Deleting a phrase does not modify those separate copies. If optional device synchronization has been used, its retained different versions may also contain earlier expression text. A deletion removes the active expression and propagates its tombstone to connected devices; it does not erase retained versions from the sync envelope or downloaded backups. The UI explains this distinction before deletion. A full local reset deliberately clears both personal collections and all practice history; its operation-before backup remains available for recovery. Disconnect synchronization on this device before reset or replacement import. Import restores the selected snapshot rather than merging its IDs or deletion history with the current snapshot.

## Import, backup, and save failures

Exports include both personal collections, all current review/history fields, app name, and export time. While connected, exports also contain a `syncEnvelope` with retained versions and full synchronized history, without the pairing code. Ordinary progress imports remain limited to 5 MiB; a file containing a valid `syncEnvelope` may be up to 12 MiB. The envelope and candidate progress are validated before the replacement preview, including schedule references to active IDs and historical references to built-in, active, or tombstoned IDs. Ordinary import restores the visible progress snapshot only: it does not restore pairing credentials or load the historical version archive into the sync controller. The preview states this limitation; keep the original export to retain its additional copies. No state changes merely because a file was selected or previewed. The confirmation dialog provides an option to export the current progress first. A connected or connecting device must disconnect before replacement import; confirmation checks this again to avoid a pairing race.

Import and full reset save the existing raw local record under `daily-english-lab-backup-before-change` before replacing the main record. The first write that migrates a pre-v3 local record also snapshots that immediately preceding raw record. Applying incoming synchronized progress also preserves the immediately preceding local record in this slot before replacement. This is one local backup slot, replaced by a later import, reset, migration, or incoming sync application; use **下载操作前备份** (download the previous backup) before another such change to keep a separate file. Backup storage is local to the same browser and is lost if browser storage is cleared.

Personal create/edit/delete and confirmed import/reset write the replacement to local storage before replacing the active in-memory state. If the write fails, the active progress remains intact, the editor retains its draft when applicable, and the UI reports the failure. A backup write may have succeeded before a subsequent main-record write fails; this does not change the active main record. A malformed local record is left untouched and normal saves are blocked while the app displays temporary empty progress. Explicit validated import or reset can replace that record and preserve the previous raw value in the backup slot.

Ordinary practice records are updated in memory before their save attempt. Their feedback distinguishes saved results from results available only in the current page when storage fails. Exporting current progress can preserve that in-memory state. Storage is local by default. The learner may opt into encrypted automatic synchronization and enter the same private pairing code on other devices or browser profiles. Data is encrypted in the browser before upload; anyone holding the pairing code can read and modify that synchronized record, so it must be protected like a password. Device updates are merged, while differing saved versions remain available for review and backup. An active learning form or unsubmitted assessment prevents incoming progress from replacing the current view until it is safe to apply.

Within one browser origin, a Web Lock permits one active editing page. Other tabs wait and load the latest saved record after acquiring the lock. Browsers without the required lock support remain usable for local learning but cannot start safe multi-device synchronization. Disconnecting stops synchronization on that device and retains local progress; it does not delete other devices' or the cloud's record. Exported files, prior backups, and retained sync versions must be considered separately when removing personal text.

## Translation draft boundaries

A completed local translation provides a draft using that request's source text and response. It is not saved automatically. The source language input accepts up to 1,000 characters, whereas personal records allow a 500-unit cue and a 300-unit English phrase. Longer translations remain visible in the editor and require manual shortening or splitting; validation prevents silently truncated storage. Unavailable services and unsuccessful requests do not create personal records. No remote generation fallback is introduced.

The app does not save audio or typed recall attempts. It does save confirmed personal reference text, Chinese cues, examples, and source notes, and those fields are included in exported files and encrypted synchronization when enabled. Local translation sends the user-requested text only to the configured loopback service; see [local translation](local-translator.md) for its runtime and network boundaries. Saving a reference does not validate pronunciation, oral fluency, or retention.

## Verification

```sh
node --test tests/custom-expressions.test.js tests/review.test.js tests/translator.test.js
node tests/browser.cjs
node tests/personal-browser.cjs
```

The pure engine tests cover cloning and immutable changes, duplicate normalization, bounds, invalid/prototype-shaped imports, timestamps, ID collisions, capacity, deletion history, literal text handling, and the browser API. The personal browser suite covers the integrated entry/save/practice/edit/delete/export/import flows, storage failures, and navigation. Set `PLAYWRIGHT_MODULE` for an external Playwright installation and, if needed, `PLAYWRIGHT_EXECUTABLE_PATH` to an installed Chrome/Chromium executable. `TEST_SCREENSHOT_DIR` enables optional screenshots.

Browser suites normally load the app from a real local HTTP server in isolated browser contexts. `TEST_OFFLINE_FIXTURE=1` is an explicit fallback that fulfills app requests from repository files; results in that mode are fixture validation and do not verify real HTTP connectivity or a deployed site. Translation is blocked or mocked in these suites. Mock translation checks verify the interface contract; they do not establish actual model quality or GPU behavior.
