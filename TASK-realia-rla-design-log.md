# TASK realia-rla-design — Work Log

## Goal

Give the RlA (Reallexikon) articles the same design as the AfO volumes:

- The RlA heading gets the same border and font as `Realia__afo-volume-title`.
- The RlA articles are no longer collapsible.
- The RlA surface looks like an AfO volume — spacing between sections, no border.

## Changes

- `src/realia/ui/RealiaDisplay.tsx`:
  - Removed the `corpus/ui/CollapsibleSection` import.
  - Rewrote `ReallexikonEntries` to render a static structure mirroring
    `AfoRegisterVolume`: a `Realia__rla-article` container, a `Realia__rla-title`
    heading (`<h3>`), and a `Realia__rla-references` content block holding the
    injected `<ReferenceList>`. No collapse toggle / indicator.
- `src/realia/ui/Realia.sass`:
  - Extracted the AfO volume design into shared placeholders
    `%realia-section-surface` (scroll margin + `& + &` spacing, no border) and
    `%realia-section-title` (sticky, border `1px solid brand-primary`, font, radius,
    shadow).
  - `.Realia__afo-volume` / `.Realia__afo-volume-title` now `@extend` those.
  - Added `.Realia__rla-article` / `.Realia__rla-title` extending the same
    placeholders, plus `.Realia__rla-references` padding for the citation block.
  - Removed the now-dead `.realia-collapsible__section-heading.collapsible_section__heading`
    rules.

## Notes

- The outer "I. Reallexikon …" section stays a collapsible `RealiaSection`, matching
  the outer "II. AfO-Register" section; only the inner per-article collapse was removed.
- No realia tests or the nav (`realiaSections.ts`) referenced the removed
  `realia-collapsible` / `CollapseIndicator` markup, so no test changes were needed.

## Gates

- `yarn tsc` — clean.
- `yarn lint` (eslint + stylelint) — clean.
- Realia suite — 11 suites / 111 tests pass, 1 snapshot, zero console output.

## Reminder

Remove the `TASK-realia-*` `.md` files before merging the PR.
