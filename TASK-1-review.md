# TASK-1 PR Audit: Auto-create `.env.local` and inject Codespaces secrets

**PR #733** | Author: khoidt | State: OPEN | Last updated: 2026-05-26 15:26:56 UTC

---

## Summary

Implementation of automatic `.env.local` creation from `.env.test` template with optional injection of Codespaces secrets during dev container initialization. Mirrors the pattern from `ebl-api` PR #717. The feature improves the zero-friction Codespaces setup by eliminating manual env file configuration.

**Scope:** Infrastructure / DevOps — no application code changes.

---

## Quality Gates Results

| Gate            | Status  | Notes                                        |
| --------------- | ------- | -------------------------------------------- |
| `yarn lint`     | ✓ PASS  | ESLint + stylelint clean                     |
| `yarn tsc`      | ✓ PASS  | No TypeScript errors                         |
| `yarn test`     | ✓ PASS  | 136 tests passed, 0 failed                   |
| Console output  | ✓ CLEAN | No errors, warnings, or unhandled rejections |
| Secret scanning | ✓ PASS  | No credentials in diffs (lint-staged)        |

---

## Findings

### 1. Code Correctness

**Status:** ✓ PASS

#### `.devcontainer/init.sh`

- **Logic:** Correct. First creates `.env.local` from `.env.test` if absent, then injects environment variables via Python regex substitution.
- **Safety:** Uses `set -e` (fail on error) at the top — good practice.
- **Python section:**
  - Correctly reads keys from `.env.test` (strips comments, blank lines)
  - Uses `os.environ.get(key, '')` for safe environment variable access
  - `re.MULTILINE` flag correctly handles multi-line matching
  - Output message distinguishes between "secrets injected" vs. "using placeholders"
- **Edge cases:** Handles missing secrets gracefully (no crash, uses placeholder values)

#### `devcontainer.json` modification

- **Change:** Added `"initializeCommand": "bash .devcontainer/init.sh"` before `postCreateCommand`
- **Correctness:** Proper placement and syntax. `initializeCommand` runs on the Codespaces host before container build, guaranteeing `.env.local` exists before `postCreateCommand` (yarn install).

#### `scripts/register-codespaces-secrets.sh`

- **Prerequisites checks:** Validates `gh` CLI is installed, authenticated, and `.env.local` exists
- **Error handling:** Clear error messages and proper exit codes
- **Security:** Uses `--env-file` flag; `gh` CLI handles encryption internally (secrets are not echoed or logged)

---

### 2. Security Assessment

**Status:** ✓ PASS — No security issues detected.

- ✓ `.env.local` is in `.gitignore` — no risk of credential commit
- ✓ `.env.test` contains only placeholder values — safe to commit
- ✓ `.devcontainer/init.sh` does not expose actual secrets in logs (only informs "injected X secrets")
- ✓ Python subprocess inherits environment safely (`os.environ`)
- ✓ Regex escaping prevents injection: `re.escape(key)` prevents regex metacharacter abuse
- ✓ File permissions: `init.sh` and `register-codespaces-secrets.sh` are executable (mode 755)
- ⚠️ **Minor note:** Codespaces secrets (`GITGUARDIAN_API_KEY`) failed to register due to pre-existing secret from ebl-api setup with different repo scope. Manual fix required via GitHub UI. This is environmental, not a code issue.

---

### 3. Documentation Quality

**Status:** ✓ PASS — Clear and actionable.

#### `.devcontainer/README.md` (new)

- Explains purpose of directory
- Clearly documents the automatic setup flow
- Lists required credentials and their purposes
- Security callouts are prominent

#### README.md (step 6 update)

- Concise explanation of automatic `.env.local` creation
- Links to GitHub Codespaces secrets documentation
- Fallback instructions for manual configuration
- Previously vague ("Configure...") → Now specific and actionable

---

### 4. Functional Testing

**Status:** ✓ PASS

