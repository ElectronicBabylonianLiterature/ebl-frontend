# TASK-683 Src Comments Audit

## Scope

- Date: 2026-03-04
- Directory scanned: `src/`
- Goal: identify comments that appear to have been added recently.
- Method:
  1. Detect comment-syntax lines (`//`, `/*`, `*`) in `src/**/*.ts,tsx,js,jsx`.
  2. Use `git blame --line-porcelain` per line.
  3. Keep entries with `author-time >= 2026-01-01`.

## Summary

- Total recent comment entries found: **105**
- Distinct files with recent comments: **24**
- Confirmed example from request:
  - `src/setupTests.ts:17` → `// Polyfill for TextEncoder/TextDecoder required by some dependencies`

## File-level Inventory (recent comments)

| File                                                                  | Recent comment lines |
| --------------------------------------------------------------------- | -------------------: |
| `src/__tests__/security-auth.test.tsx`                                |                   14 |
| `src/__tests__/security-fragment-tabs.test.tsx`                       |                   10 |
| `src/__tests__/security-api.test.tsx`                                 |                   10 |
| `src/dossiers/ui/DossiersGroupedDisplay.tsx`                          |                    9 |
| `src/common/ErrorBoundary.comprehensive.test.tsx`                     |                    9 |
| `src/useObjectUrl.regression.test.tsx`                                |                    8 |
| `src/common/useObjectUrl.regression.test.tsx`                         |                    8 |
| `src/common/ResultPageButtons.edge-cases.test.tsx`                    |                    6 |
| `src/dictionary/ui/search/WordSearchForm.test.tsx`                    |                    5 |
| `src/index.test.tsx`                                                  |                    4 |
| `src/serviceWorker.ts`                                                |                    3 |
| `src/App.tsx`                                                         |                    3 |
| `src/setupTests.ts`                                                   |                    2 |
| `src/http/ApiClient.edge-cases.test.ts`                               |                    2 |
| `src/corpus/ui/ChapterView.integration.test.ts`                       |                    2 |
| `src/index.tsx`                                                       |                    1 |
| `src/fragmentarium/ui/image-annotation/annotation-tool/Annotation.js` |                    1 |
| `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`           |                    1 |
| `src/editor/Editor.tsx`                                               |                    1 |
| `src/dossiers/ui/DossiersGroupedDisplay.test.tsx`                     |                    1 |
| `src/dictionary/ui/editor/FormList.tsx`                               |                    1 |
| `src/common/List.tsx`                                                 |                    1 |
| `src/bibliography/ui/BibliographyViewer.test.tsx`                     |                    1 |
| `src/bibliography/domain/GenerateIds.ts`                              |                    1 |
| `src/auth/Auth0AuthenticationService.test.tsx`                        |                    1 |

## Notable Comment Entries

| File                                     |  Line | Comment                                                                 |
| ---------------------------------------- | ----: | ----------------------------------------------------------------------- |
| `src/setupTests.ts`                      |    17 | `// Polyfill for TextEncoder/TextDecoder required by some dependencies` |
| `src/setupTests.ts`                      |    69 | `// @ts-expect-error - partial mock for testing`                        |
| `src/App.tsx`                            | 18-20 | Session/auth lifecycle explanation comments                             |
| `src/bibliography/domain/GenerateIds.ts` | 12-13 | Unicode property escape compatibility note                              |
| `src/serviceWorker.ts`                   |     1 | `/* eslint-disable compat/compat */`                                    |

## Commented-out Code (separate list)

The following entries appear to be commented-out executable code rather than explanatory comments:

| File                                               | Line | Commented-out code                                                              |
| -------------------------------------------------- | ---: | ------------------------------------------------------------------------------- |
| `src/dictionary/ui/search/WordSearchForm.test.tsx` |   35 | `// jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**               |
| `src/dictionary/ui/search/WordSearchForm.test.tsx` |  138 | `// jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**               |
| `src/dictionary/ui/search/WordSearchForm.test.tsx` |  184 | `// jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**               |
| `src/dictionary/ui/search/WordSearchForm.test.tsx` |  210 | `// jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**               |
| `src/dictionary/ui/search/WordSearchForm.test.tsx` |  240 | `// jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**               |
| `src/bibliography/ui/BibliographyViewer.test.tsx`  |   42 | `// // jest.spyOn(history, "push")` — **Fixed (removed 2026-03-05)**            |
| `src/fragmentarium/ui/fragment/PdfExport.tsx`      |  201 | `// table.hide()` — **Fixed (removed 2026-03-05)**                              |
| `src/fragmentarium/ui/fragment/PdfExport.tsx`      |  626 | `// else if ($(el)[0].nodeType === 3){` — **Fixed (removed 2026-03-05)**        |
| `src/fragmentarium/ui/fragment/PdfExport.tsx`      |  627 | `//   setDocStyle($(el).parent(),doc)` — **Fixed (removed 2026-03-05)**         |
| `src/fragmentarium/ui/fragment/PdfExport.tsx`      |  628 | `//  wordLength = addText(text,xPos,yPos,doc)` — **Fixed (removed 2026-03-05)** |

Count: **10** originally identified; **10 fixed**, **0 remaining**.

## Notes

- Most recent comments are in test files (`src/__tests__` + regression/edge-case suites) and are explanatory/documentation style.
- A smaller subset are lint/TypeScript suppression comments and commented-out placeholder spy lines.
- This artifact should be updated if additional recent comment lines are introduced in `src/` during this PR.
