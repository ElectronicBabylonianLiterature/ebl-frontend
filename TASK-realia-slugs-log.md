# TASK-realia-slugs — Work Log

## Setup

- Local `master` was stale (no Realia); `origin/master` already has the merged
  Realia feature. Fetched `origin` and recreated `add-realia-slugs` from
  `origin/master` (HEAD `47ee4b9a`).

## Investigation

- Slug-driven pages follow one pattern:
  - Repository `listAll<Entity>(): Promise<string[]>` → `GET /<entity>/all`.
  - Service delegates to the repository.
  - `router/sitemap.tsx` `getAllSlugs` calls `getSlugs(services, '<x>Service',
'listAll<X>', 'id')` and returns `<x>Slugs`.
  - `router/sitemapConfig.ts` declares the `Slugs` shape (spread into route props).
  - The per-entry `<Route>` receives `{...(sitemap && { ...sitemapDefaults,
slugs: <x>Slugs })}` so the sitemap expands one URL per slug.
- The Realia display route `/tools/realia/:id` already exists in
  `router/toolsRoutes.entities.tsx` but had NO sitemap slugs attached — so Realia
  pages are absent from the sitemap. This task closes that gap.
- Realia entries are resolved by `_id` (equals the lemma); links use `entry.id`
  (see `RealiaResultsList.tsx`, `RealiaEntry.realiaCrossReferenceTarget`). So the
  slug key is `id` and `/realia/all` must return the `_id` (lemma) values.

## Changes

- `router/sitemapConfig.ts`: added `RealiaSlugs` type and `realiaSlugs?` on `Slugs`.
- `realia/infrastructure/RealiaRepository.ts`: `listAllRealia()` → `GET /realia/all`.
- `realia/application/RealiaService.ts`: `listAllRealia()` delegates to the repository.
- `router/sitemap.tsx`: `getAllSlugs` now resolves `realiaSlugs` (key `id`) via
  `listAllRealia`.
- `router/toolsRoutes.tsx` + `router/toolsRoutes.entities.tsx`: thread `realiaSlugs`
  through to `getEntityRoutes`; `/tools/realia/:id` route now carries
  `{...(sitemap && { ...sitemapDefaults, slugs: realiaSlugs })}` so the sitemap
  expands one URL per Realia entry.
- Tests: `RealiaRepository.test.ts` (+`listAllRealia` → `/realia/all`),
  `RealiaService.test.ts` (+delegation), `sitemap.test.tsx` (mock + `listAllRealia`
  called assertion + behavioral test that `/tools/realia/Pig` appears in the
  generated sitemap XML).

## Gates

- `yarn tsc`: clean.
- `yarn lint` (eslint + stylelint): clean.
- Tests: RealiaRepository, RealiaService, sitemap, Tools.routes, Tools — 55 passing,
  zero console output.
- Coverage on added executable lines: `RealiaService.listAllRealia` 100%;
  `RealiaRepository.listAllRealia` exercised; `sitemap.tsx` realia branch exercised;
  the realia-route sitemap slug branch exercised (verified via sitemap XML assertion).

## API dependency

- Requires a new backend endpoint `GET /realia/all` returning a JSON array of all
  Realia `_id` values (lemmas). Prompt for the API agent recorded in
  `TASK-realia-slugs-api-prompt.md`. Frontend will 404 on sitemap generation until
  that endpoint exists.

## Review follow-up (findings addressed)

- F2 (Medium): `react-dynamic-sitemap` inserts slug values without URL-encoding,
  so Realia lemmas with commas/spaces/parens (`Enlil, Ellil`) produced malformed
  `<loc>`s. Added an opt-in `encode` flag to `getSlugs`/`mapStringsToSlugs` in
  `router/sitemap.tsx`, enabled for Realia; added a test asserting the encoded
  form and the absence of the raw form. Pre-existing entities left unchanged.
- F1 (Low): redirect-stub Realia entries can't be filtered client-side at
  sitemap-build time; updated `TASK-realia-slugs-api-prompt.md` to require
  `/realia/all` to exclude pure cross-reference stubs (mirroring
  `getRedirectTarget`/`hasOwnContent`), plus a stub-exclusion test.
