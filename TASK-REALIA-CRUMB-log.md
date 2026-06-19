# TASK-REALIA-CRUMB — work log

## Change

- `common/ui/Breadcrumbs.tsx`: added `['Realia', '/tools/realia']` to the
  `SectionCrumb.SECTIONS` map so `SectionCrumb('Realia')` (used by RealiaDisplay)
  renders as a link to the Realia search page instead of plain text.
- Added a "Realia crumb" test mirroring the existing "Akkadian Dictionary crumb"
  test.

## Verification

- `yarn tsc` / `yarn lint` — clean.
- Breadcrumbs + RealiaDisplay suites pass.
- Full suite — only the 2 pre-existing unrelated failures (ApiImage,
  Corpus.integration env mismatch); no new failures.
