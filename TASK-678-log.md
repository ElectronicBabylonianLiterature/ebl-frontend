# TASK-678 Work Log

## 2026-03-03

- Reviewed repository copilot instructions and constraints.
- Investigated regression: modal HTML exists but UI is not visible.
- Identified likely root cause: manual `.modal show` wrapper in `LemmaEditorModal` can remain hidden due to Bootstrap modal semantics after merge.
- Migrated `LemmaEditorModal` to controlled React-Bootstrap `Modal` with `show={true}` and explicit modal behavior flags.
- Removed conflicting `position: relative` from `.lemmatizer__editor` in `Lemmatizer.sass`.
- Updated `InitializeLemmatizer.test.tsx` to behavior assertions instead of container snapshot due modal rendering mechanics.
- Added modal visibility assertion in `LemmaEditorModal.test.tsx`.
- Removed obsolete snapshot file for `InitializeLemmatizer` test.
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer.test.tsx` passed (2 suites, 15 tests).
- Reminder before merge: remove `TASK-678-todo.md` and `TASK-678-log.md`.

## Follow-up Debugging (after merge feedback)

- Compared `LemmaEditorModal` and `Lemmatizer.sass` against `origin/master`.
- Confirmed regression source: wrapping editor in React-Bootstrap `Modal` moved panel out of the right-side layout flow and introduced full-screen modal interaction behavior that blocked token clicks.
- Restored master-style inline panel layout in `LemmaEditorModal` while keeping proper noun panel behavior.
- Restored editor positioning style and reset-button small size to match master proportions.
- Added regression test verifying token-wrapper click changes selected token header (`1: kur` -> `2: kur`).
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer.test.tsx` passed (2 suites, 16 tests).

## Proportion parity investigation

- Investigated DOM parity versus `origin/master` sample markup for editor proportions.
- Found root cause: `LemmaEditorModal` still used `Modal.Header` / `Modal.Body` / `Modal.Footer`, which apply Bootstrap modal spacing rules different from master's plain `div` + `p-3` wrappers.
- Replaced those wrappers with master-equivalent structure and class names while keeping proper noun panel logic unchanged.
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer.test.tsx` passed (2 suites, 16 tests).

## Test policy correction

- Restored snapshot assertion in `InitializeLemmatizer.test.tsx` and regenerated `__snapshots__/InitializeLemmatizer.test.tsx.snap`.
- Added explicit policy in `.github/copilot-instructions.md` to never remove/disable/comment out existing tests without detailed rationale and explicit user confirmation.
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx` passed (2 suites, 16 tests, 1 snapshot passed).

## API field alignment update

- Updated proper noun creation request body in `WordRepository` from `{ lemma, posTag }` to `{ lemma, pos }` to match backend schema validation.
- Aligned `WordService.createProperNoun` parameter naming from `posTag` to `pos` for consistency with backend naming.
- Updated `WordRepository` delegation test to expect `{ lemma: 'Shamash', pos: 'DN' }`.
- Added explicit API schema alignment rules to `.github/copilot-instructions.md`.

## API list-shape validation follow-up

- Addressed backend validation error `{"pos":["Not a valid list."]}` by changing proper noun creation payload from `pos: string` to `pos: [string]`.
- Updated `WordRepository` delegation test to expect `{ lemma: 'Shamash', pos: ['DN'] }`.

## Test typing cleanup

- Removed all explicit `as any` casts from `LemmaAnnotationButton.test.tsx` by introducing a typed `dirtyLemmas: LemmaOption[]` fixture.
- Replaced every `token.updateLemmas({ ... } as any)` call with `token.updateLemmas(dirtyLemmas)`.
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.test.tsx` passed (1 suite, 24 tests).

## onCreateProperNoun implementation

- Started implementing end-to-end proper noun creation integration for lemmatizer editor.
- Target behavior: on successful proper noun creation, update selected lemma in editor select and auto-save without manual Save click.
- Confirmed backend reference is `ebl-api` PR 676 (`Create proper nouns`) and request/response schema aligns with frontend `createProperNoun` contract (`lemma`, `pos` list, returns created word document).
- Implemented success callback chaining: `ProperNounCreationPanel` now emits created `Word` via `onCreated`, `LemmaEditorModal` forwards it via `onProperNounCreated`, and `LemmaAnnotation.onCreateProperNoun` handles selection + save.
- Implemented `LemmaAnnotation.onCreateProperNoun` to set active token lemmas to created value, confirm suggestion, and trigger `saveUpdates()` automatically.
- Synced select UI state after external token lemma updates in `LemmaAnnotationForm.componentDidUpdate` with deep-equality guard to avoid update loops.
- Updated tests:
  - `ProperNounCreationPanel.test.tsx`: verifies `onCreated` is called with created word.
  - `LemmaEditorModal.test.tsx`: updated mock callback surface for new prop.
  - `LemmaAnnotation.test.tsx`: verifies proper noun creation path auto-saves annotation payload.
- Verification: `CI=true yarn test --watch=false --silent src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx` passed (3 suites, 65 tests).
- Backend adjustment assessment: no mismatch detected against `ebl-api` PR 676 contract; no backend-copilot prompt file created.

## Null payload hardening + backend prompt follow-up

- Added defensive response validation in `ProperNounCreationPanel` to reject success responses that do not contain a valid word object with `_id`.
- Added guard in `LemmaAnnotation.onCreateProperNoun` to safely no-op when a created word is missing `_id`, preventing runtime `null._id` access.
- Added regression test in `ProperNounCreationPanel.test.tsx` verifying backend `null` payload shows an error, does not close the panel, and does not call `onCreated`.
- Created backend handoff prompt file: `TASK-678-backend-copilot-prompt.md` with concrete contract requirements for `POST /words/create-proper-noun` response shape and error behavior.
- Verification: `yarn lint` passed.
- Verification: `CI=true yarn test src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.test.tsx src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx` passed (2 suites, 54 tests). Test run emitted pre-existing React `act(...)` console warnings from async react-select behavior and one existing unmounted `setState` warning path in direct method invocation test, but no failures.
