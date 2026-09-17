---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration
head_reviewed: 18033c77
date: 2026-09-17
last_updated: 2026-09-17 (review round 7 + remediation)
state: 12 of 19 round-7 findings fixed; 1 excluded by instruction; 4 need actions outside the diff; 2 informational
tracked_in_git: true — the eight scratch .md files are still tracked and must be deleted before merge
blocking_items: 5 (land #773; delete the scratch docs; merge master up; clear the standing review; confirm CodeQL really diffed the PR)
gates: lint PASS, tsc PASS, test:ci PASS (504 suites / 4428 tests / 50 snapshots, zero console output), coverage 95.08/87.98/94.74/95.23, 250-line ceiling PASS
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and replaces it with the browser's own `AbortController`.

The tricky part is that "cancel" means two different things:

- **Reading data.** If you leave a page while it is still loading, cancelling is fine — just stop the download.
- **Saving data.** If you already sent a save to the server, cancelling the connection does **not** undo the save. You just stop hearing whether it worked. That is worse than useless.

So the PR does reads and writes differently. Reads get a real cancel signal. Writes never get one — when a newer save starts, the older save keeps running and only its _screen update_ is thrown away. That is the right call, and the compiler enforces it: the save methods simply have no place to put a cancel signal, and the one method that could smuggle one in is `private`.

Everything else in the PR is tidying that came along with it: a stylesheet migration, splitting oversized files, and better tests.

## Round 7 — what was found and what was done

Nineteen findings. The design was not one of them — it was already right. Twelve are now fixed.

| #   | In plain words                                                                                                                         | Outcome                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| F1  | The test suite was red again. One test took a picture of the screen before part of the screen had finished being drawn.                | **Fixed**                               |
| F2  | The eight scratch note files are still tracked, so merging would dump 3,200 lines of working notes onto `master`.                      | **Open — excluded by your instruction** |
| F3  | The reviewer's "changes requested" from August is still standing. Everything they asked for is genuinely done.                         | **Open — yours**                        |
| F4  | The security scanner never actually looked at this PR's changes, but still reported "no new problems".                                 | **Open — needs a merge**                |
| F5  | The PR underneath this one (#773) now clashes with `master` and cannot be merged. Nothing can land until that is sorted.               | **Open — yours**                        |
| F6  | If `master` was broken, the test server image was still built and published anyway.                                                    | **Fixed**                               |
| F7  | The branch is three commits behind `master`.                                                                                           | **Open — needs a merge**                |
| F8  | The "these files must be 100% tested" list is typed out by hand, so it quietly goes stale.                                             | **Fixed**                               |
| F9  | The README said four components do a certain thing. There are five.                                                                    | **Fixed**                               |
| F10 | A password-like secret was handed to every single CI step, even though nothing uses it.                                                | **Fixed**                               |
| F11 | The security-scanning workflow never said what permissions it needs, so it just took whatever it was given.                            | **Fixed**                               |
| F12 | CI warned on every run that the scanning tool version is being retired in December.                                                    | **Fixed**                               |
| F13 | A test helper checked that no _unexpected_ error was printed, but never checked the expected one actually happened.                    | **Fixed**                               |
| F14 | A function called "is the box too small" returned true when the box was **big enough**. It had meant its own opposite for a long time. | **Fixed**                               |
| F15 | The PR description still told people to run the old test command.                                                                      | **Fixed**                               |
| F16 | This handoff's own header pointed at an old commit.                                                                                    | **Fixed**                               |
| W1  | GitHub shows `Dockerfile` as changed. This PR did not change it — but nothing ever builds it on a PR. Read the warning below.          | Informational                           |
| W2  | CI now stops at the first broken step instead of running everything. Deliberate.                                                       | Informational                           |
| W3  | Some code-quality warnings sit in files this PR barely touched. Not this PR's to fix.                                                  | Informational                           |

## Why F1 was the important one, again

Last round's flaky test was a stopwatch problem. This one looks the same but is not.

The test takes a picture of the annotation screen and compares it with a saved copy. Sometimes one line was missing from the picture — the line that positions the zoomable image. That line is not written by our code. It is written by the zoom library, a moment after the page appears. Nothing in the test waited for it. The test waited for the **Save button**, which is a completely different part of the screen.

So on a fast, quiet machine the line was always there. Deep into a long run it sometimes was not.

While fixing that, a second, older problem turned up in the same six lines. The setup step is allowed to wait ten seconds for the page to load — but Jest only gives a setup step **five** seconds before killing it. That mismatch had been sitting there unnoticed, because the page normally loads in about two seconds. The first attempt at the fix made it fire immediately.

Both are fixed. The test now waits for the actual thing it photographs, and the setup step is given a budget bigger than the waits inside it.

## The other one worth knowing about

Finding F13 looked like a small tidy-up: a test helper promised "this error is expected" but only ever checked that no _other_ error appeared. Making it check properly turned **17 tests across 5 suites red**.

The helper was not wrong — the way it was being used was. Two shared setup functions called it for every test in their file, while only some of those tests actually produce the error. So the helper has been split in two, and each name now says what it means:

- `expectConsoleErrors` — this error **must** happen.
- `tolerateConsoleErrors` — this error is set up on purpose and is fine **if** it happens.

Both still fail the test if anything unexpected is printed, which is the part that matters. Tightening an assertion turned out to be a good way of discovering that the assertion had never been true.

## Gates — all green

| Gate                   | Result                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `yarn lint`            | PASS                                                                                         |
| `yarn tsc`             | PASS                                                                                         |
| `yarn test:ci`         | PASS — 504 suites, 4428 tests, 50 snapshots, exit 0                                          |
| Console output         | PASS — completely silent                                                                     |
| Flake check            | PASS — the previously flaky suite is green in four consecutive full runs plus six on its own |
| Coverage               | 95.08 / 87.98 / 94.74 / 95.23; floors tightened from 93/84/93/93 to 94/86/94/94              |
| 250-line limit         | PASS — largest file touched this round is 211                                                |
| qlty                   | PASS — no new smells in anything changed this round                                          |
| `yarn build` / app run | Not runnable in this container — it runs out of memory. CI built this code green.            |

## A trap for whoever changes the coverage floors next

Jest **removes** the fifty "must be 100%" files from the global figure before comparing it with the floors. So the global branch number the floor is checked against is **86.84**, not the 87.98 printed in the summary table. Setting the floor from the printed number fails. Work it out from `coverage/coverage-final.json` with those fifty paths excluded.

## Next steps

**Five things, in this order. Only the second is ours to write.**

1. **Sort out #773 and land it (F5).** It now clashes with `master` and cannot merge. This is the critical path — nothing else can finish until it does. When it lands, GitHub retargets this PR to `master` by itself, the diff drops from 705 files to what this PR actually owns, and F4 fixes itself.
2. **Delete the eight scratch `.md` files (F2).** `TASK-774-handoff.md` (this file), `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Add a `TASK-*.md` line to `.gitignore` in the same commit to keep them locally. Deliberately left out of this round at your request.
3. **Merge the three `master` commits (F7)** — `e281f7ba`, `af0b7942`, `51bfc9ff` — so the branch is tested against current `master`. Not done here because a merge is a commit.
4. **Check the security scanner actually looked this time (F4).** After the retarget, open the `Analyze (javascript)` job log and make sure it no longer says "the PR diff ranges could not be computed" or "skipping diff-informed analysis stage". Until those lines are gone, its green tick means nothing.
5. **Clear the standing "changes requested" (F3).** All three of the reviewer's points are fixed and were re-verified this round. Reviewer assignment is deliberately never touched automatically.

**Then:**

6. Re-run every gate against the smaller, retargeted diff.
7. Check the `test` check is green on GitHub across more than one run — F1 was intermittent, and one green is not proof.
8. Re-check qlty. It should come back clean.

## Known, deliberately not fixed

**F13 — the "everything is a cancellation" helper.** When a page is closing, `isCancellation` treats any error as a cancellation, so a genuine bug at that exact moment does not reach the screen. Making it stricter was tried and rejected: that clause is what stops half-finished page loads from throwing errors at users, and removing it would make saves reject when a page closes. Every network-level failure is already reported to Sentry before this check runs. The trade-off is written down in `README.md`.

**Files over the 250-line limit that this PR did not touch.** `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265). All identical to `master`. They show up for the same reason `Dockerfile` does — the base branch is stale — and they drop out of the diff automatically once #773 lands.

## W1 — the Docker warning, please read before merging

- `.devcontainer/` is **not touched by this PR**. Nothing in it changed.
- The root `Dockerfile` shows as changed on GitHub, but it is **byte-identical to `master`**. It only appears because the base branch is stale. This PR changes no Docker configuration.
- **The risk is that nothing builds the Dockerfile on a pull request at all.** Both Docker jobs only run when something is pushed to `master`, and both were skipped here. What `master` recently added, and no PR has ever built, is a pinned base image plus two exact Alpine package versions (`giflib-dev=5.2.2-r2`, `python3=3.12.14-r0`). Alpine drops old package versions without warning, and when that happens the build breaks **on `master`, after merge, in the same job that publishes the image**.
- Run `docker build .` once before merging. It is cheap insurance. Docker is not installed in this container, so it could not be done here. Longer term, building (without publishing) on pull requests would move that failure to where it belongs.
- Related and now fixed: the test image used to be published even when the tests had failed.

## The lesson from this round

Round 5's lesson was that a local gate which cannot reproduce CI is not a gate. Round 6's was that a test waiting on a stopwatch is a coin flip. This round adds two more.

**When a test fails on one attribute, check whether anything waits for that attribute before arguing about its value.** The saved picture was correct all along.

**Tightening an assertion is a good way to find out it was never true.** F13 was filed as a small hygiene point and it uncovered five test files whose shared setup had been asserting something most of their tests never did.
