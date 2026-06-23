# TASK-REALIA-AFO-LAYOUT — TODO

Three Realia changes:

1. Sort AfO realia in reversed chronological order (reverse the already-sorted
   volume groups).
2. Use a single collapsible for the whole AfO-Register section, preserving the
   per-volume sections inside it (no longer one collapsible per volume).
3. Add a friendly "still in development" warning banner to both Realia pages
   (search page + entry display), matching existing `Alert` style.

## Checklist

- [x] Reverse the AfO volume groups (reverse-chronological)
- [x] Replace per-volume `CollapsibleSection`s with one section-level
      collapsible (heading "II. AfO-Register Realien", `element="h2"`); render
      volumes as preserved (non-collapsible) `AfoRegisterVolume` sub-sections
- [x] Style the volume sub-section heading (`.Realia__afo-volume*`)
- [x] Shared `RealiaDevelopmentNotice` banner (`Alert variant="warning"`)
- [x] Show banner on `RealiaSearchPage` and `RealiaDisplay` (authorized view)
- [x] Update/extend tests (single collapsible, reversed order, banner)
- [x] `yarn lint` — zero errors
- [x] `yarn tsc` — zero errors
- [x] Affected tests pass with zero console output (full realia suite: 97)
- [x] 100% coverage on affected code (all three changed UI files 100%)
- [ ] Remind to remove TASK-\* tracking files before merge

## Implementation notes

- Reverse done at the display: `[...groupAfoRegisterByVolume(entries)].reverse()`
  (domain stays untouched; entries "already come sorted").
- Single collapsible: the section header itself is now the collapsible toggle
  ("II. AfO-Register Realien"); each volume renders as an `<h3>` sub-section
  with its title + entries list inside.
- Banner test gotcha: the banner text contains "Dictionary of Realia", which
  collided with the search-page intro assertion — tightened that test to a
  phrase unique to the intro.

## Notes

- DRY: extract the banner into one component reused by both pages.
- Banner uses react-bootstrap `Alert` (existing style, cf.
  `corpus/ui/import/ChapterImport`); `variant="warning"` for a dev notice.
