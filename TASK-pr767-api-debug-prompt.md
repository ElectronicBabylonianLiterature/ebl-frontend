# API debug prompt — `GET /fragments/{number}` returns no readable response

Paste the **Prompt** section into an agent working in the **`ebl-api`** repo
(`ElectronicBabylonianLiterature/ebl-api`), on branch
**`add-realia-annotation-api`**. It is self-contained.

---

## Prompt

### Symptom

The eBL frontend (branch `add-realia-annotation`, PR ebl-frontend#767) renders the
fragment display page at `http://localhost:3000/library/VAT.5047`. The API runs
locally at `http://localhost:8001` on branch `add-realia-annotation-api`.

- In Chrome DevTools → Network, **every** `fragments/VAT.5047` request shows
  **"Failed to load response data"** — the response body is not retained.
- The display is broken and the named-entity toggle shows **no indicators at
  all** — neither tags nor realia.

"Failed to load response data" means the browser kept no body. That is a
_transport or server_ failure, not a payload with missing fields. It is
consistent with: a 5xx with an empty/aborted body, a connection reset mid-response,
a CORS-blocked response, or a request that never reached the server.

**Your first job is to get the actual HTTP status code and body.** Everything
below is secondary to that.

### Step 1 — reproduce server-side, bypassing the browser

Run the API on `add-realia-annotation-api` and hit the exact route:

```sh
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8001/fragments/VAT.5047
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8001/fragments/VAT.5047/named-entities
```

Report the status line, headers, and body. Capture the **full server log /
traceback** for the request. If curl succeeds while the browser fails, the fault
is CORS/preflight/reachability (Step 4), not application code.

### Step 2 — prime suspect: `resolve_realia_info` on the fragment route

This is the **only new code** on `GET /fragments/{number}` on this branch, and it
runs on **every** fragment request. `ebl/fragmentarium/web/fragments.py`:

```python
resp.media = create_response_dto(
    fragment, req.context.user, has_photo,
    resolve_realia_info(fragment, self._realia_repository),
)
```

`ebl/fragmentarium/application/realia_info.py` → `resolve_realia_info` calls
`realia_repository.find_by_realia_ids(realia_ids)` and then reads `entry.id`,
`entry.realia_id`, `entry.type`.

`ebl/realia/infrastructure/mongo_realia_repository.py`:

```python
def find_by_realia_ids(self, realia_ids):
    documents = self._realia_collection.find_many(
        {"realiaId": {"$in": list(realia_ids)}},
        projection={"realiaId": True, "type": True},
    )
    return RealiaEntrySchema(many=True).load(list(documents))
```

Check each of these concretely:

1. **`_id` must be present and a string.** `RealiaEntrySchema` declares
   `id = fields.String(required=True, data_key="_id")`. The projection does not
   name `_id`, so Mongo returns it by default — but if **any** matched realia
   document has a non-string `_id` (e.g. an `ObjectId`), `load()` raises
   `ValidationError` → 500 on the whole fragment route. Verify the `_id` type of
   the realia docs that VAT.5047 references. Note `find`/`search` are not proof
   the data is clean: they hit different documents.
2. **Does the local DB even have those realia?** Run:
   ```js
   db.fragments.findOne({_id: "VAT.5047"}, {realia: 1, namedEntities: 1})
   db.realia.find({realiaId: {$in: [<ids from above>]}}, {realiaId: 1, type: 1})
   ```
   A missing realia is _silently_ dropped by `find_by_realia_ids` (no error) —
   but confirm, because it changes what the frontend should display.
3. **Is `projection=` reaching pymongo intact?** `MongoCollection.find_many` is
   `find_many(self, query, *args, **kwargs)` → `find(query, *args, **kwargs)`,
   so it should pass through. Confirm no wrapper on this branch overrides it.
4. **Does this route touch realia at all for a fragment with none?**
   `resolve_realia_info` early-returns `[]` when `fragment.realia` is empty. If
   VAT.5047 _does_ have realia and other fragments load fine, that localises the
   bug precisely. **Test a fragment with no realia annotations and compare.**
   This single comparison is the fastest way to confirm or kill this hypothesis.

### Step 3 — check the divergence from master

`add-realia-annotation-api` is **8 ahead / 4 behind `master`** and has **no open
PR**. The branch restructured `ebl/fragmentarium/domain/fragment.py` (−97 lines)
and `ebl/transliteration/domain/text.py` (−112 lines). Merge current `master` in
and re-run the suite: a 4-commit drift across files that heavily rewritten is a
plausible source of a runtime error that the branch's own tests do not cover.

Also run the full test suite as-is first and report failures — if it is already
red, fix that before chasing the route.

### Step 4 — if curl works but the browser does not

- **CORS.** The page origin is `http://localhost:3000`; the API is
  `http://localhost:8001` — a cross-origin request. Confirm the CORS middleware
  allows that origin, the `Authorization` header, and that the `OPTIONS`
  preflight returns 2xx. A blocked preflight or a 5xx whose CORS headers are
  missing both surface in DevTools as an opaque failure with no readable body.
  Note a 500 typically loses its CORS headers, so a CORS error in the console can
  be a _symptom_ of Step 2, not a separate bug — always check the server log
  before concluding "CORS".
- **Reachability.** The frontend dev server runs in a devcontainer that forwards
  **only port 3000**; nothing listens on `8001` inside it. The browser resolves
  `localhost:8001` on the _host_. If the API runs in its own container, confirm
  `8001` is published to the host.

### Step 5 — bug found while reading the branch (fix regardless)

`ebl/fragmentarium/web/named_entities.py` → `on_post` ends with:

```python
resp.media = create_response_dto(updated_fragment, user, has_photo)
```

It does **not** pass `realia_info`. `create_response_dto`'s `realia_info`
parameter defaults to `None`, and `FragmentDtoSchema._dump_realia_info` dumps
`None` → the POST response carries `realiaInfo: null`.

The frontend feeds that response straight back into its fragment
(`updateNamedEntityAnnotations` → `createFragment`), so **after saving
annotations in the editor, every realia label degrades from its lemma to its raw
`realia_000846` id** until a reload. `GET /fragments/{number}` passes
`resolve_realia_info(...)`; this POST path should too. Add a route test pinning
`realiaInfo` in the POST response.

### Contract this must satisfy (frontend is already written against it)

`GET /fragments/{number}` embeds: `namedEntities: [{id, type}]`,
`realia: [{id, realiaId}]`, `realiaInfo: [{realiaId, lemma, type: [str]}]`, and
each word token in `text.lines[].content[]` carries `namedEntities: [str]` and
`realia: [str]`. `GET /fragments/{number}/named-entities` returns the **object**
`{namedEntities: [...], realia: [...]}`, each span carrying `span: [wordIds]`.

Every one of these is **optional** client-side, so a missing or misnamed field
never errors — it silently renders nothing. That is exactly the failure mode
being debugged, so pin each with a route-level test.

### Report back

1. The status code and body of `GET /fragments/VAT.5047`, plus the traceback.
2. Whether a realia-free fragment behaves differently.
3. Root cause, the fix, and the test that now covers it.

Do not paper over a 500 with a `try/except` that returns `[]` — if realia info
cannot be resolved, that is a data or schema bug to fix at its source. A
display-only enrichment must never be able to break the primary fragment
resource; if the correct behaviour is to degrade, make that an explicit,
tested decision rather than a swallowed exception.

---

## How I got here (frontend-side evidence)

- The frontend never calls `/named-entities` on the display page; it derives
  spans purely from the embedded `fragment.namedEntities` / `fragment.realia`
  plus per-word id arrays (`src/fragmentarium/ui/text-annotation/fragmentSpans.ts`).
  So a broken `GET /fragments/{number}` alone fully explains "toggle does nothing".
- The frontend toggle itself is covered and green:
  `Display.test.tsx` → "shows the named entity and realia spans when toggled on".
  Those tests fabricate the payload via `test-support/named-entity-fixtures.ts`,
  so they prove rendering, never the API contract.
- Ruled out frontend-side: no build error (the served bundle contains the current
  code), and the working-tree changes are additive CSS plus a behaviour-identical
  refactor.
