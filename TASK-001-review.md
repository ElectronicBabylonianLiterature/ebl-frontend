# TASK-001 — PR Review: Fix date issues (#714)

- **PR:** <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/714>
- **Branch:** `date-fixes` → `master`
- **Author:** @khoidt
- **Head SHA at review time:** `0151328ca049bf4792bdf011e6e2cf35edf2c9e9` (was `b23a296c` at initial review)
- **State at review time:** OPEN, no human reviewers, `reviewDecision: null`
- **CI checks at HEAD:** 6 / 8 OK (qlty review event surfaced new findings — see F13)
- **Files changed:** 55 (additions: ~95,076 — heavily inflated by analysis JSONs; deletions: 315)
- **Reviewed at:** 2026-04-28 / **Updated:** 2026-04-30 (rebased onto new head; F3/F4/F5/F6/F7/F8/F10 confirmed resolved on remote; F9/F11/F13 resolved locally pending push; F1/F2 still blockers)

## Summary

PR fixes five reported date-converter issues (BUG-1…BUG-5) and adds a non-blocking metadata/warning UX for non-numeric date spellings:

- **BUG-1 — Delete date hangs:** `Info.tsx` `updateDate` now passes `date?.toDto()` and the deletion contract is propagated through `FragmentService` and `ApiFragmentRepository`.
- **BUG-2 — `isBroken`/`isUncertain` lost on king load:** `MesopotamianDate.fromJson` now merges DTO king flags onto the resolved `findKingByOrderGlobal` result.
- **BUG-3 — Non-numeric spellings & year metadata:** New `parseDateFieldNumber` strips supported wrappers (`<>`, `[]`, `()`, `?`, `!`, `x+n`, `n-n`, `n/n`, `na`); new `isReconstructed`/`isEmended` year metadata + DTO fields; new `dateFieldWarnings` UX guides users away from raw-symbol entry; new `DateFieldPatternsHelp` popover next to each date field.
- **BUG-4 — Intercalary months ignored:** Shared `normalizeMesopotamianMonth` (6→13, 12→14) applied in `DateBase`/`DateRange`; `DateConverter` adds intercalary fallback for both `setToSeBabylonianDate` and `setToMesopotamianDate`.
- **BUG-5 — Year-0 / Labaši-Marduk regression:** `ZeroYearKingFinder` walks back to nearest predecessor with numeric `totalOfYears`; original king/year-0 is preserved for display via `zeroYearKing`/`yearZero`; `toDto()` and `useDateSelectionState` initializers now use the original (display) values.

Since the initial review the author has pushed seven additional commits (`3b0c6177`, `21761701`, `928b03f5`, `7f84590c`, `0394b830`, `5a927b88`, `0151328c`) which: address F3..F10 follow-ups; add a `ca.` qualifier for approximate patterns; ensure non-pattern characters reliably trigger the non-standard warning; split `Date.test.ts` and de-flake tests; add a manual QA checklist; align the year-row layout with a wrapped second line for Reconstructed/Emended; add `id`/`name` attributes to chronology form controls and `react-select` inputs; normalize new sass files to 2-space indentation; prevent `n[a-z]` pattern wrap in the help popover; export shared `dateFieldPatterns` constant and reuse it in tests; and update the `LatestTransliterations` snapshot for className-based styling.

Per author's log, `yarn lint`, `yarn tsc`, and the full suite pass on the new head.

## Comment status tracking

### Timeline review events

| Reviewer      | State       | Submitted               | Resolved?                                                                                      |
| ------------- | ----------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `qltysh[bot]` | `COMMENTED` | 2026-04-27 (`b23a296c`) | **Resolved** (similar-code C1 cleared after refactor)                                          |
| `qltysh[bot]` | `COMMENTED` | 2026-04-29 (`5a927b88`) | **Resolved** (similar-code mass=64 cleared after `dateFieldPatterns` extraction in `0151328c`) |
| `qltysh[bot]` | `COMMENTED` | 2026-04-30 (`0151328c`) | **Unresolved** — three stylelint `CssSyntaxError` findings on new `.sass` files (see F13)      |

No human reviewers, no `APPROVED`, no `CHANGES_REQUESTED` events. No issue-level comments.

