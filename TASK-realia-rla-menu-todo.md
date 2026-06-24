# TASK realia-rla-menu — TODO

Add the RlA articles to the Realia on-this-page menu, working/looking exactly like AfO.

- [x] Read the nav code (`realiaSections.ts`, `RealiaNavMenu`, `useActiveSection`)
- [x] Add `rlaArticleId(index)` and populate the Reallexikon section's subsections
      (one per article, label = title), mirroring AfO volumes
- [x] Give each rendered RlA article div the matching anchor `id`
- [x] Unit-test `buildRealiaNav` RlA subsections
- [x] Add a nav-menu test for RlA subsection links/hrefs (mirror AfO)
- [x] Update scroll-spy tests now that the Reallexikon section is a parent group
- [x] Scope title `getByText`s to the heading (titles now also appear in the menu)
- [x] `yarn tsc` clean
- [x] `yarn lint` (eslint + stylelint) clean
- [x] Realia suite passes, zero console noise
