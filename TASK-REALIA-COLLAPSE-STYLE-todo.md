# TASK-REALIA-COLLAPSE-STYLE — TODO

Make the Realia display's collapsible sections use the same style as the rest
of the app (cf. `text-view__section-heading collapsible_section__heading`),
instead of the Bootstrap-card `CollapsibleCard` look.

## Checklist

- [x] Reuse `CollapsibleSection` in `RealiaDisplay` (Reallexikon + AfO cards)
- [x] Add backward-compatible `mountOnEnter` prop to `CollapsibleSection`
- [x] Update tests + 100% coverage + lint/tsc/console-clean

## Follow-up styling tweaks (Realia heading only)

- [x] Remove `justify-content` (space-between) on the Realia collapsible heading
      (`justify-content: flex-start`)
- [x] Keep the caret indicator on the right (`margin-left: auto`)
- [x] Don't force uppercase (`text-transform: none`)
- [x] Add `margin-top: 0.65rem` to the Realia collapsible heading
- [x] Scope to the `realia-collapsible` block via the compound selector
      `.realia-collapsible__section-heading.collapsible_section__heading`
      (specificity 0,2,0 reliably overrides the shared single-class rule;
      corpus's `collapsible_section__heading` is untouched)
- [x] `yarn lint` (incl. stylelint) — zero errors
- [x] `yarn tsc` — zero errors
- [x] Tests pass with zero console output (26 RealiaDisplay tests)
- [ ] Remind to remove TASK-\* tracking files before merge
