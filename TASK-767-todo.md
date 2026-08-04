# TASK-767 TODO — PR #767 "Add realia annotation layer to named entity annotation"

## Phase 1 — Review (complete)

- [x] Confirm PR identity, head SHA, base, mergeability — #767, head `76011bb2` == local HEAD, base `master`, `mergeable_state=clean`
- [x] Fetch ALL timeline review events — 6 (2 qlty COMMENTED, 2 CHANGES_REQUESTED, 2 APPROVED)
- [x] Fetch ALL inline review comments with resolved/outdated status — 5 threads, all resolved + outdated (GraphQL)
- [x] Fetch ALL general/issue comments — 0
- [x] Fetch CI check runs + statuses — 8 runs, 0 failing; commit status `success`
- [x] Fetch qlty issues — check "No blocking issues", coverage diff 100.0%, total 94.0% (+0.9%); web UI needs auth, noted as limitation
- [x] Inspect the diff — 181 files, +19,661/−11,101
- [x] Verify earlier CHANGES_REQUESTED items actually resolved — all 4 confirmed fixed in source
- [x] Write `TASK-767-review.md` with template sections + `What Has To Be Done`

## Phase 2 — Address the findings (complete except where blocked)

- [x] **F1** — read-only Realia indicator now a real `<a href>`; shim removed
- [x] **F1** — dropped now-unused `openRealiaPageDirectly` from the hook interface
- [x] **F1** — removed the unreachable `!realiaId` guard in `openRealiaPageOnClick` (would have been an uncovered branch)
- [x] **F1** — neutralised default anchor styling in `TextAnnotation.sass`; confirmed rules reach the served bundle
- [x] **F1** — tests rewritten for the link contract (href/target/rel, `getByRole('link')`, no shim, continuation clicks)
- [x] **F2** — measured all 26 caller files at RTL's default: all passed, so restored `waitForSpinnerToBeRemoved.ts` from `master` (byte-identical)
- [x] **F3** — comment deleted from `RealiaEntry.ts`
- [x] **F4** — comment deleted from `fragmentQueryMapping.ts`; `eslint-disable` at :81 kept
- [x] **F5** — approved and done: editor mock extracted to `editor/Editor.testSupport.tsx`, shared via `jest.requireActual`; both tests un-skipped; **0 skipped tests remain in the repo**
- [x] **F6** — approved and done: `museum.ts` 472 → 20 lines + three `museums/*.ts` modules (150/159/156); data and `MuseumKey` equivalence both verified
- [x] **F7** — new: `TransliterationForm.test.tsx` was 284 at HEAD, deduplicated to 226

## Phase 3 — Gates (complete)

- [x] `yarn lint` — exit 0 (two new-test lint errors found and fixed)
- [x] `yarn tsc` — exit 0
- [x] `yarn test --watchAll=false` — 405 suites / **3868 passed, 0 skipped** / 0 failed, **zero console noise**
- [x] Coverage on every touched file — **100%** stmts/branches/funcs/lines
- [x] 250-line ceiling on changed files — largest 226
- [x] Verify behavior by running the app — compiled, `/` and `/tools/realia/Apkallu` → 200, no runtime errors; server stopped
- [x] Update `TASK-767-review.md` and `TASK-767-log.md` with outcomes

## Open

- [ ] Commit the F1–F7 changes (currently **uncommitted**) — task docs go in the same commit as the code
- [ ] Optional separate task: the other **74** files over the 250-line ceiling on `master`
- [ ] **Remove `TASK-767-todo.md`, `TASK-767-log.md`, `TASK-767-review.md` before merge**
