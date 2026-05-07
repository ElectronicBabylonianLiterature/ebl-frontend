# TASK-714 — PR Review: Fix date issues (#714)

- **PR:** <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/714>
- **Branch:** `date-fixes` → `master`
- **Author:** @khoidt
- **Head SHA at initial review:** `5d37dad2dc23f15041bf2a9f42174ca09efb7d20`
- **State:** OPEN, not draft, mergeable=true (`mergeable_state: clean`)
- **Review decision (GitHub):** `CHANGES_REQUESTED` — set by @Fabdulla1 (2026-05-06). _F14, F15, F16 addressed locally on 2026-05-07; awaiting push and re-request._
- **CI checks at HEAD:** combined `success`
  - GitHub Actions: `test`, `CodeQL`, `Analyze (javascript)`, `GitGuardian scan` (×2), `GitGuardian Security Checks` — success; `docker`, `docker-test` — skipped.
  - qlty: `qlty check` — success **with 4 blocking issues reported** (similar-code on `Date.intercalary.test.ts`); `qlty coverage diff` 97.3% (≥75% threshold); `qlty coverage` 92.2% (-0.0%).
- **Files changed:** 48 (additions: 1,645 — task-tracking artifacts removed in `5d37dad2`; deletions: 315)
- **Reviewed at:** 2026-05-07 (this review). **Prior local review:** TASK-001-review.md at SHA `0151328c` (recovered from `5d37dad2^` since the file was deleted in the docs cleanup commit).

## Summary

PR fixes five reported date-converter / date-editor issues (BUG-1…BUG-5) and adds a non-blocking metadata + warning UX for non-numeric date spellings:

- **BUG-1 — Delete date hangs:** [src/fragmentarium/ui/info/Info.tsx](src/fragmentarium/ui/info/Info.tsx) `updateDate` passes `date?.toDto()`; deletion contract propagated through [src/fragmentarium/application/FragmentService.ts](src/fragmentarium/application/FragmentService.ts) and [src/fragmentarium/infrastructure/FragmentRepository.ts](src/fragmentarium/infrastructure/FragmentRepository.ts).
- **BUG-2 — `isBroken`/`isUncertain` lost on king load:** [src/chronology/domain/Date.ts](src/chronology/domain/Date.ts) `MesopotamianDate.fromJson` merges DTO king flags onto the `findKingByOrderGlobal` result.
- **BUG-3 — Non-numeric spellings & year metadata:** new [src/chronology/domain/parseDateFieldNumber.ts](src/chronology/domain/parseDateFieldNumber.ts) strips supported wrappers (`<>`, `[]`, `()`, `?`, `!`, `x+n`, `n-n`, `n/n`, `na`); new `isReconstructed`/`isEmended` year metadata + DTO fields; new [src/chronology/ui/DateEditor/dateFieldWarnings.ts](src/chronology/ui/DateEditor/dateFieldWarnings.ts) UX guides users away from raw-symbol entry; new [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx) popover next to each date field; `ca.` qualifier added to modern-date output for approximate patterns.
- **BUG-4 — Intercalary months ignored:** shared [src/chronology/domain/normalizeMesopotamianMonth.ts](src/chronology/domain/normalizeMesopotamianMonth.ts) (6→13, 12→14) applied in [src/chronology/domain/DateBase.ts](src/chronology/domain/DateBase.ts) and [src/chronology/domain/DateRange.ts](src/chronology/domain/DateRange.ts); [src/chronology/domain/DateConverter.ts](src/chronology/domain/DateConverter.ts) adds intercalary fallback for `setToSeBabylonianDate` and `setToMesopotamianDate`.
- **BUG-5 — Year-0 / Labaši-Marduk regression:** [src/chronology/domain/ZeroYearKingFinder.ts](src/chronology/domain/ZeroYearKingFinder.ts) walks back to the nearest predecessor with numeric `totalOfYears`; original king/year-0 preserved for display via `zeroYearKing`/`yearZero`; `toDto()` and `useDateSelectionState` initializers use the original (display) values.

The PR description is now populated (F2 resolved). The last commit (`5d37dad2`, "Clean up PR docs") removed all `TASK-001-*` task-tracking artifacts and the ~92k-line analysis JSONs from the branch (F1 resolved).

Per author's PR description and verified locally on `5d37dad2`: `yarn lint` clean, `yarn tsc` clean, focused `src/chronology` + `src/fragmentarium` suite passes (111 suites / 1263 tests pass, 2 skipped, zero failures, zero console output).

