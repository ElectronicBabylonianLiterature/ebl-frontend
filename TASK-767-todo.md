# TASK-767 — TODO

Review of PR #767 "Add realia annotation layer to named entity annotation".

## Review gathering (hard gates)

- [x] Identify the PR and its head SHA (`767`, head `7d5015e2124cf6486deac70724386f692e3de655`)
- [x] Fetch every timeline review event (`APPROVED` / `CHANGES_REQUESTED` / `COMMENTED`)
- [x] Fetch every inline review comment with resolved / outdated status (GraphQL `reviewThreads`)
- [x] Fetch every general (issue) comment — 0 found
- [x] Fetch every check run for the head SHA
- [x] Fetch every commit status for the head SHA
- [x] Fetch qlty issues (`qlty check`, `qlty smells`, remote `qlty check` / `qlty coverage diff`)

## Verification of each pre-existing finding

- [x] Jul 22 — `FragmentDisplaySettings` toggle label — verify against head
- [x] Jul 22 — workflow test for both arrays + stripped derived fields — verify against head
- [x] Jul 30 — `injectedApp.testSupport.tsx` `any` + eslint-disable — verify against head
- [x] Jul 30 — `RealiaSelect` rejection / race / unmount handling — verify against head
- [x] Jul 30 — save baseline vs. post-save refresh failure — verify against head
- [x] Jul 30 — `useAnnotationContext` mount-only initialisation — verify against head
- [x] Jul 30 — Word/PDF export negative assertions — verify against head

## Independent audit

- [x] Data Architecture gate — one kind per collection, end to end
- [x] API Call Efficiency gate — N+1, re-fetch on toggle, debounce, cancellation, embedding
- [x] Outbound payload built in one place, no derived fields, pinned by a test
- [x] 250-line ceiling on every changed `.ts` / `.tsx`
- [x] Cross-repository contract check against `ebl-api` master and PR #740

## Local gates on the merge with `master`

- [x] `yarn install --frozen-lockfile`
- [x] `git worktree` merge of `add-realia-annotation` into `origin/master` (`e96b8536`)
- [x] `yarn tsc`
- [x] `yarn lint`
- [x] `yarn test --watchAll=false` (full log, console-noise check)
- [x] `yarn build`
- [x] Coverage — 100% statements / branches / functions / lines on every changed file
- [x] Remove the scratch worktree and leave the working tree clean

## Fixes applied (after review sign-off from the user)

- [x] F1 — `RealiaSelect`: rejection handling, request-ordering guard, in-flight cancellation, 5 scenario tests
- [x] F2 — separate persistence success from refresh success; service + UI tests for all five outcomes
- [x] F3 — narrow mocked-constructor type; eslint-disable removed
- [x] F4 — `withData` `watch` on the fragment number; tests confirmed to fail without the fix
- [x] F5 — export negative assertions plus a static guard, verified load-bearing
- [x] F6 — no changed file grows past `master`; five remain over 250 in absolute terms
- [ ] F7 — not applied: policy changes are disclosed in the PR description (author's call)
- [x] F8 — plain click follows the realia link in the read-only view
- [ ] F9 — not applied: every cure needs an eslint suppression or 34 `!` assertions
- [ ] F10 — external: waiting on `ebl-api` #740

## Re-verification on the merge with `master`

- [x] `yarn tsc`, `yarn lint`, `yarn build` — all exit 0
- [x] 386/386 suites, 3875 tests, zero console output
- [x] 100% statements / branches / functions / lines on all 72 changed source files
- [x] `qlty check` clean; `qlty smells` down to two pre-existing constructors

## Output

- [x] `TASK-767-log.md`
- [x] `TASK-767-review.md`
- [ ] Remove `TASK-767-*.md` before the PR is merged
