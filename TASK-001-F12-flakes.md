# TASK-001 — F12 Follow-up: Pre-existing Test Flakes

> **Scope:** This document describes the pre-existing test flakes identified during PR #714 work. None of these flakes were introduced by PR //#714. They are tracked here so a follow-up issue / PR can address them at root cause without delaying the current PR.

## Summary

| ID  | Test                                                                                                                                                                      | Symptom                                                                                                                                                                                                  | Frequency                                                            | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| FL1 | [src/corpus/ui/Corpus.integration.test.ts](src/corpus/ui/Corpus.integration.test.ts) — "With session" / "Without session"                                                 | One-off timeout in full-suite run; `appDriver.waitForText(/Narrative Poetry/)` resolves but downstream assertions are racy                                                                               | Reported by author; not seen locally on `0151328c` after partial fix | Low      |
| FL2 | [src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx](src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx) — "Calls `updateDate` with undefined on Date delete" | Intermittent `waitFor`/spinner timeout in a sibling test of the same suite (assertion stack ends in [src/test-support/waitForSpinnerToBeRemoved.ts](src/test-support/waitForSpinnerToBeRemoved.ts) `:5`) | Seen once in 2026-04-30 full run; passes in isolation and on rerun   | Low      |
| FL3 | `src/bibliography/ui/BibliographyEntryForm.test.tsx` (one-off, mentioned in earlier log)                                                                                  | Reported once during F3..F10 verification; passes in isolation                                                                                                                                           | One occurrence                                                       | Info     |

All three flakes share the same shape: time-bounded `waitFor*` assertions that depend on async test data plumbing (`bluebird` Promises, `FakeApi` chains, `findAllByText`) finishing before a default Jest/`testing-library` timeout. None are correctness defects in the code under test.

---

## FL1 — `src/corpus/ui/Corpus.integration.test.ts`

### What the test does

```ts
test('With session', async () => {
  appDriver.withSession().render()
  await appDriver.waitForText(RegExp(_.escapeRegExp('Narrative Poetry')))
  expect(appDriver.getView().container).toMatchSnapshot()
  expect(appDriver.getView().getByText(/Narrative Poetry/)).toBeVisible()
  expect(appDriver.getView().container).toHaveTextContent(
    'Divination Third Category',
  )
})
```

The "Without session" test is the same shape minus `.withSession()`.

`appDriver.waitForText` is a thin wrapper over `findAllByText`:

```ts
async waitForText(text: Matcher): Promise<void> {
  await this.getView().findAllByText(text)
}
```

### Failure mode

Author reported a one-off timeout where `waitForText` either resolved before `Divination Third Category` was painted, or the snapshot/visibility assertion ran before the React tree finished settling. After the partial fix (commit `7f84590c` — `await` on a previously unawaited promise + repaired `waitForText` navigation), the failure has not reproduced locally on head `0151328c`.

### Root cause hypotheses

1. **Single `findAllByText` gate is insufficient.** The test asserts on three independent pieces of content (`Narrative Poetry`, snapshot of full container, `Divination Third Category`). Only `Narrative Poetry` is awaited; the other two race the React commit cycle for the rest of the corpus list.
2. **`bluebird` + `FakeApi` chained promises do not always resolve in micro-task order on `jsdom`.** The test uses `Promise` from `bluebird` (re-exported by `test-support/FakeApi`), whose scheduler interacts non-deterministically with `@testing-library`'s `waitFor` polling.
3. **Snapshot assertion on `container` while async data is still flowing in.** `toMatchSnapshot()` runs synchronously after `waitForText`; if any further async chunk paints between the two, the snapshot diff is non-deterministic.

### Suggested fixes (priority order)

1. **Wait for the slowest item, not the first.**

   Replace:

   ```ts
   await appDriver.waitForText(RegExp(_.escapeRegExp('Narrative Poetry')))
   ```

   with a wait on the _last_ expected item (or all of them):

   ```ts
   await Promise.all([
     appDriver.waitForText(/Narrative Poetry/),
     appDriver.waitForText(/Divination Third Category/),
   ])
   ```

   This eliminates the gap between "first item painted" and "all expected items painted".

