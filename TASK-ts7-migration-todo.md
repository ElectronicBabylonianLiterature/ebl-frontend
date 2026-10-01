# TASK-ts7-migration — TODO

Migrate off TS7-breaking deprecated compiler options. See
[TASK-ts7-migration-research.md](TASK-ts7-migration-research.md) for the analysis and
[TASK-ts7-migration-log.md](TASK-ts7-migration-log.md) for the work log.

Status: [x] done · [~] in progress · [ ] pending

## tsconfig transition

- [x] Remove `ignoreDeprecations`.
- [x] Remove `downlevelIteration`.
- [x] Remove `baseUrl`; add `paths: { "*": ["./src/*"] }`.
- [x] `moduleResolution: node` → `bundler`.
- [x] `target: es5` → `es2020`.

## build/test resolution compensation

- [x] `craco.config.js`: webpack `resolve.modules` includes `src`.
- [x] `craco.config.js`: jest `modulePaths` includes `src`.

## migration breakages

- [x] `setupTests.ts` dotenv `unknown` typing (`String(value)`).
- [x] Bluebird/async return-type corrections (23 files) — remove vestigial bluebird
      imports; async annotations become global `Promise<T>`; keep genuine Bluebird
      (cancellation) where required (`withData`, `usePromiseEffect` chain).
- [x] Cascade fixes: `DateSelection`/`Content` prop widening, `sitemap` `withData`
      bridge, de-async `updateDateInArray`, test mock `Bluebird.resolve` conversions.

## gates

- [x] `yarn tsc` — clean (exit 0).
- [x] `yarn lint` — clean (exit 0).
- [x] Focused tests for touched domains — 4 suites / 20 tests pass, console-clean.
- [x] `CI=true yarn test --watch=false` full suite (broad impact) — 340 suites,
      3469 passed / 2 skipped (pre-existing), 50 snapshots, exit 0, zero console noise.

## cleanup

- [ ] Remove `TASK-ts7-migration-*.md` before PR merge.
- [ ] PR description: before/after tsconfig + migration risk notes (see log).