- F3: external API dependency, unchanged (tracked in the API prompt).
- F4: measurement artifact, no action.
- Gates re-run after changes: `yarn tsc` clean, `yarn lint` clean, affected suites
  green (29 realia/sitemap tests), zero console noise.

## PR #762 review follow-up (Fabdulla1, `CHANGES_REQUESTED` 2026-07-10)

Gathered from GitHub before starting: 1 timeline review event (`CHANGES_REQUESTED`,
Fabdulla1), 0 inline review comments, 0 general/issue comments, 0 bot reviews.
Both requested items were test-coverage requests; no code defects were raised.

- R1 — empty-`listAllRealia()` regression test. Added
  `sitemap.test.tsx` › "produces a valid sitemap without Realia entry URLs when
  there are no Realia entries": mocks the service to `[]`, asserts `realiaSlugs`
  resolves to `[]`, that no `/tools/realia/<slug>` `<loc>` is emitted, and that the
  rest of the sitemap is unaffected (Realia search page, sign + bibliography entry
  URLs, well-formed `<urlset>`, sitemap index file still saved).
- R2 — targeted `getEntityRoutes()` route-threading test. Added
  `router/toolsRoutes.entities.test.tsx` (new file, 72 lines): asserts the
  `/tools/realia/:id` route carries `sitemapDefaults` + `slugs: realiaSlugs` when
  `sitemap` is true; carries neither `slugs` nor `sitemapIndex` when false; and that
  Realia slugs do not leak onto a sibling route (sign route still gets `signSlugs`).
  Mutation-checked: deleting the `slugs: realiaSlugs` spread from
  `toolsRoutes.entities.tsx` makes the first test fail, so it guards the wiring.
- R2b — added a fourth test in the same file asserting the route's `render` decodes an
  encoded slug (`Enlil%2C%20Ellil`) back to the entry id passed to `RealiaDisplay`.
  This closes the loop with the F2 encoding fix (sitemap emits encoded slugs; the route
  must decode them) and covers the previously-unexercised Realia `render` callback.

### Pre-existing issues found and fixed in the same task

- DRY / duplication: the gzip+blob unpacking of `sitemap1.xml.gz` was copy-pasted in
  three `sitemap.test.tsx` tests (and R1 would have made a fourth). Root cause:
  no shared helper. Extracted `generateSitemapXml()` and `mockRealiaEntries()` and
  reused them in all tests; behaviour identical.
- Coding standard violation: an explanatory `//` comment introduced by commit
  `f5712fe9` in `sitemap.test.tsx` violated the "no comments unless requested" rule.
  Removed, along with the comments added while doing R1.

### Gates re-run after the follow-up

- `yarn lint` (eslint + stylelint) → clean.
- `yarn tsc` → clean.
- `yarn test --watchAll=false` (full suite) → 338 suites / 3461 tests pass, 2 skipped;
  full log scanned for `console.error`/`console.warn`/`console.log`/`Warning:`/
  unhandled rejections / `not wrapped in act` → **0 hits** (console-clean gate met).
- Coverage of the lines changed by this PR: `RealiaService.ts` 100%, `sitemapConfig.ts`
  100%, `sitemap.tsx` realia branch covered, `toolsRoutes.entities.tsx` `return`
  statement hit and the `sitemap && { …slugs }` branch covered on **both** sides
  (line-level `coverage-final.json` check). Remaining uncovered lines in these files
  (`RealiaRepository.ts:84`, `sitemap.tsx:181-183`, `toolsRoutes.entities.tsx:99,120,
131,154,175,195`) are all pre-existing code untouched by this change — the latter are
  the `render` callbacks of the sign/dictionary/bibliography routes.
- Line-count gate: `sitemap.test.tsx` 200, `toolsRoutes.entities.test.tsx` 82,
  `toolsRoutes.entities.tsx` 213 — all under the 250-line ceiling.

### Known pre-existing issue NOT fixed (needs a decision)

- `fragmentarium/ui/edition/Edition.test.tsx:49,53` — two tests disabled with `xit`
  (the "2 skipped" in the full run). Pre-existing on `master`, unrelated to Realia or
  the sitemap. Not re-enabled here: it would put an unrelated fragmentarium suite into
  this PR, and the instructions require explicit approval around test skipping. Flagged
  for the author to file separately.

## Notes / follow-up

- Remove `TASK-realia-slugs-*.md` before merging this branch.