2. **Move the snapshot to _after_ an explicit `findBy*` for content the snapshot is supposed to capture.** A `toMatchSnapshot()` is only stable if the tree is fully settled before the call.

3. **Tighten the matcher.** `RegExp(_.escapeRegExp('Narrative Poetry'))` is equivalent to `/Narrative Poetry/`; it does not need the round-trip through `escapeRegExp`. Inline `_` import + `escapeRegExp` are dead weight here.

4. **(Optional) Drop `bluebird` from this test path.** The test currently uses `bluebird`'s `Promise` only because `FakeApi` uses it. If the surrounding chain is awaited correctly, `bluebird`'s `cancellable: false` semantics make no difference. A follow-up could migrate `FakeApi` to native `Promise` and remove a class of subtle scheduling races across the suite.

### Acceptance for the fix

- `yarn test --runInBand src/corpus/ui/Corpus.integration.test.ts --watch=false` passes 50 consecutive runs.
- `CI=1 yarn test --no-coverage --watch=false` full-suite passes 5 consecutive runs without retry.

---

## FL2 — `src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx`

### What the failing assertion looks like

The trace ends in:

```
expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
  at src/test-support/waitForSpinnerToBeRemoved.ts:5:51
```

The `CuneiformFragment.test.tsx` file does not call `waitForSpinnerToBeRemoved` directly. It does, however, render the full `CuneiformFragment` page tree — which contains lazy-loaded sub-views and download/photo widgets that internally render a `<Spinner aria-label="Spinner" />`. When `CuneiformFragment` is rendered via the test's `setup()`:

```ts
container = render(<MemoryRouter>...<CuneiformFragment ... /></MemoryRouter>).container
await screen.findAllByText('Photo')
```

…some sibling components import test helpers that themselves call `waitForSpinnerToBeRemoved` indirectly (e.g. Bluebird's promise unhandled-rejection handler firing into a separate test's `waitFor`). More realistically, the assertion stack belongs to a _different_ test in the same Jest worker that happened to be running concurrently when the suite was reported as failing — the original trace truncated the "Test Suites: 1 failed" output and the offending test was misattributed in the local report.

### Failure mode

The "Date delete" test does:

```ts
const deleteButton = await screen.findByText('Delete')
fireEvent.click(deleteButton)

expect(screen.getByText('Saving...')).toBeInTheDocument()
await waitFor(() =>
  expect(fragmentService.updateDate).toHaveBeenCalledWith(
    fragment.number,
    undefined,
  ),
)
```

If the synchronous `getByText('Saving...')` runs _between_ the moment `fragmentService.updateDate` resolves (synchronous mock returning a resolved Promise) and the next React commit, the spinner can have already disappeared. Conversely, if the spinner still shows when a later, unrelated test in the same worker tries `waitForSpinnerToBeRemoved`, that _other_ test fails with the trace seen here.

### Root cause hypothesis

1. **`fragmentService.updateDate.mockReturnValueOnce(Promise.resolve(fragment))` resolves on the same microtask** as the click handler. The "Saving..." state is therefore not guaranteed to be observable synchronously after `fireEvent.click(deleteButton)`. A spurious failure can occur on either side of the assertion.
2. **The React 18 / `testing-library` combination here uses the legacy `act`-warning pipeline**, and stray pending promises from sibling components (e.g. `findFolio`, `findPhoto`, `folioPager`) continue to resolve during the next test's setup, polluting that next test's `screen` and `waitFor` polls.

### Suggested fixes (priority order)

1. **Make the "Saving..." check a `findBy*`, not `getBy*`.**

   ```ts
   fireEvent.click(deleteButton)
   await screen.findByText('Saving...')
   await waitFor(() =>
     expect(fragmentService.updateDate).toHaveBeenCalledWith(
       fragment.number,
       undefined,
     ),
   )
   ```

