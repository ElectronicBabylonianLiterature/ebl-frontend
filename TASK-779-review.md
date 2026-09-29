---
task: TASK-779
pr: 779
title: Run sitemap automation under its own bot identity
url: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/779
review_date: 2026-09-23
review_round: 3
fix_round: 1 (2026-09-23; merge commit 41364482 plus one fix-round commit, both local, nothing pushed)
head_sha: ecf87efcfb2241646d5c440a338f2d984a029ee8
base_branch: master
commits_reviewed: 4 (56c1c3d4, 1245c0c4, c44278c7, ecf87efc)
files_changed: 15 (+750 / -220)
verdict: CHANGES_REQUESTED
verdict_note: Small fixes only. The design is sound and every point from the previous review has been addressed in code.
findings_total: 8
findings_by_severity: { blocker: 1, medium: 1, low: 5, nit: 1 }
findings_fixed_locally_committed: F1, F2, F3, F4, F5, F7 (explicit tests, as you chose)
findings_fixed_locally: F6 (merge commit 41364482, not pushed)
findings_awaiting_you: B1 (reply drafted, kept as a draft as you chose)
unresolved_review_threads: 0
open_changes_requested_reviews: 1 (Fabdulla1, on 1245c0c4)
bot_reviews: none (no sourcery-ai, Copilot or other bot review or comment on this PR)
ci_checks: all green (test, Analyze (javascript), CodeQL, GitGuardian x3); docker and docker-test skipped (master-push only)
codeql: No new alerts in code changed by this pull request
qlty: check "No blocking issues"; coverage diff 100.0%; total coverage 94.3% (+1.2%)
gate_lint: PASS (local and CI)
gate_tsc: PASS (local and CI)
gate_tests_after_fixes: PASS — all 445 suites on the merged tree + fixes, zero console output (run in two parts because of container memory)
gate_tests: PASS — local on head ecf87efc: 343 suites, 3488 passed, 2 skipped (pre-existing), exit 0; CI on merge ref 131a98c: 438 suites, 4202 passed
behind_master: 17 commits (CI tests the merge commit 131a98c = ecf87efc + master e281f7ba)
gate_console_clean: PASS (local and CI logs, zero console output from tests)
gate_250_lines: PASS (largest changed script is 153 lines)
gate_no_new_md: PASS (only README.md modified)
gate_run_app: NOT VERIFIED (dev container cannot run yarn start / yarn build; CI build for this sha compiled successfully)
dev_container_changes: none
docker_ci_changes: YES — docker and docker-test jobs in main.yml move build-push v5→v7, login v3→v4, setup-buildx v3→v4 (see F5)
---

# Review: PR #779 — Run sitemap automation under its own bot identity

## Review Summary

Nice work. Moving the sitemap bot off a personal token and onto a GitHub App is the right fix, and splitting the job so the private key never sits next to `npm install` is a thoughtful touch. I checked every point from Fabdulla1's review against the code: the script now fails closed, runs are serialised, every action is pinned (I verified all 14 SHAs against their tags), and the token is minted right before it is used. CI, CodeQL, qlty and GitGuardian are all green, and nothing here changes the dev container.

There's one thing I'd like fixed before merging. If the sitemap page can't be reached, the crawl never closes the browser, so the job hangs for six hours instead of going red straight away. The other items are small hardening and tidy-ups. The review from Fabdulla1 still says "changes requested", so it needs a reply and a fresh look from them before this can merge.

⚠️ **Docker heads-up:** the `docker` and `docker-test` jobs jump two major versions of `build-push-action` (v5→v7). They only run on pushes to `master`, so this PR's CI hasn't run them. The first real run happens after the merge, so keep an eye on it (details in F5).

### Details

