# TASK realia-rla-online-link — TODO

Link each Reallexikon entry title to its online RlA article on publikationen.badw.de.

- [x] Read current code + the repo's external-link convention (`common/ui/ExternalLink`)
- [x] Add `RLA_ONLINE_BASE` + `rlaArticleUrl(id)` to `RealiaEntry.ts`
- [x] Render the RlA title with a trailing clickable external-link icon (the link),
      keeping the title text itself plain (icon-only `ExternalLink` + `aria-label`)
- [x] Keep `<ReferenceList references={[entry.reference]} />` unchanged
- [x] Unit-test `rlaArticleUrl` (verified fixtures + encoding)
- [x] Assert each RlA title is an anchor with correct href, target, rel
- [x] `yarn tsc` clean
- [x] `yarn lint` (eslint + stylelint) clean
- [x] Realia suite passes, zero console noise
