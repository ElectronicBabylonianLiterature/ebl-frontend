# TASK-REALIA-AFO-TITLE — Work Log

## DB investigation (realia collection)

Connected to MongoDB from `.env.local` (TLS, `authSource=ebl`). Analyzed all
realia docs with an `afoRegister` array.

- realia docs with afoRegister: **17184**
- total `(doc, volume)` groups: **35743**
- groups where the page (`Realia__afo-citation`) **VARIES** within one volume: **334**
  - e.g. `Akkad` / `AfO 44-45 (1997-1998)` → pages `615`, `616`
  - e.g. `Akkade-Zeit` / `AfO 46-47 (1999-2000)` → pages `514`, `` (empty)
- groups where `mainWord` **VARIES** within one volume: **333**
  - e.g. `adû` / `AfO 50 (2003-2004)` → `adû`, `Ad(d)u`, `ʾAdu`
- docs where some `mainWord` != entry `_id`: **4040** (e.g. `Pig` → `Schwein`)

### Conclusion on the task's core question

`Realia__afo-citation` (page) is **NOT** always the same for all entries in one
AfO volume — it is constant in ~99% of groups but differs in 334 groups. A page
**range** (e.g. `615-616`) is therefore required when entries span pages.
`mainWord` is likewise usually-but-not-always constant within a volume.

### Reference data

`Adad` / `AfO 44-45 (1997-1998)`: 5 entries, all mainWord `Adad`, all page `615`
→ matches screenshot. `Akkad` / `AfO 44-45 (1997-1998)`: pages `615`..`616`.

## Decisions (confirmed with user)

- Title format: `entryId: volume, mainWord(s), page-or-range` — mainWord kept even
  on ranges (e.g. `Adad: AfO 44-45 (1997-1998), Adad, 615`; differing-word case
  `Pig: AfO 52 (2018), Schwein, 645`).
- Header joins distinct mainWords; pages become a `start-end` range when they vary.
- Per-entry `mainWord`/`page` are hidden when constant within the volume (carried
  by the title), but **shown per entry** when they vary (`hasDistinctMainWords` /
  `hasDistinctPages`).

## Implementation

- `domain/RealiaEntry.ts`: `AfoRegisterVolumeGroup` now carries `mainWords`,
  `pageRange`, `hasDistinctMainWords`, `hasDistinctPages`. Added `formatPageRange`
  (numeric sort, ignores empty pages) and `formatAfoRegisterVolumeTitle`.
- `ui/RealiaDisplay.tsx`: volume card label uses the new title; entry items take
  `showMainWord`/`showPage`; entries with no visible content are filtered out so
  no empty rows remain after hiding mainWord/page. Added `aria-label={volume}` to
  the entries list.
- `ui/Realia.sass`: `Realia__afo-note` = primary text; `Realia__afo-reference` =
  smaller italic secondary with a brand-coloured left border (clearly distinct).

## Pre-existing issue fixed (per Copilot policy)

- `bibliography/ui/BibliographyEntryForm.test.tsx` first test was flaky: it relied
  on `findByText`'s default 1000ms timeout for the CPU-heavy citation render, which
  exceeds 1s under full-suite (runInBand) load → intermittent failure. Root cause:
  too-small wait budget vs the rest of the file (5000ms). Fixed by giving that
  `findByText` an explicit 5000ms timeout (no masking; still waits for the year).

## Pre-existing issue fixed (per Copilot policy) — #2

- `signs/ui/display/SignImages.test.tsx` emitted two `console.warn` "Unhandled
  rejection Error: Failed to load cluster". Root cause: `Bluebird.reject(...)` was
  built eagerly as a `mockReturnValueOnce` argument, so a rejected promise existed
  with no handler for several ticks before the component consumed it, tripping
  Bluebird's unhandled-rejection detector (the component itself catches it). Fixed
  by deferring creation to call-time with `mockImplementationOnce(() =>
Bluebird.reject(...))`, so the consumer's `await` attaches a handler immediately.
  Behaviour unchanged; no console mocking/masking.

## Follow-up refinements (later user requests)

Search results (`ui/RealiaResultsList.tsx`, `ui/Realia.sass`):

- Removed the `realia-results-list__terms-label` ("Also") label and its SASS rule;
  related terms now render bare.
- Source counts are wrapped in brackets — `AfO (3)`, `References (1)`.

Volume-card title (`domain/RealiaEntry.ts`, `ui/RealiaDisplay.tsx`):

- `formatAfoRegisterVolumeTitle` now returns `{ mainWord, details }` and uses the
  **main word** as the heading (falling back to the entry id when absent), dropping
  the now-redundant main word from the details. The display renders the main word in
  a `<strong>` (`Realia__afo-volume-mainword`) so it is bold, followed by the details
  (`Realia__afo-volume-details`). Supersedes the earlier `entryId: ..., mainWord, ...`
  format above:
  `Enlil, Ellil: AfO 25 (1974-1977), Enlil, 370` → **Enlil**`: AfO 25 (1974-1977), 370`.

Styling (`ui/Realia.sass`):

- Moved the left accent border (`border-left` + `padding-left`) from
  `Realia__afo-reference` to `Realia__afo-note`; kept `padding-left` on the reference
  so its text stays aligned with the bordered note.
- `Realia__afo-entries`: added `padding: 30px`.
- `Realia__afo-entry`: now `display: list-item` with `disc` markers (was a flex
  column); inner spacing via `& > * + *`, inter-entry separator retained.

Tests: updated the `formatAfoRegisterVolumeTitle` domain cases to the new
`{ mainWord, details }` shape (incl. an empty-main-word fallback), the results-list
"also"/count assertions, the three display title assertions (bold main word +
details), and regenerated the `RealiaSearch.integration` snapshot (diff inspected:
only the removed "also" label and the added `(` brackets).

## Gates (final)

- `yarn tsc`: clean
- `yarn lint`: clean (eslint + stylelint)
- Coverage of changed files (`RealiaEntry.ts`, `RealiaDisplay.tsx`,
  `RealiaResultsList.tsx`): 100%
- `yarn test --watchAll=false`: 320 suites pass, 3265 passed / 2 skipped, 0
  failures, **0 console warnings/errors**. (The list-marker change is SASS-only.)

## Reminder

- Remove all `TASK-REALIA-AFO-TITLE-*.md` tracking files before merging.