| ID  | Severity | Status                                                           | File                                                                          | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | Medium   | Fixed (uncommitted)                                              | `scripts/sitemapUpdater.js:32-55`, `.github/workflows/update-sitemaps.yml:16` | `fetchNewSitemaps` only closes the browser on the happy path. If `page.goto` throws (unreachable source, DNS failure, navigation timeout), the Chromium child stays alive and keeps Node running, so `process.exitCode = 1` never turns into an exit. The `crawl` job has no `timeout-minutes`, so it runs until GitHub's 360-minute default and holds the `update-sitemap` concurrency group the whole time, so a manual dispatch just waits. The "fails the run when the sitemap source is unreachable" test does not assert `browser.close`, so this path isn't covered. Fix: wrap the page work in `try { … } finally { await browser.close() }`, add `timeout-minutes` (e.g. 30 for `crawl`, 10 for `publish`), and assert `browser.close` in the unreachable test. |
| F2  | Low      | Fixed (uncommitted)                                              | `.github/workflows/update-sitemaps.yml:89-109`                                | The artifact is the only thing that crosses the trust boundary between the job that runs third-party install scripts and the job that holds the App key, and `publish` commits it as-is under `public/`, which is served from the eBL domain. A compromised dependency in `crawl` could smuggle an arbitrary file (e.g. `.html`/`.js`) into `public/sitemap` and it would be committed by the bot with auto-merge armed. Human approval is still required, so this is defence in depth. Fix: before minting the token, validate that every downloaded file matches `^sitemap[0-9]*\.xml\.gz$` and passes `gzip -t`, and fail otherwise.                                                                                                                                  |
| F3  | Low      | Fixed (uncommitted)                                              | `scripts/sitemapUpdater.test.js:95`, `scripts/sitemapUpdaterTestDoubles.js`   | CRA sets `resetMocks: true` but not `restoreMocks`, so `jest.spyOn` spies are reset, not restored. I verified on Jest 27.5.1 that after the `fetchNewSitemaps` test, `global.setTimeout` stays a no-op mock and `fs.existsSync` returns `undefined` for every later test in the same file. It passes today only because the later tests happen not to need them, so the tests depend on their order. Fix: `afterEach(() => jest.restoreAllMocks())` in both test files, ideally via one shared helper in `sitemapUpdaterTestDoubles.js`.                                                                                                                                                                                                                                 |
| F4  | Low      | Fixed (uncommitted, pre-existing)                                | `.github/workflows/secret-scan.yml:21`                                        | The Node 24 migration missed `secret-scan.yml`: `actions/checkout@34e11487` is a Node 20 release, and it produces the only warning annotation on this head ("Node.js 20 is deprecated …" on the GitGuardian scan job). The PR description says the Node 20 warnings are cleared. Fix: pin it to the same `actions/checkout@3d3c42e5… # v7.0.1` used elsewhere.                                                                                                                                                                                                                                                                                                                                                                                                           |
| F5  | Low      | Fixed (uncommitted, ⚠️ Docker CI)                                | `.github/workflows/main.yml:65-76`, `:98-109`                                 | The Docker build/push jobs move `build-push-action` v5→v7, `login-action` v3→v4 and `setup-buildx-action` v3→v4. The inputs used still exist in v7, but since v6 the action uploads a build record artifact by default (`DOCKER_BUILD_RECORD_UPLOAD=true`) that includes the build arguments. The values passed here are `REACT_APP_*` settings that already ship in the public JS bundle, so this is not a leak today, but it is a new artifact on a public repo and a trap if a real secret is ever passed as a build arg. These jobs run only on `master` pushes, so this PR never ran them. Fix: set `DOCKER_BUILD_RECORD_UPLOAD: false` (or explicitly accept it), and watch the first `master` run after merge.                                                    |
| F6  | Nit      | Fixed locally (merge commit `41364482`, not pushed)              | branch                                                                        | The branch is 17 commits behind `master` (including #762, #783 and #817). The PR description's "343 suites, 3488 passed, 2 skips" is correct for the branch head (I reproduced it locally), but CI tests GitHub's merge commit `131a98c`, which ran 438 suites / 4202 tests. So the local verification and CI check two different trees. Nothing conflicts and CI on the merge is green, but updating the branch from `master` would let the local gates cover what actually merges.                                                                                                                                                                                                                                                                                     |
| F7  | Low      | Fixed for the 8 flapping files found (uncommitted, pre-existing) | `src/test-support/*-fixtures.ts`, `*-factory.ts`                              | Coverage is non-deterministic: two back-to-back full runs on the same code gave different branch/line coverage for `Kings.tsx` (73.33% vs 40% branches), `DateDisplay.tsx`, `DateSelectionMethods.ts`, `ManuscriptJoins.tsx` and `archaeology.ts`. Root cause: the fixtures build data from at least 11 unseeded `new Chance()` instances (plus `Math.random` in `fragment-fixtures.ts`), so whether a test reaches a branch such as a dynasty-2 king or a `?`/`!` date marker depends on the random draw. Not introduced by this PR, but it makes the qlty coverage delta flap. Fix: seed fixture randomness from one shared, seeded source, and cover the affected branches with explicit tests.                                                                       |
| B1  | Blocker  | Open — reply drafted, kept as a draft as you chose               | —                                                                             | Fabdulla1's `CHANGES_REQUESTED` review (on `1245c0c4`) still stands. All four of its points are addressed in code (see Comment Status), but there's no reply on the PR yet and the review hasn't been re-done or dismissed, so branch protection will block the merge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Summary

This PR replaces the personal access token in `update-sitemaps.yml` with a short-lived GitHub App installation token, so sitemap PRs are authored by a bot and a maintainer can approve them. The workflow is split into a secret-free `crawl` job and a `publish` job that holds the App key. The update script moves into a tested module that fails closed on unreachable or incomplete downloads. Repository hygiene is also included: SHA-pinned Node 24 actions in `main.yml` and `codeql-analysis.yml`, a `craco.config.js` refactor into small helpers plus Jest roots for `scripts/`, ESLint coverage for `scripts/**/*.js`, a 3 s budget for `waitForSpinnerToBeRemoved`, two orphaned `yarn.lock` entries dropped, and a rewritten README section.

What I checked:

- Every timeline review event and every inline or general comment, via GraphQL and REST, cross-checked.
- Every check run and commit status on the head.
- CodeQL and qlty results, check annotations and the CI `test` job log.
- The full diff against `origin/master`.
- All 14 pinned action SHAs against their tags.
- The 250-line gate, dev container and Docker config changes, and new `.md` files.
- Local `yarn lint`, `yarn tsc` and the full test suite.

What I didn't check: running the modified app, because the dev container can't run `yarn start`/`yarn build`. The CI `test` job for this sha built with "Compiled successfully". The new workflow itself can only be exercised after merge (`workflow_dispatch` runs the `master` copy), and it needs the App, variable and secret listed in the PR description first.

### Comment Status

| Source                                    | Type                                                                                          | Commit     | Status                                                                  | Notes                                                                                                                                                                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabdulla1                                 | Review event `CHANGES_REQUESTED` (2026-08-26)                                                 | `1245c0c4` | **Unresolved (blocker)** — addressed in code, no reply, not re-reviewed | Four points (the third is posted twice in the body).                                                                                                                                                                                          |
| ↳ point 1                                 | Silent source failure can close/delete a pending PR                                           | —          | Addressed in `c44278c7`/`ecf87efc`                                      | `updateSitemaps` sets `process.exitCode = 1` in the catch; `assertDownloadIsComplete` throws when fewer `.gz` files arrive than the current set; the artifact is only uploaded if the script succeeds. Tested in `sitemapUpdaterRun.test.js`. |
| ↳ point 2                                 | Add a `concurrency` group, `cancel-in-progress: false`                                        | —          | Addressed                                                               | Top-level `concurrency: { group: update-sitemap, cancel-in-progress: false }`.                                                                                                                                                                |
| ↳ point 3                                 | Pin `create-github-app-token`, `create-pull-request`, `enable-pull-request-automerge` to SHAs | —          | Addressed                                                               | All actions in every workflow are SHA-pinned; all 14 pins verified against their tags.                                                                                                                                                        |
| ↳ point 4                                 | Mint the token after the crawl to avoid 1-hour expiry                                         | —          | Addressed                                                               | The token is minted in `publish`, immediately before `create-pull-request`.                                                                                                                                                                   |
| Review threads (inline)                   | —                                                                                             | —          | None                                                                    | 0 threads, 0 resolved, 0 outdated.                                                                                                                                                                                                            |
| Issue comments                            | —                                                                                             | —          | None                                                                    | 0 general comments.                                                                                                                                                                                                                           |
| Bots (sourcery-ai, Copilot, qlty, others) | —                                                                                             | —          | None posted                                                             | No bot review or comment exists on this PR. qlty reports only via commit statuses (all green).                                                                                                                                                |
| Review requests                           | —                                                                                             | —          | None pending                                                            | Fabdulla1 was requested on 2026-08-25 and has reviewed since.                                                                                                                                                                                 |

### Checks

| Check                                                                                    | Result                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI `test` (lint, tsc, unit tests + coverage, build, qlty upload), on merge ref `131a98c` | ✅ success — 438 suites, 4202 tests, no console noise, "Compiled successfully"                                                                                                                                                      |
| Local gates on head `ecf87efc`                                                           | ✅ `yarn lint` exit 0; `yarn tsc` exit 0; `yarn test --coverage --watch=false` 343 suites, 3488 passed, 2 skipped (pre-existing), exit 0, zero console output; `sitemapUpdater.js` and `updateSitemaps.js` 100% on all four metrics |
| CodeQL / `Analyze (javascript)`                                                          | ✅ success — no new alerts in changed code                                                                                                                                                                                          |
| GitGuardian (x3)                                                                         | ✅ success — no secrets detected; ⚠️ Node 20 deprecation warning (F4)                                                                                                                                                               |
| qlty check                                                                               | ✅ No blocking issues                                                                                                                                                                                                               |
| qlty coverage diff                                                                       | ✅ 100.0% (75% threshold)                                                                                                                                                                                                           |
| qlty coverage                                                                            | ✅ 94.3% (+1.2%)                                                                                                                                                                                                                    |
| `docker`, `docker-test`                                                                  | ⏭ skipped (master-push only; see F5)                                                                                                                                                                                               |
| Notices                                                                                  | ubuntu-latest → Ubuntu 26 migration notice on all jobs (informational); the qlty action logs "--validate is deprecated" (upstream noise)                                                                                            |

## Findings

**F1 — Browser leak on navigation failure hangs the crawl for up to six hours.** `scripts/sitemapUpdater.js` launches Puppeteer, then awaits `newPage`, `createCDPSession`, `send`, `goto` and a 5-minute sleep before `browser.close()`. Any rejection before line 55 skips the close. `updateSitemaps` catches the error, sets `exitCode`, restores the backup and removes the temp directory, but the live Chromium child and its connection keep the Node event loop alive, so the script never exits. With no `timeout-minutes` on the job, GitHub kills it only at 360 minutes. That defeats the fail-fast promise in the README ("A red run means … the crawl needs looking at") and blocks the concurrency group for the same time.

**F2 — Unvalidated artifact crosses the key boundary.** The two-job split is there to keep the App key away from third-party install scripts, and the artifact is the one channel between the two jobs. `publish` currently trusts it completely and commits whatever it contains under a publicly served directory.

**F3 — Spies leak between tests.** `resetMocks` without `restoreMocks` leaves `jest.spyOn` spies installed with no implementation. That makes the suite depend on test order and can surface later as a hang (a no-op `setTimeout`) or a confusing `undefined` from `fs.existsSync`.

**F4 — `secret-scan.yml` still on a Node 20 checkout.** This is the last Node 20 action in the repository and the only warning annotation on the head.

**F5 — Docker CI major upgrades not exercised by the PR.** ⚠️ This is a Docker CI configuration change. The upgrades look compatible (every input used exists in v7), but they are untested until the first `master` push, and v7 adds a build record artifact upload by default.

**F6 — Branch behind `master`.** Local gates on the branch head and CI on the merge ref are both green, but they cover different trees (343 vs 438 suites). Updating the branch makes the verification in the description describe what will land.

**B1 — Standing `CHANGES_REQUESTED`.** It's a process blocker, not a code defect.

## Severity

| Severity | Count | IDs                                           |
| -------- | ----- | --------------------------------------------- |
| Blocker  | 1     | B1                                            |
| Medium   | 1     | F1                                            |
| Low      | 5     | F2, F3, F4, F5 (⚠️ Docker), F7 (pre-existing) |
| Nit      | 1     | F6                                            |

No correctness regressions in the application code, no security regressions (the PR is a net security improvement), and changed-code coverage is 100%.

## Reproduction Steps

1. **F1:** In a scratch copy, make `SITEMAP_URL` point at an unreachable host (e.g. `http://127.0.0.1:9/`) and run `node scripts/updateSitemaps.js` with Puppeteer installed. Expected: "❌ Failed to update sitemaps" is logged and the temp directory is removed, but the process doesn't exit while Chromium is alive. (Not run here, because Puppeteer isn't installed in the dev container; this is inferred from the code path.) In the test suite, adding `expect(browser.close).toHaveBeenCalled()` to "fails the run when the sitemap source is unreachable" (`scripts/sitemapUpdaterRun.test.js:84`) would fail, because the mocked `goto` rejects before `close` is reached.
2. **F2:** Inspect `update-sitemaps.yml` lines 89-109: no step between "Download crawled sitemaps" and "Create Pull Request" checks file names or contents, and `add-paths: public/sitemap` stages everything in the directory.
3. **F3:** In `scripts/sitemapUpdater.test.js`, add a test after the `fetchNewSitemaps` block that asserts `jest.isMockFunction(global.setTimeout) === false`. It would fail. The same check outside the repo with `jest --resetMocks` on Jest 27.5.1 prints `setTimeout is mock: true existsSync(/nonexistent)= undefined`.
4. **F4:** Open the GitGuardian scan check run on `ecf87efc` → annotations → "Node.js 20 is deprecated … actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5".
5. **F5:** `docker/build-push-action` v7.4.0 README, "Environment variables": `DOCKER_BUILD_RECORD_UPLOAD` defaults to `true`. The `docker` jobs show as "skipped" on this PR.
6. **F6:** `git log --oneline HEAD..origin/master | wc -l` → 17. The CI `test` job log shows "HEAD is now at 131a98c Merge ecf87efc… into e281f7ba…" and "Test Suites: 438 passed", while `yarn test --coverage --watch=false` on the branch head gives "Test Suites: 343 passed".