### Inline review comments

| #   | Reviewer      | File / Line                                                                                                                            | Status               | Comment                                                                                                                                         |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx)                       | **Resolved**         | "Found 12 lines of similar code in 2 locations (mass = 67) [qlty:similar-code]" — cleared after `Table` rewrite.                                |
| C2  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateSelectionInput.sass](src/chronology/ui/DateEditor/DateSelectionInput.sass) (outdated, on `5a927b88`) | **Resolved**         | "Found 12 lines of similar code in 2 locations (mass = 64) [qlty:similar-code]" — cleared after extracting shared `dateFieldPatterns` constant. |
| C3  | `qltysh[bot]` | [src/chronology/application/DateSelection.sass](src/chronology/application/DateSelection.sass#L2)                                      | **Unresolved (F13)** | "Unknown word max-width (CssSyntaxError) [stylelint:CssSyntaxError]"                                                                            |
| C4  | `qltysh[bot]` | [src/chronology/ui/DateDisplay.sass](src/chronology/ui/DateDisplay.sass#L2)                                                            | **Unresolved (F13)** | "Unknown word text-decoration (CssSyntaxError) [stylelint:CssSyntaxError]"                                                                      |
| C5  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateSelectionInput.sass](src/chronology/ui/DateEditor/DateSelectionInput.sass#L2)                        | **Unresolved (F13)** | "Unknown word flex (CssSyntaxError) [stylelint:CssSyntaxError]"                                                                                 |

## Findings

### F1 — Task-tracking artifacts and ~92k-line analysis JSONs are part of the PR diff

- **Severity:** High (blocks merge per project rules)
- **Status:** **Still unresolved on remote.** `git diff --name-only origin/master..HEAD` continues to include all `TASK-001-*` artifacts.
- **Files:**
  - [TASK-001-todo.md](TASK-001-todo.md)
  - [TASK-001-log.md](TASK-001-log.md)
  - [TASK-001-manual-qa.md](TASK-001-manual-qa.md)
  - [TASK-001-BUG-3-api-instructions.md](TASK-001-BUG-3-api-instructions.md)
  - [TASK-001-non_numeric_date_spellings_ebl.classification_report.md](TASK-001-non_numeric_date_spellings_ebl.classification_report.md)
  - `TASK-001-non_numeric_date_spellings_ebl.json` (~44.5k lines)
  - `TASK-001-non_numeric_date_spellings_ebl.classified.json` (~47.3k lines)
  - [TASK-001-review.md](TASK-001-review.md) (this file)
- **Recommendation:** Delete all `TASK-001-*` files from the branch before merge (project guideline: "Before a PR is merged, check for these task TODO/log .md files and remind to remove them"). The two large JSON analysis dumps are research artifacts, not source code; if archival is needed, store them outside the repo.

### F2 — PR description is empty

- **Severity:** Medium
- **Status:** **Still unresolved.** PR body remains empty (`No description provided.`).
- **Recommendation:** Populate the description with the BUG-1..BUG-5 summary, reproduction fragments (`BM.14029`, `Abbey-W.589`, `MNB.1129`, `VAT.8439`), the new year metadata (`isReconstructed`, `isEmended`), and a note that the backend is expected to accept these new optional DTO fields.

### F3 — qlty similar-code finding C1 (DateFieldPatternsHelp)

- **Severity:** Medium
- **Status:** **Resolved on remote** (commit `5a927b88`). Popover rewritten with `react-bootstrap` `Table`; duplicated `<dl>` + float scaffold removed. qlty re-scan no longer flags this location.

### F4 — DRY violation: warning-rendering scaffold duplicated in `getYearInputGroup`

- **Severity:** Medium (project DRY hard gate)
- **Status:** **Resolved on remote.** `<DateFieldWarnings field={...} value={...} />` extracted in [src/chronology/ui/DateEditor/DateSelectionInput.tsx](src/chronology/ui/DateEditor/DateSelectionInput.tsx); both `getDateInputGroup` and `getYearInputGroup` use it.

### F5 — `parseInt` called without radix

- **Severity:** Medium
- **Status:** **Resolved on remote.** [src/chronology/domain/parseDateFieldNumber.ts](src/chronology/domain/parseDateFieldNumber.ts) now calls `parseInt(normalized, 10)`.

### F6 — Roman-numeral check applied to month field

- **Severity:** Low
- **Status:** **Resolved on remote.** Non-standard warning is scoped to `field !== 'month'` in [src/chronology/ui/DateEditor/dateFieldWarnings.ts](src/chronology/ui/DateEditor/dateFieldWarnings.ts). Latent false-positive on standalone `x` also fixed.

### F7 — `DateFieldPatternsHelp` uses inline `float: 'left'` styles

- **Severity:** Low
- **Status:** **Resolved on remote.** Popover content uses `react-bootstrap` `Table` instead of float-based two-column `<dl>`.

### F8 — `DateFieldPatternsHelp.test.tsx` is too thin and uses a relative import

- **Severity:** Low
- **Status:** **Resolved on remote.** Test imports via the alias path and uses `it.each(...)` over the shared `dateFieldPatterns` constant to assert each allowed-pattern row renders.

### F9 — `Date.ts toDto()` falsy-checks `orderGlobal`

- **Severity:** Info
- **Status:** **Resolved locally** (2026-04-30). [src/chronology/domain/Date.ts](src/chronology/domain/Date.ts) now uses `if (originalKing?.orderGlobal != null)` so `orderGlobal === 0` survives serialization, symmetric with the existing `kingOrderGlobal !== undefined` guard in `fromJson`. Awaiting push.

### F10 — Stray block scope and minor readability nits in `dateFieldWarnings.ts`

- **Severity:** Info
- **Status:** **Resolved on remote.** Bare block removed; constant renamed to `STANDARD_DATE_FIELD_PATTERN`; non-standard logic extracted into `isNonStandardValue(...)` helper.

### F11 — `ZeroYearKingFinder.getPreviousKingWithNumericTotalOfYears` could use `Array.find`

- **Severity:** Info
- **Status:** **Resolved locally** (2026-04-30). Module-scoped `findKingAtOrderInDynasty(kings, orderInDynasty)` helper introduced in [src/chronology/domain/ZeroYearKingFinder.ts](src/chronology/domain/ZeroYearKingFinder.ts); inner `for ... of` loop replaced with `Array.find`. Helper is hoisted out of the enclosing `for` so `eslint(no-loop-func)` does not fire. Awaiting push.

### F12 — Pre-existing flaky tests acknowledged in log

- **Severity:** Info
- **Status:** **Tracking only** — not introduced by this PR.
- **Files:** `src/corpus/ui/Corpus.integration.test.ts`; one-off flake on `BibliographyEntryForm.test.tsx` reported during F3..F10 verification.
- **Recommendation:** Open a follow-up issue tracking the flakes; not a blocker for this PR.

### F13 — qlty surfaces stylelint `CssSyntaxError` on new indented-syntax `.sass` files

- **Severity:** Low (qlty-side false positive)
- **Status:** **Resolved locally** (2026-04-30). Awaiting push + qlty re-scan to clear C3, C4, C5.
- **Files / lines (original findings):**
  - [src/chronology/application/DateSelection.sass](src/chronology/application/DateSelection.sass#L2) — `Unknown word max-width (CssSyntaxError)` (C3)
  - [src/chronology/ui/DateDisplay.sass](src/chronology/ui/DateDisplay.sass#L2) — `Unknown word text-decoration (CssSyntaxError)` (C4)
  - [src/chronology/ui/DateEditor/DateSelectionInput.sass](src/chronology/ui/DateEditor/DateSelectionInput.sass#L2) — `Unknown word flex (CssSyntaxError)` (C5)
- **Root cause:** qlty's stylelint plugin runs from its own install directory and cannot resolve `postcss-sass` (declared as `customSyntax` for `**/*.sass` in `.stylelintrc.json`) from the project's `node_modules`. Stylelint then parses the indented-syntax `.sass` files as plain CSS and rejects the first non-selector word as "Unknown word".
- **Local verification:** `yarn stylelint "src/**/*.sass"` exits 0 with no output.
- **Fix applied:** Added a minimal [.qlty/qlty.toml](.qlty/qlty.toml) (no prior file in the repo) that excludes the stylelint plugin for `**/*.sass`. Project `.sass` files remain linted locally and in CI via `yarn lint`, which uses the project-installed `stylelint@14` with `postcss-sass`.

```toml
config_version = "0"

[[source]]
name = "default"
default = true

[[exclude]]
plugins = ["stylelint"]
file_patterns = ["**/*.sass"]
```

- **No silencing in source:** No stylelint-disable comments were added to the `.sass` files.

## Severity roll-up

| Severity | Count | IDs                                       |
| -------- | ----- | ----------------------------------------- |
| High     | 1     | F1                                        |
| Medium   | 1     | F2                                        |
| Low      | 0     | —                                         |
| Info     | 0     | —                                         |
| Resolved | 10    | F3, F4, F5, F6, F7, F8, F9, F10, F11, F13 |
| Tracking | 1     | F12                                       |

No console-noise findings observed on the latest local full-suite run on top of `0151328c` + F9/F11/F13 patches: 299/299 suites, 2970 tests pass, 2 skipped, zero failures, zero console output. (One flake reproduced once on `CuneiformFragment.test.tsx` "Calls `updateDate` with undefined on Date delete" via `waitForSpinnerToBeRemoved`; passes in isolation — same pattern as F12, not introduced by these changes.)

## Reproduction steps

1. Check out `date-fixes` at `0151328c`.
2. Run `git diff --stat origin/master..HEAD` and confirm the seven `TASK-001-*` files account for the bulk of additions (F1).
3. Run `yarn lint && yarn tsc && CI=1 yarn test --no-coverage --watch=false` and confirm zero lint/type/test failures and zero console output (verifies hard gates on the current head).
4. Run `yarn stylelint "src/**/*.sass"` and confirm zero output (verifies F13 is a qlty-side false positive).
5. Open the date editor on a fragment, type `<136>` in the year field — expect the Reconstructed-switch warning (BUG-3 acceptance).
6. Save a date with king Nabonidus year 0, refresh the fragment page — expect display "1.I.0 Nabonidus" and the editor to repopulate Nabonidus / 0 (BUG-5 acceptance).
7. Save a date `16.VI².3 Cambyses` on a fragment — expect modern date `28 August 527 BCE PJC` (BUG-4 acceptance).
8. Click the Delete button on a date and confirm the spinner stops and the date is cleared (BUG-1 acceptance).

## Recommendation

**Request changes** — the PR is functionally strong, well-tested, and all qlty-surfaced and code-quality follow-ups (F3..F11, F13) are addressed. The remaining blockers are bookkeeping (F1, F2). Once F1 and F2 are addressed and the F9/F11/F13 patches are pushed, this PR is a good candidate for approval.

## What Has To Be Done

1. **(Blocker, F1)** Remove `TASK-001-todo.md`, `TASK-001-log.md`, `TASK-001-manual-qa.md`, `TASK-001-BUG-3-api-instructions.md`, `TASK-001-non_numeric_date_spellings_ebl.classification_report.md`, `TASK-001-non_numeric_date_spellings_ebl.json`, `TASK-001-non_numeric_date_spellings_ebl.classified.json` from the branch before merge. Also remove `TASK-001-review.md` once the review is closed.
2. **(Blocker, F2)** Add a PR description summarizing BUG-1..BUG-5, the new `isReconstructed`/`isEmended` DTO fields, and the dependency on backend accepting those fields.
3. **(Required)** Push the F9/F11/F13 patches (new `.qlty/qlty.toml`, updated `Date.ts` and `ZeroYearKingFinder.ts`, plus task-doc updates) so the qlty re-scan can clear C3, C4, C5 on `0151328c`'s successor.
4. **(Required)** Re-run `yarn lint`, `yarn tsc`, `yarn stylelint`, and `CI=1 yarn test --no-coverage --watch=false` on the latest head and confirm: zero failures, zero console output, zero stylelint findings.
5. **(Required)** Request a human reviewer (no human review on the PR yet) and re-request review after F1, F2, and the push of F9/F11/F13 patches.
6. **(Optional, F12)** Open a follow-up issue tracking the `Corpus.integration.test.ts` flake and the one-off `CuneiformFragment.test.tsx` spinner-wait flake.
