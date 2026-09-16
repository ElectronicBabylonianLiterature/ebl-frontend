<!-- markdownlint-disable MD013 -->

# TASK-749 — Work Log

Working document. **Delete before merge.**

## 2026-09-16 — Review pass

Reviewed PR #817 at head `f18d0ce5`. Full write-up in `TASK-749-review.md`.

Gathered from the GitHub API before starting, as the review gate requires: 0 timeline review events, 0 inline review comments, 0 issue comments, 0 requested reviewers. No review bot is configured in this repository — no `.sourcery.yaml`, no bot account has posted. So there was no pre-existing feedback to reconcile.

Checks on `f18d0ce5`: `test`, `CodeQL`, `Analyze (javascript)`, `GitGuardian` ×3 and the `qlty check` commit status all green; `docker` / `docker-test` skipped because both are gated on pushes to `master`. The code-scanning _alerts_ endpoint returned `Resource not accessible by integration` for this environment's token, so alerts could not be enumerated directly — the green check run is what the review relies on.

Dev container: **no changes**, verified against both the base branch and `master`. The infrastructure changes visible in the wider stack (`.github/workflows`, `craco.config.js`, `tsconfig.json`, `package.json`, `yarn.lock`) were traced to #774 and the TS7 migration commit; none touch `.devcontainer/`.

Verified the interleave against the backend rather than the PR description: `NamedSign._interleaved` in `ebl/transliteration/domain/sign_token_base.py` zips with `zip_longest` and yields the part then the break when non-`None`, and `_validate_name_breaks` enforces `len(breaks) <= len(parts)`. The client's `index < nameBreaks.length` form is exactly equivalent.

F2 was confirmed by mutation, not inferred: reverting `token.ts:230` to `namedSign.nameParts.map(...)` left the entire suite green at 500 suites / 4402 tests. `token.ts` was restored byte-identical afterwards.

Local gates on the unmodified branch: `yarn tsc` 0 errors, `yarn lint` clean, `CI=true yarn test --watchAll=false` 500 suites / 4402 tests / 50 snapshots passed in 490.9 s with no console output beyond the pre-existing Browserslist banner, `qlty check` and `qlty smells` clean over the changed files.

### Instruction failures in this pass

Two, both self-corrected in the follow-up below.

1. **No TODO or work-log document was created.** The project instructions make both mandatory for every task and require them to be kept updated while working. Only the review file was written. Root cause: the review deliverable was treated as the whole task, and the task-tracking rule was read as applying to code changes rather than to any task.
2. **The application was never run.** The review guidelines require verifying changed behaviour against the running application before finalizing conclusions. The test suite was substituted for that and the substitution was disclosed rather than corrected.

### Unrelated change

`.gitignore` gained `.qlty/*` plus a `!.qlty/qlty.toml` negation, on request. The negation matters: `.qlty/qlty.toml` is tracked and carries the stylelint `**/*.sass` exclude that keeps the `qlty check` status green, and git cannot re-include a file whose parent directory is excluded — hence `.qlty/*` rather than `.qlty/`. Uncommitted.

## 2026-09-16 — Findings pass

Addressing F2–F6; F1 (cleanup) deliberately out of scope on request.

### What changed

- **F2** — `src/transliteration/domain/token.test.ts`: added a shared `interruptedName` fixture (parts both `BROKEN_AWAY`, break carrying none) and two assertions pinning `extractEnclosureTypes` to `nameTokens`. Verified by re-running the same mutation that previously passed: it now fails both new tests.
- **F3** — `src/transliteration/domain/token.ts`: `nameTokens` rewritten as `_.zip(nameParts, nameBreaks).flatMap(...)`, dropping the index arithmetic. Surplus breaks are no longer discarded, and the shape now mirrors the backend's `zip_longest` one-for-one. Chosen over appending a `slice` because it is shorter — `token.ts` sits at 247 of the 250-line ceiling, so the four lines mattered.
- **F5** — new `src/test-support/named-sign-fixtures.ts` (60 lines): `valueToken()`, `brokenAway()`, `namedSignFixture()`, fully typed, zero casts. `token.test.ts` and `accents.test.ts` both migrated; no `as unknown as` remains in either. The two relative imports the PR had touched in `accents.test.ts` were normalised to alias paths while there.
- **F6 / F7 / F8** — no code change. F6 is a follow-up blocked on ebl-api#743 deploying, F7 is a decision, F8 is a clean bill of health.

### F4 was wrong

The finding claimed the `pendingResult` variable in `FragmentService.queries.test.ts` was a pointless single-use temporary. Inlining it fails lint:

```text
error  `queryByTraditionalReferences` query is sync so it does not need to be awaited
       testing-library/no-await-sync-queries
```

The rule matches any `await …queryBy*(…)` call and mistakes the service method for a Testing Library query. The variable is a deliberate workaround. Reverted; the finding is marked withdrawn in the review rather than quietly dropped.

Root cause of the bad finding: the simplification was judged by reading alone, without running lint against it first.

### Two mistakes worth recording

1. **`git checkout -- src/transliteration/domain/token.ts`** was used to undo the F2 mutation experiment. It reverted the whole file, silently wiping the F3 fix applied minutes earlier. Caught only because the new F3 test failed in the next full run. Undoing a deliberate experiment should be a targeted inverse edit, not a whole-file checkout, whenever the file also carries unrelated work.
2. **The prettier pass was re-run before a later hand edit,** so `token.ts` went into the gate run unformatted and lint failed on it. Formatting belongs after the last edit to a file, not before.

### Verification against the running application

The review guidelines require verifying changed behaviour against the running application. Done properly this pass.

Chrome 131 was installed to `~/.cache/puppeteer` (outside the repo — `git status` unaffected). The app's entry point was temporarily pointed at a harness rendering the real `DisplayToken` for both payload shapes, served by `yarn start:fast`, and loaded headless with `--dump-dom` and `--screenshot`.

| `addAccents` implementation          | New shape (`nameParts` + `nameBreaks`) | Legacy shape (interleaved) |
| ------------------------------------ | -------------------------------------- | -------------------------- |
| `nameTokens(namedSign)` — as shipped | `k]u`                                  | `k]u`                      |
| `namedSign.nameParts` — pre-PR       | **`ku`** — bracket silently dropped    | `k]u`                      |

The negative control is the point: it reproduces the actual bug, in a real browser, and shows the fix curing it. Rendered markup was identical between the two shapes with the fix in place.

Harness removed afterwards; `git diff src/index.tsx` and `git diff src/transliteration/domain/accents.ts` are both empty.

### Files changed in this pass

| File                                                            | Change                                                |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `src/transliteration/domain/token.ts`                           | F3 — `nameTokens` rewritten (247 lines)               |
| `src/transliteration/domain/token.test.ts`                      | F2 + F5 — new assertions, shared fixtures (120 lines) |
| `src/transliteration/domain/accents.test.ts`                    | F5 — shared fixtures, alias imports (83 lines)        |
| `src/test-support/named-sign-fixtures.ts`                       | F5 — new (60 lines)                                   |
| `src/fragmentarium/application/FragmentService.queries.test.ts` | unchanged — F4 reverted                               |

Nothing committed.
