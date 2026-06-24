# TASK-REALIA-RLA-MULTI — TODO

Align the frontend to the backend `reallexikon` (RlA) schema change so a Realia
page can list multiple RlA entries.

Backend change (from the API agent):

- `reallexikon` is an array of RlA entries (`ReallexikonEntry[]`); never null,
  may be `[]`. Applies to `GET /realia/{id}` and `GET /realia?query=`.
- Per-entry shape: `{ id, title, content, reference: Reference | null }` — the
  reference is now an **embedded** `ApiReference` object, not a string id that
  must be resolved against the page's top-level `references` list.

## Checklist

- [x] Domain: `ReallexikonEntry.references: Reference[]` → `reference: Reference | null`;
      keep `reallexikon: ReallexikonEntry[]` (handles empty/single/multiple).
- [x] Repository: DTO `reference: ReferenceDto | null` (embedded); map directly;
      remove the obsolete id-resolution / `rla_`-prefix / "attach unlinked to
      first entry" / top-level-reference-splitting machinery; top-level
      `references` now maps straight through.
- [x] Display: render each RlA article; render the single `entry.reference`;
      empty `reallexikon` omits the section (no crash on `[]`).
- [x] Fixtures: `reallexikonEntryFactory` defaults `reference: null`.
- [x] Tests: rewrite repo mapping tests for embedded reference (multiple A/B/C
      articles, null reference, top-level refs kept separate, empty/single/null
      normalization); update display tests; add a "multiple RlA articles on one
      page" test.
- [x] Remove tests that only covered the deleted id-resolution code paths
      (justified: underlying code path removed).
- [x] `yarn lint` zero / `yarn tsc` zero.
- [x] 100% coverage on changed files (RealiaEntry.ts, RealiaRepository.ts,
      RealiaDisplay.tsx); tests console-clean.
- [x] Full `yarn test --watchAll=false` — 324 suites / 3292 passed (2 skipped),
      50 snapshots, zero console output.
- [ ] Remind to remove TASK-\* tracking files before merge.

## Notes

- Process correction: these TASK-\*.md tracking files were created after the work
  (and committed-state of prior tasks) to comply with the mandatory
  per-task TODO/log convention; they were initially missed for this task.
