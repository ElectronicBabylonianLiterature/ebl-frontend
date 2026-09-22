---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration
head_reviewed: ee275e43
date: 2026-09-22
last_updated: 2026-09-22 (review round 8 + remediation)
state: 11 of 17 round-8 findings fixed; 1 excluded by instruction; 5 need actions outside the diff
tracked_in_git: true — the eight scratch .md files are still tracked and must be deleted before merge
blocking_items: 4 (land #773; delete the scratch docs; clear the standing review; decide how CodeQL gets a real verdict)
gates: lint PASS, tsc PASS, test:ci PASS (505 suites / 4435 tests / 50 snapshots, zero console output), coverage 95.08/87.98/94.74/95.23, 250-line ceiling PASS
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and replaces it with the browser's own `AbortController`.

The tricky part is that "cancel" means two different things:

- **Reading data.** If you leave a page while it is still loading, cancelling is fine — just stop the download.
- **Saving data.** If you already sent a save to the server, cancelling the connection does **not** undo the save. You just stop hearing whether it worked. That is worse than useless.

So the PR does reads and writes differently. Reads get a real cancel signal. Writes never get one — when a newer save starts, the older save keeps running and only its _screen update_ is thrown away. That is the right call, and the compiler enforces it: the save methods simply have no place to put a cancel signal, and the one method that could smuggle one in is `private`.

Everything else in the PR is tidying that came along with it: a stylesheet migration, splitting oversized files, and better tests.

## Round 8 — what was found and what was done

Seventeen findings. Eleven are fixed. The design was not one of them — it is still right.

| #   | In plain words                                                                                                               | Outcome                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| F1  | The eight scratch note files are still tracked, so merging would dump working notes onto `master`.                           | **Open — excluded by your instruction** |
| F2  | PR #773 sits underneath this one and has merge conflicts. Nothing here can merge until it lands.                             | **Open — yours**                        |
| F3  | The reviewer's "changes requested" from August is still standing. Everything they asked for is genuinely done.               | **Open — needs the reviewer**           |
| F4  | The security scanner still never looked at this PR's changes, and landing #773 will **not** fix that.                        | **Open — needs a decision**             |
| F5  | Seven screens asked the browser to cancel their download, and the cancel request was quietly thrown away before it was sent. | **Fixed**                               |
| F6  | A test was hiding error messages instead of checking them — the exact habit this PR set out to remove.                       | **Fixed**                               |
| F7  | Two more tests were covered by a shared error-hiding setup and never checked it.                                             | **Fixed**                               |
| F8  | The README called one component a "save" when it is actually a "load".                                                       | **Fixed**                               |
| F9  | The PR description said CI runs one build command; CI ran a different, hand-copied one.                                      | **Fixed**                               |
| F10 | Two file counts in the PR description had drifted out of date.                                                               | **Fixed**                               |
| F11 | A small loop was doing the same work over and over instead of once.                                                          | **Fixed**                               |
| F12 | Two old tests were deleted. They test a feature that no longer exists, so the deletion is fair — but it needs your sign-off. | **Open — needs your approval**          |
| W1  | The dev container is untouched, but **no pull request ever builds the Dockerfile**. Please read this section below.          | **Open — no Docker here**               |
| W2  | The green "qlty" tick does not include a coverage check on this PR. It only starts checking after the retarget.              | **Open — after retarget**               |
| W3  | The branch is three commits behind `master`.                                                                                 | **Open — needs a merge commit**         |
| W4  | The repo has other very long files. This PR does not touch them.                                                             | Noted                                   |
| W5  | Two long stylesheets were touched but not split, while a third was split.                                                    | Addressed — no claim was made           |

## Why F5 was the important one

Seven screens said "cancel this download when the user leaves". The cancel signal travelled correctly through the app, and then the last function in the chain quietly dropped it on the floor and never passed it to the browser. Nothing broke — these downloads were never cancellable before this PR either — but the code and the README both claimed they were.

The interesting part is **why the compiler did not catch it**. TypeScript lets a function that takes _fewer_ arguments stand in for one that takes more. So `FragmentRepository.random()` — no arguments at all — was accepted as an implementation of `FragmentInfoRepository.random(signal?)`. Perfectly legal, completely wrong. Four more cases were hidden a second way: the components declared their service as `{ fragmentService }`, which quietly means "anything at all", so passing an extra argument raised no complaint.

All seven now pass the signal all the way down, and a new test file checks each one.

## What removing the "anything at all" type exposed

Three real errors that had been invisible the whole time:

- One component said its data was an editable list, while the code that produces it returns a read-only one.
- Two test files were handing in a stub with one method on it where a full service was required.

All three are fixed properly, not papered over. This is the best argument for the fix: the moment the loose type went away, the compiler started finding things.

## A trap that nearly bit, worth remembering

The fix for F6 was "use the shared helper that checks the error instead of hiding it". That alone would have **failed**. The test file had a cleanup step that resets all mocks, and Jest runs a file's own cleanup _before_ the project-wide one — so the shared helper would have found its records already wiped and reported that the expected error never happened. Removing that cleanup line was part of the fix, not tidying.

## Gates — all green

| Gate             | Result                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| `yarn lint`      | PASS                                                                              |
| `yarn tsc`       | PASS                                                                              |
| `yarn test:ci`   | PASS — 505 suites, 4435 tests, 50 snapshots, zero console output, exit 0          |
| Coverage         | 95.08 / 87.98 / 94.74 / 95.23 — unchanged by the remediation, no threshold breach |
| 250-line ceiling | PASS on every changed and new file                                                |
| `yarn build`     | PASS in CI; cannot run here — the container runs out of memory                    |
| App runs         | **Not verified** — the dev server cannot start in this container                  |
| `docker build .` | **Not verified** — Docker is not available here, and no PR ever builds it (W1)    |

The reviewed commit was 504 suites / 4428 tests. The extra suite and seven extra tests are `FragmentRepository.abortSignal.test.ts`, which checks that each of the seven reads really does pass its cancel signal to the network layer.

## A trap for whoever changes the coverage floors next

Jest subtracts every file that has its own per-file threshold from the global figure. There are 50 such files. So the number the global floors are compared against is roughly **94.57 / 86.84 / 94.21**, not the 95.08 / 87.98 / 94.74 printed in the summary row. Raising a floor to match the printed row will fail.

## Next steps

In order of value:

1. **Land #773.** It has merge conflicts against `master` and is only 30 files. Nothing here can merge until it does. Everything else on this list is cheaper afterwards.
2. **Ask the reviewer to re-review and dismiss the August "changes requested".** Every point in it has now been verified fixed in two consecutive rounds.
3. **Decide what to do about the security scanner (F4).** CodeQL refuses to analyse a pull request with more than 300 changed files. This one has 707 against its base and would still have ~510 against `master` after the retarget, so **landing #773 does not fix it** — this corrects what round 7 assumed. Either split the PR (the stylesheet migration is 48 files and entirely separable, as is the test-file split), or read the branch alerts by hand in the GitHub security tab before merging. Do not read the green tick as coverage.
4. **Sign off on the two deleted tests (F12)**, or say you want them back.
5. **Merge the three `master` commits up** so conflicts surface here rather than on `master`.
6. **Run `docker build .` locally** — see W1 below.
7. **Delete the eight scratch `.md` files** and add a `TASK-*.md` line to `.gitignore` in the same commit. Do this last, right before merging, since they are still useful until then.
8. **After the retarget**, re-run the gates and confirm `test`, `CodeQL` and `qlty check` are green more than once — qlty starts checking coverage only at that point.

## Known, deliberately not fixed

- The eight scratch `.md` files — excluded by instruction, still to be deleted before merge.
- The three `master` commits — merging them is a commit, and commits are not made unprompted.
- #773's conflicts — a different branch.
- The standing review — needs the reviewer.
- Two long stylesheets (`Introduction.sass`, `project.sass`) — both are one-line touches and the 250-line rule covers TypeScript files. No claim was made that the stylesheet ceiling was addressed, so nothing needed retracting.

## W1 — the Docker warning, please read before merging

`.devcontainer/` is **completely untouched** — all four files are byte-identical to `master`. The root `Dockerfile` is byte-identical too; the `+4/-4` GitHub shows is drift from the base branch, not this PR's work.

The CI workflow files _are_ genuinely changed, and all twelve changes were reviewed one by one and are sound. They are listed with a verdict each in `TASK-774-review.md` under W1.

The real hazard is older than this PR: **both Docker jobs only run on a push to `master`**, so no pull request ever builds the Dockerfile. It pins exact Alpine package versions, which go stale silently, and the first anyone finds out is after merging. Please run `docker build .` locally before merging, and consider adding a build-only Docker job to pull requests.

## The lesson from this round

A guarantee written in the README is a claim to test, not a fact to reuse. Both of this round's serious findings came from checking a sentence the PR itself had written — one in the README about cancel signals, one implied by deleting the old error-hiding helper — against what the code actually does. Round 7 checked the saving side of the rule thoroughly and took the reading side from the prose. The reading side is where the gap was.
