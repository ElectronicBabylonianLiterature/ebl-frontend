# Suggested commit message for the review fixes

Nothing has been committed — the working tree holds all changes. This is a draft
for whoever commits them. It deliberately supersedes the inaccurate rationale in
`b2404b16` (finding F2) **without** rewriting that pushed commit.

Remember the project rule that task/review docs land in the same commit as the
code they describe, and that **all** `TASK-*.md` files must be deleted before the
PR merges.

---

```text
Serve the canonicalising realia redirect from cache

/tools/realia/realia_000846 redirects to /tools/realia/Apkallu. The redirect
fires after withData has resolved the entry, so changing the route param made
withData fetch the same entry a second time, by lemma. Two requests for data the
client already held.

RealiaService now caches resolved entries using the house cache utility, the
same one BibliographyService uses: a 5 minute TTL and a 100 key ceiling. An
entry is cached under both the id it was requested by and its canonical
entry.id, and it is the second key that removes the redirect's request — the
redirect asks for the lemma, which the by-realia-id fetch has already populated.

Caching is safe here rather than merely convenient. RealiaRepository fetches
realia with fetchJson(path, false), so a response does not depend on session or
any other per-context state, and RealiaService has no write path that a cache
could serve staled. find is consumed only by RealiaDisplay.

This supersedes b2404b16's claim that the extra request was "confined to the
legacy path, since 59dc9bcd made alt+click open by lemma". That was wrong.
realiaCrossReferenceTarget is `lemma || id`, so in-app cross-reference links
emit a realia id URL whenever a cross-reference's lemma is empty — a case
RealiaEntry.test.ts pins explicitly. See Also, AfO-register and "see" pointer
links all reached the double fetch. The redirect was worth more, and cost more,
than that message claimed.

withData still resets data to null when id changes, so the redirect remounts the
page; that is withData's design, not this path's, and it is now a microtask
rather than a round trip.

RealiaDisplay.redirectFetching.test.tsx pins the fix by driving a real
RealiaService over a mocked repository: find is asked twice, the repository is
hit once. It asserts request counts rather than the DOM on purpose — the first
version raced the redirect's transient render, where findByRole returned an h1
that withData detached before toBeInTheDocument ran, and failed two runs in
three.

Extract RealiaCrossReferenceLink so there is one way to build a realia page URL.
Four call sites inlined `/tools/realia/${encodeURIComponent(...)}` while
getRealiaPageUrl already existed; the three cross-reference sites now render the
component and RealiaResultsList calls the helper. The component also labels the
link with lemma || id, so the empty-lemma case no longer renders a link with no
accessible name.

testDelegation already supported a factory at runtime but its type did not
express it. Widening it to S | (() => S) gives RealiaService a fresh instance per
generated test, which the cache requires; no existing call site changes and no
test was removed. instance[method] only compiled because any propagated through
the old ternary, so it is now typed explicitly, and lodash became unused.
```
