# TASK-001 — PR Review: Fix date issues (#714)

- **PR:** <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/714>
- **Branch:** `date-fixes` → `master`
- **Author:** @khoidt
- **Head SHA at review time:** `b23a296c16438528f786e26b0c36434cb55a7963`
- **State at review time:** OPEN, no human reviewers, `reviewDecision: null`
- **Files changed:** 43 (additions: ~93,799 — heavily inflated by analysis JSONs; deletions: 113)
- **Reviewed at:** 2026-04-28 / **Updated:** 2026-04-28 (follow-ups F3–F10 resolved locally; F1 and F2 remain blockers)

## Summary

PR fixes five reported date-converter issues (BUG-1…BUG-5) and adds a non-blocking metadata/warning UX for non-numeric date spellings:

- **BUG-1 — Delete date hangs:** `Info.tsx` `updateDate` now passes `date?.toDto()` and the deletion contract is propagated through `FragmentService` and `ApiFragmentRepository`.
- **BUG-2 — `isBroken`/`isUncertain` lost on king load:** `MesopotamianDate.fromJson` now merges DTO king flags onto the resolved `findKingByOrderGlobal` result.
- **BUG-3 — Non-numeric spellings & year metadata:** New `parseDateFieldNumber` strips supported wrappers (`<>`, `[]`, `()`, `?`, `!`, `x+n`, `n-n`, `n/n`, `na`); new `isReconstructed`/`isEmended` year metadata + DTO fields; new `dateFieldWarnings` UX guides users away from raw-symbol entry; new `DateFieldPatternsHelp` popover next to each date field.
- **BUG-4 — Intercalary months ignored:** Shared `normalizeMesopotamianMonth` (6→13, 12→14) applied in `DateBase`/`DateRange`; `DateConverter` adds intercalary fallback for both `setToSeBabylonianDate` and `setToMesopotamianDate`.
- **BUG-5 — Year-0 / Labaši-Marduk regression:** `ZeroYearKingFinder` walks back to nearest predecessor with numeric `totalOfYears`; original king/year-0 is preserved for display via `zeroYearKing`/`yearZero`; `toDto()` and `useDateSelectionState` initializers now use the original (display) values.

Test additions cover the new domain helpers, year-0 paths, intercalary fallbacks, year-metadata round-trip, deletion contract, and warning rendering. Per author's log, `yarn lint`, `yarn tsc`, and full suite all pass (293 suites / 2911 tests / 0 failures).

## Comment status tracking

### Timeline review events

| Reviewer      | State       | Submitted  | Resolved?      |
| ------------- | ----------- | ---------- | -------------- |
| `qltysh[bot]` | `COMMENTED` | 2026-04-27 | **Unresolved** |

No human reviewers, no `APPROVED`, no `CHANGES_REQUESTED` events. No issue-level comments.

### Inline review comments

| #   | Reviewer      | File / Line                                                                                                          | Status                                                                                                                                         | Comment                                                                         |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| C1  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx#L15) | **Addressed locally** (popover rewritten with `Table`, `dl` + inline floats removed). Awaiting push + qlty re-scan to mark resolved on GitHub. | "Found 12 lines of similar code in 2 locations (mass = 67) [qlty:similar-code]" |

## Findings

### F1 — Task-tracking artifacts and 91k-line analysis JSONs are part of the PR diff

- **Severity:** High (blocks merge per project rules)
- **Files:**
  - [TASK-001-todo.md](TASK-001-todo.md)
  - [TASK-001-log.md](TASK-001-log.md)
  - [TASK-001-BUG-3-api-instructions.md](TASK-001-BUG-3-api-instructions.md)
  - [TASK-001-non_numeric_date_spellings_ebl.classification_report.md](TASK-001-non_numeric_date_spellings_ebl.classification_report.md)
  - `TASK-001-non_numeric_date_spellings_ebl.json` (~44.5k lines)
  - `TASK-001-non_numeric_date_spellings_ebl.classified.json` (~47.3k lines)
