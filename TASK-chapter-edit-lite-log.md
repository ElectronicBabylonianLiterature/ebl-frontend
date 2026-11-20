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
