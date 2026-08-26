# Frontend Request Performance Handoff

## 1. Objective, Scope, and Constraints

This handoff documents frontend request behavior and performance risk areas for reviewer follow-up.

Scope covered:

- Route-level request chains for:
  - `/library/:fragment`
  - `/library/:fragment/annotate`
  - `/library/search`
  - `/dictionary/:word` redirects to `/tools/dictionary/:word`
  - `/tools/dictionary/:word`
  - `/tools/signs`
  - `/tools/signs/:sign`
  - `/corpus/...`
  - `/bibliography/...` redirects
- Endpoint dependency mapping by API family
- Caching, cancellation, concurrency, and crawler exposure
- Ranked findings and reviewer validation checklist

Constraints honored during investigation:

- No production code changes
- No refactors
- No commits
- No env file changes

Primary route composition reference: `src/router/router.tsx:23-67`.

## 2. Request Architecture Baseline

### 2.1 Route Assembly and Service Injection

- Website route families are mounted in `WebsiteRoutes(...)` and rendered under a single app shell in `src/router/router.tsx:45-67` and `src/router/router.tsx:27-39`.
- Services are created in `InjectedApp` and passed into the app/router once at startup in `src/InjectedApp.tsx:70-214`.

### 2.2 Startup Eager Requests

On initial app mount, three requests are fired eagerly in `src/InjectedApp.tsx:189-199`:

- `fragmentService.fetchProvenances()`
- `textService.list()`
- `fragmentService.fetchGenres()`

This happens regardless of initial route.

### 2.3 Shared HTTP Wrapper Behavior

- Base URL: `apiUrl(path)` in `src/http/ApiClient.ts:13-15`.
- Auth header behavior: if `authenticate === true` OR user is authenticated, `Authorization` is sent (`src/http/ApiClient.ts:104-118`).
- Request execution and global error capture: `src/http/ApiClient.ts:149-188`.
- Bluebird cancellation + `AbortController` in `src/http/cancellableFetch.ts:7-16`.

### 2.4 withData Lifecycle

`withData` is the dominant fetch orchestration pattern:

- Triggers in `useEffect` with dependency watch array (`src/http/withData.tsx:35-75`)
- Stale response guard via `requestSequence` (`src/http/withData.tsx:33,37-48`)
- Cancellation on cleanup (`src/http/withData.tsx:67-71`)
- Spinner + error handling wrapper (`src/http/withData.tsx:77-87`)

## 3. Route-by-Route Request Maps

## 3.1 `/library/:fragment`

Route entry:

- Declared in `src/router/fragmentariumRoutes.tsx:147-176`

Primary request chain:

| Trigger            | Component/Service               | Request                                                                              | Evidence                                                                                                                                                                                 |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route mount        | `FragmentView` withData         | `fragmentService.find(number)` -> `GET /fragments/:id`                               | `src/fragmentarium/ui/fragment/FragmentView.tsx:129-142`, `src/fragmentarium/application/FragmentService.ts:257-273`, `src/fragmentarium/infrastructure/FragmentRepository.ts:254-271`   |
| Route mount        | `FragmentPager` withData        | `fragmentService.fragmentPager` -> `GET /fragments/:id/pager`                        | `src/fragmentarium/ui/fragment/FragmentPager.tsx:48-57`, `src/fragmentarium/application/FragmentService.ts:502-504`, `src/fragmentarium/infrastructure/FragmentRepository.ts:444-448`    |
| Route mount        | `FragmentInCorpus` withData     | `fragmentService.findInCorpus` -> `GET /fragments/:id/corpus`                        | `src/fragmentarium/ui/fragment/FragmentInCorpus.tsx:11-23`, `src/fragmentarium/application/FragmentService.ts:458-463`, `src/fragmentarium/infrastructure/FragmentRepository.ts:499-535` |
| Side panel mount   | `AfoRegisterFragmentRecords`    | `searchTextsAndNumbers(traditionalReferences)` -> `POST /afo-register/texts-numbers` | `src/afo-register/ui/AfoRegisterFragmentRecords.tsx:22-40`, `src/afo-register/infrastructure/AfoRegisterRepository.ts:64-71`                                                             |
| Side panel mount   | `FragmentDossierRecordsDisplay` | `dossiersService.queryByIds(...)` -> `GET /dossiers?ids[]=`                          | `src/dossiers/ui/DossiersDisplay.tsx:184-207`, `src/dossiers/application/DossiersService.ts:66-84`, `src/dossiers/infrastructure/DossiersRepository.ts:34-39`                            |
| Images tab (photo) | `FragmentPhoto` withData        | `fragmentService.findPhoto` -> `GET /fragments/:id/photo`                            | `src/fragmentarium/ui/images/Images.tsx:84-91,169-175`, `src/fragmentarium/application/FragmentService.ts:473-479`, `src/fragmentarium/infrastructure/ImageRepository.ts:31-35`          |
| Images tab (folio) | `FolioPager` withData           | `fragmentService.folioPager` -> `GET /fragments/:id/pager/:folioName/:folioNumber`   | `src/fragmentarium/ui/images/FolioPager.tsx:59-69`, `src/fragmentarium/application/FragmentService.ts:498-500`, `src/fragmentarium/infrastructure/FragmentRepository.ts:435-442`         |
| Images tab (folio) | `FolioImage` withData           | `fragmentService.findFolio` -> `GET /folios/:name/:number`                           | `src/fragmentarium/ui/images/FolioImage.tsx:11-55`, `src/fragmentarium/application/FragmentService.ts:465-467`, `src/fragmentarium/infrastructure/ImageRepository.ts:25-29`              |
| CDLI tab           | `CdliImages`                    | external image URLs only (`https://cdli.earth/...`)                                  | `src/fragmentarium/ui/images/CdliImages.tsx:58-61,81-87`                                                                                                                                 |

