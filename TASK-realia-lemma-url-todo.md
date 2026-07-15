# TASK-realia-lemma-url — TODO

Task: realia tag URLs (alt-click on a realia indicator) must use the **lemma**, not the realia id —
`/tools/realia/Babylon`, not `/tools/realia/realia_001514`.

## Work

- [x] Investigate: `openRealiaPageInNewTab(realiaId)` built the URL from `realiaId`; every other realia
      link (`RealiaResultsList`, `RealiaParts`, `RealiaAfoRegister`, `RealiaRedirect`) already uses the lemma
      (`entry.id`). Route `/tools/realia/:id` → `RealiaService.find` dispatches by `isRealiaId`, so it resolves
      both a lemma and a realia id.
- [x] Expose the lemma (`label`) from `useSpanIndicator`.
- [x] `SpanIndicator` / `SpanIndicatorView`: open the realia page with the lemma (`label`); fall back to the
      realia id when the lemma is unresolved (still a valid route param).
- [x] Rename the `realiaPage` helper param `realiaId` → `identifier` (now accepts lemma or id).
- [x] Update the two URL-assertion tests to the lemma; add a fallback test (unresolved lemma → id).

## Hard gates (copilot-instructions)

- [ ] `yarn lint` → 0.
- [ ] `yarn tsc` → 0.
- [ ] `yarn test --watchAll=false` — full suite, 0 failures, 0 console output.
- [ ] Coverage 100% on affected code.
- [x] Add/update tests.
- [x] Create + maintain this todo and the log.
- [x] No changed/added script file exceeds 250 lines.

## Notes

- Remove this todo/log pair before merge.
