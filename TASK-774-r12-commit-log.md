# TASK-774-r12-commit — Work log

## 2026-10-01

- You asked: summarize, update documentation and handoff, commit; skip checks already green unless relevant files changed.
- Since the last green code checks (final test:ci, Node 24 copy, CodeQL) only package.json/yarn.lock changed, and those exact files were validated in the identical Node 24 copy. This task only edits docs, so no code checks will be run.
- README: cancellation section now names useFragmentSaves, says failed saves are still reported, and says card/keyboard deletes lock during writes and generation.
- Handoff rewritten: state, next steps, open items table, round-12 status; reused the #779 recipe, "things worth knowing" (updated for useFragmentSaves and named useState) and traps (+4 new).
- Review doc: committed state, new_md_files note (TASK docs committed per the same-commit rule, removed before merge), next steps.
- Checks: none run (only docs changed in this task; package.json/yarn.lock validated earlier in the identical Node 24 copy; all code checks green since the last code change).
- Commit: running with the Node 24 binary first on PATH so the husky hook (yarn lint-staged, ggshield) runs under engines ^24; no hook bypass.
- Committed (see git log); nothing pushed.
