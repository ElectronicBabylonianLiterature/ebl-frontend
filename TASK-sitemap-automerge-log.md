# TASK-sitemap-automerge — Work Log

## Summary

The weekly "Automated sitemap update" pull requests are blocked by master branch
protection because they are authored by the `khoidt` account. GitHub does not allow a
user to approve their own pull request, and admin bypass is disabled on the repository,
so the one person who could merge them is the one person who cannot. Auto-merge is armed
on both stuck PRs and is waiting for an approving review that will never arrive.

## Evidence

Collected 2026-08-04 against `ElectronicBabylonianLiterature/ebl-frontend`.

### The automation

`.github/workflows/update-sitemaps.yml` runs weekly (`cron: '0 1 * * 0'`). It regenerates
`public/sitemap/*`, commits with `git config user.name "Ilya Khait"` /
`ilya.khait@lmu.de`, then opens a PR with `peter-evans/create-pull-request@v5` using
`token: ${{ secrets.SITEMAP_AUTOUPDATE }}`, and finally arms auto-merge (squash) with
`peter-evans/enable-pull-request-automerge@v3` using the same token.

`secrets.SITEMAP_AUTOUPDATE` is a personal access token belonging to `khoidt`, so the
resulting pull request is authored by `khoidt`, not by a bot.

### Stuck pull requests

| PR   | Opened     | Head branch                      | Author   |
| ---- | ---------- | -------------------------------- | -------- |
| #775 | 2026-07-26 | `autoupdate-sitemap-30187853818` | `khoidt` |
| #778 | 2026-08-02 | `autoupdate-sitemap-30732345074` | `khoidt` |

Last successfully merged sitemap PR: **#772 on 2026-07-19** (`4db5c9cd`). Every weekly run
before that merged normally, so master protection was tightened between 2026-07-19 and
2026-07-26.

### The blocker is the review requirement, not CI

All required checks are green on both head commits (`31900c5b`, `980f3c01`):

- check runs: `test`, `CodeQL`, `Analyze (javascript)`, `GitGuardian scan`,
  `GitGuardian Security Checks` — all `success`; `docker` / `docker-test` correctly
  `skipped` (they are gated on `push` to master)
- combined commit status: `success` (`qlty check`, `qlty coverage`, `qlty coverage diff`)

GraphQL on both PRs returns:

```text
mergeStateStatus: BLOCKED
reviewDecision:   REVIEW_REQUIRED
viewerDidAuthor:  true
autoMergeRequest: enabled by khoidt, squash
```

REST `mergeable: true`, `mergeable_state: "blocked"` — no conflicts, protection is the
only obstacle.

### Why the reporter cannot merge either

`viewerPermission: ADMIN`, `viewerCanAdminister: true` — yet the merge is still blocked.
That means master protection has "Do not allow bypassing the above settings"
(admin enforcement) enabled, so the admin escape hatch is deliberately closed. Combined
with GitHub's prohibition on self-approval, `khoidt` has no path to merge their own PR.

Other repository admins who _can_ approve: `jlaasonen`, `fsimonjetz`, `ejimsan`,
`yCobanoglu`. Any of them approving unblocks the armed auto-merge immediately.

### Why the obvious fix does not work

Switching the workflow to `secrets.GITHUB_TOKEN` would make the PR author
`github-actions[bot]` and solve the authorship problem — but pull requests opened with the
default `GITHUB_TOKEN` deliberately do **not** trigger further workflow runs. `main.yml`,
CodeQL and the secret scan would never run, the required status checks would sit
permanently pending, and the PR would be _more_ stuck than it is now. This is almost
certainly why a PAT was used in the first place.

### Protection mechanism in use

`GET /repos/.../rulesets` returns `[]` — there are no repository rulesets. Master is
protected by **classic branch protection**. Reading the rule detail is not possible with
the token available here (`Resource not accessible by integration` on both
`/branches/master/protection` and `branchProtectionRules`), but the observed behaviour
pins it down: require a PR, require ≥1 approving review, require status checks, admin
enforcement on.

