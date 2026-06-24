# TASK-REALIA-NAV-MENU — TODO

Add a sticky **left** side navigation menu to the Realia entry page
(`RealiaDisplay`) that lists all sections and AfO-volume subsections, styled in
the eBL UI. Menu groups are uncollapsed by default; the menu's collapse toggles
drive the actual collapse state of the matching page sections (menu ⟷ page in
sync). The active section/subsection (scroll position) is highlighted.

Decisions (confirmed with user):

- Menu side: **left**.
- Collapse model: **menu toggles the page sections** (shared/controlled state,
  all sections open by default).

## Checklist

- [x] `common/hooks/useActiveSection` — IntersectionObserver scroll-spy hook
      returning the active id; generic + unit-tested.
- [x] `test-support` IntersectionObserver mock (controllable; trigger entries).
- [x] `realia/ui/realiaSections` — section id/label constants + `buildRealiaNav`
      builder (single source of truth for ids/labels, used by display + menu).
- [x] `realia/ui/RealiaNavMenu` — sticky nav, collapsible groups (caret toggles
      page section), section + subsection links, active highlight, a11y.
- [x] Rewrite `RealiaDisplay`: left layout, lift section collapse state (default
      open), controlled `Collapse` per section, anchor ids on sections + AfO
      volumes, wire menu (toggle + navigate + active id). Clicking a subsection
      link ensures its parent section is open before scrolling.
- [x] eBL-style SASS (layout grid, sticky nav card, active/hover states,
      responsive: stack on mobile).
- [x] Tests: menu renders all sections/subsections; toggle collapses page
      section; active highlight; navigate opens parent + scrolls; hook test.
- [x] 100% coverage on all changed/added files; tests console-clean.
- [x] `yarn lint` zero / `yarn tsc` zero.
- [x] Full `yarn test --watchAll=false` — 324 suites / 3294 passed (2 skipped),
      50 snapshots passed, zero console output (after follow-up changes).
- [ ] Remind to remove TASK-\* tracking files before merge.

## Follow-up (second request) — done

- [x] Menu header shows entry title + type (type only when given); clickable,
      links to and highlights the new top anchor (`realia-top`).
- [x] On-page section collapse restored: clickable section headings (caret +
      `aria-expanded`) sharing the controlled state with the menu (in sync);
      headings stay visible when collapsed.
- [x] Tests + 100% coverage on changed files; lint/tsc/full suite green.

## Implementation notes

- Nav labels intentionally omit the page's Roman numerals ("Reallexikon",
  "AfO-Register", "References", "See Also") so the menu reads as a clean ToC and
  does not collide with the page headings in tests/queries.
- Collapse model: each top-level section body is wrapped in a controlled
  react-bootstrap `Collapse`; the same `open` boolean feeds both the page
  `Collapse` and the menu toggle's `aria-expanded`, so the menu caret drives the
  page section (open by default). The shared `CollapsibleSection` was left
  untouched; Reallexikon per-entry collapsibles are unchanged.
- Updated existing tests: removed obsolete page-level `CollapseIndicator`
  assertions for AfO (collapse moved to the menu), rewrote the "collapsed by
  default" test to the new expanded-by-default behaviour, and scoped two
  AfO-volume `getByText` queries to `.Realia__afo-volume-details` (the volume
  label now also appears as a menu subsection link).

## Notes / design

- IDs: sections `realia-section-<key>`; AfO volumes `realia-afo-volume-<index>`
  (index in the reversed volume-group array, shared by display + nav builder so
  they align).
- Roman numerals stay fixed by section type (I Reallexikon, II AfO-Register,
  III References, IV See Also), matching current rendering.
- Reuse `groupAfoRegisterByVolume` + reverse + `formatAfoRegisterVolumeTitle`
  (already used for rendering) — no duplicated grouping logic (DRY).
- `scrollIntoView` is globally stubbed in setupTests; IntersectionObserver is
  NOT in jsdom → add a controllable mock for tests (root-cause-clean, not a
  console silencer).
- Top-level sections become menu-driven collapsibles; the shared
  `CollapsibleSection` is left untouched (Reallexikon per-entry collapsibles
  stay as-is). Section bodies wrapped in react-bootstrap `Collapse` controlled
  by lifted state.
