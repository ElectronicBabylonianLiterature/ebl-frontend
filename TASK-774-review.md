---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
title: 'chore: remove bluebird, use AbortController for cancellation'
reviewed_head_sha: 0e6799431f1700409be90d8d42234c6809dbb57b
remediation_state: uncommitted working tree (not committed — awaiting your go-ahead)
base_branch: chore/ts7-tsconfig-migration
base_sha: 4f71cb249bc0db899f1a22ce42ac93ebd961eeda
stacked_on: '#773 (chore/ts7-tsconfig-migration) — retargets to master when #773 merges'
review_date: 2026-09-09
reviewer: Claude (automated review)
review_round: 3
remediation_date: 2026-09-09
verdict: ALL FINDINGS ADDRESSED — awaiting re-review to clear the standing CHANGES_REQUESTED
findings_total: 6
findings_fixed: 5
findings_withdrawn: 1
findings_open: 0
correction: 'F5 withdrawn after verification — the two xit tests predate both #774 and #773 and master has already fixed them independently; the merge preserves master fix'
scope_vs_base: 471 files changed, +21362 / -15450, 14 commits
scope_vs_master: 718 files changed, +27069 / -34167
gates:
  lint: PASS
  tsc: PASS
  tests: PASS (426 suites, 3695 passed, 2 skipped, 50 snapshots, 3697 total)
  console_clean: PASS (zero console output across all 426 suites)
  line_ceiling_250: PASS (no touched .ts/.tsx file over 250 lines)
  dry: PASS after remediation (all 6 duplication blocks cleared; was FAIL at review time)
  coverage_core_files: PASS (100% statements/branches/functions/lines on all 9 cancellation-primitive files)
ci_checks_on_head: test PASS, CodeQL PASS, Analyze (javascript) PASS, GitGuardian PASS x3, docker/docker-test SKIPPED (expected)
qlty_check: 6 blocking issues at review time; all 6 cleared locally after remediation (qlty smells --all)
qlty_coverage: 94.3% (+1.2% change)
qlty_coverage_diff: 98.8% (75% threshold)
codeql_alerts: none surfaced; CodeQL and Analyze (javascript) both green on head
devcontainer_changed: false
new_md_files_tracked: 0 after remediation (was 3: TASK-ts7-migration-*.md — now untracked)
gitignore_task_docs_rule: reverted at your request — .gitignore matches the base branch exactly
existing_reviews: 3 (qltysh[bot] COMMENTED x2, Fabdulla1 CHANGES_REQUESTED 2026-08-04)
existing_comments: 6 inline (all qltysh[bot]), 0 issue comments
unresolved_threads: 0 (all 6 resolved and outdated)
standing_blocker: Fabdulla1 CHANGES_REQUESTED is still the active review state
sourcery_ai: not present on this PR
---

# PR #774 Review — remove bluebird, use AbortController for cancellation

## Review Summary

Really nice piece of work. Bluebird is genuinely gone — zero references left in `src` — and the replacement is the right shape rather than a like-for-like swap: reads get a real `AbortSignal`, writes get a staleness token, and the two are kept apart on purpose.

I went after the write-abort hazard from the last round specifically, and it is properly fixed. `runWrite` now hands out an `isStale()` predicate from `SupersedableOperation` instead of a signal, and the new integration test drives a real `ApiClient` over mocked `fetch` to prove all three things that were asked for: no signal on a dispatched write, a second save doesn't abort the first, and a superseded write can't overwrite current UI state. The 250-line list from that review is cleared too.

Two things I want to highlight because they were verified rather than taken on trust: all 59 Sass entrypoints compile to **byte-identical CSS** against the base branch, so the `@import` → `@use` migration really is behaviour-preserving; and the whole 426-suite run is completely console-clean. Swapping the blanket `silenceConsoleErrors()` for an asserting `expectConsoleErrors(pattern)` is a genuine upgrade — it now fails on unexpected console errors instead of hiding them.

Two things blocked the merge and both are now fixed. The README promised that writes can't be cancelled because "the guarantee is enforced by the type system", but the `JsonApiClient` type still declared a `signal` parameter on `postJson` that got silently dropped — the compiler looked like it was protecting you when it wasn't. And three `TASK-ts7-migration-*.md` files were still tracked and would have ridden into master.