Notes:

- Fragment and query responses are cached/deduped with limiters in `FragmentService` (`src/fragmentarium/application/FragmentService.ts:205-232,257-273,556-591,709-725`).
- Thumbnail cache exists but is mainly exercised in search results (`src/fragmentarium/application/FragmentService.ts:481-496`).

## 3.2 `/library/:fragment/annotate`

Route entry and permission gate:

- Route declaration: `src/router/fragmentariumRoutes.tsx:120-130`
- Session gate in view: `src/fragmentarium/ui/image-annotation/TagSignsView.tsx:31-44`

Request chain:

| Trigger                  | Component/Service              | Request                                                                                                 | Evidence                                                                                                                                                         |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Annotator mount          | `Annotator` withData (level 1) | `fragmentService.find(number)` -> `GET /fragments/:id`                                                  | `src/fragmentarium/ui/image-annotation/Annotator.tsx:85-99`                                                                                                      |
| Annotator mount          | `Annotator` withData (level 2) | `fragmentService.findPhoto(fragment)` -> `GET /fragments/:id/photo`                                     | `src/fragmentarium/ui/image-annotation/Annotator.tsx:72-83`                                                                                                      |
| Annotator mount          | `Annotator` withData (level 3) | `fragmentService.findAnnotations(number)` -> `GET /fragments/:id/annotations?generateAnnotations=false` | `src/fragmentarium/ui/image-annotation/Annotator.tsx:57-70`, `src/fragmentarium/infrastructure/FragmentRepository.ts:460-479`                                    |
| Annotator mount          | `FragmentAnnotation` withData  | `signService.associateSigns(tokens)` -> per-token sign search calls                                     | `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx:53-61`, `src/signs/infrastructure/SignRepository.ts:32-40,96-100`                  |
| User action: Generate    | Annotation tool                | `fragmentService.generateAnnotations(number)` -> `GET ...generateAnnotations=true`                      | `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx:297-305`, `src/fragmentarium/infrastructure/FragmentRepository.ts:460-471`         |
| User action: Save/Delete | Annotation tool                | `fragmentService.updateAnnotations(...)` -> `POST /fragments/:id/annotations`                           | `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx:188-201,327-341`, `src/fragmentarium/infrastructure/FragmentRepository.ts:481-497` |

Additional annotation flow in text editor tab:

- `fragmentService.find(number)` + `fragmentService.fetchNamedEntityAnnotations(number)` on load and `updateNamedEntityAnnotations` on save (`src/fragmentarium/ui/text-annotation/TextAnnotation.tsx:325-346,178-187`; repository endpoints in `src/fragmentarium/infrastructure/FragmentRepository.ts:585-603`).

## 3.3 `/library/search`

Route entry:

- Declared in `src/router/fragmentariumRoutes.tsx:78-102`

Search shell behavior:

- Results render only when query is non-default and number is valid (`src/fragmentarium/ui/search/FragmentariumSearch.tsx:59-63,95-123`).
- Two tabs are rendered (`Library`, `Corpus`) in the same `Tabs` tree (`src/fragmentarium/ui/search/FragmentariumSearch.tsx:96-122`).

Primary request paths:

| Trigger                      | Component/Service                          | Request                                                                                            | Evidence                                                                                                                                         |
| ---------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Search submit/tab active     | `SearchResult` withData                    | `fragmentService.query(fragmentQuery)` -> `GET /fragments/query?...`                               | `src/fragmentarium/ui/search/FragmentariumSearchResult.tsx:59-122`, `src/fragmentarium/infrastructure/FragmentRepository.ts:538-545`             |
| Search results page render   | `FragmentLines` per result                 | `fragmentService.find(museumNumber, lines...)` -> `GET /fragments/:id?...`                         | `src/fragmentarium/ui/search/FragmentariumSearchResultComponents.tsx:81-199`                                                                     |
| Search results near viewport | `FragmentThumbnail`                        | `fragmentService.findThumbnail(..., 'small')` -> `GET /fragments/:id/thumbnail/small`              | `src/fragmentarium/ui/search/FragmentariumSearchResultComponents.tsx:39-57,173-179`, `src/fragmentarium/infrastructure/ImageRepository.ts:38-44` |
| Search results side metadata | `FragmentDossierRecordsDisplay` per result | `dossiersService.queryByIds` batched fetch                                                         | `src/fragmentarium/ui/search/FragmentariumSearchResultComponents.tsx:133-136`, `src/dossiers/application/DossiersService.ts:66-178`              |
| Corpus tab search            | `CorpusSearchResult` withData              | `textService.query(corpusQuery)` -> `GET /corpus/query?...`                                        | `src/corpus/ui/search/CorpusSearchResult.tsx:177-214`, `src/corpus/application/TextService.ts:472-478`                                           |
| Corpus tab page render       | `ChapterResult` per item                   | `textService.findChapterDisplay(id, lines, variants)` -> `GET /texts/.../chapters/.../display?...` | `src/corpus/ui/search/CorpusSearchResult.tsx:55-127,151-169`, `src/corpus/application/TextService.ts:216-237,239-253`                            |

Search form background requests (advanced filters and selectors):

| Trigger                          | Request                                                                   | Evidence                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Form init                        | `fragmentService.fetchPeriods()`                                          | `src/fragmentarium/ui/search/SearchFormPeriod.tsx:77-143`                                                               |
| Form init                        | `fragmentService.fetchProvenances()`                                      | `src/fragmentarium/ui/search/SearchFormProvenance.tsx:15-43`                                                            |
| Form init with prefilled `bibId` | `bibliographyService.find(id)`                                            | `src/fragmentarium/ui/SearchForm.tsx:99-139`                                                                            |
| Typing in bibliography selector  | `fragmentService.searchBibliography(query)` -> bibliography search        | `src/fragmentarium/ui/search/SearchFormReference.tsx:30-37`, `src/fragmentarium/application/FragmentService.ts:512-514` |
| Typing in dossier selector       | debounced `dossiersService.searchSuggestions` (250ms)                     | `src/fragmentarium/ui/search/SearchFormDossier.tsx:9-10,92-125`                                                         |
| Lemma picker typing              | `wordService.searchLemma(input)` (no explicit debounce in this component) | `src/fragmentarium/ui/lemmatization/LemmaSelectionForm.tsx:70-78`                                                       |

## 3.4 `/dictionary/:word` -> `/tools/dictionary/:word`

Redirect behavior:

- Legacy route redirect: `src/router/dictionaryRoutes.tsx:42-53`
- Redirect preserves query/hash via helper: `src/router/withSearchAndHash.ts:1-6`
- Target display route: `src/router/toolsRoutes.tsx:166-187`

## 3.5 `/tools/dictionary/:word`

Primary request chain in dictionary entry page:

| Trigger                       | Component/Service               | Request                                                                       | Evidence                                                                                                             |
| ----------------------------- | ------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Route mount                   | `WordDisplay` withData          | `wordService.find(wordId)` -> `GET /words/:id`                                | `src/dictionary/ui/display/WordDisplay.tsx:203-217`, `src/dictionary/infrastructure/WordRepository.ts:12-14`         |
| Section III (logograms)       | `WordDisplayLogograms` withData | `signService.search({ wordId })` -> `GET /signs?...`                          | `src/dictionary/ui/display/WordDisplayLogograms.tsx:81-97`, `src/signs/infrastructure/SignRepository.ts:96-100`      |
| Section VI (library examples) | `FragmentLemmaLines` withData   | `fragmentService.query({ lemmas })` then up to 10 `fragmentService.find(...)` | `src/dictionary/ui/search/FragmentLemmaLines.tsx:130-162,106-123,72-93`                                              |
| Section VII (corpus examples) | `CorpusLemmaLines` withData     | `textService.query({ lemmas })` + `textService.searchLemma(...)`              | `src/dictionary/ui/search/CorpusLemmaLines.tsx:47-75,15-45`, `src/corpus/application/TextService.ts:457-470,472-478` |

## 3.6 `/tools/signs`

Route entry:

- Tab route is generated in `src/router/toolsRoutes.tsx:108-132` and rendered by `Tools` content map in `src/router/Tools.tsx:147-171`.

Primary request chain:

