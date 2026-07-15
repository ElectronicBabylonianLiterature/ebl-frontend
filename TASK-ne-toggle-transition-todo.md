# TASK-ne-toggle-transition — TODO

Task: make a smooth transition when toggling the named-entity (NE) tags display on/off.

## Work

- [x] Fade the display NE indicators in (`named-entity-indicator-in` keyframe on `.span-indicator--static`).
- [x] Ease the line-spacing open/closed (display-scoped `padding-bottom` transition on
      `.named-entity-display .Transliteration__lines td`).
- [x] Persistent `.named-entity-display` wrapper in `Display.tsx` so the transition survives toggle-off
      and stays scoped to the display (editor untouched).
- [x] Load the stylesheet on the display so the transition is present on first toggle.

## Hard gates (copilot-instructions)

- [x] `yarn lint` (eslint + stylelint) → 0.
- [x] `yarn tsc` → 0.
- [ ] `yarn test --watchAll=false` — **full** suite, 0 failures, 0 console output.
- [ ] Coverage 100% on affected code (`Display.tsx`; CSS covered by `NamedEntities.css.test.ts`).
- [x] Add/update tests (2 cascade tests: display animates, editor does not; Display snapshot updated).
- [x] Create + maintain this `TASK-<id>-todo.md` and `TASK-<id>-log.md`.
- [x] No changed/added script file exceeds 250 lines.

## Notes

- Remove this todo/log pair before merge.
