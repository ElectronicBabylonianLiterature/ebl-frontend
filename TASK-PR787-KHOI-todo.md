# TASK-PR787-KHOI — Address khoidt review on PR #787 (`fix-n-calls`)

## Gates

- [x] `yarn lint` exit 0
- [x] `yarn tsc` exit 0
- [x] Focused suites: 0 failures, 0 console output
- [x] 250-line ceiling on every touched `.ts`/`.tsx`
- [x] No commit / push / branch operations

## Findings

- [x] B1 — `yarn tsc` hard gate (realiaOptionLoader TS18046)
- [x] F1 — centralize latest-transliteration record rule
- [x] F2 — malformed summary fields must not reject the whole query
- [x] F3 — non-line `hasNextPage` dead fallback
- [x] F4 — summary thumbnail navigation parity with master
- [x] F5 — `Reference.setDocument` must clear `hasUnresolvedDocument`
- [x] F6 — remove dead `hasCitationMetadata`
- [x] F7 — remove prohibited production comments
- [x] F8 — alias imports in new files
- [x] F9 — duplicate `isLineQuery` computation
- [x] F10 — `Images` must not select a nonexistent tab
- [x] F11 — period mapping without swallowed exceptions
- [x] F12 — 250-line gate on touched files
- [x] F13 — verify replaced tests lost no coverage
- [x] F14 — project-home legacy query behaviour
- [x] F15 — import placement in `corpus/domain/chapter.ts`
- [x] F16 — no code action (merge/check state)
- [x] F17 — focused coverage of affected/new defensive branches
