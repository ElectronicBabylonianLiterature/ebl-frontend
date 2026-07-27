# TASK-pr767 — TODO

Review of PR #767 (`add-realia-annotation` → `master`) at head `1070d896`, and resolution of
every finding it surfaced. See `TASK-pr767-review.md` for the findings and
`TASK-pr767-log.md` for the work log.

## Review phase

- [x] Read `.github/copilot-instructions.md` and apply every gate.
- [x] Fetch all pre-existing GitHub reviews (timeline events) and comments (inline +
      general) with resolution and outdated status — hard gate before reviewing.
- [x] Read the full diff (115 files) against `master`.
- [x] Data-architecture audit (kinds held structurally apart).
- [x] API-call-efficiency audit.
- [x] Run `yarn lint`, `yarn tsc`, full test suite, console-noise check, coverage of
      affected code.
- [x] Export the review to `TASK-pr767-review.md` with the required sections.
- [x] Create this TODO file and the work log (missed on the first pass — see log).

## Findings to resolve at root cause

- [x] **F1** Rename the display toggle to describe both layers
      (`FragmentDisplaySettings.tsx`), update `Display.test.tsx` and the snapshot.
- [x] **F4** Save-path test with both `namedEntities` and `realia` non-empty, asserting
      derived fields are stripped.
- [x] **F5** Keyboard/screen-reader path to the Realia page from the read-only preview
      indicator.
- [x] **F6** Stop stacked tiers from exceeding the generated CSS tier ceiling; pin the TS
      constant against the sass value with a test.
- [x] **F7** Lazy `useReducer` initializer in `useAnnotationContext`.
- [x] **F8** Seed `initialAnnotations` from the deduped spans so Save is disabled on load.
- [x] **F9** Disable Apply while the realia select is empty.
- [x] **F10** Mount `NamedEntityPreviewProvider` unconditionally and pass the toggle state
      down, so toggling does not remount the transliteration.
- [x] **F11** Cover the save-failure branch of `SpanAnnotationDisplay`.
- [x] **F13** Split `Markable.test.tsx` (307 lines) under the 250-line ceiling.
- [x] **F14** Fix the failing CI `yarn tsc` / `yarn build` steps at their root cause
      (`onSave` typed as the `Bluebird<Fragment>` it actually returns).
- [x] **F15** Re-measure every gate from `yarn install --frozen-lockfile`, and on the merge
      with `master` in a scratch worktree — the environment that hid F14.

## Findings that are not code changes (reported, owner = PR author)

- [ ] **F2** Merge/deploy `ebl-api@add-realia-annotation-api` before or with this PR.
- [ ] **F3** Remove `TASK-realia-annotation-candidates-{todo,log}.md`,
      `TASK-realia-preview-broken-{todo,log,api-prompt}.md` and the three `TASK-pr767-*.md`
      files in the final commit before merge.
- [ ] **F12** Call out the tooling/policy changes in the PR description.
- [ ] **F13 (remainder)** `FragmentService.ts` (820), `FragmentService.test.ts` (1 940),
      `FragmentRepository.ts` (739), `FragmentRepository.test.ts` (1 061),
      `SignImages.tsx` (444), `fragment.ts` (267) are all pre-existing over the ceiling and
      untouched here beyond a few lines — splitting them is separate work. See log.

## Hard gates added to the instructions

- [x] New **CI — The Remote Result Is the Gate** section: fetch the checks before and after,
      read failing job logs, treat red as blocking, reproduce before fixing, verify on the
      merge with `master`, run `yarn build` too, and re-confirm after pushing.
- [x] **Commands and Tooling**: lockfile-consistent install required before reporting any
      local gate result.
- [x] **Review Guidelines**: checks are a hard gate alongside reviews/comments; failing
      checks are blocking findings; mandatory `CI Status` section in the review template.

## Gates after the fixes

- [x] `yarn lint` clean.
- [x] `yarn tsc` clean.
- [x] Full test suite green, zero console output.
- [x] Coverage of affected code back at 100 %.
- [x] Every changed/added file under 250 lines (except the pre-existing ones listed above).
- [x] Snapshot updated on the single affected file after inspecting the diff.
- [x] App compiles and serves (`craco start`); no browser/API here for a live run-through.
- [x] `yarn build` green (CI's other failing step).
- [x] Gates re-run on the merge with `master` in a scratch worktree.
- [ ] **Push and confirm the PR's `test` check goes green** — the CI fix is verified locally
      and against the merge, but the PR's own checks stay red until a run completes.
- [x] First batch committed on the user's request; the F14/F15 fix and the instruction gates
      are uncommitted, awaiting the user.
