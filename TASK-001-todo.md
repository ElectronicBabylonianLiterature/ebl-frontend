# TASK-001 — Fixes to Date Converter

## Source

Trello card: "Fixes to date converter" (reported by Zsombor Földi / ilya.o.khait)

## Checklist

### BUG-1 · Delete date hangs / does nothing

- [x] Trace and confirm the crash path in `Info.tsx updateDate`
- [x] Fix `updateDate` to handle `undefined` (deletion) without calling `.toDto()` on `undefined`
- [x] Verify `FragmentService.updateDate` / `FragmentRepository.updateDate` accept an optional DTO
- [x] Add / update tests
- [x] Fix library date-editor auto-scroll when opening edit date popover
- [x] Add / update tests for the date-editor scroll regression path

### BUG-2 · `isBroken` / `isUncertain` flags not shown on king names

- [x] Confirm root cause: `MesopotamianDate.fromJson()` discards `isBroken`/`isUncertain` from DTO when merging king from `findKingByOrderGlobal()`
- [x] Fix `fromJson()` to preserve `isBroken`/`isUncertain` from the DTO king field
- [x] Add / update tests

### BUG-3 · `< >` in year value breaks calendar calculation

- [ ] Reproduce with `Abbey-W.589` (`Date: ∅.∅.<136> SE`)
- [ ] Identify every path where year/month/day values are parsed as numbers for calculation
- [ ] Strip `< >` characters internally before numeric parsing while preserving raw values for display
- [ ] Verify that bracket clearing also applies to `getEmptyFields` / range logic and any other conversion helpers
- [ ] Add / update tests

### BUG-4 · Intercalary months not taken into account in conversion

- [ ] Reproduce with `MNB.1129` (`Date: 16.VI².3 Cambyses (31 August 527 BCE PJC)`)
- [ ] Trace through `setToMesopotamianDate` / `shiftMesopotamianMonthIfNoMatchFound` for the failing date
- [ ] Identify which code path skips intercalary handling (SE-era path, king-date path, or data gap)
- [ ] Fix the conversion to respect intercalary months correctly
- [ ] Add / update tests

### BUG-5 · Year 0 of a king converted incorrectly (e.g. VAT.8439 Nabonidus+0 → Labaši-Marduk+3 months)

- [ ] Confirm that `ZeroYearKingFinder` returns Labaši-Marduk as previous king of Nabonidus
- [ ] Confirm `totalOfYears` for Labaši-Marduk is "3 months" and is non-numeric
- [ ] Preserve original selected king name and displayed year `0` in the UI
- [ ] Walk back past kings with non-numeric `totalOfYears` for calculation only
- [ ] Fix `getPreviousKingAndYearIfYearZero` / `getLastYearField` accordingly
- [ ] Add / update tests

### Gates (must pass before PR)

- [x] `yarn lint` — no errors
- [x] `yarn tsc` — no errors
- [ ] Full test suite — no failures, no console warnings/errors
