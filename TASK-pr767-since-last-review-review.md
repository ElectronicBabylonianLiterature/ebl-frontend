# TASK-pr767-since-last-review

Review of the changes on `add-realia-annotation` (PR #767) made **since the last
review**, `TASK-pr767-post-docs-review.md`.

## Scope

The previous review covered `f82c4bf7..59dc9bcd` and recorded its own findings
(F1–F7) as fixed **in the working tree**. Those fixes were then committed as
`0082a777`, and the docs as `9286c18e`. The previous review therefore already
covers `0082a777`, and the only unreviewed **product** change is:

| Commit     | Subject                                     | Product diff                                                            |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `b2404b16` | Redirect realia id URLs to the lemma URL    | `RealiaDisplay.tsx` +13/-3, new `RealiaDisplay.redirect.test.tsx` (139) |
| `9286c18e` | Add task tracking, review, API debug prompt | docs only                                                               |

## Summary

`b2404b16` canonicalises the realia URL: `/tools/realia/realia_000846` now
replaces itself with `/tools/realia/Apkallu`. The redirect sits at the top of
`RealiaEntryDisplay` — after `withData` has resolved the entry — because the
lemma is not knowable from the URL alone. It is a pure URL canonicalisation: how
the entry is _resolved_ is unchanged, since `RealiaService.find` already
dispatched on `isRealiaId`.

**The change is correct.** Everything load-bearing checks out:

- **The generics change is safe.** Moving `id` into `withData`'s `PROPS`
  (`WithoutData<{data; id}>`) leaves the exported prop type as
  `{id, realiaService}`, so the one call site
  ([toolsRoutes.entities.tsx:82](src/router/toolsRoutes.entities.tsx#L82)) is
  untouched. `withData` already spread `{...props}` onto the wrapped component,
  so `id` arrives with no new plumbing.
- **No hooks-order violation.** `RealiaEntryDisplay` calls no hooks, so the
  early `return <Redirect/>` is legal; `eslint react-hooks` confirms.
- **The `entry.id !== id` loop guard is required, not redundant.** An entry
  whose `_id` matches `^realia_\d+$` would otherwise redirect onto the URL it is
  already on, and `Navigate` re-runs its effect every render. Pinned by an
  explicit test.
- **Termination holds in the non-obvious case too.** Requesting `realia_1` where
  `_id` is `realia_2` redirects once, then the guard stops it. No cycle exists.
- **Search and hash survive.** `router/compat`'s `Redirect` re-appends
  `location.search`/`location.hash`, and because `getRealiaPageUrl`
  percent-encodes the identifier, the target can contain neither `?` nor `#` and
  cannot fool the shim's `split('#')`. A deep link such as
  `#realia-section-afo-register` still lands — covered by a test.
- **No open redirect.** `encodeURIComponent` means a backend-supplied `_id`
  cannot escape the `/tools/realia/` prefix: `/` becomes `%2F`, so neither a
  protocol-relative `//host` nor `../` traversal is expressible.
- **The new guard's three branches are all covered** (`isRealiaId` false;
  `isRealiaId` true with `entry.id === id`; `isRealiaId` true with
  `entry.id !== id`).

All hard gates pass: `yarn lint` clean, `yarn tsc` clean, and
`yarn test --watchAll=false` green at **363 suites / 3727 passed / 2 pre-existing
skips** with **zero console output** (up from 362/3721 — the new suite and its 6
tests). Coverage on the changed files is 100%.

The findings below are one efficiency issue that the **API Call Efficiency**
gate requires be raised (F1), an inaccurate justification in the commit message
(F2), and two low-severity quality items (F3, F4). None is a correctness defect.

## Findings

### F1 — The canonicalising redirect re-fetches an entry already in state

`RealiaEntryDisplay` redirects **after** `withData` has resolved the entry. The
redirect changes the route param, `withData`'s `watch: (props) => [props.id]`
sees a new `id`, and it fetches the _same entry_ a second time — by lemma this
time. Two requests, `GET /realia/by-id/realia_000846` then
`GET /realia/Apkallu`, for data the client already held.

The diff's own test pins the behaviour, so this is not in doubt:

```ts
// RealiaDisplay.redirect.test.tsx:78
it('resolves the entry by realia id, then re-resolves it by lemma', ...)
expect(realiaService.find).toHaveBeenCalledWith(realiaId)
expect(realiaService.find).toHaveBeenCalledWith(lemma)
```

The cost is not only the request. Because `withData` does `setData(null)` when
`id` changes, the redirect also throws away the entry it just resolved and shows
a **second spinner** — so the page is not merely slower to settle, it visibly
reloads. I verified this rather than inferring it: with the second `find` left
pending, after the redirect the `.withData-spinner` is in the document and the
`<h1>Apkallu</h1>` is absent.

The **API Call Efficiency** gate says data needed to render a page is fetched
once and then read from state, and requires a finding for any redundant call.
There are two honest readings, and the reviewer should say so rather than pick
the convenient one:

- **Strict:** the entry is in state and is fetched again. Redundant. A finding.
- **Lenient:** the redirect is a genuine navigation to a different URL, and each
  URL fetches exactly once. Compliant.

I record it as a finding under the strict reading, since the instructions make
the audit a gate and resolving efficiency findings a blocker for approval. My
own assessment is that the cost is modest — **one** extra `GET` on a
non-primary path — and that accepting it deliberately is defensible. What is
not defensible is the stated reason for accepting it (see F2).

Options considered:

1. **Memoise in `RealiaService`** — after `findByRealiaId` resolves, cache the
   entry under `entry.id` so the follow-up `find(lemma)` is served locally. A
   realia entry does not depend on per-context state, so the gate's caching
   proviso is satisfied.
2. **Pass the resolved entry through router state** and short-circuit with
   `withData`'s existing `filter`/`defaultData` config. **Rejected** —
   `RealiaEntry.references` holds `Reference` class instances built by
   `createReference`, and `history.state` must be structured-cloneable, so the
   prototypes would not survive.
3. **Accept it**, with the rationale corrected per F2.

### F1 — resolution (**fixed**)

Took option 1, using the house cache utility (`common/utils/cache`) that
`BibliographyService` already uses, rather than inventing a mechanism:

- `RealiaService` holds `cachedEntries: Map<string, CacheEntry<RealiaEntry>>`
  with the house 5-minute TTL and a 100-key ceiling.
- `find` serves a cached entry when present, else fetches and caches under
  **both** the requested id and the canonical `entry.id`. The second key is what
  removes the redirect's request: the redirect asks for the lemma, which the
  by-realia-id fetch has already populated.

My earlier reservation about caching was the staleness window. The house TTL
bounds it, and two properties I checked rather than assumed make it safe here:
`RealiaRepository.fetchEntry` uses `fetchJson(path, false)` (unauthenticated, so
no per-session variation), and `RealiaService` has no write path that a cache
could serve staled. `find` is consumed only by `RealiaDisplay`.

Pinned by `RealiaDisplay.redirectFetching.test.tsx`, which drives a **real**
`RealiaService` over a mocked `RealiaRepository`: `find` is asked twice (once per
URL), the repository is hit once, and `find` (the lemma endpoint) is never
called.

**Residual, stated plainly:** the cache removes the network round trip — the
thing the gate is about — but `withData` still resets `data` to `null` when `id`
changes, so the redirect still remounts the page. That is `withData`'s design
rather than this path's, and the reload is now a microtask instead of a request.
Changing it would mean reworking `withData`, which is out of scope here.

### F2 — The commit message's justification for the extra request is wrong

`b2404b16`'s message says:

> It is confined to the legacy path, since 59dc9bcd made alt+click open by lemma.

That is not true, and it matters because it is the stated grounds for accepting
F1. [`realiaCrossReferenceTarget`](src/realia/domain/RealiaEntry.ts#L27-L33) is:

```ts
return crossReference.lemma || crossReference.id
```

So **in-app** cross-reference links emit a `realia_*` URL whenever a
cross-reference's lemma is empty — and the empty-lemma case is not hypothetical,
it is explicitly pinned by
[RealiaEntry.test.ts:44-48](src/realia/domain/RealiaEntry.test.ts#L44-L48). Three
live call sites build links that way:

- [RealiaRedirect.tsx:25-27](src/realia/ui/RealiaRedirect.tsx#L25-L27) — the "see" pointer
- [RealiaParts.tsx:86-88](src/realia/ui/RealiaParts.tsx#L86-L88) — the See Also list
- [RealiaAfoRegister.tsx:43-45](src/realia/ui/RealiaAfoRegister.tsx#L43-L45) — AfO-register cross-references

The double fetch is therefore reachable by clicking a See Also link inside the
app, not only by following a stale bookmark. The redirect is _more_ valuable
than the message claims (it canonicalises in-app navigation too), and its cost
is _less_ confined than the message claims.

### F3 — Five places build the realia page URL; only one uses the helper

`getRealiaPageUrl(identifier)` is exactly
`` `/tools/realia/${encodeURIComponent(identifier)}` ``. `b2404b16` adopted it
in `RealiaDisplay`, which is right — but four call sites still inline the same
mapping:

| Site                                                                | Form                                              |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| [RealiaResultsList.tsx:35](src/realia/ui/RealiaResultsList.tsx#L35) | `'/tools/realia/' + encodeURIComponent(entry.id)` |
| [RealiaRedirect.tsx:25](src/realia/ui/RealiaRedirect.tsx#L25)       | template literal                                  |
| [RealiaParts.tsx:86](src/realia/ui/RealiaParts.tsx#L86)             | template literal                                  |
| [RealiaAfoRegister.tsx:43](src/realia/ui/RealiaAfoRegister.tsx#L43) | template literal + `${volumeAnchor}`              |

The DRY hard gate applies: the same domain mapping in more than one place should
be a shared helper. The helper already exists and is now the established way to
say this. Pre-existing, but this diff is what made `getRealiaPageUrl` canonical,
so the inconsistency is newly visible.

### F4 — Cross-reference links render an empty accessible name when the lemma is empty

Pre-existing, and adjacent to F2 rather than caused by it. All three
cross-reference link sites use the target for the `to` but `{lemma}` for the
link **text**:

```tsx
<Link
  to={`/tools/realia/${encodeURIComponent(realiaCrossReferenceTarget(crossReference))}`}
>
  {crossReference.lemma}
</Link>
```

In exactly the case the `||` fallback exists for — an empty lemma — the `to`
falls back to the realia id but the text does not, producing a link with no
accessible name. Screen readers announce nothing; there is no click target text.
Worth a follow-up issue rather than a fix in this PR.

## Severity

| ID  | Finding                                           | Severity | Blocker                      | Status                               |
| --- | ------------------------------------------------- | -------- | ---------------------------- | ------------------------------------ |
| F1  | Redirect re-fetches an entry already in state     | Medium   | Yes, per the efficiency gate | **Fixed**                            |
| F2  | Commit message's justification for F1 is wrong    | Low      | No                           | **Open — user decision**             |
| F3  | `getRealiaPageUrl` duplicated at 4 call sites     | Low      | No                           | **Fixed**                            |
| F4  | Empty accessible name on empty-lemma link         | Low      | No                           | **Fixed**                            |
| F5  | Flaky test racing the redirect's transient render | Medium   | No                           | **Fixed** (found while verifying F1) |

No correctness defect, regression, or security issue was found in the code under
review.

### F5 — flaky test found while verifying the F1 fix

Not present in `b2404b16`; introduced by my own first attempt at the F1
regression test, and worth recording because of what it revealed.

`RealiaDisplay.redirectFetching.test.tsx` failed roughly two runs in three. The
failure was **not** `findByRole` timing out — it was `toBeInTheDocument()`
failing on an element `findByRole` had already returned. The redirect's
transient render (page re-rendered with the entry `withData` was about to
discard) handed the test an `h1`, which `withData` then detached when it reset
`data` to `null`. That is independent confirmation of the remount described in
F1.

Rewritten to assert request counts by spying on `RealiaService.find` rather than
racing the DOM, which is also the more direct statement of what F1 is about.
Verified 8/8 deterministic. The pre-existing
`RealiaDisplay.redirect.test.tsx` was checked for the same latent race and is
stable 8/8.

## Reproduction Steps

**F1** — Open `/tools/realia/realia_000846` with the network tab open. Observe
`GET /realia/by-id/realia_000846`, then, after the URL becomes
`/tools/realia/Apkallu`, a second `GET /realia/Apkallu` returning the same
entry. Two spinners render. Alternatively run
`RealiaDisplay.redirect.test.tsx:78`, which asserts both calls.

**F2** — Read [RealiaEntry.ts:27-33](src/realia/domain/RealiaEntry.ts#L27-L33)
and [RealiaEntry.test.ts:44-48](src/realia/domain/RealiaEntry.test.ts#L44-L48),
then any of the three link sites in F2. A cross-reference with `lemma: ''`
produces `/tools/realia/realia_000846` from inside the app.

**F3** — `grep -rn "tools/realia/" src --include=*.tsx | grep -v '\.test\.'`

**F4** — Render a `SeeAlsoList` with a cross-reference whose `lemma` is `''`;
the `<li>` contains a `<Link>` with no text.

## Verification Performed

Re-run after the fixes:

| Gate                             | Result                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint` (eslint + stylelint) | Pass, clean                                                                                                                         |
| `yarn tsc`                       | Pass, no errors                                                                                                                     |
| `yarn test --watchAll=false`     | **365/365 suites, 3737 passed, 2 skipped** (review pass: 363/3727; before the branch's last review: 362/3721)                       |
| Console noise                    | **Zero** — no `console.*`, no `Warning:`, no act() noise, no unhandled rejections                                                   |
| Coverage of changed files        | **100%** stmts / branch / funcs / lines, including `RealiaService.ts`, `RealiaCrossReferenceLink.tsx` and `common/utils/cache.ts`   |
| 250-line ceiling (changed files) | Pass — largest is `RealiaDisplay.tsx` at 221; every file I touched is ≤ 152                                                         |
| API-call efficiency              | **Pass** — F1 fixed; one request across the redirect, pinned by a test                                                              |
| Data-kind separation             | Pass — no collection added; `id` is a single scalar; the cache is one kind keyed two ways, both resolving to the same `RealiaEntry` |
| Flake check                      | New test 8/8 deterministic; pre-existing `RealiaDisplay.redirect.test.tsx` 8/8                                                      |
| Branch upstream                  | Pass — `merge=refs/heads/add-realia-annotation`, `@{push}=origin/add-realia-annotation`; neither names `master`                     |

The two skipped tests (`xit` in
[Edition.test.tsx:49](src/fragmentarium/ui/edition/Edition.test.tsx#L49)) are
pre-existing on `master` since #692 and were left untouched.

Pre-existing 250-line violations exist outside this diff (e.g.
`test-support/complexTestText.ts` at 3514, `http/ApiClient.edge-cases.test.ts`
at 410). `b2404b16` does not touch them; recorded rather than silently ignored.

**Not performed:** the app was not driven in a browser. The realia redirect
needs an authenticated session against a live backend, which is not available in
this environment. The behaviour is nevertheless machine-verified end-to-end:
`RealiaDisplay.redirect.test.tsx` drives a route-faithful harness that reads
`id` from `useParams` inside a real `MemoryRouter`, so the assertions exercise
the actual `Redirect` → `Navigate` → re-render → re-fetch path rather than a
hand-passed prop.

## Recommendation

**Approve with changes.** `b2404b16` is a small, correct, well-tested change.
The redirect terminates in every case I could construct, preserves search and
hash, cannot open-redirect, and its loop guard is genuinely load-bearing rather
than defensive noise. The test file is the right shape: it drives the real
router rather than asserting against a prop, which is what lets it catch a loop.

**Update after the fix pass.** The user asked for every finding except the
task-doc removal to be addressed, so F1, F3 and F4 are now fixed in the working
tree and all gates are green. My original recommendation was to accept F1's extra
request rather than cache; that reservation was about the staleness window, and
the house cache utility's 5-minute TTL plus the fact that realia entries are
unauthenticated and have no write path answers it. The fix is smaller and more
idiomatic than I expected.

Only **F2** remains, and it is genuinely the user's call: the false rationale is
in a **pushed commit message**, and correcting it rewrites history. Fixing F1
also makes the claim moot — there is no extra request left to justify. A drafted
replacement rationale is in
`TASK-pr767-since-last-review-commit-message.md`.

F3 and F4 were pre-existing; they are fixed here because the user asked, not
because this PR caused them.

## Comment Status Tracking

Gathered via the REST API (`gh` is not installed in this container; used `curl`
with the `GITHUB_TOKEN` already in the environment). PR head `b2404b16` matches
local HEAD, so nothing under review is stale against the remote.

| Source                                      | Status                                                                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qltysh[bot]` inline × 5                    | **Unresolved but outdated** — all `line: null`, anchored to ancestor commits `f37f6df0`/`123f5f3a`; all fixed at HEAD by `b72cd593`. Safe to dismiss. |
| `qltysh[bot]` review `COMMENTED` 2026-07-13 | No body; no action                                                                                                                                    |
| `qltysh[bot]` review `COMMENTED` 2026-07-15 | No body; no action                                                                                                                                    |
| Human reviews                               | **None submitted**                                                                                                                                    |
| `CHANGES_REQUESTED` events                  | **None**                                                                                                                                              |
| General / issue comments                    | **None** (0)                                                                                                                                          |

Re-verified the five bot threads against this head: `TextAnnotationContext.test.tsx`
no longer exists (split into `.layers.test.tsx` / `.uniqueness.test.tsx` plus
`textAnnotationContext.testSupport.ts`), and `cssCascade.testSupport.ts`'s
`matches()` is decomposed into a `checks` array. No live defect. No new review
activity since the previous review.

## What Has To Be Done

1. ~~**Decide F1**~~ — **done**. Fixed with the house cache utility; the redirect
   now costs one request, pinned by `RealiaDisplay.redirectFetching.test.tsx`.
2. **Correct the F2 rationale — outstanding, needs your decision.** The claim
   that the extra request is "confined to the legacy path" is false; in-app
   cross-reference links with an empty lemma reach it. Fixing F1 makes the claim
   moot, but the false text still sits in `b2404b16`'s pushed commit message.
   Correcting it means amending a pushed commit (rewrite + force-push) or adding
   a note to the PR description. **Not done** — that needs your say-so. A
   drafted replacement rationale is in
   `TASK-pr767-since-last-review-commit-message.md`.
3. **Delete every `TASK-*.md` before merge** — **10** files. Six are already
   committed to the branch, so they will reach `master` unless removed:
   `TASK-pr767-api-debug-prompt.md`, `TASK-pr767-findings-log.md`,
   `TASK-pr767-findings-todo.md`, `TASK-pr767-post-docs-review.md`,
   `TASK-realia-id-redirect-log.md`, `TASK-realia-id-redirect-todo.md`.
   Four are untracked in the working tree (this review's):
   `TASK-pr767-since-last-review-{todo,log,review,commit-message}.md`.
   The user explicitly asked for this to be left alone for now.
4. ~~**Follow-up issue for F3**~~ — **done** at the user's request. Extracted
   `RealiaCrossReferenceLink`; `grep` for `tools/realia/` now returns only
   `getRealiaPageUrl` and the route pattern.
5. ~~**Follow-up issue for F4**~~ — **done** at the user's request. The shared
   link labels itself `lemma || id`, so it always has an accessible name.
6. **Optionally dismiss the five stale `qltysh[bot]` threads** on GitHub, or
   leave them for the bot's next run.
7. **Manual browser pass before merge** — not possible here (needs an
   authenticated session against a live backend). Worth one check that
   `/tools/realia/realia_000846` lands on `/tools/realia/Apkallu` with a section
   hash preserved.
8. **Reviewer assignment / re-review is yours** — no reviewer changes were made.
