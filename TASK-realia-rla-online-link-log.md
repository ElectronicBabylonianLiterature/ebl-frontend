# TASK realia-rla-online-link — Work Log

## Goal

Add a direct link from each Reallexikon entry to its article on the online RlA
(Reallexikon der Assyriologie) at publikationen.badw.de. The link target is derived
purely client-side from `reallexikon[].id`, which equals the online RlA article id:
`https://publikationen.badw.de/de/rla/index#<id>`. The entry's `id` is complete and
correct for every entry, so we link from `id` rather than the bibliography reference
(which is missing on ~346 entries and wrong on one).

## Changes

- `src/realia/domain/RealiaEntry.ts`: added `RLA_ONLINE_BASE` constant and
  `rlaArticleUrl(id)` helper (`${RLA_ONLINE_BASE}#${encodeURIComponent(id)}`).
- `src/realia/ui/RealiaDisplay.tsx`: `ReallexikonEntries` renders each entry title as
  plain text followed by an icon-only `common/ui/ExternalLink` (a trailing
  `fas fa-external-link-alt` symbol) linking to `rlaArticleUrl(entry.id)`. The link
  carries an `aria-label` (`Open <title> on the online RlA`) for accessibility, and
  `ExternalLink` already applies `target="_blank"` + `rel="noopener noreferrer"`. The
  existing `<ReferenceList>` rendering of the bibliography reference is unchanged.
- `src/realia/ui/Realia.sass`: added `.Realia__rla-title-link` (left margin, brand
  colour, smaller icon, hover) for the inline link symbol.

  Follow-up: the title text was initially the link; per request it was changed to a
  separate trailing external-link icon, leaving the title text plain.

## Tests

- `src/realia/domain/RealiaEntry.test.ts`: `rlaArticleUrl` table test over the
  verified fixtures (1069, 1071, 6402, 12583) plus a fragment-encoding case.
- `src/realia/ui/RealiaDisplay.test.tsx`: the multi-entry and shared-id tests assert
  the title text renders and that each title's external-link icon (matched by its
  `aria-label`) has the correct `href`; a dedicated test asserts the link carries the
  right `href`, `target="_blank"`, and `rel="noopener noreferrer"`.

## Notes

- `ExternalLink` is the established external-link component (already used for the
  Wikidata link in this file, without an icon), so the RlA title link follows the
  same pattern.
- Multi-entry reallexikon rendering and the references/cross-references sections are
  intact; no API or data-shape change.

## Gates

- `yarn tsc` — clean.
- `yarn lint` (eslint + stylelint) — clean.
- Realia suite — 11 suites / 116 tests pass, 1 snapshot, zero console output.

## Reminder

Remove the `TASK-realia-*` `.md` files before merging the PR.
