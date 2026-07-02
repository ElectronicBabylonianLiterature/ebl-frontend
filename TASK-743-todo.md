# TASK-743 — RlA preview won't open in production

## TODO

- [x] Reproduce/understand the RlA preview flow (fetch index JSON + render page image)
- [x] Identify dev vs production difference
- [x] Locate CSP configuration
- [x] Determine root cause
- [x] Create branch `fix-rla-preview-csp` from `master`
- [x] Apply fix: add `https://publikationen.badw.de` to `img-src` in `public/serve.json`
- [x] `yarn lint` — clean
- [x] `yarn tsc` — clean
- [ ] `yarn test --watchAll=false` — N/A: change is JSON config, not covered by Jest (branch is off master, no realia code)
- [ ] Remove TASK-743-\*.md tracking files before merge
