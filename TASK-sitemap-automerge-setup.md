# Sitemap automation — setup steps for a repository / organisation admin

The workflow change is already committed to `.github/workflows/update-sitemaps.yml` in this
branch. It will **fail on its first run until steps 1–3 below are done**, because it now
expects two new secrets. Everything in this file needs GitHub UI or admin-token access that
is not available from inside the dev container, so it has to be done by you.

Background and evidence for _why_ this is needed: `TASK-sitemap-automerge-log.md`.

---

## Step 1 — Create the automation GitHub App

1. Go to <https://github.com/organizations/ElectronicBabylonianLiterature/settings/apps>
   and click **New GitHub App**. Creating it under the _organisation_ (not your personal
   account) matters — it keeps the automation alive if your account ever changes hands.
2. Fill in:
   - **GitHub App name**: `eBL Automation`
     (this becomes the bot login `ebl-automation[bot]`; if the name is taken, pick another
     and note the resulting slug — the workflow reads it automatically, so nothing to edit)
   - **Homepage URL**: `https://github.com/ElectronicBabylonianLiterature/ebl-frontend`
   - **Webhook**: untick **Active**. The app is only used to mint tokens.
3. Under **Repository permissions**, set exactly these two and leave everything else at
   _No access_:
   - **Contents**: Read and write
   - **Pull requests**: Read and write
4. Under **Where can this GitHub App be installed?** choose **Only on this account**.
5. Click **Create GitHub App**.

## Step 2 — Install it and capture the credentials

1. On the app's page, note the **App ID** shown near the top.
2. Scroll to **Private keys** → **Generate a private key**. A `.pem` file downloads. This
   is the only copy — GitHub will not show it again.
3. In the left sidebar choose **Install App** → install it on the
   `ElectronicBabylonianLiterature` organisation → **Only select repositories** →
   select `ebl-frontend`.

## Step 3 — Add the repository secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** on
`ebl-frontend` and add both:

| Secret name                  | Value                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `EBL_AUTOMATION_APP_ID`      | the numeric App ID from step 2.1                                                                                                      |
| `EBL_AUTOMATION_PRIVATE_KEY` | the **entire** contents of the `.pem` file, including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines |

Paste the private key exactly as-is, newlines included. A single missing line break is the
most common cause of a "failed to generate token" error on the first run.

## Step 4 — Retire the old PAT

Once step 5 confirms a green run, delete the now-unused `SITEMAP_AUTOUPDATE` repository
secret, and revoke the underlying personal access token at
<https://github.com/settings/tokens>. Leaving a long-lived admin PAT in the repository is
the security half of this problem.

## Step 5 — Verify

Actions → **Update Sitemap** → **Run workflow** (it has `workflow_dispatch`).

Expected result: a pull request titled _Automated sitemap update_ authored by
**`ebl-automation[bot]`**, not by you, with auto-merge armed. You can now click **Approve**
on it — which was impossible before, because you cannot approve your own pull request. Once
approved, the armed auto-merge squashes it in with no further action.

If the sitemaps happen to be unchanged, no PR is created and the run is still a success.

---

## Optional — fully unattended merging

Steps 1–5 leave one approving click per week. To remove that too, master's protection has
to gain a bypass for the app. **Classic branch protection cannot express this** — its
bypass list only grants the right to push directly to `master`, which would skip CI on
those commits entirely. Rulesets can, so this means migrating.

The repository currently has **no rulesets at all**, so the migration is clean:

1. **Settings → Rules → Rulesets → New branch ruleset.**
2. Name it `master protection`, set **Enforcement status: Active**, and under **Target
   branches** add **Include default branch**.
3. Recreate the rules that classic protection enforces today. Based on the observed
   behaviour of the blocked PRs, that is:
   - **Require a pull request before merging** → _Required approvals: 1_
   - **Require status checks to pass** → add the contexts currently required
     (`test`, `Analyze (javascript)`, `CodeQL`, `GitGuardian Security Checks`,
     `qlty check`, `qlty coverage`, `qlty coverage diff` — copy the exact list from the
     classic rule before you disable it)
   - **Block force pushes**
4. Under **Bypass list** → **Add bypass** → **Apps** → select **eBL Automation**, mode
   **Always**.
5. Only after the ruleset is Active and verified, disable the classic branch protection
   rule for `master` (Settings → Branches). Running both at once is safe but confusing —
   GitHub applies the union of them, so the strictest wins.

Human pull requests keep needing a review and green checks. The bot's PR merges itself.

**Verify this one on a real run rather than assuming it.** The bypass applies to the actor
performing the merge, and here that is the app arming auto-merge. It should work, but
confirm the next weekly run actually merges before you rely on it being unattended.

---

## Housekeeping (independent of the above)

1. **Stop the branch pile-up.** Settings → General → tick **Automatically delete head
   branches**. `delete-branch: true` in the workflow only fires when the _action_ closes a
   PR, not when GitHub merges it, which is why 65 `autoupdate-sitemap-*` branches are still
   on the remote.
2. **Prune the existing 65 branches.** After enabling the setting above, they can be
   deleted in bulk. I have deliberately not done this — it is a destructive remote
   operation on branches I did not create. Say the word and I will script it, or run:

   ```bash
   git ls-remote origin 'refs/heads/autoupdate-sitemap*' \
     | awk '{print $2}' | sed 's|refs/heads/||' \
     | xargs -n1 -I{} git push origin --delete {}
   ```

   Check the list before piping it to `xargs`.

## Clearing the current backlog

- **#778** (2026-08-02) — ask another admin (`jlaasonen`, `fsimonjetz`, `ejimsan`,
  `yCobanoglu`) to approve. Auto-merge is already armed and every check is green, so the
  approval alone merges it.
- **#775** (2026-07-26) — close as superseded. Both branches rewrite the same nine
  `public/sitemap/*.xml.gz` files, so merging one guarantees a binary conflict in the other,
  and #778 carries the fresher data.

I cannot do either myself: approving is blocked because the token available to me belongs
to `khoidt`, who authored both PRs, and closing someone's PR is not a call I should make
unprompted.

## Reminder

Delete `TASK-sitemap-automerge-todo.md`, `TASK-sitemap-automerge-log.md` and this file
before the pull request carrying the workflow change is merged.
