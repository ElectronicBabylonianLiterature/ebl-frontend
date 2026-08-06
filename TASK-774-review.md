# TASK-774-review — PR #774 `chore: remove bluebird, use AbortController for cancellation`

|                   |                                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| **PR**            | [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774) |
| **Head reviewed** | `1b0fe6b22e10180349cbfa27d7bcf2f2cb8f9833`                                      |
| **Base**          | `chore/ts7-tsconfig-migration` (**not** `master`)                               |
| **State**         | open, not draft, `MERGEABLE`, review decision `CHANGES_REQUESTED`               |
| **Size**          | 408 files, +20185 / −13846                                                      |
| **Review date**   | 2026-08-06                                                                      |

---

## Summary

This is a re-review at head `1b0fe6b2`. Every blocker and finding raised in the previous pass
was re-verified against the current code rather than taken from the earlier write-up.

**The substance of the PR is in good shape.** `bluebird` is gone from `package.json` and from
all application code (it survives only as a transitive dependency of `bfj`, a build-time
`react-scripts` dependency — not the app's concern). The write-cancellation defect that drew
the `CHANGES_REQUESTED` is genuinely fixed, at the design level rather than patched, and the
integration test the reviewer asked for exists and asserts both required guarantees
separately. The 250-line ceiling is met by every file the PR touches.

**What still blocks approval is process, not code.** The CI workflow has never run on a single
commit of this branch, and the only human review is an unresolved `CHANGES_REQUESTED`.

**What is newly found in this pass** is that the 250-line remediation traded one hard gate for
another: three of the file splits copied fixtures and setup verbatim into the new sibling
instead of extracting them, which violates the DRY gate. The project already demonstrates the
correct pattern elsewhere in the same PR (`FragmentService.testSupport.ts`, shared by twelve
test files), so this is an inconsistency to close, not a redesign.

### Pre-existing review threads and comments (hard gate — all gathered)

Fetched via the REST API (`/pulls/774/reviews`, `/pulls/774/comments`, `/issues/774/comments`)
and GraphQL `reviewThreads` for resolution and outdated status. `gh` is not installed in this
devcontainer; `GITHUB_TOKEN` + `curl` were used.

| Author        | Type         | Date       | State                   | Status                   |
| ------------- | ------------ | ---------- | ----------------------- | ------------------------ |
| `qltysh[bot]` | review event | 2026-07-21 | `COMMENTED`             | superseded               |
| `qltysh[bot]` | review event | 2026-07-23 | `COMMENTED`             | superseded               |
| `Fabdulla1`   | review event | 2026-08-04 | **`CHANGES_REQUESTED`** | **UNRESOLVED — blocker** |

**Inline review comments — 6, all from `qltysh[bot]`, all `isResolved=true` and
`isOutdated=true`:**

| #                                                                                                             | File                                     | Line | Issue                  | Truly fixed?                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- | ---------------------- | ---------------------------------------------------------------------------- |
| [r3623999642](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3623999642) | `corpus/application/TextService.ts`      | 394  | similar-code, mass 79  | **Yes** — file is now 70 lines, split into 7 modules; no duplication at head |
| [r3623999655](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3623999655) | `corpus/application/TextService.ts`      | 412  | similar-code, mass 79  | **Yes**                                                                      |
| [r3638371006](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638371006) | `corpus/application/TextService.ts`      | 487  | similar-code, mass 66  | **Yes**                                                                      |
| [r3638371019](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638371019) | `corpus/application/TextService.ts`      | 503  | similar-code, mass 66  | **Yes**                                                                      |
| [r3638370985](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638370985) | `common/hooks/usePromiseEffect.test.tsx` | 52   | similar-code, mass 120 | **No — see Finding 4.** Still flagged at head, mass 98                       |
| [r3638370997](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638370997) | `common/hooks/usePromiseEffect.test.tsx` | 101  | similar-code, mass 120 | **No — see Finding 4**                                                       |

> The GitHub resolution state is misleading on the last two. They were auto-resolved as
> _outdated_ when the line moved, not because the duplication was removed.

**General / issue comments: 0.**

**sourcery-ai: no reviews, no comments, no check runs on this PR.** There is no sourcery
configuration in the repo (`.github/` contains only `copilot-instructions.md` and
`workflows/`). Nothing to gather; nothing outstanding.

### Checks on head `1b0fe6b2`

| Check                          | App            | Conclusion |
| ------------------------------ | -------------- | ---------- |
| GitGuardian Security Checks    | gitguardian    | success    |
| GitGuardian scan               | github-actions | success    |
| GitGuardian scan               | github-actions | success    |
| `qlty check` (combined status) | qlty           | success    |

**Nothing else ran — see Finding 1.** No `CI` job, no CodeQL. `main.yml` and
`codeql-analysis.yml` are gated on `pull_request: branches: [master]`, and this PR targets
`chore/ts7-tsconfig-migration`.

### Local gate results (head `1b0fe6b2`)

| Gate                                          | Result                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `yarn tsc`                                    | **pass** (exit 0, 54.8 s)                                                                      |
| `yarn lint`                                   | **pass** (exit 0, 38.6 s — eslint + stylelint)                                                 |
| `yarn test --watchAll=false`                  | **pass** — 402/402 suites, 3569 passed, 2 skipped, 50 snapshots, 335 s                         |
| Console-clean                                 | **pass** — zero `console.*`, `Warning:`, act warnings or unhandled rejections in the whole run |
| 250-line ceiling on PR-touched files          | **pass** — intersecting the over-250 list with the changed-file list returns zero rows         |
| `qlty check` on the 385 changed source files  | **pass** — no issues                                                                           |
| `qlty smells` on the 385 changed source files | **fail** — see Finding 3                                                                       |

---

## Findings

### Severity legend

**Blocker** — cannot approve · **Major** — must fix before merge · **Minor** — should fix ·
**Nit** — optional.

---

### Finding 1 — CI has never run on this PR — **Blocker** (carried over, still open)

**Category**: process / verification
**File**: [.github/workflows/main.yml:3-7](.github/workflows/main.yml#L3-L7)

```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

PR #774 targets `chore/ts7-tsconfig-migration`, so neither `CI` (lint → tsc → test → build)
nor CodeQL has been triggered on any commit of this branch. The only checks on the head SHA
are three GitGuardian runs and the qlty status. A green check list on this PR therefore says
nothing about whether the code compiles, lints, or passes its tests.

For a 408-file, +20k/−13.8k change that removes a promise library and rewrites cancellation
across the whole application, that is the single largest risk on the PR.

**Severity**: Blocker.

**Reproduction steps**

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/1b0fe6b2.../check-runs" \
  | python3 -c "import json,sys; [print(c['name']) for c in json.load(sys.stdin)['check_runs']]"
# → GitGuardian Security Checks / GitGuardian scan / GitGuardian scan
```

**Recommendation**

Merge #773 and re-target #774 to `master`, then let CI and CodeQL run green and link the runs
on the PR. Separately — and worth doing regardless — widen the triggers to
`pull_request: branches: ['**']` so stacked PRs can never merge without CI having run.

---

### Finding 2 — the only human review is an unresolved `CHANGES_REQUESTED` — **Blocker**

**Category**: process

`Fabdulla1`'s review of 2026-08-04 (commit `5ef4a984`) is still the effective review decision
on the PR. Its technical content has since been addressed at head `1b0fe6b2` (see the
verification table below), but the review itself has not been dismissed or converted, so
`reviewDecision` is still `CHANGES_REQUESTED`.

| Reviewer's point                                                          | Status at `1b0fe6b2`       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runWrite` can abort an already-dispatched server write                   | **Fixed**                  | [usePromiseEffect.ts:33-37](src/common/hooks/usePromiseEffect.ts#L33-L37) — `runWrite` now takes a `WriteOperation` and hands it an `isStale()` predicate from [SupersedableOperation](src/common/utils/SupersedableOperation.ts), a monotonic token with no `AbortController` in sight. No signal can reach a write's `fetch`.                                                                                                       |
| All four flagged call sites                                               | **Fixed**                  | [DateSelectionMethods.ts:42-57](src/chronology/application/DateSelectionMethods.ts#L42-L57), [ChapterEditView.tsx:80-92](src/corpus/ui/ChapterEditView.tsx#L80-L92), [ScriptSelection.tsx:136-150](src/fragmentarium/ui/info/ScriptSelection.tsx#L136-L150), [CuneiformFragment.tsx:152-166](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L152-L166) — each guards both the resolve and the reject arm with `if (!isStale())`. |
| The supersession test asserted the wrong guarantee for `runWrite`         | **Fixed**                  | [usePromiseEffect.test.tsx:88-94](src/common/hooks/usePromiseEffect.test.tsx#L88-L94) — the abort-on-supersede case is now `describe('run')` only.                                                                                                                                                                                                                                                                                    |
| "Add an integration-level test reaching a mocked ApiClient or fetch"      | **Fixed**                  | [usePromiseEffect.write.integration.test.tsx](src/common/hooks/usePromiseEffect.write.integration.test.tsx) drives a component → `runWrite` → real `ApiClient` → mocked `fetch`.                                                                                                                                                                                                                                                      |
| "…and separately prove that stale results cannot update current UI state" | **Fixed**                  | Two distinct tests: _"A superseding write does not abort the first write in flight"_ (line 86) and _"A superseded write cannot overwrite the current UI state"_ (line 98).                                                                                                                                                                                                                                                            |
| Seven files over the 250-line ceiling                                     | **Fixed for `.ts`/`.tsx`** | `FragmentService.ts` 888→94, `FragmentRepository.ts` 787→128, `TextService.ts` 597→70, `FakeApi.ts` 516→190, `SignImages.tsx` 442→91, `withData.test.tsx` 264→207. `Realia.sass` is 453 — but the gate as written covers `.ts`/`.tsx` script files, so this is out of scope.                                                                                                                                                          |

**Severity**: Blocker — a `CHANGES_REQUESTED` review is by definition blocking until dismissed.

**Recommendation**

Re-request review from `Fabdulla1`, pointing at the four commits that address each point
(`5ef4a984`, `b744a49b`, `c563799d`, `1b0fe6b2`). _No reviewer assignment was changed as part
of this review._

---

### Finding 3 — the 250-line splits reintroduced duplication — **Major** (new)

**Category**: DRY hard gate
**Files**: three file/sibling pairs, all created by this PR's Finding 6 remediation

`qlty smells` scoped to the 385 changed source files reports duplication that did **not** exist
in the base branch. In each case a file was split to get under 250 lines and the shared
fixture or setup was _copied_ into the new sibling rather than extracted:

| Pair                                                                                                                                                                           | Duplicated                                                | Mass | Base state                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---: | -------------------------------------------------- |
| [withData.test.tsx:34](src/http/withData.test.tsx#L34) ↔ [withData.filtering.test.tsx:32](src/http/withData.filtering.test.tsx#L32)                                            | 28 **identical** lines — the whole `beforeEach` harness   |  141 | one 244-line file                                  |
| [SignImages.test.tsx:17](src/signs/ui/display/SignImages.test.tsx#L17) ↔ [SignImages.empty.test.tsx:16](src/signs/ui/display/SignImages.empty.test.tsx#L16)                    | 48 **identical** lines — the `croppedAnnotations` fixture |  138 | one 258-line file                                  |
| [SearchForm.testSupport.tsx:36](src/fragmentarium/ui/SearchForm.testSupport.tsx#L36) ↔ [ColophonEditor.test.tsx:15](src/fragmentarium/ui/fragment/ColophonEditor.test.tsx#L15) | 30 **identical** lines — the `provenances` fixture        |   82 | fixture existed once, in `ColophonEditor.test.tsx` |

The third is the most pointed: a `testSupport` module was created for exactly this purpose and
then a second verbatim copy of the fixture was left behind in `ColophonEditor.test.tsx`.

This is not a style preference — the project instructions make DRY a hard gate ("if the same
domain logic or mapping appears in more than one place, extract and reuse a shared helper
before finalizing"), and satisfying the 250-line gate by duplicating is the one way of meeting
it that the instructions rule out.

The PR already does this correctly elsewhere: `FragmentService.testSupport.ts` (138 lines) is
shared by twelve `FragmentService.*.test.ts` files with no duplication flagged.

**Severity**: Major — a hard gate is violated, and the fix is mechanical.

**Reproduction steps**

```bash
git diff --name-only --diff-filter=d origin/chore/ts7-tsconfig-migration...HEAD -- 'src/*' > /tmp/changed.txt
qlty smells $(tr '\n' ' ' < /tmp/changed.txt)
```

**Recommendation**

Extract each duplicated block into the sibling `*.testSupport.ts(x)` module the split already
implies — `withData.testSupport.tsx` for the shared `beforeEach`, `SignImages.testSupport.ts`
for `croppedAnnotations` — and have `ColophonEditor.test.tsx` import `provenances` from
`SearchForm.testSupport.tsx` (or move it to a neutral fixtures module, since the two consumers
are in different feature folders).

---

### Finding 4 — `usePromiseEffect.test.tsx` duplication was never actually fixed — **Minor** (new)

**Category**: DRY / stale review state
**File**: [src/common/hooks/usePromiseEffect.test.tsx:40-86](src/common/hooks/usePromiseEffect.test.tsx#L40-L86)

`renderReads` and `renderWrites` are a 23-line near-identical pair: the same four destructured
options, the same option type, the same loop and the same `cancelAfterRun` branch. They differ
only in which tuple slot they pull off `usePromiseEffect()` and the operation's type.

qlty raised this on commit `01e61b13` at mass 120; at head it is still raised, at mass 98. The
two GitHub threads show `isResolved=true`, but they were resolved as _outdated_ because the
lines moved — the duplication is still there.

**Severity**: Minor — test-only, but it is a live qlty finding presenting as a closed one.

**Reproduction steps**

`qlty smells src/common/hooks/usePromiseEffect.test.tsx` → two blocks, mass 98.

**Recommendation**

Collapse into one `renderUsingHook({ select, operation, runCount, cancelAfterRun, results })`
where `select` picks `run` or `runWrite` off the tuple.

---

### Finding 5 — vestigial `AbortSignal` in the `onSave` contract — **Minor** (new)

**Category**: API design / correctness
**File**: [src/fragmentarium/ui/fragment/CuneiformFragment.tsx:31](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L31)

```ts
onSave: (save: (signal?: AbortSignal) => Promise<Fragment>) => void
```

Nothing supplies that signal and nothing reads it. It is the last trace of the abort-based
write design that Finding 1 of the previous review removed. The sibling declaration in
[Info.tsx:29](src/fragmentarium/ui/info/Info.tsx#L29) is already correct
(`(save: () => Promise<Fragment>) => void`), and the actual implementation
([CuneiformFragment.tsx:147](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L147)) takes
no signal either.

This matters more than a dead parameter usually would: the whole point of the fix is that the
type system now forbids threading a signal into a write. This declaration advertises the
opposite, and a future contributor could reasonably start passing one.

**Severity**: Minor — no defect today; it undermines the type-level guarantee the fix relies on.

**Reproduction steps**

`grep -rn AbortSignal src/fragmentarium/ui/fragment/CuneiformFragment.tsx` → one hit, the prop
type. No call site supplies an argument.

**Recommendation**

Drop the parameter: `onSave: (save: () => Promise<Fragment>) => void`.

---

### Finding 6 — the `isStale` guard is copy-pasted across all four write consumers — **Minor** (new)

**Category**: DRY
**Files**: [DateSelectionMethods.ts:42-57](src/chronology/application/DateSelectionMethods.ts#L42-L57),
[ChapterEditView.tsx:80-92](src/corpus/ui/ChapterEditView.tsx#L80-L92),
[ScriptSelection.tsx:136-150](src/fragmentarium/ui/info/ScriptSelection.tsx#L136-L150),
[CuneiformFragment.tsx:152-166](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L152-L166)

All four write sites are the same shape:

```ts
runWrite((isStale) =>
  promise.then(
    (result) => {
      if (!isStale()) {
        /* success */
      }
    },
    (error) => {
      if (!isStale()) {
        /* failure */
      }
    },
  ),
)
```

Below the mass threshold qlty flags, but it is the same domain logic — "apply this result only
if it is still current" — written out four times. Each site is one forgotten `if (!isStale())`
away from reintroducing exactly the stale-overwrite bug the design is meant to prevent.

**Severity**: Minor.

**Recommendation**

Add a sibling to `runWrite` that takes the callbacks and applies the freshness check itself,
e.g. `runWriteThen(operation, { onSuccess, onError })`, so no consumer has to remember the
guard. Keep the raw `runWrite` for cases that need custom control.

---

### Finding 7 — new files use relative imports against the project standard — **Minor** (new)

**Category**: coding standards
**Files**: 11 of the 134 `.ts`/`.tsx` files **added** by this PR

The project standard is "always use full import paths (for example `common/useObjectUrl`)
instead of local relative paths like `./useObjectUrl` whenever module aliases are available."
These newly-added files use `./`:

| File                                                                                                     | Import                    |
| -------------------------------------------------------------------------------------------------------- | ------------------------- |
| [SupersedableOperation.test.ts:1](src/common/utils/SupersedableOperation.test.ts#L1)                     | `./SupersedableOperation` |
| [abortError.test.ts:1](src/common/utils/abortError.test.ts#L1)                                           | `./abortError`            |
| [AbortableOperation.test.ts:1](src/common/utils/AbortableOperation.test.ts#L1)                           | `./AbortableOperation`    |
| [ConcurrencyLimiter.cancellation.test.ts:1](src/common/utils/ConcurrencyLimiter.cancellation.test.ts#L1) | `./ConcurrencyLimiter`    |
| [TextReadService.ts:10](src/corpus/application/TextReadService.ts#L10)                                   | `./dtos`                  |
| [TextServiceBase.ts:11](src/corpus/application/TextServiceBase.ts#L11)                                   | `./dtos`                  |
| [TextServiceCore.ts:18](src/corpus/application/TextServiceCore.ts#L18)                                   | `./dtos`                  |
| [Chapters.test.tsx:5](src/corpus/ui/Chapters.test.tsx#L5)                                                | `./Chapters`              |
| [withData.filtering.test.tsx:3](src/http/withData.filtering.test.tsx#L3)                                 | `./withData`              |
| [DateSelectionMethods.test.ts:1](src/chronology/application/DateSelectionMethods.test.ts#L1)             | `./DateSelectionMethods`  |
| [PdfDownloadButton.test.tsx:7](src/fragmentarium/ui/fragment/PdfDownloadButton.test.tsx#L7)              | `./PdfExport`             |

Relative imports are widespread in the pre-existing codebase (91 changed files contain them),
so this is only actionable for the files this PR _creates_ — those had a free choice.

**Severity**: Minor.

**Recommendation**

Convert the eleven new files to alias paths. Leave pre-existing relative imports alone; a
codebase-wide sweep does not belong in this PR.

---

### Finding 8 — smaller observations — **Nit**

| #   | File                                                                                                                                                                                            | Note                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8a  | [src/realia/ui/Realia.sass](src/realia/ui/Realia.sass)                                                                                                                                          | 453 lines, named in the reviewer's list. The 250-line gate as written covers `.ts`/`.tsx` script files, so this is arguably out of scope — but it was raised and should be answered explicitly rather than silently skipped. (`Introduction.sass` is 727 and `about/ui/project.sass` 261; neither is touched by this PR.)                                  |
| 8b  | [src/fragmentarium/application/FragmentCache.ts](src/fragmentarium/application/FragmentCache.ts) (247) and [FragmentReadService.ts](src/fragmentarium/application/FragmentReadService.ts) (241) | Within three and nine lines of the ceiling. Any follow-up touching them will breach it.                                                                                                                                                                                                                                                                    |
| 8c  | [src/http/withData.tsx:60-62](src/http/withData.tsx#L60-L62)                                                                                                                                    | On unmount the cleanup aborts the controller but `requestSequence` is not bumped, so a getter that ignores the signal can still `setData` on an unmounted component. Harmless under React 18 (no warning, no leak), and the previous review correctly withdrew the "add `!signal.aborted`" fix as breaking. Noted only so the asymmetry is a known choice. |
| 8d  | `yarn.lock`                                                                                                                                                                                     | `bluebird@3.7.2` is still resolved, as a transitive dependency of `bfj@7.1.0` (a `react-scripts` bundle-analyzer dependency). Application code and `package.json` are clean; nothing to do, but worth stating so "bluebird is still in the lockfile" is not later mistaken for an incomplete removal.                                                      |
| 8e  | 13 `TASK-*.md` files at the repo root                                                                                                                                                           | Tracking artefacts must be deleted before merge — see item 7 of _What Has To Be Done_.                                                                                                                                                                                                                                                                     |

---

## Severity

| Severity    | Count | Findings                                                                                                                              |
| ----------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Blocker** |     2 | 1 (CI never ran), 2 (unresolved `CHANGES_REQUESTED`)                                                                                  |
| **Major**   |     1 | 3 (splits reintroduced duplication)                                                                                                   |
| **Minor**   |     4 | 4 (`usePromiseEffect.test.tsx` duplication), 5 (vestigial `AbortSignal`), 6 (`isStale` copy-paste), 7 (relative imports in new files) |
| **Nit**     |     1 | 8 (a–e)                                                                                                                               |

Both blockers are process items outside the diff. Every code-level blocker and major finding
from the previous review is verified closed at this head.

---

## Reproduction Steps

Per-finding steps are inline above. Consolidated:

```bash
# Reviews, comments, thread resolution status (gh is not installed; use the API directly)
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/pulls/774/reviews"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/pulls/774/comments"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/issues/774/comments"     # → []
# GraphQL reviewThreads { isResolved isOutdated } for the resolved-vs-outdated distinction

# Checks on the head SHA  (Finding 1)
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/commits/1b0fe6b2.../check-runs"

# Hard gates
yarn tsc                                  # pass
yarn lint
CI=true yarn test --watchAll=false        # run alone: concurrent tsc/qlty OOMs the 8 GB container

# 250-line gate, intersected with the PR's changed files
git diff --name-status origin/chore/ts7-tsconfig-migration...HEAD -- 'src/*' > /tmp/ns.txt
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | awk '$1>250 && $2!="total"{print $2}' \
  | while read f; do grep -q "	$f$" /tmp/ns.txt && echo "TOUCHED: $f"; done   # → no output

# qlty  (Findings 3, 4)
git diff --name-only --diff-filter=d origin/chore/ts7-tsconfig-migration...HEAD -- 'src/*' > /tmp/changed.txt
qlty check --no-fix $(tr '\n' ' ' < /tmp/changed.txt)   # no issues
qlty smells         $(tr '\n' ' ' < /tmp/changed.txt)   # duplication blocks above
```

---

## Recommendation

**Do not approve yet — but the remaining work is small and mostly not code.**

The engineering on this PR is sound. The write-cancellation defect was fixed at the design
level (a supersession token instead of a weakened abort), the fix is enforced by the type
system rather than by convention, the README states the read/write/shared-cache rules
explicitly, and `ConcurrencyLimiter`'s cancellation handling is genuinely careful — the abort
listener is detached on slot grant, `createReleaseSlot` is idempotent, and the queued-abort /
slot-handoff race has its own test. The 250-line decomposition was carried out across 35 files
without behaviour change.

**Before approval**

1. Get the PR through a real CI run (Finding 1). Nothing else on this list matters as much:
   a 408-file rewrite of application-wide cancellation has never been compiled, linted or
   tested by CI.
2. Have `Fabdulla1` re-review and dismiss or convert the `CHANGES_REQUESTED` (Finding 2). The
   technical content is addressed; the review state is not.

**Before merge**

3. Close the duplication the splits introduced (Finding 3) — three extractions, mechanical.
4. Fix Findings 4–7: collapse `renderReads`/`renderWrites`, drop the vestigial `AbortSignal`
   from `onSave`, factor the `isStale` guard, convert the eleven new files to alias imports.
5. Delete all 13 `TASK-*.md` files.

**Follow-up issues, not this PR**

6. The 54 pre-existing over-250-line files (all inherited from `chore/ts7-tsconfig-migration`;
   this PR does not touch a single one).
7. `Realia.sass` and the other over-length `.sass` files, if the ceiling is meant to cover them.
8. Widening `main.yml` to `pull_request: branches: ['**']`.

---

## Comment status tracking

| Thread                          | Author    | Resolved on GitHub | Actually addressed                     | Outdated                 |
| ------------------------------- | --------- | ------------------ | -------------------------------------- | ------------------------ |
| `TextService.ts:394`            | qltysh    | yes                | **yes**                                | yes                      |
| `TextService.ts:412`            | qltysh    | yes                | **yes**                                | yes                      |
| `TextService.ts:487`            | qltysh    | yes                | **yes**                                | yes                      |
| `TextService.ts:503`            | qltysh    | yes                | **yes**                                | yes                      |
| `usePromiseEffect.test.tsx:52`  | qltysh    | yes                | **no — Finding 4**                     | yes                      |
| `usePromiseEffect.test.tsx:101` | qltysh    | yes                | **no — Finding 4**                     | yes                      |
| Review `CHANGES_REQUESTED`      | Fabdulla1 | **no**             | technical content yes; review state no | review was on `5ef4a984` |

Unresolved: **1** (Fabdulla1's review state). Resolved-but-not-fixed: **2**.

---

## Remediation status (2026-08-06, uncommitted on `chore/remove-bluebird`)

Every code-level finding below was subsequently **fixed** at the user's request. The two
blockers are maintainer actions and were deliberately left alone: no reviewer assignment was
changed and nothing was posted to GitHub.

| Finding                                     | Status                                                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — CI never ran                            | **Not fixable here.** Requires merging #773 and re-targeting the PR.                                                                                                                                                     |
| 2 — unresolved `CHANGES_REQUESTED`          | **Not fixable here.** Requires `Fabdulla1` to re-review.                                                                                                                                                                 |
| 3 — splits reintroduced duplication         | **Fixed.** Three shared modules extracted: `http/withData.testSupport.tsx`, `signs/ui/display/SignImages.testSupport.tsx`, `test-support/provenance-records.ts`. `qlty smells` no longer reports any of the three pairs. |
| 4 — `usePromiseEffect.test.tsx` duplication | **Fixed.** `renderReads`/`renderWrites` collapsed onto one `renderRuns({ select, … })`; both names survive as one-line wrappers so no call site changed. qlty clean.                                                     |
| 5 — vestigial `AbortSignal`                 | **Fixed.** `onSave: (save: () => Promise<Fragment>) => void`.                                                                                                                                                            |
| 6 — copy-pasted `isStale` guard             | **Fixed.** New `common/utils/applyWhenCurrent.ts` (100 % on every metric, 6 tests); all four consumers pass `onSuccess`/`onError` handlers.                                                                              |
| 7 — relative imports in new files           | **Fixed.** All eleven converted, plus two files edited anyway.                                                                                                                                                           |
| 8a — `Realia.sass`                          | **Fixed.** Split into six partials (largest 189 lines); compiled before/after with `sass` and diffed — **byte-identical CSS** — and `yarn build` passes.                                                                 |
| 8b — files near the ceiling                 | No action; informational.                                                                                                                                                                                                |
| 8c — `withData` unmount asymmetry           | No action; the previous review correctly withdrew the "fix" as breaking.                                                                                                                                                 |
| 8d — `bluebird` in `yarn.lock`              | No action; transitive dependency of `bfj`, build-time only.                                                                                                                                                              |
| 8e — `TASK-*.md` files                      | Still present — they are this task's live working documents. Delete before merge.                                                                                                                                        |

### Coverage improved by the Finding 6 fix

Moving the `if (!isStale())` guard into one unit-tested helper closed the two residuals the
first review had documented as structurally unreachable:

| File                    | Before                  | After                                                                                            |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `ScriptSelection.tsx`   | 100 stmts / 87.5 branch | **100 / 100 / 100 / 100**                                                                        |
| `ChapterEditView.tsx`   | 97.91 stmts / 50 branch | 97.67 stmts / **100 branch** (remaining line is the unchanged `searchBibliography` pass-through) |
| `CuneiformFragment.tsx` | 100 / 100               | **100 / 100 / 100 / 100**                                                                        |
| `applyWhenCurrent.ts`   | —                       | **100 / 100 / 100 / 100**                                                                        |

### One finding this review under-scoped

Re-running `qlty smells` after the fixes and comparing against a **base-branch worktree**
showed one duplication I had not reported: `ArchaeologyEditorFields.tsx`'s
`RegularExcavationField` and `FindspotUncertainField` are 20-line near-identical components
(mass 91), flagged at head but not at base — the split turned inline JSX into two exported
components and made it visible. **Fixed** by collapsing both onto a private `CheckboxField`
and keeping the two exports as thin wrappers, so consumers are untouched.

All other `qlty smells` findings on changed files were verified against the base-branch
worktree and are **pre-existing with identical mass** — `ManuscriptForm.tsx`,
`DossiersSearchPage.tsx`, `Download.test.tsx`, `ApiClient.test.ts` (16 lines/mass 69 at base,
now 15/66), `WordDisplay.testSupport.ts` (relocated verbatim from `WordDisplay.test.tsx`),
`DetailsFields.tsx` (`Joins` complexity 22, relocated from `Details.tsx`), `setupTests.ts`,
`SignsSearch.tsx`, `test-support/utils.ts`, `GlossaryFactory.ts`. They belong in the follow-up
issue with the 54 pre-existing over-250-line files.

### Pre-existing defect found and fixed during remediation

`CuneiformFragment.tsx:145` declared `const [error, setError] = useState(null)`, which
TypeScript infers as `useState<null>` — the state could never legally hold an `Error`. It
compiled only because the old untyped `.catch((error) => …)` fed it `any`. Typing
`applyWhenCurrent`'s error handler surfaced `TS2345`. Fixed at root with
`useState<Error | null>(null)`, matching the component's own `error: Error | null` prop.

---

## What Has To Be Done

Blockers are marked **[BLOCKER]** — the PR cannot be approved while any remain.
Items 3–7 and 9 below are now **done**; they are kept for traceability.

1. **[BLOCKER]** Merge #773, re-target #774 to `master`, and let `CI` (lint → tsc → tests →
   build) and CodeQL run green on the head commit. Link the runs on the PR.
   ([.github/workflows/main.yml:3-7](.github/workflows/main.yml#L3-L7))
2. **[BLOCKER]** Re-request review from `Fabdulla1` and get the `CHANGES_REQUESTED` review
   dismissed or converted to an approval, citing commits `5ef4a984`, `b744a49b`, `c563799d`
   and `1b0fe6b2` against the five points of that review. _(No reviewer assignment was changed
   by this review.)_
3. **[Major]** Remove the duplication the 250-line splits introduced (Finding 3):
   - extract the shared 28-line `beforeEach` from
     [withData.test.tsx](src/http/withData.test.tsx) and
     [withData.filtering.test.tsx](src/http/withData.filtering.test.tsx) into a
     `withData.testSupport.tsx` sibling;
   - extract the 48-line `croppedAnnotations` fixture shared by
     [SignImages.test.tsx](src/signs/ui/display/SignImages.test.tsx) and
     [SignImages.empty.test.tsx](src/signs/ui/display/SignImages.empty.test.tsx);
   - delete the duplicate `provenances` fixture in
     [ColophonEditor.test.tsx:15](src/fragmentarium/ui/fragment/ColophonEditor.test.tsx#L15)
     and import it from a shared module.
4. Collapse `renderReads` / `renderWrites` in
   [usePromiseEffect.test.tsx:40-86](src/common/hooks/usePromiseEffect.test.tsx#L40-L86) into
   one parameterised helper — this is a live qlty finding whose GitHub thread only _looks_
   resolved (Finding 4).
5. Drop the unused `signal?: AbortSignal` parameter from the `onSave` prop type at
   [CuneiformFragment.tsx:31](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L31)
   (Finding 5).
6. Factor the repeated `if (!isStale())` result-application guard shared by the four
   `runWrite` consumers into a helper next to `runWrite` (Finding 6).
7. Convert the eleven newly-added files listed in Finding 7 to module-alias imports.
8. **Delete every `TASK-*.md` file before merge** — 13 exist at the repo root:
   `TASK-774-{todo,log,review,continuation-prompt}.md`,
   `TASK-remove-bluebird-{todo,log,review}.md`, `TASK-address-findings-{todo,log}.md`,
   `TASK-ts7-migration-{todo,log,research,review}.md`.
9. Answer the `Realia.sass` (453 lines) point from Fabdulla1's review explicitly — either
   split it or state on the PR that the 250-line gate covers `.ts`/`.tsx` only (Finding 8a).
10. Follow-up issues, **not** in this PR: the 54 pre-existing over-250-line files inherited
    from the base branch; widening `main.yml` to `pull_request: branches: ['**']`.

---

## Verification appendix — local gate evidence

_Filled in from the runs performed for this review at head `1b0fe6b2`, then re-run after remediation._

**At review time (head `1b0fe6b2`, before remediation):**

| Gate             | Command                                                                | Result                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `yarn tsc --noEmit`                                                    | **pass**, exit 0, 54.8 s                                                                                                               |
| Lint             | `yarn lint`                                                            | **pass**, exit 0, 38.6 s (eslint + stylelint)                                                                                          |
| Tests            | `CI=true yarn test --watchAll=false`                                   | **pass**, exit 0 — `Test Suites: 402 passed, 402 total` / `Tests: 2 skipped, 3569 passed, 3571 total` / `Snapshots: 50 passed` / 335 s |
| Console-clean    | grep the run for `console.*` / `Warning:` / act / unhandled rejections | **pass**, zero matches across all 402 suites                                                                                           |
| qlty check       | `qlty check --no-fix <385 changed files>`                              | **pass**, no issues                                                                                                                    |
| qlty smells      | `qlty smells <385 changed files>`                                      | **fail** — Finding 3 and Finding 4                                                                                                     |
| 250-line ceiling | intersect over-250 list with changed-file list                         | **pass**, zero PR-touched files over the limit                                                                                         |

**After remediation (all findings fixed):**

| Gate             | Command                                                         | Result                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `yarn tsc --noEmit`                                             | **pass**, exit 0                                                                                                                                                      |
| Lint             | `yarn lint`                                                     | **pass**, exit 0                                                                                                                                                      |
| Build            | `yarn build:ci-stable`                                          | **pass**, exit 0 — proves the new sass partials resolve in webpack, which no test would have caught                                                                   |
| Tests            | `CI=true yarn test --watchAll=false`                            | **pass**, exit 0 — `Test Suites: 403 passed, 403 total` / `Tests: 2 skipped, 3575 passed, 3577 total` / `Snapshots: 50 passed` / 316 s                                |
| Console-clean    | as above                                                        | **pass**, zero matches across all 403 suites                                                                                                                          |
| qlty check       | `qlty check --no-fix <390 changed files>`                       | **pass**, no issues                                                                                                                                                   |
| qlty smells      | `qlty smells <390 changed files>`                               | **pass** — every finding raised in this review is gone; the 15 that remain were each confirmed against a base-branch worktree as pre-existing with identical mass     |
| 250-line ceiling | as above                                                        | **pass**                                                                                                                                                              |
| Coverage         | scoped `--coverage` runs, two small batches                     | `applyWhenCurrent.ts`, `usePromiseEffect.ts`, `ScriptSelection.tsx`, `CuneiformFragment.tsx` at 100 % on every metric; `ChapterEditView.tsx` 97.67 stmts / 100 branch |
| Sass equivalence | `sass --load-path=. Realia.sass` before vs after, `diff`        | **byte-identical CSS**                                                                                                                                                |
| No test lost     | test titles diffed against `HEAD` for the four rewritten suites | **identical sets**                                                                                                                                                    |

The suite count rose 402 → 403 because of the new `applyWhenCurrent.test.ts`; test count rose
3569 → 3575 (six new tests, nothing removed).

The whole suite runs in a single invocation on this machine (~320 s) — the earlier note about
needing four directory chunks no longer applies, provided nothing else runs concurrently.

**On the 2 skipped tests:** both are `xit` in
[Edition.test.tsx:48,52](src/fragmentarium/ui/edition/Edition.test.tsx#L48) and both are
pre-existing — they are present at the same positions on `chore/ts7-tsconfig-migration`. This
PR modifies that file but did not introduce or extend the skips. No action required here;
worth a separate issue.

**Note on running the suite in this devcontainer:** the machine has 2 CPUs and ~8 GB RAM with
roughly 2 GB free. Full-suite runs were killed twice ("The build failed because the process
exited too early") when `yarn tsc`, `yarn build` or `qlty` ran concurrently. Run the suite
alone. The same applies to `--coverage` over a large path set: a coverage run across all of
`fragmentarium` + `chronology` failed `FragmentView.test.tsx` with 13 unresolved spinners,
which was then reproduced on a **stashed, pristine `HEAD`** tree — it is the OOM killer, not a
defect. Measure coverage in small batches.

_Nothing was posted to GitHub as part of this review, and no reviewer assignments were changed._
