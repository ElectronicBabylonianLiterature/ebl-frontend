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

- [x] Add shared `getRealiaTypeLabels` domain helper (DRY: used by results + display).
- [x] Rebuild RealiaResultsList as a rich, card-style preview.
- [x] Add styles in Realia.sass using design tokens.
- [x] Refactor RealiaDisplay metadata to reuse the shared helper.
- [x] Update/extend RealiaResultsList tests (100% coverage).
- [x] Add scope-protected integration test + snapshot for the preview.
- [x] yarn lint clean.
- [x] yarn tsc clean.
- [x] yarn test --watchAll=false clean (no new failures, no console noise).
- [ ] Remind to remove TASK-REALIA-PREVIEW-\*.md before merge.

## Follow-up: reallexikon contract change + RlA badge

Backend (unreleased branch) changed `reallexikon` from an array to a single
`object | null`. RlA entries are unique, so the badge count is always 1 and is
therefore dropped.

- [x] `RealiaEntry.reallexikon` and the DTO: `ReallexikonEntry | null`.
- [x] `RealiaRepository` maps `reallexikon` as a single object (or null).
- [x] `RealiaDisplay` ReallexikonSection renders one entry (no array map).
- [x] `RealiaResultsList`: RlA becomes a presence pill (no count).
- [x] Fixtures + all realia tests updated; integration snapshot updated.
- [x] yarn lint / yarn tsc / full test suite — only pre-existing failures.

## Follow-up 2: reallexikon reference linkage + preview fix

Verified the contract against the live `ebldev.realia` collection.

- [x] `ReallexikonEntryDto.reference` is an id string (e.g. `rla_1_3j`).
- [x] `RealiaRepository` resolves that id against `references`, attaches the
      resolved `Reference` to the reallexikon entry (rendered under I), and
      filters that reference out of top-level `references` (III = non-RlA only).
- [x] `RealiaDisplay` Reallexikon card label handles empty content (fixes the
      `undefined (undefined)` / `title ()` look).
- [x] Repository + display tests updated; 100% realia coverage.
- [x] yarn lint / yarn tsc / full suite — only pre-existing failures.
- [ ] Remove temporary `MONGODB_URI` / `MONGODB_DB` from `.env.local` (user).
