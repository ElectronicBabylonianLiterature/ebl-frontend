# TASK-pr767-since-last-review — Work log

## Scoping

`TASK-pr767-post-docs-review.md` reviewed `f82c4bf7..HEAD` where HEAD was
`59dc9bcd`, and recorded its own findings (F1–F7) as fixed in the working tree.
Those fixes were then committed as `0082a777`, and the docs as `9286c18e`.
So the review already covers `0082a777`; the only unreviewed product change is:

- `b2404b16` — Redirect realia id URLs to the lemma URL

`git diff --stat 9286c18e..HEAD` confirms the change is 4 files:
`RealiaDisplay.tsx` (+13/-3), a new `RealiaDisplay.redirect.test.tsx` (139),
and two task docs.

Note: `9286c18e` is a docs-only commit, which departs from the standing rule
that task/review docs land in the same commit as the code they describe.
`b2404b16` follows the rule correctly. Not actionable now — already committed.

## GitHub review state (hard gate)

`gh` is not installed in this container; used the REST API via `curl` with the
`GITHUB_TOKEN` already in the environment.

- PR #767, open, head `b2404b16` — matches local HEAD, so nothing under review
  is stale against the remote.
- Timeline review events: 2, both `qltysh[bot]` / `COMMENTED`, both with empty
  bodies (`2026-07-13` @ `f37f6df0`, `2026-07-15` @ `123f5f3a`).
- Inline review comments: 5, all `qltysh[bot]`.
- General/issue comments: 0.
- Human reviews: 0. `CHANGES_REQUESTED`: 0.

All 5 inline comments carry `line: null` and are anchored to ancestor commits
(`original_commit_id` `f37f6df0` / `123f5f3a`), i.e. outdated against the head.
This matches the previous review's corrected F5: all five were fixed by
`b72cd593`, and the bot has not re-run. Re-verified at this head:
`TextAnnotationContext.test.tsx` no longer exists (split into
`.layers.test.tsx` / `.uniqueness.test.tsx` + `textAnnotationContext.testSupport.ts`),
and `cssCascade.testSupport.ts` `matches()` is decomposed. No live defect.

## Code review of `b2404b16`

Read `RealiaDisplay.tsx`, `http/withData.tsx`, `router/compat.tsx`,
`realia/ui/realiaPage.ts`, `realia/domain/RealiaEntry.ts`,
`realia/application/RealiaService.ts`, `realia/infrastructure/RealiaRepository.ts`,
`router/toolsRoutes.entities.tsx`, and the new test file.

Verified sound:

- **Generics change is safe.** `PROPS = WithoutData<{data; id}> = {id}`,
  `GETTER_PROPS = {realiaService}`, so the exported component's prop type stays
  `{id, realiaService}` and the single call site
  (`toolsRoutes.entities.tsx:82`) is unchanged. `withData` already spread
  `{...props}` onto the wrapped component, so `id` arrives without new plumbing.
- **No hooks-order violation.** `RealiaEntryDisplay` calls no hooks, so the
  early `return <Redirect/>` is legal. `eslint react-hooks` agrees (lint clean).
- **Loop guard is real, not redundant.** `entry.id !== id` is required: an entry
  whose `_id` matches `^realia_\d+$` would otherwise redirect onto its own URL
  and `Navigate` would re-fire every render. Pinned by the
  "does not loop when the entry id is itself the requested realia id" test.
- **Termination.** Requesting `realia_1` where `_id` is `realia_2` redirects
  once to `realia_2`, then the guard stops it. No cycle.
- **Hash/search preserved.** `router/compat`'s `Redirect` re-appends
  `location.search` and `location.hash`; `to` is `encodeURIComponent`-escaped so
  it can contain neither `?` nor `#` and cannot fool the shim's `split('#')`.
- **No open redirect.** `getRealiaPageUrl` percent-encodes the identifier, so a
  backend-supplied `_id` cannot escape the `/tools/realia/` prefix
  (`/` → `%2F`, no protocol-relative `//host`, no traversal).
- **Branch coverage of the new guard** is complete by construction: the three
  tests cover `isRealiaId=false`, `isRealiaId=true && entry.id===id`, and
  `isRealiaId=true && entry.id!==id`.

## Findings raised

- **F1 (Medium, efficiency gate).** The canonicalising redirect costs a second
  network request for an entry already in state. See review file.
- **F2 (Low, accuracy).** `b2404b16`'s message claims the extra request "is
  confined to the legacy path, since 59dc9bcd made alt+click open by lemma".
  Not true: `realiaCrossReferenceTarget` is `crossReference.lemma ||
crossReference.id`, so in-app cross-reference links emit a `realia_*` URL
  whenever a cross-reference's lemma is empty — a case explicitly pinned by
  `RealiaEntry.test.ts:45`. Reachable from See Also / AfO-register links.
- **F3 (Low, DRY gate).** 5 places build the realia page URL; only
  `RealiaDisplay` uses the `getRealiaPageUrl` helper.
- **F4 (Low, pre-existing).** Cross-reference `<Link>`s render `{lemma}` as
  their text, so the empty-lemma case produces a link with no accessible name.

## Gates

