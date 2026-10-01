# TASK-774-gitignore — Work log

## 2026-09-30

- You asked for TASK-\*.md to stop being gitignored.
- Removed lines 34-36 of .gitignore (blank line, comment, `TASK-*.md`); the file still ends with a newline.
- Verified: `git check-ignore` exits 1 for TASK-774-review.md and TASK-774-log.md; git status now lists all TASK-\*.md (the 5 intent-to-add ones as " A", the rest as "??").
- Updated the review doc's two "gitignored" mentions and the task-docs-visibility memory (no longer relies on intent-to-add).
- Nothing committed.
