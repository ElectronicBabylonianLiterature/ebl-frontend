# TASK-BIBLIO-PREVIEW — Fix broken compact citation preview

## Problem

Compact citation previews (e.g. on a Realia entry's Reallexikon / References
sections) render with a dangling leading comma when the bibliography entry has
no CSL author: `, 1993-1995 (D)` / `, 1993-1995: 207 (D)`.

## Root cause

`CompactCitation.getMarkdown()` always prepended `author + ', '`, so an empty
author left an orphan comma. RlA encyclopedia references have editors, not CSL
`author`, so `authors` is empty.

## Plan

- [x] Only emit `author + ', '` when an author is present.
- [x] Add domain tests for the no-author case (with and without pages).
- [x] Update the two affected snapshots (about, TextView) after inspecting diffs.
- [x] yarn lint / yarn tsc clean.
- [x] yarn test --watchAll=false — only pre-existing unrelated failures.
- [ ] Remind to remove TASK-BIBLIO-PREVIEW-\*.md before merge.
