# TASK-address-findings — TODO

Addressing all findings from the #773 + #774 reviews. All changes land on
`chore/remove-bluebird` (#774), the tip of the stack. No commit unless the user asks.

Status: [x] done · [~] in progress · [ ] pending

## Findings & disposition

- [x] **#774-3 DRY** — `TextService`: extracted `fetchSiglaAndTransliterations(id, endpoint)`;
      `findColophons`/`findUnplacedLines` delegate. tsc clean.
- [x] **#773-1 tsc "blocker"** — RETRACTED (false positive; env artifact — worktree symlinked
      #774 node_modules missing `@types/bluebird`). #773/master tsc are clean. Docs corrected.
- [x] **#773-2 CI tsc gate** — RETRACTED (main.yml already runs `yarn tsc`). No action.
- [~] **#774-1 cancellation** — thread `AbortSignal` everywhere (getters → services → repos →
  ApiClient + usePromiseEffect mutations). User chose "thread everywhere".
- [~] **#773-3 Sass** — migrate 62 `.sass` files `@import`→`@use ... as *`,
  `darken()`→`color.adjust()`; scope craco Sass suppression to node_modules. User chose "migrate now".
- [ ] **TASK docs** — remove all `TASK-*.md` before merge (reminder).

## Gates (must be green + console-clean before finalizing)

- [ ] `yarn tsc`
- [ ] `yarn lint` (eslint + stylelint over `.sass`)
- [ ] `yarn test --watchAll=false` — zero failures, zero console output
- [ ] `yarn build`
- [ ] dev server compiles + serves

## SCSS migration scope (gathered)

- 62 `.sass` files (indented syntax). `@import` targets: `src/design-tokens` ×40,
  `src/fonts` ×5, `src/common/ui/sidebar-page-shell` ×2, `./TextAnnotation.sass` ×1.
- `_design-tokens.sass` = pure vars (safe). `_fonts.sass` = `@mixin ebl-font` + `@font-face`
  (emits CSS). `ebl-font` used via `@include` in 5 files.
- `darken()` only in `TextAnnotation.sass:75` (inside `indicator-label` mixin) →
  `color.adjust($color, $lightness: -10%)` (+ `@use 'sass:color'`).
- `NamedEntities.sass` uses `indicator-label` mixin from `TextAnnotation.sass` → needs
  `@use './TextAnnotation.sass' as *`.
- Plan: `@import X` → `@use 'X' as *` (keeps all `$var`/mixin refs unqualified). `@use` must be
  first in file (already is). Verify via stylelint + build + compiled-CSS spot check.