| Trigger                 | Component/Service                          | Request                                                                          | Evidence                                                                                                   |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Search criteria present | `SignsSearch` withData                     | `signService.search(signQuery)` -> `GET /signs?...`                              | `src/signs/ui/search/SignsSearch.tsx:218-236`, `src/signs/infrastructure/SignRepository.ts:96-100`         |
| Per sign result row     | `SignLists` withData, 4 instances per sign | `signService.findSignsByOrder(signName, sortEra)` -> `GET /signs/:sign/:sortEra` | `src/signs/ui/search/SignsSearch.tsx:73-147,165-172`, `src/signs/infrastructure/SignRepository.ts:112-120` |

Implication: result size \* 4 extra requests (plus base search) on this route.

## 3.7 `/tools/signs/:sign`

Route entry:

- Declared in `src/router/toolsRoutes.tsx:133-153`

Primary request chain:

| Trigger                     | Component/Service                     | Request                                                                                                         | Evidence                                                                                                            |
| --------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Route mount                 | `SignDisplay` withData                | `signService.find(id)` -> `GET /signs/:id`                                                                      | `src/signs/ui/display/SignDisplay.tsx:114-123`, `src/signs/infrastructure/SignRepository.ts:102-106`                |
| Detail mount                | `CompositeSigns` withData             | `signService.search({ isComposite: true, ... })`                                                                | `src/signs/ui/display/CompositeSigns.tsx:81-90`                                                                     |
| Detail mount                | `SignImages` withData                 | `signService.getCentroidImages(sign)` -> `GET /signs/:sign/images?centroids_only=true&include_unclustered=true` | `src/signs/ui/display/SignImages.tsx:20-34`, `src/signs/infrastructure/SignRepository.ts:68-77`                     |
| Palaeography accordion open | `loadClusterAnnotations`              | per-cluster `getClusterVariants(sign, clusterId, script)` with concurrency limit 4                              | `src/signs/ui/display/SignImages.tsx:263-331,290-292,362-379`, `src/signs/infrastructure/SignRepository.ts:79-94`   |
| Logogram word links         | `LogogramWord` withData (per word id) | `wordService.find(wordId)` -> `GET /words/:id`                                                                  | `src/signs/ui/display/SignLogogram/LogogramWord.tsx:45-52`, `src/dictionary/infrastructure/WordRepository.ts:12-14` |

## 3.8 `/corpus/...`

Route declarations:

- `src/router/corpusRoutes.tsx:35-153`

### 3.8.1 `/corpus` and `/corpus/:genre`

- `Corpus` withData calls `textService.list()` (`src/corpus/ui/Corpus.tsx:207-216`), which uses cached `GET /texts` (`src/corpus/application/TextService.ts:442-455`).

### 3.8.2 `/corpus/:genre/:category/:index` (text page)

- `TextView` withData calls `textService.find(textId)` (`src/corpus/ui/TextView.tsx:102-122`) -> `GET /texts/:genre/:category/:index` (`src/corpus/application/TextService.ts:181-204`).
- Per chapter, `Chapters` mounts `Manuscripts` withData -> `textService.findManuscripts(id)` (`src/corpus/ui/Chapters.tsx:233-234`) -> `GET /texts/.../chapters/.../manuscripts` (`src/corpus/application/TextService.ts:424-432`).
- Per chapter, `Manuscripts` also calls `textService.findExtantLines(id)` (`src/corpus/ui/Chapters.tsx:92-96`) -> `GET /texts/.../chapters/.../extant_lines` (`src/corpus/application/TextService.ts:417-422`).
- Per chapter, two extra withData components fetch colophons and unplaced lines (`src/corpus/ui/ChapterSiglumsAndTransliterations.tsx:35-50`) -> `GET .../colophons` and `GET .../unplaced_lines` (`src/corpus/application/TextService.ts:381-415`).

Important risk on uncertain fragment rows:

- `fragmentService.isInFragmentarium(...)` is called during render (`src/corpus/ui/Chapters.tsx:217-219`).
- `isInFragmentarium` calls async `fragmentRepository.find(number)` without awaiting and returns boolean synchronously (`src/fragmentarium/application/FragmentService.ts:275-281`).
- This appears to trigger network requests while always returning `true` unless synchronous throw, which is unlikely with async fetch.

### 3.8.3 `/corpus/:genre/:category/:index/:stage/:chapter` (chapter page)

- `ChapterView` withData performs `Bluebird.all([ textService.findChapterDisplay(id), textService.find(id.textId) ])` (`src/corpus/ui/ChapterView.tsx:213-233`).
- This means chapter page load issues at least:
  - `GET /texts/.../chapters/.../display`
  - `GET /texts/:genre/:category/:index`

## 3.9 `/bibliography/...` redirects and `/tools/references...`

Redirect map:

- All `/bibliography/...` routes redirect to `/tools/references...` or `/tools/afo-register` while preserving search/hash (`src/router/bibliographyRoutes.tsx:24-107`, `src/router/withSearchAndHash.ts:1-6`).

Target request behavior:

