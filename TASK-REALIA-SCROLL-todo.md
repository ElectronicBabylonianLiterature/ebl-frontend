# TASK-REALIA-SCROLL — Pages open scrolled down instead of at the top

## Problem

Opening a detail page (e.g. `/tools/realia/Enlil%2C%20Ellil`) left the window
scrolled partway down instead of at the top.

## Root cause

- The detail page itself renders no autofocus / focusable button / hash target /
  scroll call (verified by probing the rendered DOM).
- The app performed no scroll reset on client-side navigation (react-router v6
  via `router/compat`). Only `Tools` and a few static pages reset scroll.
- Reaching a page from a scrolled list (or browser scroll restoration) therefore
  preserved the previous scroll position. This affects every website route, not
  just Realia.

## Decision

Fix globally (per user request) instead of per-page.

## Plan

- [x] Add a global `ScrollToTop` component that resets scroll on pathname change,
      skipping when the URL has a `#hash` (so it does not fight `useScrollToHash`).
- [x] Mount it once inside the website-routes layout in `router/router.tsx`.
- [x] Revert the earlier Realia-only fix (hook + component edit) — now redundant.
- [x] Remove now-redundant per-page scroll calls (about, news, Impressum,
      Datenschutz, Tools tab switch) and the obsolete Tools scroll test.
- [x] Add tests for `ScrollToTop`.
- [x] `yarn lint` clean.
- [x] `yarn tsc` clean.
- [x] `yarn test --watchAll=false` — no new failures (2 pre-existing, unrelated).
- [ ] Remind to remove TASK-REALIA-SCROLL-\*.md before merge.