| Gate                             | Result                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint`                      | Pass, clean (66s)                                                                                                                                          |
| `yarn tsc`                       | Pass, no errors (40s)                                                                                                                                      |
| 250-line ceiling (changed files) | Pass — largest is `RealiaDisplay.tsx` at 221                                                                                                               |
| Branch upstream                  | Pass — `merge=refs/heads/add-realia-annotation`, `@{push}=origin/add-realia-annotation`; neither names `master`                                            |
| Data-kind separation             | Pass — diff adds no collection; `id` is a single scalar                                                                                                    |
| `yarn test --watchAll=false`     | Pass — 363/363 suites, 3727 passed, 2 pre-existing skips, 50 snapshots. **Zero console output** (grep for `console.*`/`Warning:`/act()/unhandled → 0 hits) |
| Coverage on changed files        | Pass — **100%** stmts/branch/funcs/lines on all 6 changed script files                                                                                     |

Suite grew from 362/3721 (previous review) to 363/3727: the new
`RealiaDisplay.redirect.test.tsx` suite and its 6 tests.

## Verification of the F1 loading-state claim

I had drafted "the user sees a second spinner" from reading `withData`. Rather
than ship an inferred claim, I verified it with a throwaway test
(`ScratchRedirectSequence.test.tsx`, created, run, and **deleted** — the tree is
back to only this review's 3 untracked docs). With the second `find` left
pending, after the redirect the `.withData-spinner` is in the document and
`<h1>Apkallu</h1>` is absent. Confirmed: the redirect discards the entry it just
resolved and re-enters the loading state. Test passed, then removed.

## Outcome of the review pass

Approve with changes. No correctness, regression, or security defect in the code
under review. F1 was the only blocker.

---

## Second pass — addressing the findings

The user asked for every finding except the task-doc removal to be addressed.

## F1 — fixed: one request across the redirect

Used the house cache utility (`common/utils/cache`), the same one
`BibliographyService` uses, rather than inventing a mechanism:

- `RealiaService` now holds `cachedEntries: Map<string, CacheEntry<RealiaEntry>>`
  with the house TTL (5 min) and a 100-key ceiling.
- `find` returns a cached entry when present; otherwise it fetches and caches the
  result under **both** the requested id and the canonical `entry.id`. Caching
  under both keys is what removes the redirect's second request: the redirect
  asks for the lemma, which the by-realia-id fetch already populated.

Safe to cache, checked rather than assumed:

- `RealiaRepository.fetchEntry` calls `fetchJson(path, false)` — unauthenticated,
  so a realia entry does not depend on per-context/session state. This satisfies
  the efficiency gate's caching proviso.
- `RealiaService` has no write path (only `find`/`search`), so there is no
  mutation that a cache could serve staled.
- `find` is consumed only by `RealiaDisplay`'s `withData`. Small blast radius.

**Residual, reported honestly:** the cache removes the _network_ redundancy (the
gate), but `withData` still does `setData(null)` when `id` changes, so the
redirect still tears the page down and remounts it. That is `withData`'s design,
not this diff's, and it is now a microtask rather than a round trip.

## F2 — cannot be fixed in the working tree

F2 is an inaccurate justification inside `b2404b16`'s **commit message**, which
is already pushed. Correcting it means rewriting a pushed commit, which needs
explicit user approval, so nothing was done to git history. Fixing F1 also makes
the claim moot: there is no extra request left to justify. Drafted a replacement
rationale for the user to use on the commit that carries these fixes.

## F3 — fixed: one way to build a realia page URL

Extracted `realia/ui/RealiaCrossReferenceLink.tsx`. All three cross-reference
link sites (`RealiaRedirect`, `RealiaParts.SeeAlsoList`,
`RealiaAfoRegister.AfoEntryCrossReference`) now render it, and
`RealiaResultsList` uses `getRealiaPageUrl` directly. `grep` for
`tools/realia/` now returns only the helper itself and the route pattern.

## F4 — fixed: cross-reference links always have an accessible name

`RealiaCrossReferenceLink` labels the link with `realiaCrossReferenceTarget(...)`
(`lemma || id`) instead of the raw `lemma`. Normal entries are unchanged
(lemma is non-empty); the empty-lemma case now renders the realia id as the link
text instead of nothing.

## A real flake found and fixed while verifying F1

The first version of `RealiaDisplay.redirectFetching.test.tsx` failed ~2 runs in 3. The failure was **not** `findByRole` timing out — it was `toBeInTheDocument()`
failing on an element `findByRole` had already returned. The redirect's
transient render was handing the test an `h1` that `withData` then detached.
That independently confirms the remount described under F1. Rewritten to assert
request counts (spying on `RealiaService.find`) instead of racing the DOM:
`find` is asked twice, the repository is hit once. Now 8/8 deterministic.

## Shared test-support change (required by the F1 fix)

`testDelegation`'s `beforeEach` calls the method once per generated `it`. With a
cache, the second `it` hit the cache and the repository was never called, so
`Delegates` failed. `testDelegation` already supported a factory at runtime
(`_.isFunction(object) ? object() : object`) but its type did not express it.
Widened the signature to `S | (() => S)` — additive, no existing call site
changes — so `RealiaService` gets a fresh instance per test. **No test was
removed**; the alternative was deleting the redundant `find` delegation case,
which needs approval and would have lost a real assertion.

Two incidental fixes fell out of that: `instance[method]` only ever compiled
because `any` propagated through the old ternary, so it is now typed via an
explicit `delegate.apply`; and `lodash` became unused in `utils.ts` and its
import was removed.

## Gates after the fixes

See the review file's Verification table.

Pre-existing 250-line violations exist outside this diff (e.g.
`test-support/complexTestText.ts` at 3514, `http/ApiClient.edge-cases.test.ts`
at 410). Untouched by `b2404b16` and out of scope for this review; recorded
here rather than silently ignored.
