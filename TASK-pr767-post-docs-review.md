# TASK-pr767-post-docs-review

Review of `f82c4bf7..HEAD` on `add-realia-annotation` (PR #767).

Commits under review:

- `9b0b3dbb` Ease the named-entity tags display toggle
- `59dc9bcd` Open the realia page by lemma from annotation indicators

## Summary

Two small, well-tested changes. `9b0b3dbb` wraps the transliteration in a
`.named-entity-display` div and adds a fade-in animation plus a `padding-bottom`
transition so the named-entity toggle no longer snaps. `59dc9bcd` switches the
alt+click realia shortcut from navigating by `realiaId` to navigating by the
resolved lemma.

The lemma navigation is correct. `RealiaService.find` dispatches on
`isRealiaId(id)` (`/^realia_\d+$/`): a lemma routes to `realiaRepository.find`,
a `realia_*` id routes to `findByRealiaId`. Both branches of the new behaviour
therefore resolve — including the lookup-miss fallback, where `getRealiaLabel`
returns the raw `realiaId` and the URL becomes `/tools/realia/realia_404`. That
fallback is covered by an explicit negative test.

All hard gates pass: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false`
(362 suites, 3717 passed, 2 pre-existing skips) with **zero console output**,
and **100% statements/branches/functions/lines** on every changed source file.

The API-call-efficiency audit passes. `NamedEntityPreviewProvider` issues no
request: realia display data arrives embedded on `fragment.realiaInfo` and is
read from state, so toggling named entities on/off mounts/unmounts the provider
without a network call. No N+1, no per-id fetching, no re-fetch on toggle. The
embedded `realiaInfo` is inbound-only and is not echoed in any outbound payload.

Data-architecture audit passes for this diff: `namedEntities` and `realia` remain
separate fields on `NamedEntityPreview`, `isRealiaAnnotationSpan` narrows both
branches, no `as` cast crosses the kinds, and no derived field reaches the API.

Blocking items are not in the code under review: 5 unresolved automated-bot
findings on the PR, and 4 task-tracking `.md` files that were re-committed after
the commit that removed them.

## Findings

### F1 — New motion has no `prefers-reduced-motion` guard

`src/fragmentarium/ui/text-annotation/NamedEntities.sass` adds
`@keyframes named-entity-indicator-in`, a `0.3s` animation on
`.span-indicator--static`, and a `padding-bottom` transition on
`.named-entity-display .Transliteration__lines td`. None is wrapped in a
reduced-motion guard.

This departs from an established project convention: 14 sass files guard their
motion, e.g. [AppContent.sass:131](src/common/ui/AppContent.sass#L131),
[Header.sass:188](src/Header.sass#L188), [index.sass:37](src/index.sass#L37).
The new `NamedEntities.css.test.ts` asserts the animation applies but has no
reduced-motion case.

Users with "reduce motion" set still get the fade and the padding tween.

### F2 — Duplicated alt+click handler in the two indicator components

[SpanIndicator.tsx:29-35](src/fragmentarium/ui/text-annotation/SpanIndicator.tsx#L29-L35)
and
[SpanIndicatorView.tsx:22-26](src/fragmentarium/ui/text-annotation/SpanIndicatorView.tsx#L22-L26)
now repeat the same domain logic:

```ts
if (realiaId && isRealiaPageShortcut(event)) {
  openRealiaPageInNewTab(label)
}
```

Both also duplicate the `openRealiaPageInNewTab` / `isRealiaPageShortcut`
imports and both destructure `realiaId` _and_ `label` solely to re-pair them.

The DRY hard gate applies, and `useSpanIndicator` is the natural home — it
already computes both values. Exposing an `openRealiaPage(event): boolean` from
the hook would remove the duplication and keep the guard next to the value it
guards.

This also resolves a readability trap: the guard tests `realiaId` but the
payload is `label`. That is safe only because `label` is derived from `realiaId`
via `getSpanLabel`. Encoding that coupling once, in the hook, stops each call
site from having to re-derive why the asymmetry is sound.

### F3 — Comment in `RealiaEntry.ts` now contradicts the code it explains

[RealiaEntry.ts:29-32](src/realia/domain/RealiaEntry.ts#L29-L32) states:

> The route resolves entries by their `_id`, which equals the lemma; the
> realiaId is not a resolvable navigation key.

The second clause is no longer true. `isRealiaId` / `findByRealiaId` were added
later on this branch (`ea5c9a23`), and `RealiaService.find` now resolves a
`realia_*` id. The new fallback test in this very diff
(`/tools/realia/realia_404`) passes _because_ a realiaId is a resolvable
navigation key. The comment predates the capability (`16072865`) and now
misleads anyone reasoning about the fallback path.

### F4 — Task-tracking docs re-committed after the removal commit

The diff adds four files that the immediately preceding commit `f82c4bf7`
("Remove task tracking and review docs before merge") had deleted:

- `TASK-ne-toggle-transition-log.md`, `TASK-ne-toggle-transition-todo.md`
- `TASK-realia-lemma-url-log.md`, `TASK-realia-lemma-url-todo.md`

These must not reach `master`. (This review file must be removed with them.)

### F5 — Automated-bot findings on PR #767 — **already resolved (correction)**

**This finding was reported incorrectly in the first pass of this review and is
corrected here.** The original text called all five `qltysh[bot]` comments
"unresolved and none outdated against the current head". That conclusion came
from testing `position !== null` on the API payload, which is not an
outdatedness check. Every one of the five carries `line: null` and
`position: 1`, and each is anchored to an _ancestor_ commit
(`original_commit_id` `f37f6df0` / `123f5f3a`), not to the current head.

Checked against the working tree, all five are already fixed by `b72cd593`
("Address PR #767 review findings…"), which landed at 15:36 on 2026-07-15 —
_after_ the bot's last review at 11:14 the same day. The bot never re-ran.

| File @ anchor commit             | Line | Finding                   | State at HEAD                                                                                       |
| -------------------------------- | ---- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| `TextAnnotationContext.test.tsx` | 105  | similar code, mass 84     | File split; mirrored add tests collapsed into the `addScenarios` `it.each` table                    |
| `TextAnnotationContext.test.tsx` | 121  | similar code, mass 84     | Same `it.each` table                                                                                |
| `TextAnnotationContext.test.tsx` | 157  | similar code, mass 92     | Mirrored delete tests collapsed into `deleteScenarios` `it.each`                                    |
| `TextAnnotationContext.test.tsx` | 175  | similar code, mass 92     | Same `it.each` table                                                                                |
| `cssCascade.testSupport.ts`      | 110  | complex binary expression | The 5-term `&&` chain in `matches()` is now a `checks` array plus the `matchesPseudoElement` helper |

`TextAnnotationContext.test.tsx` no longer exists; it was split into
`TextAnnotationContext.layers.test.tsx` (174 lines),
`TextAnnotationContext.uniqueness.test.tsx` (151) and a shared
`textAnnotationContext.testSupport.ts` — also satisfying the 250-line ceiling.

No action is required. The stale threads can be dismissed on GitHub, or left
for the bot to re-resolve on its next run.

### F6 — Harness silently flattened `@media` blocks (found while fixing F1)

Surfaced by fixing F1 and confirmed by running it. `parseRules` in
`cssCascade.testSupport.ts` scanned CSS with `/([^{}]+)\{([^{}]*)\}/g`, which
cannot nest. Given an `@media` block it skipped the wrapper and matched the
_inner_ rules, discarding the condition — so media-query declarations were
attributed **unconditionally**.

Adding the F1 guard immediately broke the existing test with
`Expected pattern: /named-entity-indicator-in/ / Received string: "none"`: the
reduced-motion `animation: none` won the cascade for every user. Any future
media-query CSS in these files would have been mis-modelled the same silent way.

### F7 — Pre-existing branch-coverage gap in `RealiaEntry.ts` (found while working)

`afoVolumeSortKey` at [RealiaEntry.ts:113](src/realia/domain/RealiaEntry.ts#L113)
(`return match ? Number(match[0]) : 0`) never had its no-digits branch taken —
95.83% branch across the **whole** suite, not just the affected subset. Found
when re-measuring coverage after the F3 comment fix; pre-existing, unrelated to
this diff, fixed under the pre-existing-issues rule.

## Severity

| ID  | Finding                           | Severity   | Blocker            | Status                                                 |
| --- | --------------------------------- | ---------- | ------------------ | ------------------------------------------------------ |
| F5  | qlty bot findings (x5)            | —          | No (**withdrawn**) | Already fixed by `b72cd593`; original report was wrong |
| F4  | Task docs re-committed            | Medium     | Yes — before merge | **Fixed**                                              |
| F1  | No `prefers-reduced-motion` guard | Medium     | No                 | **Fixed**                                              |
| F6  | Harness flattened `@media`        | Medium     | No                 | **Fixed**                                              |
| F2  | Duplicated alt+click handler      | Low–Medium | No                 | **Fixed**                                              |
| F7  | Pre-existing coverage gap         | Low        | No                 | **Fixed**                                              |
| F3  | Stale/contradicted comment        | Low        | No                 | **Fixed**                                              |

No correctness defect, regression, or security issue was found in the product
code under review. The two defects found (F6, F7) are both in test
infrastructure and both pre-existing.

## Reproduction Steps

**F1** — In OS settings enable "reduce motion" (or DevTools → Rendering →
Emulate `prefers-reduced-motion: reduce`). Open a fragment display with named
entities, toggle the switch on: the indicators still fade in over 0.3s and the
row padding still tweens. Expected under the project convention: no motion.

**F2** — Read the two files side by side; the handler bodies are identical.

**F3** — Read [RealiaEntry.ts:29-32](src/realia/domain/RealiaEntry.ts#L29-L32),
then [RealiaService.ts:12-16](src/realia/application/RealiaService.ts#L12-L16).
The test `opens by realiaId when the lemma is not resolved`
([SpanIndicator.test.tsx](src/fragmentarium/ui/text-annotation/SpanIndicator.test.tsx))
asserts the navigation the comment says is impossible.

**F4** — `git diff --stat f82c4bf7..HEAD -- '*.md'`

**F5** — `GET /repos/ElectronicBabylonianLiterature/ebl-frontend/pulls/767/comments`

## Verification Performed

| Gate                             | Result                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| `yarn lint` (eslint + stylelint) | Pass, clean                                                                |
| `yarn tsc`                       | Pass, no errors                                                            |
| `yarn test --watchAll=false`     | 362/362 suites, 3721 passed, 2 skipped (was 3717 before the 4 added tests) |
| Console noise                    | **Zero** — no `console.*`, no `Warning:`, no act() noise                   |
| Coverage of changed files        | **100%** stmts / branch / funcs / lines                                    |
| 250-line ceiling                 | Pass — largest changed file 220 lines                                      |
| API-call efficiency              | Pass — no N+1, no re-fetch on toggle, data embedded                        |
| Data-kind separation             | Pass — lists stay separate; no cross-kind resolution                       |
| Snapshot churn                   | Verified: `git diff -w` shows only the wrapper div                         |

The two skipped tests (`xit` in
[Edition.test.tsx:49](src/fragmentarium/ui/edition/Edition.test.tsx#L49)) are
pre-existing on `master` since `#692`; they are not a regression from this diff
and were left untouched (removing/among-skipping needs explicit approval).

**Not performed:** the modified application was not run in a browser. The realia
alt+click path needs an authenticated session against a live backend, which is
not available in this environment. The CSS findings are nevertheless machine-
verified: `NamedEntities.css.test.ts` compiles the real sass bundle and resolves
the cascade, so the animation/transition assertions reflect compiled output, not
a hand-copy of the source.

## Recommendation

**Approve with changes.** The code under review is correct, tested to 100%, and
console-clean; the lemma navigation is sound in both its resolved and
unresolved-fallback branches. F4 and F5 must be cleared before merge, and F1 is
worth fixing while the sass is fresh. F2 and F3 are quality/clarity cleanups.

## Comment Status Tracking

| Source                                      | Status                                                           |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `qltysh[bot]` inline x5 (F5)                | **Stale anchors** — fixed at HEAD by `b72cd593`; safe to dismiss |
| `qltysh[bot]` review `COMMENTED` 2026-07-13 | No body; no action                                               |
| `qltysh[bot]` review `COMMENTED` 2026-07-15 | No body; no action                                               |
| Human reviews                               | None submitted                                                   |
| `CHANGES_REQUESTED` events                  | None                                                             |
| General/issue comments                      | None                                                             |

No human reviewer has requested changes; there are no human review threads to
resolve. The five bot threads are the only ones on the PR and none reflects a
live defect.

## What Has To Be Done

Items 1–6 are complete; the gates below were re-run green after the last change.

1. ~~Resolve the 4 `qlty:similar-code` findings~~ — **withdrawn**; already
   fixed by `b72cd593`. The original F5 report was a false positive caused by a
   bad outdatedness check. No code change made.
2. ~~Resolve the `qlty:boolean-logic` finding~~ — **withdrawn**; `matches()` was
   already decomposed by `b72cd593`.
3. ~~Delete the four re-committed task docs~~ — **done** (`git rm`). _Still
   outstanding:_ `TASK-pr767-post-docs-review.md` and
   `TASK-pr767-findings-{todo,log}.md` must be deleted before the PR merges.
4. ~~Add the `prefers-reduced-motion` guard~~ — **done** in
   `NamedEntities.sass`, following the house pattern used by 14 other files.
5. ~~Add reduced-motion tests~~ — **done**: 3 new cases. This required teaching
   `cssCascade.testSupport.ts` to model `@media` (F6) — without it the guard
   silently broke the existing animation test.
6. ~~Move the alt+click logic into `useSpanIndicator`~~ — **done**; the hook now
   exposes `openRealiaPage(event): boolean`, `label` no longer escapes the hook,
   and `isRealiaPageShortcut` is private again.
7. ~~Correct the stale comment~~ — **done**; the false clause was removed and the
   true `_id`-equals-lemma constraint kept.
8. ~~Re-run the hard gates~~ — **done**: `yarn lint` clean, `yarn tsc` clean,
   362/362 suites and 3721 tests green with zero console output; 100% coverage
   on every changed file; all changed files ≤ 220 lines.
9. **Outstanding — user action.** Reviewer assignment and re-review are managed
   by the repository owner; no reviewer changes were made. Optionally dismiss
   the five stale bot threads on GitHub.
10. **Outstanding — not verifiable here.** The realia alt+click path was not
    exercised in a browser (needs an authenticated session against a live
    backend). Worth a manual pass before merge, including one check with
    "reduce motion" enabled.
11. **Outstanding — user decision.** Nothing in this task was committed; the
    working tree holds all changes.
