# TASK chapter-edit-lite: log

## Findings

- The edit page's chapter GET returns 12 MB in about 31 s on production for
  Enūma eliš I (162 lines, 75 manuscripts). The time is spent on the server.
- The Lines tab mounts one Ace editor per editable field of every line and
  a siglum select with one option per manuscript on every manuscript line.
- The whole chapter text is about 115 KB of ATF; token trees are the rest.
- `GET {chapter}/display?lines=0&variants=0` returns that ATF in 2 to 3 s.

## Decisions

- The mock-ups are a temporary route beside the classic edit page, which is
  not changed.
- Two data sources behind one interface: `legacy` parses the ATF of the
  existing display endpoint and is read-only; `api` uses the new endpoints
  of ebl-api and can save.
- In `legacy` mode saving is a dry run that shows the request, because that
  ATF lacks notes, omitted words, intertext and line flags.
- `source=auto` uses the new endpoints when they answer and falls back to
  `legacy` otherwise. Against a server without them this costs one 404.
- ATF fields are static text until used; one Ace editor is mounted at a time.
- No commit or push without explicit permission.

## Measurements (production build, live production API, headless Chromium)

Enūma eliš I, 162 lines, 75 manuscripts:

- Classic page: data after 29 to 33 s; opening the Lines tab froze the page
  for 6.4 min and finished after 9.1 min with 251,618 DOM elements,
  2,245 Ace editors and 137,356 option elements.
- A accordion: usable in 3.9 s; 1,967 DOM elements; line opens in 59 ms.
- B pages: usable in 3.1 s; 1,098 DOM elements; 10 lines per page.
- C split view: usable in 3.6 s; 1,573 DOM elements; line opens in 74 ms.
- D inline score: usable in 2.7 s; 457 DOM elements; line opens in 80 ms.
- In every version: no Ace editor until a field is clicked, then exactly
  one, mounted in 55 to 91 ms; parser diagnostics 0; all 75 sigla resolved.

Maqlû I, 152 lines, 27 manuscripts: usable in 1.8 to 2.7 s in all versions.

With the new endpoints on a local ebl-api (same chapter): page usable in
about 1.8 s.

## Gates

- `yarn lint`: clean
- `yarn tsc`: clean
- `yarn test:ci`: 735 suites, 6489 tests passed, zero console output
- Coverage: 98.71 % statements, 96.58 % branches (baseline on the
  untouched tree: 98.61 % and 96.32 %); new files at 100 %
- `yarn build:ci-stable`: succeeds

## Review

- Independent review with a second, sceptical check of every finding.
  No high-severity defect. Confirmed and fixed: editor closing on Ace's own
  search box, stale cached lines after a concurrent change, bracket
  spelling in the legacy dry run, three weak tests, one duplicated helper.

## Known limits

- Mock-up scope: edit existing lines only; no add or delete; the
  Manuscripts tab does not save; no alignment or lemmatization.
- A one-line save took about 61 s on a local ebl-api for Enūma eliš I; the
  cost is in the existing server-side update.
- The siglum select needs two mouse clicks; Tab is captured inside an Ace
  field (Escape, then Tab).
- The pre-commit hook needs `ggshield`, which is not installed in the
  sandbox.

## Work log

- Branch renamed to `chapter-edit-performance-eoip5l`.
- Frontend install needed the pango system library for `canvas`.
- Data layer, shared blocks, four versions, manuscripts tab and shell
  built in separate packages against a written contract.
- Review findings fixed; all gates re-run on the final tree.

## Step 1: review notes on pull request #869

- qlty, many returns: `findKeyTarget` looks the key up in a map of
  handlers and `editLiteReducer` dispatches through a typed handler map.
- qlty, complexity of `StaticScoreLine`: not changed. The file belongs to
  version D and is deleted in step 2.
