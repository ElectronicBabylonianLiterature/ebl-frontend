# TASK-767 Review — PR #767 "Add realia annotation layer to named entity annotation"

- **PR:** [#767](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/767)
- **Author:** khoidt · **Base:** `master` · **Head:** `76011bb2ad2179ef25718e96f1b407b17afb7126`
- **Size:** 181 files, +19,661 / −11,101, 33 commits
- **State:** open, `mergeable_state = clean`
- **Reviewed at:** 2026-08-04
- **Findings addressed at:** 2026-08-04 (F1–F7 all fixed in the working tree, uncommitted)

---

## Status After Fixes

| Finding                                              | Status                                                |
| ---------------------------------------------------- | ----------------------------------------------------- |
| F1 — read-only Realia indicator is a fake link       | ✅ **Fixed**                                          |
| F2 — global 3000 ms spinner timeout                  | ✅ **Fixed** (helper restored to `master`)            |
| F3 — comment in `RealiaEntry.ts`                     | ✅ **Fixed**                                          |
| F4 — comment in `fragmentQueryMapping.ts`            | ✅ **Fixed**                                          |
| F5 — pre-existing `xit` tests in `Edition.test.tsx`  | ✅ **Fixed** (approved) — both un-skipped and passing |
| F6 — `museum.ts` exceeds the 250-line ceiling        | ✅ **Fixed** (approved) — split into three modules    |
| F7 — `TransliterationForm.test.tsx` over the ceiling | ✅ **Fixed** — deduplicated 284 → 226 lines           |

Gates re-run after the fixes:

| Gate                              | Result                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `yarn lint`                       | ✅ 0 errors                                                                        |
| `yarn tsc`                        | ✅ 0 errors                                                                        |
| `yarn test --watchAll=false`      | ✅ 405 suites, **3868 passed, 0 skipped**, 0 failed                                |
| Console noise                     | ✅ **zero**                                                                        |
| Coverage on every touched file    | ✅ **100%** stmts / branches / funcs / lines                                       |
| 250-line ceiling on changed files | ✅ largest is 226                                                                  |
| App boots and serves              | ✅ compiled successfully, `/` and `/tools/realia/Apkallu` → 200, no runtime errors |

---

## Summary

Adds a Realia annotation layer alongside the existing named-entity annotation in the
fragmentarium text annotation tool, plus the supporting Realia domain/service/UI layer.

All automated gates are green, both on CI and reproduced locally:

| Gate                                         | Result                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `yarn lint`                                  | ✅ 0 errors                                                                    |
| `yarn tsc`                                   | ✅ 0 errors                                                                    |
| `yarn test --watchAll=false`                 | ✅ 405 suites, 3863 passed, 0 failed (as first reviewed)                       |
| Console noise in test output                 | ✅ **zero** occurrences                                                        |
| 250-line file ceiling (changed `.ts`/`.tsx`) | ✅ no file exceeds 250 lines                                                   |
| CI check runs (8)                            | ✅ all success/skipped, 0 failing                                              |
| qlty check                                   | ✅ "No blocking issues"                                                        |
| qlty coverage diff                           | ✅ 100.0% (75% threshold)                                                      |
| qlty coverage total                          | ✅ 94.0% (+0.9%)                                                               |
| App boots (`yarn start:fast`)                | ✅ compiled successfully, `/` and `/tools/realia/:id` → 200, no runtime errors |

**There are no failing checks and no unresolved qlty issues.** All five qlty bot review
threads are resolved and outdated against the current head.

The one thing that matters for merge readiness: the most recent review is an **APPROVAL
submitted 2026-08-04T09:54:07Z, which post-dates the last commit (2026-07-31T17:08:08Z)**.
It therefore carried four concrete pre-merge asks that were still live against current head.
They were non-blocking (the reviewer approved) but explicit, and **all four have since been
addressed** — see `Status After Fixes` above.

---

## Comment Status Tracking

### Timeline review events (all)

| #          | Reviewer    | State             | Submitted  | Status                        |
| ---------- | ----------- | ----------------- | ---------- | ----------------------------- |
| 4686217547 | qltysh[bot] | COMMENTED         | 2026-07-13 | Superseded — threads resolved |
| 4703525359 | qltysh[bot] | COMMENTED         | 2026-07-15 | Superseded — thread resolved  |
| 4753665596 | Fabdulla1   | APPROVED          | 2026-07-22 | Superseded                    |
| 4753712550 | Fabdulla1   | CHANGES_REQUESTED | 2026-07-22 | ✅ Resolved (see below)       |
| 4815952885 | Fabdulla1   | CHANGES_REQUESTED | 2026-07-30 | ✅ Resolved (see below)       |
| 4852895727 | Fabdulla1   | **APPROVED**      | 2026-08-04 | ✅ All 4 asks now addressed   |

### Inline review threads (all 5)

| Thread | File                                 | Rule               | Resolved | Outdated | Resolved by |
| ------ | ------------------------------------ | ------------------ | -------- | -------- | ----------- |
| 1      | `TextAnnotationContext.test.tsx:105` | qlty:similar-code  | ✅       | ✅       | qltysh[bot] |
| 2      | `TextAnnotationContext.test.tsx:121` | qlty:similar-code  | ✅       | ✅       | qltysh[bot] |
| 3      | `TextAnnotationContext.test.tsx:157` | qlty:similar-code  | ✅       | ✅       | qltysh[bot] |
| 4      | `TextAnnotationContext.test.tsx:175` | qlty:similar-code  | ✅       | ✅       | qltysh[bot] |
| 5      | `cssCascade.testSupport.ts:110`      | qlty:boolean-logic | ✅       | ✅       | qltysh[bot] |

**Unresolved inline threads: 0.** **General/issue comments: 0.**

### Earlier CHANGES_REQUESTED items — verified resolved

| Ask (date)                                                                        | Verification                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle label said "Toggle named entities" but controls both layers (07-22)        | ✅ `FragmentDisplaySettings.tsx:96-97` now reads `Toggle annotations` for both `title` and `aria-label`                                                                                                                                |
| `injectedApp.testSupport.tsx` `no-explicit-any` + `jest.MockedClass<any>` (07-30) | ✅ Neither the eslint-disable nor `MockedClass` remains in the file                                                                                                                                                                    |
| `RealiaSelect` unhandled rejection / stale-result race / unmount (07-30)          | ✅ Extracted to `realiaOptionLoader.ts`: rejection handled (`() => respond(requestId, callback, [])`), staleness guarded by `requestId === latestRequestId`, unmount guarded by `isDisposed` + `load.cancel` wired through `useEffect` |
| Editor conflates persistence success with refresh success (07-30)                 | ✅ `TextAnnotation.saveOutcomes.test.tsx` now covers save-ok/refresh-ok, save-ok/refresh-fail (marked saved, not dirty, not retry-duplicated), save-fail (stays dirty, retryable), and stale refresh (newer edit stays dirty)          |

---

## Findings

### F1 — Read-only Realia indicator is a fake link, losing native browser affordances

`SpanIndicatorView.tsx:36-47` renders a `<span>` carrying `role: 'link'`, `tabIndex: 0`,
and an `onMouseUp` handler instead of a real anchor:

```tsx
const linkProps =
  realiaId && isInitial
    ? {
        role: 'link',
        tabIndex: 0,
        'aria-label': `Open the Realia page for ${label}`,
        onKeyDown: handleKeyDown,
      }
    : {}
const realiaProps = realiaId
  ? { onMouseUp: openRealiaPageOnClick, ...linkProps }
  : {}
```

`openRealiaPageOnClick` explicitly returns `false` for any non-left button, so middle-click
does nothing. Users lose middle-click-to-new-tab, the link context menu, "Copy link
address", and Ctrl/Cmd-click.

This is directly fixable: the target is derived synchronously, with no async lookup —
`getRealiaPageUrl(identifier)` in `realia/ui/realiaPage.ts` is a pure string function, and
`label` is already in hand at render time. The read-only view can render
`<a href={getRealiaPageUrl(label)} target="_blank" rel="noopener noreferrer">` and drop the
`role`/`tabIndex`/`onKeyDown` shim entirely, keeping the interactive span only where editing
requires it.

- **Severity:** Medium (accessibility + UX regression vs. a native link; not a correctness bug)
- **Raised by:** Fabdulla1, 2026-08-04 review
- **Status:** ✅ **Fixed.** `SpanIndicatorView` now returns a real
  `<a href={getRealiaPageUrl(label)} target="_blank" rel="noopener noreferrer">` for the
  first word of a Realia span, with the `role`/`tabIndex`/`onKeyDown` shim deleted — the
  browser supplies focus, keyboard activation, middle-click, the context menu and
  copy-link-address natively. Continuation words of a multi-word span stay interactive spans,
  preserving the existing "one tab stop per span" behaviour. Two follow-on cleanups: the now
  externally-unused `openRealiaPageDirectly` was dropped from the hook's public interface, and
  the `!realiaId` guard was removed from `openRealiaPageOnClick` because the caller now
  guarantees it (leaving it would have been an unreachable branch and a coverage hole).
  `.span-indicator` gained `color: inherit` / `text-decoration: none` (plus `:hover`/`:focus`)
  so the anchor does not inherit default link styling on the `&.initial::before` label text.

### F2 — Spinner-wait timeout tripled globally for the whole suite

`src/test-support/waitForSpinnerToBeRemoved.ts` adds a module-level constant applied to
every caller:

```diff
+const spinnerTimeout = 3000

-  await waitFor(() => { ... })
+  await waitFor(() => { ... }, { timeout: spinnerTimeout })
```

This raises the wait from React Testing Library's 1000 ms default to 3000 ms for **all 27
test files** that import the shared helper, most of which are unrelated to Realia. The
practical effect is that a future render-performance regression anywhere in those 27 files
gets up to 3× longer to hide before a test fails, and genuinely hanging tests take 3× longer
to report. The PR contains no justification for why the default is insufficient suite-wide.

Preferred fix: pass the longer timeout as an optional per-call argument at the specific
Realia test/workflow that needs it, leaving the shared default at RTL's. If the raise really
is needed suite-wide, that rationale belongs in the PR description.

- **Severity:** Medium (test-quality / regression-masking; no production impact)
- **Raised by:** Fabdulla1, 2026-08-04 review
- **Status:** ✅ **Fixed.** Measured before choosing: all 26 test files that use the helper
  were run against RTL's default timeout and **all 26 passed** (160 tests, 58 s), so no caller
  needed the raise. Rather than add an opt-in parameter no one would use, the helper was
  restored from `master` and verified byte-identical (`git diff master -- <file>` empty), so
  this PR no longer touches the file at all. Caveat for the author: this was measured in this
  container, which may be faster than CI. If CI later shows a genuinely slow spinner test, the
  fix is a per-call timeout argument on that test — not a suite-wide default.

### F3 — Explanatory comment left in `RealiaEntry.ts`

`realia/domain/RealiaEntry.ts:30`:

```ts
// The route resolves entries by their `_id`, which equals the lemma.
return crossReference.lemma || crossReference.id
```

Both the reviewer's pre-merge ask and the project coding standard ("Do not add comments to
the code unless explicitly requested") call for its removal.

- **Severity:** Low (style / project-convention)
- **Raised by:** Fabdulla1, 2026-08-04 review
- **Status:** ✅ **Fixed** — comment deleted.

### F4 — Explanatory comment left in `fragmentQueryMapping.ts`

`fragmentarium/infrastructure/fragmentQueryMapping.ts:93`:

```ts
// Display-only lightweight fragment: fields absent from the query summary use placeholders.
```

Same rationale as F3.

**Do not remove line 81** (`// eslint-disable-next-line camelcase`) — that is a functional
lint directive, not an explanatory comment, and deleting it will break `yarn lint`.

- **Severity:** Low (style / project-convention)
- **Raised by:** Fabdulla1, 2026-08-04 review
- **Status:** ✅ **Fixed** — comment deleted; the `eslint-disable` directive at line 81 kept.

### F5 — Pre-existing: two permanently skipped tests (out of scope for this PR)

`src/fragmentarium/ui/edition/Edition.test.tsx:49,53` use `xit(...)` for
"Renders transliteration field" and "Renders notes field". These account for the
`2 skipped` in the suite summary.

Confirmed **pre-existing and unrelated to this PR**: the file is not in this PR's diff, and
the skips date to commit `c65361c3` (2026-04-14, PR #692). Flagged for visibility only —
re-enabling them is a separate task, and per project policy no test may be
removed/skipped/re-enabled without explicit approval.

- **Severity:** Low (pre-existing, out of this PR's scope)
- **Raised by:** this review
- **Status:** ⏸️ **Blocked on your approval.** Root cause established by attempting the repair:
  1. Neither test ever calls `setup()`, so nothing is rendered when they run.
  2. The labels are wrong — `getByLabelText('Transliteration')`/`('Notes')` are capitalised,
     but the accessible names are lowercase.
  3. `expect(screen.getByLabelText('Notes')).toEqual(fragment.notes)` compares a DOM node to
     the notes **object**; the value is `fragment.notes.text`.

  The repair was attempted with all three corrected and **still fails**: `Edition.test.tsx`
  renders the real Ace editor, which exposes no matching label at all. The lowercase labels
  work in `TransliterationForm.test.tsx` only because that file mocks `editor/Editor` with a
  plain input carrying `aria-label={name}`.

  So un-skipping requires copying that ~15-line editor mock into `Edition.test.tsx` — a DRY
  violation — and the resulting assertions would merely re-verify what
  `TransliterationForm.test.tsx` already covers (transliteration and notes values reaching the
  fields). `Edition.test.tsx`'s own job, wiring the pieces together, is already covered by its
  two live tests.

  **Resolution (approved 2026-08-04):** option (b). The editor mock was extracted from
  `TransliterationForm.test.tsx` into `src/editor/Editor.testSupport.tsx` and both test files
  now consume it via `jest.mock('editor/Editor', () =>
jest.requireActual('editor/Editor.testSupport'))`. A first attempt used
  `require(...)` inside the factory, which `@typescript-eslint/no-require-imports` rejects;
  `jest.requireActual` is permitted inside a `jest.mock` factory and needs no out-of-scope
  variable, so it satisfies both jest's hoisting rules and the lint gate.

  The shared module also replaces the old closure variable `editorError` with a recorded-props
  registry (`editorErrorOf`, `resetEditorMock`), so the error assertions survive the move. That
  the registry is genuinely shared is proved by the error tests still passing — a split module
  registry would make `editorErrorOf` always return null and fail them.

  Both tests are now un-skipped and passing, with `setup()` added, lowercase labels, and
  `fragment.notes.text`. **The suite now reports 3868 passed and 0 skipped**; no `xit`,
  `it.skip`, `describe.skip` or `xdescribe` remains anywhere in `src/`.

### F6 — Pre-existing: `museum.ts` exceeds the 250-line ceiling (out of scope for this PR)

`src/fragmentarium/domain/museum.ts` is **472 lines**, against the project's hard 250-line
ceiling.

Confirmed **not caused by this PR**: the file does not appear in
`git diff master...HEAD --name-only`, and `git diff <merge-base> HEAD` for it is empty. It
crossed the ceiling on `master` via commit `23cf399f` ("Add NATIONAL_MUSEUM_OF_ORIENTAL_ART",
PR #769) after this branch diverged. Every file this PR _does_ touch is within the ceiling
(largest: `fragmentQueryMapping.ts` at 203 lines).

**Correction to the earlier framing of this finding.** When first raised, F6 was presented as
though `museum.ts` were the notable violation. A repo-wide count shows it is one of **75 files
out of 1092** that exceed 250 lines on `master`. The ceiling is, in practice, enforced against
files a change touches — and by that measure **this PR was already compliant**: no file in
`git diff master...HEAD` exceeded the limit.

- **Severity:** Low (pre-existing on `master`, out of this PR's scope)
- **Raised by:** this review
- **Status:** ✅ **Fixed (approved 2026-08-04).** `museum.ts` is now a 20-line module that
  merges three data modules and re-exports the same public API (`Museums`, `MuseumKey`,
  `Museum`), so all 8 consumers are untouched:
  - `museums/museumsAToI.ts` — 150 lines, 21 entries
  - `museums/museumsKToP.ts` — 159 lines, 23 entries
  - `museums/museumsRToZ.ts` — 156 lines, 21 entries

  Boundaries fall on whole letters (there are no J or Q keys), so a new museum has an obvious
  home and each file keeps ~90 lines of headroom.

  Two equivalence checks were run rather than assumed. **Data:** all 65 entries are present,
  byte-identical, and in the original order. **Types:** a temporary probe asserted
  `MuseumKey` still accepts keys from all three groups and rejected a bogus key via
  `@ts-expect-error` — had the spread widened the union to `string`, the `@ts-expect-error`
  would itself have failed as unused. The probe compiled clean and was deleted.

  **Not fixed:** the other 74 files over the ceiling. Bringing them under is a repo-wide
  refactor unrelated to this PR and belongs in its own task.

### F7 — `TransliterationForm.test.tsx` over the 250-line ceiling

Surfaced while re-checking the ceiling after the F5 work. The file was **284 lines at HEAD** —
already over before this session — and removing the inlined editor mock brought it to 257,
still over.

Because the file was touched, it had to come under the limit. Rather than fragment a coherent
suite across two files, the actual duplication was removed: an identical 9-line
`render(<TransliterationForm … />)` block appeared **6 times**, replaced by a single
`renderForm(updateEditionMock)` helper. The parameter is deliberately not named `updateEdition`
so it does not shadow the module-level variable. This satisfies the DRY gate and the ceiling at
once: **284 → 226 lines**, with all 28 tests in the folder still passing.

- **Severity:** Low (pre-existing, surfaced by this work)
- **Raised by:** this review
- **Status:** ✅ **Fixed.**

---

## Severity

| ID  | Finding                                            | Severity | Blocker?               | Status   |
| --- | -------------------------------------------------- | -------- | ---------------------- | -------- |
| F1  | Read-only Realia indicator is a fake link          | Medium   | No — reviewer approved | ✅ Fixed |
| F2  | Global 3000 ms spinner timeout across 27 files     | Medium   | No — reviewer approved | ✅ Fixed |
| F3  | Comment left in `RealiaEntry.ts:30`                | Low      | No                     | ✅ Fixed |
| F4  | Comment left in `fragmentQueryMapping.ts:93`       | Low      | No                     | ✅ Fixed |
| F5  | Pre-existing `xit` tests in `Edition.test.tsx`     | Low      | No — out of scope      | ✅ Fixed |
| F6  | Pre-existing `museum.ts` over the 250-line ceiling | Low      | No — out of scope      | ✅ Fixed |
| F7  | `TransliterationForm.test.tsx` over the ceiling    | Low      | No — pre-existing      | ✅ Fixed |

**No blockers.** No reviewer currently has an outstanding CHANGES_REQUESTED: both earlier
ones were superseded by the 2026-08-04 approval, and every item in them is verified fixed.

---

## Reproduction Steps

**F1 — fake link:**

1. `yarn start` and open a fragment with Realia annotations in the read-only display.
2. Middle-click a Realia span indicator → nothing happens (expected: opens in a new tab).
3. Right-click it → the browser link context menu is absent, so "Open link in new tab" and
   "Copy link address" are unavailable.
4. Source confirmation: `SpanIndicatorView.tsx:36-47` (no `href`); `useSpanIndicator.ts:61-67`
   (`openRealiaPageOnClick` returns `false` unless `event.button === 0`).

**F2 — global timeout:**

1. `git diff master...HEAD -- src/test-support/waitForSpinnerToBeRemoved.ts` shows the added
   `{ timeout: 3000 }`.
2. `grep -rl "waitForSpinnerToBeRemoved" src/ | wc -l` → `27` affected test files.

**F3 / F4 — comments:**

1. `sed -n '30p' src/realia/domain/RealiaEntry.ts`
2. `sed -n '93p' src/fragmentarium/infrastructure/fragmentQueryMapping.ts`

**F5 — skipped tests:**

1. `grep -n "xit(" src/fragmentarium/ui/edition/Edition.test.tsx` → lines 49, 53.
2. `git diff master...HEAD --name-only | grep Edition.test` → no match (pre-existing).

---

## Recommendation

**Approve with minor follow-ups.** The change is well tested (100% diff coverage, +0.9%
total), lint/type/test clean with zero console noise, respects the 250-line ceiling, and
every substantive concern from the two earlier CHANGES_REQUESTED reviews is verifiably fixed
at the root cause rather than papered over — in particular the `RealiaSelect` rejection and
stale-result races, which are now handled in a dedicated, independently testable loader.

The four open asks from the 2026-08-04 approval are small and worth doing before merge. F1
is the only one with user-visible impact; F2 is worth fixing because the cost of a
suite-wide masked regression outlives this PR. F3/F4 are two line deletions.

---

## What Has To Be Done

1. ✅ **F1 — done.** `SpanIndicatorView.tsx` renders a real anchor; the `role`/`tabIndex`/
   `onKeyDown` shim is gone; the editing view keeps its interactive span.
2. ✅ **F1 tests — done.** `SpanIndicatorView.test.tsx` now asserts the tag name, `href`,
   `target` and `rel`, that the link is exposed with its accessible name via `getByRole`,
   that no `role`/`tabindex` shim remains, that key presses are left to the browser, and that
   a continuation word is still a span with working left-click and ignored non-left-click.
3. ✅ **F2 — done.** `waitForSpinnerToBeRemoved.ts` restored from `master` (verified
   identical) after confirming all 26 caller files pass at the RTL default.
4. ✅ **F3 — done.** Comment deleted from `src/realia/domain/RealiaEntry.ts`.
5. ✅ **F4 — done.** Comment deleted from
   `src/fragmentarium/infrastructure/fragmentQueryMapping.ts`; the `eslint-disable` directive
   at line 81 kept.
6. ✅ **Hard gates re-run — done.** `yarn lint` 0 errors, `yarn tsc` 0 errors,
   `yarn test --watchAll=false` 405 suites / 3866 passed / 0 failed / zero console output,
   100% coverage on all four touched files, 250-line ceiling respected, app boots and serves.
7. ✅ **F5 — done** (option b, approved). Editor mock extracted to
   `src/editor/Editor.testSupport.tsx` and shared by both test files via
   `jest.requireActual`; both tests un-skipped and passing. **0 skipped tests remain in the
   repository.**
8. ✅ **F6 — done** (approved). `museum.ts` split into three data modules behind an unchanged
   public API; data and type equivalence both verified.
9. ✅ **F7 — done.** `TransliterationForm.test.tsx` deduplicated from 284 to 226 lines.
10. **Re-review follow-up** — None required to unblock: no CHANGES_REQUESTED is outstanding
    and the 2026-08-04 approval stands. Reviewer assignment is left to the repository owner.
11. **Commit** — all changes are **uncommitted** in the working tree. Per project convention
    the `TASK-767-*.md` docs belong in the same commit as the code, not a separate docs commit.
12. **Optional, separate task** — the other **74** files over the 250-line ceiling on `master`.
13. **Before merge — remove task docs:** delete `TASK-767-todo.md`, `TASK-767-log.md`, and
    `TASK-767-review.md`.
