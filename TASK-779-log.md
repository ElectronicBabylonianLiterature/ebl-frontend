# TASK-779 — Work log: review of PR #779

## 2026-09-23

- Branch `fix-sitemap-automation-bot-identity`, PR #779, head `ecf87efcfb2241646d5c440a338f2d984a029ee8`, base `master`. `git fetch` showed the local `master` was stale; all diffs are taken against `origin/master` (4 commits, 15 files).
- GitHub data (GraphQL + REST, cross-checked): 1 review event (Fabdulla1, `CHANGES_REQUESTED`, 2026-08-26, on `1245c0c4`), 0 review threads, 0 inline comments, 0 issue comments. No review from sourcery-ai or any other bot. No pending review requests.
- Checks on the head: `test` success, `Analyze (javascript)` success, CodeQL "No new alerts in code changed by this pull request", GitGuardian success (x3), `docker`/`docker-test` skipped (master-push only). Statuses: qlty check "No blocking issues", qlty coverage diff 100.0%, qlty coverage 94.3% (+1.2%).
- Annotations: GitGuardian scan job warns "Node.js 20 is deprecated … actions/checkout@34e11487" (from `secret-scan.yml`, not touched by the PR). All jobs carry the ubuntu-latest → Ubuntu 26 notice.
- CI `test` log: lint/tsc clean, 438 suites / 4202 tests passed, no console output from tests, build "Compiled successfully". qlty action prints "--validate is deprecated" (upstream action noise).
- Pinned SHAs: all 14 distinct `uses:` pins verified against their tags via the GitHub API — all match. No unpinned `uses:` left in any workflow.
- Dev container: `.devcontainer/` untouched. Docker: `main.yml` `docker` and `docker-test` jobs change action majors (buildx v3→v4, login v3→v4, build-push v5→v7); `Dockerfile` untouched. build-push v6+ uploads a build record artifact by default (`DOCKER_BUILD_RECORD_UPLOAD=true`).
- No new `.md` files in the PR (only `README.md` modified). No tracked `TASK-*.md` files.
- 250-line gate: largest changed script file is `scripts/sitemapUpdater.test.js` at 153 lines. Pass.
- Found: `fetchNewSitemaps` does not close the browser when `page.goto` throws, and the crawl job has no `timeout-minutes`, so an unreachable source hangs the job until the 360-minute default instead of failing fast.
- Verified empirically (Jest 27.5.1 with `--resetMocks`, CRA's default) that `jest.spyOn` spies are reset, not restored: after the spy test, `setTimeout` is still a no-op mock and `fs.existsSync` returns `undefined` in later tests of the same file.
- Local `yarn lint`: exit 0. Local `yarn tsc`: exit 0.
- First local `yarn test --coverage` run was killed ("process exited too early") after ~60 passing suites because lint and tsc ran alongside it and the container ran out of memory. My mistake in scheduling, not a code defect. Rerun started alone.
- "Run the modified application" gate: NOT VERIFIED — the container cannot run `yarn start`/`yarn build` (OOM). Build evidence taken from the CI job for the same sha.
- Rerun of `yarn test --coverage --forceExit --detectOpenHandles --watch=false` alone on head `ecf87efc`: 343 suites, 3488 passed, 2 skipped (pre-existing), exit 0, zero console output; `sitemapUpdater.js` and `updateSitemaps.js` 100/100/100/100.
- The local counts differ from CI (438/4202) because CI checks out GitHub's merge ref `131a98c` (head + master `e281f7ba`); the branch is 17 commits behind `master`. My draft F6 ("stale numbers in the PR description") was wrong: the description is accurate for the branch head. Rewrote F6 as "branch behind master".
- `secret-scan.yml` is still on the Node 20 checkout on `origin/master` too, so F4 stands after a merge.
- Wrote `TASK-779-review.md` (frontmatter, friendly summary + Details, Summary, Comment Status, Checks, Findings, Severity, Reproduction Steps, Recommendation, What Has To Be Done). No code changes, no commits, no GitHub writes.

## Pre-existing issues found

- `secret-scan.yml` still pins `actions/checkout` to a Node 20 release (`34e11487`), which produces the only warning annotation on this head. Root cause: the Node 24 migration in this PR covered `main.yml`, `codeql-analysis.yml` and `update-sitemaps.yml` but missed `secret-scan.yml`. Reported as a finding for the PR author to fix (review task, no code changes made).

## 2026-09-23 — Fix round 1 (address findings, working tree only)

- F1: extracted `downloadSitemapsWithBrowser`, closing the browser in `finally`; `timeout-minutes` 30/10 on crawl/publish; added 2 unit tests plus a `browser.close` assertion in the run test. Red check: 3 of 21 tests fail against the original `sitemapUpdater.js`; all 21 pass with the fix; 100% coverage on both scripts.
- F2: added the "Validate crawled sitemaps" step. Extracted the step's script from the parsed YAML (js-yaml; PyYAML isn't installed) and ran it against 8 cases: real sitemaps pass; empty dir, missing dir, extra html, dotfile, corrupt gz, directory and symlink all fail.
- F3: shared `setUpSitemapUpdaterTestEnvironment()` (logger, exit code, `jest.restoreAllMocks`). My first name, `useSitemapUpdaterTestEnvironment`, tripped `react-hooks/rules-of-hooks` in lint (the `use` prefix), so I renamed it.
- F4: `secret-scan.yml` checkout pinned to v7.0.1 SHA. F5: `DOCKER_BUILD_RECORD_UPLOAD: false` on both Docker build steps.
- README: Failure Behaviour paragraph extended.
- Gates: lint 0, tsc 0, full suite 343 suites / 3490 passed / 2 skipped, exit 0, zero console output.
- Pre-existing issue found: coverage for 5 unrelated files differs between two identical full runs (e.g. `Kings.tsx` branches 73.33% vs 40%). Root cause: at least 11 unseeded `new Chance()` instances in `src/test-support` plus `Math.random` in `fragment-fixtures.ts` drive fixture values that decide which branches run. Recorded as F7; the fix is repo-wide test infrastructure, so I'm asking for a scope decision before touching it.
- B1 reply drafted in the scratchpad (not posted). F6 needs a merge commit, so it waits for an explicit request.

