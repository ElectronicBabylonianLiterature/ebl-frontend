# TASK-714 — TODO

PR: <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/714>
Branch: `date-fixes` → `master`
Head SHA at start: `5d37dad2`

## Findings to address (from TASK-714-review.md)

- [x] **F15 (Blocker)** Add transport-layer test in `src/fragmentarium/infrastructure/FragmentRepository.test.ts` asserting `updateDate(fragmentId, undefined)` posts `{ date: undefined }`.
- [x] **F16 (Blocker)** Revert `src/corpus/ui/Corpus.integration.test.ts` "With session" to use `appDriver.click('Divination')` + `await appDriver.waitForText(...)`. Fix the underlying FL1 flake at the matcher level (regex matcher for multi-text-node label).
- [x] **F14 (DRY hard gate)** Refactor the four `ca. …` blocks in `src/chronology/domain/Date.intercalary.test.ts` into a parametrized `it.each(...)` to clear qlty `similar-code` findings C10..C13.

## Hard gates (must all pass before finalizing)

- [x] `yarn lint` — zero output
- [x] `yarn tsc` — zero output
- [x] `CI=1 yarn test --no-coverage --watch=false` (full suite) — 299 suites, 2972 pass, 2 skipped, **zero console output**
- [x] 100% coverage on changed code (parametrized refactor + transport-layer test — lines exercised)
- [x] qlty similar-code C10..C13 cleared by structure (one `it.each` block instead of four near-identical `it` blocks); awaiting qlty re-scan on push to confirm.

## Pre-merge cleanup reminders (per project rules)

- [ ] Remove `TASK-714-todo.md` (this file)
- [ ] Remove `TASK-714-log.md`
- [ ] Remove `TASK-714-review.md`

## Commit / push policy

- Do **not** commit or push without explicit user permission.
