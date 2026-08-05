# TASK-docker-build — TODO

Fix the failing Docker checks on `master` after `add-realia-annotation` (PR #767) was merged.

- [x] Identify which CI jobs fail and why they only fail on `master`
- [x] Read `Dockerfile` / `.dockerignore` / `main.yml`
- [x] Reproduce the failure locally in a pruned copy of the Docker build context
- [x] Confirm the root cause against `react-scripts` fork-ts-checker configuration
- [x] Fix `.dockerignore` so test-only modules are excluded from the build context
- [x] Re-run type-check in the pruned Docker context — zero errors
- [x] Run the full `yarn build` in the pruned Docker context — succeeds
- [x] Hard gate: `yarn lint` — zero errors
- [x] Hard gate: `yarn tsc` — zero errors
- [x] Hard gate: `yarn test --watchAll=false` — 406/406 suites, 3877/3877 tests, zero console output
- [x] Report follow-up recommendation (PR CI does not exercise the Docker build)
- [ ] Remove `TASK-docker-build-todo.md` and `TASK-docker-build-log.md` before merge
