# TASK-REALIA-PREVIEW — Rich preview for Realia search results

## Goal

Show a compact, pretty, well-organized rich preview for each Realia search
result instead of the current single-line subtitle.

## Categories to display (with the entry link)

- Headword (id) — the link.
- Type chip(s) — REALIA_TYPE_LABELS for each type.
- Related terms — muted "also:" line.
- Source-coverage badges — RlA (reallexikon), AfO (afoRegister), References, and
  a Wikidata presence pill. Only rendered when present.

## Plan

- [ ] Add shared `getRealiaTypeLabels` domain helper (DRY: used by results + display).
- [ ] Rebuild RealiaResultsList as a rich, card-style preview.
- [ ] Add styles in Realia.sass using design tokens.
- [ ] Refactor RealiaDisplay metadata to reuse the shared helper.
- [ ] Update/extend RealiaResultsList tests (100% coverage).
- [ ] yarn lint clean.
- [ ] yarn tsc clean.
- [ ] yarn test --watchAll=false clean (no new failures, no console noise).
- [ ] Remind to remove TASK-REALIA-PREVIEW-\*.md before merge.
