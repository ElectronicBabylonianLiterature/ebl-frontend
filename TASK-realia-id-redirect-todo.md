# TASK-realia-id-redirect — TODO

Task: a realia-id URL (`/tools/realia/realia_000846`) must automatically
redirect to the corresponding lemma URL (`/tools/realia/Apkallu`).

All items complete. See `TASK-realia-id-redirect-log.md` for the reasoning.

## Work

- [x] Decide where the redirect belongs. The lemma is only knowable after the
      entry is fetched (`RealiaEntry.id` **is** the lemma), so it cannot happen
      at the route level without a request. → top of `RealiaEntryDisplay`,
      which `withData` renders only once the entry has resolved.
- [x] Pass the requested `id` into `RealiaEntryDisplay` so it can compare the
      requested id against the canonical `entry.id`. → generics change only;
      `withData` already spreads props, so no call site moved.
- [x] Redirect with `replace` (not push) so Back does not bounce the user
      between the id URL and the lemma URL. → `router/compat`'s `Redirect`
      maps to `<Navigate replace>`.
- [x] Preserve `search` and `hash` across the redirect so deep links to a
      section (`#realia-section-afo-register`) still land correctly. → the
      compat shim re-appends both when the target carries none.
- [x] Guard against an infinite redirect loop when the requested id already
      equals `entry.id`. → the `entry.id !== id` term; `Navigate` re-runs its
      effect per render, so this would hang the browser.
- [x] Do not disturb the existing cross-reference redirect (`getRedirectTarget`
      / `RealiaRedirect`), which is a different feature (stub entry → "see X").
      → untouched; a realia-id URL for a stub canonicalises first, then points.

## Tests

- [x] realia-id URL redirects to the lemma URL.
- [x] lemma URL does not redirect and renders normally.
- [x] hash survives the redirect.
- [x] no redirect loop when the requested id equals the entry id.
- [x] Use a route-faithful harness (id derived from the URL param), because the
      existing `renderDisplay` helper hardcodes `id={entry.id}` and so can never
      express a non-canonical URL.
- [x] New tests go in a sibling file: `RealiaDisplay.test.tsx` is already at 245
      lines and the 250-line ceiling is a hard gate. →
      `RealiaDisplay.redirect.test.tsx`, 139 lines.
- [x] Confirm the tests are meaningful: reverting `RealiaDisplay.tsx` fails the
      3 redirect assertions and leaves the 3 controls passing.

## Gates

- [x] `yarn lint` — clean
- [x] `yarn tsc` — clean
- [x] `yarn test --watchAll=false` — 5 shards, all exit 0, zero console output
- [x] 100% coverage on changed files
- [x] 250-line ceiling — `RealiaDisplay.tsx` 221, redirect test 139
- [x] API-call efficiency: the redirect costs one extra request on the legacy
      realia-id path; inherent, confined, and pinned by a test. The canonical
      lemma URL still costs exactly one.
