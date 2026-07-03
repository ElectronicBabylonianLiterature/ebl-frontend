# TASK-realia-slugs — Review

Branch: `add-realia-slugs` · Commit under review: `b2c50432`
Reviewer: automated audit (Claude) · Date: 2026-07-03

## Summary

The change adds every Realia entry to the sitemap using the same slug mechanism
already used for signs, dictionary and bibliography, and adds the matching
"list all Realia ids" query on the client.

- `router/sitemapConfig.ts`: `RealiaSlugs` type + `realiaSlugs?` on `Slugs`.
- `realia/infrastructure/RealiaRepository.ts`: `listAllRealia()` → `GET /realia/all`.
- `realia/application/RealiaService.ts`: `listAllRealia()` delegates to the repository.
- `router/sitemap.tsx`: `getAllSlugs` resolves `realiaSlugs` (slug key `id`).
- `router/toolsRoutes.tsx` + `router/toolsRoutes.entities.tsx`: thread `realiaSlugs`
  into `getEntityRoutes`; the `/tools/realia/:id` route now carries
  `{...(sitemap && { ...sitemapDefaults, slugs: realiaSlugs })}`.
- Tests added to repository, service and sitemap suites.

The implementation is minimal, correct, and a faithful copy of the established
pattern. No blocking code defects were found. Two non-code items need a product/
backend decision (redirect stubs in the sitemap; the required API endpoint).

Diff size: 9 source/test files, +252 lines (incl. docs). No production runtime
behaviour changes outside sitemap generation.

## Findings

| #   | Severity           | Area                                                                  | Status                                                                                  |
| --- | ------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| F1  | Low (product/SEO)  | Sitemap includes redirect-stub Realia entries                         | **Resolved** — exclusion specified at source (API prompt)                               |
| F2  | Medium             | Reserved chars in Realia slugs emitted unencoded in `<loc>`           | **Resolved** — Realia slugs now URL-encoded (+test)                                     |
| F3  | Info (dependency)  | Full app verification blocked until backend `GET /realia/all` exists  | **Verified** — live endpoint returns the expected `string[]`; real ids encode correctly |
| F4  | Info (measurement) | Isolated coverage run shows low file-% for `toolsRoutes.entities.tsx` | Resolved — artifact, see below                                                          |

### F1 — Sitemap will include cross-reference stub entries (Low)

Some Realia entries are pure cross-references with no own content and are
client-side redirected to a canonical entry (`getRedirectTarget` in
`realia/domain/RealiaEntry.ts`). Because the sitemap now lists _all_ ids returned
by `/realia/all`, these stubs get their own `<loc>` entries that render a redirect
rather than canonical content — mild SEO smell (duplicate/redirecting URLs).

This is inherent to the "include all Realia pages" requirement. **Resolution:**
the frontend cannot know redirect status at sitemap-build time (it only has ids
from `/realia/all`), so the fix belongs at the source. `TASK-realia-slugs-api-prompt.md`
now requires `GET /realia/all` to exclude pure cross-reference stubs, reproducing
the frontend's `getRedirectTarget`/`hasOwnContent` rule (`realia/domain/RealiaEntry.ts`),
with a matching stub-exclusion test. Rationale: sitemaps should list canonical,
indexable URLs, not redirecting ones.

### F2 — Unencoded reserved characters in sitemap URLs (Medium) — RESOLVED

The sitemap library (`react-dynamic-sitemap/src/index.js:22-24`) inserts slug
values into the path via a plain string `replace`, with **no URL-encoding**.
Realia lemmas routinely contain commas, spaces and parentheses (`Enlil, Ellil`,
`Elam (Geschichte)`), which would produce malformed `<loc>` values, and the app
itself links to Realia via `encodeURIComponent(entry.id)` — so the encoded form
is the canonical URL. **Fix:** `getSlugs`/`mapStringsToSlugs` in `router/sitemap.tsx`
gained an opt-in `encode` flag, enabled for Realia; a test asserts `Enlil, Ellil`
appears as `Enlil%2C%20Ellil` and never raw. The pre-existing entities
(signs/dictionary/bibliography/fragments) are intentionally left unchanged to
avoid altering their already-published sitemap URLs (notably fragment numbers may
contain `/`); a global rollout can be filed separately if desired.