## Comment status tracking

### Timeline review events

| #   | Reviewer        | State                   | Submitted (UTC)          | Commit reviewed | Status / Notes                                                                                                                                                                         |
| --- | --------------- | ----------------------- | ------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `qltysh[bot]`   | `COMMENTED`             | 2026-04-27T21:31:20Z     | `b23a296c`      | Surfaces C1 (`DateFieldPatternsHelp.tsx` similar-code, mass=67). **Resolved** by `5a927b88` rewrite.                                                                                   |
| R2  | `qltysh[bot]`   | `COMMENTED`             | 2026-04-28T11:46:24Z     | `3b0c6177`      | Surfaces C2 (`DateFieldPatternsHelp.tsx` similar-code, mass=64). **Resolved** by `5a927b88` `Table` rewrite.                                                                           |
| R3  | `qltysh[bot]`   | `COMMENTED`             | 2026-04-29T15:42:50Z     | `5a927b88`      | Surfaces C3/C4/C5 stylelint `CssSyntaxError` on three `.sass` files + an additional `DateFieldPatternsHelp` similar-code.                                                              |
| R4  | `qltysh[bot]`   | `COMMENTED`             | 2026-04-30T11:47:36Z     | `0151328c`      | Re-surfaces C3/C4/C5 stylelint findings (still on the diff before `.qlty/qlty.toml` landed).                                                                                           |
| R5  | `qltysh[bot]`   | `COMMENTED`             | 2026-04-30T13:07:07Z     | `e95e882f`      | Surfaces **4 new similar-code findings** on `Date.intercalary.test.ts` (mass=80/80/78/78). **Resolved locally** by F14 `it.each` refactor.                                             |
| R6  | `Fabdulla1`     | `COMMENTED`             | 2026-05-06T10:12:04Z     | `5d37dad2`      | Inline comment on `Corpus.integration.test.ts` (see C14). **Resolved locally** by F16 click + `await waitForText(/Divination Third Category/)` restore.                                |
| R7  | **`Fabdulla1`** | **`CHANGES_REQUESTED`** | **2026-05-06T10:29:49Z** | `5d37dad2`      | **Was a blocker.** Requests an additional transport-layer test that `updateDate(..., undefined)` posts `{}` (see F15). **Resolved locally** — awaiting reviewer dismissal/re-approval. |

No issue-level conversation comments on the PR.

### Inline review comments