Everything raised has been addressed in the working tree. `JsonApiClient` now lives in its own module, `src/http/JsonApiClient.ts`, with no `signal` on `postJson` — that also removes the duplicate copy in `appDriverHelpers.tsx` and stops two production repositories importing a type from the app entrypoint. The three task docs are untracked, and the `.gitignore` rule that was hiding this class of file is reverted, so scratch docs are visible in `git status` again rather than silently ignored.

One finding I have to withdraw, and it's worth explaining because my first pass got it wrong. I reported the two `xit`-disabled tests in `Edition.test.tsx` as inherited from #773. They aren't — they exist at the merge-base of this branch and master, so they predate both PRs. Master fixed them independently in #767 by adding `editor/Editor.testSupport.tsx`, and a merge preview confirms master's re-enabled tests survive the merge intact. There was nothing to fix here.

No dev container changes in this PR — I checked explicitly, `.devcontainer/` is untouched against both the base branch and master.

### Details

| #   | Finding                                                                                                                                                               | Severity | Blocking | Status                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| F1  | `JsonApiClient.postJson` declared a `signal?: AbortSignal` that `ApiClient.postJson` silently dropped, contradicting the README's "enforced by the type system" claim | Medium   | Yes      | **Fixed** — type moved to `src/http/JsonApiClient.ts`, `signal` removed from `postJson`     |
| F2  | Three `TASK-ts7-migration-*.md` files were tracked and would land on master                                                                                           | Medium   | Yes      | **Fixed** — untracked via `git rm --cached`; `.md` delta vs master is now `README.md` only  |
| F3  | qlty's 6 blocking issues were all duplication inside test files this PR adds — DRY hard gate                                                                          | Low      | No       | **Fixed** — all 6 cleared; `qlty smells --all` no longer flags any of the three files       |
| F4  | `coverageThreshold` hardcoded in `craco.config.js` with ~0.1pp headroom, global-only                                                                                  | Low      | No       | **Fixed** — widened to 93 / 85 / 93 / 93                                                    |
| F5  | Two `xit`-disabled tests in `Edition.test.tsx`                                                                                                                        | Low      | No       | **Withdrawn** — predate both PRs; master already fixed them and the merge preserves that    |
| F6  | Duplicate `JsonApiClient` type in `index.tsx` and `appDriverHelpers.tsx` had diverged                                                                                 | Low      | No       | **Fixed** — single declaration in `src/http/JsonApiClient.ts`, all four consumers import it |
| —   | Standing `CHANGES_REQUESTED` from 2026-08-04 is still the active review state                                                                                         | —        | **Yes**  | **Needs re-review**                                                                         |
| —   | `.gitignore` rule ignoring `TASK-*.md`                                                                                                                                | —        | No       | **Reverted at your request** — `.gitignore` now matches the base branch exactly             |

## Findings

### F1 — `JsonApiClient.postJson` advertises an `AbortSignal` the implementation drops

**Severity:** Medium · **Blocking:** Yes

