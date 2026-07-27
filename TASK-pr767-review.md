# TASK-pr767 — Review: "Add realia annotation layer to named entity annotation" (PR #767)

- **PR**: [#767](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/767) — `add-realia-annotation` → `master`
- **Head reviewed**: `1070d896` ("Refresh the fragment after saving named-entity annotations")
- **Size**: 115 files, +12 626 / −5 976 (4 351 / 4 331 of those are the `Display.test.tsx` snapshot)
- **Reviewed**: 2026-07-27

## Summary

The PR adds a second annotation layer — **realia** — alongside the existing named-entity
tags, in both the editor (`text-annotation`) and a new read-only preview on the fragment
**Display** tab, and adds realia-id → lemma URL canonicalisation on the Realia page.

The architecture is sound and follows the repository's hard gates closely:

- **Two kinds held apart end-to-end.** `AnnotationSpans { namedEntities, realia }` stays two
  lists in the DTO ([FragmentRepository.tsx:113-118](src/fragmentarium/infrastructure/FragmentRepository.ts#L113-L118)),
  in reducer state ([TextAnnotationContext.tsx:18-38](src/fragmentarium/ui/text-annotation/TextAnnotationContext.tsx#L18-L38)),
  in props, and at render ([Markable.tsx:177-186](src/fragmentarium/ui/text-annotation/Markable.tsx#L177-L186)).
  Each kind has its own required-field type, its own duplicate key, and its own lookup; the
  single-value union narrows through a real guard (`isRealiaAnnotationSpan`) with no `as`
  cast across kinds.
- **One serialization boundary.** `omitDerivedSpanFields` is the only outbound builder and
  is pinned by [annotationSpan.test.ts:55-81](src/fragmentarium/ui/text-annotation/annotationSpan.test.ts#L55-L81).
  `realiaInfo` is inbound-only and never echoed back.
- **API efficiency.** Realia display titles are embedded in the fragment payload
  (`fragment.realiaInfo`) rather than fetched per id — no N+1. The preview toggle reads
  state only and issues no request. Realia search-as-you-type is debounced (300 ms), skips
  the empty query and cancels on unmount
  ([RealiaSelect.tsx:46-91](src/fragmentarium/ui/text-annotation/RealiaSelect.tsx#L46-L91)).
  The redirect path is served from the `RealiaService` cache, so `realia_x` → lemma costs
  one request, not two.

Gates run locally on `1070d896`, and again after the fixes below: `yarn lint` clean,
`yarn tsc` clean, full Jest suite green and console-clean, 100 % coverage of the affected
code (details under **Verification** below).

What blocked approval was never the design: an unresolved `CHANGES_REQUESTED` review, a
backend contract this branch cannot ship without, and the `TASK-*.md` working documents that
would be merged into `master`. The code half of that is now fixed in the working tree.

## Resolution status

Every finding below that is a code change is **fixed on this branch**, in the commit
"Address the PR #767 review findings". `TASK-pr767-log.md` records what changed and why.

| ID  | Status        | What changed                                                                                                       |
| --- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| F1  | Fixed         | `title="Toggle annotations"` / `aria-label="toggle-annotations"`; tests + snapshot updated                         |
| F2  | Open — author | Deployment ordering against `ebl-api@add-realia-annotation-api`; no client change is correct                       |
| F3  | Open — author | The eight `TASK-*.md` files must go in the final pre-merge commit                                                  |
| F4  | Fixed         | `TextAnnotation.save.test.tsx` — both lists non-empty, derived fields asserted absent                              |
| F5  | Fixed         | Realia preview indicator is a focusable `role="link"` with Enter/Space and an accessible name                      |
| F6  | Fixed         | `MAX_TIER_DEPTH` clamp in `spanTiers.ts`, pinned against the sass by a cascade test                                |
| F7  | Fixed         | Lazy `useReducer` initializer                                                                                      |
| F8  | Fixed         | `initialAnnotations` seeded through the shared `dedupeAnnotationSpans`                                             |
| F9  | Fixed         | Apply is disabled while no realia is selected                                                                      |
| F10 | Fixed         | Provider mounted unconditionally with a `show` prop; DOM unchanged                                                 |
| F11 | Fixed         | Save-failure branch covered; annotation code back to 100 % on all four metrics                                     |
| F12 | Open — author | Call the tooling/policy changes out in the PR description                                                          |
| F13 | Partly fixed  | `Markable.test.tsx` split 307 → 59 + 104 lines; the six pre-existing oversized core files are left alone (see log) |

## Pre-existing review state (gathered from GitHub before this review)

### Timeline review events

| #   | Reviewer      | State                 | Date             | Status                                       |
| --- | ------------- | --------------------- | ---------------- | -------------------------------------------- |
| 1   | `qltysh[bot]` | COMMENTED             | 2026-07-13       | Resolved (all 4 threads resolved + outdated) |
| 2   | `qltysh[bot]` | COMMENTED             | 2026-07-15       | Resolved (thread resolved + outdated)        |
| 3   | `Fabdulla1`   | APPROVED              | 2026-07-22 11:00 | Superseded by #4                             |
| 4   | `Fabdulla1`   | **CHANGES_REQUESTED** | 2026-07-22 11:06 | **UNRESOLVED — blocker**                     |

### Inline review comments

| Thread                 | File                                 | Author | Resolved | Outdated |
| ---------------------- | ------------------------------------ | ------ | -------- | -------- |
| similar-code (mass 84) | `TextAnnotationContext.test.tsx:105` | qltysh | yes      | yes      |
| similar-code (mass 84) | `TextAnnotationContext.test.tsx:121` | qltysh | yes      | yes      |
| similar-code (mass 92) | `TextAnnotationContext.test.tsx:157` | qltysh | yes      | yes      |
| similar-code (mass 92) | `TextAnnotationContext.test.tsx:175` | qltysh | yes      | yes      |
| boolean-logic          | `cssCascade.testSupport.ts:110`      | qltysh | yes      | yes      |

General/issue comments: none.

**Unresolved: 1** (review #4). **Resolved: 5 bot threads** — all outdated against the current
head; the duplicated test scaffolding they flagged has since been extracted into
`textAnnotation.testSupport.tsx` / `textAnnotationContext.testSupport.ts`.

## Findings

### F1 — Reviewer's requested change is still unaddressed (blocker)

**Severity: Blocker (requested change, accessibility)**

`Fabdulla1` requested on 2026-07-22 that the display toggle stop calling itself "named
entities" when it shows and hides _both_ layers. No commit since has touched it — at
`1070d896` the control still reads:

```tsx
// src/fragmentarium/ui/display/FragmentDisplaySettings.tsx:96-97
title={'Toggle named entities'}
aria-label={'toggle-named-entities'}
```

The button renders `⚘` (`realiaIcon`) — the Realia glyph — so a screen-reader user is told
"toggle named entities" for a control whose icon and behaviour are realia + named entities.

**Reproduction**: open any fragment's _Display_ tab → inspect the rightmost button in the
settings group → accessible name is `toggle-named-entities`, tooltip "Toggle named
entities" → click it and realia indicators appear as well as tags.

**Fix**: rename to something covering both layers (e.g. `title="Toggle annotations"`,
`aria-label="toggle-annotations"`), and update
[Display.test.tsx:117-152](src/fragmentarium/ui/display/Display.test.tsx#L117-L152) plus the
`Display.test.tsx.snap` entries (lines 23, 26).

### F2 — Backend contract must ship first (blocker for deployment order)

**Severity: Blocker (release coordination)**

The branch changes the named-entity endpoints' contract in three ways that the current
`master` API does not serve:

| Change                                                                          | Location                                                                                          |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `GET .../named-entities` response: array → `{ namedEntities, realia }`          | [FragmentRepository.ts:718-724](src/fragmentarium/infrastructure/FragmentRepository.ts#L718-L724) |
| `POST .../named-entities` body: `{ annotations }` → `{ namedEntities, realia }` | [FragmentRepository.ts:726-739](src/fragmentarium/infrastructure/FragmentRepository.ts#L726-L739) |
| new route `GET /realia/by-id/{realiaId}`                                        | [RealiaRepository.ts:145-147](src/realia/infrastructure/RealiaRepository.ts#L145-L147)            |

plus the new inbound fragment fields `realia` / `realiaInfo` and per-token `word.realia`.
`TASK-realia-preview-broken-api-prompt.md` names the companion branch:
`ebl-api` → `add-realia-annotation-api`.

**Failure mode if the frontend merges first**: the old array response makes
`createAnnotationSpans` produce `{ namedEntities: [], realia: [] }` — the editor silently
shows _no existing annotations_ rather than erroring, and a subsequent Save posts a body the
old API does not understand. Silent annotation loss is the worst case here.

**Fix**: state the API PR in the description and merge/deploy the API side first (or
together). No client change needed.

### F3 — Five `TASK-*.md` working documents would be merged (blocker per project rules)

**Severity: Blocker (repo hygiene — explicit project rule)**

At head the branch adds `TASK-realia-annotation-candidates-{todo,log}.md`,
`TASK-realia-preview-broken-{todo,log,api-prompt}.md`. The project rule is that these are
removed before a PR merges; `TASK-realia-preview-broken-todo.md:103` and
`TASK-realia-annotation-candidates-todo.md:86` both carry the unchecked reminder to do so.
This review file (`TASK-pr767-review.md`) must be removed with them.

Note that `b4b16fe5` already removed an earlier set and `9286c18e` re-added a new one — the
cleanup needs to be the last commit before merge.

### F4 — No save-path test with both lists populated (reviewer's second request)

**Severity: Medium (test coverage — requested by reviewer)**

`Fabdulla1` also asked for "a focused test confirming that both arrays are submitted
together and that derived fields such as `tier`, `name`, and `layer` are stripped". Current
coverage is close but leaves the exact case open:

- [annotationSpan.test.ts:55-81](src/fragmentarium/ui/text-annotation/annotationSpan.test.ts#L55-L81)
  pins the stripping of `tier`/`name`/`layer` on both collections — unit level.
- [TextAnnotation.test.tsx:45-59](src/fragmentarium/ui/text-annotation/TextAnnotation.test.tsx#L45-L59)
  asserts the save payload, but with `realia: []`.
- `TextAnnotation.realiaEditing.test.tsx` edits realia but never saves.

Nothing asserts an end-to-end save with a non-empty `namedEntities` **and** a non-empty
`realia` list. Since the outbound payload is exactly what a 422 would punish, this is worth
the ~15 lines.

**Fix**: extend `TextAnnotation.test.tsx` (or add a small `TextAnnotation.save.test.tsx`)
with a fixture carrying both kinds; add one realia annotation through the UI, save, and
assert `updateNamedEntityAnnotations` was called with both lists and with no `tier`, `name`
or `layer` key on any element.

### F5 — Realia navigation in the read-only preview is mouse-only

**Severity: Medium (accessibility)**

In the display preview, a realia indicator is a bare `<span>` whose only affordance is
`onMouseUp` + <kbd>Alt</kbd>:

```tsx
// src/fragmentarium/ui/text-annotation/SpanIndicatorView.tsx:16-24
<span title={title} data-label={dataLabel}
      onMouseUp={realiaId ? openRealiaPage : undefined} … />
```

There is no `role`, no `tabIndex`, no key handler, and the shortcut is discoverable only
through the `title` tooltip
([useSpanIndicator.ts:53](src/fragmentarium/ui/text-annotation/useSpanIndicator.ts#L53)).
Keyboard and screen-reader users cannot reach the Realia page from the preview at all — even
though a proper `RealiaCrossReferenceLink` (a real `<Link>`) already exists and is used
elsewhere on the Realia pages.

**Reproduction**: Display tab → toggle annotations on → <kbd>Tab</kbd> through the
transliteration → the realia indicator is never focused; no `Enter` target exists.

**Fix (preview only)**: render the realia indicator's label as an anchor
(`getRealiaPageUrl(label)`) or give the span `role="link"`, `tabIndex={0}` and an
`onKeyDown` for `Enter`/`Space`. The editor's `SpanIndicator` is a different, mouse-driven
editing surface and can stay as it is.

### F6 — Stacked tiers can exceed the CSS tier ceiling

**Severity: Low (visual)**

Realia tiers are stacked _above_ the deepest entity tier:

```ts
// src/fragmentarium/ui/text-annotation/spanTiers.ts:70-83
const entityDepth = _.max([...entityTiers.values()]) || 0
… tier: entityDepth + (realiaTiers.get(span.id) || 1)
```

`TextAnnotation.sass` only generates `tier-depth--1 … --10` (`$max-tier-depth: 10`), and the
`td:has(...)` padding rules with them. A word with, say, 6 nested tags and 5 realia produces
`tier-depth--11`, which matches no rule: the indicator falls back to the base `bottom` offset
(overlapping tier 10) and the row reserves no space for it. Before this PR only tags
consumed the 10 tiers, so the ceiling was much harder to reach.

**Fix**: raise `$max-tier-depth`, or clamp the derived tier to `$max-tier-depth` so the
overflow degrades onto the last row deliberately.

### F7 — Reducer initial state is recomputed on every render

**Severity: Low (efficiency)**

```ts
// src/fragmentarium/ui/text-annotation/TextAnnotationContext.tsx:125-130
const deduped = { namedEntities: dedupeEntitySpans(...), realia: dedupeRealiaSpans(...) }
return useReducer(reducer, { ...setTiers(words, deduped), words })
```

`useReducer` uses its second argument only on the first render, but the dedupe and the full
`setTiers` tier computation run on **every** render of `TextAnnotationView` — including
after every add/edit/delete dispatch — and the result is thrown away.

**Fix**: `useReducer(reducer, { words, initial }, createInitialState)` (lazy initializer).

### F8 — `isDirty` is true on load when the API returns duplicates

**Severity: Low**

`useAnnotationContext` dedupes the loaded spans, but `initialAnnotations` in
`TextAnnotationView` keeps the raw response, so
[SpanAnnotationDisplay.tsx:40](src/fragmentarium/ui/text-annotation/SpanAnnotationDisplay.tsx#L40)
compares deduped state against a non-deduped baseline: **Save** is enabled before the user
touches anything. Harmless (saving persists the cleanup) but misleading.

**Fix**: seed `initialAnnotations` from the deduped spans.

### F9 — "Apply" is a silent no-op when the realia select is cleared

**Severity: Low (UX)**

```tsx
// src/fragmentarium/ui/text-annotation/SpanEditor.tsx:143-152
onApply={() => { if (selectedRealia) { … } }}
```

`RealiaSelect` is `isClearable`. Clearing it and pressing **Apply** does nothing at all — no
dispatch, no message, and the popover stays open, since `setActiveSpanId(null)` lives inside
the guarded branch. Either disable **Apply** while the value is null or treat clear+apply as
a delete.

### F10 — The display toggle remounts the whole transliteration

**Severity: Low (efficiency / UX)**

```tsx
// src/fragmentarium/ui/display/Display.tsx:89-97
{showNamedEntities ? (<NamedEntityPreviewProvider …>{transliteration}</NamedEntityPreviewProvider>) : (transliteration)}
```

Because the element type at that position changes, React unmounts and remounts the entire
transliteration subtree on every toggle, discarding transient UI state (open lemma popovers,
etc.). No network request is issued, so the API-efficiency gate is met — this is DOM churn
only. Rendering the provider unconditionally and passing the flag down (or gating with a
class) keeps the subtree stable and would let the CSS transition actually run on the
indicators rather than on a fresh tree.

### F11 — Save-failure branch of the new save path is uncovered

**Severity: Low (coverage gate)**

Coverage measured on this head over the whole `text-annotation` suite:

```
SpanAnnotationDisplay.tsx | 97.72 % stmts | 100 % branch | 90 % funcs | 97.61 % lines | line 53
```

Line 53 is the `.catch(() => setIsSaving(false))` added by `1070d896` — no test rejects
`updateNamedEntityAnnotations`, so the "save failed" path (spinner cleared, error surfaced by
`CuneiformFragment`'s `ErrorAlert`) is never exercised. Everything else in
`src/fragmentarium/ui/text-annotation/` is at 100 % on all four metrics (26 files), and the
project rule is 100 % on affected code; `TASK-realia-preview-broken-log.md` claims 100 % for
this file, which no longer holds after the `.catch` was added.

`editorTabContents.tsx` shows uncovered lines 53, 98, 111, 128, 138 (the `onSave` callbacks
of the _other_ editor tabs) — that code moved verbatim out of `CuneiformFragmentEditor.tsx`
and its gap is pre-existing; the new `NamedEntityAnnotationContents` callback **is** covered.

**Fix**: one test that makes the update reject and asserts the spinner clears and the Save
button returns.

### F12 — Unrelated changes ride along in a feature PR

**Severity: Low (scope / reviewability)**

The branch also carries `.github/copilot-instructions.md` (+68 lines of new policy),
`.husky/pre-commit` and `.husky/pre-push` (new protected-branch blocks),
`src/signs/ui/display/SignImages.tsx` (a `PromiseLike` type fix), `src/test-support/utils.ts`
and `waitForSpinnerToBeRemoved.ts`. `TASK-realia-preview-broken-log.md:236-268` justifies
these as pre-existing failures fixed under the project's "fix pre-existing issues" rule
(`yarn tsc` was failing on `master` because of `SignImages.tsx`), which is legitimate — but
they are worth calling out in the PR description so a reviewer is not surprised by tooling
and policy changes inside a realia feature.

### F13 — Lines added to files already over the 250-line ceiling

**Severity: Low (project rule)**

| File                                                          | master | head  |
| ------------------------------------------------------------- | ------ | ----- |
| `src/fragmentarium/infrastructure/FragmentRepository.test.ts` | 1 014  | 1 061 |
| `src/fragmentarium/application/FragmentService.test.ts`       | 1 922  | 1 940 |
| `src/fragmentarium/infrastructure/FragmentRepository.ts`      | 732    | 739   |
| `src/fragmentarium/domain/fragment.ts`                        | 257    | 267   |
| `src/fragmentarium/ui/text-annotation/Markable.test.tsx`      | 300    | 307   |
| `src/signs/ui/display/SignImages.tsx`                         | 441    | 444   |

Every file the PR _creates_ is comfortably under the ceiling (largest:
`TextAnnotation.selectionFallback.test.tsx`, 239), and `TextAnnotation.test.tsx` was split
from 719 lines down to 60 — the direction of travel is right. The six above were already
over before this branch; the log flags only `SignImages.tsx`. No action required in this PR,
but they should not keep growing.

## Severity

| ID  | Finding                                                        | Severity | Blocked approval       | Now           |
| --- | -------------------------------------------------------------- | -------- | ---------------------- | ------------- |
| F1  | Toggle still labelled "named entities" (requested change)      | Blocker  | Yes                    | Fixed         |
| F2  | Depends on the unmerged `ebl-api` contract                     | Blocker  | Yes (merge order)      | Open — author |
| F3  | `TASK-*.md` docs would be merged                               | Blocker  | Yes                    | Open — author |
| F4  | No save test with both lists populated                         | Medium   | Yes (reviewer request) | Fixed         |
| F5  | Realia preview navigation is mouse-only                        | Medium   | No                     | Fixed         |
| F6  | Tier > 10 has no CSS                                           | Low      | No                     | Fixed         |
| F7  | Reducer initial state recomputed each render                   | Low      | No                     | Fixed         |
| F8  | `isDirty` true on load with duplicate spans                    | Low      | No                     | Fixed         |
| F9  | "Apply" no-op after clearing the realia select                 | Low      | No                     | Fixed         |
| F10 | Toggle remounts the transliteration                            | Low      | No                     | Fixed         |
| F11 | Save-failure branch uncovered (`SpanAnnotationDisplay.tsx:53`) | Low      | No                     | Fixed         |
| F12 | Unrelated tooling/policy changes in scope                      | Low      | No                     | Open — author |
| F13 | Growth of files already over 250 lines                         | Low      | No                     | Partly fixed  |

## Reproduction Steps

Common setup: check out `add-realia-annotation` at `1070d896`, `yarn install`, run against an
API built from `ebl-api@add-realia-annotation-api`, and open a fragment that has both
named-entity and realia annotations (e.g. `library/NCBT.1121` on `ebldev`).

- **F1** — Display tab → inspect the `⚘` button: `aria-label="toggle-named-entities"`,
  `title="Toggle named entities"`; clicking it toggles realia indicators too.
- **F2** — point the frontend at a `master` API → Named Entities tab → existing annotations
  render as empty; Save posts `{namedEntities, realia}` to an endpoint expecting
  `{annotations}`.
- **F3** — `ls TASK-*.md` at the repo root, or `git diff --name-only master...HEAD | grep TASK-`.
- **F4** — `grep -n "toHaveBeenCalledWith" src/fragmentarium/ui/text-annotation/TextAnnotation.test.tsx`
  → the only save assertion has `realia: []`.
- **F5** — Display tab → toggle on → <kbd>Tab</kbd> through the text: realia indicators never
  take focus.
- **F6** — annotate one word with 6 nested tags and 5 realia → the 11th indicator renders at
  the 10th's offset and overflows the line.
- **F8** — stub `fetchNamedEntityAnnotations` to return the same span twice → the Named
  Entities tab loads with **Save** already enabled.
- **F9** — open a realia span editor → clear the select with the `×` → press **Apply** →
  nothing happens and the popover stays open.

## Verification performed

| Gate                      | Result                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint`               | Clean (eslint + stylelint)                                                                                                                                                                                                                                                                                                                                                              |
| `yarn tsc`                | Clean                                                                                                                                                                                                                                                                                                                                                                                   |
| Full Jest suite           | Before: 369 suites, 3 739 passed + 2 skipped. After the fixes: **371 suites, 3 759 passed + 2 skipped, 0 failed** — run in 15 sequential batches (see note)                                                                                                                                                                                                                             |
| Console noise             | Zero `console.error` / `console.warn` / `Warning:` / unhandled-rejection lines in the batched output, before and after                                                                                                                                                                                                                                                                  |
| Coverage of new code      | Before: 26 of 27 files in `src/fragmentarium/ui/text-annotation/` at 100 %, the gap being `SpanAnnotationDisplay.tsx:53` (**F11**). After: **100 % statements, branches, functions and lines across all 27**. `src/realia/**` and `src/fragmentarium/ui/display/` at 100 %                                                                                                              |
| 250-line ceiling          | Every file this PR adds or edits is under it after the `Markable.test.tsx` split; the six pre-existing exceptions are listed in **F13**                                                                                                                                                                                                                                                 |
| API-call-efficiency audit | Passed — see **Summary**; no N+1, no fetch on toggle/tab switch, debounced + cancelled search, `realiaInfo` embedded and never echoed back                                                                                                                                                                                                                                              |
| Data-architecture audit   | Passed — two kinds separate through DTO, state, props, lookups; one serializer; guard narrows both branches; no cross-kind cast                                                                                                                                                                                                                                                         |
| Running the app           | **Partial** — `craco start` compiles and serves 200 on the branch with no webpack/type errors, but `REACT_APP_DICTIONARY_API_URL` (`localhost:8001`) is not running here and this environment has no browser or interactive Auth0 login, so the annotation and preview screens could not be exercised against real data. Behaviour was verified through the test suite and code reading |

Note on the suite: `yarn test --watchAll=false` (the project's `--runInBand`,
`--max_old_space_size=1536` script) was killed by the OOM killer twice in this container
after 16 and 38 suites — an environment memory limit, not a PR defect. Running the same 369
files in batches of 25 with a larger heap completed green.

## Comment status tracking

**Unresolved**

1. `Fabdulla1`, review #4 (CHANGES_REQUESTED, 2026-07-22) — rename the display toggle's title
   and accessible label to describe both layers → **F1**.
2. `Fabdulla1`, same review — add a focused test that both arrays are submitted together with
   `tier` / `name` / `layer` stripped → **F4**.

**Resolved**

3. `qltysh[bot]` × 4 on `TextAnnotationContext.test.tsx` (similar-code) — resolved and
   outdated; the duplicated scaffolding was extracted into the `*.testSupport` modules.
4. `qltysh[bot]` on `cssCascade.testSupport.ts:110` (complex boolean expression) — resolved
   and outdated.

## Recommendation

**Approve once F2, F3 and F12 are done by the author** — every code finding (F1, F4–F11 and
the in-scope part of F13) is now fixed in the working tree, and lint, tsc, the full suite,
the console-noise check and 100 % coverage of the affected code all pass on the result.

What remains is not code:

- **F2** — reference the `ebl-api@add-realia-annotation-api` PR and merge/deploy it first.
  Merging the frontend alone makes the editor show no existing annotations and post a body
  the current API cannot read.
- **F3** — `git rm` the eight `TASK-*.md` files in the final pre-merge commit.
- **F12** — call the tooling/policy changes out in the PR description.
- **F13 (remainder)** — the six pre-existing oversized core files want their own task.

The `CHANGES_REQUESTED` state stands until `Fabdulla1` re-reviews; both of their points
(F1, F4) are addressed.

## What Has To Be Done

Items 1–9 are **done and committed** on this branch. Item 12 (the PR description) is done.
Items 10, 11 and 13 remain, and are the author's.

1. ~~**[Blocker — F1]** Rename the display toggle to cover both layers.~~ Done —
   `FragmentDisplaySettings.tsx`, `Display.test.tsx` and the snapshot (one file, diff
   inspected: only the two renamed lines moved).
2. ~~**[Reviewer request — F4]** Save-path test with both lists non-empty and derived
   fields stripped.~~ Done — `TextAnnotation.save.test.tsx`.
3. ~~**[Should fix — F5]** Keyboard path to the Realia page from the preview.~~ Done —
   `role="link"` + `tabIndex` + Enter/Space + accessible name in `SpanIndicatorView.tsx`.
4. ~~**[F6]** Stop derived tiers exceeding the generated CSS.~~ Done — `MAX_TIER_DEPTH`
   clamp in `spanTiers.ts`, pinned against the sass by `NamedEntities.css.test.ts`.
5. ~~**[F7]** Lazy `useReducer` initializer.~~ Done — `TextAnnotationContext.tsx`.
6. ~~**[F8]** Seed `initialAnnotations` from the deduped spans.~~ Done — shared
   `dedupeAnnotationSpans` in `annotationSpan.ts`, used by the context and `TextAnnotation.tsx`.
7. ~~**[F9]** Disable **Apply** while the realia select is empty.~~ Done — `SpanEditor.tsx`.
8. ~~**[F10]** Mount the preview provider unconditionally.~~ Done — `show` prop on
   `NamedEntityPreviewProvider`; rendered DOM unchanged.
9. ~~**[F11]** Cover the save-failure branch.~~ Done — annotation code back at 100 %
   statements, branches, functions and lines.
10. **[Blocker — F2]** Reference the `ebl-api@add-realia-annotation-api` PR in the
    description and confirm it is merged/deployed before or with this PR.
11. **[Blocker — F3]** `git rm TASK-realia-annotation-candidates-{todo,log}.md`,
    `TASK-realia-preview-broken-{todo,log,api-prompt}.md` and
    `TASK-pr767-{todo,log,review}.md` in the final commit before merge.
12. **[Housekeeping — F12]** Call out the tooling/policy changes (`copilot-instructions.md`,
    husky hooks, `SignImages.tsx`, test-support) in the PR description.
13. **[Re-review]** Re-request review from `Fabdulla1`, whose `CHANGES_REQUESTED` is the
    current blocking state. _(Reviewer assignment is the author's to do — not to be
    automated.)_
14. **[Before merge]** Re-run `yarn lint`, `yarn tsc` and the full suite; confirm the run is
    console-clean.
