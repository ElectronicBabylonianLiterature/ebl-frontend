# TASK-realia-slugs — TODO

Add all Realia entry pages to the router/sitemap via slugs, mirroring the
existing slug-driven database pages (signs, dictionary, bibliography), and add
the corresponding "list all Realia ids" API query on the client.

## Frontend

- [x] Add `RealiaSlugs` type and `realiaSlugs?` field to `router/sitemapConfig.ts` `Slugs`.
- [x] Add `listAllRealia(): Promise<string[]>` to `realia/infrastructure/RealiaRepository.ts` (`GET /realia/all`).
- [x] Add `listAllRealia(): Promise<string[]>` to `realia/application/RealiaService.ts` (delegates to repository).
- [x] Wire `realiaSlugs` into `getAllSlugs` in `router/sitemap.tsx` (key `id`).
- [x] Thread `realiaSlugs` through `router/toolsRoutes.tsx` into `getEntityRoutes`.
- [x] Attach `{...(sitemap && { ...sitemapDefaults, slugs: realiaSlugs })}` to the
      `/tools/realia/:id` route in `router/toolsRoutes.entities.tsx`.

## Tests

- [x] `RealiaRepository.test.ts`: delegation test for `listAllRealia` → `/realia/all`.
- [x] `RealiaService.test.ts`: delegation test for `listAllRealia`.
- [x] `sitemap.test.tsx`: mock `realiaService.listAllRealia`, assert it is called.

## PR #762 review follow-up (Fabdulla1, CHANGES_REQUESTED 2026-07-10)

- [x] R1: `sitemap.test.tsx` — regression test for `listAllRealia()` returning an
      empty array: sitemap still generates valid output with no Realia entry URLs.
- [x] R2: `toolsRoutes.entities.test.tsx` (new) — focused unit test that
      `getEntityRoutes()` threads `realiaSlugs` onto the `/tools/realia/:id` route
      when sitemap generation is enabled (and not when it is disabled).

## Gates

- [x] `yarn lint` clean.
- [x] `yarn tsc` clean.
- [x] Affected tests pass with zero console noise.
- [x] 100% coverage on changed code.

## API (separate agent / repo)

- [x] Provide prompt for API agent to add `GET /realia/all` returning all Realia ids.

## Cleanup

- [x] Remind to remove TASK-realia-slugs-\*.md before merge.
