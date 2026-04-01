# TASK-683 Test Semantic Changes Audit

Every uncommitted test-file modification, categorised by **change type**, with an explicit note on whether the change **weakens, strengthens, or neutrally adjusts** the assertion.

---

## 1. `src/about/ui/about.test.tsx`

### 1.1 Mock returns never-resolving promise instead of real data

|            | Before                                                                                | After                                                                         |
| ---------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Import** | `import { markupDtoSerialized } from 'test-support/markup-fixtures'`                  | removed                                                                       |
| **Mock**   | `markupServiceMock.fromString.mockReturnValue(Bluebird.resolve(markupDtoSerialized))` | `markupServiceMock.fromString.mockReturnValue(new Bluebird(() => undefined))` |

**Severity: Weakens.**  
All tests now run with markup permanently in the loading state. The component is never tested with resolved markup content. Any markdown rendering, content transformations, or conditional markup-based UI is untested.

### 1.2 Sync queries replaced with async `findBy*`

`screen.getByRole`, `screen.getByText` → `await screen.findByRole`, `await screen.findByText` in three test bodies.

**Severity: Neutral (timing fix only).** No assertion logic changed; tests now wait for async rendering before asserting.

---

## 2. `src/bibliography/ui/Bibliography.test.tsx`

### 2.1 Default search mock returns never-resolving promise

```diff
- bibliographyService.search.mockReturnValue(Promise.resolve(entries))
+ bibliographyService.search.mockReturnValue(new Promise(() => undefined))
```

**Severity: Weakens.**  
All tests in the `beforeEach` now run search permanently in the loading/pending state by default. Only "displays result on successful query" manually overrides the mock per-test to actually resolve entries.

### 2.2 "displays result on successful query" test restructured with deferred resolution

Instead of the service resolving immediately, it now resolves inside an `act()` block after render.

**Severity: Neutral (timing correctness fix).** The same entries are asserted; only the timing/ordering is made explicit.

### 2.3 `Markdown` component mocked out

```js
jest.mock('common/ui/Markdown', () => ({
  Markdown: ({ text, className }) => <div className={className}>{text}</div>,
}))
```

**Severity: Weakens.**  
Markdown rendering is bypassed entirely. Tests no longer exercise the actual `Markdown` component's output or any side-effects it has.

### 2.4 Sync queries replaced with async `findBy*`

Two tests changed from `screen.getByText` / `screen.getByLabelText` → `await screen.findByText` / `await screen.findByLabelText`.

**Severity: Neutral (timing fix).**

---

## 3. `src/bibliography/ui/BibliographyEditor.test.tsx`

### 3.1 Router import changed from `react-router` to `react-router-dom`

```diff
- import { MemoryRouter } from 'react-router'
+ import { MemoryRouter } from 'react-router-dom'
```

**Severity: Neutral.** Both re-export the same component; this aligns with project convention.

### 3.2 "View button redirects" — navigation assertion removed

```diff
- screen.getByText('View').click()
- // View button navigates to view page
+ await userEvent.click(screen.getByText('View'))
```

**Severity: Weakens.**  
The original code included a comment indicating navigation was being tested (implicitly via `.click()` triggering route change). The new version uses `userEvent` but drops any assertion that navigation actually occurred. The test now only verifies the click does not throw.

---

## 4. `src/bibliography/ui/BibliographySelect.test.tsx`

### 4.1 `react-select-event` replaced with manual `userEvent` option selection

```diff
- await selectEvent.select(screen.getByLabelText('label'), entry.label)
+ await userEvent.click(
+   await screen.findByText(
+     (text, element) => text === entry.label && element?.getAttribute('class')?.includes('option'),
+   ),
+ )
```

**Severity: Neutral (implementation swap).** The same end-state (option selected, `onChange` called with `entry`) is asserted.

### 4.2 Sync queries replaced with async `findBy*`

Multiple `screen.getByText(entry.label)` → `await screen.findByText(entry.label)`.

**Severity: Neutral (timing fix).**

---

## 5. `src/bibliography/ui/BibliographyViewer.test.tsx`

### 5.1 Router import changed from `react-router` to `react-router-dom`

**Severity: Neutral.** Convention alignment only.

---

## 6. `src/chronology/ui/DateEditor/DateSelection.test.tsx`

### 6.1 `fireEvent` replaced with `userEvent`

All `fireEvent.click` and `fireEvent.change` replaced with `await userEvent.click` / `await userEvent.clear` + `await userEvent.type`.

