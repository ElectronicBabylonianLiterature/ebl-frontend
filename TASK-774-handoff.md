---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration
head_reviewed: eac106a4
date: 2026-09-17
last_updated: 2026-09-17 (review round 6 + remediation)
state: 14 of 18 findings resolved; 4 remain and none of them can be done from inside the diff
tracked_in_git: true — the eight scratch .md files are tracked on purpose and must be deleted before merge
blocking_items: 4 (delete the scratch docs; clear the standing review; merge the base branch up; pick up the three master commits)
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and replaces it with the browser's own `AbortController`.

The tricky part is that "cancel" means two different things:

- **Reading data.** If you leave a page while it is still loading, cancelling is fine — just stop the download.
- **Saving data.** If you already sent a save to the server, cancelling the connection does **not** undo the save. You just stop hearing whether it worked. That is worse than useless.

So the PR does reads and writes differently. Reads get a real cancel signal. Writes never get one — when a newer save starts, the older save keeps running and only its _screen update_ is thrown away. That is the right call, and the compiler enforces it: the save methods simply have no place to put a cancel signal, and the one method that could smuggle one in is `private`.

Everything else in the PR is tidying that came along with it: a stylesheet migration, splitting oversized files, and better tests.

## Round 6 — what was found, in plain words

Eighteen findings. Four mattered.

| #   | In plain words                                                                                                                                                                                                    | Outcome                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| F1  | The test suite was red. One test about a page that redirects to its proper address gave the app **one second** to finish a four-step chain. Alone it was fine; 276 test files into a slow run it ran out of time. | **Fixed**                               |
| F2  | A test file had been copied word for word. The same five checks ran twice, from two files.                                                                                                                        | **Fixed**                               |
| F3  | The eight scratch note files are still tracked, so merging would dump 3,210 lines of working notes onto `master`.                                                                                                 | **Open — excluded by your instruction** |
| F4  | The reviewer's "changes requested" from August is still standing. Everything they asked for is genuinely done.                                                                                                    | **Open — yours**                        |
| F5  | The PR description said the scratch files were gone. They were not.                                                                                                                                               | **Fixed**                               |
| F6  | Two brand-new files had poor test coverage — one only 20% of its branches.                                                                                                                                        | **Fixed**                               |
| F7  | The "must be 100% covered" list is typed out by hand, so it goes stale, and it was missing the very files this PR changed.                                                                                        | **Fixed**                               |
| F8  | Coverage is not sent to qlty for stacked PRs. Deliberate, but nowhere written down.                                                                                                                               | **Fixed**                               |
| F9  | The security scanner **could not read this PR's changes at all** — too many files — yet still reported "no new problems".                                                                                         | **Open — needs a merge**                |
| F10 | The "no bluebird" guard missed a few ways of sneaking the library back in.                                                                                                                                        | **Fixed**                               |
| F11 | If installing packages failed three times in CI, the step still reported success.                                                                                                                                 | **Fixed**                               |
| F12 | If lint failed, CI kept running everything after it instead of stopping.                                                                                                                                          | **Fixed**                               |
| F13 | A helper treats _any_ error as "cancelled" when a page is closing, so a real bug at that moment goes unseen.                                                                                                      | **Documented**                          |
| F14 | The branch is three commits behind `master`.                                                                                                                                                                      | **Open — needs a merge**                |
| F15 | The test run printed a stray warning about out-of-date browser data.                                                                                                                                              | **Fixed**                               |
| F16 | A few functions had no types, and one had a leftover duplicate branch.                                                                                                                                            | **Fixed**                               |
| W1  | GitHub shows `Dockerfile` and `.dockerignore` as changed. This PR did not change them.                                                                                                                            | Informational                           |
| W2  | CI now also runs for stacked branches. Checked for secret leaks — safe.                                                                                                                                           | Informational                           |

## Why F1 was the important one

The failing test was not broken logic. It was a **stopwatch problem**.

Its sibling test file drives exactly the same redirect and never fails — because it waits for something it can _see_ (the address bar changing, the spinner disappearing) and gives it a generous five seconds. The failing one instead counted how many times a function had been called, and used the library's silent one-second default.

Between the data arriving and that second call, React has to redraw, run an effect, let the router change the address, redraw again, and only then re-fetch. One second is plenty on an idle machine and not reliably enough deep into a long run with coverage and handle-tracking switched on.

The fix waits for the redirect to **actually land**, then checks the calls. That is a stronger test than before — it proves the redirect happened, not just that something was called twice — and there is no stopwatch left to lose.

## What was done

