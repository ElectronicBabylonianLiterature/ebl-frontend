# TASK-ACCESSION-YEAR — Accession year (year 0) of letter-suffixed rulers

Issue: For sub-rulers whose `orderInDynasty` has a letter suffix (e.g. Bardiya `"2a"`),
year 0 must convert using the **immediately preceding** ruler's last year, not skip it.
Per user decision: Bardiya year 0 = 522 (= Cambyses), not 530 (= Cyrus).

## Root cause

`ZeroYearKingFinder.getPreviousKingWithNumericTotalOfYears` starts the walk-back at
`parseInt(orderInDynasty) - 1`. `parseInt("2a")` is `2`, so it starts at `1` and
**skips the base-number king** (Cambyses, order `"2"`), landing on Cyrus (order `"1"`).

## Plan / TODO

- [x] Reproduce and verify current behavior (Bardiya year 0 -> Cyrus / 530).
- [x] Determine exact blast radius of candidate fixes (compare across all kings).
- [x] Choose minimal targeted fix: sub-ruler orders (`^\d+[a-z]+$`) start walk-back at
      the base order itself; pure integers keep `parseInt - 1`.
- [x] Confirm fix changes only the 13 letter-suffixed rulers (ranges like `"4–5"`,
      integer-gap kings, and pure integers untouched).
- [x] Implement fix in `src/chronology/domain/ZeroYearKingFinder.ts`.
- [x] Add unit tests in `ZeroYearKingFinder.test.ts` (sub-ruler -> base king).
- [x] Add end-to-end test in `Date.zeroYear.test.ts` (Bardiya year 0 -> 522 BCE).
- [x] `yarn lint` clean (hard gate).
- [x] `yarn tsc` clean (hard gate).
- [x] Affected-code tests pass, console-clean (hard gate).
- [ ] Remove TASK-ACCESSION-YEAR-\*.md before merge.
