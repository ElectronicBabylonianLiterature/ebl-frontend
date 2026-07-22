# TASK-remove-bluebird — Review (PR #774)

**PR:** #774 `chore/remove-bluebird` → `chore/ts7-tsconfig-migration`
**Title:** chore: remove bluebird, use AbortController for cancellation
**Reviewed head:** `origin/chore/remove-bluebird` (7ba6f490)
**Base:** `origin/chore/ts7-tsconfig-migration` (PR #773 — must merge first)

## Summary

Removes the `bluebird` dependency (176 files imported it) and replaces bluebird
promise-cancellation with web-standard `AbortController`/`AbortSignal`. The vast
majority of the 188-file diff is a correct mechanical swap (`Bluebird<T>`→`Promise<T>`,
`Bluebird.resolve/reject/all`→native). The genuinely risky, non-mechanical changes —
the custom `mapSeries`, `ConcurrencyLimiter`, the `Promise.all` tuple-typing fixes, and
the `ApiClient` signal plumbing — were each read in full and are correct.

All hard gates pass locally: `yarn tsc` clean, `yarn lint` clean,
`yarn test --watchAll=false` = 340 suites / 3470 passed / 2 skipped (pre-existing) with
**zero console output**, `yarn build` succeeds, and the dev server compiles clean and
serves HTTP 200. No `bluebird`/`Bluebird` references remain in `src`; `bluebird` and
`@types/bluebird` are removed from `package.json`.

The one substantive concern is that the AbortController migration is **incomplete
relative to its own plan** (Stage 3): the signal is created and threaded into `withData`
getters and `usePromiseEffect` operations, but no consumer forwards it to `fetch`, so
"cancellation" is now guard-based (prevents stale `setState`) rather than a true network
abort. This does not corrupt UI state, but it is a real behavior reduction versus the
bluebird implementation and the PR description overstates what reaches the wire.

## Findings

### Finding 1 — Cancellation no longer aborts the network request (was transparent under bluebird)

- **Severity:** Medium
- **Files:** `src/http/withData.tsx:42`, `src/http/cancellableFetch.ts`,
  `src/common/hooks/usePromiseEffect.ts:17`, plus all ~63 `withData` getters
  (e.g. `src/dictionary/ui/search/CorpusLemmaLines.tsx:44`) and mutation consumers
  (`src/fragmentarium/ui/info/ScriptSelection.tsx:135`).
- **Description:** On `master`, `cancellableFetch` created its **own** internal
  `AbortController` and registered a bluebird `onCancel` handler that called
  `abortController.abort()`; with `Promise.config({ cancellation: true })` enabled
  globally, `withData`/`usePromiseEffect` calling `.cancel()` propagated down the
  bluebird chain and aborted the actual socket — **transparently, for every getter, with
  no signal threading required**. The new `cancellableFetch` only forwards
  `options.signal`, and `withData` passes `abortController.signal` as a 2nd arg to the
  getter — but every getter has the shape `(props) => service.find(...)` and ignores it,
  and the services (`TextService`, etc.) do not accept a signal. Only 6 non-test source
  files thread `signal` at all. So `abort()` on unmount/prop-change no longer cancels the
  in-flight request.
- **Reproduction steps:**
  1. Open a page whose data loads via a `withData` component backed by a slow GET.
  2. Navigate away before it resolves.
  3. Observe (Network tab) the request runs to completion instead of being cancelled.
  4. For the mutation path: in `ScriptSelection`, change the script and click Save twice
     quickly. Both PUTs are sent; the superseded one is **not** aborted (only its `.then`
     is guarded by `signal.aborted`), so it still persists server-side.
- **Failure scenario:** wasted bandwidth/sockets on rapid navigation; for `ScriptSelection`
  a superseded PUT can still be applied server-side (out-of-order write risk). No stale
  data is rendered — the `requestSequence` guard in `withData` and the `signal.aborted`
  guards in consumers prevent incorrect UI, and React 18 makes post-unmount `setState` a
  silent no-op (no console noise).
- **Recommendation:** Complete Stage 3 — thread `signal` from getters through service
  methods into `ApiClient.fetchJson(path, auth, signal)` for the network-backed getters
  (and pass it to `updateScript`/other mutations). If guard-based supersession is the
  intended final design, say so explicitly in the code/PR and adjust the PR description so
  future maintainers do not assume socket-level cancellation. Either way, resolve before
  merge or file an explicit follow-up.

### Finding 2 — ~~This PR fixes 2 pre-existing `tsc` errors~~ — RETRACTED (no such errors)

- **Severity:** ~~Informational~~ — retracted
- **Correction:** An earlier draft claimed `master`/#773 failed `yarn tsc` at
  `SignImages.tsx:297,306` and that #774 fixed them. That was a **false positive**: the tsc
  runs used a worktree symlinking #774's `node_modules`, which no longer contains
  `@types/bluebird`, so bluebird types resolved to `unknown`. With a proper isolated
  `yarn install`, **#773 and `master` type-check cleanly** — there were no errors for this PR
  to fix. The `SignService` native-return changes remain a correct part of the mechanical
  bluebird removal; they simply do not "fix" anything pre-existing. No action.

### Finding 3 — Pre-existing DRY duplication flagged by qltysh bot (FIXED on #774)

- **Severity:** Low (pre-existing; surfaced by automated review)
- **File:** `src/corpus/application/TextService.ts:379-413` (`findColophons` /
  `findUnplacedLines`).
- **Description:** The two methods are identical except for the URL suffix
  (`colophons` vs `unplaced_lines`). `qltysh[bot]` raised two unresolved, non-outdated
  inline findings ("17 lines of similar code in 2 locations, mass=79"). The duplication
  **pre-dates this PR** — this branch only changed the `Bluebird<...>` return type to
  `Promise<...>`; the methods exist verbatim on `master`. The DRY hard gate and the
  "address every finding incl. bot findings at root cause" gate still apply.
- **Failure scenario:** none functionally; maintenance hazard — a fix to one path can miss
  the other.
- **Recommendation:** Extract a private helper, e.g.
  `fetchSiglaAndTransliteration(id, endpoint)`, and have both methods delegate. Then
  resolve the two bot threads.

## Severity

| #   | Finding                                                             | Severity | Blocker?                    |
| --- | ------------------------------------------------------------------- | -------- | --------------------------- |
| 1   | Cancellation no longer aborts network requests (incomplete Stage 3) | Medium   | Author decision — see below |
| 2   | Pre-existing DRY duplication in TextService (qlty bot, unresolved)  | Low      | No                          |

No High/Blocker correctness, security, or console-noise findings. No reviewer has
requested changes (only the automated `qltysh[bot]` COMMENTED review exists).

## Reproduction Steps

Environment: `yarn install` on `origin/chore/remove-bluebird`.

- Gates: `yarn tsc`, `yarn lint`, `CI=true yarn test --watchAll=false`, `yarn build` — all green, test run console-clean.
- App boot: `BROWSER=none PORT=3999 yarn start` → "Compiled successfully!", HTTP 200.
- Finding 1: see per-finding reproduction steps above.

## Recommendation

**Approve with a decision required on Finding 1.** The mechanical bluebird removal is
correct, well-tested, and console-clean, and every semantic hotspot was verified. Before
merge, the author should either (a) complete signal threading for network-backed getters
and mutations (closes the behavior gap), or (b) explicitly accept guard-based supersession
as the final design and correct the PR description. Finding 2 (pre-existing DRY) should be
extracted to resolve the two open bot threads. Remove the committed `TASK-*.md` docs before
merge.

## Comment Status Tracking

| Source                    | Location                            | Status         | Outdated |
| ------------------------- | ----------------------------------- | -------------- | -------- |
| `qltysh[bot]` (COMMENTED) | `TextService.ts:394` — similar-code | **Unresolved** | No       |
| `qltysh[bot]` (COMMENTED) | `TextService.ts:412` — similar-code | **Unresolved** | No       |

No human reviews (`APPROVED`/`CHANGES_REQUESTED`) exist. No general/issue comments exist.

## What Has To Be Done

1. **Decide Finding 1:** either thread `signal` through the network-backed `withData`
   getters + services + `ApiClient` (and `updateScript` and other mutations in
   `usePromiseEffect` consumers), OR document guard-based supersession as intended and fix
   the PR description's "use AbortController for cancellation" claim. (Blocker only if
   true network cancellation is a required behavior.)
2. **Resolve the two `qltysh[bot]` DRY threads** by extracting a shared
   `TextService` helper for `findColophons`/`findUnplacedLines`, then mark both threads
   resolved.
3. **Rebase/merge order:** #774 targets #773; #773 must merge to `master` first (or
   re-target #774 after).
4. **Remove committed TASK docs before merge:** `TASK-remove-bluebird-todo.md`,
   `TASK-remove-bluebird-log.md`, `TASK-remove-bluebird-review.md`, and the inherited
   `TASK-ts7-migration-*.md` files.
5. **Re-run gates after any change** from items 1–2: `yarn tsc`, `yarn lint`,
   `yarn test --watchAll=false` (console-clean), `yarn build`.
