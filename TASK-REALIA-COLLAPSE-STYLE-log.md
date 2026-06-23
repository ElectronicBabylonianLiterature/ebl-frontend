# TASK-REALIA-COLLAPSE-STYLE — Work Log

## 2026-06-23

### Investigation

- The app-standard collapsible is `corpus/ui/CollapsibleSection`, whose heading
  carries `${classNameBlock}__section-heading collapsible_section__heading`
  (the style the request points at) plus a caret indicator.
- Realia's `RealiaDisplay.tsx` uses the older `common/ui/CollabsibleCard`
  (Bootstrap card + `List__toggle` + `fa-angle` indicator) for Reallexikon
  entries and AfO volume cards.
- `CollapsibleSection` passes `mountOnEnter` to react-bootstrap `Collapse`, so
  collapsed content is not mounted — its own test asserts this. Realia's
  `CollapsibleCard` keeps collapsed content mounted, and several `RealiaDisplay`
  tests read that content while collapsed. Preserving that behaviour (also
  better for in-page search of a dictionary) requires `mountOnEnter={false}`.

### Plan

- Add a backward-compatible `mountOnEnter` prop to `CollapsibleSection`
  (default `true` → corpus behaviour unchanged).
- Replace both `CollapsibleCard` usages in `RealiaDisplay` with
  `CollapsibleSection` (`classNameBlock="realia-collapsible"`,
  `mountOnEnter={false}`); remove the `CollapsibleCard` import.
- Update the three collapse-indicator assertions in `RealiaDisplay.test.tsx`
  to the new indicator (`.collapsible_section__collapse-indicator`,
  collapsed = `fa-caret-right`).
- Add a `CollapsibleSection` test covering `mountOnEnter={false}`.

### Implementation

- `corpus/ui/CollapsibleSection.tsx`: added optional `mountOnEnter` prop
  (default `true`) passed through to `Collapse`, and a
  `data-testid="CollapseIndicator"` on the caret `<i>` (Testing-Library-friendly
  handle; mirrors `CollabsibleCard`'s existing convention). Corpus callers are
  unchanged (`mountOnEnter` defaults to the previous hard-coded `true`).
- `realia/ui/RealiaDisplay.tsx`: replaced both `CollapsibleCard` usages with
  `CollapsibleSection` (`classNameBlock="realia-collapsible"`,
  `mountOnEnter={false}` to keep collapsed content mounted as before); removed
  the `CollapsibleCard` import. The shared look comes from the global
  `collapsible_section__heading` style.
- `realia/ui/RealiaDisplay.test.tsx`: collapse-indicator count assertions stay
  on `getByTestId('CollapseIndicator')`; the collapsed-by-default assertion now
  checks `fa-caret-right` (caret style) instead of `fa-angle-down`.
- `corpus/ui/CollapsibleSection.test.tsx`: added a `mountOnEnter={false}` test
  asserting collapsed content stays in the document.

### Verification

- `yarn lint` — clean (resolved an initial `testing-library/no-node-access`
  error by switching from `document.querySelector` to the `data-testid` handle).
- `yarn tsc` — clean.
- `RealiaDisplay.test.tsx` + `CollapsibleSection.test.tsx` — 32 tests pass,
  both changed files 100% coverage, zero console output.
- Full `src/realia` suite — 91 tests pass, no console noise.
- No corpus integration tests render `TextView`/`Chapters`/`HowToCite`
  directly; the `CollapsibleSection` change is additive and backward
  compatible, so corpus behaviour is unchanged.

### Reminder

- Remove `TASK-REALIA-COLLAPSE-STYLE-todo.md` and
  `TASK-REALIA-COLLAPSE-STYLE-log.md` before merge.
