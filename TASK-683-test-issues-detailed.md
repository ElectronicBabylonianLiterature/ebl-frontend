# TASK-683 Detailed Test Issues

## Source

- Parsed from `TASK-683-test-output.txt` produced by:
  - `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`

## Result Snapshot

- Test Suites: 287 passed, 287 total
- Tests: 2 skipped, 22127 passed, 22129 total
- Time: 291.615 s

## Explicit Status

- In this detailed warning set, `T1`, `T2`, `T3`, and `T4` are now **resolved** in focused rechecks on current branch.
- Some other TASK-683 items are solved in separate documents (for example structure/placement cleanups), but those are not part of this warning table.
- Final status refresh (2026-04-02): latest full-run artifact `TASK-683-test-output-2026-04-02-all.txt` reports `289/289` passing suites and `grep -c '● Console'` = `0`.

## Focused Recheck (2026-03-10)

- Goal: confirm whether each warning class still reoccurs after subsequent PR changes.
- Method: one focused test file per issue type.

| ID  | Focused File                                             | Warning Signature Found                                         | Recheck Result                                          |
| --- | -------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| T1  | `src/fragmentarium/ui/SearchForm.test.tsx`               | `Warning: Spinner: Support for defaultProps will be removed...` | No longer reoccurs after Spinner refactor               |
| T2  | `src/Header.test.tsx`                                    | `React Router Future Flag Warning ... v7_startTransition`       | No longer reoccurs after test-router future-flag opt-in |
| T3  | `src/Header.test.tsx`                                    | `React Router Future Flag Warning ... v7_relativeSplatPath`     | No longer reoccurs after test-router future-flag opt-in |
| T4  | `src/dossiers/infrastructure/DossiersRepository.test.ts` | `Failed to fetch filtered dossiers: Filter endpoint not found`  | No longer reoccurs after test-noise logging guard       |

## Detailed Issues Table

| ID  | Issue                                                 | Count | Primary Locations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Problem Detail                                                                                              | Possible Solutions                                                                                                                          |
| --- | ----------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Spinner defaultProps deprecation                      |    74 | src/common/ui/Spinner.tsx                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | React warns that function components using defaultProps will lose support in a future major release.        | Refactor Spinner to use default parameters (for example, function Spinner({ loading = false })). Update affected tests/snapshots if needed. |
| T2  | React Router v7_startTransition future flag warning   |    71 | src/Header.test.ts<br>src/**tests**/security-fragment-tabs.test.ts<br>src/about/ui/about.test.ts<br>src/about/ui/news.test.ts<br>src/afo-register/ui/AfoRegisterSearchForm.test.ts<br>src/bibliography/ui/Bibliography.test.ts<br>src/bibliography/ui/BibliographyEditor.test.ts<br>src/bibliography/ui/BibliographySearch.test.ts<br>src/bibliography/ui/BibliographyViewer.test.ts<br>src/chronology/ui/DateConverter/DateConverterForm.test.ts<br>src/common/AppContent.test.ts<br>src/common/Breadcrumbs.test.ts<br>… | React Router v6 emits a forward-compat warning for state update behavior that changes in v7.                | Opt into future flags in router setup for tests/apps, or suppress expected migration warnings in test harness until migration is scheduled. |
| T3  | React Router v7_relativeSplatPath future flag warning |    71 | src/Header.test.ts<br>src/**tests**/security-fragment-tabs.test.ts<br>src/about/ui/about.test.ts<br>src/about/ui/news.test.ts<br>src/afo-register/ui/AfoRegisterSearchForm.test.ts<br>src/bibliography/ui/Bibliography.test.ts<br>src/bibliography/ui/BibliographyEditor.test.ts<br>src/bibliography/ui/BibliographySearch.test.ts<br>src/bibliography/ui/BibliographyViewer.test.ts<br>src/chronology/ui/DateConverter/DateConverterForm.test.ts<br>src/common/AppContent.test.ts<br>src/common/Breadcrumbs.test.ts<br>… | React Router v6 emits a forward-compat warning for splat-relative path resolution changes in v7.            | Opt into v7_relativeSplatPath in router config and verify affected route tests, or suppress as known migration warning.                     |
| T4  | Dossiers fetch fallback warning                       |     2 | src/dossiers/infrastructure/DossiersRepository.ts:99                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Repository-level warning from test path where filtered dossiers request fails and falls back to full fetch. | If fallback is expected, reduce log level in tests or mock success path; if unexpected, fix request/mocking setup.                          |

## Router Warning Location Coverage (compact)

