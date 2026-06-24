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
- `src/realia/ui/RealiaDisplay.tsx`: `ReallexikonEntries` now wraps each entry title
  in the repo's `common/ui/ExternalLink` (which already applies
  `target="_blank"` + `rel="noopener noreferrer"`), linking to
  `rlaArticleUrl(entry.id)`. The existing `<ReferenceList>` rendering of the
  bibliography reference is unchanged — the article link is added in addition to it.

## Tests

- `src/realia/domain/RealiaEntry.test.ts`: `rlaArticleUrl` table test over the
  verified fixtures (1069, 1071, 6402, 12583) plus a fragment-encoding case.
- `src/realia/ui/RealiaDisplay.test.tsx`: the multi-entry and shared-id tests now
  assert each title is an anchor with the correct `href`; a new test asserts the
  title link carries the right `href`, `target="_blank"`, and `rel="noopener noreferrer"`.

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
