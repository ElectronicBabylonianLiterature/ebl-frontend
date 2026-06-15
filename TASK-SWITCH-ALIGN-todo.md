# TASK-SWITCH-ALIGN — Align Reconstructed/Emended year switches

Issue: In the date editor, the wrapped second row of the year field (Reconstructed /
Emended switches) is shifted right and does not align under the first-row
Broken / Uncertain switches.

## Root cause

`.date-field-row-spacer` (first item of the wrapped second row) is rigid
`flex: 0 0 8em`, but the year `.date-field-input` is a Bootstrap `.input-group >
.form-control` with `flex: 1 1 auto; width: 1%; min-width: 0` (specificity beats our
`.date-field-input`), capped only by `max-width: 8em`. In a narrow column the input
shrinks below 8em while the rigid spacer stays at 8em, so the second row is offset.

## Plan / TODO

- [x] Locate component/styles (`DateSelectionInput.tsx` + `DateSelectionInput.sass`).
- [x] Confirm Bootstrap form-control flex rule (5.3.8) as the cause.
- [x] Make `.date-field-row-spacer` mirror the input's flexible sizing so both flexible
      items resolve to the same width on the identically-structured rows.
- [x] `yarn lint` (eslint + stylelint) clean.
- [x] `yarn tsc` clean.
- [x] Chronology suite passes, console-clean.
- [ ] Remove TASK-SWITCH-ALIGN-\*.md before merge.
