# TASK-1: Dictionary of Realia Page

## Phase 0 — Auth Scope

- [ ] `src/auth/applicationScopes.json`
  - Add `"readRealia": "read:realia"` after the last entry
- [ ] `src/auth/Session.ts`
  - Add `isAllowedToReadRealia(): boolean` to the `Session` interface
  - Add `isAllowedToReadRealia(): boolean { return false }` to `GuestSession`
  - Add `isAllowedToReadRealia(): boolean { return this.hasApplicationScope('readRealia') }` to `MemorySession`
- [ ] `src/auth/Session.test.ts`
  - In `GuestSession` baseline test: add `expect(guestSession.isAllowedToReadRealia()).toBe(false)`
  - In `describe.each` table: add `['read:realia', 'isAllowedToReadRealia']`

## Phase 1 — Domain + Infrastructure + Application

- [ ] `src/realia/domain/RealiaEntry.ts`
  - Export `RealiaType` union (12 values: `BUILDING_NAME` … `YEAR_NAME`)
  - Export `REALIA_TYPE_LABELS: Record<RealiaType, string>` — human-readable display names
  - Export `AfoRegisterEntry` interface: `mainWord`, `note`, `AfO`, `reference`, `crossReference` (all `string`)
  - Export `ReallexikonEntry` interface: `id`, `title`, `content` (`string`), `reference: Reference | null`
  - Export `RealiaEntry` interface: `id: string`, `relatedTerms: readonly string[]`, `type: readonly RealiaType[]`, `wikidataId: readonly string[]`, `afoRegister: readonly AfoRegisterEntry[]`, `reallexikon: readonly ReallexikonEntry[]`, `references: readonly Reference[]`
- [ ] `src/realia/infrastructure/RealiaRepository.ts`
  - Constructor takes `ApiClient`
  - `find(id: string): Promise<RealiaEntry>` — `GET /realia/${encodeURIComponent(id)}`; maps `_id` → `id`
  - `search(query: string): Promise<readonly RealiaEntry[]>` — `GET /realia?query=${query}`; maps `_id` → `id` on each item
- [ ] `src/realia/application/RealiaService.ts`
  - Constructor takes `RealiaRepository`
  - `find(id: string)` delegates to repository
  - `search(query: string)` delegates to repository
- [ ] `src/realia/domain/RealiaEntry.test.ts`
  - All 12 `RealiaType` values present in `REALIA_TYPE_LABELS`
  - `REALIA_TYPE_LABELS` has no extra keys beyond the 12 types
- [ ] `src/realia/infrastructure/RealiaRepository.test.ts`
  - Mock `ApiClient`; use `testDelegation` + `TestData` pattern (mirror `AfoRegisterRepository.test.ts`)
  - Assert `find` calls `apiClient.fetchJson('/realia/Pig', false)` and maps `_id` → `id`
  - Assert `search` calls `apiClient.fetchJson('/realia?query=pig', false)` and maps `_id` → `id`
- [ ] `src/realia/application/RealiaService.test.ts`
  - Mock repository; use `testDelegation` + `TestData` (mirror `AfoRegisterService.test.ts`)
  - Cover `find` and `search`

## Phase 2 — Search UI

- [ ] `src/realia/ui/RealiaSearchForm.tsx`
  - Props: `query: string`
  - Controlled `<Form.Control>` text input initialised from `query` prop
  - "Search" `<Button>` — on submit calls `navigate('/tools/realia?query=' + encodeURIComponent(value))`
  - Prevent default form submission
- [ ] `src/realia/ui/RealiaResultsList.tsx`
  - Props: `entries: readonly RealiaEntry[]`
  - Renders `<ul>` with each entry as `<Link to={'/tools/realia/' + encodeURIComponent(entry.id)}>{entry.id}</Link>`
  - Shows "No results found." when `entries` is empty
- [ ] `src/realia/ui/RealiaSearch.tsx`
  - `withData` HOC wrapping `RealiaResultsList`
  - Getter: `(props) => props.realiaService.search(props.query)`
  - `watch`: `[props.query]`; `filter`: `(props) => props.query.trim().length > 0`; `defaultData: () => []`
- [ ] `src/realia/ui/RealiaSearchPage.tsx`
  - Intro paragraph: "The Dictionary of Realia is a reference tool for the material culture…" (text from screenshot)
  - Wrapped in `SessionContext.Consumer`; gates on `session.isAllowedToReadRealia()`; shows "Please log in to browse the Dictionary of Realia." if not permitted
  - Renders `RealiaSearchForm` with current query from `useLocation` + `parse(location.search)`
  - Renders `RealiaSearch` below the form (withData handles empty-query filtering)
- [ ] `src/realia/ui/RealiaSearchPage.test.tsx`
  - Mock `RealiaSearchForm` and `RealiaSearch` as testid stubs
  - Test: intro text renders, form renders
  - Test: with `?query=pig` in URL the results component is rendered
  - Test: without query the results component still mounts (withData filters internally)
  - Test: without `readRealia` scope, "Please log in" message shown and form is not rendered
