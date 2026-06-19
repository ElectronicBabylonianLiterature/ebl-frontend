# TASK-REALIA-SCROLL — work log

## Investigation

- Route `/tools/realia/:id` renders `RealiaDisplay` directly under `AppContent`,
  not inside `Tools`, so `Tools`' scroll reset / `useScrollToHash` do not apply.
- Probed the rendered `RealiaDisplay` DOM (rich entry): 0 `focus()` calls, 0
  `button`/`[tabindex]`/`[autofocus]` elements. CollapsibleCard headers are plain
  `<span onClick>` (not focusable).
- No global scroll-to-top exists; `router/compat` (react-router v6 shim) does not
  reset scroll on navigation. The issue therefore affects every website route.

## Change

- Added `src/router/ScrollToTop.tsx`: on `pathname` change it calls
  `window.scrollTo(0, 0)`, and skips when the URL has a `#hash` so it does not
  conflict with `useScrollToHash` (anchor navigation). It depends on
  `[pathname, hash]`, so query-string-only changes (e.g. `?query=` search and
  pagination) do NOT trigger a scroll.
- Uses `useLayoutEffect` (not `useEffect`) so the scroll is applied before the
  browser paints the new route, avoiding a visible jump from the old position.
  This is the idiomatic scroll-to-top pattern for a `BrowserRouter` app; the
  built-in `<ScrollRestoration>` is unavailable because the app does not use a
  data router (`createBrowserRouter`).
- Mounted `<ScrollToTop />` once inside the website-routes layout in
  `router/router.tsx` (within `main-body`, alongside `Header`). FullPageRoutes
  are outside this branch and keep their own scroll behaviour.
- Reverted the earlier Realia-only fix (deleted `common/hooks/useScrollToTop.ts`
  and its test; restored `RealiaDisplay.tsx`/`.test.tsx` to master).

## Cleanup of now-redundant per-page scroll calls

- Removed `window.scrollTo(0, 0)` from `about/ui/about.tsx` (tab switch) and
  `router/Tools.tsx` (tab switch). Both tab switches change the pathname, so the
  global component handles them.
- Removed the mount-time `window.scrollTo(0, 0)` from `about/ui/news.tsx`,
  `footer/ui/Impressum.tsx`, and `footer/ui/Datenschutz.tsx`. Navigating to those
  pages changes the pathname, so the global component handles them.
- Dropped the now-unused `pathname` prop from `Impressum`/`Datenschutz` and the
  `pathname={location.pathname}` wiring in `router/footerRoutes.tsx`.
- Removed the obsolete `Tools.test.tsx` test "scrolls viewport to top when
  switching tabs": its asserted code path (Tools' own `scrollTo`) was removed;
  the behaviour is now covered by `ScrollToTop.test.tsx`.
- Behaviour note: selecting a different newsletter on the News page now scrolls
  to the top (it pushes a new pathname), which is the intended global behaviour.

## Verification

- `yarn tsc` — clean.
- `yarn lint` — clean.
- `ScrollToTop` tests — 3 passed, console-clean, 100% coverage on
  `src/router/ScrollToTop.tsx`.
- Router/about/footer suites (router, compat, Tools, notFoundRoutes, sitemap,
  head, about, news, RealiaDisplay) — all pass.
- Full suite (`yarn test --watchAll=false`) — only failures are 3 pre-existing
  tests in `ApiImage.test.tsx` and `Corpus.integration.test.ts`, caused by an
  API-URL env mismatch (`localhost:8001` from `.env.local` vs expected
  `example.com`). Confirmed unrelated (identical before this change) and out of
  scope.
