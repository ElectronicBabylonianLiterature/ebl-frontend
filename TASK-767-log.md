# TASK-767 Work Log — Review of PR #767

## 2026-08-04

**Task:** Review PR, fetch all reviews and comments, check for failing checks and qlty issues.
**Scope:** Review only — no code changes made to the repository.

### Environment note

`gh` CLI is not installed in this container. Used the GitHub REST + GraphQL APIs directly
via `curl`/`python3` with `$GITHUB_TOKEN`. GraphQL was required for review-thread
`isResolved` / `isOutdated`, which REST does not expose.

### Steps

1. Identified the PR. Session-start git snapshot showed `fix-sitemap-automation-bot-identity`
   (PR #779); user corrected to `add-realia-annotation` → **PR #767**. Verified local
   `HEAD = 76011bb2ad2179ef25718e96f1b407b17afb7126` matches the PR head SHA exactly, so the
   working tree is the reviewed revision.
2. Fetched all timeline review events (6: 2 qlty bot COMMENTED, 2 Fabdulla1
   CHANGES_REQUESTED, 2 Fabdulla1 APPROVED).
3. Fetched all inline review comments (5) and all issue/general comments (0).
4. Fetched review threads via GraphQL: 5 total, **all resolved, all outdated**, all
   qlty bot (4 × similar-code, 1 × boolean-logic).
5. Checked CI: 8 check runs — 6 success, 2 skipped, **0 failing**. Commit status `success`
   with 3 qlty contexts: check "No blocking issues", coverage diff 100.0%, coverage 94.0%
   (+0.9%). The qlty web UI requires authentication, so per-issue detail beyond the bot's
   inline comments and the status contexts was not retrievable; noted as a limitation.
6. **Key timing observation:** the APPROVED review (2026-08-04T09:54:07Z) post-dates the
   last commit (2026-07-31T17:08:08Z). Its four pre-merge asks are therefore live against
   current head, not already-addressed. Verified each against source rather than assuming.
7. Verified the two earlier CHANGES_REQUESTED reviews were genuinely resolved:
   toggle label now "Toggle annotations"; `no-explicit-any`/`MockedClass` gone from
   `injectedApp.testSupport.tsx`; `RealiaSelect` rejection/staleness/unmount handled in the
   extracted `realiaOptionLoader.ts`; save-vs-refresh outcomes separated and covered by
   `TextAnnotation.saveOutcomes.test.tsx`.
8. Ran hard gates locally (full suite started in background first, as the long pole):
   - `yarn lint` → **exit 0**, no errors.
   - `yarn tsc` → **exit 0**, no errors.
   - `yarn test --watchAll=false` → **exit 0**; 405 suites passed, 3863 passed / 2 skipped,
     50 snapshots passed, 468.7 s. Grepped the full log for `console.error`/`console.warn`/
     `console.log`/`Warning:`/unhandled rejections/`not wrapped in act` → **0 matches**.
     Console-clean gate satisfied.
   - 250-line ceiling across all changed `.ts`/`.tsx` → **no file exceeds 250 lines**.
9. Ran the application (`yarn start:fast`): compiled successfully, `GET /` → 200,
   `GET /tools/realia/foo` → 200, no runtime errors or warnings in the dev-server log
   (only pre-existing browserslist-age and webpack-dev-server deprecation notices).
   Stopped the dev server afterwards (PID 6817) and confirmed port 3000 is closed.
10. Wrote `TASK-767-review.md` using the required template.

### Pre-existing issues found

- **Two permanently skipped tests** — `src/fragmentarium/ui/edition/Edition.test.tsx:49,53`
  use `xit(...)`. **Root cause:** introduced in commit `c65361c3` (2026-04-14, PR #692),
  unrelated to this PR; the file is not in this PR's diff.
  **Resolution:** _not_ changed. Project policy forbids removing, disabling, skipping, or
  re-enabling tests without explicit user confirmation, and the current task is a review with
  no code changes requested. Recorded as finding F5 and as item 7 of `What Has To Be Done`
  so it is tracked rather than silently dropped.
- No other pre-existing defects surfaced: lint, type check, full test suite, console
  cleanliness, file-size ceiling, and app boot were all clean.

### Outcome

No failing checks. No unresolved qlty issues. No outstanding CHANGES_REQUESTED.
Four live low/medium findings carried over from the 2026-08-04 approval, plus one
pre-existing out-of-scope note. Recommendation: **approve with minor follow-ups.**

## 2026-08-04 — Addressing the findings

**Task:** Address all findings from the review above. Code changes made; nothing committed.

### F3 / F4 — comments removed

Deleted the explanatory comment at `RealiaEntry.ts:30` and at
`fragmentQueryMapping.ts:93`. Deliberately kept `fragmentQueryMapping.ts:81`
(`// eslint-disable-next-line camelcase`) — that is a functional lint directive, and removing
it breaks `yarn lint`.

### F1 — read-only Realia indicator is now a real link

`SpanIndicatorView.tsx` returns `<a href={getRealiaPageUrl(label)} target="_blank"
rel="noopener noreferrer" aria-label=…>` for the first word of a Realia span, and the
`role: 'link'` / `tabIndex: 0` / `onKeyDown` shim (plus the `activationKeys` constant) is gone.
Focus, Enter/Space activation, middle-click, the context menu and copy-link-address are now
the browser's job. Continuation words of a multi-word span remain spans with `onMouseUp`,
preserving the existing "one tab stop per span" behaviour.

Two consequential cleanups, both needed to avoid leaving dead code behind:

- `openRealiaPageDirectly` was only reachable from the deleted key handler, so it was dropped
  from `SpanIndicatorPresentation` and kept as an internal helper of the hook.
- The `!realiaId` guard in `openRealiaPageOnClick` became unreachable once the handler is only
  attached when `realiaId` is truthy. Left in place it would have been a permanently
  uncovered branch, so it was removed.

Styling: `.span-indicator` is `position: absolute` with no text content, **but**
`&.initial::before` injects real text via `content`. As an `<a>` that text would pick up the
browser's default link colour and underline, so `color: inherit` / `text-decoration: none`
were added, including `:hover`/`:focus`. Verified the compiled rules reach the served bundle
(`.span-indicator {` and `.span-indicator:hover, .span-indicator:focus {`).

Tests rewritten in `SpanIndicatorView.test.tsx`: the old tests asserted the shim
(`role="link"`, `tabindex="0"`, `window.open` on Enter/Space), which no longer describes the
component. They now assert the real link contract — tag name, `href`, `target`, `rel`,
accessible name via `getByRole('link')`, absence of the shim attributes, keys left to the
browser, and continuation-word click behaviour including the ignored non-left click.

### F2 — spinner timeout: measured, then reverted

Rather than guess which test needed 3000 ms, the helper was first changed to take an optional
per-call timeout defaulting to RTL's, then **all 26 caller files were run**: 26 suites, 160
tests, all passed in 58 s. No caller needed the raise. An opt-in parameter nobody uses is
itself dead code, so `waitForSpinnerToBeRemoved.ts` was restored from `master` per the file
restore rule and verified byte-identical (`git diff master -- <file>` empty). This PR no
longer touches the file.

**Caveat recorded for the author:** measured in this container, which may be faster than CI.
If CI later surfaces a genuinely slow spinner test, the fix is a per-call timeout on that
test, not a suite-wide default.

### F5 — attempted, reverted, needs approval

Root cause established by attempting the repair: the two `xit` tests never call `setup()`,
use capitalised labels where the accessible names are lowercase, and the notes test compares
a DOM node to the notes **object** instead of `fragment.notes.text`. With all three corrected
they **still fail** — `Edition.test.tsx` renders the real Ace editor, which exposes no
matching label. The lowercase labels work in `TransliterationForm.test.tsx` only because that
file mocks `editor/Editor` with a plain input carrying `aria-label={name}`.

Un-skipping therefore requires duplicating that ~15-line mock (a DRY violation) to assert
what `TransliterationForm.test.tsx` already covers. The attempt was reverted and
`Edition.test.tsx` restored from `master`, verified byte-identical. Project policy requires
explicit approval before altering test skips, so this is left for the user with three options
recorded in `What Has To Be Done`.

### F6 — new pre-existing issue found (out of scope)

While re-checking the 250-line ceiling, `src/fragmentarium/domain/museum.ts` was found at
**472 lines**. **Root cause:** it crossed the ceiling on `master` in commit `23cf399f`
(PR #769) after this branch diverged. Verified not caused by this PR — absent from
`git diff master...HEAD --name-only`, and `git diff <merge-base> HEAD` for it is empty. The
earlier "no violations" result was correct: it used the merge-base (three-dot) diff, whereas
the two-dot diff also picks up master's later changes.

**Not fixed:** splitting it means restructuring an unrelated domain module and all its
imports, well outside the scope of addressing this PR's review findings. Raised as F6 for the
user's decision rather than done unilaterally.

### Gates after the fixes

- `yarn lint` → **exit 0**. (Two iterations: the first run flagged
  `jest-dom/prefer-in-document` and `testing-library/render-result-naming-convention` in the
  new tests; fixed by using `.not.toBeInTheDocument()` and renaming the helper to
  `getContinuationIndicator`. A later run was killed by SIGTERM from resource contention with
  the background suite, not by a lint error — re-run clean once the suite finished.)
- `yarn tsc` → **exit 0**.
- `yarn test --watchAll=false` → **exit 0**; 405 suites passed, **3866 passed** (+3 vs the
  3863 before), 2 skipped (the untouched pre-existing `xit` pair), 50 snapshots, 451.9 s.
  Console-noise grep over the full log → **0 matches**.
- Coverage on all four touched files → **100%** statements, branches, functions and lines.
- 250-line ceiling on every changed file → largest is `fragmentQueryMapping.ts` at 203.
- App → compiled successfully, `GET /` and `GET /tools/realia/Apkallu` both 200, no runtime
  errors; new CSS rules confirmed in the served bundle. Dev server stopped, port 3000 closed.

### Files changed (uncommitted)

| File                                                              | Change                                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/fragmentarium/ui/text-annotation/SpanIndicatorView.tsx`      | real anchor for read-only Realia links                                                         |
| `src/fragmentarium/ui/text-annotation/SpanIndicatorView.test.tsx` | tests rewritten for the link contract                                                          |
| `src/fragmentarium/ui/text-annotation/useSpanIndicator.ts`        | dropped `openRealiaPageDirectly` from the interface; removed the unreachable `!realiaId` guard |
| `src/fragmentarium/ui/text-annotation/TextAnnotation.sass`        | neutralised default anchor styling                                                             |
| `src/realia/domain/RealiaEntry.ts`                                | comment removed                                                                                |
| `src/fragmentarium/infrastructure/fragmentQueryMapping.ts`        | comment removed                                                                                |
| `src/test-support/waitForSpinnerToBeRemoved.ts`                   | restored from `master`                                                                         |

Nothing was committed, branched, or pushed.

## 2026-08-04 — F5 and F6 (user approved both)

### F5 — editor mock extracted, both tests un-skipped

Took option (b). Created `src/editor/Editor.testSupport.tsx` with the `EditorMock` component
(default export), plus `resetEditorMock()` and `editorErrorOf(name)` backed by a recorded-props
registry — the old design used a closure variable local to `TransliterationForm.test.tsx`,
which cannot be shared across files.

**Wiring the mock took two attempts.** The natural
`jest.mock('editor/Editor', () => ({__esModule: true, default: require(...).default}))` is
rejected by `@typescript-eslint/no-require-imports`. Importing the mock at module scope and
referencing it in the factory is rejected by jest's hoisting rule (out-of-scope variable).
`jest.mock('editor/Editor', () => jest.requireActual('editor/Editor.testSupport'))` satisfies
both: `jest.*` is whitelisted inside mock factories and no out-of-scope binding is captured.

Verified the actual-module registry is shared between `jest.requireActual` and the test file's
own `import`: if it were not, `editorErrorOf` would always return null and the five error tests
would fail. They pass.

`Edition.test.tsx`: both `xit` tests converted to `it`, with `setup()` added, lowercase labels
(`transliteration`, `notes`) and `toHaveValue(fragment.notes.text)`. Suite went from
3866 passed / 2 skipped to **3868 passed / 0 skipped**; no skip marker remains in `src/`.

### F6 — museum.ts split

`museum.ts` is now 20 lines: three imports, a spread-merge under `as const`, and the unchanged
`MuseumKey` / `Museum` declarations. Its public API is identical, so none of the 8 consumers
changed. Data lives in `museums/museumsAToI.ts` (150), `museums/museumsKToP.ts` (159) and
`museums/museumsRToZ.ts` (156). Split points were chosen from a per-letter line census so that
boundaries fall on whole letters (no J or Q keys exist) and each file keeps ~90 lines of
headroom.

Two equivalence checks, neither assumed:

- **Data** — parsed old (`git show HEAD:…`) and new entries: 65 vs 65, identical key sets,
  zero entries with differing content, original ordering preserved.
- **Types** — a temporary probe file asserted `MuseumKey` accepts a key from each of the three
  groups and rejects a bogus key under `@ts-expect-error`. This is the load-bearing check: had
  the spread widened the union to `string`, the `@ts-expect-error` would have failed as unused
  and `tsc` would have errored. It compiled clean; the probe was deleted.

### F7 — new finding, fixed

Re-checking the ceiling afterwards showed `TransliterationForm.test.tsx` at 257 lines, still
over. **Root cause:** it was already 284 at HEAD; removing the inlined mock only cut it to 257.
Since the file was touched it had to comply. Instead of splitting a coherent suite in two, the
real duplication was removed — an identical 9-line `render(<TransliterationForm … />)` block
occurring **6 times** — behind a `renderForm(updateEditionMock)` helper (parameter renamed to
avoid shadowing the module-level `updateEdition`). **284 → 226 lines**, DRY gate and ceiling
both satisfied, 28 tests still passing.

### Correction to F6's original framing

F6 was first written as though `museum.ts` were the notable ceiling violation. A repo-wide
count shows **75 of 1092** `.ts`/`.tsx` files exceed 250 lines on `master`, and **none of the
files this PR touches did**. The ceiling is in practice enforced against files a change
touches, and by that measure the PR was already compliant. `museum.ts` and
`TransliterationForm.test.tsx` are fixed; the remaining 74 are a separate repo-wide task, noted
in `What Has To Be Done`.

### Gates after F5–F7

- `yarn lint` → **exit 0** (after fixing the `no-require-imports` and prettier errors above).
- `yarn tsc` → **exit 0**.
- `yarn test --watchAll=false` → **exit 0**; 405 suites, **3868 passed, 0 skipped**, 50
  snapshots, 400.2 s. Console-noise grep → **0 matches**.
- Coverage → **100%** statements/branches/functions/lines on `Editor.testSupport.tsx`,
  `RealiaEntry.ts`, `SpanIndicatorView.tsx`, `useSpanIndicator.ts`, `museum.ts` and all three
  `museums/*.ts`.
- 250-line ceiling on every changed file → largest is 226.
- App → compiled successfully; `/`, `/tools/realia/Apkallu` and `/fragmentarium` all 200; museum
  keys from all three new modules present in the served bundle; no runtime errors. Dev server
  stopped, port 3000 closed.

**Environment note:** two full runs with `--coverage` were killed mid-suite ("the process
exited too early") — the container had only ~2.4 GB free and coverage instrumentation OOMs.
This is a container limit, not a test failure: the same suite passes without coverage, and
coverage was obtained by running it in small per-module batches. A batch reaching 100% is
conclusive, since a wider run cannot lower it.

### Reminder

`TASK-767-todo.md`, `TASK-767-log.md`, and `TASK-767-review.md` must be removed before the
PR is merged.
