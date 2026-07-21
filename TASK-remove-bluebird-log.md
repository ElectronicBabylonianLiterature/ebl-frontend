# TASK-remove-bluebird — Work Log

Remove the `bluebird` dependency, replacing promise cancellation with the web-standard
`AbortController`/`AbortSignal`. Branch `chore/remove-bluebird`; separate PR from #773.

## Approach

**AbortSignal threading** (user's choice over a custom cancellable-promise wrapper). The
`AbortController` lives in the React layer; a `signal` threads down to `fetch`.

## Core changes

- **`cancellableFetch`** → thin native `fetch(url, options)` (signal arrives via options).
- **`ApiClient`** → native promises; `signal?: AbortSignal` threaded through
  `fetch`/`fetchJson`/`fetchBlob`/`postJson`/`putJson` into the fetch options.
  `AbortError` is **excluded** from error capture (an abort is expected, not a fault).
- **`withData`** → owns an `AbortController` per request, passes `signal` to the getter,
  `abort()`s on cleanup; cancellation detected via `AbortError`/`signal.aborted` (was
  `CancellationError`/`.isCancelled()`).
- **`usePromiseEffect`** → new `[run, cancel]` API. `run(operation => Promise)` owns an
  `AbortController`, aborts the previous run, swallows `AbortError`. All 8 consumers
  migrated (gate their state updates on `!signal.aborted`).
- **`ConcurrencyLimiter`** → native queue; optional `signal` aborts a _queued_ operation
  (removes it from the queue). Running operations are not interrupted (native limitation)
  but still release their slot on completion.
- **`getOrFetchCachedValue`** → in-flight requests are always reused (the `.isCancelled()`
  cache-eviction path is gone; a failed request still evicts via `.finally`).
- **Class save-forms** (`WordEditor`, `BibliographyEntryFormController`,
  `BibliographyEntryForm`) and **`TransliterationForm`** → `AbortController` field/ref,
  gate `setState` on `signal.aborted`.

## Bluebird-specific helpers

- `Promise.mapSeries`/`Bluebird.mapSeries` → new `common/utils/mapSeries` helper
  (sequential async map) in `TextService`, `LemmatizationFactory`.
- `Bluebird.map(_, _, { concurrency })` (CuneiformConverterForm) → routed through
  `ConcurrencyLimiter` (preserves the bound).
- `Promise.config({ cancellation: true })` removed from `index.tsx` / `setupTests.ts`.
- `.all(promise-of-array)` (Bluebird deep-resolve) simplified in `AfoRegisterRepository`,
  `GlossaryFactory`, `WordDisplayLogograms`; one tuple-inference annotation in
  `WordInfoLemmas`.

## Mechanical sweep

175 files: `import … from 'bluebird'` removed; `Bluebird<T>`→`Promise<T>`;
`.resolve/.reject/.all`→native. Test mocks kept explicit `Bluebird.resolve` where they
fed Bluebird-typed services → converted to native `Promise.resolve`.

## Test rewrites (cancellation semantics changed)

`cancellableFetch`, `withData`, `usePromiseEffect`, `ApiClient.edge-cases`,
`ConcurrencyLimiter`, `FragmentButton`, `WordEditor`, `BibliographyEditor`,
`FragmentService` — rewritten from Bluebird `.cancel()`/`.isCancelled()` assertions to
`AbortController`-observable behavior (signal aborted, no state update after unmount,
signal forwarded to fetch, aborted-queued-op removed, re-fetch after failed in-flight).
Aborted queued promises get `.catch()` guards to keep the console-clean gate.

## Dependency

`bluebird` + `@types/bluebird` removed from `package.json`; `yarn install` rerun.
(`node_modules/bluebird` remains only as a transitive dep of other packages; src has
zero references.)

## Behaviour notes / deliberate changes

- Data fetches (`withData` getters) abort the network on unmount **iff** the getter
  threads the signal to the service; where it does not, the existing `requestSequence`
  guard still prevents stale state (no correctness regression).
- Save/download flows gate state updates on `signal.aborted` rather than aborting the
  network mid-write (aborting an in-flight write is undesirable anyway).
- A "cancelled in-flight request" is no longer a concept; the cache reuses in-flight
  requests and evicts on settle.

## Gates

- `yarn tsc` → clean (184 files changed, +957/−996).
- `yarn lint` → clean (after prettier auto-fix).
- Full `CI=true yarn test --watch=false` → recorded here.
- `yarn build` → to run after tests.
