# TASK realia-reallexikon-reshape — TODO

Align the Dictionary of Realia tool with ebl-api PR #715 (realia collection reshape).

- [x] Read current realia domain/infrastructure/ui code before editing
- [x] `RealiaEntry.ts`: remove `content` from `ReallexikonEntry`
- [x] `RealiaRepository.ts`: remove `content` from `ReallexikonEntryDto` and `mapReallexikonEntry`
- [x] Keep reference dedup in `mapRealiaEntry` keyed on `reference.id`
- [x] `RealiaDisplay.tsx` `ReallexikonEntries`: render `entry.title` only
- [x] Keep `<ReferenceList references={[entry.reference]} />` (API-injected document + pages)
- [x] Fixtures: drop `content` from `reallexikonEntryFactory`
- [x] `RealiaRepository.test.ts`: drop `content`, use injected `{document, pages}` reference shape
- [x] `RealiaDisplay.test.tsx`: drop `content` from reallexikon builds
- [x] `RealiaEntry.test.ts`: no `content` usage (verified)
- [x] `yarn tsc` clean
- [x] `yarn lint` clean
- [x] Realia test suite passes, zero console noise
