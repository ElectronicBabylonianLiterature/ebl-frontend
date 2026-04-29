# TASK-001 — Manual QA Checklist: PR #714 "Fix date issues"

This covers all five bugs and the UI enhancements introduced in the PR. Each section specifies the navigation path, the exact steps, and the expected result.

## Prerequisites

- Run the frontend locally against a backend that has at least the fragments referenced below.
- Log in with an account that has write access to fragments (transliterator role).

---

## BUG-1 — Delete date hangs / does nothing

### Delete a fragment's date ✅

1. Open any fragment that has a date set — e.g. navigate to `/fragmentarium/<number>`.
2. In the **Info** panel, locate the **Date** row.
3. Click the pencil (edit) icon next to the date.
4. In the popover, click **Delete** (red button).
5. **Expected:** the date is removed from the Info panel immediately; no spinner hangs; no JS console error. The "Date: -" label appears.
6. **Regression check:** refresh the page and confirm the date is no longer shown (server round-trip persisted the deletion).

### Open date editor without auto-scroll ✅

1. Open any fragment that has a date.
2. Click the pencil icon next to the date.
3. **Expected:** the popover opens **without** the page scrolling to the bottom. The view stays in place.

---

## BUG-2 — `isBroken`/`isUncertain` flags not preserved on king name ✅

1. Open a fragment with a king-dated date (non-SE, non-Assyrian).
2. Click the pencil icon next to the date.
3. In the king selector, choose any king.
4. Tick the **Broken** and/or **Uncertain** checkboxes for the king.
5. Click **Save**.
6. **Expected:** the date display shows the king name followed by `[?` or `?` superscripts as appropriate (e.g. `[Sargon]?`).
7. Reload the page.
8. Click the pencil icon again.
9. **Expected:** the **Broken** and/or **Uncertain** checkboxes are still ticked — the flags were not lost on round-trip.

---

## BUG-3 — Non-numeric date spellings and year metadata

### 3a. Reconstructed year toggle +/- (Backend not yet implemented)

1. Open a fragment with any date, click the pencil icon.
2. In the **Year** row, tick the **Reconstructed** switch.
3. The "Selected date" preview should show the year wrapped in angle brackets, e.g. `<5>.III.12 Sargon`.
4. Click **Save**. The date display should show `<5>.III.12 Sargon` with `<5>` rendered literally.
5. Reload and re-open the editor: the **Reconstructed** switch must still be ticked.

### 3b. Emended year toggle +/- (Backend not yet implemented)

1. Open the editor, tick the **Emended** switch.
2. The preview should show the year followed by `!`, e.g. `5!.III.12 Sargon`.
3. Save, reload, re-open: **Emended** switch still ticked.

### 3c. Non-blocking warnings for raw symbol entry

Open the editor and type each of the following into the **Year** field. After each entry, look for a warning message below the input (amber text). Do **not** click Save — just observe warnings:

| Input  | Expected warning                                                      |
| ------ | --------------------------------------------------------------------- |
| `<5>`  | "Year contains angle brackets. Use the Reconstructed switch instead." |
| `[5]`  | "Year contains square brackets. Use the Broken switch instead."       |
| `5!`   | "Use the Emended switch instead."                                     |
| `5?`   | "Use the Uncertain switch instead."                                   |
| `XIV`  | "Non-standard value may skip date conversion for this field."         |
| `21%$` | "Non-standard value may skip date conversion for this field."         |

For **Month** and **Day** fields:

| Input | Field | Expected                                                         |
| ----- | ----- | ---------------------------------------------------------------- |
| `5?`  | Day   | "Use the Uncertain switch instead."                              |
| `XIV` | Day   | "Non-standard value may skip date conversion for this field."    |
| `XIV` | Month | **No** non-standard warning — month is excluded from that check. |

### 3d. Allowed patterns do NOT trigger non-standard warning

Type the following values into the **Year** or **Day** field and verify that **no** non-standard warning appears:

`12`, `x`, `12+`, `x+5`, `12-14`, `12/14`, `12a`, `12b`

### 3e. Patterns help icon

1. In the date editor, look for a small info circle icon (ⓘ) next to the Year, Month, and Day inputs.
2. Hover over the icon.
3. **Expected:** a popover opens showing a two-column table of allowed patterns (`n`, `x`, `n+`, `x+n`, `n-n`, `n/n`, `n[a-z]`) with a short explanation for each row.

### 3f. Conversion works with wrapped year values

1. Enter `<136>` in the Year field of an SE date.
2. **Expected:** the **Selected date** preview still shows a valid modern date — conversion is not skipped because `136` is extracted from the brackets before parsing.

---

## BUG-4 — Intercalary months not taken into account in conversion

**Reference fragment:** `MNB.1129` — date is `16.VI².3 Cambyses`.

1. Open `https://<host>/library/MNB.1129` (or any fragment with an intercalary month date).
2. In the Info panel, locate the Date row. The intercalary month is marked with `²` in the display (e.g. `VI²`).
3. **Expected modern date:** `31 August 527 BCE PJC` — the intercalary VI month maps to month 13, not plain month 6.
4. Click the pencil icon and observe the **Selected date** preview — confirm it matches the displayed modern date.
5. **Edge case — intercalary month not in the year's data:** open or create a date where the intercalary VI or XII is not supported for that specific Seleucid year. **Expected:** the date falls back gracefully to the non-intercalary month (6 or 12) rather than producing an error or wrong year.

---

## BUG-5 — Year 0 of a king converted incorrectly

**Reference fragment:** `VAT.8439` — date is `1.I.0 Nabonidus`.

### 5a. Display check after save + reload

1. Open `VAT.8439` or any fragment with a year-0 king date.
2. **Expected display:** `1.I.0 Nabonidus` — the original entered king and year 0, not the calculation intermediary "Neriglissar year 4".
3. The modern date shown should be `18 August 556 BCE PJC` (calculation uses Neriglissar's final year internally but the label shows Nabonidus year 0).

### 5b. Editor initialization check

1. Click the pencil icon to open the date editor for a year-0 Nabonidus date.
2. **Expected:** the **King** dropdown shows **Nabonidus** and the **Year** field shows **0**.
3. Before this fix the editor incorrectly pre-populated "Neriglissar" and "4" — this must not happen.

### 5c. Round-trip persistence check

1. With the editor open showing Nabonidus / year 0, click **Save** without changing anything.
2. Reload the page.
3. **Expected:** the date still shows `1.I.0 Nabonidus` — the year-0 values, not the calculation intermediary, are persisted to the backend.

### 5d. Non-numeric predecessor edge case

Year 0 of **Nabonidus** requires walking back past Labaši-Marduk (whose `totalOfYears = "3 months"` is non-numeric) to Neriglissar. The result in 5a confirms this worked. For additional confidence, check a king whose immediate predecessor has a normal numeric reign (e.g. Rimush year 0 → uses Sargon's 56 years) and verify the conversion is also correct.

---

## General UI smoke tests

1. **Add a new date** to a fragment that has none: click the `+` button in the dates-in-text area, fill in year/month/day, click **Save**. Verify the date appears in the list.
2. **Edit a date in the list:** click the pencil icon on a date in the dates-in-text list, change day and month, click **Save**. Verify the updated date is reflected.
3. **Delete a date from the list:** click the pencil icon, click **Delete**. Verify the date is removed from the list.
4. **SE date toggle:** open the editor, tick **Seleucid Era**, enter year/month/day. Verify conversion produces an SE-era modern date.
5. **Assyrian date toggle:** tick **Assyrian date**, pick an eponym. Verify the editor hides year/month/day fields and the save flow works.
6. **Broken / Uncertain switches** on year, month, day: tick each, verify the `[`, `]`, `?` superscripts appear correctly in the preview and in the saved display.
