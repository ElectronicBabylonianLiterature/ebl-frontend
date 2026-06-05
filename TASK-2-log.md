# TASK-2: Realia UX/Layout Audit — Work Log

## Snapshot / Test gate (2026-06-05)

### Problem reported

5 snapshot failures from 1 test suite (`Dictionary.integration.test.ts`).

### Root cause

New Realia nav item added to `Tools.tsx` tab config caused the tools sidebar to include
a new `<a href="/tools/realia">` node, which is present in every integration test that
renders the full tools layout — staling 5 Dictionary integration snapshots.

### Fix

- Updated 5 stale snapshots in `Dictionary.integration.test.ts` via `--updateSnapshot`
  (after inspecting the diff to confirm it was only the Realia nav addition).
- Verified no other snapshot changes in that file.

### Pre-existing failures (NOT introduced by this branch)

- `Corpus.integration.test.ts` — 2 snapshot failures: `src="http://localhost:8001/images/..."` vs
  `src="http://example.com/images/..."`. Confirmed pre-existing on master by stash-test.
  Root cause: `.env.local` is being picked up by the test runner despite CRA convention
  that `.env.local` is excluded from `NODE_ENV=test`. This is a separate infra/config
  issue not introduced by this PR.
- `ApiImage.test.tsx` — 1 failure: same root cause (`.env.local` leaked API URL). Confirmed
  pre-existing on master. Not introduced by this branch.

### Mistaken update (corrected)

The initial `--updateSnapshot` run incorrectly included the Corpus integration test, which
baked `localhost:8001` into the snapshot. This was reverted using `sed` to restore
`http://example.com/...`. Verified via `git diff master` — no diff on Corpus snapshot.

### copilot-instructions.md update

Added full test suite hard gate and snapshot update instructions to the Testing and Quality section.

### Master baseline confirmation (2026-06-05)

Ran full suite on master state (via git stash) to establish baseline:

- `Dictionary.integration.test.ts` — 5 failures on stashed state (expected: committed Realia nav
  code renders the new tab, but stashed snapshot doesn't include it → confirms snapshot update correct)
- `Corpus.integration.test.ts` — 2 failures on both master and branch → pre-existing `.env.local` issue
- `ApiImage.test.tsx` — 1 failure on both master and branch → pre-existing `.env.local` issue
- All other 315 test suites pass on master
- User's CI run showed exactly 5 failures (no ApiImage/Corpus) → confirms those are dev-machine-only

### Final state

- All 5 originally-reported snapshot failures fixed ✓
- Dictionary.integration: 5/5 pass ✓
- `copilot-instructions.md` updated with full test suite hard gate ✓

Audit the UX and layout of the Realia search and detail pages. Compare against existing comparable pages in the project (AfO-Register, Akkadian Dictionary, Signs). Document all findings with severity, reproduction steps, and recommendations.

---

## Research Basis

### Comparable pages studied

| Page                | File                                            | Key patterns observed                                                                                                         |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AfO-Register Search | `src/afo-register/ui/AfoRegisterSearchPage.tsx` | `ebl-consistent-links` wrapper; `Markdown` with `className`; `AboutInlineLink`; search conditionally mounted (`!!query.text`) |
| Akkadian Dictionary | `src/dictionary/ui/search/Dictionary.tsx`       | `AppContent` wrapper; `AboutInlineLink`; session guard at top level                                                           |
| Signs Search        | `src/signs/ui/search/Signs.tsx`                 | `AppContent` wrapper; `AboutInlineLink`; session guard at top level                                                           |
| Word Display        | `src/dictionary/ui/display/WordDisplay.tsx`     | `AppContent` with breadcrumbs; dynamic `HeadTags` title; `ebl-consistent-links`                                               |
| Sign Display        | `src/signs/ui/display/SignDisplay.tsx`          | `AppContent` with breadcrumbs (SectionCrumb + TextCrumb)                                                                      |

### Design system studied

- `AppContent` (`src/common/ui/AppContent.tsx`): standard page wrapper providing breadcrumbs, `<main>`, `<header>` with `<h2>` title.
- `AboutInlineLink` (`src/common/ui/AboutInlineLink.tsx`): ℹ icon link to "learn more" page; used by Dictionary, Signs, AfO-Register.
- `Markdown` / `MarkdownParagraph` (`src/common/ui/Markdown.tsx`): `Markdown` accepts optional `className`; `MarkdownParagraph` does not add one automatically.
- `_sidebar-page-shell.sass`: mixin applied in `tools.sass`; defines `.tools-content__body`, `.tools-content__header`, `.tools-nav__icon`, etc.
- `ebl-consistent-links`: CSS class for consistent link styling in content areas.

---

## Findings

### F-1 — "No results found." shown before any search is entered

- **Severity**: Critical
- **File**: `src/realia/ui/RealiaSearch.tsx`, `src/realia/ui/RealiaResultsList.tsx`
- **Reproduction**: Open `/tools/realia` without a query. The page shows "No results found." immediately.
- **Root cause**: `withData` uses `filter: (props) => props.query.trim().length > 0` which returns false when query is empty. The `defaultData: () => []` is used as the data value and the component is still rendered, causing `RealiaResultsList` to display "No results found." for `entries = []`.
- **Comparison**: AfO-Register conditionally mounts the search component: `{!!query.text && <AfoRegisterSearch ... />}`. When there is no query, nothing is shown.
- **Recommendation**: In `RealiaSearchPage`, conditionally render `<RealiaSearch>` only when `query.trim().length > 0` (matching the AfO-Register pattern). Remove `filter` and `defaultData` from `withData` in `RealiaSearch.tsx`, or keep them but ensure the list component is never mounted with an empty query.

---

### F-2 — Search input has no accessible label

- **Severity**: High
- **File**: `src/realia/ui/RealiaSearchForm.tsx`
- **Reproduction**: Inspect the search input in the Realia tab. It has only `placeholder="Search"` — no `<label>`, no `aria-label`, no `aria-labelledby`. Fails WCAG 1.3.1 and 3.3.2.
- **Root cause**: `Form.Group` has no `controlId`, and no `Form.Label` is provided.
- **Comparison**: AfoRegister form uses `aria-label` on inputs; Dictionary `WordSearchForm` uses `Form.Label` elements.
- **Recommendation**: Add `controlId="realia-search-query"` to `Form.Group` and a `Form.Label` (or at minimum `aria-label="Search realia"` on `Form.Control`).

---

### F-3 — RealiaDisplay has no AppContent wrapper / no breadcrumbs

- **Severity**: High
- **File**: `src/realia/ui/RealiaDisplay.tsx`
- **Reproduction**: Navigate to a Realia entry (e.g., `/tools/realia/Pig`). There are no breadcrumbs, no standard page header. The page starts with a bare `<h1>` with no layout wrapper.
- **Root cause**: `RealiaDisplay` renders directly without `AppContent`. All other detail pages (`WordDisplay`, `SignDisplay`) use `AppContent` with `SectionCrumb` + `TextCrumb`.
- **Comparison**: `SignDisplay` uses `<AppContent crumbs={[new SectionCrumb('Signs'), new TextCrumb(sign.displaySignName)]}>`. `WordDisplay` uses `<AppContent crumbs={[new SectionCrumb('Akkadian Dictionary'), new TextCrumb(word._id)]}>`.
- **Recommendation**: Wrap `RealiaEntryDisplay` in `AppContent` with `crumbs={[new SectionCrumb('Realia'), new TextCrumb(entry.id)]}`.

---

### F-4 — Hardcoded hex color values in Realia.sass

- **Severity**: High
- **File**: `src/realia/ui/Realia.sass`
- **Reproduction**: Two rules use `color: #6c757d` (Bootstrap gray-600) and `font-size: 0.9rem`.
- **Root cause**: Design tokens not used. The project uses `$ebl-color-*` tokens from `src/design-tokens`.
- **Comparison**: `_sidebar-page-shell.sass` uses `$ebl-color-text-secondary`, `$ebl-color-brand-primary`, etc. exclusively.
- **Recommendation**: Replace `#6c757d` with `$ebl-color-text-secondary` (or appropriate token). Import design tokens at the top of `Realia.sass`.

---

### F-5 — `crossReference` field of AfoRegisterEntry is never rendered

- **Severity**: High
- **File**: `src/realia/ui/RealiaDisplay.tsx`
- **Reproduction**: Inspect the `AfoRegisterEntry` interface — it has `crossReference: string`. In `RealiaDisplay`, only `mainWord`, `note`, `AfO`, and `reference` are rendered; `crossReference` is silently dropped.
- **Root cause**: The field was defined in the domain model but not rendered in the display component.
- **Recommendation**: Render `crossReference` when non-empty (e.g., "See also: {crossReference}").

---

### F-6 — HeadTagsService title is static on the Realia detail route

- **Severity**: High
- **File**: `src/router/toolsRoutes.tsx`
- **Reproduction**: Navigate to `/tools/realia/Pig`. The browser tab title is "Realia entry: eBL" regardless of the actual entry.
- **Root cause**: The route uses `title="Realia entry: eBL"` and `description="Dictionary of Realia entry at the electronic Babylonian Library (eBL)."` — neither includes the entry ID.
- **Comparison**: The sign route uses `title={\`Cuneiform sign ${sign.displaySignName}: eBL\`}`(dynamic). The Realia route has access to`match.params.id`which could be used:`title={\`Realia: ${decodeURIComponent(match.params.id ?? '')} - eBL\`}`.
- **Recommendation**: Use `title={\`Realia: ${decodeURIComponent(match.params.id ?? '')} - eBL\`}` on the detail route.

---

### F-7 — No AboutInlineLink on the Realia search page

- **Severity**: Medium
- **File**: `src/realia/ui/RealiaSearchPage.tsx`
- **Reproduction**: Compare the Realia tab with Dictionary, Signs, and AfO-Register tabs — all three show a ℹ icon linking to a "learn more" page. Realia has no such link.
- **Recommendation**: Add `<AboutInlineLink to="/about/realia" label="Realia" />` once an About page exists (or point to the PR/docs for now). This is blocked by the absence of an about page, but the component slot should be prepared.

---

### F-8 — Intro MarkdownParagraph has no className

- **Severity**: Medium
- **File**: `src/realia/ui/RealiaSearchPage.tsx`
- **Reproduction**: The intro paragraph cannot be targeted by CSS. All comparable intro blocks have a class (e.g., `"AfoRegister__introduction"`, `"dossiers-search-page__introduction"`).
- **Recommendation**: Pass `className="realia-search-page__introduction"` to `MarkdownParagraph`.

---

### F-9 — No search header wrapper div with class

- **Severity**: Medium
- **File**: `src/realia/ui/RealiaSearchPage.tsx`
- **Reproduction**: The form is rendered without a container div. AfoRegister uses `<div className="AfoRegister__search-header">` + `<div className="AfoRegister__search">` to layout the form and AboutInlineLink side by side. Signs uses `<div className="signs__search-header">`.
- **Recommendation**: Add `<div className="realia-search-page__search-header">` wrapping form and (future) AboutInlineLink.

---

### F-10 — relatedTerms and type metadata fields have no labels

- **Severity**: Medium
- **File**: `src/realia/ui/RealiaDisplay.tsx`
- **Reproduction**: On an entry with `relatedTerms` and `type`, the metadata block shows the values as bare text with no label. A user cannot tell what "Pig (animal)" refers to without context.
- **Recommendation**: Add visible labels: `<span>Related terms: {entry.relatedTerms.join(', ')}</span>` and `<span>Type: {typeLabels}</span>`.

---

### F-11 — RealiaResultsList has no BEM class on list/item elements

- **Severity**: Low
- **File**: `src/realia/ui/RealiaResultsList.tsx`
- **Reproduction**: The `<ul>` and `<li>` elements have no CSS classes, relying entirely on browser default list styling.
- **Recommendation**: Add `className="realia-results-list"` to `<ul>` and `className="realia-results-list__item"` to `<li>`.

---

### F-12 — Search results show only entry ID; no preview metadata

- **Severity**: Low
- **File**: `src/realia/ui/RealiaResultsList.tsx`
- **Reproduction**: A search for "pig" returns a list of IDs as links with no context (type, related terms). Compare with Dictionary which shows CDA guide words and sources alongside results.
- **Recommendation**: Show type labels and/or related terms alongside the ID, e.g., "Pig — Object Name | pig, swine".

---

### F-13 — Search form: input and button are stacked vertically, not inline

- **Severity**: Low
- **File**: `src/realia/ui/RealiaSearchForm.tsx`
- **Reproduction**: The search `<Button>` sits below the `<Form.Group>` with only `className="mt-2"`. AfoRegister uses `<Row>`/`<Col>` to place input and button in a horizontal row.
- **Recommendation**: Wrap in `<Row>` with `<Col>` for the input and a narrow `<Col>` for the button to match other search forms.

---

## Progress Log

| Date       | Step                                          | Status     | Notes                                                                                                                              |
| ---------- | --------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-04 | UX audit completed                            | ✅         | 13 findings documented across Critical/High/Medium/Low severity                                                                    |
| 2026-06-04 | F-4, F-6 implemented                          | ✅         | Design tokens in Realia.sass; dynamic HeadTagsService title in toolsRoutes.tsx                                                     |
| 2026-06-04 | F-1, F-8, F-9 implemented                     | ✅         | RealiaSearch conditionally rendered; intro/header wrapper classes added                                                            |
| 2026-06-04 | F-2, F-13 implemented                         | ✅         | Form.Label + controlId; Row/Col inline layout in RealiaSearchForm                                                                  |
| 2026-06-04 | F-3, F-5, F-10 implemented                    | ✅         | AppContent+breadcrumbs, crossReference, metadata labels in RealiaDisplay                                                           |
| 2026-06-04 | F-11, F-12 implemented                        | ✅         | BEM classes and subtitle preview in RealiaResultsList; new test file created                                                       |
| 2026-06-04 | All tests updated                             | ✅         | 47 tests pass, 0 console noise; RealiaResultsList.test.tsx created                                                                 |
| 2026-06-04 | Lint + tsc + tests                            | ✅         | All gates pass: lint clean, tsc clean, 47/47 tests green                                                                           |
| 2026-06-04 | F-7 status                                    | ⛔ BLOCKED | No /about/realia page in project; structural wrapper added, awaiting page creation                                                 |
| 2026-06-04 | Remove h2, spacing, bold label                | ✅         | `hideHeading` prop added to AppContent; spacing via Realia.sass; fw-bold on Form.Label; 55 tests pass                              |
| 2026-06-04 | Remove AppContent h2, add spacing, bold label | ✅         | Added `hideHeading` prop to AppContent; `.realia-search-page__search-header` margin-bottom; `fw-bold` on Form.Label; 55 tests pass |