**Severity: Neutral (more realistic simulation).**`userEvent` fires all real browser events; `fireEvent` fires a single synthetic one. This improves fidelity but does not change what is asserted.

### 6.2 "displays loading spinner when saving" — mock now explicitly never-resolves

```diff
+ mockUpdateDate.mockReturnValueOnce(new Promise(() => undefined))
```

**Severity: Strengthens.** Previously the test depended on implicit mock behaviour during async rendering. Now the promise is explicitly never-resolving, guaranteeing the spinner state is reliably captured before resolution.

---

## 7. `src/chronology/ui/DateEditor/DateSelectionInput.test.tsx`

### 7.1 `.click()` DOM calls replaced with `await userEvent.click`

**Severity: Neutral (more realistic simulation).**

### 7.2 `react-select-event` replaced with `userEvent.type` + manual option click

```diff
- await selectEvent.select(screen.getByLabelText('select-calendar'), 'Umma')
+ await userEvent.type(screen.getByLabelText('select-calendar'), 'Umma')
+ const ummaOption = await screen.findByText((text, element) => text === 'Umma' && element?.getAttribute('class')?.includes('option'))
+ await userEvent.click(ummaOption)
```

Same for the `EponymField` test.

**Severity: Neutral (implementation swap).** End assertion (`setUr3Calendar` / `setEponym` called with correct value) is unchanged.

---

## 8. `src/corpus/ui/Download.test.tsx`

### 8.1 `fireEvent.click` replaced with `await userEvent.click`

**Severity: Neutral (more realistic simulation).**

---

## 9. `src/corpus/ui/alignment/ChapterAligner.test.tsx`

### 9.1 `react-select-event` replaced with `userEvent.type` + manual option click

```diff
- await selectEvent.select(await screen.findByLabelText('Omitted words'), 'kur-kur')
+ await userEvent.type(omittedWordsInput, 'kur')
+ await userEvent.click(await screen.findByText((text, el) => text === 'kur-kur' && el?.getAttribute('class')?.includes('option')))
```

**Severity: Neutral (implementation swap).** Same end state asserted.

---

## 10. `src/dictionary/ui/search/FragmentLemmaLines.test.tsx`

### 10.1 Explicit wait added before assertion

```diff
+ await screen.findByText(fragmentWithLemma.number)
```

**Severity: Neutral (timing fix).** The subsequent `toBeCalledWith` assertion is unchanged.

---

## 11. `src/dictionary/ui/search/WordSearchForm.test.tsx`

### 11.1 `MemoryRouter` wrapped in `TestMemoryRouter` with future flags

All 13 test renders now use a local `TestMemoryRouter` that passes `v7_startTransition: true, v7_relativeSplatPath: true` via `Object.fromEntries` (camelCase rule workaround).

**Severity: Neutral (warning suppression via config).** No assertions changed.

---

## 12. `src/fragmentarium/ui/SearchForm.test.tsx`

### 12.1 `MemoryRouter` wrapped in `TestMemoryRouter` with future flags

Same pattern as WordSearchForm.

**Severity: Neutral (warning suppression).**

### 12.2 `await screen.findByText('Genre')` added after render

```diff
+ await screen.findByText('Genre')
```

**Severity: Neutral (explicit loaded-state wait).** Ensures the form is fully rendered before any test acts on it.

---

## 13. `src/fragmentarium/ui/display/Display.test.tsx`

### 13.1 `.click()` DOM calls replaced with `await userEvent.click`

**Severity: Neutral (more realistic simulation).**

---

## 14. `src/fragmentarium/ui/edition/Edition.test.tsx`

### 14.1 Explicit loaded-state wait added

```diff
+ await screen.findByText(`(Publication: ${fragment.publication || '- '})`)
```

Added in two tests.

**Severity: Neutral (timing fix).**

### 14.2 `updateEdition` mock set to never-resolve before submit test

```diff
+ updateEdition.mockReturnValueOnce(new Promise(() => undefined))
```

**Severity: Strengthens.** Prevents the save from completing and changing component state under test, making the assertion of `updateEdition` being called cleaner.

---

## 15. `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`

### 15.1 `act` import changed from `react-dom/test-utils` to `react`

**Severity: Neutral (deprecation fix).**

### 15.2 Input simulation changed from `fireEvent.change` to `userEvent.type`