| Location                                                                         | Warning Hits |
| -------------------------------------------------------------------------------- | -----------: |
| src/test-support/AppDriver.ts                                                    |           16 |
| src/**tests**/security-fragment-tabs.test.ts                                     |            2 |
| src/about/ui/about.test.ts                                                       |            2 |
| src/about/ui/news.test.ts                                                        |            2 |
| src/afo-register/ui/AfoRegisterSearchForm.test.ts                                |            2 |
| src/bibliography/ui/Bibliography.test.ts                                         |            2 |
| src/bibliography/ui/BibliographyEditor.test.ts                                   |            2 |
| src/bibliography/ui/BibliographySearch.test.ts                                   |            2 |
| src/bibliography/ui/BibliographyViewer.test.ts                                   |            2 |
| src/chronology/ui/DateConverter/DateConverterForm.test.ts                        |            2 |
| src/common/AppContent.test.ts                                                    |            2 |
| src/common/Breadcrumbs.test.ts                                                   |            2 |
| src/corpus/ui/chapter-title.test.ts                                              |            2 |
| src/corpus/ui/FragmentariumLink.test.ts                                          |            2 |
| src/corpus/ui/ManuscriptPopover.test.ts                                          |            2 |
| src/corpus/ui/WordExport.test.ts                                                 |            2 |
| src/dictionary/ui/display/WordDisplay.test.ts                                    |            2 |
| src/dictionary/ui/display/wordDisplayLogograms.test.ts                           |            2 |
| src/dictionary/ui/editor/WordEditor.test.ts                                      |            2 |
| src/dictionary/ui/search/Dictionary.test.ts                                      |            2 |
| src/dictionary/ui/search/FragmentLemmaLines.test.ts                              |            2 |
| src/dictionary/ui/search/Word.test.ts                                            |            2 |
| src/dictionary/ui/search/WordSearch.test.ts                                      |            2 |
| src/dictionary/ui/search/WordSearchForm.test.ts                                  |            2 |
| src/fragmentarium/ui/display/Display.test.ts                                     |            2 |
| src/fragmentarium/ui/edition/Edition.test.ts                                     |            2 |
| src/fragmentarium/ui/fragment/CuneiformFragment.test.ts                          |            2 |
| src/fragmentarium/ui/fragment/FragmentInCorpus.test.ts                           |            2 |
| src/fragmentarium/ui/fragment/FragmentPager.test.ts                              |            2 |
| src/fragmentarium/ui/fragment/FragmentView.test.ts                               |            2 |
| src/fragmentarium/ui/FragmentButton.test.ts                                      |            2 |
| src/fragmentarium/ui/FragmentLink.test.ts                                        |            2 |
| src/fragmentarium/ui/FragmentList.test.ts                                        |            2 |
| src/fragmentarium/ui/front-page/Fragmentarium.test.ts                            |            2 |
| src/fragmentarium/ui/front-page/LatestTransliterations.test.ts                   |            2 |
| src/fragmentarium/ui/front-page/LuckButton.test.ts                               |            2 |
| src/fragmentarium/ui/front-page/NeedsRevision.test.ts                            |            2 |
| src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.test.ts |            2 |
| src/fragmentarium/ui/images/FolioPager.test.ts                                   |            2 |
| src/fragmentarium/ui/images/Images.test.ts                                       |            2 |
| src/fragmentarium/ui/info/Details.test.ts                                        |            2 |
| src/fragmentarium/ui/info/GenreSelection.test.ts                                 |            2 |
| src/fragmentarium/ui/info/Record.test.ts                                         |            2 |
| src/fragmentarium/ui/info/ScriptSelection.test.ts                                |            2 |
| src/fragmentarium/ui/line-to-vec/FragmentLineToVecRanking.test.ts                |            2 |
| src/fragmentarium/ui/PioneersButton.test.ts                                      |            2 |
| src/fragmentarium/ui/search/FragmentariumSearch.test.ts                          |            2 |
| src/fragmentarium/ui/search/PaginationItems.test.ts                              |            2 |
| src/fragmentarium/ui/SearchForm.test.ts                                          |            2 |
| src/Header.test.ts                                                               |            2 |
| src/research-projects/subpages/subpages.test.ts                                  |            2 |
| src/router/notFoundRoutes.test.ts                                                |            2 |
| src/signs/ui/display/CompositeSigns.test.ts                                      |            2 |
| src/signs/ui/display/SignDisplay.test.ts                                         |            2 |
| src/signs/ui/display/SignImages.test.ts                                          |            2 |
| src/signs/ui/display/SignInformation.test.ts                                     |            2 |
| src/signs/ui/search/MesZL.test.ts                                                |            2 |
| src/signs/ui/search/Signs.test.ts                                                |            2 |
| src/signs/ui/search/SignSearch.test.ts                                           |            2 |
| src/signs/ui/search/SignsSearchForm.test.ts                                      |            2 |
| src/transliteration/ui/Glossary.test.ts                                          |            2 |
| src/transliteration/ui/parallel-line.test.ts                                     |            2 |
| src/transliteration/ui/WordInfo.portal-context.test.ts                           |            2 |
| src/transliteration/ui/WordInfoAlignments.test.ts                                |            2 |

## Notes

- This table enumerates all unique warning/error issue types found in the test output and includes location coverage for Router warnings.
- If needed, a fully expanded per-occurrence CSV can be generated (very large artifact).
- Focused recheck on `2026-03-10` now confirms `T1-T4` are fixed in current branch runs.
