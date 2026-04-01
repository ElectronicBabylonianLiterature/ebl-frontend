# TASK-683 Test Semantic Changes Audit (Actualized 2026-04-01)

This file reflects the **current** uncommitted state after restoring weakened/semantic-risky test changes and re-fixing warnings without reducing coverage intent.

## Scope used for this refresh

- Compared current files against `master` for the previously flagged high-risk set.
- Re-ran affected suites.
- Verified `yarn lint` and `yarn tsc` pass.

## Restored from previous weakening/semantic drift

1. `src/about/ui/about.test.tsx`

- Restored resolved markup fixture behavior (`markupDtoSerialized` retained; no never-resolving markup mock).
- Current delta is only async-settle waits (`Spinner` drain + `findBy*` where needed).
- Status: **Restored**.

2. `src/bibliography/ui/Bibliography.test.tsx`

- Restored default `bibliographyService.search` to resolving entries.
- Removed Markdown component mock bypass.
- Current deltas are timing waits and render helper stabilization only.
- Status: **Restored**.

3. `src/bibliography/ui/BibliographyEditor.test.tsx`

- Restored original click path semantics for "View button redirects" test intent.
- Added warning-safe wrapper (`TestMemoryRouter` future flags) and `act` around click.
- Status: **Restored** (with warning-safe harness changes).

4. `src/fragmentarium/ui/fragment/FragmentView.test.tsx`

- Restored `waitForSpinnerToBeRemoved(screen)` in loaded-fragment helper.
- Status: **Restored**.

5. `src/fragmentarium/ui/fragment/WordExport.test.ts`

- Removed prior `WordInfo` popover passthrough mock that weakened behavior coverage.
- Added narrow test-harness mocks for `react-bootstrap` `OverlayTrigger` and `react-router-dom` `MemoryRouter`/`Link` to prevent SSR `useLayoutEffect` noise during `renderToString` path.
- Export assertion remains unchanged (`outputType` -> `Document`).
- Status: **Restored from weakening**, with **neutral harness adaptation**.

6. `src/fragmentarium/ui/search/SearchFormDossier.test.tsx`

- Restored default `mockSearchSuggestions.mockResolvedValue([])` behavior.
- Restored clear test flow based on `value="D001"` initial state (no forced full re-selection setup).
- Status: **Restored**.

7. `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`

- Restored original transliteration change semantics and expectation (`newTransliteration` replacement value assertion).
- Kept deprecation-safe `act` import from `react` and wrapped submit action in `act`.
- Status: **Restored**, with warning-safe `act` usage.

## Current intentional semantic deviations (non-weakening)

1. `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx`

- Still differs from `master` in two intentional ways to remove persistent warnings:
  - Default `searchLemma` is set to never-resolving in `beforeEach`, while tests that assert suggestion application explicitly override to resolving values.
  - Proper noun creation test calls `onCreateProperNoun` through a mounted ref + `act` (instead of invoking on an unmounted class instance).
- Rationale:
  - Prevents async-select background state updates from generating `act(...)` warning noise.
  - Avoids "setState on component not yet mounted" warning.
- Impact assessment:
  - No reduction in asserted outcomes for apply/save/autofill paths.
  - Proper noun case is now closer to real runtime behavior (mounted component instance).
- Status: **Semantically different from master, not weaker**.

## Neutral warning/timing harness updates (expected)

1. `src/about/ui/about.test.tsx`

- Added explicit spinner-settle waits after render in helper and select tests.
- Converted some synchronous lookups to async lookups where rendering is async.

2. `src/bibliography/ui/Bibliography.test.tsx`

- `renderBibliography` became async helper with optional query wait for logged-in vs logged-out flows.

3. `src/bibliography/ui/BibliographyEditor.test.tsx`

- Added local `TestMemoryRouter` with v7 future flags via `Object.fromEntries`.
- Wrapped click in `act` + microtask flush.

4. `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`

- Type annotations in local editor mock.
- `act` import moved to `react`.

5. `src/fragmentarium/ui/fragment/WordExport.test.ts`

- Narrow framework-level test mocks (router/bootstrap internals) only.

## Validation snapshot

- Affected suites command passed:
  - `src/about/ui/about.test.tsx`
  - `src/bibliography/ui/Bibliography.test.tsx`
  - `src/bibliography/ui/BibliographyEditor.test.tsx`
  - `src/fragmentarium/ui/fragment/FragmentView.test.tsx`
  - `src/fragmentarium/ui/fragment/WordExport.test.ts`
  - `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx`
  - `src/fragmentarium/ui/search/SearchFormDossier.test.tsx`
  - `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`
  - `src/fragmentarium/ui/front-page/Fragmentarium.test.tsx`

- `yarn lint`: pass
- `yarn tsc`: pass

## Net status

- Previously flagged **weakened/semantic-risk changes were restored**.
- Remaining differences are deliberate warning-control/test-harness updates.
- Only one file remains semantically different from `master` by design: `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx`.
