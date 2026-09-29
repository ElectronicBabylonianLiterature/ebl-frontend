# TASK-779 — TODO: review PR #779 (Run sitemap automation under its own bot identity)

- [x] Read `.github/copilot-instructions.md` and the review-format preferences
- [x] Identify the PR for the current branch (#779, head `ecf87efc`)
- [x] Fetch every timeline review event (REST + GraphQL)
- [x] Fetch every inline review comment / review thread with resolved + outdated status (GraphQL)
- [x] Fetch every general (issue) comment, including bots (sourcery-ai, Copilot, qlty, GitGuardian)
- [x] Check every check run and commit status on the head sha (CI, CodeQL, GitGuardian, qlty)
- [x] Read CodeQL / qlty outputs and job annotations
- [x] Read the CI `test` job log for console noise, coverage and build result
- [x] Review the full diff against `origin/master` (workflows, scripts, tests, craco, eslint, README, lockfile)
- [x] Verify every pinned action SHA against its tag
- [x] Check for dev container / Docker config changes and warn
- [x] Check that no new `.md` files are added by the PR
- [x] Check the 250-line gate on every changed script file
- [x] Run `yarn lint` locally
- [x] Run `yarn tsc` locally
- [x] Run `yarn test --coverage --watch=false` locally (first attempt killed by memory pressure; rerun alone passed)
- [x] Record "run the modified application" gate as NOT VERIFIED (container cannot run `yarn start`/`yarn build`)
- [x] Write `TASK-779-review.md` with frontmatter, friendly summary, Details, mandated sections and `What Has To Be Done`
- [x] Remind to remove the `TASK-779-*.md` files before the PR merges

## Round 2 — address the review findings

- [x] F1: close the browser in a `finally` in `fetchNewSitemaps`
- [x] F1: add `timeout-minutes` to the `crawl` and `publish` jobs
- [x] F1: assert `browser.close` on the unreachable-source test; add a test for a rejection before `goto`
- [x] F2: validate the downloaded artifact (file names + `gzip -t`) before minting the App token
- [x] F3: restore spies after each test via a shared helper in `sitemapUpdaterTestDoubles.js`
- [x] F4: pin `actions/checkout` in `secret-scan.yml` to v7.0.1
- [x] F5: disable the Docker build record upload on both build steps
- [x] F6: update the branch from `master` — merged locally as you asked (`41364482`, not pushed)
- [x] B1: reply to Fabdulla1's review — drafted in TASK-779-handoff.md; you post it
- [x] Gates: `yarn lint`, `yarn tsc`, full `yarn test --coverage --watch=false` (run alone), 250-line check, YAML parses
- [x] Update `TASK-779-review.md` statuses and the log
- [x] F7 (pre-existing): explicit deterministic tests for the 8 flapping files (you chose this over seeding the fixtures)
- [x] Final full-suite gate on the merged tree (445 suites pass, run in two parts)
- [x] Write `TASK-779-handoff.md` (plain-words summary, findings table, next steps, B1 reply draft)
- [x] Commit the fix round together with the TASK docs (asked for explicitly; one commit, no push)
