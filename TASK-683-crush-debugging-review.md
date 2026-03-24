# TASK-683 Review

## Summary

Current unstaged setup changes are not approval-ready and should not be kept as-is. They do not solve the root problem, and they add workflow gating on top of a build path that remains unstable in both CI-mode and repeated local retries.

Detailed technical findings are consolidated in `TASK-683-build-investigation.md`.

## Findings

1. CI build gate added before build reliability is established (blocker)

- Files:
  - `.github/workflows/main.yml` (Build step added in `test` job, with retries)
  - `package.json` (`build` now runs `GENERATE_SOURCEMAP=false node scripts/build.js`)
  - `scripts/build.js` (SIGTERM grace handler)
  - `TASK-683-log.md` (`CI=true yarn build` repeatedly fails with exit `137`)
  - `TASK-683-todo.md` (`CI=true` unresolved is explicitly tracked)
- Why this matters:
  - GitHub Actions hosted runners execute with CI semantics; adding `yarn build` as a required test-job gate can fail in the same unresolved mode already observed locally.
- Risk:
  - PR can be blocked by expected runner behavior instead of validating actual change quality.

1. Guarded build wrapper is an experiment, not a validated fix (blocker)

- Files:
  - `package.json`
  - `scripts/build.js`
  - `TASK-683-log.md`
- Why this matters:
  - The wrapper proved that the build receives external `SIGTERM`, but repeated validation still showed `exit 137` kills after the grace handler, including two back-to-back local retry attempts.
- Risk:
  - Keeping the wrapper in the main build path creates maintenance surface without establishing reliable build behavior.

1. Retry loops on build/tests can hide instability trends (non-blocker)

- File:
  - `.github/workflows/main.yml`
- Why this matters:
  - Automatic retries can convert flaky failures into occasional greens and reduce observability of regression signals.

## Severity

- Finding 1: High (Blocker)
- Finding 2: High (Blocker)
- Finding 3: Medium

## Reproduction Steps

1. Use current unstaged state.
2. Run `CI=true yarn build` multiple times.
3. Observe non-zero exits (`137`) documented in local run log.
4. Compare with required CI workflow path where `test` job now runs `yarn build` as a gate.
5. Run `yarn build` twice in succession.
6. Observe that retries also fail in some local runs, so the wrapper is not a stable solution.

## Recommendation

1. Revert the setup changes from runtime/workflow files:

- `.github/workflows/main.yml`
- `package.json`
- `scripts/build.js`

2. Keep the documentation artifacts that capture the experiments and their results.
3. Continue investigation as documentation-first work until there is a demonstrably stable build path.
4. If workflow hardening is retried later, add it only after runner-context evidence shows the build command is reliable.
5. Use `TASK-683-build-investigation.md` as the single detailed reference for the build-failure findings.

## Comment Status Tracking

- Unresolved comments:
  - Blocker: Build gate added while build reliability remains unresolved.
  - Blocker: Guarded build wrapper did not establish reliable build completion.
  - Risk: Retry loops may mask instability patterns.
- Resolved comments:
  - None in this review cycle.

## What Has To Be Done

1. BLOCKER: Resolve `CI=true yarn build` reliability before requiring the new Build step in `.github/workflows/main.yml` `test` job.
2. Revert the current setup changes because they are experimental and not validated fixes.
3. Re-validate workflow behavior in GitHub Actions runner context for the exact `test` and docker-related paths.
4. Decide and document retry policy (keep/remove/tighten) for Build and Unit Tests based on failure observability requirements.
5. Re-run verification set after changes: `yarn lint`, `yarn tsc`, and CI-representative build/test commands.
6. Request re-review after blocker is closed and evidence is attached.
7. Before merge, remove task artifact files if no longer needed (including this review file), per task cleanup rules.