## Root cause

The automation's identity and the merge authority's identity are the same account. Branch
protection that requires an independent approving review is, by design, unsatisfiable when
the author is the only reviewer available — and admin enforcement removes the fallback.

## Options

### Option A — Give the automation its own bot identity (recommended baseline)

Create an organisation-owned GitHub App (e.g. "eBL Automation") with repository
permissions **Contents: read & write** and **Pull requests: read & write**, install it on
`ebl-frontend`, and store `EBL_AUTOMATION_APP_ID` + `EBL_AUTOMATION_PRIVATE_KEY` as repository secrets.
In the workflow, mint a short-lived installation token and use it in place of the PAT:

```yaml
- name: Mint bot token
  id: bot-token
  uses: actions/create-github-app-token@v3
  with:
    app-id: ${{ secrets.EBL_AUTOMATION_APP_ID }}
    private-key: ${{ secrets.EBL_AUTOMATION_PRIVATE_KEY }}
```

Also change the commit identity in the "Commit sitemap changes" step from
`Ilya Khait <ilya.khait@lmu.de>` to the bot, so the commits are not attributed to a person
either.

Effects:

- PR author becomes `ebl-automation[bot]`, so `khoidt` — and every other maintainer — can
  approve and merge it. This satisfies the "at least let me merge them myself" requirement.
- Installation tokens are **not** the default `GITHUB_TOKEN`, so `pull_request` workflows
  still fire and the required checks still run.
- Master branch protection is untouched.
- The PAT disappears from the repository, which is a security improvement: a repo-scoped
  PAT tied to a human admin is replaced by a scoped, short-lived, auto-expiring token.

Cost: one approving click per week, from anyone.

### Option B — Option A plus a bypass, for genuinely unattended merging

On top of Option A, migrate master's protection from classic branch protection to a
**repository ruleset** carrying the same rules, and add the GitHub App as a **bypass
actor**. Human pull requests keep needing review and green checks; the bot's PR merges
itself through the already-armed auto-merge.

This is the only route to full automation that keeps protection meaningful, because
classic branch protection's bypass list
(`bypass_pull_request_allowances`) only grants the right to _push directly_ to master — it
does not make an under-reviewed PR mergeable. Rulesets exempt bypass actors from the rule
as a whole. Since the repository has no rulesets today, the migration is a clean one.

Caveat worth verifying on the first run: the merge must be attributed to the bypassing app
for the exemption to apply. Arm auto-merge with the app token (as the workflow already
does with the PAT) and confirm on the next weekly run before relying on it.

### Option C — Second approver (zero infrastructure, immediate)

Add a `CODEOWNERS` entry for `public/sitemap/` naming another admin, or simply ask one of
`jlaasonen` / `fsimonjetz` / `ejimsan` / `yCobanoglu` to approve each weekly PR. Nothing to
build, but it keeps a human in the loop forever and will stall again whenever that person
is away.

### Option D — Stop versioning generated sitemaps (structural fix)

Generate the sitemaps during the Docker build in `main.yml` and ship them in the image
rather than committing them to `master`. The weekly PR, the bot identity and the bypass all
become unnecessary. This is the cleanest long-term answer but changes the deployment story
and needs its own design discussion.

## Recommendation

Adopt **Option A** now: it restores the reporter's ability to merge, removes a human PAT
from CI, and requires no change to master branch protection at all. Layer on **Option B**
afterwards if a weekly approving click is still considered too much friction. Keep
**Option D** on the roadmap as the real elimination of the problem class.

To clear the current backlog: have another admin approve **#778**, and close **#775** as
superseded — both branches rewrite the same nine `public/sitemap/*.xml.gz` files, so
merging one makes the other conflict, and #778 carries the fresher data.

## Pre-existing issues found

None of these affect correctness of the application, and no code was changed for them
pending user approval:

1. **65 stale `autoupdate-sitemap-*` branches on `origin`.** `deleteBranchOnMerge` is
   `false` on the repository, and the workflow's `delete-branch: true` only removes the
   branch when the _action_ closes the PR, not when GitHub merges it. Fix: enable
   "Automatically delete head branches" in repository settings and prune the existing
   branches.
