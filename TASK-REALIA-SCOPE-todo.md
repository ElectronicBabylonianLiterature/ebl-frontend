# TASK-REALIA-SCOPE — TODO

Make the Realia page and Tools menu item conditional on the `read:realia`
scope. Users without the scope must not see the Realia menu item, and the
page preview must be replaced with "Please log in to browse the Dictionary of
Realia."

## Checklist

- [x] Audit current Realia gating (page, entry display, menu item)
- [x] Confirm Realia menu item lives only in `src/router/Tools.tsx`
- [x] Gate the Realia nav item in `Tools.tsx` on `session.isAllowedToReadRealia()`
- [x] Update `Tools.test.tsx` to provide a `Session` via `SessionContext.Provider`
- [x] Add tests: Realia item hidden without scope, shown with scope
- [x] `yarn lint` — zero errors
- [x] `yarn tsc` — zero errors
- [x] Affected tests pass with zero console output (Tools + realia + sitemap)
- [x] 100% coverage on affected code (`Tools.tsx` 100% stmts/branch/funcs/lines)
- [ ] Remind to remove TASK-\* tracking files before merge

## Notes

- Page (`RealiaSearchPage.tsx`) and entry display (`RealiaDisplay.tsx`) already
  gate content on `isAllowedToReadRealia()` and show the login message — no
  change needed there.
- Remaining gap: the Tools sidebar menu item renders unconditionally.
