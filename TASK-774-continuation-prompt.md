# TASK-774 — continuation prompt

Paste everything below the line into a fresh session. It is written to be self-contained: it assumes no memory of the previous conversation.

Last updated: 2026-09-08. **The working tree is green and all locally-actionable work is done.**

---

## Prompt

Read `.github/copilot-instructions.md` first and follow every gate in it. Never commit, branch or push unless I explicitly ask in that message — a past "please commit" is spent permission and does not carry forward. `khoidt` is my GitHub username, so it is me, not a third party; do not refer to it in the third person.

Remediation of the review findings on PR #774 (`chore: remove bluebird, use AbortController for cancellation`, ElectronicBabylonianLiterature/ebl-frontend) is finished for everything that could be done locally. The work is **uncommitted** in the working tree on top of `7afb78ed`. `TASK-774-review.md` holds the review and, under "Remediation status", exactly what was fixed and what remains.

### State

- Branch `chore/remove-bluebird` in `/workspaces/ebl-frontend`, head `7afb78ed`, base `chore/ts7-tsconfig-migration` (`4f71cb2`), **not** `master`.
- Nothing committed or pushed. The only thing written to GitHub was the PR description, which I approved for that task alone — **ask me again before writing to GitHub.**
- Gates, all verified after the last change: `yarn tsc` clean · `yarn lint` clean · `CI=true yarn test --watchAll=false --coverage` → 414 suites, 3 661 passed / 2 skipped, 50 snapshots, **zero console output** · `yarn build:ci-stable` exit 0 in ~93 s with zero warnings · no changed `.ts`/`.tsx` over 250 lines.

### What is left, and none of it is mine to do alone

1. **B1 — CI and CodeQL still have not run.** Both workflows now trigger on `pull_request` to `chore/**`, `feature/**` and `fix/**`, but that only takes effect on the next push or when #773 lands and GitHub retargets this PR. Ask me before pushing.
2. **B2 — the `CHANGES_REQUESTED` from `Fabdulla1` still stands.** All four of its points are verified fixed; the evidence is in section B2 of the review. **Never request or re-request reviewers via the API — I manage reviewer assignment.**
3. **B3 — 13 `TASK-*.md` files must be deleted before merge**, 10 on this branch and 3 on #773. I chose to keep them for now; remind me, do not delete them yourself.
4. **F3 residue — 15 newly-added files are still short of 100 % coverage** (down from 30). They are listed in the review under "What remains on F3". Six are `*.testSupport.*` helper options no suite exercises; the rest are UI fallback branches and defensive DTO mappings. The one with real substance is `SpanAnnotationDisplay.tsx`'s "selection started on a different token" retry, which needs a simulated cross-token DOM selection — brittle in jsdom, which is why I left it.
5. Optional: add `coverageThreshold` to the Jest config so the 100 %-on-affected-code gate is enforced mechanically instead of audited by hand each review.

### Two things not to redo

- **F4** — I tried making `usePromiseEffect` supersede writes on unmount; two existing tests deliberately pin the opposite contract, so I reverted and documented both semantics in `README.md` instead. Do not re-attempt without asking.
- **The deleted test** — `does not set an error for a cancellation error` in `TransliterationForm.errors.test.tsx` was a false positive (probed against unmodified code: the error _does_ land, the assertion just ran a microtask early). Deleted with my approval. Do not reinstate.

### Environment traps

- Plain `yarn build` is OOM-killed here (the VS Code server holds ~2.5 GB of 7.9 GB). Use `yarn build:ci-stable` — it is CI's exact command.
- The same pressure kills a full `yarn test --coverage` run if anything else heavy runs alongside it. **Run it alone.** Two runs were lost that way, and a third produced a spurious `FragmentView` failure.
- A targeted run with `--collectCoverageFrom` **overwrites** `coverage/coverage-final.json`, so re-run the full suite before analysing per-file coverage.
- Running `qlty` leaves untracked `.qlty/{logs,out,plugin_cachedir,results}`; `.gitignore` does not cover them. Delete them rather than committing. I have not taken up the offer to add the ignore rule.

### Measuring coverage of the changed surface

```bash
{ git diff --name-status 4f71cb2...HEAD | awk '$1=="A"{print $2}'
  git status --short | awk '$1=="??"{print $2}'; } | sort -u > /tmp/added.txt
node -e '
const c=require("./coverage/coverage-final.json"), fs=require("fs");
const set=new Set(fs.readFileSync("/tmp/added.txt","utf8").split("\n").filter(Boolean));
const pct=o=>{const v=Object.values(o);return v.length?v.filter(x=>x>0).length/v.length*100:100};
for(const [k,f] of Object.entries(c)){ const rel=k.replace(process.cwd()+"/","");
  if(!set.has(rel)) continue;
  const b=Object.values(f.b).flat(); const br=b.length?b.filter(x=>x>0).length/b.length*100:100;
  if(pct(f.s)<100||pct(f.f)<100||br<100)
    console.log(rel, pct(f.s).toFixed(1), br.toFixed(1), pct(f.f).toFixed(1)); }'
```