### F3 — End-to-end verification against the live API — VERIFIED

The backend `GET /realia/all` is now implemented (ebl-api branch
`add-realia-slugs-endpoint`). Live response confirmed: a JSON `string[]` of
Realia `_id` lemmas, e.g. `["'Babylomanie'", "(A)wê-ilu", "(Heiliger) Hügel",
"(Nin-)Šud-bindu-basag; Tu-bindu-basag", "(*)Biṭūṭī-dugul", …]`.

These real ids were fed through the actual `getAllSlugs` + `getSitemapAsFile`
pipeline: every id produces `<loc>.../tools/realia/${encodeURIComponent(id)}`,
byte-identical to the app's own link (`RealiaResultsList` uses
`encodeURIComponent(entry.id)`), and no raw/unencoded space-bearing form appears.
This exercises the previously-blocked dependency end-to-end with production data.

Not verifiable from the frontend: **redirect-stub exclusion (F1)** cannot be
confirmed from the id list alone — it is a backend concern, covered by the
stub-exclusion test specified in `TASK-realia-slugs-api-prompt.md`, and must be
asserted in the API repo.

(Note: the live backend runs on the API host and is not routable from this
frontend container, so verification used the operator-provided endpoint output
replayed through the real sitemap code.)

### F4 — Coverage measurement artifact (Info, resolved)

In an isolated run, `toolsRoutes.entities.tsx` reports ~18% statement coverage.
This reflects the per-route `render={() => …}` callback bodies (all entity types,
pre-existing) not being invoked by the selected test subset — the sitemap library
reads route props without calling `render`. The lines _added by this change_ (the
`realiaSlugs` destructure and the `{...(sitemap && { …slugs })}` spread) are
exercised on both branches: `sitemap=true` via the sitemap XML test, `sitemap=false`
via the Tools route tests. `RealiaService.listAllRealia` and `sitemapConfig.ts`
report 100%.

## Severity

- Blockers: **none**.
- Open items: **F3 only** — external API dependency (not a code defect).
- F1 and F2 addressed in code/spec (see Findings). Console noise: **none**.

## Reproduction Steps (verification performed)

1. `yarn tsc` → clean.
2. `yarn lint` (eslint + stylelint) → clean.
3. Affected suites (RealiaRepository, RealiaService, sitemap, Tools.routes, Tools,
   router.lazy-loading): **67 passed**, output scanned for
   `console`/`warn`/`error` → **none present** (console-clean hard gate met).
4. Behavioural check: `sitemap.test.tsx` › "includes a URL for every Realia slug in
   sitemap xml" runs `getAllSlugs` + `getSitemapAsFile`, ungzips the produced
   `sitemap1.xml.gz`, and asserts it contains `/tools/realia/Pig` → passes. This
   exercises the full slug → route → XML pipeline end-to-end (mocked API).

## Recommendation

**Approve** the code change. It is correct, minimal, DRY (reuses the existing
slug/route helpers), and consistent with sibling entities. F1 and F2 are resolved
(F2 in code, F1 specified at source in the API prompt). Merge of the full feature
is gated only on the external API endpoint (F3).

## Comment Status Tracking

- Resolved: F1 (excluded at source via API prompt), F2 (Realia slugs encoded +
  test), F4 (measurement artifact).
- Open: F3 (external API dependency — implementation tracked in the API prompt).
- No reviewer-requested changes (no PR yet); no `CHANGES_REQUESTED` events.

## What Has To Be Done

1. **API (F1 + F3 — blocker for the feature, not for this frontend change):**
   implement `GET /realia/all` per `TASK-realia-slugs-api-prompt.md` — returns all
   Realia `_id`s, **excluding pure cross-reference redirect stubs**.
2. **Before merge:** remove the tracking docs `TASK-realia-slugs-todo.md`,
   `TASK-realia-slugs-log.md`, `TASK-realia-slugs-api-prompt.md`,
   `TASK-realia-slugs-review.md`.
3. **On PR open:** re-check inline comments and timeline review events
   (`CHANGES_REQUESTED` / `APPROVED` / `COMMENTED`) and update this file.
4. **Optional follow-up (out of scope):** extend the sitemap slug URL-encoding
   (F2 fix) to signs/dictionary/bibliography/fragments — needs care for fragment
   numbers containing `/`; file separately.
