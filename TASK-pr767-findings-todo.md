# TASK-pr767-findings-todo

Addressing every finding in `TASK-pr767-post-docs-review.md`.

## F1 — reduced-motion guard (Medium)

- [ ] Add `@media (prefers-reduced-motion: reduce)` to `NamedEntities.sass`
      disabling the `.span-indicator--static` animation and the
      `.named-entity-display .Transliteration__lines td` padding transition.
- [ ] Prove the harness gap: the `parseRules` regex `/([^{}]+)\{([^{}]*)\}/g`
      cannot nest, so an `@media` block is silently flattened and its
      declarations are applied unconditionally.
- [ ] Teach `cssCascade.testSupport.ts` to model `@media`: carry the condition
      on `CompiledRule`, let `ElementQuery` declare active conditions, and
      filter non-active rules in `resolveWinner`.
- [ ] Keep document order intact so the cascade still resolves by order.
- [ ] Add reduced-motion cases to `NamedEntities.css.test.ts`.
- [ ] Keep every file at or under the 250-line ceiling (split if needed).

## F2 — duplicated alt+click handler (Low–Medium)

- [ ] Expose `openRealiaPage(event): boolean` from `useSpanIndicator`.
- [ ] Consume it in `SpanIndicator.tsx` and `SpanIndicatorView.tsx`.
- [ ] Drop the now-unneeded `label` from the hook's public shape and the
      duplicated `openRealiaPageInNewTab` / `isRealiaPageShortcut` imports.

## F3 — stale comment (Low)

- [ ] Correct the second clause of the comment at `RealiaEntry.ts:29-32`;
      `RealiaService.find` does resolve a `realia_*` id via `findByRealiaId`.

## F4 — task docs re-committed (Blocker before merge)

- [ ] Delete `TASK-ne-toggle-transition-{log,todo}.md` and
      `TASK-realia-lemma-url-{log,todo}.md`.
- [ ] Remind that this task's docs + the review file go before merge.

## F5 — bot findings (Blocker per review rules)

- [ ] Verify each of the 5 qlty findings against the current head rather than
      the stale anchor commit.
- [ ] Correct the review file if the findings are already resolved.

## Gates

- [ ] `yarn lint`
- [ ] `yarn tsc`
- [ ] `yarn test --watchAll=false` — zero failures, zero console output
- [ ] 100% coverage on changed files
- [ ] 250-line ceiling on every changed script file
