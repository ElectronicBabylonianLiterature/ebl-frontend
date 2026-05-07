# TASK-714 — Work Log

## 2026-05-07 — Session start

- Recovered prior review from `5d37dad2^:TASK-001-review.md`; produced fresh review as `TASK-714-review.md` on HEAD `5d37dad2`.
- Verified hard gates locally on HEAD (pre-fix baseline): `yarn lint` clean, `yarn tsc` clean; focused `src/chronology` + `src/fragmentarium` run = 111 suites / 1263 tests pass, 2 skipped, **zero console output**.
- Live findings to fix: F14 (qlty similar-code on `Date.intercalary.test.ts`), F15 (missing transport-layer test for `updateDate(..., undefined)`), F16 (`Corpus.integration.test.ts` interaction-coverage regression + FL1 flake root cause).

## Next entries — to be appended as work progresses

## 2026-05-07 — F15 / F16 / F14 implementation

- **F15** Added second `TestData('updateDate', [fragmentId, undefined], apiClient.postJson, fragment, [\`/fragments/${…}/date\`, { date: undefined }], Promise.resolve(fragmentDto))`row in`src/fragmentarium/infrastructure/FragmentRepository.test.ts`. The `testDelegation`harness asserts the post body is invoked with`{ date: undefined }`(which`JSON.stringify`collapses to`{}`).
- **F16** Restored `appDriver.click('Divination')` and `await appDriver.waitForText(/Divination Third Category/)` in `src/corpus/ui/Corpus.integration.test.ts`. Diagnosed the FL1 flake root cause: the master form was both unawaited **and** used a string matcher that could never match the rendered DOM (the label is split across multiple text nodes inside `<a>`). Switched the matcher to a regex; assertion is now real. Snapshot for `Without session` updated (auto-generated `Header-*` / `CorpusTab-*` IDs only — no semantic change).
- **F14** Collapsed the four `ca. …` `it` blocks in `src/chronology/domain/Date.intercalary.test.ts` into one parametrized `it.each(cases)` block over a typed `ApproxCase` record (`label`, `year`, `month`, `day`, `isSeleucidEra`, `converterArgs`, `expectsCa`). Both `setToMesopotamianDate` and `setToSeBabylonianDate` paths drive from the same case array.
- Hard gates after fixes:
  - `yarn lint` — clean.
  - `yarn tsc` — clean.
  - Full suite: 299 suites / 2972 tests pass, 2 skipped, **zero console output**.
  - Focused `-t updateDate` run on `FragmentRepository.test.ts`: 6 assertions pass.
  - Coverage on chronology changed files: `parseDateFieldNumber.ts` 100%, `normalizeMesopotamianMonth.ts` 100%, `dateFieldWarnings.ts` 100%, `DateFieldPatternsHelp.tsx` 100%, `DateSelectionInput.tsx` 100%, `Date.ts` 100% statements / 91.66% branch. `DateBase.ts`, `DateConverter.ts`, `DateRange.ts`, `ZeroYearKingFinder.ts` ≥ 92% statements (uncovered lines pre-existing; not introduced by this PR).
- Not committed / not pushed — awaiting explicit user permission per project rules.