- Chapter revision (ebl-api #827): `ChapterOutline` and the lines page
  carry `revision`. The api source keeps the latest one and sends it with
  every lines request and every save. A 409 is shown as "The chapter was
  changed by someone else since it was loaded".
- The legacy source has no revision and never saves.
- Gates after the change: `yarn lint` and `yarn tsc` clean; `yarn test:ci`
  736 suites, 6508 tests passed, zero console output; coverage 98.71 %
  statements, 96.58 % branches.

## Step 2: split view only

- Removed versions A (accordion), B (pages), D (inline score) and the
  version switcher with their styles and tests: 27 files.
- `findLineIndex` moved to `lineIndex.ts`; `?line=` still selects a line.
  The `variant` and `size` parameters are gone and are ignored if present.
- qlty reports no findings on the branch (the `StaticScoreLine` finding
  went with its file).
- Gates: `yarn lint` and `yarn tsc` clean; `yarn test:ci` 726 suites,
  6362 tests passed, zero console output; coverage 98.69 % statements,
  96.51 % branches; `yarn build:ci-stable` succeeds.
- Browser check against production (Enūma eliš I): split view renders,
  `?line=40` opens line 40, one Ace editor mounts on click.

## Step 3: full editor for lines and manuscripts

- Lines: "Add line" appends one unsaved new line (the API only appends);
  "Delete line" asks for confirmation. After a delete the drafts of later
  lines move down with their lines.
- Variants and manuscript lines can be added and deleted in the line
  editor. A manuscript line without a siglum blocks saving.
- Import tab posts to `{chapter}/import`; the Manuscripts tab saves to
  `{chapter}/manuscripts`, with add and delete for manuscripts and editing
  of uncertain fragments. Both go through the edit source so the chapter
  revision stays in sync.
- The browser warns before leaving with unsaved line drafts, an unsaved
  new line or unsaved manuscript edits.
- Without permission to write texts the page is read-only in both source
  modes. With permission the legacy source still only shows the request.
- The Import tab unmounts when left, so text that was not imported is
  lost on switching tabs. One unsaved new line at a time.
- Gates: `yarn lint` and `yarn tsc` clean; `yarn test:ci` 753 suites,
  6632 tests passed, zero console output; coverage 98.72 % statements,
  96.61 % branches; qlty no findings; `yarn build:ci-stable` succeeds.
- Browser run against a local ebl-api with seeded data: 54 checks passed
  (save, add, delete with a draft elsewhere, import, manuscripts, 409,
  unsaved warning, read-only).

## Step 4: move a line

- The line editor has "Move up", "Move down" and "Move to..." (a dialog
  with "At the beginning" and "After line N"). Line numbers are not
  renumbered; the dialog says so. The select exists only while the dialog
  is open.
- A move is one request to `POST {chapter}/lines/move` with the chapter
  revision. While it runs no line can be saved, deleted or moved.
- Line state is keyed by position. After an accepted move the loaded
  lines, the unsaved edits and the selection are re-keyed in one step and
  then reconciled with the outline the server returned. If the number of
  lines differs, every line entry is dropped and loaded again.
- The outline returned by a write is applied in the same step as the
  write's answer, so the outline is never older than the revision the
  page sends.
- After a delete the selection stays on the selected line. Before, it
  stayed on the position, so the next keystroke could land in the
  following line.
- The delete dialog names the stored line number and says that unsaved
  changes go with the line. "Add line" skips numbers that exist. A line
  whose save, move or delete failed has a "failed" badge in the list.
- Read-only source: a move shows the request preview and says that the
  real request also carries the revision.
- Reviews, each finding re-checked: state logic (1 medium, 1 low),
  controls (1 medium, 4 low), frontend against the real API (44 moves on
  three chapters, no mismatch; the fake chapter of the tests was made as
  strict as the endpoint), rules and test strength (no defect in the
  code; one important and eight small test gaps). All fixed.
- Browser run against a local ebl-api, seeded chapter with alignment and
  lemmas: 27 checks passed (controls, "Move to...", an unsaved edit
  following its line and saved to it, every full line object identical
  after the moves, a refused move, a 409 after another editor's change,
  read-only modes).
- Limits: after deleting the selected line the focus falls to the page
  body. After a save whose reload fails the line shows "Loading line..."
  and is fetched again. "Add line" compares only with stored numbers.
- Gates: `yarn lint` and `yarn tsc` clean; `yarn test:ci` 778 suites,
  6964 tests passed, zero console output; coverage 98.75 % statements,
  96.67 % branches, both edit-lite folders at 100 %; qlty no findings; no
  file over 250 lines.
- Merged master after CI failed on the pull request's merge with it:
  master now passes a success callback to chapter saves and caches
  chapter displays. The lite editor's saves invalidate that cache too.
  Gates on the merged tree: `yarn lint`, `yarn tsc`, qlty clean;
  `yarn test:ci` 890 suites, 7664 tests passed, zero console output;
  coverage 98.75 % statements, 96.92 % branches.

## Step 5: alignment and lemmatization per line (work in progress)

Paused on 21 November; pushed unfinished so the work is not lost.

- Built: the editor of a stored line has three tabs, "Text", "Alignment"
  and "Lemmatization". The two new views load that one line with tokens
  when opened (`lines?...&tokens=true`), reuse the classic word controls and
  save only that line (`POST {chapter}/lines/{number}/alignment` and
  `.../lemmatization`, with the revision). Lemma data comes from one
  `POST /lemmas/batch` and one `GET /words?lemmas=` per opened line.
- Rules: one kind of unsaved change per line (the other two tabs are
  disabled until Save or Reset); a draft lives in the line's entry of the
  state and follows the line after a move or delete; the suggestion rules
  are the classic ones (step 6 changes them); a suggestion on screen is
  saved as a value.
- The builder's own gates passed (lint, tsc, qlty, `yarn test:ci` 917
  suites and 7955 tests, zero console output, coverage 98.79 % statements
  and 97.03 % branches, both edit-lite folders at 100 %; 29 mutations
  killed). NOT yet verified by the lead.
- To do: read the diff; rerun the gates; align the statuses and messages of
  the fake API with the real endpoints; browser check against a local
  ebl-api (the classic word dialogs inside the split view have not been
  seen in a browser); screenshots for the user.
- Noted by the builder: "Delete line" is only in the Text view, so a line
  with an alignment or lemmatization draft must be saved or reset before it
  can be deleted; a view opened while another write is running can get a
  409 with a Retry; `GET /words?lemmas=` is one request however many ids.
