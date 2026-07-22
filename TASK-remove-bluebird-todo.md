# TASK-remove-bluebird — TODO

Remove the `bluebird` dependency entirely, replacing promise cancellation with the
web-standard `AbortController`/`AbortSignal` threaded through the fetch chain.
Chosen approach: **AbortSignal threading** (not a custom promise wrapper).
Branch: `chore/remove-bluebird`. Separate PR from #773 (tsconfig migration).

Scope: 176 files import bluebird. ~18 use the cancellation API; a handful use
`mapSeries`/`delay`/`reflect`/`Promise.config`/`try`/`map`; the rest are mechanical
`Promise` typings + `.resolve/.reject/.all` (native-compatible).

Status: [x] done · [~] in progress · [ ] pending

## Stage 1 — fetch foundation (signal → fetch) [DONE]

- [x] `cancellableFetch.ts` → native `fetch`, signal via options.
- [x] `ApiClient.ts` → native `Promise`, thread `signal?` through fetch/fetchJson/fetchBlob/postJson/putJson; skip capturing `AbortError`.
- [x] `withData.tsx` → own `AbortController`, pass `signal` to getter, `abort()` on cleanup; detect `AbortError`/`signal.aborted`.
- [x] Global mechanical sweep of 175 files (imports removed, `Bluebird<T>`→`Promise<T>`, `.resolve/.reject/.all`→native).
- [x] `Promise.config` (bluebird cancellation) removed from `index.tsx` + `setupTests.ts`.
- [x] `mapSeries` native helper + TextService/LemmatizationFactory.
- [x] 4 `.all(promise-of-array)` / tuple-inference fixes (AfoRegisterRepository, GlossaryFactory, WordDisplayLogograms, WordInfoLemmas).

## Stage 1b — cancellation consumers [DONE]

- [x] `usePromiseEffect.ts` → `AbortController` `[run, cancel]` API + 8 consumers migrated.
- [x] `ConcurrencyLimiter.ts` (+ test) → signal-based queue abort.
- [x] `getOrFetchCachedValue.ts` → in-flight reuse (dropped `.isCancelled()`).
- [x] Save-forms: `WordEditor`, `TransliterationForm`, `BibliographyEntryForm(Controller)`.
- [x] `CuneiformConverterForm` → concurrency via `ConcurrencyLimiter`.
- [x] Rewrote 10 cancellation test suites to AbortController semantics.

## Gates

- [x] `yarn tsc` → clean.
- [x] `yarn lint` → clean.
- [x] Full `CI=true yarn test --watchAll=false` → 340 suites / 3470 passed, 2 skipped (pre-existing), console-clean.
- [x] `yarn build` → success.
- [x] `bluebird` + `@types/bluebird` removed from package.json.
- [x] Commit + push branch (`7ba6f490`, pushed to `origin/chore/remove-bluebird`).
- [ ] Open PR (separate from #773).
- [ ] Remove TASK docs before merge.

## Stage 2 — cancellation-aware utils

- [ ] `ConcurrencyLimiter.ts` (+ test) → signal-based queue/abort.
- [ ] `getOrFetchCachedValue.ts` → native promises; drop `.isCancelled()` cache guard.
- [ ] Save-forms using `.cancel()`: `TransliterationForm`, `WordEditor`, `BibliographyEntryForm(Controller)`.

## Stage 3 — services + getters (signal threading)

- [ ] Thread `signal?: AbortSignal` through service methods used by getters.
- [ ] Update the ~63 `withData` getters to forward `signal`.

## Stage 4 — bluebird-specific helpers

- [ ] `mapSeries` (~11), `delay` (~4), `reflect` (2), `Bluebird.try`/`map`, `Promise.config` (setupTests/index).

## Stage 5 — mechanical `Promise` typing swap

- [ ] Remaining ~150 files: `import Promise from 'bluebird'` / `Bluebird<T>` → native.

## Stage 6 — remove dependency + gates

- [ ] Remove `bluebird` + `@types/bluebird` from package.json; `yarn install`.
- [ ] `yarn tsc`, `yarn lint`, full test suite, `yarn build` — all green, console-clean.
- [ ] Remove TASK docs before merge.