| #   | Reviewer      | File / Line                                                                                                                                | Status             | Comment                                                                                                                                                                                                                         |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx#L19) (orig `b23a296c` L15) | **Resolved**       | Found 12 lines of similar code in 2 locations (mass = 67) `[qlty:similar-code]` — cleared after `Table` rewrite in `5a927b88`.                                                                                                  |
| C2  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.tsx#L19) (orig `3b0c6177` L15) | **Resolved**       | Found 12 lines of similar code in 2 locations (mass = 64) `[qlty:similar-code]` — cleared with C1.                                                                                                                              |
| C3  | `qltysh[bot]` | [src/chronology/application/DateSelection.sass](src/chronology/application/DateSelection.sass#L2) (orig `5a927b88` L2)                     | **Resolved (F13)** | Unknown word max-width (CssSyntaxError) `[stylelint:CssSyntaxError]` — qlty-side false positive; suppressed via `.qlty/qlty.toml` exclude for `**/*.sass`.                                                                      |
| C4  | `qltysh[bot]` | [src/chronology/ui/DateDisplay.sass](src/chronology/ui/DateDisplay.sass#L2) (orig `5a927b88` L2)                                           | **Resolved (F13)** | Unknown word text-decoration (CssSyntaxError) — same root cause as C3.                                                                                                                                                          |
| C5  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateSelectionInput.sass](src/chronology/ui/DateEditor/DateSelectionInput.sass#L2) (orig `5a927b88` L2)       | **Resolved (F13)** | Unknown word flex (CssSyntaxError) — same root cause as C3.                                                                                                                                                                     |
| C6  | `qltysh[bot]` | `DateFieldPatternsHelp.tsx` L19 (orig `5a927b88` L16)                                                                                      | **Resolved**       | Re-flag of C2 prior to `Table` rewrite landing on the diff; cleared.                                                                                                                                                            |
| C7  | `qltysh[bot]` | [src/chronology/application/DateSelection.sass](src/chronology/application/DateSelection.sass#L2) (orig `0151328c` L2)                     | **Resolved (F13)** | Re-flag of C3.                                                                                                                                                                                                                  |
| C8  | `qltysh[bot]` | [src/chronology/ui/DateDisplay.sass](src/chronology/ui/DateDisplay.sass#L2) (orig `0151328c` L2)                                           | **Resolved (F13)** | Re-flag of C4.                                                                                                                                                                                                                  |
| C9  | `qltysh[bot]` | [src/chronology/ui/DateEditor/DateSelectionInput.sass](src/chronology/ui/DateEditor/DateSelectionInput.sass#L2) (orig `0151328c` L2)       | **Resolved (F13)** | Re-flag of C5.                                                                                                                                                                                                                  |
| C10 | `qltysh[bot]` | [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) (orig `e95e882f` L143)               | **Resolved (F14)** | Found 15 lines of similar code in 2 locations (mass = 80) `[qlty:similar-code]`. Cleared by `it.each` refactor.                                                                                                                 |
| C11 | `qltysh[bot]` | [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) (orig `e95e882f` L173)               | **Resolved (F14)** | Found 15 lines of similar code in 2 locations (mass = 80). Cleared by `it.each` refactor.                                                                                                                                       |
| C12 | `qltysh[bot]` | [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) (orig `e95e882f` L189)               | **Resolved (F14)** | Found 15 lines of similar code in 2 locations (mass = 78). Cleared by `it.each` refactor.                                                                                                                                       |
| C13 | `qltysh[bot]` | [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) (orig `e95e882f` L205)               | **Resolved (F14)** | Found 15 lines of similar code in 2 locations (mass = 78). Cleared by `it.each` refactor.                                                                                                                                       |
| C14 | `Fabdulla1`   | [src/corpus/ui/Corpus.integration.test.ts](src/corpus/ui/Corpus.integration.test.ts#L97) (orig `5d37dad2` L99)                             | **Resolved (F16)** | "This test seems to only check static text but the previous one actually validated user interaction through a click then waiting. … worth … to revert it." Click + awaited `waitForText(/Divination Third Category/)` restored. |

## Findings

### F1 — Task-tracking artifacts and ~92k-line analysis JSONs in the diff

- **Severity:** High (was a merge blocker)
- **Status:** **Resolved on remote.** Commit `5d37dad2` ("Clean up PR docs") removes all nine task-tracking artifacts (`TASK-001-todo.md`, `TASK-001-log.md`, `TASK-001-manual-qa.md`, `TASK-001-review.md`, `TASK-001-F12-flakes.md`, `TASK-001-BUG-3-api-instructions.md`, the classification report, and the two ~44–47k-line JSON analysis dumps). `git diff master..HEAD --name-only` no longer includes any `TASK-001-*` files.
- **Note:** The current review (this file) is `TASK-714-review.md`. It must also be removed before merge per the project guideline.

### F2 — PR description was empty

- **Severity:** Medium (was a merge blocker)
- **Status:** **Resolved on remote.** PR body now documents BUG-1..BUG-5, the F3..F13 follow-ups, the `.qlty/qlty.toml` rationale, the `isReconstructed`/`isEmended` DTO additions, the `ca.` qualifier, and the verification status of `yarn lint` / `yarn tsc` / chronology + full suites. It also explicitly notes that all `TASK-001-*` artifacts must be removed before merge (already done in `5d37dad2`).

### F3..F11 — Carried over from prior review

- **Severity:** Medium / Low / Info (per item)
- **Status:** All **resolved on remote.** Verified on HEAD:
  - **F3** `DateFieldPatternsHelp.tsx` rewritten with `react-bootstrap` `Table` — qlty C1/C2/C6 cleared.
  - **F4** Shared `<DateFieldWarnings field={...} value={...} />` extracted; reused in `getDateInputGroup` and `getYearInputGroup`.
  - **F5** [src/chronology/domain/parseDateFieldNumber.ts](src/chronology/domain/parseDateFieldNumber.ts) calls `parseInt(normalized, 10)`.
  - **F6** Non-standard warning scoped to `field !== 'month'` in [src/chronology/ui/DateEditor/dateFieldWarnings.ts](src/chronology/ui/DateEditor/dateFieldWarnings.ts); standalone `x` no longer falsely flags.
  - **F7** Inline `float: 'left'` removed in `DateFieldPatternsHelp.tsx`.
  - **F8** [src/chronology/ui/DateEditor/DateFieldPatternsHelp.test.tsx](src/chronology/ui/DateEditor/DateFieldPatternsHelp.test.tsx) imports via the alias path and uses `it.each` over the shared `dateFieldPatterns` constant.
  - **F9** [src/chronology/domain/Date.ts](src/chronology/domain/Date.ts) `toDto()` uses `originalKing?.orderGlobal != null` so `orderGlobal === 0` survives serialization.
  - **F10** Stray bare block removed; `STANDARD_DATE_FIELD_PATTERN` constant + `isNonStandardValue(...)` helper present in [dateFieldWarnings.ts](src/chronology/ui/DateEditor/dateFieldWarnings.ts).
  - **F11** Module-scoped `findKingAtOrderInDynasty` helper hoisted in [src/chronology/domain/ZeroYearKingFinder.ts](src/chronology/domain/ZeroYearKingFinder.ts); inner `for ... of` replaced with `Array.find` (no `eslint(no-loop-func)` regression).

### F12 — Pre-existing flaky tests acknowledged in PR description

- **Severity:** Info (tracking only — not introduced by this PR)
- **Status:** Unchanged. PR description already lists FL1 (`Corpus.integration.test.ts` `waitForText` only awaits the first asserted item), FL2 (`CuneiformFragment.test.tsx` "Calls `updateDate` with undefined on Date delete" race), and FL3 (one-off `BibliographyEntryForm.test.tsx`). Suggested follow-up: open a dedicated tracking issue.

### F13 — qlty stylelint `CssSyntaxError` on indented-syntax `.sass` files (C3/C4/C5/C7/C8/C9)

- **Severity:** Low (qlty-side false positive)
- **Status:** **Resolved on remote.** [.qlty/qlty.toml](.qlty/qlty.toml) ships with the PR and excludes the `stylelint` plugin for `**/*.sass`; project `.sass` files remain linted locally and in CI by `yarn lint` (which uses the project-installed `stylelint@14` with the `customSyntax: postcss-sass` override declared in `.stylelintrc.json`). `yarn lint` runs clean on HEAD; no `stylelint-disable` comments were added to source.

### F14 — qlty surfaces 4 new `similar-code` findings on `Date.intercalary.test.ts` (C10..C13) — NEW

- **Severity:** Low (project DRY hard gate)
- **Status:** **Resolved locally** (2026-05-07). The four `ca. …` blocks have been collapsed into a single parametrized `it.each(cases)` block in [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) using a typed `ApproxCase` record (`label`, `year`, `month`, `day`, `isSeleucidEra`, `converterArgs`, `expectsCa`). Awaiting push + qlty re-scan to clear C10..C13. Original status: surfaced by R5 (`qltysh[bot]`, 2026-04-30 on `e95e882f`) and re-anchored on HEAD (`5d37dad2`); CI status line `qlty check | success | 4 blocking issues`.
- **Files / lines on HEAD:**
  - [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L143) (mass = 80)
  - [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L173) (mass = 80)
  - [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L189) (mass = 78)
  - [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L205) (mass = 78)
- **Root cause:** Each of the four `ca. …` test blocks (n+, n-n, x+n, n/n) constructs `DateConverter` + `MesopotamianDate` with near-identical scaffolding before asserting `expect(date.toModernDate()).toBe(\`ca. ${converter.toDateString('Julian')}\`)`. The four blocks differ only in a single field value, which is precisely the duplication shape qlty flags.
- **Recommendation:** Extract a single parametrized helper inside the `describe` block and drive the four cases via `it.each([...])` over `(field, value)` tuples. Concretely:

  ```ts
  it.each([
    ['day',   '16+',   'Cambyses', 3, 6, 16, false], // n+
    ['day',   '16-17', 'Cambyses', 3, 6, 16, false], // n-n
    ['day',   'x+3',   undefined,  1, 5, 3,  true],  // Seleucid x+n
    ['month', '5/6',   undefined,  1, 5, 16, true],  // Seleucid n/n
  ])('adds ca. for %s pattern %s', (field, value, kingName, y, m, d, seleucid) => { ... })
  ```

  …or factor a `buildApproxDateAssertion(...)` helper. This brings the file in line with the project DRY hard gate and clears C10..C13.

### F15 — Missing transport-layer test for `updateDate(..., undefined) → posts {}` (R7 / Fabdulla1) — NEW BLOCKER

- **Severity:** **High (changes-requested blocker on the PR review)**
- **Status:** **Resolved locally** (2026-05-07). Added a second `TestData('updateDate', [fragmentId, undefined], …, [\`/fragments/${...}/date\`, { date: undefined }], …)`row in [src/fragmentarium/infrastructure/FragmentRepository.test.ts](src/fragmentarium/infrastructure/FragmentRepository.test.ts#L357). The new row exercises the actual HTTP transport with`undefined`payload and asserts the post body is`{ date: undefined }`(which`JSON.stringify`serializes to`{}`); the existing populated row is preserved. Verified via `yarn test -t updateDate` (6 assertions pass). Awaiting push + reviewer re-request. Original state of that file:
  - Existing `TestData('updateDate', [fragmentId, mesopotamianDate.toDto()], …)` covers the **populated** payload only ([FragmentRepository.test.ts](src/fragmentarium/infrastructure/FragmentRepository.test.ts#L346)).
  - `FragmentService.test.ts` covers the service-layer delete contract via mocked `fragmentRepository.updateDate` ([FragmentService.test.ts](src/fragmentarium/application/FragmentService.test.ts#L555)) — but does not exercise the actual HTTP body.
  - `FragmentRepository.updateDate(number, undefined)` posts `{ date: undefined }`; after `JSON.stringify` this serializes to `{}`. The reviewer's requested test would lock in that contract against future refactors.
- **Recommendation:** Add a second `TestData` row for `updateDate` with `[fragmentId, undefined]` asserting the POST is invoked with `[\`/fragments/${encodeURIComponent(fragmentId)}/date\`, { date: undefined }]`(or, if the test harness JSON-stringifies before comparing, with`{}`). Mirror the existing `Promise.resolve(fragmentDto)` shape so coverage is preserved.

### F16 — `Corpus.integration.test.ts` "With session" downgraded from interaction to static-text assertion (C14 / Fabdulla1) — NEW

- **Severity:** Medium (regression in coverage, requested change on the PR review)
- **Status:** **Resolved locally** (2026-05-07). Restored `appDriver.click('Divination')` followed by `await appDriver.waitForText(/Divination Third Category/)` in [src/corpus/ui/Corpus.integration.test.ts](src/corpus/ui/Corpus.integration.test.ts#L97). The matcher had to be a `RegExp` because the rendered DOM (`<a>1. Divination Third Category</a>`) splits the label across multiple text nodes — `findAllByText` requires a regex (or a function matcher) to span them; the master form `appDriver.waitForText('Divination Third Category')` (string) was broken **and** missing `await`, which is why FL1 manifested. The await is now present, so the assertion is real. Snapshot updated for `Without session` (auto-generated `Header-*` / `CorpusTab-*` IDs only — no semantic change). Awaiting push + reviewer re-request. Original diff `master..HEAD`:

  ```diff
  -  appDriver.click('Divination')
  -  appDriver.waitForText('Divination Third Category')
  +  expect(appDriver.getView().container).toHaveTextContent(
  +    'Divination Third Category',
  +  )
  ```

  The previous test exercised user interaction (click on "Divination" and wait for the "Divination Third Category" entry to render). The new assertion only checks that the text is statically present in the rendered tree, removing the interaction coverage. Reviewer @Fabdulla1 asked for this to be reverted.

- **Note:** This change appears to have been introduced as a flake mitigation (FL1 in PR description: `waitForText` only awaits the first asserted item). Fixing the test driver / `waitForText` is the correct remedy; downgrading the assertion is not.
- **Recommendation:** Revert lines 97–98 of [src/corpus/ui/Corpus.integration.test.ts](src/corpus/ui/Corpus.integration.test.ts#L97) to the `appDriver.click('Divination')` + `await appDriver.waitForText('Divination Third Category')` form (note the missing `await` on `waitForText` in the original — add it on revert) and address the FL1 flake at the `AppDriver.waitForText` level (e.g., wait for the actually-asserted text). Re-run the suite to confirm console-clean.

### F17 — DRY: warning copy / pattern list duplication between `dateFieldWarnings.ts` and `DateFieldPatternsHelp.tsx` — INFO

- **Severity:** Info
- **Status:** Verified that the shared `dateFieldPatterns` constant is exported and reused (per F8 resolution). No change required; raised here only to lock the invariant for future edits — any new pattern must be added to the constant, not inlined in either consumer.

## Severity roll-up

| Severity | Count | IDs                                                                                                     |
| -------- | ----- | ------------------------------------------------------------------------------------------------------- |
| High     | 0     | —                                                                                                       |
| Medium   | 0     | —                                                                                                       |
| Low      | 0     | —                                                                                                       |
| Info     | 2     | F12, F17                                                                                                |
| Resolved | 14    | F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F13, **F14, F15, F16** (last three local — awaiting push) |

Console-noise findings on the latest local **full-suite** run after the F14/F15/F16 fixes: **none** (299 suites, 2972 tests pass, 2 skipped, zero failures, zero `console.error`/`console.warn`/unhandled-rejection output). `yarn lint` and `yarn tsc` both clean.

## Reproduction steps

1. Check out `date-fixes` at `5d37dad2`.
2. `git diff --name-only origin/master..HEAD | grep '^TASK-' || echo OK` → expects `OK` (verifies F1).
3. `curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/ElectronicBabylonianLiterature/ebl-frontend/pulls/714 | jq -r '.body' | wc -l` → non-zero (verifies F2).
4. `yarn lint && yarn tsc && CI=1 yarn test --no-coverage --watch=false src/chronology src/fragmentarium` → all clean, console-clean (verifies hard gates).
5. Open <https://qlty.sh/gh/ElectronicBabylonianLiterature/projects/ebl-frontend/issues/qlty/similar-code/issues/80e0f9d7fc93605a1941de9c856405ef> (and the three siblings) → "Open" (verifies F14).
6. In `src/fragmentarium/infrastructure/FragmentRepository.test.ts` search for `'updateDate'` → only one `TestData` row, populated payload (verifies F15).
7. In `src/corpus/ui/Corpus.integration.test.ts` line 97–99 → static `toHaveTextContent('Divination Third Category')`, no `appDriver.click('Divination')` (verifies F16).
8. Application-level acceptance:
   - Type `<136>` in the year field — expect Reconstructed-switch warning (BUG-3).
   - Save a date with king Nabonidus year 0, refresh — expect display "1.I.0 Nabonidus" and editor repopulating Nabonidus / 0 (BUG-5).
   - Save `16.VI².3 Cambyses` — expect modern date `28 August 527 BCE PJC` (BUG-4).
   - Click Delete on a date — spinner stops and the date clears (BUG-1).

## Recommendation

**Approve once the local F14/F15/F16 fixes are pushed and @Fabdulla1 re-reviews.** All earlier blockers (F1/F2) and review follow-ups (F3..F11, F13) are resolved on remote. The new blockers introduced by reviewer @Fabdulla1 (F15, F16) and the qlty `similar-code` regression (F14) are now resolved locally with hard gates green (lint clean, tsc clean, full suite 299/299 console-clean).

## What Has To Be Done

1. **(Done, F15)** Transport-layer test for `updateDate(fragmentId, undefined)` added in [src/fragmentarium/infrastructure/FragmentRepository.test.ts](src/fragmentarium/infrastructure/FragmentRepository.test.ts#L357); awaiting push and reviewer re-request.
2. **(Done, F16)** Restored `appDriver.click('Divination')` + `await appDriver.waitForText(/Divination Third Category/)` in [src/corpus/ui/Corpus.integration.test.ts](src/corpus/ui/Corpus.integration.test.ts#L97) (regex matcher needed because the label is rendered across multiple text nodes; the master form was both unawaited and the wrong matcher type — that was the FL1 root cause). Snapshot updated for `Without session` (auto-generated IDs only, no semantic change).
3. **(Done, F14)** Four `ca. …` blocks in [src/chronology/domain/Date.intercalary.test.ts](src/chronology/domain/Date.intercalary.test.ts#L129) collapsed into one parametrized `it.each(cases)` form; awaiting qlty re-scan to clear C10..C13.
4. **(Required, by maintainer)** Push the fixes (F14, F15, F16) and re-request review from @Fabdulla1. Do not self-dismiss the `CHANGES_REQUESTED` review.
5. **(Required, before merge)** Remove `TASK-714-review.md`, `TASK-714-todo.md`, and `TASK-714-log.md` from the branch (project guideline: "Before a PR is merged, check for these task TODO/log .md files and remind to remove them"). The `TASK-001-*` artifacts have already been removed in `5d37dad2`.
6. **(Optional, F12)** Open a follow-up issue tracking FL2 (`CuneiformFragment.test.tsx` "Calls `updateDate` with undefined on Date delete" race) and FL3 (`BibliographyEntryForm.test.tsx`) so they remain visible after this PR is merged. FL1 is now resolved (it was caused by an unawaited `waitForText` with a string matcher that could never match the multi-node label).
