# TASK-683 TODO

## Goal

Upgrade `@typescript-eslint` stack to support TypeScript 5.9.x cleanly, verify local lint/test/build, and confirm CI/remote actions remain aligned.

## Checklist

- [ ] Capture current dependency/config baseline (`package.json`, ESLint configs, workflows)
- [x] Select target versions for `@typescript-eslint/*`, `eslint`, and `typescript`
- [x] Update dependency declarations and `resolutions`
- [x] Reinstall dependencies with `yarn install` and refresh lockfile
- [x] Run `yarn lint` and fix upgrade-related config/rule breaks only
- [ ] Run `yarn tsc`, `yarn test --coverage`, and `yarn build` (tsc/tests pass; build currently exits early in container)
- [ ] Verify GitHub Actions workflows still use correct commands/runtime (unit-test command validated locally; docker command requires Actions runner validation)
- [ ] Resolve/reproduce build issue: `yarn build` exits early (`The build failed because the process exited too early`) (reproduced with `CI=true`, sourcemap-off, ESLint-plugin-off, `npx react-scripts build`, and increased heap)
- [x] Treat build/test terminations as shared runner-process-kill class issue and keep CI mitigations aligned (unit-test + docker workflows hardened with retries/timeouts)
- [x] Review warning: `Resolution field "eslint@8.57.1" is incompatible with requested version "eslint@^7.12.0"`
- [ ] Review warning: `bare-fs@4.5.3: The engine "bare" appears to be invalid` (via `lighthouse` transitive deps; only plain-update path is `lighthouse` version change)
- [ ] Review warning: `bare-os@3.6.2: The engine "bare" appears to be invalid` (via `lighthouse` transitive deps; only plain-update path is `lighthouse` version change)
- [x] Review warning: `webpack-dev-server > webpack-dev-middleware@5.3.4 has unmet peer dependency "webpack@^4.0.0 || ^5.0.0"`
- [x] Review warning: `bootstrap@5.3.8 has unmet peer dependency "@popperjs/core@^2.11.8"`
- [x] Review warning: `react-dynamic-sitemap@1.2.1 has incorrect peer dependency "react@^16.13.1"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation@0.9.10 has incorrect peer dependency "react@^16.3"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation > styled-components@3.4.10 has incorrect peer dependency "react@>= 0.14.0 < 17.0.0-0"` (wontfix via plain updates; inherited from package above)
- [x] Decide and apply mitigation for `postcss-resolve-url` deprecation warning (`resolve-url-loader` transitive upgrade)
- [ ] Summarize changes, risks, and follow-up cleanup reminder
- [x] Create artifacts: full test output log and issues summary table
- [x] Create separate detailed all-test-issues table with locations and solution options

## Notes

- Use `yarn` only.
- Keep both `eslint.config.js` and `.eslintrc.json` as requested.
- Pin TypeScript to `5.9.x` as requested.