- `/tools/references` search only when query present (`src/bibliography/ui/BibliographySearch.tsx:50-64`) -> `bibliographyService.search` -> `GET /bibliography?query=...`.
- `/tools/references/:id` viewer fetches single entry (`src/bibliography/ui/BibliographyViewer.tsx:134-141`) -> `GET /bibliography/:id`.
- `/tools/afo-register` result search calls `afoRegisterService.search` (`src/afo-register/ui/AfoRegisterSearch.tsx:38-58`) -> `GET /afo-register?...`; optional fragment enrichment call is nested via `queryByTraditionalReferences` (`src/afo-register/infrastructure/AfoRegisterRepository.ts:17-37,46-62`).

## 4. API Contract Dependency Matrix (Frontend Assumptions)

This section identifies key endpoint contracts the frontend currently assumes.

## 4.1 Fragmentarium Family

| Endpoint                                             | Method   | Main Consumers                                  | Contract Assumptions                                                                                                                                                                                 |
| ---------------------------------------------------- | -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/fragments/:id`                                     | GET      | Fragment page, annotator, search result details | Returns full fragment dto with `text`, `folios`, `references`, `genres`, `script`, `dossiers`, etc. (`src/fragmentarium/infrastructure/FragmentRepository.ts:103-146,254-271`)                       |
| `/fragments/:id/pager`                               | GET      | Fragment pager                                  | Response has `previous` and `next` IDs (`src/fragmentarium/infrastructure/FragmentRepository.ts:444-448`)                                                                                            |
| `/fragments/:id/pager/:folioName/:folioNumber`       | GET      | Folio pager                                     | Response has `previous`/`next` folio payload (`src/fragmentarium/infrastructure/FragmentRepository.ts:435-442`)                                                                                      |
| `/fragments/:id/photo`                               | GET blob | Photo tab, annotator                            | Blob endpoint always available when `hasPhoto` is true (`src/fragmentarium/infrastructure/ImageRepository.ts:31-35`)                                                                                 |
| `/folios/:name/:number`                              | GET blob | Folio image                                     | Returns binary folio image (`src/fragmentarium/infrastructure/ImageRepository.ts:25-29`)                                                                                                             |
| `/fragments/:id/thumbnail/:size`                     | GET blob | Search thumbnails                               | 404 handled as `blob: null` (`src/fragmentarium/infrastructure/ImageRepository.ts:38-51`)                                                                                                            |
| `/fragments/:id/corpus`                              | GET      | Fragment-in-corpus panel                        | Expects `manuscriptAttestations` and `uncertainFragmentAttestations` arrays (`src/fragmentarium/infrastructure/FragmentRepository.ts:499-535`)                                                       |
| `/fragments/query?...`                               | GET      | Library search, dictionary examples             | Expects `matchCountTotal` and `items` with `museumNumber`, `matchingLines`, `matchCount` (optional prefetched `fragment`) (`src/fragmentarium/infrastructure/FragmentRepository.ts:160-203,538-545`) |
| `/fragments/latest`                                  | GET      | latest query path                               | Same query result contract with optional `fragments` side payload (`src/fragmentarium/infrastructure/FragmentRepository.ts:171-177,547-551`)                                                         |
| `/fragments/:id/annotations?generateAnnotations=...` | GET      | Image annotation load/generate                  | Expects `{ annotations: [{ geometry, data }] }` (`src/fragmentarium/infrastructure/FragmentRepository.ts:460-479`)                                                                                   |
| `/fragments/:id/annotations`                         | POST     | Image annotation save                           | Accepts `fragmentNumber` and `annotations[]` payload (`src/fragmentarium/infrastructure/FragmentRepository.ts:481-497`)                                                                              |
| `/fragments/:id/named-entities`                      | GET/POST | Text annotation                                 | GET list and POST `{ annotations }` (`src/fragmentarium/infrastructure/FragmentRepository.ts:585-603`)                                                                                               |

## 4.2 Corpus Family

| Endpoint                                             | Method | Main Consumers                                | Contract Assumptions                                                                                   |
| ---------------------------------------------------- | ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `/texts`                                             | GET    | Corpus catalogue, startup preload             | Returns array of `TextInfo` (`src/corpus/application/TextService.ts:442-455`)                          |
| `/texts/:genre/:category/:index`                     | GET    | Text page, chapter page                       | Returns text dto containing chapter metadata (`src/corpus/application/TextService.ts:181-204`)         |
| `/texts/.../chapters/:stage/:chapter/display?...`    | GET    | Chapter page, corpus search results           | Returns `ChapterDisplayDto` with lines/variants etc. (`src/corpus/application/TextService.ts:239-303`) |
| `/texts/.../chapters/:stage/:chapter/manuscripts`    | GET    | Text page chapter manuscript tables           | Returns manuscript arrays (`src/corpus/application/TextService.ts:424-432`)                            |
| `/texts/.../chapters/:stage/:chapter/extant_lines`   | GET    | Text page chapter manuscript tables           | Returns `ExtantLines` keyed by siglum (`src/corpus/application/TextService.ts:417-422`)                |
| `/texts/.../chapters/:stage/:chapter/colophons`      | GET    | Text page colophons section                   | Returns transliteration entries (`src/corpus/application/TextService.ts:381-397`)                      |
| `/texts/.../chapters/:stage/:chapter/unplaced_lines` | GET    | Text page unplaced lines section              | Returns transliteration entries (`src/corpus/application/TextService.ts:399-415`)                      |
| `/corpus/query?...`                                  | GET    | Corpus search tab, dictionary corpus examples | Expects `matchCountTotal` and chapter item list (`src/corpus/application/TextService.ts:472-478`)      |
| `/lemmasearch?...`                                   | GET    | Dictionary corpus examples                    | Returns dictionary line displays (`src/corpus/application/TextService.ts:457-470`)                     |

## 4.3 Dictionary Family

| Endpoint            | Method | Main Consumers                    | Contract Assumptions                                                                                 |
| ------------------- | ------ | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/words/:id`        | GET    | Word display, sign logogram words | Full word object with lemma metadata (`src/dictionary/infrastructure/WordRepository.ts:12-14`)       |
| `/words?query=...`  | GET    | Dictionary search                 | Query serialization must match backend (`src/dictionary/infrastructure/WordRepository.ts:23-27`)     |
| `/words?lemma=...`  | GET    | Lemma pickers                     | Returns word candidates for UI suggestions (`src/dictionary/infrastructure/WordRepository.ts:30-34`) |
| `/words?lemmas=...` | GET    | Search form prefilled lemmas      | Supports comma list (`src/dictionary/infrastructure/WordRepository.ts:16-20`)                        |
| `/words/all`        | GET    | Sitemap slug generation           | Returns all dictionary IDs (`src/dictionary/infrastructure/WordRepository.ts:37-39`)                 |

