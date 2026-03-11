# TASK-678 TODO

## Scope

Fix proper noun menu visibility so Create a new proper noun is available for selected unannotated tokens when the user has permission, and document/validate the change.

## Checklist

- [x] Locate and confirm the visibility-gating root cause in `LemmaAnnotationButton`.
- [x] Implement visibility fix in active code path.
- [x] Add/update tests for unannotated-token proper noun menu visibility.
- [x] Verify permission-based visibility remains enforced.
- [x] Run focused lemma annotation regression tests.
- [x] Run `yarn lint`.
- [x] Run `yarn tsc`.
- [x] Confirm no failing tests in focused suite.
- [ ] Remove `TASK-678-todo.md` and `TASK-678-log.md` before merge.