## Recommendation

**Request changes (minor).** The approach is right and the earlier review is fully addressed in code. F1 is the one code change that matters before merge, because the fail-closed behaviour this PR advertises only works if the process can actually exit. F2–F4 are cheap hardening that fit this PR's theme and should go in the same round. F5 needs an explicit decision and a watched first `master` run. After that, a reply on the PR summarising how each of Fabdulla1's points was handled should let the review be cleared.

## What Has To Be Done

Status after fix round 1 (2026-09-23). Items 1–9 are done locally; items 10–15 remain.

1. ✅ **[F1]** Close the browser in a `finally` in `scripts/sitemapUpdater.js`.
2. ✅ **[F1]** Add `timeout-minutes` to both jobs in `update-sitemaps.yml` (`crawl: 30`, `publish: 10`).
3. ✅ **[F1, tests]** Assert `browser.close` in the unreachable-source test, and cover a failure before `goto`.
4. ✅ **[F2]** Validate the crawled artifact (file names plus `gzip -t`) before the App token is minted.
5. ✅ **[F3, tests]** Restore spies after each test through the shared `setUpSitemapUpdaterTestEnvironment()`.
6. ✅ **[F4]** Pin `actions/checkout` in `secret-scan.yml` to v7.0.1.
7. ✅ **[F5, ⚠️ Docker]** Set `DOCKER_BUILD_RECORD_UPLOAD: false` on both Docker build steps.
8. ✅ **[F6]** Merge `origin/master` into the branch (merge commit `41364482`) and re-run the gates on the result.
9. ✅ **[F7]** Add deterministic tests for the 8 files whose coverage flapped.
10. **Push** the branch (nothing is pushed yet), then confirm every check is green on the new head, including qlty coverage.
11. **[Blocker, B1]** Post the reply to Fabdulla1's `CHANGES_REQUESTED` review (drafted in `TASK-779-handoff.md`) and get the review re-done or dismissed. Re-requesting the review is your call.
12. **[F5, ⚠️ Docker]** Watch the first `master` run of the `docker` and `docker-test` jobs after merge. They have never run with the new action versions.
13. **[F7, follow-up]** Optionally, in a separate PR, seed the fixture randomness (`new Chance()` in `src/test-support`) so no other file can flap.
14. Before merge, complete the "Required before merging" steps in the PR description (create the App, add `EBL_AUTOMATION_CLIENT_ID` and `EBL_AUTOMATION_PRIVATE_KEY`, get ebl-api#735 deployed). After merge, run the workflow once by hand and then revoke the old PAT.
15. Before merge, delete the four `TASK-779-*.md` files in a cleanup commit. They are committed with the fix round and must not reach `master`.

## Fix Round 1 (2026-09-23, working tree only)

Nothing is committed or pushed. Changes:

- **F1:** `fetchNewSitemaps` now runs the page work in `downloadSitemapsWithBrowser` inside `try { … } finally { await browser.close() }`. `update-sitemaps.yml` has `timeout-minutes: 30` on `crawl` and `10` on `publish`. New tests cover navigation failure and `newPage` failure, and the unreachable-source run test asserts `browser.close`. All 3 new assertions fail against the original script and pass with the fix.
- **F2:** a new "Validate crawled sitemaps" step in `publish`, before the token is minted, rejects an empty artifact, any entry that is not a regular file matching `^sitemap[0-9]*\.xml\.gz$` (including dotfiles, directories and symlinks), and any file that fails `gzip -t`. I exercised it locally against the real sitemaps (pass) and against an empty directory, a missing directory, an extra `.html`, a dotfile, a corrupt `.gz`, a directory and a symlink (each fails with an `::error::` annotation).
- **F3:** `setUpSitemapUpdaterTestEnvironment()` in `sitemapUpdaterTestDoubles.js` now owns the logger spy, the exit-code save/restore and `jest.restoreAllMocks()`. Both test files use it, which also removes the setup they previously duplicated.
- **F4:** `secret-scan.yml` now pins `actions/checkout@3d3c42e5… # v7.0.1`.
- **F5:** both Docker build steps set `DOCKER_BUILD_RECORD_UPLOAD: false`. ⚠️ They are still first exercised by the first `master` push after merge.
- README "Failure Behaviour" documents the artifact validation and the job timeouts.

Gates on the working tree:

- `yarn lint`: exit 0.
- `yarn tsc`: exit 0.
- `yarn test --coverage --watch=false`: 343 suites, 3490 passed, 2 skipped (pre-existing), exit 0, zero console output.
- `sitemapUpdater.js` and `updateSitemaps.js` are at 100% on all four metrics.
- All workflow YAML parses and Prettier is clean.
- The largest changed script is 165 lines.
- Running the app is still NOT VERIFIED (the dev container can't run `yarn start`/`yarn build`).

## Fix Round 1, continued: F6 and F7 (2026-09-23)

- **F6:** as you asked, I merged `origin/master` (`e281f7ba`) into the branch locally. That created merge commit `41364482`, which is not pushed. Its tree `846889fe` is identical to the one CI tested on the merge ref (`131a98c`). There were no conflicts, and none of the uncommitted fix-round files overlapped with master's changes. I re-ran `yarn install --frozen-lockfile`, and `yarn check --integrity` reports the folder in sync. After the install, `canvas`'s native binary was missing (a transient download failure during install, fixed by re-running its `node-pre-gyp install`). That's environment only; no repository file changed.
- **F7 (explicit tests, as you chose):** comparing per-file coverage between two full runs of the same tree found 8 flapping files. The pre-merge pair found `Kings.tsx`, `DateDisplay.tsx`, `DateSelectionMethods.ts`, `ManuscriptJoins.tsx` and `archaeology.ts`. CI's merge-ref run against my run A found `Eponyms.tsx`, `DateSelection.tsx` and `HowToCite.tsx`. Each one now has a dedicated test that covers the branches it used to hit only by chance:
  - `Kings.test.tsx` (extended): 100%.
  - New `DateSelectionMethods.test.ts`: 100%.
  - New `DateDisplay.test.tsx`: 100%.
  - New `ManuscriptJoins.test.tsx`: 100%.
  - New `archaeology.formatting.test.ts`: 100% lines. The branches still uncovered at lines 91 and 95 are default parameter values that no caller uses, so they are uncovered every time, not flapping.
  - New `Eponyms.test.tsx`: covers the branch at line 61 and lines 90–91, which were previously hit in 1 of 4 runs.
  - New `DateSelection.dates.test.tsx`: covers the branches at lines 46 and 205, and the previously never-covered `onHide` at line 149.
  - New `HowToCite.test.tsx`: covers every reachable branch. The rest are default values or a format option that no caller passes.
- The root cause (unseeded `new Chance()` instances in `src/test-support`) remains, as you chose. Other files may still flap. Each full run takes about 9 minutes, and the container can only rarely finish one, so I could compare only one pair of runs before the merge and one after.
- No production code changed for F7.
- **Final gates on the merged tree plus all fixes:**
  - `yarn lint`: exit 0.
  - `yarn tsc`: exit 0.
  - Full test suite: all 445 suites pass with zero console output. The full no-coverage run was killed by the container after 403 passing suites, and the remaining 42 passed in a separate run (247 tests).
  - The changed script files are at 100% coverage.
  - No file is over 250 lines (the largest is 193).
  - Prettier is clean.
  - Running the app is still NOT VERIFIED.
