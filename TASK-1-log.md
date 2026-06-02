# TASK-1: Dictionary of Realia Page — Work Log

## Purpose

Add a "Dictionary of Realia" page to the Tools section of the eBL frontend, backed by the new Realia API from <https://github.com/ElectronicBabylonianLiterature/ebl-api/pull/715>.

---

## Research Findings

### Backend API (ebl-api PR #715)

**Endpoints:**

- `GET /realia/{id}` — fetch single entry by ID (e.g. "Pig")
- `GET /realia?query=...` — search by ID or relatedTerms; max 15 results, sorted by `_id`

**JSON shape** (marshmallow `data_key` values = wire names):

```
{
  "_id": "Pig",
  "relatedTerms": ["Schwein", "Schweinefett"],
  "type": ["OBJECT_NAME"],
  "wikidataId": ["Q787"],
  "afoRegister": [
    { "mainWord": "Schwein", "note": "S.zucht...", "AfO": "52", "reference": "(2018) 645", "crossReference": "" }
  ],
  "reallexikon": [
    { "id": "...", "title": "Schwein A. · Pig A.", "reference": {...bibliographyObj}, "content": "Weszeli, 2009–2011" }
  ],
  "references": [ ...bibliographyReferenceObjects ]
}
```

**RealiaType enum** (12 values): `BUILDING_NAME`, `CELESTIAL_NAME`, `DIVINE_NAME`, `ETHNOS_NAME`, `FIELD_NAME`, `GEOGRAPHICAL_NAME`, `MONTH_NAME`, `OBJECT_NAME`, `PERSONAL_NAME`, `ROYAL_NAME`, `WATERCOURSE_NAME`, `YEAR_NAME`.

### UI Design (from screenshot)

1. **Header block**: `<h1>` with entry ID, Wikidata link(s), related terms, entity type
2. **Section I** — "Reallexikon der Assyriologie und Vorderasiatischen Archäologie": accordion (`CollapsibleCard`) per entry, label = `title (content)`
3. **Section II** — "AfO-Register Realien": flat list of `mainWord` / `note` / citation `[AfO {AfO} {reference}]`
4. **Section III** — "References": bibliography list using existing `ReferenceList` component

### Codebase Patterns

**Primary reference: `src/afo-register/`** — search-only tool pattern
**Primary reference: `src/signs/`** — search + detail page pattern

**Routing architecture:**

- `App.tsx` takes the `Services` interface as props and spreads them through `router.tsx` → `ToolsRoutes()`
- `src/router/Services.ts` — the central DI interface; adding `realiaService` here propagates automatically
- `src/InjectedApp.tsx` — instantiates all repositories and services via `useMemo`
- `src/router/Tools.tsx` — `tabIds` const, `tabConfig` array, `getContent()` mapping
- `src/router/toolsRoutes.tsx` — route definitions; detail pages added here alongside tab routes

**withData HOC** (`src/http/withData.tsx`):

```ts
withData<PROPS, GETTER_PROPS, DATA>(Component, getter, {
  watch,
  filter,
  defaultData,
})
```

- Shows Spinner while loading, ErrorAlert on failure
- `filter` prevents fetch when e.g. query is empty
- `watch` array triggers re-fetch when values change

**CollapsibleCard** (`src/common/ui/CollabsibleCard.tsx`):

- Props: `label: ReactNode`, `children: ReactNode`, `collapsed: boolean`
- Class component, manages open/closed state internally

**ExternalLink** (`src/common/ui/ExternalLink.tsx`):

- Renders `<a target="_blank" rel="noopener noreferrer">`

**ReferenceList** (`src/bibliography/ui/ReferenceList.tsx`):

- Props: `references: ReadonlyArray<Reference>`
- Groups by type, renders `CompactCitation` per group
- Shows "No references" when empty

**Reference type** (`src/bibliography/domain/Reference.ts`):

- Constructor: `(type, pages, notes, linesCited, document: BibliographyEntry)`
- `document` is a `BibliographyEntry` instance

**Auth gating pattern** (from `src/dictionary/ui/search/Dictionary.tsx`):

```tsx
<SessionContext.Consumer>
  {(session: Session) =>
    session.isAllowedToReadWords() ? <content /> : <p>Please log in...</p>
  }
</SessionContext.Consumer>
```

**Session.ts** — three locations to update per new scope:

1. `Session` interface — add method signature
2. `GuestSession` class — return `false`
3. `MemorySession` class — call `this.hasApplicationScope('readRealia')`

**Session.test.ts** — uses `describe.each` with `[scope, method]` pairs; add `['read:realia', 'isAllowedToReadRealia']`; also update `GuestSession` baseline expectations test.

---

## Decisions

| Decision          | Choice                                            | Reason                                                 |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------ |
| Search pattern    | Signs/Dictionary (results link to detail page)    | Rich nested content per entry suits dedicated page     |
| Search form       | Text input only                                   | API only supports single `query` param                 |
| Tab position      | 3rd, after Akkadian Dictionary                    | User instruction                                       |
| Auth              | New `read:realia` scope (`isAllowedToReadRealia`) | Dedicated scope per CAIC pattern; not reusing existing |
| Guest access      | Blocked (returns `false` in GuestSession)         | Feature is gated for now                               |
| Write routes      | None                                              | API is read-only                                       |
| Reference display | `bibliography/ui/ReferenceList`                   | Already used in fragment info panel and search results |

---

## Implementation Plan

### Phase 0 — Auth Scope

