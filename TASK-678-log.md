# TASK-678 Work Log

## 2026-03-11

### Request

Proceed from investigation to implementation for the proper noun menu visibility issue.

### Implementation

1. Fixed visibility gate in `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.tsx`:
   - Changed proper noun menu item condition from:
     - `token.isDirty && canCreateProperNouns`
   - To:
     - `canCreateProperNouns`

2. Updated tests in `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.test.tsx`:
   - Added/updated expectations to ensure menu item is visible when token is not dirty.
   - Kept dirty and non-dirty coverage.
   - Preserved permission-denied coverage.
   - Updated create/hover interaction tests to not depend on dirty state for visibility.

### Validation

- Focused test:
  - `CI=true yarn test --watch=false --runTestsByPath src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.test.tsx`
  - Result: pass (25/25).

- Focused regression suite:
  - `CI=true yarn test --watch=false --runTestsByPath src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.test.tsx`
  - Result: pass (95/95, 4 suites).
  - Note: pre-existing `act(...)` and `setState on not yet mounted` console warnings are still emitted by existing test paths, but there are no failures.

- Lint:
  - `yarn lint`
  - Result: pass.

- TypeScript:
  - `yarn tsc`
  - Result: pass.

### Additional Required Fix for Lint Gate

- Addressed unrelated existing lint blocker in `src/akkadian/ui/akkadianWordAnalysis.tsx`:
  - Changed `catch (error)` to `catch` to remove unused variable error.

### Reminder

Before merge, remove:

- `TASK-678-todo.md`
- `TASK-678-log.md`

---

## 2026-03-11 Correction Pass

### Issue

Previous fix was too broad: `canCreateProperNouns` alone caused the menu item to
appear for any selected token regardless of lemma state, including tokens that
are already annotated and unchanged.

### Corrected Rule

Show "Create a new proper noun" when:

- user has permission (`canCreateProperNouns`), AND
- token is **dirty** (has local edits), OR token is **empty** (no current lemmas)

Hide for annotated clean tokens: token has existing lemmas and has not been
modified.

### Implementation

- `LemmaAnnotationButton.tsx`: changed condition from `canCreateProperNouns` to
  `canCreateProperNouns && (token.isDirty || token.lemmas.length === 0)`.
- `LemmaAnnotationButton.test.tsx`:
  - Renamed "when user has scope" → "for empty unannotated token with scope" (clarifes it is specifically the empty case)
  - Renamed "when token is not dirty" → "for empty token (not dirty)"
  - Added new test: `does not display "Create a new proper noun" menu item for annotated clean token`
  - Ran prettier auto-fix (`yarn eslint --fix`) to correct indentation on multiline `&&` condition.

### Validation

- Focused test (26/26 pass).
- `yarn lint` pass.
- `yarn tsc` pass.