- **F1** — the test now waits for the page to reach its proper address. The shared setup used by both redirect test files was moved into one place instead of being copied.
- **F2** — deleted the copied test file. The original keeps all five checks and is untouched.
- **F5** — the PR description now says plainly that the scratch files are tracked on purpose and must be deleted before merge.
- **F6 / F7** — six files brought to full coverage with new tests. The hand-typed list grew from 35 to 48 entries and now includes every save-related file this PR touches.
- **F8** — the reason stacked PRs skip the coverage upload is now written next to the setting.
- **F10 / F11 / F12** — the bluebird guard now also catches sub-imports, `require.resolve` and `package.json`; a failed install now actually fails; CI stops at the first broken step again.
- **F13** — left as is, on purpose, and explained in `README.md`. Making it stricter would cause saves to error out when a page closes.
- **F15 / F16** — browser data refreshed; missing types added; a duplicate branch removed.
- **Bonus.** Found and fixed a real leak that predates this PR: a keyboard listener was being _added_ again in the cleanup code where it should have been removed.

## Gates — all green

| Gate                   | Result                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| `yarn lint`            | PASS                                                                 |
| `yarn tsc`             | PASS                                                                 |
| `yarn test:ci`         | PASS — 504 suites, 4428 tests, 50 snapshots                          |
| Console output         | PASS — completely silent                                             |
| Coverage               | 95.09 / 87.97 / 94.73 / 95.23, up from 94.84 / 87.49 / 94.63 / 94.98 |
| `yarn build:ci-stable` | PASS — zero warnings                                                 |
| 250-line limit         | PASS — largest file touched is 219                                   |
| No duplicated logic    | PASS                                                                 |

The suite went from 4,395 tests with one failure to **4,428 passing**.

## Things checked properly, not taken on trust

- **The stylesheet claim holds.** All 60 stylesheets were compiled on both sides and compared: every one produces byte-for-byte identical CSS.
- **No test was lost.** The count went from 2,573 to 2,771. Twenty-seven test names disappeared; each one was traced. They were renamed, merged into table-driven tests, or were duplicates. Nothing was quietly dropped.
- **The app runs.** The built site boots, every page renders, and clicking quickly between pages — which now cancels downloads mid-flight — produces no errors.

## Next steps

**Four things, in order. None of them is code.**

1. **Delete the eight scratch `.md` files (F3).** Five `TASK-774-*` and three `TASK-ts7-migration-*`, this handoff included. Add a `TASK-*.md` rule to `.gitignore` in the same commit if you want to keep them locally. This was deliberately left out of round 6 at your request.
2. **Land #773 first (F9).** GitHub will retarget this PR to `master` by itself. This is the highest-value single step: the diff drops from 696 files to what this PR actually owns, and the security scanner can finally read the changes instead of giving up and reporting a pass it never verified.
3. **Merge the three `master` commits (F14)** — `e281f7ba`, `af0b7942`, `51bfc9ff` — so the branch is tested against current `master`.
4. **Clear the standing review (F4).** All three of the reviewer's points are fixed and were re-verified this round. Reviewer assignment is deliberately never touched automatically.

**Then:**

5. Re-run the gates against the retargeted diff.
6. Check that the `test` check is green on GitHub across more than one run — F1 was intermittent, so a single green is not proof.
7. Re-check the qlty blocking issues. Two of the three were the copied test file, which is gone.

## Known, deliberately not fixed

**F13 — the "everything is a cancellation" helper.** When a page is closing, `isCancellation` treats any error as a cancellation, so a genuine bug at that exact moment does not reach the screen. Making it stricter was tried on paper and rejected: that clause is what stops half-finished page loads from throwing errors at users, and removing it would make saves reject when a page closes. It is also less severe than it sounds — every network-level failure is already reported to Sentry before this check runs. The trade-off is now written down in `README.md`.

**Files over the 250-line limit that this PR did not touch.** `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265). All identical to `master`. They show up for the same reason `Dockerfile` does — the base branch is stale — and they drop out of the diff automatically once #773 lands.

**W1 — the `Dockerfile`.** GitHub shows `Dockerfile` (+4/−4) and `.dockerignore` (+6/−1) as changed. This PR changed neither; `master` did, and this branch picked them up. Worth one look before merging anyway, because the Docker build **never runs on a pull request** — it only runs on `master` — so the pinned image digest and the two package version pins are first tested after this lands. `docker build .` locally is the cheap insurance.

## The lesson from this round

Last round's lesson was that a local gate which cannot reproduce CI is not a gate. This round's is narrower and more practical: **a test that waits on a stopwatch is not a test, it is a coin flip that usually lands the same way.** The fix was not a longer timeout — it was waiting for something observable to actually happen.

A smaller one, self-inflicted: a lint fix that swapped one query for another looked obviously correct and broke three tests, because the replacement relies on an accessibility role this version of the tooling does not recognise. Re-run the affected tests after a lint fix, not just the linter.
