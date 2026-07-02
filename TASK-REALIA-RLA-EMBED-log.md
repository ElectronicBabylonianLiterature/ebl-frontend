# TASK-REALIA-RLA-EMBED — Research Log & Plan

## 1. Our current RlA model

`ReallexikonEntry { id, title, reference }` (`src/realia/domain/RealiaEntry.ts`).
`rlaArticleUrl(id) = https://publikationen.badw.de/de/rla/index#{id}`. Rendered
by `RealiaReallexikon.tsx` as a title + external-link icon. So `id` is the badw
article anchor (e.g. `6603`).

## 2. How the badw viewer works (reverse-engineered)

- The page `.../de/rla/index` is a jQuery **DataTables** table (not a SPA),
  enhanced by `cssjs/badw_publica/eigen.js`.
- Data source (DataTables ajax): `https://publikationen.badw.de/de/rla/index/index.json`
  — 3.82 MB, 12,830 rows, `Content-Type: application/json`,
  **`Access-Control-Allow-Origin: *`**.
- Each row: `DT_RowId` (= our `ReallexikonEntry.id`), cell `0` contains
  `onclick="rI(event,'a/{vol}.{scan}.jpg', <colspan>)"` + a "S. N" page label,
  cell `1` = category, cell `5` = volume, cell `6` = cross-references
  (`rowAt(id)` / `#id`).
- Clicking calls `rowImg` (alias `rI`), which injects an `<img src=path>` (or an
  `<object>` for a `.pdf` path) with ◁ / ▷ buttons. Paging calls
  `showAdjacentImage`, which parses the filename `{vol}.{scan}.{ext}` and
  increments/decrements `{scan}` — i.e. **multi-page = next scan number**.

## 3. Verified facts (all decisive for embedding)

- Image URL: `https://publikationen.badw.de/de/rla/a/{vol}.{scan}.jpg`
  -> HTTP 200, `image/jpeg`, ~0.5 MB/page, **`Access-Control-Allow-Origin: *`**
  (hotlinkable AND canvas-safe cross-origin).
- No `X-Frame-Options` / CSP `frame-ancestors` on the badw pages.
- `#6603` -> `DT_RowId 6603` -> `a/6.92.jpg` (vol 06, scan 92 = printed p. 59),
  category "Religion; Literature". Confirms `id == DT_RowId`.
- All images: single dir `a/`, all `.jpg`, filename `{vol}.{scan}.jpg`;
  filename volume always equals the row's volume cell.
- 12,443 / 12,830 rows have an image; 387 are cross-reference-only stubs (no
  image) — matches our "stub reallexikon" notion.
- Multi-page range is computable: within a volume, sort articles by scan number;
  an article spans `[startScan, nextArticleStartScan - 1]`. Example: 6603 =
  scans 92..97 = **6 pages**.
- IIIF: probed (`/iiif`, `/de/iiif`, manifest patterns) — not actually exposed.
- Per-volume PDF: no clean public URL found (`/de/rla/{vol}.pdf` -> 302); the PDF
  is only an internal fallback in the viewer. So image embedding is the primary
  supported path.

## 4. Options

- **A. Direct image embed (RECOMMENDED).** Resolve `id -> a/{vol}.{scan}.jpg` and
  render an `<img>` with a small prev/next pager (replicating badw's scan
  increment), bounded by the article's computed page range.
  - A1 (MVP, frontend-only): fetch badw `index.json` once, cache, build a
    `id -> {vol, startScan, endScan, pageLabel}` map.
  - A2 (production): backend ingests that mapping into each reallexikon entry at
    Realia import time (new DTO fields: `volume`, `startScan`, `pageCount`,
    `pageLabel`), so we do not depend on a 3.8 MB undocumented JSON at runtime.
- **B. PDF embed** (`<object data=".pdf#page=N">`): no clean public PDF URL; page
  vs scan vs printed-page mapping is extra work. Deprioritize.
- **C. IIIF**: not exposed by badw. Reject.
- **D. iframe the badw index anchored to `#id`**: loads their whole 12,830-row
  table and does not auto-open the image (only scrolls). Poor UX / heavy. Fallback
  only.

## 5. Recommended plan (phased)

**Phase 1 — MVP, frontend-only (Option A1).**

- One-time cached fetch of `index.json`; build the `id -> {vol,startScan,endScan,
pageLabel}` map (memoized; consider a service-worker/localStorage cache).
- Under each RlA subsection, a collapsible "View page" viewer:
  `<img src=.../a/{vol}.{scan}.jpg>` starting at `startScan`, ◁/▷ within
  `[startScan,endScan]`, caption "Seite {pageLabel} — page k of n", arrow-key
  support, and a "View on badw" external link (keep current icon).
- Lazy-load: only load the image when the subsection is expanded / in viewport;
  default to first page only.

**Phase 2 — production hardening (Option A2, backend).**

- Ingest the mapping into the realia data (ebl-api) so `ReallexikonEntry` carries
  `volume/startScan/pageCount/pageLabel`; drop the 3.8 MB client fetch. Optionally
  proxy/cache images through eBL.

**Nice-to-have — article beginning located on the image.**