- **Reproduction:** `git diff --stat origin/master..date-fixes` shows the six files above accounting for ~92k additions.
- **Recommendation:** Delete all `TASK-001-*` files from the branch before merge (project guideline: "Before a PR is merged, check for these task TODO/log .md files and remind to remove them"). The two large JSON analysis dumps are research artifacts, not source code; if archival is needed, store them outside the repo. After deletion, this review file (`TASK-001-review.md`) must also be removed before merge.

### F2 — PR description is empty

- **Severity:** Medium
- **Evidence:** `body: null` in PR JSON.
- **Recommendation:** Populate the description with the BUG-1..BUG-5 summary, reproduction fragments (`BM.14029`, `Abbey-W.589`, `MNB.1129`, `VAT.8439`), the new year metadata (`isReconstructed`, `isEmended`), and a note that the backend is expected to accept these new optional DTO fields.

### F3 — qlty similar-code finding unresolved (C1)

- **Severity:** Medium
- **Status:** **Resolved locally** (2026-04-28). Rewrote [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx) using `react-bootstrap` `Table` (semantic two-column layout, no inline `float` styling, popover JSX hoisted to a module-level constant). The duplicated `<dl>` + float scaffold is gone. Push + qlty re-scan needed to confirm the finding closes on GitHub.

### F4 — DRY violation: warning-rendering scaffold duplicated in `getYearInputGroup`

- **Severity:** Medium (project DRY hard gate)
- **Status:** **Resolved** (2026-04-28). Extracted local `<DateFieldWarnings field={...} value={...} />` component in [src/chronology/ui/DateEditor/DateSelectionInput.tsx](src/chronology/ui/DateEditor/DateSelectionInput.tsx); both `getDateInputGroup` and `getYearInputGroup` now use it.

### F5 — `parseInt` called without radix

