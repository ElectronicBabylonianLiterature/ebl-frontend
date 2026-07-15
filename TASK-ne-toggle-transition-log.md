# TASK-ne-toggle-transition — Work Log

## Goal

Smooth transition when the named-entity tags display toggle (`toggle-named-entities`) is switched.

## Changes

- `NamedEntities.sass`:
  - `@keyframes named-entity-indicator-in` (opacity 0 → 1); applied to `.span-indicator.span-indicator--static`
    (display indicators only — editor indicators lack `--static`), so tags fade in on toggle-on.
  - `.named-entity-display .Transliteration__lines td { transition: padding-bottom 0.3s ease }` so the
    line-spacing eases open/closed. Scoped to the display wrapper, so the annotation editor's own
    `padding` transition is untouched.
- `Display.tsx`:
  - Wrapped the transliteration branch in a persistent `.named-entity-display` div (present whether the
    toggle is on or off) so the padding transition survives toggle-off.
  - `import 'fragmentarium/ui/text-annotation/NamedEntities.sass'` so the transition CSS is present on the
    first toggle.
- `NamedEntities.css.test.ts`: two cascade tests — the static (display) indicator gets the fade animation;
  the interactive (editor) indicator does not.
- `Display.test.tsx.snap`: updated for the new `.named-entity-display` wrapper (diff inspected — wrapper only).

## Design decisions

- Kept the mount/unmount of indicators (no always-mount), so the existing Display toggle tests
  (`not.toBeInTheDocument()` when off) stay valid.
- Dropped a `prefers-reduced-motion` guard: the css-cascade test harness flattens `@media` blocks (losing
  context), so an `animation: none` guard leaked in and won; the codebase uses no reduced-motion guards
  elsewhere, and an opacity fade is low-risk under reduced-motion.
- Trade-off: on toggle-off the bars unmount instantly while the spacing eases closed; a both-directions
  bar fade would need an always-mounted/hidden approach that changes the tested DOM contract.

## Gate results

- `yarn lint` (eslint + stylelint) → 0.
- `yarn tsc` → 0.
- Coverage on affected code: `Display.tsx` 100% stmts/branch/funcs/lines; the CSS change is covered by
  `NamedEntities.css.test.ts` (2 new cascade assertions).
- Full test suite: run in memory-bounded shards (whole-repo run OOMs at teardown on this box) + `src/editor`.
  (results below)
