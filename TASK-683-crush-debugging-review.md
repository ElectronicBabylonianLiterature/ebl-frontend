# TASK-683 Review

## Summary

Current changes are materially narrower than the earlier reverted experiment and are now targeted at the proven failure mode. The workflow disables sourcemap generation only for the CI Build step, while leaving the normal package build script and Docker production build behavior unchanged. Local A/B validation showed that this CI-only change flips `CI=true yarn build` from failing to passing.

Runner-context validation is now confirmed: the GitHub Actions `test` job passed on the actual ubuntu-latest runner (PR #692, commit `c748b4d8`). The build blocker is fully closed.

Detailed technical findings are consolidated in `TASK-683-build-investigation.md`.

## Findings

1. CI-only sourcemap disablement is the first locally validated build mitigation

- Files:
  - `.github/workflows/main.yml`
  - `TASK-683-log.md`
  - `TASK-683-todo.md`
- Why this matters:
  - Local A/B testing showed the exact causal difference:
    - `CI=true yarn build` failed with the CRA early-exit signal message.
    - `CI=true GENERATE_SOURCEMAP=false yarn build` passed.
  - This is materially different from the earlier wrapper-based experiment because it changes only the memory-heavy webpack sourcemap behavior in CI.
- Risk:
  - Low for production behavior, because package and Docker production build paths remain unchanged.

1. GitHub Actions runner validation is confirmed (blocker closed)

- Files:
  - `.github/workflows/main.yml`
  - `TASK-683-issues-summary.md`
  - `TASK-683-log.md`
- Why this matters:
  - PR #692 CI `test` job returned `success` on GitHub Actions ubuntu-latest runner.
  - The Build step (`GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--max_old_space_size=1536 yarn build`) completed without the early-exit marker on the actual hosted runner.
  - This closes the blocker that was pending runner-context evidence.
- Risk:
  - None remaining for this finding. Build behavior in CI is proven.

1. Production build sourcemaps remain intentionally enabled

- Files:
  - `package.json`
  - `Dockerfile`
- Why this matters:
  - The user requirement was to avoid affecting production build behavior, especially sourcemap generation.
  - The implemented fix satisfies that requirement by scoping `GENERATE_SOURCEMAP=false` to CI only.
- Risk:
  - Local production-style builds may still fail in memory-constrained Codespaces, but that is not a regression introduced by this fix.

## Severity

- Finding 1: Medium
- Finding 2: Resolved
- Finding 3: Low

## Reproduction Steps

1. Use the current change set.
2. Run `CI=true yarn build` in the constrained local environment and observe the early-exit failure.
3. Run `CI=true GENERATE_SOURCEMAP=false yarn build` in the same environment and observe successful completion.
4. Confirm that `package.json` and `Dockerfile` still do not set `GENERATE_SOURCEMAP=false` globally.
5. Run the GitHub Actions `test` job to validate the same command path on a hosted runner.

## Recommendation

1. Keep the current workflow-only change in `.github/workflows/main.yml`.
2. Do not move `GENERATE_SOURCEMAP=false` into `package.json` or `Dockerfile`, because that would change production build behavior.
3. Validate the updated `test` job once in GitHub Actions runner context.
4. If the hosted-runner build passes without the early-exit marker, close the blocker and request re-review.
5. Keep `TASK-683-build-investigation.md` as the detailed reference for the underlying OOM analysis.

## Comment Status Tracking

- Unresolved comments: none.
- Resolved comments:
  - Blocker (runner-context validation): confirmed — PR #692 CI `test` job passed on GitHub Actions runner.
  - Guarded build wrapper should not remain in the main build path.
  - Production build configuration should not be changed just to stabilize CI.
  - Broad revert recommendation no longer applies to the current narrower fix.
  - qlty `zizmor/excessive-permissions` findings in PR review threads: all 3 marked resolved.

## What Has To Be Done

1. ~~BLOCKER: Run the GitHub Actions `test` job with the updated Build step and confirm `GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--max_old_space_size=1536 yarn build` completes successfully.~~ **Done — PR #692 `test` job: success.**
2. ~~Re-run verification set after changes: `yarn lint`, `yarn tsc`, and the CI-representative build command.~~ **Done — lint and tsc both pass; CI build confirmed green.**
3. Validate Docker workflow behavior in GitHub Actions runner context separately, because Docker CLI is unavailable locally. _(Docker and docker-test jobs only run on master push; will be validated at merge time.)_
4. Request re-review after the runner-context build evidence is attached. _(Evidence available via PR #692 CI status checks.)_
5. Before merge, remove task artifact files if no longer needed (including this review file), per task cleanup rules.
