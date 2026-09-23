---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: master (retargeted 2026-09-23; #773 was closed without merging and folded into this PR)
head_reviewed: 2b391cdd
date: 2026-09-23
last_updated: 2026-09-23 (review round 9 + remediation, committed locally, not pushed)
state: all nine code findings from Fabdulla1's 2026-09-23 review fixed and committed; not pushed; five items remain outside the code
tracked_in_git: true — the eight scratch .md files are still tracked and must be deleted before merge
blocking_items: 4 (push + finish the PR description; re-request Fabdulla1's review; read CodeQL alerts in the UI; delete the scratch docs)
gates: lint PASS, tsc PASS, test:ci PASS (511 suites / 4480 tests / 50 snapshots, zero console output), coverage 95.19/88.25/94.87/95.34, every touched source file 100%, 250-line ceiling PASS
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and cancels requests with the browser's own `AbortController` instead.

The main rule: **reads** can be cancelled, so a page you leave stops downloading. **Writes** are never cancelled, because cutting off a save that was already sent doesn't undo it.

Round 9 found what that rule was still missing:

- **Saves could overlap.** If writes can't be cancelled, two saves can race, and the older one can land last. Fragment saves now wait in a queue. The date editors lock their buttons while a save is running.
- **Some reads still couldn't be cancelled.** Five pages and the converter never passed the cancel signal to the network, and the dossier list treated a cancel as an error. All fixed.
- **Small bugs.** The bibliography cache could keep one user's data after a login switch. The concurrency queue had a tiny timing gap. Save callbacks stayed live after a page closed. All fixed.

Every fix has a test that fails without it.

## Round 9 — what was found and where it stands

| #   | In plain words                                                                             | Status                                                      |
| --- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| B1  | The PR pointed at #773's branch, which was closed without merging                          | **Fixed** — retargeted to `master`                          |
| B2  | The bibliography cache could keep a previous user's entries                                | **Fixed**                                                   |
| B3  | Two fragment saves could race; the older could win                                         | **Fixed** — saves are queued                                |
| B4  | Two date saves could race                                                                  | **Fixed** — buttons lock while saving                       |
| B5  | A cancelled job could still run in one narrow moment                                       | **Fixed**                                                   |
| B6  | Three pages ignored the cancel signal                                                      | **Fixed**                                                   |
| B7  | The converter never cancelled its network requests                                         | **Fixed**                                                   |
| B8  | The dossier list turned a cancel into a warning and an empty list                          | **Fixed**                                                   |
| B9  | A save's screen update still ran after the page closed                                     | **Fixed**                                                   |
| N1  | Two more reads (markup, sign annotation) ignored the cancel signal — found by my own check | **Fixed**                                                   |
| B10 | Fabdulla1's "changes requested" is still open                                              | **Open — re-request after pushing**                         |
| B11 | Eight `TASK-*.md` scratch files are in the branch                                          | **Open — delete right before merge** (your decision)        |
| B12 | CodeQL can't check a PR this big (over 300 files)                                          | **Open — read the alerts in the GitHub UI** (your decision) |
| M1  | PR description out of date                                                                 | **Partly fixed** — rest after pushing                       |
| M2  | Two old bluebird tests were deleted                                                        | **Approved** by you                                         |
| W1  | No PR ever builds the Dockerfile                                                           | **Open — run `docker build .` locally**                     |
| W2  | qlty coverage only uploads for PRs based on `master`                                       | **Now active** after the retarget; check the next run       |
| W3  | #774 and #779 conflict in five files                                                       | **Open** — whoever lands second resolves them               |

## Next steps, in order

1. **Push** `chore/remove-bluebird`. The commit is local only.
2. **Finish the PR description.** Replace the "write in flight at unmount still runs its `onSuccess`" passage, because B9 changed that. Add a short "Round-9 review fixes" section listing B2–B9 and N1. The remediation table in `TASK-774-review.md` has the wording.
3. **Watch CI** on the new head: `test`, `CodeQL`, `qlty check`. This is the first run against `master`, so qlty uploads coverage for the first time.
4. **Re-request Fabdulla1's review** (B10). Reviewers are managed by hand, not through the API.
5. **Read the CodeQL alerts** for the branch in the GitHub security tab (B12). The token can't read that API.
6. **Run `docker build .` locally** (W1).
7. **Plan the #779 conflict** (W3): `codeql-analysis.yml`, `main.yml`, `update-sitemaps.yml`, `craco.config.js`, `DateSelectionMethods.test.ts`. Keep #779's pinned action SHAs, and this PR's `test:ci` and `build:ci-stable` steps and its coverage allowlist entries.
8. **Last, right before merging:** delete the eight `TASK-*.md` files and add `TASK-*.md` to `.gitignore` in the same commit (B11).

## Things worth knowing

- **Fragment saves go through `SerialQueue`** (`common/utils/SerialQueue.ts`), inside `CuneiformFragmentController.handleSave`. A second save doesn't start until the first has settled. Any new fragment write must go through `onSave`.
- **Date writes don't use `onSave`.** They lock their own buttons. `DatesInTextSelection` passes `isParentSaving` down to its row editors.
- **`withDataGetters.abortSignal.test.tsx`** checks that page getters hand their cancel signal on. Extend it when you add a getter.
- **A repository that falls back to a default on failure must rethrow `AbortError` first** (see `DossiersRepository`).
- **Coverage allowlist:** `craco.config.js` `fullyCoveredPaths` grew from 50 to 63. Jest subtracts these files from the global figure, so the global floors are compared against a lower number than the printed "All files" row.

## Traps met this round

- jsdom's `AbortController` here ignores `abort(reason)`. Tests must expect `name: 'AbortError'`.
- Date popovers need `await userEvent.click`. `fireEvent` leaves `act` warnings and doesn't close the other popover.
- `mockReturnValue(Promise.reject(...))` causes a `PromiseRejectionHandledWarning`. Use `mockRejectedValue`.
- `pkill -f "craco test"` kills the calling shell. Use `TaskStop` for background runs.
- Never run `yarn lint` or `yarn tsc` while `yarn test:ci` is running. The container kills the test process.
