# Secrets Protection Plan

## Goal

Prevent new secrets from entering git, starting with local pre-commit enforcement.

This plan is intentionally practical, not aspirational. It reflects the current state of this frontend repo and is written so the same approach can be applied to the Python API with small, explicit differences.

## What Is True In This Repo Today

- The frontend already uses Husky.
- `.husky/pre-commit` currently runs only `yarn lint-staged`.
- CI already exists in `.github/workflows/main.yml`, but there is no secret-scanning job.
- `README.md` tells developers to use `.env.local` for local configuration.
- `.env` and `.env.test` are tracked in git, while only `*.local` env files are ignored.
- Some `REACT_APP_*` values are build-time browser configuration and must not be treated as confidential server secrets.

Because of that, the original draft was too broad in the wrong places and too confident about controls that are not actually implemented.

## Priority Order

1. Block secrets before commit.
2. Enforce the same rule in CI.
3. Clean up risky tracked files and false positives.
4. Add optional platform-level defenses.

Anything beyond that should be treated as a separate security workstream, not bundled into the first rollout.

## Recommended Shared Standard

Use Gitleaks as the primary secret scanner across both repositories.

Why this is the default choice:

- It works for JavaScript and Python repositories without language-specific detection logic.
- It has a maintained GitHub Action.
- It supports `.gitleaks.toml`, `.gitleaksignore`, baselines, redaction, and allowlisting.
- It integrates cleanly with the `pre-commit` framework, which is the easiest cross-repo way to keep hook behavior consistent.

Alternative for the Python API only:

- `detect-secrets` is a reasonable option if the API team prefers a baseline-centric workflow with interactive auditing.
- Even then, using Gitleaks in CI is still a strong default.
- Unless there is a clear reason to diverge, one scanner across both repos is simpler to operate.

## Phase 0: One-Time Bootstrap

Do this once before enabling blocking checks everywhere.

### Shared steps

1. Run a manual scan on the default branch, not during a contributor commit.
2. Use redacted reports so the scan output itself does not expose secret material.
3. Review findings and classify them into:
   - real secrets that must be rotated and removed
   - false positives that need a narrow allowlist
   - public identifiers that look secret-ish but are intentionally public
4. Create a minimal `.gitleaks.toml` that extends default rules instead of replacing them.
5. Add `.gitleaksignore` only for finding-specific exceptions that cannot be handled cleanly in config.

### Frontend-specific bootstrap

- Review tracked `.env` and `.env.test` immediately.
- If either file contains real credentials, stop and rotate them before enabling automated enforcement.
- Prefer `.env.example` or documented sample values for local setup.
- Keep `.env.test` tracked only if it contains dummy test-only values.
- Do not classify `REACT_APP_*` values as secrets unless they are truly confidential. Anything shipped to the browser should be assumed public.

### Python API bootstrap

- Review committed env files, settings modules, fixtures, and test data for real credentials.
- Server-side tokens, database passwords, signing keys, cloud credentials, webhook secrets, and DSNs should all be treated as confidential by default.
- If the API currently has historical leaks, create a baseline or allowlist only after rotation and cleanup decisions are made.

## Phase 1: Required Implementation, Pre-Commit Blocking

This is the most important part of the plan.

### Shared design

- Standardize on a repo-root `.pre-commit-config.yaml` with a pinned Gitleaks hook version.
- Pin versions explicitly and update them intentionally with `pre-commit autoupdate`.
- Keep exceptions narrow and reviewable.
- Allow hook skips only through the hook-specific `SKIP=` mechanism, not as the normal workflow.
- Document a manual full-repo command for maintainers.

Recommended shared files:

- `.pre-commit-config.yaml`
- `.gitleaks.toml`
- `.gitleaksignore`

### Frontend implementation

Preferred approach:

- Keep Husky as the entrypoint because this repo already depends on `.husky/*` and Git LFS hooks.
- Update `.husky/pre-commit` to run:
  1. `yarn lint-staged`
  2. `pre-commit run`
- Add developer setup instructions so contributors install `pre-commit` locally.
- Do not replace the existing Husky structure unless the team wants a broader hook migration.

Why this is the best fit here:

- Minimal disruption to the current workflow.
- No need to rework existing post-checkout, post-merge, or pre-push hook behavior.
- The secret scanner becomes language-agnostic without forcing the repo to become Python-managed.

### Python API implementation

Preferred approach:

- Use `pre-commit` as the primary hook manager directly.
- Install it from the API repo's Python development dependencies.
- Run Gitleaks in the normal `pre-commit` stage.
- If the API already uses `pre-commit`, add the hook there instead of creating a second mechanism.

Why this is the best fit there:

- Python repositories commonly already use `pre-commit` for formatting and linting.
- It avoids introducing a Node-based hook system into a Python repo.
- The same Gitleaks policy can still be shared across both repos.

## Phase 2: Recommended CI Enforcement

Once local blocking is in place, add CI so bypassed hooks or web edits still fail.

### Shared CI requirements

- Add a dedicated secret-scanning workflow.
- Fail the workflow on findings.
- Use redacted output.
- Run the same config as local hooks.
- Protect the default branch by requiring the secret-scan job.

### Scan scope recommendation

Do not start with a noisy “scan all history on every PR” rollout unless the repositories are already clean.

Start with:

1. One manual or scheduled full-history scan on the default branch.
2. Required PR and push scanning for current content and new changes.
3. Periodic scheduled full-history scans only if the signal remains manageable.

This reduces rollout pain while still preventing regressions.

### Frontend CI notes

- Add a new GitHub Actions workflow instead of overloading the existing `main.yml` test job.
- Keep secret scanning independent from lint, test, and Docker build results.
- The current frontend CI already injects repository secrets into Docker builds. That is normal, but it makes scanner coverage more important for workflow files and scripts.

### Python API CI notes

- Add the same dedicated workflow in the API repo.
- If the API already uses Python-based CI bootstrap, using `pre-commit run --all-files` in CI is acceptable.
- If not, use the official Gitleaks action directly for a lighter setup.

## Phase 3: Optional Defense In Depth

These items are useful, but they are not prerequisites for the first delivery.

### GitHub-level controls

- Enable GitHub secret scanning and push protection if the repository and plan level support them.
- Treat this as an extra barrier, not as the primary control.
- Verify supported secret types and org availability before relying on it.

### Developer ergonomics

- Add short documentation for false-positive handling.
- Prefer path-based or finding-based allowlists over globally disabling rules.
- Add a maintainer command for “scan everything now” and a smaller contributor command for local verification.

### Optional Python API enhancement

- If the API team wants stronger baseline review workflows, evaluate `detect-secrets audit` for triage, while keeping Gitleaks for CI and cross-repo consistency.

## What Should Be Explicitly Deferred

The following were in the original draft, but they should not be part of the first implementation in these repos:

- automated secret rotation scripts
- incident-response webhooks
- runtime secret-provider abstraction layers
- Prometheus or Grafana monitoring for leaked-secret usage
- broad “centralized secret manager integration” work inside the frontend repo

Reason:

- These are platform, operations, or service-ownership concerns.
- They are valuable, but they do not solve the immediate problem of secrets being committed.
- For the frontend, many runtime values are public client configuration anyway.
- For the Python API, rotation and secret storage matter, but they should be planned with deployment and infrastructure owners, not hidden inside a git-hook task.

## Concrete Deliverables

### Required in both repos

- pre-commit-based secret scan configuration
- Gitleaks config and narrow exception handling
- documentation for setup and false positives

### Required in this frontend repo

- Husky `pre-commit` updated to invoke the secret scan after `yarn lint-staged`
- review and cleanup decision for tracked `.env` and `.env.test`
- dedicated GitHub Actions secret-scan workflow

### Required in the Python API repo

- `pre-commit` hook setup or update
- matching Gitleaks configuration
- dedicated CI secret-scan workflow
- review of committed env and settings files for server-side credentials

## Final Recommendation

Implement this in two passes:

### Pass 1

- bootstrap scan
- `.gitleaks.toml`
- `.gitleaksignore` if needed
- pre-commit blocking in both repos

### Pass 2

- dedicated CI workflow in both repos
- branch protection on the new check
- optional GitHub push protection if available

If scope must be cut, do not cut pre-commit blocking. Cut everything after that first.