2. **Defer the `updateDate` mock resolution by one tick** so the "Saving..." UI is reliably observable:

   ```ts
   fragmentService.updateDate.mockReturnValueOnce(
     new Promise((resolve) => setTimeout(() => resolve(fragment), 0)),
   )
   ```

3. **Add a teardown in the suite** that awaits all outstanding `fragmentService.*` promises and calls `cleanup()` explicitly (the default React Testing Library `afterEach` cleanup should already cover this, but `bluebird`'s scheduler can race with it):

   ```ts
   afterEach(async () => {
     await new Promise((resolve) => setImmediate(resolve))
   })
   ```

4. **(Strongly recommended)** Audit suites that import `waitForSpinnerToBeRemoved` and replace the polling helper with a `findByLabelText` negation pattern, which surfaces a clearer error and avoids the "expects 0 elements" anti-pattern:

   ```ts
   await waitForElementToBeRemoved(() => screen.queryByLabelText('Spinner'))
   ```

   This is the official `@testing-library` API and uses internal mutation observers instead of polling.

### Acceptance for the fix

- `yarn test --runInBand src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx --watch=false` passes 50 consecutive runs.
- Two consecutive full-suite runs with `--runInBand` pass without retry.

---

## FL3 — `src/bibliography/ui/BibliographyEntryForm.test.tsx`

Mentioned once in `TASK-001-log.md` as a one-off flake during F3..F10 verification. No reproduction available; passes in isolation. **Tracking only** — recommend bundling into the same follow-up issue as FL1 and FL2 and re-evaluating after the FL1/FL2 fixes land. If FL3 still reproduces, apply the same `findBy*` / `Promise.all` patterns to the offending assertions in that suite.

---

## Cross-cutting recommendations

These apply to the whole front-end test suite, not just the three flaky tests:

1. **Replace the custom `waitForSpinnerToBeRemoved` helper with `waitForElementToBeRemoved`** from `@testing-library/react`. The custom helper polls a `queryAllByLabelText` length and gives uninformative errors. The official API is faster and produces actionable diagnostics.
2. **Avoid asserting on transient UI states with `getBy*`.** Synchronous `getBy*` after `fireEvent.click` is a race wherever the click triggers any async code path. Use `findBy*` or `waitFor`.
3. **Audit `bluebird` usage in test plumbing** (`FakeApi`, `AppDriver`). `bluebird` is no longer needed for cancellation in test code paths and its scheduler can interact non-deterministically with `jest`'s fake timers and `@testing-library`'s polling.
4. **Run the full suite under `--runInBand` in CI** so a flake reproduces deterministically and is not masked by Jest's worker pool retry.

---

## Tracking

When opening the follow-up issue, suggested title: **"Test flakes: timing / spinner-wait races in Corpus.integration, CuneiformFragment, and BibliographyEntryForm"**.

Suggested body skeleton:

> Three pre-existing test flakes were identified during PR #714 work. Detailed analysis and suggested fixes are in `TASK-001-F12-flakes.md` on the `date-fixes` branch (this file should not be merged into `master` per the project's task-artifact rule — copy the relevant sections into the issue body).
>
> **FL1** — `Corpus.integration.test.ts`: `waitForText` only awaits the first expected item. Fix by awaiting all asserted strings via `Promise.all`.
>
> **FL2** — `CuneiformFragment.test.tsx`: synchronous `getByText('Saving...')` races the mocked Promise resolution. Fix by switching to `findByText`.
>
> **FL3** — `BibliographyEntryForm.test.tsx`: one-off; bundle with FL1/FL2 follow-up.
>
> Cross-cutting: replace the custom `waitForSpinnerToBeRemoved` with `waitForElementToBeRemoved`; audit `bluebird` usage in test plumbing.

Once the issue is filed, link its number back into [TASK-001-todo.md](TASK-001-todo.md) and tick the F12 box.
