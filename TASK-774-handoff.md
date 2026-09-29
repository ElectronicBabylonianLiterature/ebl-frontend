---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: master
head: final cleanup commit on top of c742c21e (merge of master)
date: 2026-09-29
state: every review finding resolved or closed with evidence; no open items; awaiting Fabdulla1's re-review
tracked_in_git: false — TASK-*.md files are untracked and ignored by .gitignore from the cleanup commit on; they live only in the local checkout
gates: lint PASS, tsc PASS, test:ci PASS on the merged tree (513 suites / 4490 tests / 50 snapshots, zero console output), coverage 95.2/88.23/94.87/95.34, every changed source file 100%, CodeQL 0 results (branch and master), qlty no blocking issues
follow_up_pr: chore/split-oversized-files — the 45 remaining files over 250 lines, stacked on this branch
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and cancels requests with the browser's own `AbortController`. Reads can be cancelled; writes never are, and fragment saves go through one queue so they can't overtake each other.

Everything from the round-10 review is done: the code fixes, the master merge, the PR description, the CodeQL check, the Docker check, the #779 conflict plan and the cleanup. The only thing left is Fabdulla1's re-review, which has been requested.

## Final status

| #   | In plain words                                             | Status                                                                                                    |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| R1  | `master` (#821) conflicted in `Details.tsx`                | **Fixed** — merged in `c742c21e`                                                                          |
| R2  | Named-entity saves skipped the save queue                  | **Fixed**                                                                                                 |
| R4  | qlty: converter form too complex                           | **Fixed** — qlty "No blocking issues"                                                                     |
| R5  | No test checked the converter's signal on the real `fetch` | **Fixed**                                                                                                 |
| R6  | Limiter test should check the exact abort reason           | **No change needed** — jsdom here has no `AbortSignal.reason`                                             |
| R7  | `SerialQueue` passed one save's result to the next         | **Fixed**                                                                                                 |
| R8  | A stuck save on one fragment delayed the next              | **Fixed**                                                                                                 |
| R9  | Hand-rolled console mocks in four tests                    | **Fixed**                                                                                                 |
| M1  | PR description out of date                                 | **Fixed** on GitHub                                                                                       |
| W2  | qlty can't compute diff coverage above 500 files           | **Fixed** — noted in the description                                                                      |
| B10 | Fabdulla1's "changes requested"                            | **Re-review requested**                                                                                   |
| B11 | Scratch `TASK-*.md` files tracked on the branch            | **Fixed** — untracked, `TASK-*.md` in `.gitignore`                                                        |
| B12 | CodeQL couldn't check a PR this big                        | **Fixed** — local CodeQL, 87 rules: 0 results on the branch and on master                                 |
| W1  | No PR job builds the Dockerfile                            | **Checked** — no Docker here; Dockerfile unchanged and built on master; Docker-pruned context type-checks |
| W3  | Conflict with #779 (six files)                             | **Resolved and verified** in a trial merge — recipe below                                                 |
| I2  | Node 20 deprecation on the qlty action                     | **Fixed** — SHA-pinned v2.3.0 (`node24`), same pin as #779                                                |
| —   | Local Browserslist "caniuse-lite outdated" notice          | **Fixed** — stale local `node_modules` re-synced to the lockfile                                          |
| —   | 45 files over 250 lines outside this PR                    | **Separate PR** `chore/split-oversized-files`, stacked on this branch                                     |

## If #779 lands after this PR (W3 recipe)

- Workflows: take #779's SHA pins on every conflicting `uses:` line. In `main.yml`'s qlty step keep this PR's comment block and `if: github.event_name == 'push' || github.base_ref == 'master'`. Keep the No-bluebird step, `yarn test:ci`, `yarn build:ci-stable`, permissions and `docker-test` `needs: [test]`.
- `craco.config.js`: keep #779's `configureJest` / `configureWebpack` structure and its `scripts/` test roots; port this PR's `fullyCoveredPaths`, `validateFullyCoveredPaths`, per-path 100% thresholds, global floors 94/86/94/94, `modulePaths`, `resolve.modules`, and the shorter Sass `silenceDeprecations: ['legacy-js-api']` / `ignoreWarnings` lists.
- `DateSelectionMethods.test.ts` (both added it): keep this PR's version; fold #779's "saves a changed date" into the save test (index 2); move #779's extra `getDate` assertions into `getDate.test.ts`.
- `waitForSpinnerToBeRemoved.ts`: #779's typed signature and constant name, this PR's 5000 ms timeout.
- #779's new `src/chronology/ui/DateEditor/DateSelection.dates.test.tsx` imports bluebird; switch it to `Promise.resolve`, or the No-bluebird step and `tsc` fail.

## Things worth knowing

- **Every fragment save goes through `SerialQueue`** in `CuneiformFragmentController.handleSave`. Hand `onSave` the request itself, never a promise already started. The queue resets when the displayed fragment changes.
- **Console in tests:** `expectConsoleErrors`, `tolerateConsoleErrors`, `expectConsoleWarnings` (return the spy) and `observeConsole` (pass-through) from `setupTests`. Never `jest.spyOn(console, ...).mockImplementation()`.
- **Signals:** `withDataGetters.abortSignal.test.tsx` and `SignService.abortSignal.test.ts` show how to prove a signal reaches `fetch`.

## Traps met

- jsdom 16.7 has no `AbortSignal.reason`; expect `name: 'AbortError'`.
- `qlty check --upstream origin/master` sees "no modified files" here; pass paths explicitly.
- A session restart wipes the `/tmp` scratchpad. Keep worktrees, patches and downloads under `/workspaces/ebl-frontend.worktrees/`.
- CodeQL JS analysis needs about 3 GB (`--ram=3200`); run it with nothing else heavy resident.
- Never run lint, tsc, qlty or CodeQL alongside `yarn test:ci`.
