# TASK-683 Test Diagnostic Hotspots (2026-03-25)

## Source

- Input log: `TASK-683-test-diag-2026-03-25.txt`
- Command used:
  - `yarn test:diag`
  - (`CI=true NODE_OPTIONS=--max_old_space_size=1536 craco test --runInBand --coverage --forceExit --detectOpenHandles --watch=false --logHeapUsage`)

## Run Summary

- Test Suites: `289 passed, 289 total`
- Tests: `2 skipped, 22235 passed, 22237 total`
- Snapshots: `18 passed, 18 total`
- Time: `339.02 s`
- Early-exit marker (`process exited too early`): `not present`

## Warning Counts

| Warning Class                    | Count |
| -------------------------------- | ----: |
| React Router Future Flag Warning |    26 |
| not wrapped in act(...)          |   173 |
| validateDOMNesting               |    10 |
| controlId ignored on FormLabel   |   153 |
| controlId ignored on FormControl |   153 |

## Top 20 Suites By Heap

| Rank | Heap (MB) | Test Suite                                                                        |
| ---: | --------: | --------------------------------------------------------------------------------- |
|    1 |      1288 | src/corpus/domain/ManuscriptLineDisplay.test.ts                                   |
|    2 |      1284 | src/fragmentarium/domain/Fragment.test.ts                                         |
|    3 |      1255 | src/corpus/ui/Reconstruction.test.tsx                                             |
|    4 |      1245 | src/auth/User.test.tsx                                                            |
|    5 |      1236 | src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.test.tsx |
|    6 |      1227 | src/common/ui/Breadcrumbs.test.tsx                                                |
|    7 |      1223 | src/fragmentarium/ui/front-page/Statistics.test.tsx                               |
|    8 |      1222 | src/fragmentarium/application/FindspotService.test.ts                             |
|    9 |      1216 | src/corpus/domain/manuscript.test.ts                                              |
|   10 |      1207 | src/common/utils/period.test.ts                                                   |
|   11 |      1202 | src/bibliography/domain/BibliographyEntry.test.ts                                 |
|   12 |      1199 | src/dictionary/ui/display/wordDisplayLogograms.test.tsx                           |
|   13 |      1197 | src/dictionary/domain/compareWord.test.ts                                         |
|   14 |      1188 | src/dictionary/application/WordService.test.ts                                    |
|   15 |      1183 | src/about/ui/news.test.tsx                                                        |
|   16 |      1182 | src/fragmentarium/ui/fragment/Download.test.tsx                                   |
|   17 |      1181 | src/transliteration/domain/accents.test.ts                                        |
|   18 |      1175 | src/editor/Editor.test.tsx                                                        |
|   19 |      1173 | src/common/ui/BlobImage.test.tsx                                                  |
|   20 |      1172 | src/common/hooks/usePrevious.test.tsx                                             |

## Notes

- This report is intentionally compact for trend comparison across runs.
- For deeper triage, compare this file with future `TASK-683-test-diag-hotspots-YYYY-MM-DD.md` artifacts.
