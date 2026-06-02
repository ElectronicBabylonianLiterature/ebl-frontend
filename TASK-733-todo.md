# TASK-733 TODO — Audit PR #733 (devcontainer-fix)

## Status: IN PROGRESS

## Checklist

### Audit phase

- [x] Fetch PR metadata (title, description, state)
- [x] Fetch all reviews (Copilot bot, qltysh bot, Fabdulla1)
- [x] Fetch all review threads (resolved + unresolved)
- [x] Fetch all timeline comments
- [x] Fetch CI / status-check results
- [x] Read all changed files on disk
- [x] Perform independent code analysis
- [x] Create TASK-733-todo.md
- [x] Create TASK-733-log.md
- [x] Create TASK-733-review.md with required sections
- [x] Present review findings to user (plain-language explanation)
- [x] Create TASK-733-plan.md with detailed fix plan

### Implementation phase

- [x] Delete `.devcontainer/init.sh`
- [x] Add `.devcontainer/inject-secrets.sh` (container-side, bash)
- [x] Update `.devcontainer/devcontainer.json` (array initializeCommand + postCreateCommand)
- [x] Update `scripts/register-codespaces-secrets.sh` (filter to .env.test keys only)
- [x] Update `.devcontainer/README.md`
- [x] Update `README.md` step 6
- [x] `yarn lint` — passed ✅
- [x] `yarn tsc` — passed ✅
- [x] Bug fix: `grep -Fm1` → `grep -m1` in inject-secrets.sh and register-codespaces-secrets.sh (`-F` broke `^` anchor, caused duplicate keys in .env.local)
- [x] Restored `.env.local` from `.env.test`; confirmed clean injection (9 keys, no duplicates)
- [x] `yarn lint` + `yarn tsc` re-run after bug fix — both passed ✅
- [ ] Verify testing checklist from plan (manual, requires Codespaces environment)

### Wrap-up

- [x] Round 2 audit performed
- [x] TASK-733-review.md updated with round-2 findings (A-01 through A-04)
- [x] TASK-733-plan.md updated with round-2 fix plans
- [x] Fix A-01 + A-02 + A-03 in `inject-secrets.sh` (awk ENVIRON, printf newline, mktemp trap)
- [x] Fix A-04 in `register-codespaces-secrets.sh` (skip placeholder values)
- [x] Run `yarn lint` and `yarn tsc` — both passed ✅
- [x] Manual test: run `inject-secrets.sh`, verified `.env.local` content (9 keys/9 lines, 7 secrets injected, no duplicates)
- [ ] Commit round-2 fixes (awaiting user permission)
- [ ] Push branch to origin
- [ ] Re-request review from Fabdulla1
- [ ] Remind to remove TASK-733-\*.md before merge