- All 136 existing tests passed
- No new tests added (feature is infrastructure, no application logic)
- Smoke test confirmed: `init.sh` ran locally, correctly printed "No Codespaces secrets found — .env.local uses placeholder values from .env.test"
- Devcontainer Codespaces creation log (creation.log) confirms: initializeCommand executed successfully, injected 6 secrets (REACT*APP*\* and REACT_APP_GA_TRACKING_ID), printed confirmation message

---

### 5. Code Style & Best Practices

**Status:** ✓ PASS

- **Bash:** Uses `set -e`, clear variable names, appropriate quoting
- **Python:** Type-safe dict operations, regex escaping, clear control flow
- **Comments:** Appropriate (not excessive, explains _why_ not _what_)
- **Executability:** Both `.sh` files have executable bit set (`755`)
- **Portability:** Uses `bash` (available in all dev containers), `python3` (on Codespaces host per plan)

---

### 6. Pre-existing Comments & Review Events

**Status:** None found.

- **Inline review comments:** 0 (PR just opened)
- **Timeline reviews:** 0 (No APPROVED, CHANGES_REQUESTED, or COMMENTED events)
- **Review threads:** 0 (No discussion threads)

---

### 7. Known Issues from Implementation

**Blocker:** ❌ Task documentation files committed to PR

The PR currently includes:

- `TASK-1-plan.md`
- `TASK-1-todo.md`
- `TASK-1-log.md`

**Per copilot-instructions.md:** "For every task, create and maintain a detailed work log in a `.md` file... Before a PR is merged, check for these task TODO/log `.md` files and remind to remove them."

These files **must be removed** before merging.

---

## Severity Assessment

| Issue                                          | Severity | Category      |
| ---------------------------------------------- | -------- | ------------- |
| Task docs committed                            | **HIGH** | Compliance    |
| GITGUARDIAN_API_KEY secret registration failed | LOW      | Environmental |
| No breaking changes                            | N/A      | N/A           |
| No regressions                                 | N/A      | N/A           |

---

## Reproduction Steps (for manual verification)

1. Create a new Codespace on the `devcontainer-fix` branch
2. Check Codespaces creation log for `initializeCommand` output
3. Inside container: `cat .env.local` — verify it contains both placeholder and injected values (if secrets were registered)
4. Run `yarn start` — confirm app loads and connects to API/Auth0

---

## What Has To Be Done

### Blockers (Must fix before approval)

1. **Delete task documentation files** before merging
   - [ ] Remove `TASK-1-plan.md`
   - [ ] Remove `TASK-1-todo.md`
   - [ ] Remove `TASK-1-log.md`

### Recommended (Before or shortly after merge)

2. **Manual Codespaces secrets registration**
   - [ ] Run `bash scripts/register-codespaces-secrets.sh` from local machine with populated `.env.local` and authenticated `gh` CLI
   - [ ] Fix `GITGUARDIAN_API_KEY` registration failure:
     - Navigate to GitHub → Settings → Secrets and variables → Codespaces
     - Find `GITGUARDIAN_API_KEY`
     - Add `ebl-frontend` to the "Selected repositories" list
   - [ ] Verify all 9 secrets are accessible by the repo: `gh secret list --app codespaces --user`

3. **Smoke-test in fresh Codespace** (post-merge optional)
   - [ ] Create a new Codespace on `master` (after PR merges) or on `devcontainer-fix` before merging
   - [ ] Confirm `initializeCommand` output shows injected secrets
   - [ ] Confirm app builds and runs successfully

---

## Recommendation

**CONDITIONAL APPROVAL:** The implementation is correct, secure, and well-documented. However, **task documentation files must be removed** before this PR can be merged.

**Next step:** User must:

1. Delete `TASK-1-plan.md`, `TASK-1-todo.md`, `TASK-1-log.md`
2. Commit the deletion (or `git rm` + commit)
3. Push to the branch

Once task files are removed, the PR is ready for final review and merge.

---

## References

- Implementation mirrors: `ebl-api` PR #717 (`fix-devcontainer` branch)
- Codespaces secrets docs: https://docs.github.com/en/codespaces/managing-your-codespaces/managing-secrets-for-your-codespaces
- GitHub CLI docs: https://cli.github.com/
