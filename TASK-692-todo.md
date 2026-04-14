# TASK-692 TODO

- [x] Identify all merge-conflicted files.
- [x] Analyze conflict intent and choose resolution per file.
- [x] Resolve conflicts preserving master semantics and PR style/structure.
- [x] Verify no conflict markers remain.
- [x] Run gates: yarn lint.
- [x] Run gates: yarn tsc.
- [x] Summarize resolutions and any residual risks.

## Regression Follow-up (Unexpected Break)

- [x] Reproduce `yarn test:fast` failure and capture error.
- [x] Inspect historical (deleted) TASK-683 docs from git history for prior mitigation.
- [x] Implement stable fast-test execution profile.
- [x] Fix deterministic failing tests exposed by stable profile.
- [x] Re-run `yarn test:fast` under stable profile and confirm pass.
- [x] Run gates: yarn lint.
- [x] Run gates: yarn tsc.

## Outstanding Issues (Beyond Scope)

- [ ] **Provenance initialization:** Refactor test setup to seed complete provenance data in `provenance.test.ts` instead of relying on partial/global state
- [ ] **Test flakes under concurrent load:** Some tests (e.g., `TextAnnotation`) use flaky async patterns that fail under parallel execution; consider `--runInBand` for full suite or restructure async waits
- [ ] **Process termination under worker parallelism:** `--maxWorkers=50%` still occasionally hits early-exit; may require environment/container resource changes beyond code

## Follow-up: index.tsx TypeScript diagnostics

- [x] Reproduce TypeScript diagnostics in `src/index.tsx` for side-effect style imports.
- [x] Add missing module declarations for style imports.
- [x] Re-validate with `yarn lint`.
- [x] Re-validate with `yarn tsc`.
