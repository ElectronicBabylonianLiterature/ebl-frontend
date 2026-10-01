# TASK-774-r12-visibility — Work log

## 2026-09-30

- Cause: TASK-\*.md is in .gitignore (line 36), so the review, TODO and log never appear as changes. .git/info/exclude cannot un-ignore them, because .gitignore takes precedence.
- Ran `git add --intent-to-add --force` on TASK-774-review.md, TASK-774-r12-{todo,log}.md and these two files: they now show as working-tree additions (" A"), with no content staged and nothing committed.
- Verified with git status --short: 5 files listed as " A". Undo with `git rm --cached <file>`.
