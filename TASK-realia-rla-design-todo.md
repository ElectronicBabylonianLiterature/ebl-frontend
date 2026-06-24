# TASK realia-rla-design — TODO

Match the RlA (Reallexikon) article design to the AfO volume design.

- [x] Read current `Realia.sass`, `CollapsibleSection`, `ReallexikonEntries`
- [x] Confirm no tests/nav depend on the RlA collapsible markup
- [x] Make RlA articles non-collapsible (drop `CollapsibleSection`)
- [x] RlA title shares `Realia__afo-volume-title` border + font
- [x] RlA surface mirrors AfO volume (spacing between sections, no border)
- [x] Share the design via SASS placeholders (DRY)
- [x] Remove dead `.realia-collapsible__section-heading` styles + unused import
- [x] `yarn tsc` clean
- [x] `yarn lint` (eslint + stylelint) clean
- [x] Realia suite passes, zero console noise
