# TASK realia-rla-menu — Work Log

## Goal

In Realia (`/tools/realia/<realia>`), add the RlA (Reallexikon) articles to the
"On this page" menu so they look and work exactly like the AfO-Register volumes:
each article is a clickable subsection under the Reallexikon group, with scroll-spy
highlighting and the parent-group behaviour.

## How AfO works (the pattern mirrored)

- `buildRealiaNav` gives the AfO-Register section a `subsections` list, one per volume
  group, each `{ id: afoVolumeId(index), label: group.volume }`.
- `AfoRegisterVolume` renders `<div id={afoVolumeId(index)}>`, so the nav anchors match.
- `RealiaNavMenu` is fully generic: any section with `subsections` renders a collapsible
  sublist; `useActiveSection` tracks the subsection anchors and the parent shows
  `is-active-group` when one of its subsections is active.

## Changes

- `src/realia/ui/realiaSections.ts`:
  - Added `rlaArticleId(index)` (`realia-rla-article-${index}`).
  - The Reallexikon section now emits one subsection per `entry.reallexikon` article
    (`{ id: rlaArticleId(index), label: article.title }`) instead of an empty list.
- `src/realia/ui/RealiaDisplay.tsx`:
  - `ReallexikonEntries` now sets `id={rlaArticleId(index)}` on each
    `Realia__rla-article` div (the scroll anchor), and imports `rlaArticleId`.
  - The article surface already shares the AfO `scroll-margin-top` via
    `%realia-section-surface`, so anchored scrolling lines up like AfO.

## Tests

- `src/realia/ui/realiaSections.test.ts`: the build test now also asserts the
  Reallexikon section's RlA subsections (`rlaArticleId(0/1)` + titles).
- `src/realia/ui/RealiaDisplay.test.tsx`:
  - New "lists RlA articles as subsections in the navigation menu" test (mirror of the
    AfO one) asserting the subsection links' hrefs.
  - Updated the scroll-spy tests: the Reallexikon section is now a parent group, so the
    active-subsection test triggers `realia-rla-article-0` and asserts the article link
    is active while the parent link is not (matching AfO).
  - Titles now also appear as menu links, so the heading `getByText`s are scoped with
    `{ selector: '.Realia__rla-title' }` (the same disambiguation AfO tests use).

## Notes

- No data/API change; the menu entries derive purely from the existing
  `reallexikon[]` order and titles.
- Multi-entry RlA rendering and the references/cross-references sections are intact.

## Gates

- `yarn tsc` — clean.
- `yarn lint` (eslint + stylelint) — clean.
- Realia suite — 11 suites / 117 tests pass, 1 snapshot, zero console output.

## Reminder

Remove the `TASK-realia-*` `.md` files before merging the PR.
