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

## Notes / follow-up

- Remove `TASK-realia-slugs-*.md` before merging this branch.