## 4.4 Signs Family

| Endpoint                                            | Method | Main Consumers                                | Contract Assumptions                                                                                              |
| --------------------------------------------------- | ------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/signs?{query}`                                    | GET    | Signs search, composite signs, associateSigns | Flexible query fields (`value`, `subIndex`, `wordId`, etc.) (`src/signs/infrastructure/SignRepository.ts:96-100`) |
| `/signs/:name`                                      | GET    | Sign display route                            | Returns full sign detail dto (`src/signs/infrastructure/SignRepository.ts:102-106`)                               |
| `/signs/:name/:sortEra`                             | GET    | Signs list per-result order tables            | Returns ordered sign arrays (`src/signs/infrastructure/SignRepository.ts:112-120`)                                |
| `/signs/:name/images?...`                           | GET    | Sign images initial payload                   | Returns centroid/unclustered image annotations (`src/signs/infrastructure/SignRepository.ts:68-77`)               |
| `/signs/:name/images/cluster/:clusterId?script=...` | GET    | Sign image accordion expansion                | Returns cluster variant annotations (`src/signs/infrastructure/SignRepository.ts:79-94`)                          |
| `/signs/all`                                        | GET    | Sitemap slug generation                       | Returns all sign IDs (`src/signs/infrastructure/SignRepository.ts:108-110`)                                       |

## 4.5 Bibliography, AfO, Dossiers Families

| Endpoint                                   | Method | Main Consumers                          | Contract Assumptions                                                                                                      |
| ------------------------------------------ | ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/bibliography?query=...`                  | GET    | References search, search form selector | Returns bibliography entry array (`src/bibliography/infrastructure/BibliographyRepository.ts:33-39`)                      |
| `/bibliography/:id`                        | GET    | Bibliography viewer, prefill labels     | Returns single bibliography entry (`src/bibliography/infrastructure/BibliographyRepository.ts:17-23`)                     |
| `/bibliography/list?ids=...`               | GET    | Batched bibliography fetches            | Supports comma-based array format (`src/bibliography/infrastructure/BibliographyRepository.ts:25-31`)                     |
| `/bibliography/all`                        | GET    | Sitemap slug generation                 | Returns all bibliography IDs (`src/bibliography/infrastructure/BibliographyRepository.ts:54-56`)                          |
| `/afo-register?{query}`                    | GET    | AfO register search                     | Query string passed through from UI (`src/afo-register/infrastructure/AfoRegisterRepository.ts:46-53`)                    |
| `/afo-register/texts-numbers`              | POST   | Fragment side panel cross refs          | Accepts string array payload (`src/afo-register/infrastructure/AfoRegisterRepository.ts:64-71`)                           |
| `/afo-register/suggestions?text_query=...` | GET    | AfO selectors                           | Suggestion list response contract (`src/afo-register/infrastructure/AfoRegisterRepository.ts:74-80`)                      |
| `/dossiers`                                | GET    | Dossiers tab full load                  | May return either raw array or `{ dossiers: [...] }` envelope (`src/dossiers/infrastructure/DossiersRepository.ts:16-27`) |
| `/dossiers?ids[]=...`                      | GET    | Fragment/search result dossier labels   | Expects DossierRecordDto list (`src/dossiers/infrastructure/DossiersRepository.ts:34-39`)                                 |
| `/dossiers/suggestions?q=...`              | GET    | Dossier async select                    | Returns `{ id, description? }[]` (`src/dossiers/infrastructure/DossiersRepository.ts:41-55`)                              |
| `/dossiers/filter?...`                     | GET    | Filtered dossier suggestions            | Fallbacks to all dossiers on error (`src/dossiers/infrastructure/DossiersRepository.ts:73-102`)                           |