```diff
- fireEvent.click(transliterationEditor)
- fireEvent.change(transliterationEditor, { target: { value: newTransliteration } })
+ await userEvent.click(transliterationEditor)
+ await userEvent.type(transliterationEditor, newTransliteration)
```

**Severity: Neutral in intention, but the asserted value changed:**

```diff
- expect(transliterationEditor).toHaveValue(newTransliteration)
+ expect(transliterationEditor).toHaveValue(`${transliteration}${newTransliteration}`)
```

The `newTransliteration` constant was also shortened from `'line1\nline2\nnew line'` to `'\nnew line'`. With `userEvent.type`, characters are appended to the existing value, so the expectation now correctly checks the appended result.

**This is a semantic change:** the test now asserts a different final value than before. The original test effectively treated `fireEvent.change` as a full replace and checked only the new value; the new test confirms that `userEvent.type` appends to the pre-existing `transliteration` string.

### 15.3 `updateEdition` mock set to never-resolve before submit test

Same pattern as Edition.test.tsx — **Strengthens** (prevents async completion from tainting assertion).

---

## 16. `src/fragmentarium/ui/fragment/ArchaeologyEditor.test.tsx`

### 16.1 `updateArchaeology` mock set to never-resolve before submit test

```diff
+ updateArchaeology.mockReturnValueOnce(new Promise(() => undefined))
```

**Severity: Strengthens.**

---

## 17. `src/fragmentarium/ui/fragment/ColophonEditor.test.tsx`

### 17.1 Empty `react-dom/test-utils` import removed

```diff
- import {} from 'react-dom/test-utils'
```

**Severity: Neutral (dead import removed).**

### 17.2 Explicit loaded-state wait added

```diff
+ await screen.findByLabelText('save-colophon')
```

**Severity: Neutral (timing fix).**

---

## 18. `src/fragmentarium/ui/fragment/Download.test.tsx`

### 18.1 `fireEvent.click` replaced with `await userEvent.click`; setup made async

**Severity: Neutral (more realistic simulation).**

---

## 19. `src/fragmentarium/ui/fragment/FragmentView.test.tsx`

### 19.1 `waitForSpinnerToBeRemoved` replaced with explicit API-call + text waits

```diff
- await waitForSpinnerToBeRemoved(screen)
+ await waitFor(() => expect(fragmentService.find).toBeCalledWith(fragmentNumber))
+ await screen.findByText(fragmentNumber)
```

in the `renderAndWaitForLoadedFragment` helper (used by the "Fragment is loaded" describe suite only).

**Severity: Weakens slightly.** The spinner check verified that the loading state had resolved visually; the new approach only checks that the service was called and text is present. If the spinner never disappears (e.g. a regression where loading never completes visually), the new test would not catch it.

---

## 20. `src/fragmentarium/ui/fragment/WordExport.test.ts`

### 20.1 `LemmaPopover` and `AlignmentPopover` mocked with passthrough

```js
jest.mock('transliteration/ui/WordInfo', () => ({
  LemmaPopover: ({ children }) => children,
  AlignmentPopover: ({ children }) => children,
}))
```

**Severity: Weakens.**  
These popover components are no longer exercised during export. If either component causes side-effects during document export (e.g. rendering content that appears in the Word export), those effects are now bypassed.

---

## 21. `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.test.tsx`

### 21.1 `wordServiceMock.searchLemma` default mock changed to never-resolve

```diff
- wordServiceMock.searchLemma.mockReturnValue(Promise.resolve([mockWord]))
+ wordServiceMock.searchLemma.mockImplementation(() => new Promise(() => undefined))
```

**Severity: Weakens.**  
Most tests in "Token Editing" now run against a search that never resolves. Only "applies the suggestion on confirmation" and "saves the changes on clicking Save" restore the resolving mock per test.

### 21.2 `onCreateProperNoun` called via `ref` and `act` instead of direct instance

```diff
- const annotation = new LemmaAnnotation(props)
- annotation.onCreateProperNoun(createdWord)
+ const annotationRef = React.createRef<LemmaAnnotation>()
+ render(<LemmaAnnotation {...props} ref={annotationRef} />)
+ await screen.findByLabelText('edit-token-lemmas')
+ await act(async () => {
+   annotationRef.current?.onCreateProperNoun(createdWord)
+   await Promise.resolve()
+ })
```

**Severity: Strengthens.**  
The old approach created a bare class instance outside React, bypassing all lifecycle and state management. The new approach calls the method on the live rendered component, making the test meaningfully exercise the real code path.

