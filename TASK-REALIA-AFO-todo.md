# TASK-REALIA-AFO — TODO

Make "II. AfO-Register Realien" expandable (like RlA), improve display/spacing,
and fix the duplicated "AfO AfO ..." citation.

- [x] Add `formatAfoReference` helper to normalize the AfO citation (prepend "AfO "
      only when absent) — fixes the duplicated prefix.
- [x] Render each AfO entry as an expandable `CollapsibleCard` (collapsed by default),
      label = `mainWord`, mirroring the Reallexikon section.
- [x] Restructure the card body: optional note, reference text, secondary `[AfO ...]`
      register marker.
- [x] Add SASS for AfO entry body spacing.
- [x] Align `realia-fixtures.ts` AfO data to the real backend shape.
- [x] Add/update tests: dedup, expandable behaviour, no-note path, coverage.
- [x] Hard gates: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false` (zero console noise).
- [x] Remind to remove TASK-REALIA-AFO-\*.md before merge.

## Follow-up: group AfO items by volume

- [x] Add `groupAfoRegisterByVolume` + `formatAfoVolume` to the domain (parse volume/page
      from the `AfO` string, group by volume preserving first-seen order).
- [x] One `CollapsibleCard` per AfO volume (header = volume name, e.g. "AfO 25 (1974-1977)"),
      listing all its items; per item shows main word, page, note, reference.
- [x] Update SASS for the grouped item list.
- [x] Update display tests + add domain unit tests (grouping, page extraction, fallbacks).
- [x] Hard gates green; 100% coverage on RealiaDisplay.tsx + RealiaEntry.ts.
