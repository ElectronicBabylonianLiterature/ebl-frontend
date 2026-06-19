# TASK-BIBLIO-PREVIEW — work log

## Investigation

- Screenshot: a Realia "Milkbowl" entry shows broken citations in the Reallexikon
  and References sections (`. 1993-1995. (D)` / `. 1993-1995: 207 (D)`).
- Reproduced with a render probe: a reference whose bibliography entry has no CSL
  `author` renders `CompactCitation` as `, 1993–1995 (D)` and
  `, 1993–1995: 207 (D)` — a dangling leading comma (the dotted popover underline
  makes the comma read as a period in the screenshot). `(D)` = DISCUSSION type.
- Cause: `CompactCitation.getMarkdown()` joined `[getAuthor(), ', ', year, ...]`
  unconditionally, so an empty author produced the orphan comma.

## Change

- `bibliography/domain/Citation.ts`: prepend `${author}, ` only when the author
  is non-empty; otherwise start at the year. Affects every compact citation with
  a missing author across the app (the shared, DRY location).
- Added two domain tests for the no-author case.

## Verification

- `yarn tsc` / `yarn lint` — clean.
- Citation/CompactCitation/ReferenceList/FullCitation suites pass.
- Full suite surfaced two legitimate snapshot changes (about, TextView) where a
  no-author reference previously rendered `, : ...`; inspected the diffs (only the
  orphan comma removed) and updated those two snapshot files with
  `--updateSnapshot`. Re-ran full suite: only the 2 pre-existing unrelated
  failures (ApiImage, Corpus.integration env mismatch) remain.
