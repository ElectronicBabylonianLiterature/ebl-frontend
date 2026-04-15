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
