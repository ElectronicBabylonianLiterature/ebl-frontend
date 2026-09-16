<!-- markdownlint-disable MD013 -->

# TASK-749 — Read `nameBreaks` alongside `nameParts` (frontend)

**Branch:** `add-name-breaks`
**Based on:** `chore/remove-bluebird` (PR #774) — per explicit user instruction, _not_ `master` as the brief specifies
**Blocks:** `ebl-api` [PR #743](https://github.com/ElectronicBabylonianLiterature/ebl-api/pull/743)
**Source material:** `TASK-749-frontend-brief.md`, `TASK-749-frontend.patch` (commit `a9df351`), `TASK-749-frontend-pr-body.md`

## Todo

- [x] Commit the pre-existing untracked `TASK-*.md` task docs (explicit user request)
- [x] Read the brief, the patch, and the PR body
- [x] Confirm Node 20 is active (brief warns Node 22 breaks `yarn install` and husky)
- [x] Create branch `add-name-breaks` with `--no-track`, based on `chore/remove-bluebird`
- [x] Verify the patch applies cleanly (`git apply --check`)
- [x] Apply the patch to the working tree
- [x] Confirm the diffstat matches the patch header (4 files, +110 / -4)
- [x] Create the task TODO and log files
- [x] Verify the applied change matches the brief section by section
  - [x] `token.ts` — `nameBreaks` field on `NamedSign`
  - [x] `token.ts` — exported `nameTokens` helper
  - [x] `token.ts` — `extractEnclosureTypes` routed through `nameTokens`
  - [x] `accents.ts` — import updated, `addAccents` routed through `nameTokens`
  - [x] `token.test.ts` — five `nameTokens` cases
  - [x] `accents.test.ts` — two `addAccents` cases
  - [x] `nameParts` keeps its union type (narrowing would break the legacy fallback)
- [x] Hard gate: 250-line ceiling on every touched file
- [x] Hard gate: `yarn tsc` — zero errors
- [x] Hard gate: `yarn lint` — zero errors
- [x] Hard gate: `CI=true yarn test --watchAll=false` — 500 suites / 4402 tests, zero failures, zero console output
- [x] Hard gate: coverage on the affected code — `token.ts` 100% incl. branches; `accents.ts` 100% stmts/funcs/lines
- [x] Report results and **ask** before committing / pushing / opening the PR
- [x] Write the handoff (`TASK-749-handoff.md`) with remaining findings and next steps
- [x] Commit code + docs together (explicitly authorised)
- [x] Push `add-name-breaks` and open the PR against `chore/remove-bluebird` — [#817](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/817)
- [x] Fix the red `test` check on #817 — pre-existing vacuous promise comparison in `FragmentService.queries.test.ts`
- [x] Reproduce the full CI job locally (bluebird check, lint, tsc, tests with `--detectOpenHandles`, build) — all green
- [ ] Retarget the PR to `master` once #774 merges
- [ ] Decide: keep stacked on #774, or re-cut from `master` to decouple the deploy
- [ ] Decide: fix the pre-existing Browserslist advisory separately?
- [ ] Before merge: remove the `TASK-749-*` and `TASK-774-*` / `TASK-ts7-*` tracking docs

## Open questions for the user

1. **PR base** — the new PR should target `chore/remove-bluebird`, not `master`, since it
   is stacked on #774. It will need retargeting to `master` once #774 merges.
2. **Deploy order** — the brief is emphatic that this frontend change must ship _before_
   ebl-api #743. Stacking it on #774 couples its release to #774 merging first.
3. **Browserslist advisory** — pre-existing noise in every test run; fixing it means a
   `yarn.lock` dependency bump. Bundle it here, or leave it?
4. **Doc cleanup before merge** — `TASK-749-*` (5 files), `TASK-774-*` (5) and
   `TASK-ts7-*` (3) should be removed before merging.
