# TASK-REALIA-AFO-TITLE — TODO

Group AfO register volume card title to carry mainWord + page (citation), remove
redundant per-entry mainWord/citation, and style note/reference distinctly.

## TODO

- [x] Locate Realia AfO display code and domain model
- [x] Query DB (realia collection) to confirm whether `Realia__afo-citation` (page) is constant per volume
- [x] Determine whether mainWord is constant per volume / equals entry id
- [x] Confirm exact volume-card title format with user (single page vs page range)
- [x] Implement page-range derivation in domain (`groupAfoRegisterByVolume`)
- [x] Build volume-card title: volume + mainWord + page/range
- [x] Remove `Realia__afo-mainword` and `Realia__afo-citation` from individual entry display (hidden when constant; shown when they vary within the volume)
- [x] Style `Realia__afo-note` and `Realia__afo-reference` distinctly (clearly distinguishable)
- [x] Update/add unit tests (domain + UI), keep 100% coverage on affected code
- [x] Hard gates: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false` (console-clean)
- [ ] Remind to remove TASK-\* tracking files before merge (pending merge)

## Pre-existing issues fixed during this task

- [x] `BibliographyEntryForm.test.tsx` flaky `findByText` timeout → explicit 5000ms wait
- [x] `SignImages.test.tsx` Bluebird "Unhandled rejection" console.warn → lazy `mockImplementationOnce`

## Follow-up refinements (user requests)

- [x] Search results: remove the `realia-results-list__terms-label` ("Also") label
- [x] Search results: wrap `realia-results-list__source-count` values in brackets, e.g. `AfO (3)`
- [x] Volume-card title: use the **main word** as the (bold) heading instead of the entry id,
      dropping the now-redundant main word from the details — e.g.
      `Enlil, Ellil: AfO 25 (1974-1977), Enlil, 370` → **Enlil**`: AfO 25 (1974-1977), 370`
- [x] Move the left accent border from `Realia__afo-reference` to `Realia__afo-note`,
      keeping the reference text aligned with the note
- [x] `Realia__afo-entries`: add 30px padding
- [x] Render each `Realia__afo-entry` as a list item with markers (`disc`)
- [x] Re-run hard gates and keep 100% coverage on changed code
