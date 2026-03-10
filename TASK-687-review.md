# TASK-687 Review

## Summary

- PR: #678 `Add form to create proper nouns`
- Repository: `ElectronicBabylonianLiterature/ebl-frontend`
- PR state: `OPEN`
- Formal review outcome: `CHANGES_REQUESTED` (by `Fabdulla1`)
- Inline comments found: 4
- Unresolved comments: 3
- Resolved comments: 1

## Findings

1. Reviewer: `Fabdulla1`
   - File: `src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.tsx`
   - Status: `unresolved`
   - Comment:
     - The input is filtered and capitalized, but apparently not trimmed. Leading/trailing whitespace may bypass duplicate detection and be sent as-is in create requests.

2. Reviewer: `Fabdulla1`
   - File: `src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.tsx`
   - Status: `unresolved`
   - Comment:
     - `wordService.searchLemma(...)` seems to have no error handling. A rejected promise could cause an unhandled rejection and stale UI match state.

3. Reviewer: `qltysh`
   - File: `src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.tsx`
   - Status: `unresolved`
   - Comment:
     - Complex binary expression (`qlty:boolean-logic`) reported.

4. Reviewer: `qltysh`
   - File: `src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.tsx`
   - Status: `resolved`
   - Comment:
     - High function complexity warning (`qlty:function-complexity`) on `ProperNounCreationPanel`.

## Severity

- High: 2
  - Whitespace normalization bug risk (duplicate detection and request payload integrity)
  - Missing async error handling in search flow (unhandled rejection / stale UI state)
- Medium: 1
  - Boolean logic complexity warning (maintainability/readability and future bug risk)
- Low: 1 (already resolved)
  - Function complexity warning

## Reproduction Steps

1. Use the proper noun create panel in the fragment lemma annotation UI.
2. Enter values with leading/trailing whitespace and compare behavior against duplicate detection logic.
3. Force `wordService.searchLemma(...)` to reject (mock network error) and verify current UI state handling.
4. Review boolean conditions in `ProperNounCreationPanel` and identify simplification/refactor opportunities.

## Recommendation

- Must-do before approval:
  - Normalize candidate input with `.trim()` (and use the same normalized value consistently for duplicate checks and creation payloads).
  - Add robust rejection handling for `wordService.searchLemma(...)` (clear stale match state and expose a user-facing error or fallback state).
  - Address unresolved boolean-logic complexity warning from `qltysh` by simplifying conditions or extracting named predicates.
- Nice-to-have:
  - Keep the resolved function complexity improvement in place and add/adjust tests for the new normalization and error paths.

## What Has To Be Done

1. Fix input normalization consistency to prevent whitespace-based duplicates.
2. Add error handling for lemma search failures to keep UI state consistent.
3. Resolve the remaining `qlty:boolean-logic` warning in `ProperNounCreationPanel.tsx`.
4. Add or update tests that cover:
   - trimmed input behavior
   - duplicate detection with extra whitespace
   - rejected search request behavior and UI recovery
5. Push updates and request re-review from `Fabdulla1` once unresolved threads are addressed.
