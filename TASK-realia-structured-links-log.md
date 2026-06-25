# TASK-realia-structured-links — Work Log

## Context

Backend now serves a stable `realiaId` and structured AfO-register fields (`afoVolume`,
`page`) plus per-entry resolved `crossReferences` (`{id, lemma}[]`). Frontend must build
every link from these structured fields + the stable id instead of regex-parsing the
decorated `AfO` string and navigating by the mutable lemma.

## Decisions / assumptions

- **Volume label** uses `afoVolume` verbatim (slash form, e.g. `AfO 40/41`) to match the
  AfO-Register tool. The decorated `AfO` string (with year) is kept only as the per-entry
  caption, shown when pages differ within a volume (same gating as before).
- **Per-volume anchor id** = `realia-afo-volume-{realiaId}-{slug(afoVolume)}`, computed in
  both the nav builder and the display so they always match regardless of order.
- **Redirect detection** (`getRedirectTarget`): no `afoRegister`, no `references`, no
  `afoCrossReferences`, at most one _stub_ reallexikon link (a `ReallexikonEntry` whose
  `reference` is `null`), and exactly one `crossReferences` pointer. Renders
  "lemma → see target" linking by the target's `realiaId`. The stub check avoids
  misdetecting a real single-RlA-article entry (which carries a reference) as a redirect.

## Files changed

- `src/realia/domain/RealiaEntry.ts` — new fields; removed `parseAfoCitation` +
  `formatAfoVolume` + `AfoRegisterVolumeEntry`; group on `afoVolume`; `getRedirectTarget`.
- `src/realia/infrastructure/RealiaRepository.ts` — map `realiaId`, `afoVolume`, `page`,
  entry `crossReferences`; `find(realiaId)`.
- `src/realia/application/RealiaService.ts` — `find` param renamed to `realiaId`.
- `src/realia/ui/RealiaDisplay.tsx` — resolved inline cross-reference links (plain text
  when unresolved), `SeeAlsoList` links by id, per-entry `AfO` caption, redirect render,
  anchors via `realiaId`.
- `src/realia/ui/realiaSections.ts` — `afoVolumeId(realiaId, afoVolume)` (slugged).
- `src/realia/ui/RealiaResultsList.tsx` — link + key by `realiaId`.
- `src/realia/ui/Realia.sass` — `.Realia__redirect-pointer` style.
- `src/test-support/realia-fixtures.ts` — new fields with coherent defaults.
- Tests + one integration snapshot updated; dead regex/`formatAfoVolume` tests removed
  (explicitly authorised by the task: "remove the now-dead regex tests").

## Notes

- Breadcrumbs: the only navigable Realia crumb is the section link (`/tools/realia`); the
  per-entry crumb is a non-link `TextCrumb` (lemma as display label), so nothing there
  needed re-keying to `realiaId`.
- Per-entry `AfO` caption keeps the year and is shown when pages differ within a volume
  (same gating as the old page caption); the volume label is `afoVolume` (no year).

## Gates — all green

- `yarn tsc`: clean.
- `yarn lint` (eslint + stylelint): clean.
- `yarn test --watchAll=false`: 324 suites, 3336 passed, 2 pre-existing skips, 0 failures,
  no console noise.

## Pre-existing issues

- None surfaced in the touched areas; the 2 skipped tests are pre-existing and unrelated.
