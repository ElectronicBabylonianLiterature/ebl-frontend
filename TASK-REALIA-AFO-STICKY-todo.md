# TASK-REALIA-AFO-STICKY — TODO

Restyle the AfO volume titles (`.Realia__afo-volume-title`) in the project UI
style and make them sticky, so the title of the volume currently being read
pins to the top of the page while scrolling through that volume's entries.

## Checklist

- [x] Restyle `.Realia__afo-volume-title` to match the UI (surface background,
      brand accent, subtle border/shadow, rounded header look)
- [x] Make it `position: sticky; top: 0` with a solid background and z-index so
      it pins to the top of the viewport while the section scrolls
- [x] Verify no ancestor (`CollapsibleSection`, `.Realia__*`) sets
      `overflow: hidden`/clipping that would break sticky
- [x] Follow-up: blue border on **all** sides of the volume title (full
      `border` + full `border-radius`, not just left/bottom)
- [x] Follow-up: restyle the display links (AfO cross-reference + See Also) to
      match the new UI via a shared `%realia-link-pill` placeholder (DRY)
- [x] Pre-existing fix: stale snapshots not updated when shared
      `CollapsibleSection` gained `data-testid="CollapseIndicator"` (a827ec1e)
      and when the Realia tools-nav item was scope-gated (5f46444a)
- [x] `yarn lint` — zero errors
- [x] `yarn tsc` — zero errors
- [ ] Full test suite `yarn test --watchAll=false` — zero failures, zero
      console output (final run in progress)
- [ ] Remind to remove TASK-\* tracking files before merge

## Notes

- CSS-only change (`src/realia/ui/Realia.sass`). The markup in
  `RealiaDisplay.tsx` (`<h3 className="Realia__afo-volume-title">`) is unchanged,
  so no JS logic is affected and existing RealiaDisplay tests still cover the
  element. jsdom does not apply compiled SASS, so sticky/positioning cannot be
  asserted in unit tests — covered visually.
- App has no fixed/sticky global header, so `top: 0` pins to the viewport top.
- CollapsibleSection uses react-bootstrap `Collapse`; it only sets
  `overflow: hidden` during the open/close transition, not in the steady open
  state, so `position: sticky` works once expanded.
