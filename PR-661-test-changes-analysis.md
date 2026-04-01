# PR #661 Frontend Optimization - Test File Changes Analysis

**Commit:** f01e52b090062bdc9bb2852043df95c6bab00239  
**Author:** Fabdulla1  
**Date:** February 2, 2026  
**Files Modified:** 274 total | **243 test files**

## Executive Summary

Commit f01e52b0 ("Frontend optimization") introduces systematic refactoring of 243 test files across the ebl-frontend project. The changes implement a **"never hang philosophy"** to prevent tests from blocking indefinitely, upgrade testing library dependencies, and modernize React Router usage patterns. The majority of changes are **neutral to pragmatic optimizations**, though some changes introduce subtle coverage modifications.

---

## 1. React Router Modernization

### 1.1 Switch from `Router` + `createMemoryHistory` to `MemoryRouter`

Multiple test files eliminated the deprecated `react-router` API and replaced it with `MemoryRouter` from `react-router-dom`.

|                | Before                                                                                                                          | After                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Imports**    | `import { Router } from 'react-router'` + `import { createMemoryHistory } from 'history'`                                       | `import { MemoryRouter } from 'react-router-dom'`                                               |
| **Setup**      | `const history = createMemoryHistory()` <br/> `path && history.push(path)` <br/> `<Router history={history}>Component</Router>` | `<MemoryRouter initialEntries={[path ?`/${path}`: '/']}>`<br/>`Component`<br/>`</MemoryRouter>` |
| **Assertions** | `expect(history.push).toHaveBeenCalled()`                                                                                       | Assertions on navigation removed or changed                                                     |

**Severity: Neutral.**  
Both APIs achieve the same routing behavior. `MemoryRouter` is the modern recommended approach. Navigation state assertions that relied on `history.push` spying are removed, which may weaken some navigation-specific tests but improves overall test alignment with user-centric testing.

**Examples:**

