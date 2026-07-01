# TASK-REALIA-BREADCRUMB-TOOLS — Add "Tools" to Realia entry breadcrumbs

## Scope

PR #743. The Realia entry page breadcrumb was `eBL > Realia > {entry}` — the
"Tools" crumb was missing, inconsistent with the Realia search/landing page
(`eBL > Tools > Realia`, built by `getToolsBreadcrumbs`).

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Investigate breadcrumb construction for Realia and other tool pages.
- [x] Confirm the intended pattern (`eBL > Tools > Realia > {entry}`) from the
      search page + `SectionCrumb.SECTIONS` map (`Tools -> /tools`,
      `Realia -> /tools/realia`).
- [x] Add `SectionCrumb('Tools')` before `SectionCrumb('Realia')` in
      `RealiaDisplay`.
- [x] Update the breadcrumb test to assert Tools (`/tools`) and Realia
      (`/tools/realia`) links plus the entry id.
- [x] Gates: `yarn tsc`, `yarn lint`, full `yarn test --watchAll=false` — all clean.
- [x] Keep files under the 250-line gate (RealiaDisplay.tsx 214, test 241).
- [ ] Remove `TASK-REALIA-BREADCRUMB-TOOLS-*.md` before the PR is merged.
