# TASK-sitemap-automerge — TODO

Investigate why automated sitemap update PRs stopped merging after master branch
protection was introduced, and propose a solution that keeps master protection in place.

## Investigation

- [x] Locate the automation that produces the updates (`.github/workflows/update-sitemaps.yml`)
- [x] Identify which PRs are stuck and since when
- [x] Determine the identity that authors the automated PRs
- [x] Confirm whether CI / required status checks pass on the stuck PRs
- [x] Determine the exact merge blocker via the GitHub API (`mergeStateStatus`, `reviewDecision`)
- [x] Confirm the reporter's repository permission level and whether admin bypass is available
- [x] Check for repository / organisation rulesets vs classic branch protection
- [x] Check whether the stuck PRs conflict with each other

## Deliverable

- [x] Document root cause and options in `TASK-sitemap-automerge-log.md`
- [x] Recommend a solution that preserves master branch protection

## Implementation (done in this branch)

- [x] Implement Option A in `.github/workflows/update-sitemaps.yml`:
  - [x] Mint a short-lived installation token with `actions/create-github-app-token@v3`
  - [x] Resolve the bot login and no-reply email so commits are attributed to the app
  - [x] Replace the PAT with the app token in both the create-PR and auto-merge steps
  - [x] Drop the hand-rolled `git config` / `git commit` / `git diff --cached` step in
        favour of the action's own `add-paths` / `author` / `committer` inputs
- [x] Housekeeping: bump `peter-evans/create-pull-request` v5 -> v8
- [x] Housekeeping: add an explicit `permissions: contents: read` block
- [x] Validate the workflow YAML parses and the step graph is intact
- [x] Write `TASK-sitemap-automerge-setup.md` covering everything needing admin access

## Requires the user (no container access — see TASK-sitemap-automerge-setup.md)

- [ ] Create the `eBL Automation` GitHub App and install it on `ebl-frontend`
- [ ] Add `EBL_AUTOMATION_APP_ID` and `EBL_AUTOMATION_PRIVATE_KEY` repository secrets
- [ ] Verify with a manual `workflow_dispatch` run, then delete the `SITEMAP_AUTOUPDATE`
      secret and revoke the underlying PAT
- [ ] Optional Option B: migrate master to a ruleset with the app as a bypass actor
- [ ] Unblock the backlog: have another admin approve #778, close #775 as superseded
- [ ] Housekeeping: enable "Automatically delete head branches"; prune the 65 stale
      `autoupdate-sitemap-*` branches

## Gates

- [x] `yarn lint` — clean
- [x] `yarn tsc` — clean
- [x] `yarn test --watchAll=false` — 405 suites / 3863 tests passed, exit 0
- [x] Console-clean run — zero console output of any kind
- [ ] Remove this file, `TASK-sitemap-automerge-log.md` and
      `TASK-sitemap-automerge-setup.md` before the PR is merged.
