# TASK-REALIA-AFO — Work Log

## Research

- `RealiaDisplay.tsx`: RlA entries use `CollapsibleCard` (collapsed); AfO entries are
  flat `<div>`s with `[AfO {AfO} {reference}]`.
- The backend `AfO` field already includes the "AfO N (years), page" text, so the
  hardcoded `[AfO ...]` prefix double-prints "AfO AfO ...".
- The existing AfoRegister feature (`afo-register/domain/Record.ts`) renders the
  register location as a trailing `<small>[afoNumber, page]</small>` marker — reused
  the same visual convention here.

## Implementation

- `RealiaDisplay.tsx`:
  - Added `formatAfoReference(afo)` — prepends "AfO " only when the value does not
    already start with it (case-insensitive). Fixes the "[AfO AfO 25 ...]" duplication.
  - `AfoRegisterItem` now renders a `CollapsibleCard` (collapsed by default), label =
    `mainWord`, matching the Reallexikon section — section is now expandable.
  - Card body: optional `note`, then the `reference` text followed by a secondary
    `[AfO ...]` register marker.
- `Realia.sass`: added `.Realia__afo-entry`, `.Realia__afo-note`,
  `.Realia__afo-reference`; tightened `.Realia__afo-citation` (secondary, 0.85rem).
- `realia-fixtures.ts`: AfO/reference now match the real backend shape
  (`AfO N (years), page` + `Author, ABBR n, ppff.`).
- `RealiaDisplay.test.tsx`: added tests for collapsed-by-default card, AfO-prefix
  dedup, and prefix-added-when-missing.

## Gates

- `yarn tsc`: clean.
- `yarn lint`: clean.
- `yarn test --watchAll=false src/realia`: 9 suites / 65 tests pass, zero console noise.
- Coverage of `RealiaDisplay.tsx` + `realia-fixtures.ts`: 100% stmts/branch/funcs/lines.
- Full suite: 3 pre-existing failures in `corpus/ui/Corpus.integration.test.ts` and
  `common/ui/ApiImage.test.tsx`. Verified pre-existing (fail identically with the
  realia changes stashed) — unrelated to this task, NOT introduced here.

## Pre-existing failures — fixed in this task

- Symptom: `src/common/ui/ApiImage.test.tsx` and `src/corpus/ui/Corpus.integration.test.ts`
  (2 snapshots) expected `http://example.com/...` but received `http://localhost:8001/...`.
- Root cause: the devcontainer exports `REACT_APP_DICTIONARY_API_URL=http://localhost:8001`
  into the shell from `.env.local`. `dotenv` never overrides an already-set
  `process.env` value, so `.env.test`'s `http://example.com` was ignored — the tests
  depended on external (shell) state.
- Fix: `src/setupTests.ts` now parses `.env.test` and force-assigns every value over
  `process.env` at setup time, so the suite is deterministic regardless of leaked shell
  vars. (Note: bundled `dotenv` is v10, which lacks the `override` option, so a manual
  `parse` + assign is used.)
- Verified: both suites pass; full suite 320/320 green, 50 snapshots pass, zero console noise.
- Also updated `.github/copilot-instructions.md` with a "Pre-existing Issues" policy:
  always fix pre-existing issues immediately upon detection as part of the same task.

## Follow-up: group AfO items by volume

- Replaced one-card-per-item with one card per AfO **volume**. The card header is the
  volume name (e.g. "AfO 25 (1974-1977)"); the body lists every item registered in that
  volume (main word, page, note, reference).
- New domain helpers in `RealiaEntry.ts`:
  - `formatAfoVolume` — normalizes the "AfO" prefix (renamed from the display-local helper).
  - `groupAfoRegisterByVolume` — parses each `AfO` string into volume + page and groups by
    volume, preserving first-seen order. Parsing anchors on the parenthesized year, with
    fallbacks to the last comma, then the whole value (empty page).
- `Realia.sass`: `.Realia__afo-entries` list + `.Realia__afo-entry` separators +
  `.Realia__afo-mainword`.
- Tests: rewrote the display AfO tests for grouping; added domain unit tests for
  `formatAfoVolume` and `groupAfoRegisterByVolume` (grouping, page extraction, prefix
  normalization, comma fallback, no-separator fallback).
- Gates: tsc clean, lint clean, full suite 320/320 green (3248 passed, zero console noise),
  100% coverage on `RealiaDisplay.tsx` + `RealiaEntry.ts`.

## Follow-up: RlA references stuck in section III (e.g. Enlil, Ellil)

- Symptom: for `/realia/Enlil, Ellil`, section III. References showed
  "Nötscher, 1938: 382–387 (D)" (ref id `rla_2_382p`); it should instead appear in the
  expandable section I. Reallexikon, and III should be absent.
- Root cause: the old filter only moved a reference out of III when a reallexikon entry's
  `reference` field id-matched it. Enlil's RlA reference is NOT explicitly linked from a
  reallexikon entry — it is identifiable only by the backend's `rla_` id-prefix convention,
  so the id-match filter left it in III.
- Fix (`RealiaRepository.ts`): a reference is a Reallexikon reference when it is either
  explicitly linked OR its id starts with `rla_`. Such references are excluded from III and
  surfaced in section I. Unlinked RlA references are attached to the first reallexikon entry
  (or, if there are none, rendered in a fallback card titled by the entry id).
- Model change: `ReallexikonEntry.reference: Reference | null` →
  `references: readonly Reference[]` (an RlA article may cite multiple works). Display and
  fixtures updated accordingly.
- Tests: repository tests for the unlinked-`rla_` case (single entry, multiple entries,
  no entry), updated existing reallexikon-mapping assertions; display tests updated.
- Gates: tsc + lint clean; full suite 320/320 green (3251 passed, zero console noise);
  100% coverage on RealiaRepository.ts, RealiaDisplay.tsx, realia-fixtures.ts.
- NOT YET verified against the live entry: the dev API on :8001 never came up, so I could
  not confirm against the real `Enlil, Ellil` document. Fix is based on the `rla_` id
  convention documented in the prior DB audit (`rla_2_382p`). Needs a live check.

## Cleanup reminder

- Remove TASK-REALIA-AFO-todo.md and TASK-REALIA-AFO-log.md before the PR is merged.
