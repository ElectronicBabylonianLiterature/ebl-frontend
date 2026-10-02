# TASK rla-vol15 — Work log

## 2026-09-25 — Investigation

- Live entry `GET https://www.ebl.lmu.de/api/realia/Zylinder%20als%20Schrifttr%C3%A4ger` has one `reallexikon` link: id `12826`, "Zylinder als Schriftträger · Cylinder, as inscription bearer" (RlA 15, Taylor).
- badw index `https://publikationen.badw.de/de/rla/index/index.json` (12,830 rows) has row `12826` with the same title, but its page call is `rI(event,'a/15.354.pdf',7,1,1210)`.
- `rlaPageIndex.ts` parses page calls with `/rI\(event,'[^']*\/(\d+)\.(\d+)\.jpg'/`. The `.pdf` call does not match, the row is dropped, `index.get('12826')` is `undefined`, and the UI shows "No RlA page image is available for this article."
- Page-call formats in the badw index: volumes 1–14 are all `.jpg` (12,443 rows); volume 15 is all `.pdf` (387 rows). There is no `.jpg`/`.png`/`.webp` rendition of vol. 15 (`a/15.354.jpg` → 404, `a/15.354.pdf` → 200 `application/pdf`).
- Scope in eBL data (union of `/realia?query=a|e|i|o|u|y`, 23,437 entries, 9,729 RlA links): every RlA id exists in the badw index, so there are no broken mappings. 290 links on 254 realia entries point to vol. 15 and all hit this bug (e.g. `Wasser`, `Handel`, `Kauf`, `Kultbild`, `Hammurapi (König von Babylon)`, `Weben, Weberei`).
- 51 eBL titles differ from the badw title only by collapsing identical German/English halves (`Altar` vs `Altar · Altar`); not a defect.
- Conclusion: the data is correct; the frontend parser must accept vol. 15 PDF pages.
- The RlA site renders these with `<object data="…pdf#navpanes=0&statusbar=0&toolbar=0&view=FitH" type="application/pdf">` plus a fallback link (`cssjs/badw_publica/eigen.js`, `rowImg`). The PDFs send `Access-Control-Allow-Origin: *` and no `X-Frame-Options`/CSP, so the same embed works from eBL. Each vol. 15 PDF is one page, MediaBox 487.559 × 694.488 pt.

## Pre-existing issues noticed

- `GET /api/realia/all` on the live API returns `404 Realia entry 'all' not found.` — the lemma route shadows it. `listAllRealia` is only used by `src/router/sitemap.tsx`. This lives in the backend (ebl-api route order), outside this repository; reported to the user rather than fixed here.

## 2026-09-25 — Fix

- Branch `fix/rla-volume-15-pdf-pages` created from `origin/master` (`e281f7ba`) with `--no-track`; `branch.<name>.merge` is unset.
- `src/realia/infrastructure/rlaPageIndex.ts`: the page-call regex now accepts `.jpg` and `.pdf`; `RlaPageInfo` carries `format: 'jpg' | 'pdf'`; `rlaImageUrl(volume, scan)` became `rlaPageUrl(volume, scan, format)`.
- `src/realia/ui/ReallexikonArticle.tsx`: new `RlaPageView` renders `<img>` for JPG pages and, for PDF pages, `<object type="application/pdf">` with the RlA site's viewer parameters (`#navpanes=0&statusbar=0&toolbar=0&view=FitH`) and an `ExternalLink` fallback to the PDF. The `<object>` is keyed by URL so paging remounts it (browsers do not reliably reload an `<object>` when only `data` changes).
- `src/realia/ui/Realia.sass`: `.Realia__rla-page-document` is full width with `aspect-ratio: 487.559 / 694.488` (the vol. 15 MediaBox). Compiled with dart-sass: output is `aspect-ratio: 487.559/694.488`, not a divided number.
- Tests: parser covers PDF rows (range, label, format) and both URL forms; article covers the PDF embed, its fallback link, and paging between PDF pages. Existing article tests now pass an explicit `jpg` format.

## Gates

- Coverage (changed files, with `RealiaReallexikon.test.tsx` which covers the `entry.reference` branch): `rlaPageIndex.ts` 100/100/100/100, `ReallexikonArticle.tsx` 100/100/100/100.
- Line counts: `ReallexikonArticle.tsx` 204, `ReallexikonArticle.test.tsx` 165, `rlaPageIndex.ts` 117, `rlaPageIndex.test.ts` 120 (all ≤ 250).
- `yarn lint`: exit 0, no output.
- `yarn tsc`: exit 0, no output.
- Running the modified app: NOT VERIFIED here (`yarn start`/`yarn build` OOM in this container). The embed markup mirrors what the RlA site itself uses for the same PDFs.
- `yarn test:ci` does not exist on `master` (it is added by the unmerged PR #774 branch). Ran master's exact CI command instead (`.github/workflows/main.yml:50`): `CI=true NODE_OPTIONS=--max_old_space_size=1536 yarn test --coverage --forceExit --detectOpenHandles --watch=false` → 435/435 suites, 4187/4187 tests, 50/50 snapshots, exit 0; no `console.*`, `Warning:`, unhandled-rejection or open-handle output.
