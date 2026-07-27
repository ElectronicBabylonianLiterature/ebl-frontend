# TASK-realia-preview-broken — TODO

Task: the display preview toggle shows named-entity tags but no realia tags.
Investigate and fix.

## Investigation

- [x] Map the display preview path end to end:
      `Display.tsx` → `NamedEntityPreviewProvider` → `createFragmentAnnotationSpans`
      → `setTiers` → `NamedEntityPreviewToken` → two `SpanIndicators` (entities,
      realia) → `SpanIndicatorView` → `useSpanIndicator` → CSS.
- [x] Confirm the token wrapper renders **both** layers (it does:
      `NamedEntityPreviewToken.tsx:29-38` maps `namedEntities` then `realia`).
- [x] Confirm the span rebuild keeps the kinds apart and joins each on its own id
      (`fragmentSpans.ts`: `word.realia` → `fragment.realia`, `word.namedEntities`
      → `fragment.namedEntities`). No asymmetry.
- [x] Confirm the frontend DTO→domain preserves `word.realia`
      (`text-line.ts` passes `data.content` through raw; `createFragment` spreads
      `dto.realia`/`dto.realiaInfo`).
- [x] Confirm the backend (branch `add-realia-annotation-api`) is symmetric:
      word schema serialises `realia` and `namedEntities`; fragment schema emits
      both; `set_named_entities` stamps `token.realia` with the annotation id;
      `update_field("named_entities", …)` persists `("text","named_entities","realia")`.
- [x] Run the compiled-CSS cascade guard (`NamedEntities.css.test.ts`, 42 tests):
      every realia/entity badge resolves to its own colour + label. Pass.
- [x] Reproduce with a **real** production fragment payload (NCBT.616) plus a
      realia annotation attached the way the API branch would: 2 realia indicators
      render, coloured `named-entity__DIVINE_NAME span-indicator--realia`.
- [x] Existing `Display.test.tsx` ("shows the named entity and realia spans when
      toggled on") and `NamedEntityPreviewToken.test.tsx` ("shows the realia
      indicators below the named entity indicators") both pass.

## Finding

- [x] The rendering path is correct and proven; it is **not** a data-mapping or
      logic defect. Realia tags render whenever the fragment's data carries realia.
- [x] The exact reported symptom — entities shown, realia absent — occurs iff the
      fragment has **no realia in its data** (`fragment.realia` empty / no token
      carries `.realia`). In a live-corpus sweep, **0 of 4,858** fragments carried
      any realia; the realia layer is unmerged (branch only), so no production /
      shared-DB fragment has realia yet.
- [x] Unresolved without the user: which fragment + environment showed this, and
      whether that fragment actually has realia saved. The pixel-level cascade
      (the class of bug that hit this component twice before, invisible to jsdom)
      cannot be checked here — no browser, and the local API (:8001) is down.

## Follow-up: fetch the data

- [x] Wrote `TASK-realia-preview-broken-api-prompt.md` — a self-contained prompt
      for an agent in `ebl-api` (branch `add-realia-annotation-api`) to fetch
      NCBT.1121 from the DB the frontend actually reads (`ebldev`, not public
      `ebl`), report `{namedEntities, realia, realiaInfo}`, the token-level
      `realia` arrays, and the `/named-entities` spans, and classify the result
      as State 1 (no realia — expected), State 2 (annotations present but tokens
      un-stamped — real bug + migration), or State 3 (payload correct — client
      CSS). Includes the raw `findOne` and the re-save/stamping check.

## Fix

- [x] Root cause: the Named Entities tab is the only editor tab that never calls
      `props.onSave`, and `SpanAnnotationDisplay` discarded the `Fragment` the POST
      returns — so the Display tab kept rendering the fragment fetched at mount.
- [x] Route the save through `onSave` (`editorTabContents` → `TextAnnotation` →
      `SpanAnnotationDisplay`), matching every other tab.
- [x] Type `TabsProps.onSave` (was untyped) and make `onSave` return
      `Promise<Fragment>` so the save can chain.
- [x] `.catch` the save so a rejection clears the spinner instead of leaving an
      unhandled rejection.
- [x] Regression test in `editorTabContents.test.tsx` — fails on the pre-fix code.
- [x] Retract the secondary `realiaInfo` finding: `FragmentDtoFactory.create`
      already resolves realia info, so the POST response is complete. No fix.

## Pre-existing issues

- [x] `yarn tsc` was already failing: two `TS18046` in `SignImages.tsx` from
      Bluebird→`Promise<R>` inference collapsing to `unknown`. Fixed at the root.
- [x] `TextAnnotation.test.tsx` was 719 lines. Split into four focused test files
      with three shared support modules; behaviour identical.
- [x] `RealiaSelect.test.tsx` was flaky under the loaded full-suite run — it drove a
      300 ms real-timer debounce with real time, so a slow keystroke gap made the
      search fire on `'A'` instead of `'Apk'`. Fixed with fake timers +
      `userEvent.setup({ advanceTimers })` and a `toHaveBeenCalledTimes(1)` guard.
- [ ] `SignImages.tsx` is 444 lines (pre-existing, over the ceiling). Deliberately
      not split — unrelated subsystem, large refactor, needs its own task.
- [ ] Pre-existing coverage gaps outside the changed code, left in place and
      flagged in the log: the other editor tabs' `onSave` callbacks, the
      `handleSave` error branch, and four `SignImages.tsx` branches.

## Gate status (per copilot-instructions.md)

- [x] `yarn lint` clean.
- [x] `yarn tsc` clean.
- [x] `yarn test --watchAll=false` — 369/369 suites, 3739 passed, 2 skipped, zero
      failures, zero console output.
- [x] 250-line ceiling met by every added/edited file (largest 239).
- [x] Affected text-annotation code at 100% coverage; the new save callback is
      covered by `editorTabContents.test.tsx`.
- [x] Data-architecture and API-call-efficiency audits recorded in the log — no
      mixed collection, no added request, superseded saves cancelled.
- [x] Branch upstream verified before pushing anything: `branch.merge` is
      `refs/heads/add-realia-annotation` and `@{push}` is
      `origin/add-realia-annotation` — neither names `master`.
- [ ] Remove `TASK-realia-preview-broken-{todo,log,api-prompt}.md` and
      `TASK-realia-annotation-candidates-{todo,log}.md` before any PR merges.