- **Severity:** Medium (lint-rule risk + correctness)
- **Status:** **Resolved** (2026-04-28). [src/chronology/domain/parseDateFieldNumber.ts](src/chronology/domain/parseDateFieldNumber.ts#L18) now calls `parseInt(normalized, 10)`.

### F6 — Roman-numeral check applied to month field

- **Severity:** Low (spec drift)
- **Status:** **Resolved** (2026-04-28). Non-standard warning is now scoped to `field !== 'month'` in [src/chronology/ui/DateEditor/dateFieldWarnings.ts](src/chronology/ui/DateEditor/dateFieldWarnings.ts). A latent false-positive on standalone `x` (placeholder for unclear number) was also fixed.

### F7 — `DateFieldPatternsHelp` uses inline `float: 'left'` styles

- **Severity:** Low
- **Status:** **Resolved** (2026-04-28). Popover content now uses a `react-bootstrap` `Table` instead of float-based two-column `<dl>`.

### F8 — `DateFieldPatternsHelp.test.tsx` is too thin and uses a relative import

- **Severity:** Low
- **Status:** **Resolved** (2026-04-28). Test now imports via the alias path and uses `it.each(...)` to assert each of the seven allowed-pattern rows renders in the popover on hover.

### F9 — `Date.ts toDto()` falsy-checks `orderGlobal`

- **Severity:** Info
- **File:** [src/chronology/domain/Date.ts](src/chronology/domain/Date.ts#L25-L31)
- **Detail:** `if (originalKing?.orderGlobal)` drops `orderGlobal === 0`. No king in `Kings.json` currently has `0`, but the explicit `!= null` check is safer and matches the symmetric guard already used in `fromJson` (`kingOrderGlobal !== undefined`).
- **Recommendation:** Use `if (originalKing?.orderGlobal != null)`.

### F10 — Stray block scope and minor readability nits in `dateFieldWarnings.ts`

- **Severity:** Info
- **Status:** **Resolved** (2026-04-28). Bare block removed; constant renamed to `STANDARD_DATE_FIELD_PATTERN`; non-standard logic extracted into `isNonStandardValue(...)` helper.

### F11 — `ZeroYearKingFinder.getPreviousKingWithNumericTotalOfYears` could use `Array.find`

- **Severity:** Info
- **File:** [src/chronology/domain/ZeroYearKingFinder.ts](src/chronology/domain/ZeroYearKingFinder.ts#L62-L70)
- **Detail:** The inner `for (const candidateKing of kings)` loop reimplements `find`. Per the log, this was rewritten to avoid `eslint(no-loop-func)`; you can keep `find` by extracting a top-level helper `findKingAtOrder(kings, order)`.
- **Recommendation:** Optional cleanup — keep current implementation if readability is judged equivalent.

### F12 — Pre-existing flaky test acknowledged in log

- **Severity:** Info
- **File:** `src/corpus/ui/Corpus.integration.test.ts`
- **Detail:** Author logged a one-off timeout in the full-suite run; reproduces clean in isolation. Not introduced by this PR but should not be lost.
- **Recommendation:** Open a follow-up issue tracking the flake; not a blocker for this PR.

## Severity roll-up

| Severity | Count | IDs               |
| -------- | ----- | ----------------- |
| High     | 1     | F1                |
| Medium   | 4     | F2, F3, F4, F5    |
| Low      | 3     | F6, F7, F8        |
| Info     | 4     | F9, F10, F11, F12 |

No console-noise findings observed in the author-reported full-suite run. (Per project rules, any console.error/warn during tests would have been a hard gate; the log reports a clean run, but a re-verification on the latest head SHA is recommended — see "What Has To Be Done".)

## Reproduction steps

1. Check out `date-fixes` at `b23a296c`.
2. Run `git diff --stat origin/master..HEAD` and confirm the six `TASK-001-*` files account for the bulk of additions (F1).
3. Run `yarn lint && yarn tsc && CI=1 yarn test --no-coverage --watch=false` and confirm zero lint/type/test failures and zero console output (verifies hard gates on the current head).
4. Open the date editor on a fragment, type `<136>` in the year field — expect the Reconstructed-switch warning (F3/BUG-3 acceptance).
5. Save a date with king Nabonidus year 0, refresh the fragment page — expect display "1.I.0 Nabonidus" and the editor to repopulate Nabonidus / 0 (BUG-5 acceptance).
6. Save a date `16.VI².3 Cambyses` on a fragment — expect modern date `28 August 527 BCE PJC` (BUG-4 acceptance).
7. Click the Delete button on a date and confirm the spinner stops and the date is cleared (BUG-1 acceptance).

## Recommendation

**Request changes** — the PR is functionally strong and well-tested, but it cannot be merged in its current state because of F1 (task artifacts in the diff) and the unresolved qlty finding (F3). Once F1, F2, F3, F4, F5 are addressed and gates re-run on the new head, this is a good candidate for approval.

## What Has To Be Done

1. **(Blocker, F1)** Remove `TASK-001-todo.md`, `TASK-001-log.md`, `TASK-001-BUG-3-api-instructions.md`, `TASK-001-non_numeric_date_spellings_ebl.classification_report.md`, `TASK-001-non_numeric_date_spellings_ebl.json`, `TASK-001-non_numeric_date_spellings_ebl.classified.json` from the branch before merge. Also remove `TASK-001-review.md` once the review is closed.
2. **(Blocker, F2)** Add a PR description summarizing BUG-1..BUG-5, the new `isReconstructed`/`isEmended` DTO fields, and the dependency on backend accepting those fields.
3. **(Required)** Push the F3..F10 follow-up commits to `date-fixes` (pending user approval) so the qlty re-scan can clear C1.
4. **(Required)** Re-run `yarn lint`, `yarn tsc`, and `CI=1 yarn test --no-coverage --watch=false` on the new head and confirm: zero failures, zero console output. Already verified locally on 2026-04-28 (lint clean, tsc clean, full suite 295/296 suites pass; 1 isolated flake in `BibliographyEntryForm.test.tsx` reproduces clean in isolation).
5. **(Required)** Request a human reviewer (no human review on the PR yet) and re-request review after pushing the fixes.
6. **(Optional, F9, F11, F12)** Apply the small correctness/readability cleanups described above; F12 (pre-existing flaky `Corpus.integration.test.ts`) is not a blocker but should be tracked separately.
