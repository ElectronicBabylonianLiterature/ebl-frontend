# TASK-683 TODO

## Goal

Upgrade `@typescript-eslint` stack to support TypeScript 5.9.x cleanly, verify local lint/test/build, and confirm CI/remote actions remain aligned.

Detailed build-termination findings: `TASK-683-build-investigation.md`.

## Progress

- [ ] Capture current dependency/config baseline (`package.json`, ESLint configs, workflows)
- [ ] Run `yarn tsc`, `yarn test --coverage`, and `yarn build` (tsc/tests pass; build remains intermittent with external kill `exit 137`; see `TASK-683-build-investigation.md`; full coverage rerun still pending)
- [ ] Verify GitHub Actions workflows still use correct commands/runtime (experimental retry/build workflow changes were reverted because build stability was not proven; docker command still requires Actions runner validation)
- [ ] Resolve/reproduce build issue: `yarn build` exits early (`The build failed because the process exited too early`) (root cause direction documented in `TASK-683-build-investigation.md`; external `SIGTERM` reproduced; stable fix still not proven)
- [ ] Review warning: `bare-fs@4.5.3: The engine "bare" appears to be invalid` (via `lighthouse` transitive deps; only plain-update path is `lighthouse` version change)
- [ ] Review warning: `bare-os@3.6.2: The engine "bare" appears to be invalid` (via `lighthouse` transitive deps; only plain-update path is `lighthouse` version change)
- [x] Stabilize full test termination first and obtain one complete rerun with Jest final summary (confirmed repeatable on 2026-03-25: 3/3 `yarn test:diag` runs reached final Jest summary without early-exit marker)
- [ ] Verify CPU-saturation mitigation for full test runs in Codespace (`test` script now uses `--runInBand`) and confirm no 100% CPU warning recurrence in repeated runs
- [x] Add a dedicated diagnostic test command with `--logHeapUsage` for memory/CPU investigation runs (`yarn test:diag`)
- [x] Generate compact hotspot report artifact from diagnostic run (`TASK-683-test-diag-hotspots-2026-03-25.md`)
- [x] Update dependency declarations and `resolutions`
- [x] Reinstall dependencies with `yarn install` and refresh lockfile
- [x] Run `yarn lint` and fix upgrade-related config/rule breaks only
- [x] Investigate and document lint TypeScript warning root cause (`@typescript-eslint` runtime install drift vs lockfile)
- [x] Treat build/test terminations as shared runner-process-kill class issue and keep CI mitigations aligned (unit-test + docker workflows hardened with retries/timeouts)
- [x] Review warning: `Resolution field "eslint@8.57.1" is incompatible with requested version "eslint@^7.12.0"`
- [x] Review warning: `webpack-dev-server > webpack-dev-middleware@5.3.4 has unmet peer dependency "webpack@^4.0.0 || ^5.0.0"`
- [x] Review warning: `bootstrap@5.3.8 has unmet peer dependency "@popperjs/core@^2.11.8"`
- [x] Review warning: `react-dynamic-sitemap@1.2.1 has incorrect peer dependency "react@^16.13.1"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation@0.9.10 has incorrect peer dependency "react@^16.3"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation > styled-components@3.4.10 has incorrect peer dependency "react@>= 0.14.0 < 17.0.0-0"` (wontfix via plain updates; inherited from package above)
- [x] Decide and apply mitigation for `postcss-resolve-url` deprecation warning (`resolve-url-loader` transitive upgrade)
- [x] Summarize changes, risks, and follow-up cleanup reminder
- [x] Create artifacts: full test output log and issues summary table
- [x] Create separate detailed all-test-issues table with locations and solution options
- [x] Re-run full CI-style test suite and save output to a new log file (`TASK-683-test-output-rerun-2026-03-10-2.txt`)
- [x] Create new rerun issues summary file from latest output (`TASK-683-test-issues-rerun-2026-03-10-2.md`)
- [x] Audit repo for commented-out test assertions/placeholders and document findings in `TASK-683-commented-test-assertions-audit.md`
- [x] Restore identified commented-out assertions and placeholders in affected test files, then verify with focused test runs
- [x] Audit `src/` for recently added comments and document findings in `TASK-683-src-comments-audit.md`
- [x] Restore removed `/* eslint-disable react/prop-types */` headers in targeted files and verify against `master`
- [x] Analyze `src/__tests__` placement against project-wide test structure conventions
- [x] Audit files added/renamed since `2026-01-01` for structure-placement mismatches
- [x] Decide relocation plan for out-of-place test files
- [x] Relocate `src/__tests__/` security tests to feature-co-located paths and verify lint/focused tests
- [x] Relocate root-level `useObjectUrl` tests to `src/common/` and verify lint/focused tests
- [x] Subdivide `src/common` into `ui`, `hooks`, `utils`, `errors` and update affected imports
- [x] Revert singleton/concurrency commit (`a141e29e`) because test termination remained unresolved
- [x] Document constrained no-infrastructure OOM-prevention plan for build and tests (planning only, no code/workflow implementation yet)

## Notes

- Use `yarn` only.
- Keep both `eslint.config.js` and `.eslintrc.json` as requested.
- Pin TypeScript to `5.9.x` as requested.