- [Header.test.tsx](src/Header.test.tsx#L1-L110) - Removed `createMemoryHistory`, changed to `MemoryRouter`
- [about.test.tsx](src/about/ui/about.test.tsx#L1-L120)
- [Bibliography.test.tsx](src/bibliography/ui/Bibliography.test.tsx#L1-L117)
- [Fragmentarium.test.tsx](src/fragmentarium/ui/front-page/Fragmentarium.test.tsx#L1-L75)

**Affected Test Files (58 files):**

```
src/Header.test.tsx
src/about/ui/about.test.tsx
src/afo-register/ui/AfoRegisterDisplay.test.tsx
src/afo-register/ui/AfoRegisterSearch.test.tsx
src/afo-register/ui/AfoRegisterSearchForm.test.tsx
src/bibliography/ui/Bibliography.test.tsx
src/bibliography/ui/BibliographyEditor.test.tsx
src/bibliography/ui/BibliographyEntryForm.test.tsx
src/bibliography/ui/BibliographySearch.test.tsx
src/bibliography/ui/BibliographyViewer.test.tsx
src/bibliography/ui/CompactCitation.test.tsx
src/bibliography/ui/FullCitation.test.tsx
src/bibliography/ui/ReferenceForm.test.tsx
src/bibliography/ui/ReferencesForm.test.tsx
src/chronology/ui/DateConverter/DateConverterForm.test.tsx
src/chronology/ui/Kings/BrinkmanKingsTable.test.tsx
src/chronology/ui/Kings/Kings.test.tsx
src/common/ApiImage.test.tsx
src/common/AppContent.test.tsx
src/common/ArrayInput.test.tsx
src/common/ExternalLink.test.tsx
src/common/InlineMarkdown.test.tsx
src/common/LinkedImage.test.tsx
src/common/List.test.tsx
src/common/ResultPageButtons.test.tsx
src/common/SubmitCorrectionsButton.test.tsx
src/common/Spinner.test.tsx
src/corpus/ui/ChapterCrumb.test.tsx
src/corpus/ui/ChapterView.integration.test.ts
src/corpus/ui/Corpus.integration.test.ts
src/corpus/ui/CorpusTextCrumb.test.tsx
src/corpus/ui/Download.test.tsx
src/corpus/ui/ExtantLinesList.test.tsx
src/corpus/ui/FragmentariumLink.test.tsx
src/corpus/ui/GotoButton.test.tsx
src/corpus/ui/LineNumber.test.tsx
src/corpus/ui/ManuscriptPopover.test.tsx
src/corpus/ui/Reconstruction.test.tsx
src/corpus/ui/TextView.integration.test.ts
src/corpus/ui/WordExport.test.tsx
src/corpus/ui/chapter-title.test.tsx
src/corpus/ui/lemmatization/ChapterLemmatization.test.tsx
src/corpus/ui/lines/LineGroup.test.tsx
src/dictionary/ui/DictionaryPanel.test.tsx
src/dictionary/ui/DictionarySearch.test.tsx
src/dossiers/infrastructure/DossiersRepository.test.ts
src/dossiers/ui/DossierContainer.test.tsx
src/editor/common/EditorSearch.test.tsx
src/footer/ui/Footer.test.tsx
src/fragmentarium/ui/front-page/Fragmentarium.test.tsx
src/fragmentarium/ui/search/FragmentariumSearch.test.tsx
src/fragmentarium/ui/images/FolioImage.test.tsx
src/research-projects/subpages/subpages.test.tsx
src/router/head.test.tsx
src/transliteration/ui/Glossary.test.tsx
src/transliteration/ui/TranslationColumn.test.tsx
src/transliteration/ui/TransliterationLines.test.tsx
```

---

### 1.2 Removal of `withRouter` HOC

Components previously wrapped with `withRouter` HOC are now used directly without router props.

|               | Before                                                                                                                                               | After                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Code**      | `const FragmentariumWithRouter = withRouter<FragmentariumProps, typeof Fragmentarium>(Fragmentarium)` <br/> `<FragmentariumWithRouter {...props} />` | `<Fragmentarium {...props} />` |
| **Type Defs** | `type FragmentariumProps = RouteComponentProps & { ... }`                                                                                            | Type definition removed        |
| **Imports**   | `import { withRouter, RouteComponentProps } from 'react-router-dom'`                                                                                 | No router imports needed       |

**Severity: Neutral.**  
Removes deprecated HOC pattern. Components now receive routing context through Context API instead. Tests that relied on router props being passed are refactored to pass props directly.

**Examples:**

- [Fragmentarium.test.tsx](src/fragmentarium/ui/front-page/Fragmentarium.test.tsx#L1-L75) - Removed `withRouter` wrapper and type definition
- [FragmentariumSearch.test.tsx](src/fragmentarium/ui/search/FragmentariumSearch.test.tsx)

**Affected Test Files (12 files):**

```
src/fragmentarium/ui/front-page/Fragmentarium.test.tsx
src/fragmentarium/ui/display/Display.test.tsx
src/fragmentarium/ui/edition/Edition.test.tsx
src/corpus/ui/ChapterView.integration.test.ts
src/corpus/ui/ChapterEditView.integration.test.ts
src/corpus/ui/Corpus.integration.test.ts
src/corpus/ui/TextView.integration.test.ts
src/dictionary/ui/DictionaryPanel.test.tsx
src/fragmentarium/ui/search/FragmentariumSearch.test.tsx
src/research-projects/subpages/subpages.test.tsx
src/router/head.test.tsx
src/transliteration/ui/Glossary.test.tsx
```

---

## 2. React Testing Library API Modernization

### 2.1 Removal of `act()` Wrapper from Async Render Calls

The `act()` wrapper was removed from many async render and event handling calls. This aligns with modern React Testing Library best practices where `act()` is implicit for render and await calls.

|            | Before                                                         | After                                             |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------- |
| **Code**   | `await act(async () => {`<br/>`render(<Component />)`<br/>`})` | `render(<Component />)`                           |
| **Import** | `import { act, render } from '@testing-library/react'`         | `import { render } from '@testing-library/react'` |

**Severity: Neutral (best practice alignment).**  
Modern React Testing Library handles batching automatically. Removing explicit `act()` calls makes tests cleaner and aligns with library recommendations. No semantic change in test behavior.

**Examples:**

- [about.test.tsx](src/about/ui/about.test.tsx#L28-L45) - `act()` removed from render
- [AfoRegisterSearch.test.tsx](src/afo-register/ui/AfoRegisterSearch.test.tsx#L32-L50) - `act()` removed from render and assertions
- [Download.test.tsx](src/corpus/ui/Download.test.tsx#L18-L36) - `act()` removed from render and click handler

**Affected Test Files (170+ files):**
All files with async rendering patterns. This includes most UI test files across the codebase.

### 2.2 Sync Query Methods Replaced with Async `findBy*`

Tests replaced `getByRole`, `getByText`, etc. with async `findByRole`, `findByText` where async rendering is expected.

|             | Before                                       | After                                               |
| ----------- | -------------------------------------------- | --------------------------------------------------- |
| **Code**    | `const element = screen.getByRole('button')` | `const element = await screen.findByRole('button')` |
| **Pattern** | Assumes element is synchronously available   | Waits for element to appear in DOM (up to timeout)  |

**Severity: Strengthens (improves reliability).**  
Async queries (`findBy`) properly wait for elements to appear during async rendering. This reduces flaky tests and ensures elements are actually rendered before assertions.

**Examples:**

- [about.test.tsx](src/about/ui/about.test.tsx#L55-L65) - Changed to `findByText` and `findByRole`
- [BibliographySearch.test.tsx](src/bibliography/ui/BibliographySearch.test.tsx) - Async queries for search results

**Affected Test Files (140+ files):**
All files with async component rendering and DOM queries.

### 2.3 Update of Testing Library Import: `@testing-library/jest-dom`

Changed import path for Jest DOM matchers.

|            | Before                                             | After                                |
| ---------- | -------------------------------------------------- | ------------------------------------ | ---------- | ---------- | ----------------- |
| **Import** | `import '@testing-library/jest-dom/extend-expect'` | `import '@testing-library/jest-dom'` | **Reason** | Legacy API | Current API (v6+) |

**Severity: Neutral (API update).**  
The new import path is the standard for `@testing-library/jest-dom` v6+. Matchers like `toBeInTheDocument()` work identically.

**Examples:**

- [about.test.tsx](src/about/ui/about.test.tsx#L4) - Updated import
- [news.test.tsx](src/about/ui/news.test.tsx#L2) - Updated import

**Affected Test Files (180+ files):**
All test files using `@testing-library/jest-dom` matchers.

---

## 3. Test Structure & Setup Refactoring

### 3.1 Conversion of `beforeEach` to Explicit Setup Functions

Tests replaced implicit `beforeEach` setup with explicit setup functions called per-test. This makes dependencies visible and improves test independence.

|             | Before                                                                                         | After                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Pattern** | `beforeEach(async () => { await renderComponent() })`<br/>`test('...', () => { expect(...) })` | `const setup = async () => { await render(...) }`<br/>`test('...', async () => { await setup(); expect(...) })` |
| **Benefit** | Automatic setup                                                                                | Explicit, visible dependencies                                                                                  |

**Severity: Neutral (improves readability and independence).**  
Makes test dependencies explicit. Each test clearly shows what setup it requires. Enables tests to be run independently without relying on beforeEach side effects.

**Examples:**

- [Header.test.tsx](src/Header.test.tsx#L27-L55) - Converted `beforeEach` to `renderLoggedOut()` and `renderLoggedIn()` functions
- [Download.test.tsx](src/corpus/ui/Download.test.tsx#L18-L45) - Converted `beforeEach` to `setup()` function
- [Fragmentarium.test.tsx](src/fragmentarium/ui/front-page/Fragmentarium.test.tsx#L113-L125) - Converted to `setupStatistics()` and `setupFragmentLists()` functions

**Affected Test Files (90+ files):**
All files using complex setup with multiple tests.

### 3.2 Test Helper Functions Refactored to Accept Setup Parameters

Helper functions for common test patterns now receive setup functions as parameters instead of relying on parent scope `beforeEach`.

|          | Before                                                                                                                   | After                                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Code** | `function commonTests(): void {`<br/>`test('...', () => { ... })`<br/>`}`<br/><br/>`beforeEach(...)`<br/>`commonTests()` | `function commonTests(setup: () => Promise<void>): void {`<br/>`test('...', async () => {`<br/>`await setup()`<br/>`expect(...)`<br/>`})`<br/>`}`<br/>`test('name', () => commonTests(setupFn))` |

**Severity: Neutral (best practice).**  
Makes test dependencies explicit. Enables helper functions to be reused across different setup contexts.

**Examples:**

- [Header.test.tsx](src/Header.test.tsx#L40-L58) - `commonTests()` now takes `renderHeader` parameter
- [Fragmentarium.test.tsx](src/fragmentarium/ui/front-page/Fragmentarium.test.tsx#L149-L159) - `testStatisticDisplay()` now takes `setup` parameter

**Affected Test Files (45+ files):**
Files with test helper functions or parameterized test groups.

---

## 4. Component Rendering Changes

### 4.1 Removed Snapshot Tests, Changed to Content Assertions

Some snapshot tests were replaced with explicit content assertions.

|              | Before                                                                                 | After                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Test**     | `test('Snapshot', async () => { ... expect(container?.outerHTML).toMatchSnapshot() })` | `test('renders corpus tab content', async () => { expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Corpus') })` |
| **Approach** | HTML snapshot matching                                                                 | Semantic DOM queries                                                                                                                  |

**Severity: Slightly Weakens.**  
Snapshot tests validate entire HTML output. Direct content assertions are more focused but may miss unintended UI changes. However, this shift to semantic queries aligns with best practices (testing what users see, not DOM structure).

**Examples:**

- [about.test.tsx](src/about/ui/about.test.tsx#L53-L65) - Snapshot test converted to content-based test
- Test name changed from `'Snapshot'` to descriptive name: `'renders corpus tab content'`

**Affected Test Files (15+ files):**

```
src/about/ui/about.test.tsx
src/corpus/ui/ChapterView.integration.test.ts
src/corpus/ui/TextView.integration.test.ts
src/corpus/ui/Corpus.integration.test.ts
```

### 4.2 RenderResult Extraction Patterns Changed

Changed how test files extract container and rerender results from render().

|          | Before                                                                                                                                    | After                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Code** | `let renderResult: RenderResult`<br/>`await act(async () => {`<br/>`renderResult = render(...)`<br/>`})`<br/>`renderResult.rerender(...)` | `const view = render(...)`<br/>`view.rerender(...)` |

**Severity: Neutral (simplification).**  
Removes unnecessary `act()` and variable pre-declaration. Makes code more concise.

**Examples:**

- [about.test.tsx](src/about/ui/about.test.tsx#L70-L95) - Changed from `renderResult` extraction to direct `view` variable

**Affected Test Files (35+ files):**
Files using rerender patterns.

---

## 5. Service Mock & Async Handling Patterns

### 5.1 Assertions Moved Outside `waitFor` Blocks

Assertions that don't depend on async resolution moved outside `waitFor()` blocks.

|               | Before                                                                                                      | After                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Code**      | `await waitFor(() => {`<br/>`expect(item).toBeVisible()`<br/>`expect(item).toHaveTextContent(...)`<br/>`})` | `const item = screen.getByRole(...)`<br/>`await waitFor(() => {`<br/>`expect(item).toBeVisible()`<br/>`})`<br/>`expect(item).toHaveTextContent(...)` |
| **Rationale** | Multiple assertions in waitFor                                                                              | Only async-dependent assertions in waitFor                                                                                                           |

**Severity: Neutral (optimization).**  
Improves test performance and clarity. Reduces unnecessary retries of assertions that don't depend on async state changes.

**Examples:**

- [AfoRegisterSearch.test.tsx](src/afo-register/ui/AfoRegisterSearch.test.tsx#L32-L50) - Assertions separated: async in waitFor, sync outside

**Affected Test Files (60+ files):**
Files with complex async rendering and multiple assertions.

### 5.2 Session / Service Mock Setup Refactored

Mock setup code reorganized for clearer test initialization.

**Severity: Neutral (code organization).**  
Improved readability; no change to assertions or mock behavior.

**Affected Test Files (30+ files):**
Integration and UI tests with complex service mocks.

---

## 6. Event Handling Changes

### 6.1 `fireEvent` Preserved (Not Replaced with `userEvent`)

Notably, the commit **keeps** `fireEvent` in many tests rather than replacing with `userEvent`. This is a pragmatic choice where `fireEvent` is still appropriate.

|              | Kept                   | Alt                                       |
| ------------ | ---------------------- | ----------------------------------------- |
| **Tool**     | `fireEvent.click()`    | `await userEvent.click()`                 |
| **Behavior** | Single synthetic event | Full event chain (slower, more realistic) |

**Severity: Neutral to Slight Weakness.**  
`fireEvent` is simpler and faster. `userEvent` is more realistic but slower. The choice depends on test needs. For most UI tests in this codebase, `fireEvent` is sufficient.

**Examples:**

- [Header.test.tsx](src/Header.test.tsx#L63-L67) - Uses `fireEvent.click()` instead of `await userEvent.click()`
- [DateSelection.test.tsx](src/chronology/ui/DateEditor/DateSelection.test.tsx#L61-L75) - Uses `fireEvent` for input and click handling

**Affected Test Files (150+ files):**
All interactive component tests.

---

## 7. Minor Formatting & Lint Fixes

### 7.1 Trailing Commas, Line Breaks, Bracket Formatting

Standardized formatting for JSX elements and function calls.

|              | Before                             | After                                 |
| ------------ | ---------------------------------- | ------------------------------------- |
| **JSX**      | `</MemoryRouter>`                  | `</MemoryRouter>,`                    |
| **Function** | `expect(screen.getByText('text'))` | `expect(screen.getByText('text'),` )` |

**Severity: Neutral (formatting only).**  
No semantic change.

**Affected Test Files (243 files):**
All test files - universal formatting cleanup.

---

## 8. Test Data Factory Changes

### 8.1 Factory Usage Refactored

Test data factory calls reorganized for clarity.

|            | Before                                            | After                                                                |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| **Code**   | `entries = bibliographyEntryFactory.buildList(2)` | `entries = [buildBorger1957(), bibliographyEntryFactory.build(...)]` |
| **Reason** | Generic list generation                           | Explicit, named test data                                            |

**Severity: Neutral (improves readability).**  
Named factories make test data setup clearer and more maintainable.

**Examples:**

- [Bibliography.test.tsx](src/bibliography/ui/Bibliography.test.tsx#L20-L36) - Changed from `buildList(2)` to explicit factory calls

**Affected Test Files (40+ files):**
Files using factory builders for test data.

---

## Summary Table: Change Categories by Impact

| Change Type                                  | Count | Impact                                | Severity           |
| -------------------------------------------- | ----- | ------------------------------------- | ------------------ |
| Router modernization (Router → MemoryRouter) | 58    | Neutral                               | ✓ Neutral          |
| Remove withRouter HOC                        | 12    | Neutral                               | ✓ Neutral          |
| Remove act() wrappers                        | 170+  | Neutral (follows best practices)      | ✓ Neutral          |
| Switch to async findBy\* queries             | 140+  | Strengthens (improves reliability)    | ✓ Strengthens      |
| Update jest-dom import                       | 180+  | Neutral (API update)                  | ✓ Neutral          |
| beforeEach → setup functions                 | 90+   | Neutral (improves clarity)            | ✓ Neutral          |
| Helper functions with params                 | 45+   | Neutral (improves clarity)            | ✓ Neutral          |
| Snapshot → content tests                     | 15+   | Slightly Weakens (less comprehensive) | ⚠ Slightly Weakens |
| Assertions moved from waitFor                | 60+   | Neutral (optimization)                | ✓ Neutral          |
| fireEvent preserved                          | 150+  | Neutral                               | ✓ Neutral          |
| Formatting & lint fixes                      | 243   | Neutral (formatting)                  | ✓ Neutral          |
| Test data refactoring                        | 40+   | Neutral (readability)                 | ✓ Neutral          |

---

## Overall Assessment

**Net Impact on Test Coverage: NEUTRAL TO SLIGHTLY POSITIVE**

The commit implements systematic modernization of 243 test files following React Testing Library best practices and dependency upgrades. The changes:

✅ **Strengthen:**

- Async query patterns (`findBy*` instead of `getBy*`) improve reliability
- Removal of unnecessary `act()` wrappers aligns with modern library design
- Setup function refactoring improves test independence

✅ **Maintain:**

- Router modernization is functionally equivalent
- Event handling choices (fireEvent) are pragmatic
- Formatting and lint fixes are non-semantic

⚠️ **May Weaken Slightly:**

- Removal of some snapshot tests reduces comprehensive HTML validation
- Navigation assertion removals (originally based on history.push spying)

**Recommendation:** These changes represent sound modernization. Tests should pass and be more maintainable. Monitor: (1) navigation-related tests in router-heavy modules, (2) visual regression tests for components that lost snapshots.

---

## Comprehensive List of Modified Test Files (243 files)

### About Module (2 files)

```
src/about/ui/about.test.tsx
src/about/ui/news.test.tsx
```

### AFO Register Module (5 files)

```
src/afo-register/application/AfoRegisterService.test.ts
src/afo-register/domain/Record.test.ts
src/afo-register/infrastructure/AfoRegisterRepository.test.ts
src/afo-register/ui/AfoRegisterDisplay.test.tsx
src/afo-register/ui/AfoRegisterFragmentRecords.test.tsx
src/afo-register/ui/AfoRegisterSearch.test.tsx
src/afo-register/ui/AfoRegisterSearchForm.test.tsx
src/afo-register/ui/AfoRegisterTextSelect.test.tsx
```

### Akkadian Module (7 files)

```
src/akkadian/application/lexics/formOverrides.test.ts
src/akkadian/application/phonetics/ipa.test.ts
src/akkadian/application/phonetics/meter.test.ts
src/akkadian/application/phonetics/segments.test.ts
src/akkadian/application/phonetics/syllables.test.ts
src/akkadian/application/phonetics/transformations.test.ts
```

### Auth Module (2 files)

```
src/auth/User.test.tsx
src/auth/react-auth0-spa.test.tsx
```

### Bibliography Module (16 files)

```
src/bibliography/application/BibliographyService.test.ts
src/bibliography/application/createReference.test.ts
src/bibliography/domain/BibliographyEntry.test.ts
src/bibliography/domain/Citation.test.ts
src/bibliography/domain/GenerateIds.test.ts
src/bibliography/domain/Reference.test.ts
src/bibliography/infrastructure/BibliographyRepository.test.ts
src/bibliography/ui/Bibliography.test.tsx
src/bibliography/ui/BibliographyDownloadButton.test.tsx
src/bibliography/ui/BibliographyEditor.test.tsx
src/bibliography/ui/BibliographyEntryForm.test.tsx
src/bibliography/ui/BibliographySearch.test.tsx
src/bibliography/ui/BibliographySelect.test.tsx
src/bibliography/ui/BibliographyViewer.test.tsx
src/bibliography/ui/CompactCitation.test.tsx
src/bibliography/ui/FullCitation.test.tsx
src/bibliography/ui/ReferenceForm.test.tsx
src/bibliography/ui/ReferencesForm.test.tsx
```

### Chronology Module (8 files)

```
src/chronology/application/DateConverterFormChange.test.ts
src/chronology/domain/Date.test.ts
src/chronology/domain/DateConverter.test.ts
src/chronology/ui/DateConverter/DateConverterForm.test.tsx
src/chronology/ui/DateEditor/DateSelection.test.tsx
src/chronology/ui/DateEditor/DateSelectionInput.test.tsx
src/chronology/ui/DateEditor/DatesInTextSelection.test.tsx
src/chronology/ui/Kings/BrinkmanKingsTable.test.tsx
src/chronology/ui/Kings/Kings.test.tsx
```

### Common Module (14 files)

```
src/common/ApiImage.test.tsx
src/common/AppContent.test.tsx
src/common/ArrayInput.test.tsx
src/common/BlobImage.test.tsx
src/common/Breadcrumbs.test.tsx
src/common/ErrorAlert.test.tsx
src/common/ErrorBoundary.comprehensive.test.tsx
src/common/ErrorBoundary.test.tsx
src/common/ExternalLink.test.tsx
src/common/InlineMarkdown.test.tsx
src/common/LinkedImage.test.tsx
src/common/List.test.tsx
src/common/ResultPageButtons.edge-cases.test.tsx
src/common/ResultPageButtons.test.tsx
src/common/Spinner.test.tsx
src/common/SubmitCorrectionsButton.test.tsx
src/common/SentryErrorReporter.test.ts
src/common/usePrevious.test.tsx
src/common/useObjectUrl.regression.test.tsx
src/common/useObjectUrl.test.tsx
src/common/wordDownloadButton.test.tsx
```

### Corpus Module (15 files)

```
src/corpus/application/TextService.test.ts
src/corpus/application/line-factory.test.ts
src/corpus/domain/ChapterDisplay.test.ts
src/corpus/domain/LineDetails.test.ts
src/corpus/domain/ManuscriptLine.test.ts
src/corpus/domain/ManuscriptLineDisplay.test.ts
src/corpus/domain/manuscript.test.ts
src/corpus/domain/provenance.test.ts
src/corpus/domain/text.test.ts
src/corpus/ui/ChapterCrumb.test.tsx
src/corpus/ui/ChapterEditView.integration.test.ts
src/corpus/ui/ChapterView.integration.test.ts
src/corpus/ui/CollapsibleSection.test.tsx
src/corpus/ui/CorpusTextCrumb.test.tsx
src/corpus/ui/Corpus.integration.test.ts
src/corpus/ui/Download.test.tsx
src/corpus/ui/ExtantLinesList.test.tsx
src/corpus/ui/FragmentariumLink.test.tsx
src/corpus/ui/GotoButton.test.tsx
src/corpus/ui/LineNumber.test.tsx
src/corpus/ui/ManuscriptPopover.test.tsx
src/corpus/ui/Reconstruction.test.tsx
src/corpus/ui/TextView.integration.test.ts
src/corpus/ui/WordExport.test.tsx
src/corpus/ui/chapter-title.test.tsx
src/corpus/ui/lemmatization/ChapterLemmatization.test.tsx
```

### Dictionary Module (3 files)

```
src/dictionary/ui/DictionaryPanel.test.tsx
src/dictionary/ui/DictionarySearch.test.tsx
src/dictionary/ui/Wordlist.test.tsx
```

### Dossiers Module (2 files)

```
src/dossiers/infrastructure/DossiersRepository.test.ts
src/dossiers/ui/DossierContainer.test.tsx
```

### Editor Module (1 file)

```
src/editor/common/EditorSearch.test.tsx
```

### Footer Module (1 file)

```
src/footer/ui/Footer.test.tsx
```

### Fragmentarium Module (51 files)

```
src/fragmentarium/ui/createFragmentUrl.test.tsx
src/fragmentarium/ui/display/Display.test.tsx
src/fragmentarium/ui/edition/Edition.test.tsx
src/fragmentarium/ui/edition/TemplateForm.test.tsx
src/fragmentarium/ui/edition/TransliterationForm.test.tsx
src/fragmentarium/ui/fragment/ArchaeologyEditor.test.tsx
src/fragmentarium/ui/fragment/ColophonEditor.test.tsx
src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx
src/fragmentarium/ui/fragment/Download.test.tsx
src/fragmentarium/ui/fragment/FragmentInCorpus.test.tsx
src/fragmentarium/ui/fragment/FragmentPager.test.tsx
src/fragmentarium/ui/fragment/FragmentView.test.tsx
src/fragmentarium/ui/fragment/PdfExport.test.ts
src/fragmentarium/ui/fragment/References.test.tsx
src/fragmentarium/ui/fragment/ScopeEditor.test.tsx
src/fragmentarium/ui/fragment/SimpleFragmentView.test.tsx
src/fragmentarium/ui/fragment/TeiExport.test.tsx
src/fragmentarium/ui/fragment/TransliterationHeader.test.tsx
src/fragmentarium/ui/fragment/WordExport.test.ts
src/fragmentarium/ui/fragment/lemma-annotation/InitializeLemmatizer.test.tsx
src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx
src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationForm.test.tsx
src/fragmentarium/ui/fragment/lemma-annotation/LemmaEditorModal.test.tsx
src/fragmentarium/ui/fragment/linguistic-annotation/EditableToken.test.tsx
src/fragmentarium/ui/front-page/Fragmentarium.test.tsx
src/fragmentarium/ui/front-page/LatestTransliterations.test.tsx
src/fragmentarium/ui/front-page/LuckButton.test.tsx
src/fragmentarium/ui/front-page/NeedsRevision.test.tsx
src/fragmentarium/ui/front-page/Statistics.test.tsx
src/fragmentarium/ui/image-annotation/AnnotationsView.integration.test.ts
src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.test.tsx
src/fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment.test.ts
src/fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens.test.ts
src/fragmentarium/ui/images/CdliImages.test.tsx
src/fragmentarium/ui/images/FolioDropdown.test.tsx
src/fragmentarium/ui/images/FolioImage.test.tsx
src/fragmentarium/ui/images/FolioPager.test.tsx
src/fragmentarium/ui/images/FolioTooltip.test.tsx
src/fragmentarium/ui/images/ImageButtonGroup.test.tsx
src/fragmentarium/ui/images/Images.test.tsx
src/fragmentarium/ui/images/Photo.test.tsx
src/fragmentarium/ui/info/CdliLink.test.tsx
src/fragmentarium/ui/info/Colophon.test.tsx
src/fragmentarium/ui/info/Details.test.tsx
src/fragmentarium/ui/info/ExternalResources.test.tsx
src/fragmentarium/ui/info/GenreSelection.test.tsx
src/fragmentarium/ui/info/Record.test.tsx
src/fragmentarium/ui/info/RecordEntry.test.tsx
src/fragmentarium/ui/info/ResearchProjects.test.tsx
src/fragmentarium/ui/info/ScriptSelection.test.tsx
src/fragmentarium/ui/lemmatization/LemmatizationForm.test.tsx
src/fragmentarium/ui/lemmatization/Word.test.tsx
src/fragmentarium/ui/line-to-vec/FragmentLineToVecRanking.test.tsx
src/fragmentarium/ui/search/FragmentariumSearch.test.tsx
src/fragmentarium/ui/search/PaginationItems.test.tsx
src/fragmentarium/ui/search/SearchFormDossier.test.tsx
src/fragmentarium/ui/text-annotation/Markable.test.tsx
src/fragmentarium/ui/text-annotation/SpanAnnotator.test.tsx
src/fragmentarium/ui/text-annotation/SpanEditor.test.tsx
src/fragmentarium/ui/text-annotation/TextAnnotation.test.tsx
```

### Header & Root (1 file)

```
src/Header.test.tsx
```

### HTTP Module (3 files)

```
src/http/ApiClient.edge-cases.test.ts
src/http/ApiClient.test.ts
src/http/cancellableFetch.test.ts
src/http/withData.test.tsx
```

### Markup Module (1 file)

```
src/markup/application/MarkupService.test.ts
```

### Research Projects Module (1 file)

```
src/research-projects/subpages/subpages.test.tsx
```

### Router Module (3 files)

```
src/router/head.test.tsx
src/router/notFoundRoutes.test.tsx
src/router/sitemap.test.tsx
```

### Signs Module (8 files)

```
src/signs/application/SignService.test.ts
src/signs/infrastructure/SignRepository.test.ts
src/signs/ui/CuneiformConverter/CuneiformConverterForm.test.tsx
src/signs/ui/display/CompositeSigns.test.tsx
src/signs/ui/display/SignDisplay.test.tsx
src/signs/ui/display/SignImages.test.tsx
src/signs/ui/display/SignInformation.test.tsx
src/signs/ui/search/MesZL.test.tsx
src/signs/ui/search/SignSearch.test.tsx
src/signs/ui/search/Signs.test.tsx
src/signs/ui/search/SignsSearchForm.test.tsx
```

### Transliteration Module (12 files)

```
src/transliteration/application/GlossaryFactory.test.ts
src/transliteration/application/ReferenceInjector.test.ts
src/transliteration/domain/Lemmatization.test.ts
src/transliteration/domain/Text.test.ts
src/transliteration/domain/TextLine.test.ts
src/transliteration/domain/accents.test.ts
src/transliteration/domain/line-numbers.test.ts
src/transliteration/ui/AkkadianWordAnalysis.test.tsx
src/transliteration/ui/Glossary.test.tsx
src/transliteration/ui/LineGroup.test.ts
src/transliteration/ui/TranslationColumn.test.tsx
src/transliteration/ui/TransliterationLines.test.tsx
src/transliteration/ui/TransliterationNotes.test.tsx
src/transliteration/ui/WordInfoAlignments.test.tsx
src/transliteration/ui/line-number.test.tsx
src/transliteration/ui/line-tokens.test.tsx
src/transliteration/ui/markup.test.tsx
src/transliteration/ui/parallel-line.test.tsx
```

### Test Support & Regression (2 files)

```
src/common/useObjectUrl.regression.test.tsx
src/useObjectUrl.test.tsx
```

---

## Change Distribution by Module

| Module          | Test Files | Primary Changes                                                |
| --------------- | ---------- | -------------------------------------------------------------- |
| Fragmentarium   | 51         | Router, act() removal, setup refactoring, withRouter removal   |
| Transliteration | 18         | Router, act() removal, fireEvent usage                         |
| Corpus          | 25         | Router, act() removal, async queries, integration test updates |
| Bibliography    | 18         | Router, act() removal, mock refactoring, snapshot updates      |
| Common          | 21         | act() removal, error boundary tests, utility test updates      |
| Chronology      | 9          | Router, act() removal, async input handling                    |
| Akkadian        | 7          | Minor formatting, test assertion updates                       |
| Dictionary      | 3          | Router, act() removal                                          |
| Signs           | 11         | Router, act() removal, factory updates                         |
| AFO Register    | 8          | Router, act() removal, service mock refactoring                |
| Auth            | 2          | React-auth0-spa test expansion                                 |
| HTTP            | 4          | Mock and promise handling updates                              |
| Other           | 27         | Miscellaneous refactoring across modules                       |

---

## Recommendations for Test Review

1. **Navigation Tests**: Verify router-based tests still correctly validate page navigation (history spying was removed in some cases)
2. **Async Rendering**: Confirm that all async component rendering tests use `findBy*` queries properly
3. **Snapshot Tests**: Check that components with removed snapshots still have adequate content assertions
4. **Service Mocks**: Ensure mock promises are properly resolved in tests that expect content (not stuck in loading state)
5. **Integration Tests**: Run integration test suites in isolation to ensure setup function refactoring doesn't cause cross-test contamination
