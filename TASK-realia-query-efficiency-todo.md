# TASK-realia-query-efficiency — TODO

Goal: make realia API calls efficient. Bulk-once on page load in display and
editor; no realia refetch when the named-entity toggle flips; reduce the
annotation search call load; audit realia calls broadly. Add an
efficiency-audit blocking gate to the instructions.

Architecture decision (confirmed with user): **inline realia titles in the text
query** — the fragment response carries a `realiaInfo` list
(`{ realiaId, lemma, type }`), so the frontend never fetches per-id realia for
display. Build the frontend now against this agreed contract; write the exact
API prompt for the backend change.

## Findings (audit)

1. N+1 per-id fetches: `useRealiaInfoService` fetched each realiaId via
   `realiaService.find(id)` → `GET /realia/by-id/{id}` (display + editor).
2. NE toggle refetch: `NamedEntityPreviewProvider` mounts only while toggled on,
   so each toggle re-ran all fetches.
3. Search per keystroke: `RealiaSelect` `AsyncSelect` had no debounce.

## Tasks

- [ ] `RealiaInfoEntry` type + `Fragment.realiaInfo` (domain, DTO, repo pass-through).
- [ ] `realiaInfo.ts`: `buildRealiaInfoLookup` / `toRealiaDisplayInfoEntry`; drop unused `getRealiaIds`.
- [ ] `useRealiaInfoService`: seed lookup from inline entries, keep `register`, remove fetch + `realiaService` dep.
- [ ] Wire `NamedEntityPreviewProvider` and `TextAnnotation` to `fragment.realiaInfo`.
- [ ] Debounce `RealiaSelect` search (extract testable loader).
- [ ] Update fixtures + tests; 100% coverage on touched files; console-clean.
- [ ] Add efficiency-audit blocking gate to `.github/copilot-instructions.md`.
- [ ] Write the exact API prompt (inline realia titles) — check ebl-api PR #735.
- [ ] Gates: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false`.

## Reminder

Remove `TASK-realia-query-efficiency-*.md` before the PR is merged.