This PR added `signal?: AbortSignal` to all three methods of the `JsonApiClient` type in [src/index.tsx:26-43](src/index.tsx#L26-L43), including `postJson`:

```ts
postJson: <T = unknown>(
  url: string,
  body: Record<string, unknown>,
  authorize?: boolean,
  signal?: AbortSignal,
) => Promise<T>
```

But the real implementation at [src/http/ApiClient.ts:204-212](src/http/ApiClient.ts#L204-L212) takes three parameters and never forwards a signal:

```ts
postJson<T = unknown>(path: string, body: unknown, authenticate = true): Promise<T> {
  return this.fetch(path, authenticate, createOptions(body, 'POST')).then(deserializeJson) as Promise<T>
}
```

This directly contradicts the README paragraph this PR adds, which states: _"**`ApiClient.postJson` and `ApiClient.putJson` do not accept a `signal` at all**, so a signal cannot reach a write's `fetch` — the guarantee is enforced by the type system rather than by convention."_ For any code typed against `JsonApiClient` — [ApiFragmentQueryRepository](src/fragmentarium/infrastructure/ApiFragmentQueryRepository.ts#L33) and [FindspotRepository](src/fragmentarium/infrastructure/FindspotRepository.ts#L13) — the type system enforces nothing of the sort.

There is no live defect today: no call site passes a fourth argument to `postJson`. This is a latent trap that silently re-opens the concern raised in the 2026-08-04 review, and the misleading part is that the compiler will look like it is protecting you when it is not.

**Reproduction steps**

1. Create `src/__sigcheck.ts`:
   ```ts
   import ApiClient from 'http/ApiClient'
   import { JsonApiClient } from 'index'
   export function hole(client: JsonApiClient, real: ApiClient): void {
     const c: JsonApiClient = real
     void c
     client.postJson('/x', {}, true, new AbortController().signal)
   }
   ```
2. Run `yarn tsc`.
3. **Observed:** compiles clean. `ApiClient` (3-param `postJson`) stays assignable to `JsonApiClient` (4-param) because TypeScript allows a function with fewer parameters, and the signal argument is accepted and discarded.
4. **Expected:** a compile error, per the README's stated guarantee.

**Recommendation:** delete `signal?: AbortSignal` from `postJson` in the `JsonApiClient` type. Keep it on `fetchJson` and `fetchBlob`, which do honour it. That makes the README's claim true.

**Resolution — Fixed.** Rather than patch the declaration in place, the type was moved out of the app entrypoint into its own module, [src/http/JsonApiClient.ts](src/http/JsonApiClient.ts), with `postJson` reduced to its three real parameters. `src/index.tsx` no longer declares it at all — it never used it — and the three consumers (`FindspotRepository`, `ApiFragmentQueryRepository`, `appDriverHelpers`) import from `http/JsonApiClient`. This resolves F1 and F6 together and removes a third, quieter problem: two production repositories were importing a type from `index.tsx`, a module whose top level calls `createRoot`, `root.render` and `serviceWorker.unregister()`. That only stayed safe because Babel happens to elide type-only specifiers. Re-running the `__sigcheck.ts` probe from the reproduction steps now fails to compile, which is the intended behaviour; the probe file was deleted afterwards.

### F2 — Three `TASK-ts7-migration-*.md` files are still tracked and will land on master

**Severity:** Medium · **Blocking:** Yes

This PR adds a `TASK-*.md` rule to `.gitignore`:

```
# Task tracking scratch files (never committed)
TASK-*.md
```

That correctly covers the five `TASK-774-*.md` scratch files — all confirmed untracked and ignored. But `.gitignore` has no effect on files Git is already tracking, and three are:

```
$ git ls-tree -r --name-only HEAD | grep -E '^TASK-.*\.md$'
TASK-ts7-migration-log.md
TASK-ts7-migration-research.md
TASK-ts7-migration-todo.md

$ git diff --name-status origin/master HEAD -- '*.md'
M       README.md
A       TASK-ts7-migration-log.md
A       TASK-ts7-migration-research.md
A       TASK-ts7-migration-todo.md
```

So relative to master this stack adds three task-tracking documents. They arrive from the base branch (#773), not from this PR's own commits, but this PR is where the ignore rule lands, and the rule reads as if the problem is handled when it isn't.

**Reproduction steps**

1. `git diff --name-status origin/master HEAD -- '*.md'`
2. **Observed:** three `A` entries for `TASK-ts7-migration-*.md`.
3. **Expected:** only `M README.md`.

**Recommendation:** `git rm --cached TASK-ts7-migration-log.md TASK-ts7-migration-research.md TASK-ts7-migration-todo.md`. Cleanest on #773 since that is where they were committed; doing it here also works and is verifiable with the same command.

**Resolution — Fixed.** All three untracked with `git rm --cached`; the files remain on disk as scratch documents. `git diff --cached --name-status origin/master -- '*.md'` now reports `M README.md` and nothing else.

Separately, and at your request, the `TASK-*.md` rule this PR added to `.gitignore` has been **reverted** — `git diff origin/chore/ts7-tsconfig-migration -- .gitignore` is empty, so `.gitignore` matches the base branch exactly. The trade-off is deliberate: task scratch files now show up as untracked in `git status` instead of being silently ignored, which is what makes a slip like F2 visible in the first place. It does mean the `TASK-774-*.md` files must be deleted manually before merge rather than being ignored.

### F3 — qlty's 6 blocking issues are duplication inside test files this PR adds

**Severity:** Low · **Blocking:** No (status reports green) · DRY hard gate

`qlty check` reports **success — 6 blocking issues** on the head commit. I reproduced them locally with `qlty smells --all` and cross-referenced against the changed-file list. All six sit in files this PR **adds**:

| File                                                                                           | Duplication                        | Mass |
| ---------------------------------------------------------------------------------------------- | ---------------------------------- | ---- |
| `src/http/ApiClient.securityErrors.test.ts`                                                    | 23 lines, 2 locations (in-file)    | 107  |
| `src/http/ApiClient.securityErrors.test.ts`                                                    | 23 lines, 2 locations (in-file)    | 107  |
| `src/auth/react-auth0-spa.sessionFallback.test.tsx`                                            | 18 lines, 2 locations (in-file)    | 107  |
| `src/auth/react-auth0-spa.sessionFallback.test.tsx`                                            | 18 lines, 2 locations (in-file)    | 107  |
| `src/auth/react-auth0-spa.sessionFallback.test.tsx` ↔ `react-auth0-spa.tokenSecurity.test.tsx` | 24 lines, 2 locations (cross-file) | 128  |
| `react-auth0-spa.tokenSecurity.test.tsx` ↔ `sessionFallback.test.tsx`                          | 24 lines, 2 locations (cross-file) | 128  |

Six blocks, exactly matching the status count. The clearest example is [ApiClient.securityErrors.test.ts:13-59](src/http/ApiClient.securityErrors.test.ts#L13-L59), where the 401 and 403 tests are structurally identical and differ only in status code, status text, body and path — a textbook `it.each` case:

```ts
it('should report 401 errors as auth errors', async () => {
  const authService = createMockAuthService(true)
  const apiClient = new ApiClient(authService, mockErrorReporter)
  global.fetch = jest.fn().mockResolvedValue(
    createJsonResponse({ ok: false, status: 401, statusText: 'Unauthorized', body: { error: 'Unauthorized' } }),
  )
  ...
```

This is a side effect of the 250-line splits: extracting suites into sibling files moved shared setup out of reach without a shared helper. The project treats DRY as a hard gate, so it is worth closing even though the check reports green.

**Reproduction steps**

1. `qlty smells --all`
2. Cross-reference the reported files with `git diff --name-status origin/chore/ts7-tsconfig-migration HEAD -- src`.
3. **Observed:** six duplication blocks, all in files marked `A`.

**Recommendation:** collapse the 401/403 pair into `it.each`, and lift the shared `createMockAuth0Client` + `renderWithAuth0Provider` + `console.warn` assertion scaffold into the existing `src/auth/react-auth0-spa.testSupport.tsx` that this PR already introduces.

**Resolution — Fixed, all 6 cleared.** The 401/403 pair in `ApiClient.securityErrors.test.ts` is now a single `it.each` over `[status, statusText, endpoint]` (179 → 161 lines). For the Auth0 suites, four helpers were added to `react-auth0-spa.testSupport.tsx` — `resetAuth0Mocks`, `provideAuth0Client`, `renderAndWaitForLabel`, `expectTokenValidatedOnRender` and `expectGuestFallbackOnSessionFailure` — and both suites now express intent rather than scaffolding: `sessionFallback` went 128 → 57 lines, `tokenSecurity` 94 → 50. The two "Login required" / "Consent required" cases collapsed into an `it.each` as well.

Verified with `qlty smells --all`: none of the three files is flagged any more, and no new smell was introduced in the helper module. Test behaviour is unchanged — all 9 suites in `src/(auth/react-auth0-spa|http/ApiClient)` pass, 127 tests. One assertion was tightened rather than preserved verbatim: the `checkSession` failure test previously asserted `expect.stringContaining('Session check failed')` with `expect.any(Error)`; the shared helper asserts the exact message against the exact error instance, which is strictly stronger.

### F4 — `coverageThreshold` hardcoded in `craco.config.js` with ~0.1pp headroom

**Severity:** Low · **Blocking:** No

This PR adds to [craco.config.js:13-20](craco.config.js#L13-L20):

```js
jestConfig.coverageThreshold = {
  global: { statements: 94.1, branches: 86, functions: 93.8, lines: 94.2 },
}
```

Two observations:

1. **The margin is razor-thin.** Measured coverage sits at roughly 94.2 / 86.1 / 93.9 / 94.3, so every metric has around 0.1pp of headroom. A handful of uncovered lines anywhere in the repo turns CI red for reasons unrelated to the change that triggered it. This PR already ate one red CI from coverage non-determinism (fixed properly by seeding all `Chance` instances — I verified zero unseeded `new Chance()` remain).
2. **It is global-only**, so it does not express the project's actual standard of 100% coverage on affected code. A regression concentrated entirely in the changed files passes as long as the global number holds. `qlty coverage diff` at 98.8% is the check that speaks to affected code, and it is below 100%.

**Recommendation:** widen the margin to something like 93 / 85 / 93 / 93 so the gate catches real regressions rather than rounding, and let `qlty coverage diff` carry the affected-code standard. Optionally add per-path thresholds for `src/common/utils/**` and `src/http/**`, which are at 100% today.

**Resolution — Fixed, and strengthened per your instruction to enforce 100%.** Two changes:

1. The global floor was widened to `statements: 93, branches: 85, functions: 93, lines: 93` — roughly 1.2pp of headroom instead of 0.1pp, so rounding cannot redden CI while a genuine regression still fails.
2. **Per-path thresholds of 100/100/100/100** were added for the ten files this PR owns, which is what makes the project's "100% coverage on affected code" rule an actual enforced gate rather than an aspiration:

```js
const fullCoverage = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
}
jestConfig.coverageThreshold = {
  global: { statements: 93, branches: 85, functions: 93, lines: 93 },
  'src/common/hooks/usePromiseEffect.ts': fullCoverage,
  'src/common/utils/AbortableOperation.ts': fullCoverage,
  'src/common/utils/ConcurrencyLimiter.ts': fullCoverage,
  'src/common/utils/SupersedableOperation.ts': fullCoverage,
  'src/common/utils/abortError.ts': fullCoverage,
  'src/common/utils/applyWhenCurrent.ts': fullCoverage,
  'src/common/utils/getOrFetchCachedValue.ts': fullCoverage,
  'src/common/utils/mapSeries.ts': fullCoverage,
  'src/http/ApiClient.ts': fullCoverage,
  'src/http/withData.tsx': fullCoverage,
}
```

**Why not a global 100.** `coverageThreshold.global` measures the entire repository, not the changed code. Measured across a merged seven-shard coverage run, the repo currently sits at **94.22% statements / 86.08% branches / 93.93% functions / 94.34% lines**, and **262 of 696 instrumented files are below 100% on at least one metric**. Setting the global gate to 100 would therefore fail `yarn test --coverage` and CI's coverage step immediately, for hundreds of files this PR never touches. The per-path form gives the same guarantee where it is meaningful — this PR's code cannot regress below 100% without failing CI — while leaving the repo-wide number to `qlty coverage`, which already tracks it and reports the trend (+1.2% on this PR).

All ten per-path gates were verified against the merged coverage data: every one is at 100% on all four metrics.

### F5 — Two `xit`-disabled tests in `Edition.test.tsx` (inherited from #773)

**Severity:** Low · **Blocking:** No · **WITHDRAWN — this finding was wrong**

[src/fragmentarium/ui/edition/Edition.test.tsx:48-54](src/fragmentarium/ui/edition/Edition.test.tsx#L48-L54) has two disabled tests whose bodies have also been gutted — `setup()` and the `await screen.findByText(...)` are gone, the labels changed from `'transliteration'`/`'notes'` to `'Transliteration'`/`'Notes'`, and one assertion changed from `.toHaveValue(fragment.notes.text)` to `.toEqual(fragment.notes)`:

```ts
xit('Renders transliteration field', () => {
  expect(screen.getByLabelText('Transliteration')).toHaveValue(fragment.atf)
})

xit('Renders notes field', () => {
  expect(screen.getByLabelText('Notes')).toEqual(fragment.notes)
})
```

In master both are live, passing `it(...)` tests. I checked attribution carefully: `git diff origin/chore/ts7-tsconfig-migration HEAD -- src/fragmentarium/ui/edition/Edition.test.tsx` shows this PR removes only the bluebird import. The skips, the gutted bodies and the removal of the `jest.mock('editor/Editor', ...)` mapping all come from the base branch. Flagging it because it is the only test regression in the stack and it will reach master with it — the project bars disabling tests without explicit approval.

**Reproduction steps**

1. `git show origin/master:src/fragmentarium/ui/edition/Edition.test.tsx | grep -n 'it('` → four live `it(...)`.
2. `git show origin/chore/ts7-tsconfig-migration:src/fragmentarium/ui/edition/Edition.test.tsx | grep -n 'xit('` → two `xit(...)`.
3. `git diff origin/chore/ts7-tsconfig-migration HEAD -- src/fragmentarium/ui/edition/Edition.test.tsx` → bluebird import removal only.

**Correction and withdrawal.** My original attribution was wrong, and checking it properly changed the conclusion. The two `xit`s do **not** come from #773 — they exist at the merge-base of this branch and master (`4db5c9cd`), so they predate both #773 and #774:

```
4db5c9cd (merge-base)                 -> xit count = 2
4f71cb24 chore/ts7-tsconfig-migration -> xit count = 2
0e679943 HEAD                         -> xit count = 2
1dcc762e origin/master                -> xit count = 0
```

Master reached 0 by fixing them independently in `8971a666` (#767), which added `src/editor/Editor.testSupport.tsx` and re-enabled both tests. That file has never existed on this branch line, which is why the tests were disabled here.

Critically, this resolves itself on merge. A merge preview (`git merge-tree --write-tree origin/master HEAD`) shows the merged tree keeps master's `Editor.testSupport.tsx` and all four tests live as `it(...)`, while still picking up this branch's bluebird-import removal. Nothing needs to change on either PR, and no action is required.

**Recommendation:** none — withdrawn.

**Related observation (informational).** That merge preview also reported conflicts in roughly 19 files against master's current tip, including `src/InjectedApp.test.tsx`, `FragmentService.ts`, `FragmentRepository.ts`, `CuneiformFragment.tsx`, `TransliterationForm.tsx` and `Info.tsx`. That is unsurprising for a 471-file refactor against a moving master, and it is not blocking now because this PR targets #773 — but expect a real conflict-resolution pass when the stack is retargeted.

### F6 — Duplicate `JsonApiClient` type has now diverged

**Severity:** Low · **Blocking:** No

`JsonApiClient` is declared twice: [src/index.tsx:26](src/index.tsx#L26) and [src/test-support/appDriverHelpers.tsx:29](src/test-support/appDriverHelpers.tsx#L29). The duplication pre-exists in master, but this PR added signal parameters to the `index.tsx` copy only, so the two now describe different contracts — the test-support copy still has the three-parameter, signal-free shape. Tests wired through `getServices` therefore type-check against a stricter shape than production code does.

**Recommendation:** have `appDriverHelpers.tsx` re-export the type from `index` rather than redeclaring it, which also resolves the divergence permanently.

**Resolution — Fixed, together with F1.** Rather than re-export from `index` — which would have kept test-support depending on the app entrypoint — the type now lives in [src/http/JsonApiClient.ts](src/http/JsonApiClient.ts) and there is exactly one declaration. `appDriverHelpers.tsx` imports it, and its divergent copy is gone.

## Severity

| Severity  | Count | Findings                                                                | Outcome                                                   |
| --------- | ----- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| Blocker   | 0     | —                                                                       | —                                                         |
| Medium    | 2     | F1, F2                                                                  | Both fixed                                                |
| Low       | 3     | F3, F4, F6                                                              | All fixed                                                 |
| Withdrawn | 1     | F5                                                                      | Not a defect — predates both PRs, master already fixed it |
| Info      | 2     | CI workflow base-branch broadening; ~19 merge conflicts vs master's tip | Intentional / expected, no action                         |

F1 and F2 were Medium in code-risk terms but **blocked the merge**: F1 made a documented safety guarantee false, F2 would have put scratch files on master. Both are resolved.

## Reproduction Steps

Every gate below was run locally against head `0e679943`. The full suite was run in seven memory-bounded shards because this container has ~2.5 GB free and a single `--coverage` run gets OOM-killed; each shard is an independent `craco test` process and their totals sum to the full suite.

```bash
yarn lint                                  # PASS
yarn tsc                                   # PASS
# 426 suites across 7 shards, e.g.
CI=true npx craco test --runInBand --watchAll=false --testPathPattern="src/fragmentarium/ui"
# → Test Suites: 102 passed | Tests: 2 skipped, 698 passed
```

Aggregate: **426 suites, 3697 tests (3695 passed, 2 skipped), 50 snapshots, zero failures, zero console output.** The 2 skipped are F5's inherited `xit`s.

Coverage on the cancellation primitives — all four metrics at 100%:

```bash
npx craco test --runInBand --watchAll=false --coverage \
  --testPathPattern="src/(common/(utils|hooks)|http)" \
  --collectCoverageFrom="src/common/utils/{AbortableOperation,SupersedableOperation,applyWhenCurrent,abortError,ConcurrencyLimiter}.ts" \
  --collectCoverageFrom="src/common/hooks/usePromiseEffect.ts" \
  --collectCoverageFrom="src/http/{ApiClient,withData}.{ts,tsx}"
```

`getOrFetchCachedValue.ts` and `mapSeries.ts` are also at 100%, exercised from `src/fragmentarium/application` and `src/corpus/application`.

Sass behaviour-preservation — the PR's byte-identical claim, independently verified:

```bash
# compile all 59 non-partial .sass entrypoints in both trees and compare
# → identical=59 differing=0 errors=0
```

## Verification Performed

Confirmed working, beyond the gates:

- **Bluebird is fully gone.** Zero `bluebird`/`Bluebird` references in `src`; both `bluebird` and `@types/bluebird` dropped from `package.json`; zero leftovers of the old idioms (`CancellationError`, `cancellableFetch`, `isCancelled`, `onCancel`, `.cancel()`).
- **The write-cancellation fix is real.** `runWrite` uses token-based `SupersedableOperation`, not `AbortController`. All four write-owning components (`TransliterationForm`, `WordEditor`, `BibliographyEntryFormController`, `BibliographyEntryForm`) hold their own operation and `supersede()` on unmount. `usePromiseEffect.write.integration.test.tsx` proves the three properties asked for in the last review.
- **No unhandled rejections by construction.** All four read consumers wrap through `applyWhenNotAborted`, and all write consumers through `applyWhenCurrent`, both of which attach a rejection handler — so neither `run` nor `runWrite` can leak a rejected promise to a caller that ignores the return value.
- **The `Bluebird.all(promise-of-array)` removals are safe.** `injectFragmentReferencesToRecords` and `signService.search` both return `Promise<T[]>` of plain values, so the deep-resolve was a no-op.
- **No public API lost in the 250-line splits.** Method-level comparison of `FragmentService`, `FragmentRepository` and `TextService` against the base shows no dropped members.
- **No net test loss.** 340 → 426 suites, 2001 → 2200 test declarations. The nine deleted `.test` files were genuine splits, not removals.
- **Sass:** 59/59 entrypoints byte-identical; zero `@import` and zero `darken()`/`lighten()` remain; the four `silenceDeprecations` entries and four `ignoreWarnings` patterns removed from `craco.config.js` are correspondingly no longer needed.
- **Determinism:** zero unseeded `new Chance()` in `src`.
- **Console discipline improved:** `silenceConsoleErrors()` replaced by `expectConsoleErrors(pattern)`, which asserts in `afterEach` that no _unexpected_ console error appeared. That is the opposite of suppression and is a real improvement.

## Dev Container Review

**No dev container changes in this PR.** Checked explicitly at your request:

```bash
git diff --stat origin/chore/ts7-tsconfig-migration HEAD -- .devcontainer/   # empty
git diff --stat origin/master HEAD -- .devcontainer/                         # empty
```

`.devcontainer/` is untouched against both the base branch and master. The complete non-`src` change set is: `.github/workflows/codeql-analysis.yml`, `.github/workflows/main.yml`, `.gitignore`, `README.md`, `craco.config.js`, `package.json`, `yarn.lock`. `.qlty/qlty.toml` is also unchanged.

The two workflow edits broaden `pull_request.branches` from `[master]` to `[master, 'chore/**', 'feature/**', 'fix/**']`. This is a sound fix — stacked PRs targeting a long-lived branch were previously merging without CI or CodeQL — and it widens rather than narrows coverage, so it carries no security downside. No action needed.

## Comment Status Tracking

**Reviews (timeline events)**

| Reviewer    | State                 | Date       | Commit     | Status                                           |
| ----------- | --------------------- | ---------- | ---------- | ------------------------------------------------ |
| qltysh[bot] | COMMENTED             | 2026-07-21 | `7ba6f490` | Superseded                                       |
| qltysh[bot] | COMMENTED             | 2026-07-23 | `01e61b13` | Superseded                                       |
| Fabdulla1   | **CHANGES_REQUESTED** | 2026-08-04 | `5ef4a984` | **Still the active review state — blocks merge** |

**Inline review comments: 6, all resolved and outdated**

| #   | Author      | Path                                         | Issue                       | Resolved | Outdated |
| --- | ----------- | -------------------------------------------- | --------------------------- | -------- | -------- |
| 1   | qltysh[bot] | `src/corpus/application/TextService.ts`      | 17 similar lines (mass 79)  | Yes      | Yes      |
| 2   | qltysh[bot] | `src/corpus/application/TextService.ts`      | 17 similar lines (mass 79)  | Yes      | Yes      |
| 3   | qltysh[bot] | `src/common/hooks/usePromiseEffect.test.tsx` | 18 similar lines (mass 120) | Yes      | Yes      |
| 4   | qltysh[bot] | `src/common/hooks/usePromiseEffect.test.tsx` | 18 similar lines (mass 120) | Yes      | Yes      |
| 5   | qltysh[bot] | `src/corpus/application/TextService.ts`      | 15 similar lines (mass 66)  | Yes      | Yes      |
| 6   | qltysh[bot] | `src/corpus/application/TextService.ts`      | 15 similar lines (mass 66)  | Yes      | Yes      |

**Unresolved threads: 0. General/issue comments: 0. sourcery-ai: not present on this PR** — no sourcery-ai review or comment exists; the only bot reviewer is qltysh.

**Points from the 2026-08-04 CHANGES_REQUESTED, against current head**

| Point                                                                                                                   | Status                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `runWrite` can abort an already-dispatched server write                                                                 | **Addressed** — `runWrite` uses `SupersedableOperation`, no signal reaches a write at runtime. Note F1: the `JsonApiClient` type still advertises one. |
| `usePromiseEffect.test.tsx` asserts the same abort behaviour for `run` and `runWrite`                                   | **Addressed** — write path now has its own integration suite                                                                                           |
| Integration test reaching a mocked `ApiClient`/`fetch` proving no network abort, and that stale results can't update UI | **Addressed** — `usePromiseEffect.write.integration.test.tsx`, four tests                                                                              |
| Seven files over the 250-line ceiling                                                                                   | **Addressed** — every touched `.ts`/`.tsx` is now under 250 lines                                                                                      |

## Recommendation

**Approve, pending re-review.** The core work is sound and the previous round's findings were genuinely resolved rather than papered over. Every finding from this round has now been addressed in the working tree, and one was withdrawn after I checked its attribution properly.

All gates re-run green after the changes: `yarn lint`, `yarn tsc`, 426 suites / 3695 passed / zero console output, every touched file under 250 lines, all six qlty duplication blocks cleared, and the ten per-path coverage gates holding at 100%.

The only thing left is not a code change: the `CHANGES_REQUESTED` review from 2026-08-04 is still the active state and needs a re-review to clear.

Merge order still matters: this PR targets `chore/ts7-tsconfig-migration`, so **#773 must merge first**, after which GitHub retargets this to master. Expect a real conflict-resolution pass at that point — a merge preview against master's current tip shows roughly 19 conflicting files.

**Note on the working tree:** these fixes are uncommitted. Nothing has been committed or pushed.

## What Has To Be Done

Items 1–6 are **done** in the working tree (uncommitted). Items 7–10 are still outstanding and are yours.

1. ~~**[F1]** Remove the phantom `signal` from `postJson`.~~ **Done** — type extracted to `src/http/JsonApiClient.ts` with `postJson` at three parameters; `src/index.tsx` no longer declares it; all three consumers updated. `yarn tsc` clean.
2. ~~**[F2]** Untrack the three task files.~~ **Done** — `git rm --cached` applied; `git diff --cached --name-status origin/master -- '*.md'` now shows only `M README.md`.
3. ~~**[F3]** Collapse the duplicated 401/403 tests into `it.each`.~~ **Done** — `ApiClient.securityErrors.test.ts` 179 → 161 lines.
4. ~~**[F3]** Lift the shared Auth0 scaffold into `react-auth0-spa.testSupport.tsx`.~~ **Done** — `sessionFallback` 128 → 57 lines, `tokenSecurity` 94 → 50; `qlty smells --all` reports none of the three files. All 6 blocking issues cleared.
5. ~~**[F4]** Fix the coverage gate.~~ **Done** — global floor widened to 93/85/93/93 **and** per-path `100/100/100/100` gates added for the ten files this PR owns, all verified passing.
6. ~~**[F6]** De-duplicate the `JsonApiClient` type.~~ **Done** — single declaration in `src/http/JsonApiClient.ts`.
7. **[BLOCKER]** Get a re-review from Fabdulla1 to clear the standing `CHANGES_REQUESTED` from 2026-08-04. All four of its points are resolved in code; the review state itself is what remains.
8. **[Commit]** These fixes are uncommitted. Review the working tree and commit when you are ready — nothing has been committed or pushed.
9. **[Merge order]** Merge #773 first, let GitHub retarget this PR to master, then re-verify item 2 against master. Budget for a conflict-resolution pass: a merge preview against master's tip shows roughly 19 conflicting files.
10. **[Cleanup]** Delete the five `TASK-774-*.md` scratch files (including this review) and the three `TASK-ts7-migration-*.md` files before merge. Since the `TASK-*.md` `.gitignore` rule was reverted at your request, these now appear as untracked in `git status` — they will not be committed accidentally, but they must be removed from the working tree rather than silently ignored.

**F5 requires no action** — withdrawn; see its section for the evidence.
