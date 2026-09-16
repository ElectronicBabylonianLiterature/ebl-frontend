<!-- markdownlint-disable MD013 -->

# TASK-749 — TODO (review follow-up on PR #817)

Working document. **Delete before merge**, together with `TASK-749-log.md`, `TASK-749-review.md` and the other `TASK-*` files listed in review finding F1.

## Scope

Address every finding from `TASK-749-review.md` **except F1 (cleanup)**, which is explicitly out of scope for this pass.

## Items

- [x] **F2** — Add tests that fail if `extractEnclosureTypes` stops routing through `nameTokens`
  - [x] `effectiveEnclosure` with `nameBreaks` present, break carrying a different enclosure set than the parts
  - [x] `isStrictlyPartiallyEnclosed` likewise
  - [x] Re-run the mutation check: reverting `token.ts:230` must now turn the suite **red**
- [x] **F3** — Stop discarding surplus `nameBreaks` in `nameTokens`
  - [x] Superseded: rewrote `nameTokens` with `_.zip`, mirroring the backend's `zip_longest` — shorter than a `slice` and surplus breaks fall out for free
  - [x] Add a covering test
- [x] **F4** — **Withdrawn.** Inlining breaks `testing-library/no-await-sync-queries`; the variable is a deliberate workaround. Reverted, finding corrected in the review.
- [x] **F5** — Replace the three `as unknown as` fabricators with one typed builder
  - [x] New `src/test-support/named-sign-fixtures.ts`, fully typed, zero casts
  - [x] Migrate `token.test.ts` (`namedSign()`, `name()`)
  - [x] Migrate `accents.test.ts` (`valuePart()`, `closingBreak`, `reading()`)
  - [x] Confirm no `as unknown as` remains in either test file
- [x] **F6** — Record the type-narrowing follow-up (no code change; blocked on ebl-api#743 deploying)
- [ ] **F7** — Base branch / deploy order: needs a decision, not a code change
- [ ] **F8** — Dev container: nothing to do (no changes in this PR)

## Instruction-compliance corrections

- [x] Create `TASK-749-todo.md` and `TASK-749-log.md` (were missing from the review pass)
- [x] Keep both updated while working
- [x] Verify changed behaviour against the **running application**, not only the test suite
- [x] Shorten the friendly review summary — the brief asked for _very short_

## Hard gates

- [x] `yarn lint` — 0 errors (one prettier error found and fixed on `token.ts`)
- [x] `yarn tsc` — 0 errors
- [ ] `CI=true yarn test --watchAll=false` — 0 failures, 0 console output
- [ ] Coverage 100% on affected code
- [x] 250-line ceiling on every changed file — max 247 (`token.ts`)
- [x] DRY — no duplicated domain logic or fixture construction
- [ ] `qlty check` / `qlty smells` clean
- [x] `TASK-749-review.md` updated to reflect what was fixed
