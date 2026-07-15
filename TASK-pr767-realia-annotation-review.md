# TASK-pr767-realia-annotation-review

Review of **PR #767 — "Add realia annotation layer to named entity annotation"**
Branch `add-realia-annotation` → `master`. Head at review time `0f83539c`.
Reviewed against `.github/copilot-instructions.md` (Data Architecture, API Call Efficiency, Coding
Standards, Review Guidelines).

> **Status: all findings resolved in the working tree.** `yarn lint` ✅ · `yarn tsc` ✅ · affected
> suites (`text-annotation`, `realia`, `text-line`) — **46 suites / 443 tests pass, zero console
> output, snapshots intact** ✅. Changes are staged/working-tree only; nothing has been committed.

## Summary

Adds a **realia** annotation layer alongside the existing **named-entity** layer in the fragment
text annotator, plus a read-only annotation preview on the fragment display (90 files,
+6707/−911 against `origin/master`). The change is large but well-structured and heavily tested.

The two central audit gates are met to a high standard:

- **Data architecture (distinct kinds held apart):** named-entities and realia are kept as two
  separate collections end-to-end — API DTO (`AnnotationSpans`), reducer state
  (`DerivedAnnotationSpans`), component props, lookups, dedup keys, id generation, and the outbound
  payload. Each kind has its own type with its own **required** discriminating field
  (`type` vs `realiaId`) and its own `layer` literal; the union is narrowed by a real type guard
  (`isRealiaAnnotationSpan`) with both branches narrowing and no cross-kind `as` casts. Derived
  display fields (`tier`, `name`, `layer`) are stripped by a single helper
  (`omitDerivedSpanFields`) and the outbound shape is pinned by a test. Embedded realia display
  data (`fragment.realiaInfo`) is inbound-only and never echoed back. Explicit negative
  separation tests exist.
- **API call efficiency:** realia display titles are **embedded** in the fragment response and read
  from a lookup (the `0f83539c` commit removed an earlier per-id N+1). The realia autocomplete
  (`RealiaSelect`) is debounced (300 ms), skips empty queries, and cancels superseded work on
  unmount. The read-only preview reads from context built once per fragment — no per-token,
  per-hover, or per-toggle fetching. The fragment/annotation loads are now issued concurrently
  (see F4).

No human reviewer requested changes; the only pre-existing feedback was from `qltysh[bot]`.

## Findings (all resolved)

### F1 — 250-line file ceiling exceeded (PR-introduced) · Severity: Medium · **Resolved**

`SpanAnnotator.test.tsx` (348) and `TextAnnotationContext.test.tsx` (315, new) exceeded the 250-line
hard gate.

**Fix:** split each into focused sibling suites with a shared test-support module; all resulting
files are well under 250 lines:

| File                                                                     | Lines |
| ------------------------------------------------------------------------ | ----- |
| `SpanAnnotator.test.tsx` (core render + automatic tagging)               | 170   |
| `SpanAnnotator.uniqueness.test.tsx` (uniqueness + `clearSelection`)      | 120   |
| `spanAnnotator.testSupport.tsx` (shared fixtures + `setupSpanAnnotator`) | 71    |
| `TextAnnotationContext.layers.test.tsx` (layer separation)               | 164   |
| `TextAnnotationContext.uniqueness.test.tsx` (uniqueness)                 | 151   |
| `textAnnotationContext.testSupport.ts` (shared fixtures)                 | 31    |

The original `TextAnnotationContext.test.tsx` was removed (`git rm`). Behaviour is identical; the
`SpanAnnotator` snapshot key was preserved by keeping the `describe('SpanAnnotator')` /
`'shows the selection menu'` test in a file still named `SpanAnnotator.test.tsx`.

### F2 — qlty "similar-code" in test (DRY) · Severity: Low · **Resolved**

The four mirrored realia/tag add & delete tests (qlty threads at old lines 105/121/157/175) were
collapsed into two `it.each` scenario tables (`addScenarios`, `deleteScenarios`) in
`TextAnnotationContext.layers.test.tsx`, keeping both per-kind assertions without the boilerplate.
The four bot threads point at the now-deleted `TextAnnotationContext.test.tsx` and are therefore
moot/outdated.

### F3 — qlty "complex binary expression" · Severity: Low · **Resolved**

`matches()` in `cssCascade.testSupport.ts` was a 5-clause boolean AND. Refactored into named
predicates (`includesAll`, `matchesPseudoElement`) and a `checks.every(...)` list, removing the
complex binary expression the bot flagged.

### F4 — Loader issued two independent fetches sequentially · Severity: Low (pre-existing) · **Resolved**

`TextAnnotation.tsx` chained `find(number).then(() => fetchNamedEntityAnnotations(number))`. The two
requests are independent, so they are now issued concurrently via Bluebird `Promise.all`, saving a
round-trip on page load. (Per the copilot instructions, pre-existing issues are fixed at root cause,
not deferred.)

