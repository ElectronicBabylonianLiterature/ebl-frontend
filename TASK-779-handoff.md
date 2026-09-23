---
task_id: 779
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/779
branch: fix-sitemap-automation-bot-identity
base_branch: master
head_reviewed: ecf87efc
date: 2026-09-23
last_updated: 2026-09-23 (review round 3 + fix round 1)
state: 8 of 9 findings fixed locally (F1–F7 plus the merge); B1 needs a reply on GitHub; nothing pushed
local_commits_not_pushed: 41364482 (merge of origin/master), plus the fix-round commit on top
tracked_in_git: true — the four TASK-779-*.md files are committed and must be deleted before merge
blocking_items: 3 (push and get green checks; clear Fabdulla1's CHANGES_REQUESTED; do the App/secret setup before merge)
gates: lint PASS, tsc PASS, tests PASS (all 445 suites, zero console output, run in two parts because of container memory), 250-line ceiling PASS (max 193), run-the-app NOT VERIFIED (container cannot run yarn start/build)
---

# TASK-779 — Handoff

## In plain words

Every week a robot opens a pull request with fresh sitemap files. That robot used to use a personal login, and GitHub doesn't let people approve their own pull requests, so these PRs got stuck. This PR gives the robot its own identity (a GitHub App), so anyone can approve its PRs.

The design is good, and CI, CodeQL, qlty and GitGuardian are all green.

## What the review found, and what was done

| #   | In plain words                                                                                                    | Outcome                                        |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| B1  | Fabdulla1's "changes requested" from August still stands. Everything they asked for is done in the code.          | **Open — needs a reply on GitHub**             |
| F1  | If the sitemap site was down, the robot hung for six hours instead of failing straight away.                      | **Fixed**                                      |
| F2  | The step that holds the secret key accepted any file from the crawl step. Now it only accepts real sitemap files. | **Fixed**                                      |
| F3  | Some test mocks leaked from one test into the next.                                                               | **Fixed**                                      |
| F4  | One workflow still used an old action version that printed a warning.                                             | **Fixed**                                      |
| F5  | ⚠️ The Docker build actions jumped two major versions. They only run after merge.                                 | **Fixed (setting) — watch the first run**      |
| F6  | The branch was 17 commits behind `master`.                                                                        | **Fixed (merged locally)**                     |
| F7  | Code coverage changed from run to run, because tests use random data. Found in 8 files.                           | **Fixed for those 8 files** — root cause stays |

## Next steps

1. **Push** the branch. The merge commit `41364482` and the fix-round commit are local only. Then check that every check is green on the new head.
2. **Reply to Fabdulla1** with the draft below, and ask them to look again. Re-requesting the review is your call.
3. **Before merging**, do the App setup from the PR description: create the GitHub App, add the `EBL_AUTOMATION_CLIENT_ID` variable and the `EBL_AUTOMATION_PRIVATE_KEY` secret, and get ebl-api#735 deployed.
4. **Before merging**, delete the four `TASK-779-*.md` files in a cleanup commit.
5. **After merging**, run the sitemap workflow once by hand, and check that the PR comes from `ebl-automation[bot]`. Then revoke the old personal token.
6. **After merging**, ⚠️ watch the first `docker` / `docker-test` run on `master`.
7. **Optional, separate PR:** make the test data non-random (seed the `new Chance()` instances in `src/test-support`), so no other file's coverage can flap.

## Things to know

- The dev container can't run the app (`yarn start`/`yarn build` run out of memory), so "check the running app" was not done. CI builds it fine.
- Full test runs with coverage now get killed partway in this container. The final gate ran without coverage and in two parts. Coverage was measured per file instead.
- A few branches in `archaeology.ts` and `HowToCite.tsx` are still uncovered. They are default values that no code ever uses, so they are the same on every run and don't flap.

## Draft reply for Fabdulla1 (B1)

Thanks for the careful review. All four points are addressed:

1. **Silent source failure closing a pending PR.** The script now fails closed. Any error, or fewer `.gz` files than the current set, restores the backup and sets `process.exitCode = 1`. The artifact is only uploaded when the crawl succeeds, so the PR steps never run on a failed crawl. The browser is now closed on every failure path, and both jobs have `timeout-minutes`, so a failed crawl goes red within minutes instead of hanging.
2. **Overlapping runs on the fixed branch.** There's a top-level `concurrency: { group: update-sitemap, cancel-in-progress: false }`, as you suggested.
3. **Mutable tags on the highest-privilege path.** Every action in every workflow is now pinned to a full SHA with the version in a trailing comment. `create-github-app-token`, `create-pull-request` and `enable-pull-request-automerge` are included.
4. **Token expiry.** The workflow is split into a secret-free `crawl` job and a `publish` job. The token is minted in `publish`, right before `create-pull-request`, so the crawl time no longer counts against the hour. As a bonus, the private key never shares a job with the Puppeteer/npm install scripts, and `publish` validates the crawled artifact before minting the token.

Could you take another look when you have a moment?
