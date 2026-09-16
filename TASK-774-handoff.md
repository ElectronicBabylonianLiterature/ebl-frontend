---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration
date: 2026-09-16
last_updated: 2026-09-16 (review round 5 + remediation)
state: all code findings fixed and committed; 3 items remain and none of them can be done from inside the diff
tracked_in_git: true — untracked during remediation, then re-tracked and committed on explicit instruction
blocking_items: 2 (clear the standing review; confirm the Dockerfile line)
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and replaces it with the browser's own `AbortController`.

The tricky part is that "cancel" means two different things:

- **Reading data.** If you leave a page while it is still loading, cancelling is fine — just stop the download.
- **Saving data.** If you already sent a save to the server, cancelling the connection does **not** undo the save. You just stop hearing whether it worked. That is worse than useless.

So the PR does reads and writes differently. Reads get a real cancel signal. Writes never get one — instead, when a newer save starts, the older save keeps running and only its _screen update_ is thrown away. That is the right call, and as of this round it is genuinely enforced by the compiler: the one method that could still smuggle a cancel signal into a save is now `private`.

Everything else in the PR is tidying that came along with it: a stylesheet migration, splitting oversized files, and better tests.

## Round 5 — what was found

Twelve findings. Two mattered.

| #   | In plain words                                                                                                                                                                                                                                                                                  | Outcome                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| F1  | CI was red. A test compared two "promises" instead of the values inside them, so it was never really testing anything. Deleting the bluebird import flipped it from accidentally passing to always failing.                                                                                     | **Fixed**                                                             |
| F2  | The big file split had been done **twice**. The app still rendered the old copy, and the new copy was only reachable from its own test. Worse, the two had drifted apart — and the copy the app used was the one that had **not** been given the new `ConcurrencyLimiter` this PR is all about. | **Fixed**                                                             |
| F3  | The five scratch `.md` files were tracked again — the last commit put them back.                                                                                                                                                                                                                | **Fixed, then reversed by request** — they are tracked on purpose now |
| F4  | The reviewer's "changes requested" from August is still standing.                                                                                                                                                                                                                               | **Open — yours**                                                      |
| F5  | The test command written in the docs was not the command CI actually runs. That gap is exactly why F1 slipped through two review rounds.                                                                                                                                                        | **Fixed**                                                             |
| F6  | One touched file was 432 lines, over the 250 limit.                                                                                                                                                                                                                                             | **Fixed**                                                             |
| F7  | One stylesheet still used the old `@import`.                                                                                                                                                                                                                                                    | **Fixed**                                                             |
| F8  | The "no bluebird" CI guard missed some ways of writing an import.                                                                                                                                                                                                                               | **Fixed**                                                             |
| F9  | The README's promise about saves was very nearly true, but not quite.                                                                                                                                                                                                                           | **Fixed**                                                             |
| F10 | GitHub shows a `Dockerfile` change that this PR did not make.                                                                                                                                                                                                                                   | **Confirm — yours**                                                   |
| F11 | Coverage is not uploaded for stacked PRs. Deliberate.                                                                                                                                                                                                                                           | Acknowledged                                                          |
| F12 | CI was warning about old GitHub Action versions.                                                                                                                                                                                                                                                | **Fixed**                                                             |

## Why F2 was the important one

The headline of this PR is "replace bluebird's concurrency helper with our own `ConcurrencyLimiter`". Before this round, in the palaeography module, that swap existed **only in a file nothing rendered**. The live code used a third, separately hand-written helper.

So the PR's main claim was, in that one area, not actually shipping. Removing the duplicate is what made it true.

## What was done