1. `src/auth/applicationScopes.json` — `"readRealia": "read:realia"`
2. `src/auth/Session.ts` — `isAllowedToReadRealia()` in interface, GuestSession (`false`), MemorySession (`hasApplicationScope('readRealia')`)
3. `src/auth/Session.test.ts` — add to `describe.each` table; add guest assertion

### Phase 1 — Domain + Infrastructure + Application

1. `src/realia/domain/RealiaEntry.ts` — `RealiaType`, `REALIA_TYPE_LABELS`, `AfoRegisterEntry`, `ReallexikonEntry`, `RealiaEntry`
2. `src/realia/infrastructure/RealiaRepository.ts` — `find(id)` → `GET /realia/{id}`, `search(query)` → `GET /realia?query=`; maps `_id` → `id`
3. `src/realia/application/RealiaService.ts` — thin delegation
4. Tests for all three

### Phase 2 — Search UI

1. `src/realia/ui/RealiaSearchForm.tsx` — text input + Search button; `navigate('/tools/realia?query=...')`
2. `src/realia/ui/RealiaResultsList.tsx` — `<ul>` of `<Link>` items
3. `src/realia/ui/RealiaSearch.tsx` — `withData` HOC
4. `src/realia/ui/RealiaSearchPage.tsx` — intro + auth gate + form + results
5. Tests

### Phase 3 — Detail UI

1. `src/realia/ui/RealiaDisplay.tsx` — 4 sections via `withData`, auth-gated
2. `src/realia/ui/Realia.sass`
3. Tests

### Phase 4 — Routing Integration

1. `src/router/Services.ts` — add `realiaService: RealiaService`
2. `src/InjectedApp.tsx` — `new RealiaRepository(apiClient)` + `new RealiaService(realiaRepository)`
3. `src/router/Tools.tsx` — add `'realia'` to `tabIds`, tab config at position 3, prop + `contentByTab` entry
4. `src/router/toolsRoutes.tsx` — description, service prop, `/tools/realia/:id` route

---

## Files

### New

- `src/realia/domain/RealiaEntry.ts`
- `src/realia/domain/RealiaEntry.test.ts`
- `src/realia/infrastructure/RealiaRepository.ts`
- `src/realia/infrastructure/RealiaRepository.test.ts`
- `src/realia/application/RealiaService.ts`
- `src/realia/application/RealiaService.test.ts`
- `src/realia/ui/RealiaSearchForm.tsx`
- `src/realia/ui/RealiaResultsList.tsx`
- `src/realia/ui/RealiaSearch.tsx`
- `src/realia/ui/RealiaSearch.test.tsx`
- `src/realia/ui/RealiaSearchPage.tsx`
- `src/realia/ui/RealiaSearchPage.test.tsx`
- `src/realia/ui/RealiaDisplay.tsx`
- `src/realia/ui/RealiaDisplay.test.tsx`
- `src/realia/ui/Realia.sass`

### Modified

- `src/auth/applicationScopes.json`
- `src/auth/Session.ts`
- `src/auth/Session.test.ts`
- `src/router/Services.ts`
- `src/InjectedApp.tsx`
- `src/router/Tools.tsx`
- `src/router/toolsRoutes.tsx`

---

## Progress Log

| Date       | Step                          | Status | Notes                                                                                               |
| ---------- | ----------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 2026-06-01 | Task docs created             | ✅     | TASK-1-todo.md, TASK-1-log.md                                                                       |
|            | Phase 0 auth scope            | ✅     | applicationScopes.json, Session.ts, Session.test.ts updated                                         |
|            | Phase 1 domain/infra/app      | ✅     | RealiaEntry.ts, RealiaRepository.ts, RealiaService.ts + tests + fixtures                            |
|            | Phase 2 search UI             | ✅     | RealiaSearchForm, RealiaResultsList, RealiaSearch, RealiaSearchPage + tests                         |
|            | Phase 3 detail UI             | ✅     | RealiaDisplay.tsx, Realia.sass + tests                                                              |
|            | Phase 4 routing               | ✅     | Services.ts, InjectedApp.tsx, Tools.tsx, toolsRoutes.tsx updated                                    |
|            | Fix TSC errors in test files  | ✅     | AppDriver.tsx, Tools.test.tsx, notFoundRoutes.test.tsx, sitemap.test.tsx updated with realiaService |
|            | Fix icon conflict             | ✅     | Changed realia icon from ⊕ (clash with genres) to ⊡                                                 |
|            | Fix prettier formatting       | ✅     | Ran npx prettier --write on affected files                                                          |
|            | yarn tsc                      | ✅     | 0 errors                                                                                            |
|            | yarn lint                     | ✅     | 0 errors                                                                                            |
|            | All tests green               | ✅     | 34 realia tests pass; 100% coverage (stmts/branches/funcs/lines); 0 console noise                   |
|            | Add RealiaSearchForm.test.tsx | ✅     | Full coverage of form submit, navigate, encoding                                                    |
|            | Add missing coverage tests    | ✅     | References section, reallexikon with null/non-null reference branches                               |
|            | Rename menu entry             | ✅     | 'Dictionary of Realia' → 'Realia' in tabConfig                                                      |
|            | Intro text → markdown         | ✅     | RealiaSearchPage uses MarkdownParagraph; test mocks it                                              |
|            | Realia icon + position        | ✅     | Icon ⊡ → 🌴; moved directly below 'Akkadian Dictionary' in tabConfig; tests updated                 |
| 2026-06-02 | Security audit (round 1)      | ✅     | TASK-1-review.md created; 3 findings: S-01 (HIGH), S-02 (MEDIUM), Q-01 (LOW) — all open             |
