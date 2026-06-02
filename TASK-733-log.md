# TASK-733 Work Log — Audit PR #733 (devcontainer-fix)

## 2026-06-02

### Session Start

Task: Audit PR #733 "Auto-create `.env.local` and inject Codespaces secrets" on the `devcontainer-fix` branch.

### Data Gathering

- Fetched PR metadata via `mcp_io_github_git_pull_request_read` (get, get_diff, get_files)
- Fetched all reviews (get_reviews): Copilot bot × 1, khoidt × 3 reply reviews, qltysh bot × 1, Fabdulla1 × 5 reviews (4 COMMENTED + 1 CHANGES_REQUESTED)
- Fetched all review threads (get_review_comments): 8 threads total — 4 resolved, 4 unresolved
- Fetched CI status checks (github-pull-request_pullRequestStatusChecks): all passing
- Read `.devcontainer/init.sh`, `.devcontainer/devcontainer.json`, `scripts/register-codespaces-secrets.sh` from disk

### Analysis Complete

- Identified 4 unresolved reviewer threads from Fabdulla1 (CHANGES_REQUESTED blocker)
- Identified 3 additional independent findings (permissions security, grep pattern injection risk, register script over-upload)
- CHANGES_REQUESTED state is active; PR is blocked on Fabdulla1's review

### Deliverables Created

- TASK-733-todo.md ✓
- TASK-733-log.md ✓ (this file)
- TASK-733-review.md ✓
- Plain-language explanation of findings delivered to user ✓
- TASK-733-plan.md ✓ — detailed fix plan with code for all 6 findings

### Implementation (2026-06-02)

- Deleted `.devcontainer/init.sh`
- Created `.devcontainer/inject-secrets.sh` (bash, container-side; addresses F-01, F-02, F-04, F-05)
- Updated `.devcontainer/devcontainer.json`: array-form `initializeCommand` (F-03), extended `postCreateCommand` to call `inject-secrets.sh` (F-01)
- Updated `scripts/register-codespaces-secrets.sh`: filtered upload to `.env.test` keys only (F-06)
- Updated `.devcontainer/README.md`: reflects two-phase lifecycle
- Updated `README.md` step 6: corrects injection timing description
- `yarn lint` — passed ✅
- `yarn tsc` — passed ✅

### Bug found and fixed during manual verification (2026-06-02)

- Running `inject-secrets.sh` manually revealed: `chmod 600` failed (file owned by root from `initializeCommand` host run) → script aborted before injection
- Fixed `ensure_env_local_permissions` to warn instead of exit on chmod failure
- Re-running revealed a second bug: `grep -Fm1 "^${key}="` — the `-F` (fixed-string) flag makes `^` a literal character, not a line anchor → grep matched nothing → all keys were reported "missing" → all appended, duplicating the file
- Fixed both `inject-secrets.sh` and `register-codespaces-secrets.sh`: `grep -Fm1` → `grep -m1` (env var names are alphanumeric/underscore, so regex anchoring is safe without `-F`)
- Restored `.env.local` from `.env.test`; re-ran script — clean result: 9 keys/9 lines, 7 secrets injected, no duplicates
- `yarn lint` + `yarn tsc` re-run — both passed ✅

### Round 2 audit (2026-06-02)

- Ran `awk -v` backslash test: confirmed `abc\ndef` secret is split across two lines → A-01 (High)
- Ran trailing-newline append test: confirmed last key and new key fuse without separator → A-02 (Medium)
- Identified temp file leak risk on failure → A-03 (Low)
- Identified placeholder upload risk in register script → A-04 (Low)
- TASK-733-review.md updated with all round-2 findings and corrected round-1 statuses

### Round 2 planning (2026-06-02)

- TASK-733-plan.md updated: round-1 status table added; round-2 fix plans written for A-01 through A-04 with before/after code and implementation order

### Round 2 implementation (2026-06-02)

- `inject-secrets.sh`: A-01 — replaced `awk -v new=` with `ENVIRON["AWK_SECRET"]`; A-02 — replaced `echo` with `printf '\n%s\n'`; A-03 — added `_tmp_file` + `trap 'rm -f "$_tmp_file"' EXIT`
- `register-codespaces-secrets.sh`: A-04 — placeholder values are now skipped with a warning instead of uploaded
- `yarn lint` — passed ✅
- `yarn tsc` — passed ✅
- Manual tests: A-01 confirmed (backslash literal preserved), A-02 confirmed (separate lines), full script run: 9 keys/9 lines/7 injected/no duplicates ✅
- Awaiting user permission to commit