## 2026-09-23 — Fix round 1, continued (after your answers: F7 explicit tests in #779, F6 merge master locally, B1 keep as draft)

- F6: `git merge --no-edit origin/master` → merge commit `41364482` (local, not pushed). Tree `846889fe` equals CI's merge ref `131a98c`. `yarn install --frozen-lockfile`; `yarn check --integrity` in sync. The install left `node_modules/canvas` without its native binary (jsdom failed to load). Re-running `node-pre-gyp install` for canvas fixed it; environment only.
- F7: identified 8 flapping files via coverage diffs (pre-merge run pair; CI merge-ref vs run A). Wrote dedicated deterministic tests for each (see the review's continued fix-round section). Lint fixes along the way: removed direct DOM access from tests (Testing Library queries and a labelled wrapper), and renamed a `render*` helper that tripped `render-result-naming-convention`. `Eponyms.tsx` line 61 was confirmed flapping by 4 repeated subset runs (hit in 1 of 4).
- Gates on the merged tree: `yarn tsc` exit 0; `yarn lint` exit 0 (one attempt was killed with exit 143 under memory pressure; the solo rerun passed). Full run A (before the last 3 test files) with coverage: 442 suites / 4230 tests passed, exit 0, zero console output.
- Full runs B (twice) and C with coverage were killed by the container (about 2.3 GB free; VS Code servers and other sessions hold the rest) after 31–200 passing suites. No test failed in any of them. Switched to a full run without coverage for the pass/fail and console gate; per-file coverage was measured with targeted runs.
- B1: reply drafted in the scratchpad, not posted, as you chose.
- Final gate: the no-coverage full run was killed after 403 passing suites; the remaining 42 suites (from `--listTests` minus PASS lines) passed separately with 247 tests. That's all 445 suites passing, zero console output.
- Wrote TASK-779-handoff.md and rewrote the review's What Has To Be Done with statuses. Committed the fix round plus all four TASK docs in one commit, as you asked. Not pushed.
