# TASK-realia-id-redirect — Work Log

Goal: `/tools/realia/realia_000846` must redirect to `/tools/realia/Apkallu`.
Branch `add-realia-annotation`. Not committed.

## Design decision — why the redirect lives in the component

`RealiaEntry.id` **is** the lemma (it is the Mongo `_id`; the API branch's
`resolve_realia_info` maps `lemma=entry.id`). So the lemma is not knowable from
the URL alone — it requires resolving the entry first. That rules out redirecting
at the route level in `toolsRoutes.entities.tsx`, which has no entry in hand.

`RealiaService.find` already dispatches on `isRealiaId(id)`
(`/^realia_\d+$/`): a realia id goes to `findByRealiaId`, anything else is
treated as the `_id`/lemma. So a realia-id URL already resolved and rendered —
it just kept the non-canonical URL. The change is therefore only about
canonicalising the URL, not about fetching differently.

The redirect sits at the top of `RealiaEntryDisplay`, which `withData` renders
only once the entry has resolved. `withData` spreads all props onto the wrapped
component, so exposing `id` to it needed only a generics change:
`WithoutData<{ data: RealiaEntry; id: string }>` as `PROPS` and
`{ realiaService: RealiaService }` as `GETTER_PROPS`. The exported component's
public prop type is unchanged, so no call site moved.

## Implementation

```tsx
if (isRealiaId(id) && entry.id !== id) {
  return <Redirect to={getRealiaPageUrl(entry.id)} />
}
```

- `Redirect` comes from `router/compat` (this repo is react-router v6 behind a
  v5-shaped shim). It maps to `<Navigate replace>`, so Back does not bounce
  between the id URL and the lemma URL.
- The shim's `getRedirectTarget` re-appends `location.search` and
  `location.hash` when the target carries none, so a deep link such as
  `/tools/realia/realia_000846#realia-section-afo-register` keeps its hash.
- `getRealiaPageUrl` is reused rather than re-building the path, so encoding
  stays in one place.

### The `entry.id !== id` term is a loop guard, not redundancy

Without it, an entry whose `_id` happened to match `^realia_\d+$` would redirect
to the URL it is already on. `Navigate` re-runs its effect on each render, so
that is an infinite navigation loop — a browser hang, not a bad page. The term
is cheap and is covered by an explicit test.

### Left alone deliberately

The existing `getRedirectTarget` / `RealiaRedirect` pair is a **different**
feature: a stub entry with no own content renders a "see →" pointer to a
cross-reference. It is untouched. A realia-id URL for a stub entry now
canonicalises first and then shows that pointer, which is the correct order.

## API-call efficiency (hard gate) — one extra request, accounted for

A realia-id URL now costs **two** requests: `find(realia_000846)` →
`findByRealiaId` to learn the lemma, then, after the URL changes,
`find(Apkallu)` → `find` on the canonical id, because `withData` watches
`props.id`. This is inherent to a canonicalising redirect: the lemma cannot be
known without the first request, and the canonical page must render for the
second URL. It is pinned by the test "resolves the entry by realia id, then
re-resolves it by lemma" so the cost is explicit rather than accidental.

It is confined to the legacy path. Since `59dc9bcd` the app's own alt+click
opens realia by lemma, so a realia-id URL now only arrives from an external or
older link. No other path gained a request; the canonical lemma URL still costs
exactly one (pinned by "does not redirect a lemma URL", which asserts
`find` is called once).

## Tests — `RealiaDisplay.redirect.test.tsx` (new file, 139 lines)

New file, not appended: `RealiaDisplay.test.tsx` is already 245 lines and the
250-line ceiling is a hard gate. This follows the existing sibling convention
(`.afoRegister.`, `.nav.structure.`, …).

The existing `renderDisplay` helper hardcodes `id={entry.id}` and so **cannot**
express a non-canonical URL. The new file therefore drives a route-faithful
harness — `<Route path="/tools/realia/:id">` with `id` read from `useParams` —
which mirrors `toolsRoutes.entities.tsx`. That matters: it is what lets the
redirect settle, because the re-derived `id` becomes the lemma and the guard
then stops. Asserting against a hand-passed prop would have masked a loop.

Six tests: path is replaced by the lemma; both resolutions happen; the entry
renders after redirecting; a section hash survives; a lemma URL is untouched
(one request only); no loop when the entry id is itself the requested realia id.

**Verified the tests are meaningful** by reverting `RealiaDisplay.tsx` and
re-running: the 3 redirect assertions fail, and the 3 control tests pass either
way, as they should.

## Gates (final)

| Gate                    | Result                                            |
| ----------------------- | ------------------------------------------------- |
| `yarn lint`             | Clean                                             |
| `yarn tsc`              | Clean                                             |
| Full suite (5 shards)   | All exit 0 — 3729 tests, 2 pre-existing skips     |
| Console noise           | Zero across every shard                           |
| Coverage, changed files | 100% stmts / branch / funcs / lines               |
| 250-line ceiling        | Pass — `RealiaDisplay.tsx` 221, redirect test 139 |

The suite was run in 5 directory shards because the whole run OOMs on this box
(2 cores, ~2 GB free with the dev server up, against the project's 1536 MB heap
cap). The shard totals sum to 3729 = the previous 3723 + the 6 new tests, so
every suite ran.

**Not verified:** not exercised in a real browser — the realia page needs an
authenticated session against a live backend, which is currently unreachable
from this container (see `TASK-pr767-api-debug-prompt.md`).

## Cleanup reminder

`TASK-realia-id-redirect-{todo,log}.md` must be removed before the PR merges.