- [ ] `src/realia/ui/RealiaSearch.test.tsx`
  - Render with mock `realiaService.search` returning entries → list items shown
  - Empty array → "No results found." shown
  - Empty query string → nothing fetched (filter prevents call)

## Phase 3 — Detail UI

- [ ] `src/realia/ui/RealiaDisplay.tsx`
  - Loaded via `withData`; getter: `(props) => props.realiaService.find(props.id)`
  - Wrapped in `SessionContext.Consumer`; gates on `session.isAllowedToReadRealia()`; shows "Please log in" if not permitted
  - **Header block**: `<h1>{entry.id}</h1>`, Wikidata IDs as `ExternalLink` to `https://www.wikidata.org/wiki/{id}` each prefixed "Wikidata:", related terms comma-joined, entity types via `REALIA_TYPE_LABELS` comma-joined (dash if empty)
  - **Section I** — `<h2>I. Reallexikon der Assyriologie und Vorderasiatischen Archäologie</h2>`: one `CollapsibleCard` per `ReallexikonEntry`; label = `{title} ({content})`; body = reference detail if present
  - **Section II** — `<h2>II. AfO-Register Realien</h2>`: for each `AfoRegisterEntry`: `mainWord` as label, `note` as body text, citation `[AfO {AfO} {reference}]` in grey
  - **Section III** — `<h2>III. References</h2>`: `<ReferenceList references={entry.references} />`
  - Omit section headings if the corresponding array is empty
- [ ] `src/realia/ui/Realia.sass`
  - `.Realia__metadata` — small grey metadata line below title
  - `.Realia__afo-citation` — grey bracket citation style
  - `.Realia__section` — spacing between sections
- [ ] `src/realia/ui/RealiaDisplay.test.tsx`
  - Renders all four sections for a full entry
  - Wikidata `ExternalLink` has correct `href`
  - Empty `type` → dash shown
  - Empty `reallexikon` / `afoRegister` / `references` → respective sections omitted
  - Without `readRealia` scope → "Please log in" shown

## Phase 4 — Routing Integration

- [ ] `src/router/Services.ts`
  - Import `RealiaService`; add `realiaService: RealiaService` to `Services` interface
- [ ] `src/InjectedApp.tsx`
  - Import `RealiaRepository` from `realia/infrastructure/RealiaRepository`
  - Import `RealiaService` from `realia/application/RealiaService`
  - `const realiaRepository = useMemo(() => new RealiaRepository(apiClient), [apiClient])`
  - `const realiaService = useMemo(() => new RealiaService(realiaRepository), [realiaRepository])`
  - Pass `realiaService` in the `<App>` props spread
- [ ] `src/router/Tools.tsx`
  - Add `'realia'` to `tabIds` const (after `'dictionary'`, before `'date-converter'`)
  - Add `{ id: 'realia', title: 'Dictionary of Realia', icon: '𒀭' }` to `tabConfig` at index 2 (3rd)
  - Add `realiaService: RealiaService` to `getContent` params and `Tools` component props
  - Add `realia: <RealiaSearchPage realiaService={realiaService} />` to `contentByTab`
- [ ] `src/router/toolsRoutes.tsx`
  - Add `realiaService: RealiaService` to `ToolsRoutes` props type
  - Add `realia: 'Search the Dictionary of Realia for material culture, religion, and flora and fauna of the ancient Near East.'` to `tabDescriptions`
  - Add `<Route key="tools-realia-display" path="/tools/realia/:id" exact ...>` → `<RealiaDisplay realiaService={realiaService} id={decodeURIComponent(match.params.id ?? '')} />` (before the not-found catch-all)
  - Thread `realiaService` into all `<Tools>` renders

## Hard Gates

- [x] `yarn tsc` — zero TypeScript errors
- [x] `yarn lint` — zero lint errors
- [x] `yarn test --testPathPattern=realia` — all tests pass, 100% coverage
- [x] `yarn test --testPathPattern=Session` — Session tests still pass
- [ ] 100% coverage on all new files
- [ ] Zero console errors/warnings in any test run
- [ ] All code style consistent with instructions and existing codebase patterns
- [ ] QLTY clean

## Audit Findings (2026-06-02)

- [ ] **[S-01 HIGH]** Fix `RealiaRepository.search` — missing `encodeURIComponent(query)` in URL
- [ ] **[S-01 HIGH]** Add test for `search` with special characters (e.g. `'pig & boar'`) in `RealiaRepository.test.ts`
- [ ] **[S-02 MEDIUM]** Move auth gate so `RealiaDisplay` does not trigger API call for unauthorized users
- [ ] **[Q-01 LOW]** Replace `key={index}` with a stable composite key for `afoRegister` entries
