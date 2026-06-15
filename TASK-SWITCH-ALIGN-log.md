# TASK-SWITCH-ALIGN — Work log

## Investigation

- Switches rendered in `src/chronology/ui/DateEditor/DateSelectionInput.tsx`
  (`getYearInputGroup`): year input + Broken/Uncertain on line 1; a
  `date-field-row-break` (flex-basis 100%) forces a wrap, then a
  `date-field-row-spacer` precedes the Reconstructed/Emended switches on line 2.
- Styles: `src/chronology/ui/DateEditor/DateSelectionInput.sass`.
- Cause: spacer was rigid `flex: 0 0 8em` while the year input is a Bootstrap
  `.input-group > .form-control` (`flex: 1 1 auto; width: 1%; min-width: 0`,
  specificity 0,2,0 beats `.date-field-input` 0,1,0), capped only by `max-width: 8em`.
  In a narrow column the input shrinks below 8em but the spacer stays 8em, offsetting
  the second row to the right.

## Fix

- `.date-field-row-spacer`: `flex: 0 0 8em; max-width: 8em` ->
  `flex: 1 1 auto; min-width: 0; max-width: 8em`.
- Line 1 (input + 2x9em switches) and line 2 (spacer + 2x9em switches) now have
  identical flex layouts in the same container, so the spacer always resolves to the
  same width as the input — the second row lines up at every column width (whether the
  flexible item grows to the 8em cap or shrinks).

## Correction after user feedback ("moved them to the left instead")

- The flexible spacer correctly made the spacer track the year input width, but it
  exposed a second, primary cause: Bootstrap's
  `.input-group > :not(:first-child):not(...)` rule (specificity ~0,7,0) forces
  `margin-left: -1px` on every non-first child, overriding the `10px` that
  `.date-field-switch` / `.date-field-input-group .form-switch` (lower specificity)
  tried to apply to Reconstructed/Emended (and Intercalary).
- The Broken/Uncertain switches escape this because `BrokenAndUncertainSwitches` sets
  the margin via an inline style, which wins over Bootstrap.
- So Reconstructed/Emended sat ~11px left of Broken/Uncertain once the spacer matched
  the input width.

## Fix (final, after "style markup shouldn't be part of the code")

- `.date-field-row-spacer`: mirror the Bootstrap form-control exactly —
  `flex: 1 1 auto; width: 1%; min-width: 0; max-width: 8em` — so on the
  identically-structured rows the spacer always resolves to the input's width.
- Move the switch margins out of the JSX into the stylesheet (no inline `style`, no
  `!important` — the repo has none). The margins are keyed on the switches' stable ids,
  whose `(1,0,0)` specificity cleanly beats Bootstrap's `(0,7,0)` negative-margin rule:
  `#year_reconstructed, #year_emended { margin-left: 10px }` and
  `#month_intercalary { margin-left: 20px }`.
- Reset the spacer's own Bootstrap `-1px` (`#date-field-year-spacer { margin-left: 0 }`)
  so the second row lines up pixel-exact under the first.
- `BrokenAndUncertainSwitches` is shared (also used by the colophon editors in a plain
  `<Row>`), so its inline margin is left untouched.
- Result: reconstructed.x = input_width + 10px = broken.x at every column width.

## Verification

- `yarn lint` (eslint + stylelint): clean.
- `yarn tsc`: clean.
- `src/chronology/ui/DateEditor`: 5 suites / 44 tests pass, console-clean.
- Note: this is a pure flex-layout fix; jsdom does not compute layout, so it is not
  unit-testable. No live browser automation is available in this environment for a
  screenshot; alignment is established by the flex equality of the two rows plus the
  id-based switch margins. Please confirm visually.