- Not simple: the JPEGs are full pages with no coordinate/region data, and an
  article's first page also contains the tail of the previous article. Locating
  the start requires either OCR (find the bold lemma heading's y-offset, e.g.
  Tesseract.js client-side) or manual region annotation — both non-trivial and
  lower ROI. Recommend deferring; lightweight fallback = show the full first page
  with the article title as caption.

## 6. Risks / considerations

- **Licensing/permission**: images are public + CORS-open and badw displays them,
  but embedding/hotlinking on eBL should be cleared with badw (attribution).
  This is the main gating question, not a technical one.
- **Coupling to badw**: `index.json` structure and the `a/{vol}.{scan}.jpg` URL
  scheme are undocumented and could change. Mitigate via Phase 2 (backend ingest
  - our own cache).
- **Performance**: ~0.5 MB/page; mitigate with lazy-load + first-page-only.
- **Accuracy**: article end is approximated by the next article's start scan (an
  article may end mid-page). Acceptable for display; same limitation the badw UI
  has.

## 7. Phase 1 implemented (frontend-only, on-demand)

- `rlaPageIndex.ts`: on-demand, memoized fetch + parse of badw index.json into
  `id -> {volume,startScan,endScan,pageLabel}` (CORS-open). `rlaImageUrl()`.
- `RlaPageViewer.tsx`: per-article "Show RlA page" button -> loads the index on
  first use, shows the page image with bounded prev/next paging, caption, Hide.
- `RealiaReallexikon.tsx`: permission note at the top of the RlA section
  (Bayerische Akademie der Wissenschaften + Walter de Gruyter) + a viewer per
  article. Lazy: nothing loads until the user clicks.
- Tests: 100% coverage on the three new files; full suite 336 suites / 3396
  passed, zero console noise; tsc + lint clean.

## 8. Follow-up (this turn): sticky controls + eBL-consistent styling

Per user: page controls stick to the top-left of the visible RlA page and travel
on scroll; restyle controls + the acknowledgement note to match eBL conventions.

## 9. Follow-up implemented — sticky controls, eBL styling, Collapse

- Controls: sticky, **top-right**, pinned below the sticky `.Realia__rla-title`
  (`top: 2.75rem`, `z-index: 1` under the title's `2`, `margin-left: auto`),
  styled to match the title box (surface-subtle bg, brand-primary border, radius,
  shadow); FontAwesome chevrons; travels on scroll.
- Acknowledgement note: restyled as a subtle eBL surface panel (surface-subtle
  bg, light border, radius).
- Hide button: now `btn btn-outline-secondary btn-sm`, matching the toggle.
- Smooth show/collapse via react-bootstrap `Collapse` (the eBL convention, as in
  the nav): the index loads once, then Show/Hide animate open/closed without a
  refetch.

Gates (server stopped): `yarn tsc` clean; `yarn lint` (eslint + stylelint) clean;
full `yarn test --watchAll=false` = 336 suites / 3396 passed, 2 pre-existing
skips, 0 failures, zero console noise; 100% coverage on the three new files; all
files under the 250-line gate.

NOTE (memory): a running `craco start` dev server (~1.1 GB) OOM-killed the full
suite mid-run earlier; verified green in memory-bounded batches, then a clean
single run once the dev server was stopped.

## 10. Page-count bug fix + title/layout restructure

**Bug (off-by-one page count).** Verified against badw data: Stadtgott = scan 150
(p. 75); the next article "Stadtmauer" starts at scan 153 (**p. 78 — a shared
page**). Consecutive RlA articles share the boundary page (the next article begins
on the current one's last page), so `endScan = nextStartScan - 1` cut off that
shared page (showed 3 of 4). Fixed to `endScan = nextStartScan` (inclusive) →
Stadtgott now spans 150–153 = 4 pages (pp. 75–78). Last-article-in-volume still
bounds to its own start scan.

**Layout.** Consolidated the per-article rendering into a new `ReallexikonArticle`
component (renamed from `RlaPageViewer`). Moved the "Show RlA page" toggle to the
**top-right of the title** (`.Realia__rla-title-head`, flex space-between) and the
references **under the title text**, both inside `.Realia__rla-title`. The title
head is the sticky bar (so the page controls at `top: 2.75rem` still clear it);
references scroll under it. `RealiaReallexikon` now just renders the permission
note + a `ReallexikonArticle` per entry.

Tests: renamed `RlaPageViewer.test` → `ReallexikonArticle.test` (entry-prop based);
updated `RealiaDisplay.test` title selectors to `.Realia__rla-title-heading`.
100% coverage on the three RlA files; full suite 336 suites / 3396 passed, zero
console noise; tsc + lint clean; files under the 250-line gate.

## 11. Fix: RlA title sticky regression

The layout refactor put `position: sticky` on `.Realia__rla-title-head`, nested
inside the short `.Realia__rla-title` wrapper — sticky is bounded by its parent's
box, so it only stuck within that short wrapper (effectively not sticky). Moved
the sticky card styling back onto `.Realia__rla-title` (a direct child of the tall
`.Realia__rla-article`); the head is now a plain flex row inside it. Also lowered
the page controls to `top: 4.25rem` so they clear the taller sticky title (which
now includes the references). Gates: tsc + lint clean, full suite 336 / 3396
passed.
