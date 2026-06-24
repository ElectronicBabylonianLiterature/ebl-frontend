# TASK-REALIA-AFO-STICKY — Work Log

## Goal

Restyle the AfO volume titles (`.Realia__afo-volume-title`) in the project UI
style and make them sticky, so the current volume's title pins to the top of the
page while scrolling through that volume's entries in the AfO-Register section.

## Investigation

- The title is rendered in `RealiaDisplay.tsx` `AfoRegisterVolume` as an
  `<h3 className="Realia__afo-volume-title">` containing
  `.Realia__afo-volume-mainword` + `.Realia__afo-volume-details`.
- All volumes render inside a single `CollapsibleSection`
  ("II. AfO-Register Realien"). The collapsible (react-bootstrap `Collapse`)
  only applies `overflow: hidden` during the open/close transition, not in the
  steady open state, so `position: sticky` works once expanded.
- No ancestor in `Realia.sass` / `CollapsibleSection.sass` sets clipping
  overflow, and the app has no fixed/sticky global header, so `top: 0` pins to
  the top of the viewport.

## Change

`src/realia/ui/Realia.sass` — `.Realia__afo-volume-title`:

- `position: sticky; top: 0; z-index: 2` to pin while scrolling.
- Solid `background-color: $ebl-color-surface-subtle` so entries scroll
  _underneath_ the pinned title (a transparent sticky header would overlap).
- UI-style header look: brand accent `border-left`, `border-bottom`,
  rounded top corners, padding, and a subtle `box-shadow` to lift it off the
  scrolling content.

No markup/logic change — `RealiaDisplay.tsx` untouched.

## Gates

- `yarn lint` (eslint + stylelint) — PASS, zero errors.
- `yarn tsc` — PASS, zero errors.
- `yarn test --watchAll=false src/realia` — 10 suites / 97 tests PASS,
  console-clean. Existing tests still cover the title element via its children.
- Full `yarn test --watchAll=false` — run (CSS-only change, no JS affected).

## Follow-up changes (same task)

1. **Border on all sides.** Changed the volume title from a left/bottom accent
   to a full `border: 1px solid $ebl-color-brand-primary` with full
   `border-radius: 0.35rem` (chip/card look that reads cleanly when pinned).
2. **Link restyle (UI match + DRY).** Added a shared `%realia-link-pill`
   placeholder (brand border, brand-soft background, brand-dark text, rounded,
   hover state) and `@extend`-ed it from both `.Realia__afo-cross-reference a`
   and `.Realia__see-also a`, so the two link kinds match the new bordered UI
   from one definition (DRY). Tightened `.Realia__see-also` gap to `0.5rem` now
   that items are pills.

## Pre-existing issues found and fixed (per Copilot policy)

The full `yarn test --watchAll=false` surfaced 14 stale-snapshot failures in 3
suites — all pre-existing on this branch, none caused by the CSS work:

- `corpus/ui/ChapterView.integration` (6) and `corpus/ui/TextView.integration`
  (3): root cause is commit a827ec1e adding `data-testid="CollapseIndicator"`
  to the shared `CollapsibleSection`; dependent corpus snapshots were never
  updated. Diff is additions-only (`+ data-testid=...`) — legitimate DOM change,
  inspected then updated with `--updateSnapshot` on those two files (9 updated).
- `dictionary/ui/search/Dictionary.integration` (5): root cause is commit
  5f46444a gating the Realia tools-nav item on `read:realia` scope; that test's
  session lacks the scope, so the item correctly disappears. Diff is
  deletions-only (the `/tools/realia` nav entry) — inspected then updated
  (5 updated).

All snapshot updates were inspected before applying; none were updated globally.

## Notes

- jsdom does not apply compiled SASS, so sticky/positioning cannot be asserted
  in a unit test; verified by code review against the layout. No new test added
  because no JS behavior changed and no meaningful assertion is possible.
- Reminder: remove all TASK-\*.md tracking files before merging.
