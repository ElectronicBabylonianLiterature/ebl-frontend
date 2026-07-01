# TASK-REALIA-QUERY-ENCODE — Work Log

## 0. Process correction

Initially tracked this task only with the in-session TODO tool and did not create
the mandatory `TASK-<id>-todo.md` / `TASK-<id>-log.md` files required by
`.github/copilot-instructions.md` (Task Tracking and Cleanup). Created both files
retroactively to comply. No code impact.

## 1. Investigation

`src/realia/infrastructure/RealiaRepository.ts` `search()` built the URL as
`` `/realia?query=${query}` `` — the raw query is interpolated. Confirmed the
codebase convention for encoding query params, e.g.
`src/dictionary/infrastructure/WordRepository.ts`:
`` `/words?query=${encodeURIComponent(query)}` ``. Also `SignRepository`,
`TextService`, `WordService`, `FragmentRepository` use `encodeURIComponent` or
`query-string` `stringify`. The Realia search endpoint takes a single free-text
`query` param, so `encodeURIComponent` is the right, minimal, codebase-aligned
fix (no `query-string` needed for a single value).

Root cause of the reviewer's concern: without encoding, an input such as
`pig & cow` becomes `/realia?query=pig & cow`, where the trailing `&cow` is parsed
by the server as a separate query parameter; spaces and Unicode are likewise
unsafe in a raw URL.

## 2. Fix

`RealiaRepository.search`:

```ts
const path = `/realia?query=${encodeURIComponent(query)}`
return this.apiClient
  .fetchJson<RealiaEntryDto[]>(path, false)
  .then((result) => result.map(mapRealiaEntry))
```

Used a local `path` const so Prettier does not wrap the `fetchJson` generic
awkwardly; behaviour is otherwise unchanged for simple queries
(`encodeURIComponent('pig') === 'pig'`).

## 3. Tests

Added a table-driven block to `RealiaRepository.test.ts`
(`RealiaRepository search query encoding`) asserting the exact encoded URL for
each risky class named by the reviewer:

- `pig & cow` -> `/realia?query=pig%20%26%20cow`
- `spaced query` -> `/realia?query=spaced%20query`
- `Ninĝirsu` (Unicode) -> `/realia?query=Nin%C4%9Dirsu`
- `?=#&/+` (reserved) -> `/realia?query=%3F%3D%23%26%2F%2B`

The existing `search` delegation test (`query=pig`) still passes unchanged,
proving simple queries are unaffected.

## 4. Gates

- `yarn tsc`: clean.
- `yarn lint`: clean (Prettier applied to the changed file).
- Full `yarn test --watchAll=false`: 333 suites / 3377 passed, 2 pre-existing
  skips, 0 failures, zero console output.
- Line counts: `RealiaRepository.ts` and `RealiaRepository.test.ts` remain under
  the 250-line hard gate.

## 5. Pre-existing issues found

None surfaced while working (lint/tsc/tests were clean before and after aside
from the intended change).

## 6. Empirical verification — no API change required

No live Realia API was reachable (local `:8001` down; Realia not on prod), so the
exact backend mechanism was reproduced: a minimal Falcon app using the same
`query = req.get_param("query", default="")` handler as
`RealiaSearchResource.on_get`, served by **gunicorn** (a real WSGI server), and
curled:

- Raw `&` (pre-fix): `GET /realia?query=pig&cow` -> handler received
  `query = "pig"` and a leaked `cow` param. Confirms the reported bug.
- Encoded `&` (the fix): `GET /realia?query=pig%26cow` -> handler received the
  full `query = "pig&cow"`, single param.
- Encoded Unicode `Nin%C4%9Dirsu` -> `"Ninĝirsu"`; encoded reserved `?=#&/+` ->
  the full literal string.

Conclusion: the existing backend already URL-decodes query params, so the encoded
query arrives intact. **No ebl-api change is required** — unlike the earlier
`/realia/{lemma}` path issue, a reserved character in the query string decodes to
a literal value with no routing ambiguity.
