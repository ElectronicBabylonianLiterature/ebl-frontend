# TASK-683 Test Issues Summary (Rerun 2)

## Source

- Command executed:
  - `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=25% --watch=false`
- Output log:
  - `TASK-683-test-output-rerun-2026-03-10-2.txt`

## Run Outcome

- Status: **Failed to complete**
- Terminal tail:
  - `The build failed because the process exited too early.`
  - `error Command failed with exit code 1.`
- Note: the Jest end summary (`Test Suites`, `Tests`, `Snapshots`) is not present in this log because the run terminated early.
- Revert note: attempted mitigation commit `a141e29e` was reverted by `576377ac` because termination behavior remained.

## Warning/Issue Summary

| ID  | Warning / Issue Type                                                    | Count | Primary Evidence                                                                         | Severity | Notes                                                                                     |
| --- | ----------------------------------------------------------------------- | ----: | ---------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| R1  | React-Bootstrap `controlId` ignored on `FormLabel` with `htmlFor`       |    88 | `Warning: \`controlId\` is ignored on \`<FormLabel>\` when \`htmlFor\` is specified.`    | Medium   | Repeated heavily in `src/dictionary/ui/editor/WordEditor.test.tsx` run section            |
| R2  | React-Bootstrap `controlId` ignored on `FormControl` with explicit `id` |    88 | `Warning: \`controlId\` is ignored on \`<FormControl>\` when \`id\` is specified.`       | Medium   | Repeated heavily in `src/dictionary/ui/editor/WordEditor.test.tsx` run section            |
| R3  | React state updates not wrapped in `act(...)`                           |    17 | `Warning: An update to ... inside a test was not wrapped in act(...).`                   | Medium   | Seen for `Select`, `Overlay`, `DateSelection`, `ForwardRef`, `MenuPlacer`, `DropdownMenu` |
| R4  | React Router v7 future-flag warnings                                    |     2 | `React Router Future Flag Warning ... v7_startTransition` and `... v7_relativeSplatPath` | Low      | Observed in `src/dictionary/ui/search/WordSearchForm.test.tsx` section                    |
| R5  | Invalid DOM nesting warning                                             |     2 | `validateDOMNesting(...): <figcaption>/<figure> cannot appear as a descendant of <p>.`   | Medium   | Seen during `src/App.test.ts` via `src/common/ui/AppContent.tsx`                          |
| R6  | Early process termination                                               |     1 | `The build failed because the process exited too early.`                                 | High     | Prevents reliable full-suite completion in this run                                       |

## Affected Test Sections Observed In Log

- `src/App.test.ts`
- `src/chronology/ui/DateEditor/DateSelectionInput.test.tsx`
- `src/corpus/ui/alignment/ChapterAligner.test.tsx`
- `src/dictionary/ui/editor/WordEditor.test.tsx`
- `src/dictionary/ui/search/WordSearchForm.test.tsx`
- `src/corpus/ui/Download.test.tsx`

## Comparison Note vs Previous TASK-683 Detail Document

- Previous focused recheck had indicated older warning classes (`Spinner defaultProps`, broad router warnings, dossiers fallback warning) were resolved.
- This rerun surfaces **different active warning noise**, primarily:
  - React-Bootstrap `controlId` usage warnings,
  - `act(...)` wrapping warnings,
  - DOM nesting warnings,
  - plus a process-level early exit failure.

## Recommended Next Steps

1. Stabilize the test process termination first (rerun in fresh container/runner, inspect memory/process kill events).
2. Fix `controlId` warning sources in the forms rendered by `WordEditor` tests:
   - avoid combining `controlId` with explicit `htmlFor` / explicit `id` on child controls.
3. Address `act(...)` warnings in the listed tests by wrapping async UI updates or using helpers that flush updates.
4. Fix invalid nesting in about/app content (`figure`/`figcaption` currently rendered under paragraph context).
5. Re-run full suite after termination stabilization and regenerate this summary from a successful complete run.
