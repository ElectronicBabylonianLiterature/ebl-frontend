# TASK-ACCESSION-YEAR — Work log

## Investigation

- Located logic: `src/chronology/domain/ZeroYearKingFinder.ts`, used by `DateBase.ts:57`.
- Model: year 0 of a king = last regnal year of the most recent preceding king with a
  numeric `totalOfYears`. Walk-back started at `parseInt(orderInDynasty) - 1`.
- Verified end-to-end (temp test, since removed): Bardiya year 0 ->
  `1.I.0 Bardiya (26 March 530 BCE PJC ...)` — resolves to Cyrus year 9 = 530.
- Cause: `parseInt("2a") === 2`, walk-back starts at order 1 (Cyrus), skipping
  Cambyses (order "2").

## Decision

- User clarified the desired result is **522 (Cambyses)** — the immediate predecessor
  must not be skipped.

## Blast-radius analysis (node comparison over Kings.json)

- Full sequence/index-based walk-back: changes 22 kings — includes unintended changes
  to Kassite integer-gap kings, Erišum II [38], Šamaš-šum-ukin [32]. Rejected (too broad).
- Targeted (sub-ruler orders start at base order): changes exactly 13 letter-suffixed
  rulers; ranges (`"4–5"`), integer-gap kings, and pure integers all unchanged. Chosen.

Changed rulers (current -> new):

- ᴵDIŠ+U-EN [6a]: Šušši -> Gulkišar
- Tukulti-Ninurta (I) [28a]: Šagarakti-Šuriaš -> Kaštiliašu (IV)
- Ashurbanipal [31a]: Sennacherib -> Esarhaddon
- Bardiya [2a]: Cyrus -> Cambyses (522)
- Nebuchadnezzar III [2b], IV [2c]: Cyrus -> Cambyses
- Bel-šimanni [4a], Šamaš-eriba [4b]: Darius I -> Xerxes (I)
- Naram-Sin and Erišum II [37a]: Puzur-Aššur II -> Naram-Sin
- Mut-Aškur [40a], Rimu-x [40b], Puzur-Sin [40c]: Šamši-Adad I -> Išme-Dagan I
- Sin-šumu-lišir [114a]: Ashurbanipal -> Aššur-etel-ilani

## Implementation

- Added `getWalkBackStartOrder` + `SUB_RULER_ORDER_PATTERN` and used it as the loop
  initializer in `getPreviousKingWithNumericTotalOfYears`.

## Tests added

- `ZeroYearKingFinder.test.ts`: sub-ruler -> base king (Bardiya -> Cambyses, year 8);
  uncertain-year passthrough; integer-gap returns original king (Urzigurumaš [6]).
- `Date.zeroYear.test.ts`: Bardiya year 0 end-to-end -> Cambyses, year 8, 522 BCE.
- `test-support/date-fixtures.ts`: added shared `bardiyaKing` fixture.

## Gates

- `yarn tsc`: clean.
- `yarn lint`: clean.
- `ZeroYearKingFinder.ts` coverage: 100% stmts/funcs/lines. One branch uncovered
  (line 42 `totalOfYears ?? ''`) is structurally unreachable from the public path
  (caller only passes numeric-`totalOfYears` kings) and is pre-existing.
- Full chronology suite: 16 suites / 164 tests pass, 1 snapshot, console-clean.
