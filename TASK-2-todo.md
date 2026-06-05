# TASK-2: Realia UX/Layout Audit & Remediation

## Status: Audit complete — awaiting user decision on remediation

---

## Phase A — Audit (completed)

- [x] Read all Realia UI files (`RealiaSearchPage`, `RealiaSearchForm`, `RealiaSearch`, `RealiaResultsList`, `RealiaDisplay`, `Realia.sass`)
- [x] Read comparable pages: `AfoRegisterSearchPage`, `Dictionary`, `Signs`, `DossiersSearchPage`
- [x] Read shared layout components: `AppContent`, `AboutInlineLink`, `Markdown`/`MarkdownParagraph`, `_sidebar-page-shell.sass`
- [x] Read `toolsRoutes.tsx` for route/HeadTags patterns
- [x] Document all findings with severity

---

## Phase B — Remediation (completed, except blocked F-7)

Ordered by severity. Each item references the finding ID in TASK-2-log.md.

### Critical

- [x] **F-1** Fix "No results found." shown on initial page load (before any search)
  - File: `src/realia/ui/RealiaSearchPage.tsx` (conditionally render `RealiaSearch`)

### High

- [x] **F-2** Add `aria-label` (or `Form.Label`) to `RealiaSearchForm` search input
  - File: `src/realia/ui/RealiaSearchForm.tsx`
- [x] **F-3** Wrap `RealiaDisplay` in `AppContent` with breadcrumbs (Tools → Realia → {entry id})
  - File: `src/realia/ui/RealiaDisplay.tsx`
- [x] **F-4** Replace hardcoded `#6c757d` hex colors with design tokens in `Realia.sass`
  - File: `src/realia/ui/Realia.sass`
- [x] **F-5** Render `crossReference` field in `RealiaDisplay` AfO-Register section
  - File: `src/realia/ui/RealiaDisplay.tsx`
- [x] **F-6** Make `HeadTagsService` title dynamic (include entry ID) on the Realia detail route
  - File: `src/router/toolsRoutes.tsx`

### Medium

- [~] **F-7** Add `AboutInlineLink` to `RealiaSearchPage` — **BLOCKED** (no `/about/realia` page exists)
  - Structural wrapper div added (F-9); can be added when about page is created
- [x] **F-8** Add `className` to the intro `MarkdownParagraph` for CSS targetability
  - File: `src/realia/ui/RealiaSearchPage.tsx`
- [x] **F-9** Add wrapper div with class to search header area (for CSS layout)
  - File: `src/realia/ui/RealiaSearchPage.tsx`
- [x] **F-10** Label metadata fields in `RealiaDisplay` (`relatedTerms`, `type`)
  - File: `src/realia/ui/RealiaDisplay.tsx`

### Low

- [x] **F-11** Add BEM class to `RealiaResultsList` `<ul>` and `<li>` elements
  - File: `src/realia/ui/RealiaResultsList.tsx`
- [x] **F-12** Show richer result preview in `RealiaResultsList` (type or relatedTerms)
  - File: `src/realia/ui/RealiaResultsList.tsx`
- [x] **F-13** Use `Row`/`Col` layout in `RealiaSearchForm` to align input and button horizontally
  - File: `src/realia/ui/RealiaSearchForm.tsx`

## Phase C — UX Polish

- [x] Remove `<h2 class="main__heading">` from Realia detail page
  - Added `hideHeading` prop to `AppContent`; passed it from `RealiaDisplay`
- [x] Add spacing between search header and results
  - Added `margin-bottom: 2rem` to `.realia-search-page__search-header` in `Realia.sass`
- [x] Bold the "Search realia" label
  - Added `className="fw-bold"` to `Form.Label` in `RealiaSearchForm`
