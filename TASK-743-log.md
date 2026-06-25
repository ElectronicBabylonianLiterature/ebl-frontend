# TASK-743 — Work Log

## 1. Implementation check

PR #743 was already implemented and committed (`05e9f4a7`). Confirmed across
`RealiaEntry.ts`, `RealiaRepository.ts`, `RealiaDisplay.tsx`, `realiaSections.ts`,
fixtures, and tests. `parseAfoCitation`/`formatAfoVolume` already removed. Initial
realia-suite run: green.

## 2. Runtime crash triage

Symptom: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` in
`slugify` (called from `afoVolumeId(entry.realiaId, group.volume)` in `buildRealiaNav`).
The three identical traces are one render replayed (dev guarded-callback + concurrent
recovery), not three groups.

Root cause: the local API at `REACT_APP_DICTIONARY_API_URL` serves the **pre-ebl-api-PR-#715**
document shape — missing `realiaId`, `afoVolume`, and `page`. The backend schema (PR #715)
is the source of truth and defines these as present; the frontend is correctly aligned to it.
This is an **environment** defect (stale API), not a frontend code defect.

## 3. Course correction (this turn)

My earlier "fix" added `dto.realiaId ?? dto._id` and `?? ''` fallbacks plus optional DTO
fields. That violates the repo's instructions:

- "API Schema Alignment": backend schema is source of truth; do not introduce
  backward-compat shims unless explicitly requested. (Not requested.)
- "Pre-existing Issues": fix root cause, do not mask the symptom. The shim masked a
  stale-API environment problem.

Action: reverted both `RealiaRepository.ts` and `RealiaRepository.test.ts` to the committed,
schema-aligned state via `git checkout`. No client shim retained.

Also corrected my own process gaps: created the mandatory TASK-743 todo/log files and ran
the **full** test suite (previously I had only run the `src/realia` subset).

## 4. Gates

- `yarn tsc`: see run below.
- `yarn lint`: see run below.
- `yarn test --watchAll=false` (full): see run below.

## 5. Required user action

Run ebl-api PR #715 against the local DB so the served payload includes `realiaId`,
`afoVolume`, `page`, resolved per-entry `crossReferences`, and the `/realia/{realiaId}`
lookup. The crash and the missing AfO cross-reference links both resolve once the API
matches the schema the client targets.