## 5. Caching, Dedup, Cancellation, and Concurrency

### 5.1 Positive Controls Already Present

- `withData` stale response and cancel-on-unmount (`src/http/withData.tsx:33-75`).
- Actual fetch abort on cancel (`src/http/cancellableFetch.ts:7-16`).
- Fragment caches for fragment detail, query result, provenances, thumbnails, plus in-flight dedup maps (`src/fragmentarium/application/FragmentService.ts:181-232,257-273,328-390,556-591,709-725`).
- Fragment fetch limiter = 6 and thumbnail limiter = 8 (`src/fragmentarium/application/FragmentService.ts:56-57,219-224`).
- Corpus chapter display cache + in-flight dedup + limiter = 4 (`src/corpus/application/TextService.ts:63-65,157-169,216-237`).
- BibliographyService dedup for `find` and `findMany` with cache scope separation (`src/bibliography/application/BibliographyService.ts:48-84,157-245,266-285`).
- DossiersService micro-batches concurrent `queryByIds` calls and caches per id (`src/dossiers/application/DossiersService.ts:66-178,215-255`).

### 5.2 Gaps and Inconsistencies

- No global debounce for several async selectors (`BibliographySelect`, `AfoRegisterTextSelect`, `LemmaSelectionForm`): `src/bibliography/ui/BibliographySelect.tsx:53-64`, `src/afo-register/ui/AfoRegisterTextSelect.tsx:65-76`, `src/fragmentarium/ui/lemmatization/LemmaSelectionForm.tsx:70-78`.
- Dossier selector does include debounce (250ms), but this pattern is not uniformly used elsewhere (`src/fragmentarium/ui/search/SearchFormDossier.tsx:9-10,92-125`).
- Route-level code splitting not detected (`grep -R "React.lazy|Suspense" src` returned no matches).

## 6. Ranked Findings (Performance and Behavior Risk)

## 6.1 High - N+1 and Fan-Out in Search Results

`/library/search` and corpus tab can issue high request counts quickly:

- Base query + per-result fragment fetches + per-result dossier fetches + per-near-viewport thumbnails (`src/fragmentarium/ui/search/FragmentariumSearchResult.tsx:59-122`, `src/fragmentarium/ui/search/FragmentariumSearchResultComponents.tsx:81-199`).
- Corpus tab adds chapter display calls per visible chapter (`src/corpus/ui/search/CorpusSearchResult.tsx:55-127`).

Impact:

- Request bursts increase with result volume and page changes.
- Waterfalls likely on constrained networks.

## 6.2 High - `/tools/signs` Multiplier Pattern

Per sign result, 4 additional `findSignsByOrder(...)` calls are mounted (`src/signs/ui/search/SignsSearch.tsx:165-172`) on top of the base sign search query (`src/signs/ui/search/SignsSearch.tsx:230-236`).

Impact:

- Request count scales as `1 + 4*N` for `N` returned signs.

## 6.3 High - `/corpus/:text` Chapter Fan-Out and `isInFragmentarium` Behavior

For text pages with many chapters, route load can fan out into:

- `findManuscripts` per chapter
- `findExtantLines` per chapter
- `findColophons` per chapter
- `findUnplacedLines` per chapter

Evidence: `src/corpus/ui/Chapters.tsx:247-263`, `src/corpus/ui/Chapters.tsx:92-96`, `src/corpus/ui/ChapterSiglumsAndTransliterations.tsx:35-50`.

Additionally, `isInFragmentarium` appears incorrect for async behavior:

- Called in render (`src/corpus/ui/Chapters.tsx:217-219`)
- Implementation calls async `find(...)` but returns boolean synchronously (`src/fragmentarium/application/FragmentService.ts:275-281`)

Likely effect:

- Extra network calls during render
- Possible always-true result in real async runtime

## 6.4 High - Crawler Exposure is Large and Broad

