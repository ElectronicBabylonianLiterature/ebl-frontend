---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: master
head_reviewed: eb730de4 (round 10)
date: 2026-09-29
last_updated: 2026-09-29 (review round 10 + remediation, committed locally, not pushed)
state: round-10 code findings fixed and committed on top of eb730de4; not pushed; the branch still conflicts with master (R1, resolution known)
tracked_in_git: true — the eight scratch .md files are still tracked and must be deleted before merge
blocking_items: 6 (merge master; push; post the description; re-request Fabdulla1's review; read CodeQL alerts in the UI; delete the scratch docs)
gates: lint PASS, tsc PASS, test:ci PASS (513 suites / 4488 tests / 50 snapshots, zero console output), coverage 95.2/88.25/94.87/95.34, every changed source file 100%, 250-line ceiling PASS for every changed file, no new qlty smell against master
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and cancels requests with the browser's own `AbortController` instead. Reads can be cancelled; writes never are, so writes must not overlap.

Round 10 checked the round-9 fixes. Eight of Fabdulla1's nine concerns were fixed properly. One gap was left and is now fixed, along with a few small things:

- **Named-entity saves skipped the save queue.** They could still overtake an edition save. Now they wait in the queue like every other fragment save.
- **qlty flagged the converter form as too complex.** The conversion logic moved into its own small file, `convertAtfLines.ts`.
- **Tests the reviewer asked for.** The converter's cancel signal is now checked on the real `fetch` request.
- **Small fixes.** The save queue no longer passes one save's result to the next, and it resets when you open another fragment. Four tests now use the shared console helpers instead of their own mocks.

Every fix has a test that fails without it.

## Round 10 — what was found and where it stands

| #   | In plain words                                                                  | Status                                                                                     |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| R1  | `master` moved (#821) and now conflicts in `Details.tsx`                        | **Open — resolution worked out and verified**, see step 1                                  |
| R2  | Named-entity saves skipped the save queue                                       | **Fixed**                                                                                  |
| R4  | qlty's one blocking issue: `CuneiformConverterForm` too complex                 | **Fixed** — logic moved to `convertAtfLines.ts`                                            |
| R5  | No test checked the converter's signal on the real `fetch`                      | **Fixed** — `SignService.abortSignal.test.ts`                                              |
| R6  | Limiter test should check the exact abort reason                                | **No change** — this jsdom has no `AbortSignal.reason`; the stricter check can't work here |
| R7  | `SerialQueue` handed the previous result to the next save                       | **Fixed**                                                                                  |
| R8  | A stuck save on one fragment delayed saves on the next                          | **Fixed**                                                                                  |
| R9  | Four tests hand-rolled console mocks                                            | **Fixed** — shared helpers, plus `expectConsoleWarnings` and `observeConsole`              |
| M1  | PR description out of date                                                      | **Drafted, not posted** — see step 3                                                       |
| W2  | qlty can't compute diff coverage above 500 files                                | **Drafted** — a note in the proposed description                                           |
| B10 | Fabdulla1's "changes requested" is still open                                   | **Open — re-request after pushing**                                                        |
| B11 | Eight `TASK-*.md` scratch files are in the branch                               | **Open — delete right before merge** (your decision)                                       |
| B12 | CodeQL can't check a PR this big (over 300 files)                               | **Open — read the alerts in the GitHub UI** (your decision)                                |
| W1  | No PR ever builds the Dockerfile                                                | **Open — run `docker build .` locally**                                                    |
| W3  | #774 and #779 conflict in six files                                             | **Open** — whoever lands second resolves them                                              |
| —   | 45 script files on the branch are still over 250 lines (not touched by this PR) | **Separate PR** (your decision, 2026-09-29)                                                |

## Next steps, in order

1. **Merge `master` (R1).** One conflict, in `src/fragmentarium/ui/info/Details.tsx`. #821 split `Details.tsx` into its own `DetailsItems.tsx`; this PR had already split it into `DetailsFields.tsx`. Resolve by:
   - keeping this PR's `Details.tsx` (imports from `DetailsFields`), and replacing its single `fragment.acquisition && (...)` item with #821's `fragment.acquisitions.map((acquisition, index) => <li className="Details__item" key={index}>Acquisition: From {acquisition.toString()}</li>)`;
   - deleting `src/fragmentarium/ui/info/DetailsItems.tsx` (`git rm -f`), which duplicates `DetailsFields.tsx`.

   Verified on 2026-09-29 in a scratch worktree: `yarn tsc` clean; `src/fragmentarium/ui/info`, `src/fragmentarium/domain` and `FragmentRepository.delegation` → 29 suites, 477 tests. Rerun lint, tsc and `yarn test:ci` after the real merge.

2. **Push** `chore/remove-bluebird`.
3. **Post the PR description update (M1, W2).** It replaces the stale "write in flight at unmount still runs its `onSuccess`" note, adds a "Round-9 and round-10 review fixes" section, and notes that qlty's diff coverage isn't computed above 500 files. The proposed full text was written to the session scratchpad as `pr-body-proposed.md`; if that's gone, rebuild it from the remediation tables in `TASK-774-review.md`.
4. **Watch CI** on the new head: `test`, `CodeQL`, `qlty check` (should now say no blocking issues).
5. **Re-request Fabdulla1's review** (B10). Reviewers are managed by hand, never through the API.
6. **Read the CodeQL alerts** for the branch in the GitHub security tab (B12). The token can't read that API.
7. **Run `docker build .` locally** (W1).
8. **Plan the #779 conflict** (W3): `codeql-analysis.yml`, `main.yml`, `update-sitemaps.yml`, `craco.config.js`, `DateSelectionMethods.test.ts`, `src/test-support/waitForSpinnerToBeRemoved.ts`. Keep #779's pinned action SHAs, and this PR's `test:ci` / `build:ci-stable` steps and coverage allowlist entries.
9. **Last, right before merging:** delete the eight `TASK-*.md` files and add `TASK-*.md` to `.gitignore` in the same commit (B11).

## Things worth knowing

- **Every fragment save goes through `SerialQueue`** in `CuneiformFragmentController.handleSave`. Hand `onSave` the request itself (`() => service.update(...)`), never a promise you've already started, or the queue only orders the screen update. The queue is replaced when the displayed fragment changes.
- **Date writes don't use `onSave`.** They lock their own buttons. `DatesInTextSelection` passes `isParentSaving` to its row editors.
- **Console in tests:** use `expectConsoleErrors`, `tolerateConsoleErrors` or `expectConsoleWarnings` from `setupTests` when a test arranges a log; they return the spy, so you can `waitFor` on it. Use `observeConsole('error' | 'warn')` to assert that nothing was logged; it doesn't silence anything. Never add `jest.spyOn(console, ...).mockImplementation()`.
- **`withDataGetters.abortSignal.test.tsx`** checks that page getters hand their cancel signal on. **`SignService.abortSignal.test.ts`** shows how to check a signal on the real `fetch`.
- **A repository that falls back to a default on failure must rethrow `AbortError` first** (see `DossiersRepository`).
- **Coverage allowlist:** `craco.config.js` `fullyCoveredPaths` now also lists `convertAtfLines.ts`.

## Traps met

- jsdom 16.7 here has no `AbortSignal.reason` and ignores `abort(reason)`. Tests must expect `name: 'AbortError'`.
- `qlty check --upstream origin/master` reports "no modified files" on this branch; pass the changed paths explicitly. `qlty smells` head vs. master is how the blocking issue was found.
- A local-only Browserslist "caniuse-lite is 8 months old" notice appears at the start of Jest runs; it isn't in CI's log and isn't test output.
- Date popovers need `await userEvent.click`. `fireEvent` leaves `act` warnings.
- `mockReturnValue(Promise.reject(...))` causes a `PromiseRejectionHandledWarning`. Use `mockRejectedValue`.
- `pkill -f "craco test"` kills the calling shell. Use `TaskStop` for background runs.
- Never run `yarn lint`, `yarn tsc` or `qlty` while `yarn test:ci` is running. The container kills the test process.