2. **Outdated action pins.** `peter-evans/create-pull-request@v5` (latest v8.1.1). Worth
   bumping alongside the token change.
3. **No `permissions:` block in `update-sitemaps.yml`.** `main.yml` correctly declares
   `permissions: contents: read`; the sitemap workflow inherits the repository default and
   should be explicit.

## Change made

Option A is implemented in `.github/workflows/update-sitemaps.yml`:

- `actions/create-github-app-token@v3` mints a short-lived installation token; the
  `SITEMAP_AUTOUPDATE` PAT is gone from the workflow.
- A new "Resolve automation app identity" step derives the bot login and its
  `users.noreply.github.com` address from the app slug, so the sitemap commits are
  attributed to the bot rather than to `Ilya Khait <ilya.khait@lmu.de>`.
- The hand-rolled `git config` / `git add` / `git commit` / `git diff --cached` step was
  removed. `create-pull-request` performs the commit itself via `add-paths: public/sitemap`
  plus the `author` / `committer` inputs, which is the documented usage and preserves the
  previous behaviour of staging only `public/sitemap`. The action already no-ops when there
  is nothing to commit, so the `commit-needed` output it replaced is redundant — the
  auto-merge step's existing `pull-request-number != ''` guard still covers that case.
- `peter-evans/create-pull-request` bumped v5 -> v8 (v5 predates the Node 20 runner
  requirement). Every input used here — `token`, `add-paths`, `commit-message`, `committer`,
  `author`, `title`, `body`, `base`, `branch`, `delete-branch` — is stable across those
  versions.
- Added an explicit `permissions: contents: read` block, matching `main.yml`.

The workflow will fail until the two new secrets exist. Setup steps are in
`TASK-sitemap-automerge-setup.md`.

### Not done, and why

- **Creating the GitHub App, adding secrets, changing repository settings, creating
  rulesets** — the only credential available in the container is a scoped installation
  token. It cannot even _read_ branch protection (`Resource not accessible by integration`
  on `/branches/master/protection` and on `branchProtectionRules`), let alone administer
  the org. Written up for the user instead.
- **Approving #778** — the container token belongs to `khoidt`, the author of both stuck
  PRs. This is the exact self-approval prohibition that caused the bug.
- **Closing #775 and deleting the 65 stale branches** — destructive, outward-facing
  operations on objects created by someone else. Left for explicit confirmation.

## Gate status

- `yarn lint` — passes, no errors.
- `yarn tsc` — passes, no errors.
- `yarn test --watchAll=false` — passes, exit code 0:

  ```text
  Test Suites: 405 passed, 405 total
  Tests:       2 skipped, 3863 passed, 3865 total
  Snapshots:   50 passed, 50 total
  Time:        490.67 s
  ```

- Console-clean gate — met. Zero occurrences of `console.error`, `console.warn`,
  `console.log`, `Warning:`, `not wrapped in act`, `UnhandledPromiseRejection` or
  deprecation notices across the whole run.
- Workflow YAML validated with `js-yaml`: parses, `permissions` block present, all ten
  steps resolve in order.
- Markdownlint warnings raised by the IDE against the task documents created here (table
  column alignment, an unlabelled code fence, missing blank lines around a fence) were
  fixed.

### Pre-existing issue noted, not changed

The 2 skipped tests are `xit('Renders transliteration field')` and
`xit('Renders notes field')` in `src/fragmentarium/ui/edition/Edition.test.tsx:49-53`. They
predate this task and are unrelated to it. Re-enabling them is not a safe drive-by change —
they may have been disabled for a reason, and the project rule is that tests are never
enabled, skipped or removed without explicit confirmation. Flagged for a separate decision.

Only a CI workflow YAML file was changed; no file under `src/` was touched, so the suite is
a regression check on unchanged code rather than coverage of the change itself. The change
itself is only verifiable by running the workflow (step 5 of the setup document).
