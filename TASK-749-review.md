<!-- markdownlint-disable MD013 -->

# TASK-749 — Review of PR #817 "Read nameBreaks alongside nameParts"

| Field                              | Value                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review date**                    | 2026-09-16                                                                                                                                           |
| **Repository**                     | `ElectronicBabylonianLiterature/ebl-frontend`                                                                                                        |
| **Pull request**                   | [#817](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/817)                                                                      |
| **Head branch**                    | `add-name-breaks`                                                                                                                                    |
| **Head SHA reviewed**              | `f18d0ce5ca63c57222c74defd02558e8e96ec730`                                                                                                           |
| **Base branch**                    | `chore/remove-bluebird` (stacked on [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774))                                 |
| **Related backend PR**             | [ebl-api#743](https://github.com/ElectronicBabylonianLiterature/ebl-api/pull/743) (open, not merged)                                                 |
| **Size**                           | 11 files, +1239 / −9 — of which **+1122 is task-tracking documents**, leaving ~117 lines of real change                                              |
| **CI**                             | all green — `test`, `CodeQL`, `Analyze (javascript)`, `GitGuardian` ×3, `qlty check`; `docker` / `docker-test` skipped (gated on pushes to `master`) |
| **Dev container changes**          | **none** — verified against both the base branch and `master`                                                                                        |
| **App verified in a real browser** | yes — Chrome 131 against the running dev server, both payload shapes, plus a negative control                                                        |
| **Verdict**                        | ⚠️ **Changes requested** — one blocker remains (F1, cleanup) plus one decision (F7). All code findings are fixed in the working tree.                |
| **Findings**                       | 8 raised · 3 fixed · 1 **withdrawn as incorrect** · 1 open blocker · 1 open decision · 2 informational                                               |

---

## Review Summary

Good change, and the problem it fixes is a nasty one: once the backend splits a sign's name into two arrays, a client that reads only the first quietly draws `kur` where the tablet reads `k[ur`. Nothing crashes — the text is just wrong. I reproduced exactly that in a real browser, and confirmed the fix cures it.

The code is correct; I checked the interleave against the backend's own implementation rather than the description. What's left is housekeeping: 1122 of the 1239 added lines are task-tracking documents that shouldn't merge, and the PR targets a feature branch rather than `master`. I've fixed the code findings in the working tree; those two are yours to call.

### Details

#### F1 — Six task-tracking files are committed _(Blocker · Process · **OPEN**, cleanup deliberately out of scope)_

The PR adds, as tracked files at the repository root:

| File                           | Lines     |
| ------------------------------ | --------- |
| `TASK-749-frontend-brief.md`   | +448      |
| `TASK-749-frontend-pr-body.md` | +63       |
| `TASK-749-frontend.patch`      | +222      |
| `TASK-749-handoff.md`          | +125      |
| `TASK-749-log.md`              | +211      |
| `TASK-749-todo.md`             | +53       |
| **Total**                      | **+1122** |

That is 90% of the diff, and the requirement is explicit: **no new `.md` files may be present.**

Two things make this worse than a tidy-up. `TASK-749-frontend.patch` is a verbatim copy of the source diff — a second, immediately-stale copy of the change living beside the change. And merging the stack also lands **eight further documents inherited from the base branch**: `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Fourteen files reach `master` if nobody intervenes.

This document and its sibling `TASK-749-todo.md` / `TASK-749-log.md` are in the same category and must go with them. All three are deliberately uncommitted.

Worth a `.gitignore` entry for `TASK-*.md` / `TASK-*.patch` so it stops recurring — the same files were committed to ebl-api#743.

#### F2 — `extractEnclosureTypes` was routed through `nameTokens` with nothing testing it _(Blocker · Test coverage · **FIXED**)_

[`token.ts:230`](src/transliteration/domain/token.ts#L230) changed from `namedSign.nameParts.map(...)` to `nameTokens(namedSign).map(...)`. Not cosmetic: `extractEnclosureTypes` feeds `effectiveEnclosure` and `isStrictlyPartiallyEnclosed`, which decide how the image-annotation tool labels a sign — `CompletelyBroken` at [mapTokensToAnnotationTokens.ts:32](src/fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens.ts#L32), `PartiallyBroken` at [line 40](src/fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens.ts#L40).

Under the legacy shape the break sat inside `nameParts`, so its own `enclosureType` took part in the `_.intersection` / `_.union`. Routing through `nameTokens` is what preserves that. Without it, a name whose parts all carry `BROKEN_AWAY` but whose break does not flips from _partially_ to _completely_ broken.

**The gap was confirmed by mutation, not inferred.** Reverting line 230 and running the whole suite gave **500 suites / 4402 tests passed, 0 failed** — the change could be undone in its entirety and nothing noticed. Line coverage read 100% only because `nameTokens` had its own direct tests, which is exactly why it was easy to miss.

Fixed by adding a shared fixture and two assertions in [`token.test.ts`](src/transliteration/domain/token.test.ts) — a name whose parts both carry `BROKEN_AWAY` and whose break does not:

- `effectiveEnclosure` › _counts the name breaks, not only the name parts_ → expects `[]`
- `isStrictlyPartiallyEnclosed` › _is true when a name break interrupts an otherwise enclosed name_ → expects `true`

Re-running the same mutation now fails **both** tests, so the call site is genuinely pinned.

#### F3 — Surplus `nameBreaks` were silently discarded _(Low · Robustness · **FIXED**)_

The walk was driven by `nameParts`, so breaks beyond `nameParts.length` vanished without a trace. Unreachable against a well-behaved server — `_validate_name_breaks` enforces `len(breaks) <= len(parts)` — but the failure mode was the exact one this PR exists to eliminate: a bracket disappears and the reading is silently wrong.

Rather than bolt on a `slice`, `nameTokens` now mirrors the backend's `zip_longest` directly:

```ts
const { nameParts, nameBreaks } = namedSign
if (!nameBreaks) {
  return nameParts
}
return _.zip(nameParts, nameBreaks).flatMap((pair) =>
  pair.filter((token): token is ValueToken | Enclosure => token !== undefined),
)
```

This is shorter than the original, drops the index arithmetic, and makes the correspondence to the backend obvious:

```python
for part, name_break in zip_longest(self.name_parts, self.name_breaks):
    yield part
    if name_break is not None:
        yield name_break
```

Covered by a new case, _keeps breaks that outnumber the parts_. `token.ts` stays at 245 lines.

#### F4 — ~~Redundant intermediate variable in the test fix~~ _(**WITHDRAWN — the finding was wrong**)_

I flagged [`FragmentService.queries.test.ts:60-63`](src/fragmentarium/application/FragmentService.queries.test.ts#L60-L63) as a pointless single-use variable that could collapse to one line. It cannot.

Inlining it produces:

```text
error  `queryByTraditionalReferences` query is sync so it does not need to be awaited
       testing-library/no-await-sync-queries
```

The rule matches any `await …queryBy*(…)` call and mistakes this service method for a Testing Library query. The intermediate variable is a deliberate workaround, not redundancy — `await pendingResult` is not a call expression, so the rule does not fire. **Leave it as written.** Worth a brief note in the code only if someone later tries the same simplification; I have not added one, since the repository's convention is not to comment.

The repair around it remains correct and worth the credit: the old code compared two _unresolved Promise objects_ with `toEqual`, which asserts essentially nothing — two promises with no own enumerable properties always match.

#### F5 — Three ad-hoc `NamedSign` fabricators, all via `as unknown as` _(Low · DRY / typing · **FIXED**)_

The PR added a second fabricator to `token.test.ts` and a third set to `accents.test.ts`, all reaching their type through `as unknown as`. The guidelines treat DRY as a hard gate and ask that `unknown` be avoided unless necessary, and `src/test-support/test-tokens.ts` already reaches full `Word` / `Reading` types **without a single cast** — so the casts were a convenience, not a necessity.

Fixed by extracting [`src/test-support/named-sign-fixtures.ts`](src/test-support/named-sign-fixtures.ts) (60 lines): `valueToken()`, `brokenAway()` and `namedSignFixture()`, fully typed, zero casts. Both test files now use it, and `grep "as unknown as"` across them returns nothing.

While there, the two relative imports the PR had touched in `accents.test.ts` (`./accents`, `./token`) became full alias paths, per the import convention.

#### F6 — `nameParts` keeps the widened union, diverging from the backend schema _(Informational · follow-up)_

The backend now types `name_parts: Sequence[ValueToken]` with a validator that rejects anything else. The client keeps `readonly (ValueToken | Enclosure)[]`.

Deliberate and correct for now — narrowing would break the legacy fallback, which is what lets the two repositories deploy independently, and the "align to the backend schema" guideline explicitly allows a backward-compatibility carve-out. But it is a temporary deviation with no expiry attached. Once ebl-api#743 is deployed everywhere, `nameParts` should narrow to `readonly ValueToken[]`, `nameBreaks` should lose its optionality, and the `if (!nameBreaks)` arm should go. Left unchanged here; it needs a ticket, not a patch.

#### F7 — Base branch and deploy order _(Blocker · Process · **OPEN — needs a decision**)_

The PR targets `chore/remove-bluebird` and cannot merge until #774 does. That collides with its own timing requirement: it must be live **before** ebl-api#743, because the moment #743 deploys, every un-updated client starts dropping brackets. Stacking ties this release to #774's schedule for no technical reason — the change touches `token.ts` and `accents.ts` and depends on nothing in #774.

One coupling runs the other way: the `FragmentService.queries.test.ts` repair is a **base-branch defect fixed from here**. On `master` the file still imports bluebird, which masks the empty assertion, so the bug is latent rather than failing. Cherry-picking the feature commit alone would leave it behind.

1. **Keep the stack.** Merge #774, retarget to `master`, merge, deploy, then merge #743. Simplest; the deploy window depends on #774.
2. **Decouple.** Cherry-pick `d506a0de` **and** `f18d0ce5` onto a fresh branch off `master`. Frees the deploy entirely.

#### F8 — Dev container: no changes _(Informational · verified)_

**There are none, and no warning is warranted.** `git diff origin/chore/remove-bluebird...HEAD -- .devcontainer` is empty, as is the same diff against `master`.

For completeness, the wider stack does carry infrastructure changes — `.github/workflows/codeql-analysis.yml`, `.github/workflows/main.yml`, `craco.config.js` (+85/−8), `package.json`, `tsconfig.json`, `yarn.lock`. **All belong to #774 and the TS7 migration commit, and none touch `.devcontainer/`.** Traced via `git log origin/master..HEAD -- <path>`.

---

## Summary

PR #817 teaches the frontend to read `nameBreaks`, a new sibling array to `nameParts` introduced by ebl-api#743. A named sign's name used to arrive as one interleaved list of value tokens and brackets; it now arrives as two, and rendering it as written means zipping them back together.

The implementation is one exported helper, `nameTokens()` in `src/transliteration/domain/token.ts`, returning `nameParts` untouched when `nameBreaks` is absent or `null`. Both call sites that walk a name — `extractEnclosureTypes` in `token.ts` and `addAccents` in `accents.ts` — go through it. A `grep` for `nameParts` across production code confirms these are the only two; every other hit is a test fixture. No code path serializes tokens back to the API, so there is no round-trip risk.

The change is correct. The interleave matches the backend's `_interleaved` exactly, trailing-break case included. Accent placement is unaffected, because `Accumulator.addToken` passes non-value tokens through untouched and the reconstructed order is identical to the legacy order.

The PR also carries an unrelated but legitimate repair to `FragmentService.queries.test.ts`, consistent with the rule that pre-existing defects are fixed on detection rather than deferred.

What stands in the way is process, not engineering.

## Findings

| ID  | Severity    | Category         | Status                          | Finding                                                                                         |
| --- | ----------- | ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| F1  | **Blocker** | Process          | **Open** (cleanup out of scope) | Six task-tracking files (+1122 lines) committed; eight more inherited from the base branch      |
| F2  | **Blocker** | Test coverage    | **Fixed**                       | `extractEnclosureTypes` routed through `nameTokens` with no test covering the `nameBreaks` path |
| F7  | **Blocker** | Process          | **Open** (decision)             | Targets `chore/remove-bluebird`; conflicts with the need to deploy before ebl-api#743           |
| F3  | Low         | Robustness       | **Fixed**                       | Surplus `nameBreaks` silently truncated                                                         |
| F4  | —           | —                | **Withdrawn**                   | Finding was incorrect — the intermediate variable is a lint workaround                          |
| F5  | Low         | DRY / typing     | **Fixed**                       | Three ad-hoc `NamedSign` fabricators, all via `as unknown as`                                   |
| F6  | Info        | Schema alignment | Follow-up                       | `nameParts` union kept for backward compatibility; needs a narrowing ticket                     |
| F8  | Info        | Infrastructure   | Verified                        | Dev container: no changes                                                                       |

## Severity

| Severity      | Raised | Remaining                   |
| ------------- | ------ | --------------------------- |
| Blocker       | 3      | 2 (F1 cleanup, F7 decision) |
| Major         | 0      | 0                           |
| Low           | 3      | 0                           |
| Withdrawn     | 1      | —                           |
| Informational | 2      | —                           |

No correctness, security or regression defects were found in the shipped logic. CodeQL, `Analyze (javascript)`, GitGuardian (×3) and `qlty check` are green on `f18d0ce5`; local `qlty check` and `qlty smells` over the changed files report nothing.

## Reproduction Steps

### The bug the PR prevents — reproduced in a real browser

The most direct evidence. With the app's entry point temporarily pointed at a harness rendering the real `DisplayToken` for both payload shapes, served by `yarn start:fast` and loaded in Chrome 131:

| `addAccents` implementation          | New shape (`nameParts` + `nameBreaks`) | Legacy shape (interleaved) |
| ------------------------------------ | -------------------------------------- | -------------------------- |
| `nameTokens(namedSign)` — as shipped | **`k]u`** ✅                           | **`k]u`** ✅               |
| `namedSign.nameParts` — pre-PR       | **`ku`** ❌ bracket silently dropped   | `k]u`                      |

Rendered markup was byte-identical between the two shapes with the fix in place:

```html
<span class="Transliteration__ValueToken--BROKEN_AWAY">k</span>
<span class="Transliteration__BrokenAway--BROKEN_AWAY">]</span>
<span class="Transliteration__ValueToken">u</span>
```

The harness and the entry-point edit were reverted afterwards; `git diff src/index.tsx` is empty.

### F2 — the call site was unpinned

```bash
grep -rn "nameBreaks" src/
# before: token.ts, token.test.ts, accents.test.ts only — no fixture in src/test-support/
```

```diff
- return nameTokens(namedSign).map((part) => part.enclosureType)
+ return namedSign.nameParts.map((part) => part.enclosureType)
```

Before the fix: `CI=true yarn test --watchAll=false` → 500 suites / 4402 tests, **0 failed**.
After the fix: the same mutation fails 2 tests in `token.test.ts`.

### F3 — surplus breaks vanished

`nameParts: ['ku']`, `nameBreaks: [']', '[']` returned `['ku', ']']`; now returns `['ku', ']', '[']`.

### F4 — why the inline does not work

```bash
yarn lint
# error  `queryByTraditionalReferences` query is sync so it does not need to be awaited
#        testing-library/no-await-sync-queries
```

### F8 — dev container

```bash
git diff --stat origin/chore/remove-bluebird...HEAD -- .devcontainer   # empty
git diff --stat origin/master...HEAD -- .devcontainer                  # empty
```

## Recommendation

**Changes requested**, with the emphasis on housekeeping rather than code.

The logic is sound, verified against the backend implementation rather than assumed, and verified against the running application in a real browser including a negative control. All three code findings (F2, F3, F5) are fixed in the working tree and all gates pass. One finding (F4) was wrong and is withdrawn.

Two things remain, both yours:

- **F1** — remove the task documents. The largest and easiest win; explicitly left out of this pass at your request.
- **F7** — settle the base branch. A decision, not a defect, but it gates the merge either way.

F6 wants a follow-up ticket, not a change here. Once F1 and F7 are resolved, this is an approve from me.

## Review and Comment Status

All pre-existing reviews and comments were fetched from the GitHub API before this review began, as required.

| Source                                                                  | Count | Status                                                           |
| ----------------------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| Timeline review events (`APPROVED` / `CHANGES_REQUESTED` / `COMMENTED`) | 0     | —                                                                |
| Inline review comments                                                  | 0     | —                                                                |
| General / issue comments                                                | 0     | —                                                                |
| Automated review bots (`sourcery-ai`, CodeRabbit, or similar)           | 0     | None configured — no `.sourcery.yaml`, no bot account has posted |
| Requested reviewers                                                     | 0     | None assigned                                                    |

**Unresolved comments: none. Resolved comments: none.** This review is the first on PR #817, so every item in _What Has To Be Done_ originates here.

Timeline contains three `committed` events only:

| SHA        | Message                                                                                 |
| ---------- | --------------------------------------------------------------------------------------- |
| `d506a0de` | Read nameBreaks alongside nameParts                                                     |
| `de33bdc9` | docs: record PR #817 in the TASK-749 tracking docs                                      |
| `f18d0ce5` | fix: compare resolved values instead of promise objects in FragmentService.queries.test |

### Checks and static analysis

| Check                         | App                      | Conclusion                                                                               |
| ----------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `test`                        | github-actions           | ✅ success                                                                               |
| `CodeQL`                      | github-advanced-security | ✅ success                                                                               |
| `Analyze (javascript)`        | github-actions           | ✅ success                                                                               |
| `GitGuardian scan` (×2)       | github-actions           | ✅ success                                                                               |
| `GitGuardian Security Checks` | gitguardian              | ✅ success                                                                               |
| `qlty check`                  | qlty (commit status)     | ✅ success                                                                               |
| `docker`, `docker-test`       | github-actions           | ⏭️ skipped — gated on `github.event_name == 'push' && github.ref == 'refs/heads/master'` |

**CodeQL:** the check run is green on `f18d0ce5`. The code-scanning _alerts_ endpoint returned `Resource not accessible by integration` for this environment's token, so alerts could not be enumerated directly; the green check run is the evidence relied on. Worth a glance at the Security tab if certainty is needed.

**qlty:** green in the cloud, reproduced locally — `qlty check` reports _No issues_, `qlty smells` reports no duplication or structural findings.

### Local gate verification

Node 20.20.2 / Yarn 1.22.22, matching `.nvmrc` and `package.json` engines.

| Gate                         | On `f18d0ce5` as submitted                          | After the review fixes                        |
| ---------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `yarn tsc`                   | ✅ 0 errors                                         | ✅ 0 errors                                   |
| `yarn lint`                  | ✅ clean                                            | ✅ clean                                      |
| Full suite                   | ✅ 500 suites / 4402 tests / 50 snapshots (490.9 s) | ✅ see `TASK-749-log.md`                      |
| Console output               | ✅ none beyond the Browserslist banner              | ✅ unchanged                                  |
| `qlty check` / `qlty smells` | ✅ no issues                                        | ✅ no issues                                  |
| 250-line ceiling             | ✅ max 245 (`token.ts`)                             | ✅ max 245 (`token.ts`)                       |
| Running application          | —                                                   | ✅ Chrome 131, both shapes + negative control |

`token.ts` at **245 lines leaves five lines of headroom.** The F3 fix was written to stay within it — the `_.zip` form is shorter than a `slice`-based one — but the next change to this file will need a split.

**Console noise:** the only output is craco's `Browserslist: browsers data (caniuse-lite) is 8 months old` banner, printed by the build tooling before any suite runs, not a `console.error` / `console.warn` from a test. Pre-existing and unrelated. Clearing it means `npx update-browserslist-db@latest`, which rewrites `yarn.lock` — reasonably kept out of a focused PR, but it should be scheduled so the "zero console output" gate stays meaningful.

## What Has To Be Done

1. **[BLOCKER · F1]** Delete the six task-tracking files added by this PR: `TASK-749-frontend-brief.md`, `TASK-749-frontend-pr-body.md`, `TASK-749-frontend.patch`, `TASK-749-handoff.md`, `TASK-749-log.md`, `TASK-749-todo.md`.
2. **[BLOCKER · F1]** Delete the eight documents inherited from the base branch before the stack reaches `master`: `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Coordinate with #774 so the deletion is not lost in the merge.
3. **[BLOCKER · F1]** Delete `TASK-749-review.md`, `TASK-749-todo.md` and `TASK-749-log.md` (this review's own working documents) before merge. All three are intentionally uncommitted.
4. **[BLOCKER · F7]** Decide the base branch: either merge #774 and retarget this PR to `master`, or cherry-pick `d506a0de` **and** `f18d0ce5` onto a fresh branch off `master`. Do not cherry-pick the feature commit alone — the test fix is needed on `master` too.
5. **[BLOCKER · F7]** Whichever route is chosen, merge and deploy this **before** ebl-api#743, and confirm the ordering with whoever lands #743.
6. **[DONE · F2]** Tests pinning `extractEnclosureTypes` to `nameTokens` — added to `token.test.ts`; verified to fail under the mutation.
7. **[DONE · F3]** `nameTokens` rewritten to mirror `zip_longest`; surplus breaks no longer discarded; covering test added.
8. **[DONE · F5]** `src/test-support/named-sign-fixtures.ts` extracted; all `as unknown as` casts removed from both test files; touched relative imports normalised to alias paths.
9. **[WITHDRAWN · F4]** No action. The finding was incorrect — inlining the variable breaks `testing-library/no-await-sync-queries`.
10. **[Follow-up · F6]** Open a ticket to narrow `nameParts` to `readonly ValueToken[]`, make `nameBreaks` required, and drop the legacy fallback once ebl-api#743 is deployed everywhere.
11. **[Follow-up]** Schedule `npx update-browserslist-db@latest` as its own PR so the console-clean gate is not permanently carrying a known exception.
12. **[Follow-up]** Consider `TASK-*.md` / `TASK-*.patch` in `.gitignore` in both repositories — the same files were committed to ebl-api#743.
13. **[Re-review]** Re-request review once items 1–5 are done. No reviewers are currently assigned and none are requested by this review.