### F5 — Task scratch files committed to the branch · Severity: Low (process) · **Deferred to merge**

Per the copilot Review Guidelines these files are only _reminded_ for removal before merge, and at the
user's request they are **retained** (the earlier `git rm` was reverted). All `TASK-*.md` files — the
prior-task docs, this review, and the `TASK-pr767-address-findings-*` todo/log — **must be removed
before the PR is merged.**

## Severity

| ID  | Finding                                  | Severity | Status   |
| --- | ---------------------------------------- | -------- | -------- |
| F1  | Two PR files over the 250-line hard gate | Medium   | Resolved |
| F2  | qlty similar-code in test (DRY)          | Low      | Resolved |
| F3  | qlty complex boolean in test-support     | Low      | Resolved |
| F4  | Sequential independent fetches           | Low      | Resolved |
| F5  | Task scratch `.md` files committed       | Low      | Resolved |

No High/critical correctness, regression, security, or coverage findings. No console noise.

## Reproduction Steps (as originally found)

- **F1:** line count of changed `.tsx` files showed `SpanAnnotator.test.tsx` (348, was 69) and
  `TextAnnotationContext.test.tsx` (315, new) over 250.
- **F2/F3:** GitHub PR #767 unresolved `qltysh[bot]` inline comments.
- **F4:** `TextAnnotation.tsx` `withData` loader chained the two `fragmentService` calls; the same
  chaining pre-existed on `master`.
- **F5:** `ls TASK-*.md`.

Gate verification after fixes: `yarn lint` (exit 0), `yarn tsc` (exit 0),
`npx craco test --watchAll=false --runInBand src/fragmentarium/ui/text-annotation src/realia
src/transliteration/ui/text-line.test` → 46 suites / 443 tests pass, 0 console output, 4 snapshots
pass.

## Comment Status Tracking

| Thread     | File:Line                          | Author      | Original state | Now                                        |
| ---------- | ---------------------------------- | ----------- | -------------- | ------------------------------------------ |
| 3571944976 | TextAnnotationContext.test.tsx:105 | qltysh[bot] | Unresolved     | Moot — file split/removed; addressed by F2 |
| 3571944982 | TextAnnotationContext.test.tsx:121 | qltysh[bot] | Unresolved     | Moot — file split/removed; addressed by F2 |
| 3571944987 | TextAnnotationContext.test.tsx:157 | qltysh[bot] | Unresolved     | Moot — file split/removed; addressed by F2 |
| 3571944991 | TextAnnotationContext.test.tsx:175 | qltysh[bot] | Unresolved     | Moot — file split/removed; addressed by F2 |
| 3586742936 | cssCascade.testSupport.ts:110      | qltysh[bot] | Unresolved     | Addressed by F3 refactor                   |

Timeline review events: 2 × `COMMENTED` by `qltysh[bot]` (no body). No human `APPROVED` or
`CHANGES_REQUESTED`. No general/issue comments.

## Recommendation

**Approve.** The architecture is exactly what the Data Architecture and API Efficiency guidelines
call for, verified end-to-end, and all functional hard gates (lint, tsc, tests, console-clean,
snapshots) pass. All five findings have been resolved in the working tree.

## What Has To Be Done

1. ✅ **(F1)** Split the two over-limit test files into ≤250-line sibling suites — done; all files
   verified ≤170 lines; tests pass.
2. ✅ **(F2)** Collapse the mirrored realia/tag tests via `it.each` — done in
   `TextAnnotationContext.layers.test.tsx`.
3. ✅ **(F3)** Remove the complex boolean in `cssCascade.testSupport.ts` — done.
4. ✅ **(F4)** Parallelize the two independent loads in `TextAnnotation.tsx` with `Promise.all` —
   done.
5. ✅ **(F5)** Remove the seven prior-task `TASK-*.md` scratch files — done (staged).
6. ✅ **(Full suite + coverage)** Ran the full suite in 5 memory-bounded shards + `src/editor`
   (whole-repo single-process runs OOM at teardown on this box): all green, 0 failures, 0 console
   output, 0 crashes. **Every** `src/fragmentarium/ui/text-annotation` source file is now 100%
   stmts/branch/funcs/lines (added `getEntityTypeOption`, default-dispatch, selection-retry, Markable
   interaction, and AnnotationInstructions tests). `yarn lint` 0, `yarn tsc` 0.
7. **(User action)** Commit and push these working-tree changes (branch, not `master`), then on
   GitHub mark the five `qltysh[bot]` threads resolved. Remove the `TASK-*.md` files (this review +
   the `TASK-pr767-address-findings-*` todo/log) before merge.
8. No human reviewer has approved yet — re-request review after the push.
