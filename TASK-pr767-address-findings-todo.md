# TASK-pr767-address-findings — TODO

Task: address every finding from the PR #767 review (`TASK-pr767-realia-annotation-review.md`) at
its root cause, per `.github/copilot-instructions.md`.

## Findings to resolve

- [x] **F1** — Split the two PR-introduced files over the 250-line ceiling
      (`SpanAnnotator.test.tsx` 348, `TextAnnotationContext.test.tsx` 315) into ≤250-line sibling suites.
- [x] **F2** — Collapse the mirrored realia/tag tests (qlty similar-code) via `it.each`.
- [x] **F3** — Remove the complex 5-clause boolean in `cssCascade.testSupport.ts` `matches()`.
- [x] **F4** — Parallelize the two independent loads in `TextAnnotation.tsx` (pre-existing) with
      `Promise.all`.
- [x] **F5** — Prior-task `TASK-*.md` files retained at user's request (guideline only _reminds_ to
      remove before merge); removal deferred to pre-merge.

## Hard gates (copilot-instructions)

- [x] `yarn lint` → 0 errors.
- [x] `yarn tsc` → 0 errors.
- [x] `yarn test --watchAll=false` — **full** suite (run in 5 memory-bounded shards + `src/editor`),
      0 failures, 0 console output, 0 crashes.
- [x] Coverage 100% on affected code — **every** `text-annotation` source file is 100%
      stmts/branch/funcs/lines (added `getEntityTypeOption`, default-dispatch, selection-retry, Markable
      interaction, and AnnotationInstructions tests).
- [x] Create + maintain `TASK-<id>-todo.md` and `TASK-<id>-log.md` for this task.
- [x] No changed/added script file exceeds 250 lines.
- [x] Update `TASK-pr767-realia-annotation-review.md` to reflect final state.

## Notes

- No commit/push (branch work only; `master` protected). User commits when ready.
- This todo/log pair and the review file must be removed before merge.
