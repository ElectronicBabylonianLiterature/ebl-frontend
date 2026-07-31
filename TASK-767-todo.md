# TASK-767 — TODO

Review of PR #767 "Add realia annotation layer to named entity annotation", and the
remediation of every open finding.

## Round 1 — head `7d5015e2` (complete)

- [x] Gather reviews, inline threads, issue comments, check runs, commit statuses, qlty
- [x] Verify each pre-existing reviewer point against the head
- [x] Gates on the merge with `origin/master` (`e96b8536`)
- [x] Apply fixes F1–F6, F8; record F7, F9, F10 as not applied / external

## Round 2 — review of head `f93df643` (complete)

- [x] Re-fetch every review event, inline thread, issue comment, check run, commit status
- [x] Re-verify all seven reviewer points against the head — all fixed
- [x] Independent audit → raised **N1** (redundant round-trip) and **N2** (added comment)
- [x] Gates on the merge with `origin/master` (`d9312619`) — all green, 100% coverage
- [x] Re-check `ebl-api` #740 — still open, so **F10** stands

## Round 3 — remediation of every open finding

### N2 — comment added against the no-comments rule

- [x] Remove the three-line comment from `src/signs/ui/display/SignImages.tsx`
- [x] Re-verify lint, tsc, the three `SignImages` suites, and its 100% coverage

### F7 — repository-policy changes bundled into the feature PR

- [x] Restore `.github/copilot-instructions.md` from `origin/master`
- [x] Restore `.husky/pre-commit` from `origin/master`
- [x] Restore `.husky/pre-push` from `origin/master`
- [x] Verify each file matches `origin/master` exactly (`git diff --quiet`) — confirmed

### N1 — editor round-tripped for data the fragment already carries

- [x] Stop `createFragmentAnnotationSpans` dropping annotations with an empty span, so the
      derived value matches what `GET /named-entities` returns
- [x] Seed `TextAnnotation` from `createFragmentAnnotationSpans(fragment)`; single `find`
- [x] Delete `fetchNamedEntityAnnotations` from `FragmentService`, `ApiFragmentRepository`
      and the `FragmentRepository` port (approved by the user)
- [x] Delete the corresponding tests (approved by the user)
- [x] Add `withAnnotationSpans` test support so suites seed annotations through the fragment
- [x] Pin the single request with a test
- [x] Update `fragmentSpans.test.ts` to assert the empty-span behaviour, keeping both
      cross-kind negative tests

### F9 — `Fragment`'s 34-parameter constructor

- [x] Replace the positional constructor with a `FragmentProps` object and explicit fields
- [x] Convert both direct call sites (`test-fragment.ts`, `fragment-fixtures.ts`)
- [x] Confirm `qlty smells` no longer reports `Fragment`

### F6 — the 250-line ceiling

- [x] `FragmentService.ts` 729 → **246** (+ `fragmentServiceBase`, `fragmentCache`,
      `scopedCache`, `fragmentCacheKeys`, `fragmentProvenance`, `fragmentReferences`)
- [x] `FragmentRepository.ts` 541 → **234** (+ `fragmentFactories`,
      `fragmentRepositoryUpdates`, `fragmentRepositoryAttestations`)
- [x] `SignImages.tsx` 368 → **209** (+ `signClusterAnnotations`, `SignImageFigures`)
- [x] `FragmentService.test.ts` 1921 → **214** across 13 sibling suites + 3 support modules
- [x] `FragmentRepository.test.ts` 950 → **190** across 6 sibling suites
- [x] `test-fragment.ts` 560 → **126** (+ `test-fragment-dto`, `test-fragment-lines`,
      `test-fragment-more-lines`)
- [x] Verify **no** file in the changed set exceeds 250 lines

### Follow-on quality

- [x] De-duplicate the `externalNumbers` fixture between `Fragment.test.ts` and
      `test-fragment-dto.ts` (surfaced by `qlty smells` after the split)

## Gates

- [x] `yarn tsc` on the merge with `origin/master` (`d9312619`) — exit 0
- [x] `yarn lint` on the merge — exit 0
- [x] `yarn test --watchAll=false` locally — 405/405 suites, 3863 passed, zero console output
- [x] `qlty check` over the changed set — no issues
- [x] `qlty smells` over the changed set — only the pre-existing `TestData` constructor
- [ ] `yarn build` on the merge
- [ ] Full suite + 100% coverage of every changed source file on the merge

## Open items

- [ ] **F10 (external blocker)** — `ebl-api` #740 merged **and deployed** before #767 merges
- [ ] Commit and push this branch so CI sees the changes, then confirm the checks are green
- [ ] Re-review from `Fabdulla1` to clear `CHANGES_REQUESTED` (`4815952885`)
- [ ] `TestData`'s 6-parameter constructor — pre-existing, left alone (see the review)
- [ ] Remove `TASK-767-*.md` before the PR is merged

## Output

- [x] `TASK-767-log.md`
- [x] `TASK-767-review.md`
