# TASK-REALIA-NAV-MENU — Work Log

## Goal

Sticky **left** navigation menu on the Realia entry page listing all sections
and AfO-volume subsections, eBL-styled. Menu groups open by default; the menu
collapse toggles drive the page sections' collapse state (in sync). Active
section/subsection highlighted from scroll position.

## What was built

- `src/common/hooks/useActiveSection.ts` — generic scroll-spy hook. Observes the
  given element ids with `IntersectionObserver` and returns the topmost visible
  id (sorted by `boundingClientRect.top`); disconnects on cleanup.
- `src/test-support/intersectionObserverMock.ts` — controllable IO mock
  (`IntersectionObserver` is absent in jsdom). Records instances/observed
  elements; `triggerIntersection(...)` drives the latest observer's callback so
  scroll-spy can be tested deterministically (root-cause-clean — not a console
  silencer).
- `src/realia/ui/realiaSections.ts` — single source of truth for section
  ids/labels + `buildRealiaNav(...)` (reuses the existing volume grouping;
  no duplicated domain logic — DRY).
- `src/realia/ui/RealiaNavMenu.tsx` — sticky nav; per-section caret toggle
  (drives page collapse), section + subsection links, `is-active` /
  `is-active-group` highlight, `aria-expanded` / `aria-current` a11y.
- `src/realia/ui/RealiaDisplay.tsx` — rewritten to a left `Realia__layout`
  (nav + content). `useRealiaSectionState` lifts per-section open state
  (default open, reset on entry change). Each top-level section body is a
  controlled `Collapse`; the same `open` boolean feeds both the page Collapse
  and the menu toggle. Anchor ids on sections + AfO volumes; clicking a
  subsection link opens its parent then `scrollIntoView` (reuses
  `prefersReducedMotion`). `useActiveSection` provides the active id.
- `src/realia/ui/Realia.sass` — `Realia__layout` flex (stacks under `md`),
  sticky `Realia__nav` card (surface bg, border, shadow), nav title/list/row,
  caret toggle, link/sublink with brand hover + active states, `scroll-margin`.

## Design decisions

- Nav labels omit the Roman numerals (page headings keep them) — clean ToC and
  avoids text collisions with the page headings.
- Collapse is menu-driven via shared controlled state; shared `CollapsibleSection`
  untouched; Reallexikon per-entry collapsibles unchanged.

## Tests

- New: `useActiveSection.test.tsx`, `realiaSections.test.ts`,
  `intersectionObserverMock.test.ts`; extended `RealiaDisplay.test.tsx`
  (menu lists sections + AfO subsections; toggle round-trip; subsection click
  re-opens + scrolls; reduced-motion instant scroll; scroll-position highlight).
- Updated existing AfO tests for the new design (see todo file).
- Coverage: 100% stmts/branch/funcs/lines on all 5 changed/added source files.

## Gates

- `yarn lint` (eslint + stylelint) — PASS.
- `yarn tsc` — PASS.
- `yarn test src/realia src/common/hooks` — 18 suites / 156 tests PASS,
  console-clean.
- Full `yarn test --watchAll=false` — final run in progress.

## Follow-up (same task, second request)

- Menu header: replaced the static "On this page" text with the entry **title**
  and **type** (type shown only when given). The header is a clickable link to
  a new top anchor (`realia-top`, wrapping the h1 + metadata) and highlights
  when the top of the page is in view. The nav's accessible label remains
  "On this page".
- Restored on-page collapsing: each section heading is now a clickable toggle
  (caret + `aria-expanded`) that shares the same controlled `open` state as the
  menu, so collapsing works both on the page and in the menu, and the two stay
  in sync. Collapsed sections keep their heading visible on the page.
- `RealiaSection.onToggle` takes the section id and is wired to the single
  `toggleSection` callback (no per-section inline closures) — keeps function
  coverage clean.
- Tests added: menu shows title + type and links to `#realia-top`; type omitted
  when empty; title click scrolls to top; title highlights when top is in view;
  on-page heading toggle collapses and stays in sync with the menu. Scoped the
  existing "Type:" assertion to `.Realia__metadata span` (the type now also
  appears in the menu header). Coverage remains 100% on all changed files.

## Notes

- The full suite is memory-tight in this container (app dev server holds
  ~1.2 GB); a clean run with no competing processes is required. Earlier
  "exited too early" results were OOM, not test failures.
- Reminder: remove all TASK-\*.md tracking files before merging.
