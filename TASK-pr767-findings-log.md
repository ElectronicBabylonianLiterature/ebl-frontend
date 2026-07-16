# TASK-pr767-findings — Work Log

Addressing every finding in `TASK-pr767-post-docs-review.md`, on branch
`add-realia-annotation`. Nothing was committed; all changes are in the working
tree.

## F5 — bot findings: withdrawn, not fixed

Checked each of the 5 `qltysh[bot]` comments against the working tree instead of
trusting the review's own claim. All 5 were already fixed by `b72cd593`, which
landed at 15:36 on 2026-07-15, after the bot's last review at 11:14 that day.

- The 4 `similar-code` hits were in `TextAnnotationContext.test.tsx`, a file that
  no longer exists — split into `.layers.` / `.uniqueness.` suites, with the
  mirrored realia/tag tests collapsed into `addScenarios` / `deleteScenarios`
  `it.each` tables.
- The `boolean-logic` hit was the 5-term `&&` chain in `matches()`, already
  decomposed into a `checks` array plus `matchesPseudoElement`.

**Root cause of the bad report:** the review used `position !== null` as an
outdatedness test. That is not what `position` means. All 5 comments have
`line: null` and are anchored to ancestor commits (`original_commit_id`
`f37f6df0` / `123f5f3a`). Corrected in the review file; no code changed.

## F1 — reduced-motion guard, and the harness defect it exposed (F6)

Added `@media (prefers-reduced-motion: reduce)` to `NamedEntities.sass`
disabling the `.span-indicator--static` animation and the row `padding-bottom`
transition, matching the pattern in 14 other sass files.

Running the suite immediately failed the _existing_ test:

```
● animates a static (display) indicator
  Expected pattern: /named-entity-indicator-in/
  Received string:  "none"
```

**Root cause:** `parseRules` scanned CSS with `/([^{}]+)\{([^{}]*)\}/g`, which
cannot nest. Against an `@media` block the regex skipped the wrapper, matched
the inner rules, and dropped the condition — so the reduced-motion
`animation: none` was applied unconditionally and won on document order. The
harness would have silently mis-modelled any media-query CSS.

**Fix (not a mask):** `cssCascade.testSupport.ts` now models `@media`.

- `splitMediaSegments` splits compiled CSS into segments in **document order**,
  so cascade-by-order still holds.
- `CompiledRule` carries `media: string | null`; `ElementQuery` carries the
  active `media` conditions.
- `resolveWinner` skips rules whose condition is not active via `isMediaActive`.

Tests: 3 added. The fade-in drops to `none` under reduced motion and is
unchanged without it (which also proves conditions do not leak). The row
transition is asserted at rule level in both states, because
`.named-entity-display .Transliteration__lines td` is a descendant selector that
`parseSelector` deliberately treats as unmatchable — the same limit the existing
"ignores complex selectors it cannot model" test pins.

## F2 — duplicated alt+click handler

`useSpanIndicator` now exposes `openRealiaPage(event): boolean`; both components
call it. `label` no longer escapes the hook, `isRealiaPageShortcut` is private
again, and the duplicated imports are gone. This also removes the readability
trap where the guard tested `realiaId` while the payload was `label` — that
coupling is now expressed once, where both values are derived.

## F3 — stale comment

Removed the false clause "the realiaId is not a resolvable navigation key" from
`realiaCrossReferenceTarget`. `RealiaService.find` dispatches on `isRealiaId`
and resolves `realia_<digits>` via `findByRealiaId`. Kept the true clause (the
route resolves by `_id`, which equals the lemma) since it explains why the lemma
is preferred and is not visible from the code.

Note: cross-reference ids in fixtures (`realia_elam`, `realia_iskur`) do **not**
match `/^realia_\d+$/`, so they resolve as lemmas, not via `findByRealiaId`.
The lemma-first order is therefore load-bearing, not cosmetic.

## F4 — task docs

`git rm` of `TASK-ne-toggle-transition-{log,todo}.md` and
`TASK-realia-lemma-url-{log,todo}.md`. Contents were read first and matched the
two shipped commits. No tracked `TASK-*` files remain.

## F7 — pre-existing coverage gap (found, not introduced)

Re-measuring coverage after the F3 comment edit showed `RealiaEntry.ts` at
95.83% branch, uncovered line 113 — `afoVolumeSortKey`'s `: 0` fallback for a
volume with no digits. Confirmed against the **full** suite, not just the
affected subset, so it was a real pre-existing gap rather than an artifact of a
narrow `--testPathPattern`. Fixed at root cause with a test sorting
`AfO Beiheft` (a real volume label carrying no number) last. Back to 100%.

## Gates (final)

| Gate                         | Result                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `yarn lint`                  | Clean                                                         |
| `yarn tsc`                   | Clean                                                         |
| `yarn test --watchAll=false` | exit 0 — 362/362 suites, 3721 passed, 2 skipped, 50 snapshots |
| Console noise                | Zero                                                          |
| Coverage, changed files      | 100% stmts / branch / funcs / lines                           |
| 250-line ceiling             | Pass — largest 220 (`NamedEntities.css.test.ts`)              |

The 2 skipped tests are `xit`s in `Edition.test.tsx`, pre-existing on `master`
since `#692`; left untouched, as removing or un-skipping a test needs explicit
approval.

**Not verified:** the app was not run in a browser; the realia alt+click path
needs an authenticated session against a live backend. The CSS is machine-
verified against compiled sass, but the reduced-motion behaviour has not been
observed in a real browser.

## Cleanup reminder

`TASK-pr767-findings-todo.md`, `TASK-pr767-findings-log.md` and
`TASK-pr767-post-docs-review.md` are untracked and must be removed before the PR
merges.