### 21.3 Explicit loaded-state wait added to many tests

```diff
+ await screen.findByLabelText('edit-token-lemmas')
```

**Severity: Neutral (timing fix).**

---

## 22. `src/fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.test.tsx`

### 22.1 `fireEvent.click(dropdownToggle)` replaced with `await userEvent.click(getDropdownToggle())`

Across all dropdown interaction tests (~18 tests).

**Severity: Neutral (more realistic simulation).** Same UI state and assertions.

---

## 23. `src/fragmentarium/ui/front-page/Fragmentarium.test.tsx`

### 23.1 `MemoryRouter` given future flags `v7_startTransition` and `v7_relativeSplatPath`

**Severity: Neutral (warning suppression).**

---

## 24. `src/fragmentarium/ui/front-page/LatestTransliterations.test.tsx`

### 24.1 Additional wait for spinner removal before snapshot

```diff
+ await waitForSpinnerToBeRemoved(screen)
```

**Severity: Strengthens.**  
The snapshot now captures fully loaded content instead of a mix of loaded and still-loading sections. Combined with snapshot update, this makes the snapshot test more meaningful and deterministic.

---

## 25. `src/fragmentarium/ui/images/FolioDropdown.test.tsx`

### 25.1 `fireEvent.click` replaced with `await userEvent.click`

**Severity: Neutral (more realistic simulation).**

---

## 26. `src/fragmentarium/ui/images/ImageButtonGroup.test.tsx`

### 26.1 `act` import changed from `react-dom/test-utils` to `react`

**Severity: Neutral (deprecation fix).**

---

## 27. `src/fragmentarium/ui/images/Images.test.tsx`

### 27.1 Router import changed from `react-router` to `react-router-dom`

**Severity: Neutral (convention alignment).**

### 27.2 Explicit spinner-removal wait added before assertions in four tests

```diff
+ await waitForElementToBeRemoved(() => screen.queryAllByLabelText('Spinner'))
```

**Severity: Neutral (timing fix).** Makes assertions deterministic by ensuring loading is complete.

---

## 28. `src/fragmentarium/ui/info/GenreSelection.test.tsx`

### 28.1 `react-select-event` replaced with `userEvent.click` on select + option

Three tests in "Genre Editor" replaced `selectEvent.select(...)` with:

```js
await userEvent.click(screen.getByLabelText('select-genre'))
await userEvent.click(await screen.findByText('ARCHIVAL ➝ Administrative'))
```

**Severity: Neutral (implementation swap).** Same end assertion.

---

## 29. `src/fragmentarium/ui/search/SearchFormDossier.test.tsx`

### 29.1 Default `mockSearchSuggestions` changed to never-resolve

```diff
- mockSearchSuggestions.mockResolvedValue([])
+ mockSearchSuggestions.mockImplementation(() => new Promise(() => undefined))
```

**Severity: Weakens.**  
Tests that previously exercised complete suggestion loading now run against a permanently pending async state.

### 29.2 "calls onChange with null when cleared" test — start value changed from `"D001"` to `null`

```diff
- value="D001"
+ value={null}
```

And the test now:

1. Types `D001` to trigger search
2. Clicks the match
3. Then clears

**Severity: Strengthens.**  
The old version passed in `value="D001"` (pre-selected) and immediately cleared it, never verifying that selection actually worked. The new version tests the full select-then-clear flow.

### 29.3 Sync queries replaced with async `findBy*`

Multiple `screen.getByText`, `screen.getByLabelText`, `screen.getByTestId` → async equivalents.

**Severity: Neutral (timing fix).**

---

## 30. `src/fragmentarium/ui/text-annotation/Markable.test.tsx`

### 30.1 Explicit loaded-state wait added

```diff
+ await screen.findByText('kur')
```

**Severity: Neutral (timing fix).**

---

## 31. `src/signs/ui/display/SignInformation.test.tsx`

### 31.1 Router import changed from `react-router` to `react-router-dom`

**Severity: Neutral (convention alignment).**

---

## Summary Table

