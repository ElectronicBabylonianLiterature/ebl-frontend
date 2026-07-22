# TASK-address-findings — Work Log

## Session start

- User: "address all the findings" from #773 + #774 reviews. Confirmed scope via 2 rounds of
  questions: thread signal everywhere; migrate SCSS now; (tsc/CI answers rendered moot by the
  correction below).

## Entry 1 — DRY fix (#774-3)

- Extracted `TextService.fetchSiglaAndTransliterations(id, endpoint)`; `findColophons` /
  `findUnplacedLines` delegate. `yarn tsc` → exit 0. Root cause: pre-existing duplication
  flagged by qlty bot.

## Entry 2 — CORRECTION: tsc "blocker" was a false positive (#773-1, #773-2)

- Original review claimed #773/master fail `yarn tsc` at `SignImages.tsx:297,306` and that CI
  didn't gate on tsc. **Both wrong.**
- Root cause of the mistake: verification worktrees symlinked the current (#774) `node_modules`,
  which no longer has `@types/bluebird` (removed by #774). Bluebird types → `unknown` →
  manufactured errors. A fresh isolated `yarn install --frozen-lockfile` on #773 → `tsc` exit 0.
- `.github/workflows/main.yml` already has a `Compile: yarn tsc` step → CI gates on tsc.
- Action: retracted both findings in TASK-ts7-migration-review.md and TASK-remove-bluebird-review.md.
- Lesson: never run tsc for branch A against branch B's node_modules; the subagent inherited the
  same polluted worktree and false-confirmed — cross-check deps before trusting a tsc verdict.

## Entry 3 — SCSS migration scoping (#773-3)

- Scoped 62 `.sass` files (see todo). Plan: `@import X` → `@use 'X' as *`; darken→color.adjust
  in TextAnnotation.sass; cross-component `@use` for NamedEntities → TextAnnotation.
- Next: apply transform, then stylelint + build + compiled-CSS spot check.

## Entry 4 — SCSS migration DONE (#773-3)

- Migrated 41 files `@import X` → `@use 'X' as *`. `TextAnnotation.sass`: added
  `@use 'sass:color'`, `darken($color, 10)` → `color.adjust($color, $lightness: -10%)`.
- Verified byte-identical: `darken($color,10)` == `color.adjust(...,-10%)` == `rgb(0, 87.05…, 139)`.
- craco: `silenceDeprecations` reduced to `['legacy-js-api']`; removed app-oriented
  `ignoreWarnings` regexes (@import / global-builtin / darken / generic Sass). `quietDeps: true`
  kept → dependency deprecations still silenced; app deprecations now surface.
- Gates: stylelint clean; dev server "Compiled successfully!" with ZERO sass deprecation
  warnings, HTTP 200.
- **Visual-regression proof:** compiled every one of the 62 `.sass` files old(@import) vs
  new(@use) with standalone sass `--load-path=.`; **60/60 CSS-emitting files byte-identical, 0
  differ** (2 partials emit no direct CSS). No visual regression.
- Prod build OOMs in this RAM-limited env (`--max_old_space_size` killed early with ~3GB free);
  not a code issue — retry at final gates.

## Entry 5 — Signal threading (#774-1) [IN PROGRESS]

- Scoping the getter → service → repository → ApiClient chain next.

## Pending

- Signal threading (#774-1).
- Full gate run (incl. prod build when memory allows) + doc finalization.
