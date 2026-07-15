# TASK-realia-query-efficiency — Work Log

## 2026-07-15 — Audit

Read the realia fetch/display stack: `RealiaInfoContext`, `realiaInfo`,
`RealiaSelect`, `RealiaService`, `RealiaRepository`, `NamedEntityPreviewContext`,
`TextAnnotation`, `Display`, `SpanEditor`, `fragmentSpans`, `realiaTypeMapping`.

### Findings

1. **N+1 fetch on load (display + editor).**
   `useRealiaInfoService` (`RealiaInfoContext.tsx`) fetched every realiaId
   individually with `realiaService.find(id)` → `GET /realia/by-id/{id}`. A
   fragment with N distinct realia annotations issued N requests. Used by both
   `NamedEntityPreviewProvider` (display) and `TextAnnotation` (editor).

2. **Refetch on the named-entity toggle.**
   `Display` mounts `NamedEntityPreviewProvider` only while `showNamedEntities`
   is true. Toggling off unmounts it and drops the lookup / requested-id refs;
   toggling on re-ran the N fetches.

3. **Search fired per keystroke.**
   `RealiaSelect` used `react-select/async` with no debounce (`cacheOptions`
   deliberately off because the exclusion list varies per span), so every
   keystroke hit `GET /realia?query=`.

### Backend state

Only `/realia/by-id/{id}`, `/realia/{lemma}`, `/realia?query=` exist. No
bulk-by-ids endpoint. The single in-flight realia API PR is ebl-api #735
(`GET /realia/all`, IDs only, for sitemaps) — not titles-in-text.

### Decision (with user)

- Resolve realia display titles **inline in the text query**: the fragment
  response carries `realiaInfo: [{ realiaId, lemma, type }]`. The frontend reads
  it directly → zero realia calls for display, and the toggle refetch problem
  disappears (nothing is fetched on toggle).
- Build the frontend now against this contract, with mocked-service tests.

## Implementation

### Inline realia titles (removes N+1 and toggle refetch)

- New `RealiaInfoEntry = { realiaId, lemma, type }` (`EntityType.ts`), a distinct
  kind kept in its own collection — never intermixed with the realia annotation
  spans (data-architecture gate).
- `Fragment.realiaInfo?` added to the domain, `FragmentDto.realiaInfo?` to the DTO;
  `createFragment` already spreads the DTO, so it passes through untouched.
- `realiaInfo.ts`: added `toRealiaDisplayInfoEntry` + `buildRealiaInfoLookup`
  (keys entries by realiaId, maps `type` → colour via the existing
  `getMappedEntityType`), and `emptyRealiaInfoEntries` (stable empty ref).
  Removed the now-unused `getRealiaIds`.
- `useRealiaInfoService(entries)` rewritten: builds the lookup from the inline
  entries with `useMemo`, keeps `register` for editor picks (merged over the
  inline lookup), and **no longer fetches** — the `realiaService` dependency and
  the per-id `Promise.all(find)` effect are gone.
- `NamedEntityPreviewProvider` (display) and `TextAnnotation` (editor) both seed
  from `fragment.realiaInfo ?? emptyRealiaInfoEntries`. The display toggle now
  triggers no request (nothing is fetched), so toggling on/off is free.

### Search debounce (reduces annotation-search call load)

- `RealiaSelect` now builds its `loadOptions` from `createRealiaOptionLoader`, a
  lodash-`debounce` (300ms) wrapper that reads the latest `{realiaService,
excludedRealiaIds}` via a ref, skips empty queries, and cancels on unmount.
  Rapid typing collapses to one search of the latest input.

### Instructions gate

- Added an **API Call Efficiency** hard-gate section to
  `.github/copilot-instructions.md` (no N+1, fetch-once-per-load, prefer
  embedding, debounce search, cancel superseded work) plus a mandatory
  efficiency-audit bullet in the Review Guidelines.

### API prompt

- `TASK-realia-query-efficiency-api-prompt.md` holds the exact data-modelling
  prompt for ebl-api (embed `realiaInfo` in the fragment response, batch `$in`
  load, read-only/inbound-only, tests). Checked ebl-api: only open realia PR is
  #735 (`/realia/all`, sitemap ids) — unrelated; no titles-in-text PR exists yet.

### Tests / fixtures

- `named-entity-fixtures.ts`: added `previewRealiaInfo`; `createAnnotatedFragment`
  / `annotatedFragment` now carry `realiaInfo`.
- Rewrote `RealiaInfoContext.test` (inline, no fetch) and
  `NamedEntityPreviewContext.test` (asserts label/colour from inline info and
  that `find` is never called).
- `realiaInfo.test`: replaced `getRealiaIds` cases with
  `toRealiaDisplayInfoEntry` / `buildRealiaInfoLookup` cases.
- `RealiaSelect.test`: added `createRealiaOptionLoader` cases (debounce coalesces
  to one search of the latest input; empty query returns `[]` without searching;
  cancel stops a pending search) with fake timers.
- `TextAnnotation.realiaEditing.test`: fragment now carries `realiaInfo`
  (via immer `produce`); dropped the `realiaServiceMock.find` seed.
- `Display.test` / `NamedEntityPreviewToken.test`: realia indicator now shows the
  real lemma `Apkallu` (was the raw id), demonstrating display works with zero
  fetch.

### Audit result (efficiency gate)

- No list of realia is fetched one-per-id anymore; display data is embedded in
  the fragment response and read from state.
- The named-entity toggle issues no realia request.
- Search-as-you-type is debounced and skips empty queries; the debounced request
  is cancelled on unmount.
- `realiaInfo` is inbound-only: there is no full Fragment→DTO serializer, and no
  fragment write includes it, so it cannot leak to the API.

## Gates

- `yarn tsc` — clean.
- `yarn lint` — clean (eslint + stylelint).
- `yarn test --watchAll=false` — 357 suites, 3700 passed, 2 skipped, 50 snapshots
  (none updated), exit 0. **0** console.error / console.warn / `Warning:` /
  `not wrapped in act` / unhandled-rejection occurrences across the full run.
- Coverage on every touched source file — `RealiaInfoContext.tsx`,
  `RealiaSelect.tsx`, `realiaInfo.ts`, `NamedEntityPreviewContext.tsx`,
  `TextAnnotation.tsx` — 100% statements, branches, functions, lines.

## Not verified end-to-end

The inline-titles path cannot be driven against a real backend until ebl-api
embeds `realiaInfo` (see the API prompt). Behaviour is covered by unit/integration
tests with a mocked `FragmentService`; the client degrades to the raw realiaId
when the field is absent, so it is safe to ship ahead of the API.

## Progress

- [x] Audit complete; three inefficiencies found and fixed (N+1, toggle refetch, un-debounced search).
- [x] Frontend built against the inline-titles contract; all hard gates green.
- [x] Efficiency-audit blocking gate added to the instructions (and to reviews).
- [x] Exact API prompt written; corresponding ebl-api PR checked (#735, unrelated).
- [ ] Ship ebl-api `realiaInfo` change (API prompt) to activate inline titles end-to-end.
- [ ] Remove `TASK-realia-query-efficiency-*.md` before the PR is merged.