- **F1** — the test now waits for the value and compares the value. Checked under CI's exact flags.
- **F2** — deleted the duplicate component, the duplicate figures file and the duplicate loader; removed the third concurrency helper. Kept the `ConcurrencyLimiter` version, so the migration now ships in real code. All seven files in that folder are at 100% coverage.
- **F3** — all eight scratch `.md` files were untracked, then re-tracked and committed on explicit instruction. They are part of the branch on purpose, and still have to be deleted before merge.
- **F5** — added `yarn test:ci`, which runs exactly what CI runs. CI now calls it, and the instructions name it as the gate.
- **F6** — the 432-line file is now 158, split into four focused modules. All eight of its existing tests pass unchanged.
- **F7** — last `@import` migrated. Recompiled: the CSS is byte-for-byte identical.
- **F8** — guard now catches all seven ways of importing the library.
- **F9** — made `ApiClient.fetch` private, so the README's promise is now literally true.
- **F12** — GitHub Actions bumped to v5.
- Also requested: `.qlty/` generated output is now git-ignored, so it stops cluttering `git status`.

## Gates — all green at the committed state

| Gate                           | Result                                                                |
| ------------------------------ | --------------------------------------------------------------------- |
| `yarn lint`                    | PASS                                                                  |
| `yarn tsc`                     | PASS                                                                  |
| `yarn test:ci`                 | PASS — 500/500 suites, 4395/4395 tests, 50 snapshots                  |
| Console output                 | PASS — completely silent                                              |
| Coverage                       | PASS — 94.84 / 87.49 / 94.63 / 94.98 against floors 93 / 84 / 93 / 93 |
| `CI=true yarn build:ci-stable` | PASS — zero warnings                                                  |
| 250-line limit                 | PASS for every file this PR changes                                   |
| No duplicated logic            | PASS                                                                  |

CI previously said `4394 passed, 1 failed`. It is now `4395 passed` — exactly the one test that F1 fixed.

## Next steps

**Two things only you can do.**

1. **Clear the standing review (F4).** Fabdulla1 requested changes on 2026-08-04. All three of their points are genuinely fixed and verified, but the review itself has to be cleared on GitHub. Reviewer assignment is deliberately never touched by the automated review.
2. **Confirm the `Dockerfile` (F10).** GitHub shows it as changed by this PR. It was not. `master` changed it (in PR #791), this branch picked it up when `master` was merged in, and the base branch `#773` is too old to have it — so the comparison attributes it here. `git diff origin/master HEAD -- Dockerfile` is empty, meaning this branch's file is identical to master's. Merging changes nothing on master. It just needs a human "yes, that pin is fine".

**One thing to remember.**

3. **The scratch `.md` files are tracked on purpose.** They were untracked as part of F3 and then re-tracked on explicit instruction, so the work history travels with the branch. The consequence is unchanged: they must be deleted before merge, and until then the PR body's claim that only `README.md` changes is not accurate. No `.gitignore` rule was added, which is what makes keeping them possible.

**Then, in order.**

4. Check the `test` check goes green on GitHub for this commit.
5. Ask for the re-review.
6. Land **#773** first. GitHub will then retarget this PR to `master` on its own.
7. Re-run the gates against the retargeted diff.
8. Delete the scratch `.md` files from disk before merge — the five `TASK-774-*` and the three `TASK-ts7-migration-*`.

## Known, deliberately not fixed

Three files in the diff are over the 250-line limit: `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265).

All three are byte-identical to `master` and untouched by this PR. They appear in the diff for the same reason the `Dockerfile` does — the base branch is stale. Splitting them would mean refactoring unrelated code inside a bluebird-removal PR. They belong in their own PR, and they drop out of this diff automatically once #773 lands.

Coverage note, stated plainly: splitting the 432-line file **moved** its untested branches into the new modules rather than testing them. Global coverage is flat and no gate regressed, but that is pre-existing test debt relocated, not eliminated.

## The lesson from this round

F1 hid for two review rounds because the documented local test command was not the command CI runs. `--detectOpenHandles` is not just a reporting flag — it turns on `async_hooks`, which changes how Node builds promises, which is what made the broken assertion fail. A gate that cannot reproduce CI is not a gate. That is what F5 fixes, and it is the most valuable change in this round even though it is the least visible.