| File                            | Change                                                        | Severity                                       |
| ------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| about.test.tsx                  | Markup mock never resolves — content untested                 | **Weakens**                                    |
| about.test.tsx                  | `getBy*` → `findBy*`                                          | Neutral                                        |
| Bibliography.test.tsx           | Default search mock never resolves                            | **Weakens**                                    |
| Bibliography.test.tsx           | Markdown component mocked out                                 | **Weakens**                                    |
| Bibliography.test.tsx           | Deferred resolve pattern in one test                          | Neutral                                        |
| Bibliography.test.tsx           | `getBy*` → `findBy*`                                          | Neutral                                        |
| BibliographyEditor.test.tsx     | Navigation assertion removed after View click                 | **Weakens**                                    |
| BibliographyEditor.test.tsx     | Router import aligned                                         | Neutral                                        |
| BibliographySelect.test.tsx     | `selectEvent` → `userEvent`                                   | Neutral                                        |
| BibliographySelect.test.tsx     | `getBy*` → `findBy*`                                          | Neutral                                        |
| BibliographyViewer.test.tsx     | Router import aligned                                         | Neutral                                        |
| DateSelection.test.tsx          | `fireEvent` → `userEvent`                                     | Neutral                                        |
| DateSelection.test.tsx          | Spinner test mock explicitly never-resolves                   | **Strengthens**                                |
| DateSelectionInput.test.tsx     | `.click()` → `userEvent.click`                                | Neutral                                        |
| DateSelectionInput.test.tsx     | `selectEvent` → `userEvent`                                   | Neutral                                        |
| Download.test.tsx (corpus)      | `fireEvent` → `userEvent`                                     | Neutral                                        |
| ChapterAligner.test.tsx         | `selectEvent` → `userEvent`                                   | Neutral                                        |
| FragmentLemmaLines.test.tsx     | Explicit wait before assertion                                | Neutral                                        |
| WordSearchForm.test.tsx         | Router future flags                                           | Neutral                                        |
| SearchForm.test.tsx             | Router future flags + loaded-state wait                       | Neutral                                        |
| Display.test.tsx                | `.click()` → `userEvent.click`                                | Neutral                                        |
| Edition.test.tsx                | Loaded-state waits added                                      | Neutral                                        |
| Edition.test.tsx                | `updateEdition` never-resolves before submit                  | **Strengthens**                                |
| TransliterationForm.test.tsx    | `act` import fixed                                            | Neutral                                        |
| TransliterationForm.test.tsx    | `fireEvent.change` → `userEvent.type`, expected value changed | **Semantic change** (different value asserted) |
| TransliterationForm.test.tsx    | `updateEdition` never-resolves before submit                  | **Strengthens**                                |
| ArchaeologyEditor.test.tsx      | `updateArchaeology` never-resolves before submit              | **Strengthens**                                |
| ColophonEditor.test.tsx         | Dead import removed, loaded-state wait added                  | Neutral                                        |
| Download.test.tsx (fragment)    | `fireEvent` → `userEvent`                                     | Neutral                                        |
| FragmentView.test.tsx           | Spinner wait replaced with service+text waits                 | **Weakens slightly**                           |
| WordExport.test.ts              | Popover components mocked out                                 | **Weakens**                                    |
| LemmaAnnotation.test.tsx        | Default searchLemma never resolves                            | **Weakens**                                    |
| LemmaAnnotation.test.tsx        | `onCreateProperNoun` via ref+act instead of bare instance     | **Strengthens**                                |
| LemmaAnnotation.test.tsx        | Loaded-state waits added                                      | Neutral                                        |
| LemmaAnnotationButton.test.tsx  | `fireEvent` → `userEvent` for dropdowns                       | Neutral                                        |
| Fragmentarium.test.tsx          | Router future flags                                           | Neutral                                        |
| LatestTransliterations.test.tsx | Spinner wait before snapshot                                  | **Strengthens**                                |
| FolioDropdown.test.tsx          | `fireEvent` → `userEvent`                                     | Neutral                                        |
| ImageButtonGroup.test.tsx       | `act` import fixed                                            | Neutral                                        |
| Images.test.tsx                 | Router import aligned, spinner waits added                    | Neutral                                        |
| GenreSelection.test.tsx         | `selectEvent` → `userEvent`                                   | Neutral                                        |
| SearchFormDossier.test.tsx      | Default suggestions never resolve                             | **Weakens**                                    |
| SearchFormDossier.test.tsx      | Clear test rewritten with full select-then-clear flow         | **Strengthens**                                |
| SearchFormDossier.test.tsx      | `getBy*` → `findBy*`                                          | Neutral                                        |
| Markable.test.tsx               | Loaded-state wait added                                       | Neutral                                        |
| SignInformation.test.tsx        | Router import aligned                                         | Neutral                                        |
