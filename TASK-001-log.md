# TASK-001 — Work Log: Fixes to Date Converter

## Status: Investigation complete — blame analysis done, implementation not yet started

---

## 2026-04-15 — Blame / change history analysis

### Commits since January 2026 that touched date/chronology code

| Commit     | Date       | Title                                                    | Impact on bugs                                                                                                                     |
| ---------- | ---------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `c65361c3` | 2026-04-14 | Comprehensive health check and stabilization pass (#692) | Import-path restructuring only (`common/Spinner` → `common/ui/Spinner`, etc.). No logic changes. Did not introduce or fix any bug. |
| `faafbadd` | 2026-02-03 | Frontend optimization (#662)                             | Minor comment removal in `DateSelectionInput.tsx` and `FragmentDtos.ts`. No logic changes.                                         |
| `f01e52b0` | 2026-02-02 | Frontend optimization (#661)                             | Pure formatting (trailing commas, indentation) across all date/conversion files. No logic changes.                                 |
| `8e17f804` | 2026-01-xx | Layout fixes (#671)                                      | Sass and `FragmentRepository.ts` only. No logic changes.                                                                           |

**Conclusion: None of the 2026 commits introduced or changed the logic that causes any of the five bugs.**

### Root-cause commits (pre-2026)

| Commit                    | Date       | Title                                        | Bugs introduced                                                                                                        |
| ------------------------- | ---------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `3d69cb2c`                | 2025-05-27 | Date king adjustments (#581)                 | **BUG-1** (delete crash) + **BUG-2** (isBroken/isUncertain lost on load)                                               |
| `fa74dc9d`                | 2025-05-22 | Update to send and receive minimal king data | Pre-cursor to BUG-1/BUG-2 — changed `updateDate` to call `date.toDto()` without null-guard                             |
| `f1d231a4`                | 2025-06-24 | Zero date display (#595)                     | **BUG-5** context — added `zeroYearKing` display; did not fix the Labaši-Marduk / non-numeric `totalOfYears` edge case |
| `26684c8d` (pre-Jan 2025) | 2025-01-xx | Add zero year tests                          | **BUG-5** — `getPreviousKingAndYearIfYearZero` implemented without guarding against non-numeric `totalOfYears`         |

### Detailed blame per bug

**BUG-1 & BUG-2 — both trace to `3d69cb2c` / `fa74dc9d` (May 2025):**

Before these commits `fromJson()` was simply `new MesopotamianDate({ ...dateJson })` — it spread the whole DTO including `king.isBroken`/`king.isUncertain`.  
After: `findKingByOrderGlobal(orderGlobal)` returns a bare `King` (no `isBroken`/`isUncertain`), which is then spread over `dateJson.king` — silently discarding those flags (BUG-2).  
`updateDate` in `Info.tsx` was simultaneously changed from passing the raw DTO to calling `date.toDto()` without a null-guard, so delete (`undefined`) crashes (BUG-1).

**BUG-3 (`< >` in year) — pre-dates all 2025/2026 commits.** `parseInt` has never stripped angle brackets; it is a latent limitation that became visible as data containing `< >` was entered.

**BUG-4 (intercalary months) — pre-dates all 2025/2026 commits.** The SE path never had intercalary validation; this is a gap in the original implementation.

**BUG-5 (year 0 / Nabonidus) — introduced with `26684c8d` / `f1d231a4` (early 2025).** `getLastYearField` strips `?` from `totalOfYears` but does not handle non-numeric values like `"3 months"`.

---

## 2026-04-15 — Investigation

### Files explored

| File                                                     | Role                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/chronology/domain/Date.ts`                          | `MesopotamianDate` — `fromJson()` / `toDto()`                                              |
| `src/chronology/domain/DateBase.ts`                      | `MesopotamianDateBase` — `toModernDate()`, `getDateProps()`, `getEmptyFields()`            |
| `src/chronology/domain/DateString.ts`                    | `MesopotamianDateString` — `toString()`, `kingToString()`, `getBrokenAndUncertainString()` |
| `src/chronology/domain/ZeroYearKingFinder.ts`            | Year-0 logic: `getPreviousKingAndYearIfYearZero()`                                         |
| `src/chronology/domain/DateConverter.ts`                 | Core converter, `shiftMesopotamianMonthIfNoMatchFound()`                                   |
| `src/chronology/domain/DateConverterBase.ts`             | `CalendarProps`, `getMesopotamianMonthsOfSeYear()`                                         |
| `src/chronology/domain/DateConverterChecks.ts`           | `isIncomingDateHasCorrespondingIntercalary()`                                              |
| `src/chronology/application/DateSelection.tsx`           | `DateEditor` — Delete button wiring                                                        |
| `src/chronology/application/DateSelectionMethods.ts`     | `saveDateDefault()`, `getDate()`                                                           |
| `src/chronology/application/DateSelectionState.ts`       | React state hooks                                                                          |
| `src/fragmentarium/domain/FragmentDtos.ts`               | DTOs: `KingDateDtoField` (`orderGlobal`, `isBroken`, `isUncertain`)                        |
| `src/fragmentarium/ui/info/Info.tsx`                     | `updateDate` wiring to `fragmentService`                                                   |
| `src/fragmentarium/infrastructure/FragmentRepository.ts` | `updateDate()` → `POST /fragments/{number}/date`                                           |

---

## Bug Analysis

### BUG-1 · Delete date hangs / does nothing

**Reporter:** ilya.o.khait (example: BM.14029, trying to remove Rim-Anum)

**Root cause (confirmed):**
In `src/fragmentarium/ui/info/Info.tsx`:

```ts
const updateDate = (date) =>
  fragmentService.updateDate(fragment.number, date.toDto())
```

When the delete button in `DateEditor` fires `state.saveDate(undefined, index)`, it calls
`saveDateDefault({ updatedDate: undefined, ... })`, which then calls `updateDate(undefined)`.
At that point `date.toDto()` throws `TypeError: Cannot read properties of undefined`.
The Bluebird promise is rejected and the spinner never stops — matching the reported "loads forever, nothing happens" symptom.

**Hypothesis about kings / orderGlobal:** The reporter suspected a link with the fact that kings are now stored with only `orderGlobal`. This is plausible in that a saved date with only `orderGlobal` may also fail during the update flow if the backend validates a non-null DTO (though the crash above is the immediate cause).

**Proposed fix location:** `src/fragmentarium/ui/info/Info.tsx` → make `updateDate` handle `date` being `undefined` by passing `undefined` (not calling `.toDto()`). Also verify `FragmentService.updateDate` and `FragmentRepository.updateDate` accept `undefined` as the DTO.

---

### BUG-2 · `isBroken` / `isUncertain` not shown on king names

**Reporter:** Zsombor Földi

**Root cause (confirmed):**
In `src/chronology/domain/Date.ts`, `fromJson()`:

```ts
static fromJson(dateJson: MesopotamianDateDto): MesopotamianDate {
  const kingOrderGlobal = dateJson?.king?.orderGlobal
  const king = kingOrderGlobal
    ? findKingByOrderGlobal(kingOrderGlobal)   // ← returns bare King from Kings.json
    : undefined
  return new MesopotamianDate({ ...dateJson, ...{ king: king ?? undefined } })
  //                                              ↑ overwrites dateJson.king, losing isBroken/isUncertain
}
```

`findKingByOrderGlobal()` returns a `King` object from `Kings.json` which does **not** include `isBroken`/`isUncertain`. The spread `{ king: king ?? undefined }` replaces `dateJson.king` (which had those fields) with the bare `King`. As a result `this.king.isBroken` and `this.king.isUncertain` are `undefined` in every loaded date, and `kingToString()` never adds `[…]` or `?`.

**Proposed fix location:** `src/chronology/domain/Date.ts` — after obtaining `king` from `findKingByOrderGlobal()`, merge `isBroken` and `isUncertain` back from `dateJson.king`.

---

### BUG-3 · `< >` in year value breaks calendar calculation

**Confirmed reproduction example:** `Abbey-W.589` (`https://www.ebl.lmu.de/library/Abbey-W.589`) currently displays `Date: ∅.∅.<136> SE`.

**Root cause (identified):**
`getDateProps()` in `src/chronology/domain/DateBase.ts`:

```ts
year: parseInt(this.year.value) ?? -1,
```

`parseInt('<1>')` returns `NaN` (not `1`), causing downstream conversion to fail silently or produce wrong results. Similarly `getEmptyFields()` uses `isNaN(parseInt(this[field].value))`, which would treat `<1>` as empty — triggering the range path instead of the exact-date path.

**Product decision (confirmed):** Angle brackets must remain visible in the UI, but be stripped internally everywhere they participate in calculations. This applies to year, month, and day values, not just year.

**Proposed fix location:** Introduce a shared helper that strips `/[<>]/g` before every numeric parse used for calculation/range logic (`getDateProps`, `getEmptyFields`, and any related date-conversion paths), while preserving the raw original value for display.

---

### BUG-4 · Intercalary months not taken into account

**Confirmed reproduction example:** `MNB.1129` (`https://www.ebl.lmu.de/library/MNB.1129`) currently displays `Date: 16.VI².3 Cambyses (31 August 527 BCE PJC)`.

**Root cause (partially identified):**
In `src/chronology/domain/DateConverter.ts`, `shiftMesopotamianMonthIfNoMatchFound()`:

```ts
if ([13, 14].includes(mesopotamianMonth)) {
  this.setToMesopotamianDate(ruler, regnalYear, 1, 1)
  if (
    !this.checks.isIncomingDateHasCorrespondingIntercalary(
      mesopotamianMonth,
      this,
    )
  ) {
    mesopotamianMonth =
      { 13: 6, 14: 12 }[mesopotamianMonth] ?? mesopotamianMonth
  }
}
return mesopotamianMonth
```

This intercalary-validation path is **only reached inside `setToMesopotamianDate()`**. If the user enters an SE-date with an intercalary month (via `setToSeBabylonianDate()`), no equivalent check exists. Additionally, if the data in `dateConverterData.json` does not cover a given year's intercalary months, the fallback to month 6/12 silently drops precision.

**Next steps:** Trace the exact `MNB.1129` path end-to-end and determine whether the wrong output comes from month-entry normalization, intercalary validation, or the underlying calendar data.

---

### BUG-5 · Year 0 of a king converted incorrectly (VAT.8439: Nabonidus+0 → Labaši-Marduk+3 months)

**Root cause (identified):**
`getPreviousKingAndYearIfYearZero()` in `src/chronology/domain/ZeroYearKingFinder.ts` steps back exactly one `orderInDynasty`. For Nabonidus the previous king is Labaši-Marduk, whose `totalOfYears` is `"3 months"` (sub-year reign). `getLastYearField()` strips `?` from that string, yielding `"3 months"` as the year value. `parseInt("3 months")` returns `3`, which is then used as the regnal year of Labaši-Marduk — a nonsensical result.

Correct behaviour: Year 0 of Nabonidus is the accession year, which is the same as the final year of the **previous king with a numeric reign** (Neriglissar, 4 years). The fix must walk back past kings with non-numeric `totalOfYears` until it finds one with a numeric value, or handle month-only reigns specially.

**Product decision (confirmed):** Year 0 must continue to display the original selected king name with displayed year `0`; the fallback to an earlier king is for calendar calculation only.

**Additional subtlety:** The `toModernDate()` in `DateBase.ts` clamps `year` to `1` for Nabonasar-era dates: `year > 0 ? year : 1`. Combined with the wrong king, this compounds the incorrect output.

**Proposed fix location:** `src/chronology/domain/ZeroYearKingFinder.ts` — if the previous king's `totalOfYears` is non-numeric, continue walking back until a numeric one is found (or handle the edge case explicitly), while preserving the original king/year-0 values for display.

---

## Resolved decisions

1. BUG-4 reference fragment confirmed: `MNB.1129`.
2. BUG-5 display rule confirmed: year 0 must display the original king name and displayed year `0`; fallback logic is calculation-only.
3. BUG-3 parsing rule confirmed: angle brackets must be cleared internally everywhere for calculations, but preserved in display in all cases.
4. Additional calculation/display example confirmed: `Abbey-W.589` (`Date: ∅.∅.<136> SE`) is a concrete regression case for bracket-clearing logic.

---

## 2026-04-15 — Documentation checkpoint

- Finalized the initial investigation package for TASK-001.
- Captured root-cause analysis, blame history, confirmed reproduction examples, and product decisions.
- Prepared the task documentation for a standalone documentation commit before implementation starts.

---

## 2026-04-15 — BUG-1 implementation started

- Implemented the delete-date fix at the failure boundary in `src/fragmentarium/ui/info/Info.tsx` by changing the callback to pass `date?.toDto()` instead of unconditionally calling `.toDto()`.
- Propagated the deletion contract through `FragmentService` and `ApiFragmentRepository` so `updateDate(number, undefined)` is a typed, supported path.
- Added a fragment-level regression test in `src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx` to verify that clicking `Delete` calls `fragmentService.updateDate(fragment.number, undefined)`.
- Added a service-level regression test in `src/fragmentarium/application/FragmentService.test.ts` to verify the repository receives `undefined` on deletion.
- Validation completed:
  - `yarn lint` passed.
  - `yarn tsc` passed.
  - Targeted regression tests passed (`FragmentService.test.ts`, `CuneiformFragment.test.tsx`).
  - Full suite passed (`292` suites, `2885` passed tests, `49` passed snapshots).

### Additional gate-related stabilization (non-BUG-1 logic)

- Full-suite console-noise gate initially reported provenance preload errors in integration tests that did not provide a `/provenances` API response.
- Updated test setup only (no production logic change):
  - `src/corpus/ui/ChapterView.integration.test.ts` now allows provenance preload via `FakeApi.allowProvenances([...provenanceSnapshot])`.
  - `src/App.test.ts` now allows provenance preload via `FakeApi.allowProvenances([])`.
- Re-baselined two affected snapshots in `src/corpus/ui/__snapshots__/ChapterView.integration.test.ts.snap` caused by deterministic provenance data being available during render.
- Follow-up typing fix: converted provenance snapshot records to plain DTO-shaped objects before passing them to `FakeApi.allowProvenances(...)` in `src/corpus/ui/ChapterView.integration.test.ts` to satisfy strict TypeScript assignability.

---

## 2026-04-15 — BUG-1 follow-up regression fix (date editor auto-scroll)

- Reported issue: clicking `Edit date` in library view scrolled the page to the bottom before/while opening the date editor popover.
- Root cause: multiple `react-select` fields rendered inside the date editor popover used `autoFocus={true}`. On open, browser focus moved into those controls and forced viewport scrolling.
- Implemented fix:
  - `src/chronology/ui/DateEditor/DateSelectionInput.tsx`: set Ur3 calendar select `autoFocus={false}`.
  - `src/chronology/ui/DateEditor/Eponyms.tsx`: set eponym select `autoFocus={false}`.
  - `src/chronology/ui/Kings/Kings.tsx`: set king select `autoFocus={false}`.
  - `src/chronology/application/DateSelection.tsx`: keep edit button click handler explicit with `event.preventDefault()` and ensure save/delete buttons are `type="button"`.
- Validation completed:
  - `yarn tsc` passed.
  - `yarn lint` passed.
  - Targeted tests passed:
    - `src/chronology/ui/DateEditor/DateSelection.test.tsx`
    - `src/chronology/ui/DateEditor/DateSelectionInput.test.tsx`
    - `src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx`

---

## 2026-04-15 — BUG-2 implementation completed (`isBroken`/`isUncertain` on king)

- Implemented fix in `src/chronology/domain/Date.ts` inside `MesopotamianDate.fromJson(...)`:
  - Continue resolving king metadata via `findKingByOrderGlobal(orderGlobal)`.
  - Preserve DTO-specific king flags by merging `isBroken` and `isUncertain` from `dateJson.king` into the resolved king object.
  - Keep explicit `orderGlobal` assignment on the merged king object to satisfy strict typing (`KingDateField`).
- Added regression coverage in `src/chronology/domain/Date.test.ts`:
  - New test: `preserves king broken and uncertain flags from JSON`.
  - Verifies that `MesopotamianDate.fromJson(...)` retains `king.isBroken` and `king.isUncertain` while still resolving king name by `orderGlobal`.
- Validation completed:
  - `yarn tsc` passed.
  - `yarn lint` passed.
  - `yarn test src/chronology/domain/Date.test.ts --no-coverage` passed (`28` tests).

---

## 2026-04-15 — Status: Work Session Checkpoint

**Completed bugs (committed):**

- BUG-1 (delete-date hang) ✓
- BUG-2 (king flags persistence) ✓

**Deferred bugs (scope review needed):**

- BUG-3 (non-numeric date spellings) — Scope expanded; implementation approach revised.
- BUG-4 (intercalary months) — Not started.
- BUG-5 (year 0 conversion) — Not started.

---

## 2026-04-16 — BUG-3 scope revision and analysis intake

- Confirmed BUG-3 is broader than the original `<>` parsing report.
- Added three analysis artifacts to the repository for traceability:
  - `TASK-001-non_numeric_date_spellings_ebl.json`
  - `TASK-001-non_numeric_date_spellings_ebl.classified.json`
  - `TASK-001-non_numeric_date_spellings_ebl.classification_report.md`
- Analysis summary captured from the attached report:
  - `4011` source records
  - `4403` attested non-numeric year/month/day values
  - Largest classes are `plus_qualified_number` (`1527`), `placeholder` (`1329`), `editorial_brackets` (`508`), and `textual_annotation` (`476`)
  - Year field is the most affected (`2186` values), followed by day (`1428`) and month (`789`)
- Product direction updated from a narrow parser workaround to a compromise approach:
  - Add year-only structured metadata for reconstructed (`<>`) and emended (`!`) values
  - Keep free-text date fields for flexibility
  - Add warnings for non-standard inputs so users are guided away from misusing raw symbols such as `?`
  - Clean existing `< >`, `!`, and `?` data after the new model is live
- The earlier uncommitted prototype that stripped angle brackets in calculation code was intentionally reverted and is no longer the planned implementation path.

### Check specification captured from discussion (`n` = number)

- Allowed input spellings remain flexible, but warnings should validate against known patterns:
  - `n`
  - `x`
  - `n+`
  - `x+n`
  - `n-n`
  - `n/n`
  - `n[a-z]` (number with letter, e.g. `12a`, `12b`; also allows year variants like `a`/`b` series)
- Warning checks requested in discussion:
  - If raw `<...>` is typed for year, show warning to use `isReconstructed`.
  - If raw `[...]` is typed, show warning to use `isBroken`.
  - If raw `!` is typed for year, show warning to use `isEmended`.
  - If raw `?` is typed, show warning to use `isUncertain`.
  - If field value falls outside known patterns (roman numerals in non-month fields, long textual annotations, mixed punctuation), keep value but warn that conversion reliability is reduced and conversion may be skipped.
- This keeps editor flexibility while nudging users toward structured metadata and cleaner converter-compatible values.