- `robots.txt` allows all crawling (`public/robots.txt:1-5`).
- Sitemap builds slugs from all major families (`signs`, `words`, `bibliography`, `fragments`, `texts`, `chapters`) in `src/router/sitemap.tsx:128-151`.
- Generated URL volume from local sitemap archives: `356,170` URLs.
  - `/library`: `310,554`
  - `/tools`: `45,197`
  - `/corpus`: `370`
  - `/tools/references`: `21,927`
  - `/tools/dictionary`: `20,766`
  - `/tools/signs`: `2,497`
- Head tags include title/description/OpenGraph/Twitter but no canonical or robots meta controls (`src/router/head.tsx:19-26`).

## 6.5 Medium - Auth Header Applied Broadly for Authenticated Users

`ApiClient.createHeaders` adds `Authorization` when user is authenticated even if endpoint requested with `authenticate=false` (`src/http/ApiClient.ts:104-118`).

Potential impact:

- Lower shared cache hit rates for otherwise public GETs
- Higher token retrieval/coupling to auth path

## 6.6 Medium - Startup Requests on Every Session

`InjectedApp` always preloads provenances, text list, and genres on mount (`src/InjectedApp.tsx:189-199`).

Potential impact:

- Non-trivial request overhead before user-specific route intent is known

## 6.7 Medium - Dual Tab Query Risk in `/library/search`

Both tab contents are declared in one `Tabs` render block (`src/fragmentarium/ui/search/FragmentariumSearch.tsx:96-122`) without explicit `mountOnEnter` controls in code.

Risk hypothesis to verify:

- Both `SearchResult` and `CorpusSearchResult` could fetch on initial result render depending on react-bootstrap tab mount behavior.

## 6.8 Low - Dossiers Error Fallbacks Mask Backend Issues

`DossiersRepository` swallows errors with warnings and fallback values (`src/dossiers/infrastructure/DossiersRepository.ts:28-31,98-101`).

Impact:

- Failures may be partially hidden while UI still appears functional.

## 7. Crawler and SEO Specific Notes

- Sitemap generation is route-driven and includes all slugged detail pages via `WebsiteRoutes(...)` + slug injection (`src/router/sitemap.tsx:53`, `src/router/router.tsx:45-67`).
- Given URL volume and permissive robots policy, heavy crawler traffic against request-dense routes is plausible.
- No route-level canonical/noindex controls are currently visible in shared head tags (`src/router/head.tsx:19-26`).

## 8. Reviewer Validation Checklist

## 8.1 Instrumentation Setup

1. Open browser devtools Network panel.
2. Disable cache.
3. Capture HAR for each target route with a clean session.
4. Repeat once authenticated and once unauthenticated.

## 8.2 Route Validation Runs

1. `/library/:fragment`
   - Record initial request count, payload sizes, and time to usable content.
   - Expand image tabs (photo and folio) and confirm incremental requests.
2. `/library/:fragment/annotate`
   - Measure initial nested fetch chain.
   - Trigger generate + save and record endpoint timings.
3. `/library/search`
   - Test small, medium, large result sets.
   - Page through results and record per-page request delta.
   - Verify whether both Library and Corpus tab queries fire on initial render.
4. `/tools/signs`
   - Use a query returning many signs; quantify `1 + 4*N` behavior.
5. `/tools/signs/:sign`
   - Open accordions and measure cluster variant request fan-out.
6. `/tools/dictionary/:word`
   - Record request count for sections VI/VII and logogram-related calls.
7. `/corpus/:genre/:category/:index`
   - Compare request count against chapter count.
   - Focus on uncertain fragment rows and `isInFragmentarium` behavior.
8. `/bibliography/...` old paths
   - Confirm redirect chain and final route fetch pattern.

## 8.3 Crawler Exposure Validation

1. Validate current sitemap size and family distribution against production assets.
2. Confirm crawler logs (if available) for hit rates on `/library/*`, `/tools/references/*`, `/tools/dictionary/*`.
3. Sample bot traffic impact on backend latency for high-cardinality pages.

## 9. Open Questions for Follow-Up Reviewer

1. Does react-bootstrap in current version mount both tab panes by default in `/library/search`, causing dual initial queries?
2. In real runtime, does `isInFragmentarium` always return `true` and trigger redundant network calls as expected from static analysis?
3. Are any CDN/reverse-proxy caches bypassed because public GETs carry auth headers for authenticated sessions?
4. What are median and p95 request counts for large `/library/search` and `/tools/signs` sessions?

## 10. Suggested Immediate Priorities

1. Verify and triage `isInFragmentarium` behavior first (correctness + request amplification).
2. Quantify and prioritize request reduction on `/tools/signs` and `/library/search` fan-out paths.
3. Validate tab mount behavior in `/library/search` and adjust fetching strategy if dual-query is confirmed.
4. Reassess crawler indexing strategy for very high-cardinality route families.

---

No source files were modified as part of this investigation; this handoff is evidence-only.
