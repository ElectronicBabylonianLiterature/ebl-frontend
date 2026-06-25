# TASK-realia-structured-links — TODO

Build Realia links from structured backend fields + stable `realiaId`; stop regex-parsing
the decorated `AfO` string and stop navigating by the mutable lemma.

## Domain — `src/realia/domain/RealiaEntry.ts`

- [x] Add `afoVolume: string`, `page: string`, `crossReferences: readonly RealiaCrossReference[]` to `AfoRegisterEntry`.
- [x] Add `realiaId: string` to `RealiaEntry`.
- [x] Delete `parseAfoCitation` and `formatAfoVolume`.
- [x] Group on `afoVolume`; read `page` from the field (no regex).
- [x] Drop redundant `AfoRegisterVolumeEntry` (page now on base).
- [x] Add `getRedirectTarget` to detect redirect documents.

## Infrastructure — `src/realia/infrastructure/RealiaRepository.ts`

- [x] Map `realiaId`, entry `afoVolume`, `page`, entry `crossReferences`.
- [x] `find` fetches by `realiaId` (`/realia/{realiaId}`).

## UI — `src/realia/ui/RealiaDisplay.tsx`

- [x] Inline Querverweis links via resolved `entry.crossReferences` (`{id,lemma}` → `/tools/realia/{id}`); empty → plain-text `crossReference`.
- [x] `SeeAlsoList` links by `crossReference.id` (realiaId).
- [x] Per-entry caption uses the `AfO` string (keeps the year); volume label uses `afoVolume`.
- [x] Anchors / nav key on `realiaId`; per-volume anchors `(realiaId, afoVolume)`.
- [x] Results list links by `realiaId`.
- [x] Render redirect documents as "lemma → see target" linking by target `realiaId`.

## Sections — `src/realia/ui/realiaSections.ts`

- [x] `afoVolumeId(realiaId, afoVolume)` derived from fields, not an index.

## Gates

- [x] Update fixtures (`realia-fixtures.ts`) + tests; remove dead `parseAfoCitation`/regex tests.
- [x] `yarn tsc`, `yarn lint`, `yarn test --watchAll=false` clean (zero console noise).
- [ ] Remove this file + log before merge.
