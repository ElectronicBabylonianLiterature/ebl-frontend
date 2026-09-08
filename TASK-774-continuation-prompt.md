# TASK-774 — continuation prompt

Paste everything below the line into a fresh session. It is written to be self-contained: it
assumes no memory of the previous conversation.

Last updated: 2026-09-08 (phase 7). **All code-level findings are closed and committed on top of
`f11cca21`. Nothing is pushed. All gates are green under CI's exact flags.**

---

## Prompt

Read `.github/copilot-instructions.md` first and follow every gate in it. Never commit, branch or
push unless I explicitly ask in that message — a past "please commit" is spent permission and does
not carry forward. `khoidt` is my GitHub username, so it is me, not a third party; do not refer to
it in the third person.

This is PR #774 (`chore: remove bluebird, use AbortController for cancellation`,
ElectronicBabylonianLiterature/ebl-frontend). Remediation of its review findings is finished for
everything that can be done locally. `TASK-774-review.md` holds the review; its "Remediation
status" section says exactly what was fixed and what remains.

### State

- Branch `chore/remove-bluebird` in `/workspaces/ebl-frontend`, base
  `chore/ts7-tsconfig-migration` (`4f71cb2`), **not** `master`.
- `origin/chore/remove-bluebird` is at `f11cca21`. The local branch is **one commit ahead** and
  **not pushed**: the F8 fix, the phase-6 work closing F3, and the phase-7 work closing F9
  (13 new files, 1 deletion — `react-auth0-spa.security.test.tsx`, split — and ~19 modified).
- Written to GitHub so far: only the PR description, approved for that task alone. The API has
  otherwise been used read-only. **Ask before writing to GitHub.**

### CI status at `f11cca21`

CodeQL, `Analyze (javascript)`, three GitGuardian checks and `qlty check` all **green**. The
`test` job **failed** — and the uncommitted fix addresses it.

The failure was a pre-existing vacuous assertion carried verbatim from the base branch: the test
compared two un-awaited `Promise` objects, so it never asserted anything about the data. It only
surfaced in CI because CI passes `--detectOpenHandles`, which enables `async_hooks` and stamps
`Symbol(async_id_symbol)` onto every promise; jest's `toEqual` compares own symbol properties.

**Use `yarn test:diag` as the local test gate.** It is CI's exact flag set. The command used in
earlier phases (`CI=true yarn test --watchAll=false --coverage`) omits `--detectOpenHandles` and
cannot reproduce CI — five clean local runs missed F8 because of it.

### Gates, all re-verified

`yarn lint` clean · `yarn tsc` clean · full suite under CI's exact flags → **425 suites,
3 692 passed / 2 skipped, 50 snapshots, exit 0, zero console output** ·
`yarn build:ci-stable` exit 0 in 76 s · no changed `.ts`/`.tsx` over 250 lines ·
**coverage of added files: 71 measured, 0 below 100 %** · `coverageThreshold` passes.

**Every code-level finding (B1, B4, F1-F9, N1, N2) is closed.** What is left is not code.

### What is left, and none of it is mine to do alone

1. **B1 — get CI green on the new head.** Everything but the `test` job already passed on
   `f11cca21`, and the `test` fix is now committed. This needs a **push**. **Ask me first.**
2. **B2 — the `CHANGES_REQUESTED` from `Fabdulla1` still stands.** All four of its points are
   verified fixed; the evidence is in section B2 of the review. **Never request or re-request
   reviewers via the API — I manage reviewer assignment.**
3. **B3 — 13 `TASK-*.md` files must be deleted before merge**, 10 on this branch and 3 on #773.
   I chose to keep them for now; remind me, do not delete them yourself.
4. **The 3 qlty blocking issues** must be dismissed in the qlty dashboard (F6). All three are
   verified verbatim moves of base-branch code. That is an action in their web UI, not here.

### Next steps, in order

1. **Push the branch** so CI runs on the new head. Nothing else can progress until this happens.
   _Ask first — pushing is not pre-approved._
2. **Check the run.** `test`, `CodeQL`, `Analyze (javascript)`, GitGuardian ×3 and `qlty check`
   must all be green. The curl snippet for this is at the bottom of this document.
3. **Ask `khoidt` to request the re-review** from `Fabdulla1` (B2). The four points of the
   standing `CHANGES_REQUESTED` are answered in section B2 of the review — link them.
   _Never touch reviewer assignment via the API._
4. **Dismiss the 3 qlty blocking issues** in the qlty dashboard (F6). All three are verified
   verbatim moves of base-branch code, so no code change is warranted.
5. **Delete the 13 `TASK-*.md` files immediately before merge** (B3) — 10 on this branch, 3 on
   #773. Do not delete them earlier; they are the working record. Remind, do not act unilaterally.
6. **Merge #773 first**, or the base of this PR disappears.

### Three things not to redo

- **F4** — making `usePromiseEffect` supersede writes on unmount was tried; two existing tests
  deliberately pin the opposite contract, so it was reverted and both semantics documented in
  `README.md` instead. Do not re-attempt without asking.
- **The deleted test** — `does not set an error for a cancellation error` in
  `TransliterationForm.errors.test.tsx` was a false positive (probed against unmodified code: the
  error _does_ land, the assertion just ran a microtask early). Deleted with my approval. Do not
  reinstate.
- **`expectConsoleErrors`** — `setupTests.ts` no longer has `silenceConsoleErrors`. The
  replacement declares which `console.error` messages a test expects and **fails on any other**.
  Do not "simplify" it back into a blanket `jest.spyOn(console, 'error').mockImplementation()`;
  that reintroduces F9. The `console.warn` spies in the auth suites are already correct — they
  assert on the spy.
- **F3's closure** — all 70 added files are at 100 %. Do not "simplify" away the extracted
  `createOldLineNumbers` in `TextService.testSupport.ts`; it exists so the mapping is testable
  without touching the shared chapter fixture (adding the association there makes production call
  `bibliographyService.find` in suites that do not mock it, crashing the worker).
- **F8's `pendingResult` local** — the promise is captured before being awaited because
  `testing-library/no-await-sync-queries` matches the `queryBy*` prefix and mis-identifies the
  domain method `queryByTraditionalReferences` as a synchronous Testing Library query. Do not
  "simplify" it back into `await fragmentService.queryByTraditionalReferences(...)`; that
  reintroduces a lint error.

### Environment traps

- Plain `yarn build` is OOM-killed here (the VS Code server holds ~2.5 GB of 7.9 GB). Use
  `yarn build:ci-stable` — it is CI's exact build command.
- The same pressure kills a full coverage run if anything else heavy runs alongside it. **Run it
  alone.** Two runs were lost that way, and a third produced a spurious `FragmentView` failure.
- A targeted run with `--collectCoverageFrom` **overwrites** `coverage/coverage-final.json`, so
  re-run the full suite before analysing per-file coverage.
- `gh` is not installed. `GITHUB_TOKEN` is set, so use `curl` against `https://api.github.com`.
- Running `qlty` leaves untracked `.qlty/{logs,out,plugin_cachedir,results}`; `.gitignore` does
  not cover them. Delete them rather than committing. I have not taken up the offer to add the
  ignore rule.

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

### Checking CI

```bash
SHA=$(git rev-parse HEAD)
curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ElectronicBabylonianLiterature/ebl-frontend/commits/$SHA/check-runs?per_page=100"
```
