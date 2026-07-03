# Prompt for the API agent — add `GET /realia/all`

## Context

The eBL frontend (`ebl-frontend`) generates its sitemap by listing the ids of
every database-backed entity and expanding one URL per id. Each entity type
exposes a "list all ids" endpoint that the frontend calls, mirroring the existing
pattern:

- `GET /signs/all` → `["a2", ...]`
- `GET /bibliography/all` → `["RN2016", ...]`
- (words and fragments have equivalent list-all endpoints)

The frontend has just been extended to add **Realia** pages to the sitemap. It now
calls a **new** endpoint that does not yet exist on the backend:

```
GET /realia/all
```

Frontend caller (already merged on branch `add-realia-slugs`):

```ts
// realia/infrastructure/RealiaRepository.ts
listAllRealia(): Promise<string[]> {
  return this.apiClient.fetchJson<string[]>(`/realia/all`, false)
}
```

Until the backend implements this endpoint, sitemap generation for Realia will 404.

## Task

Add a `GET /realia/all` endpoint to the eBL API (`ebl-api`, Python/Falcon) that
returns a JSON array of the ids of **all** Realia entries.

### Exact contract

- **Method / path:** `GET /realia/all`
- **Auth:** same as the existing `GET /realia/{id}` and `GET /realia?query=` Realia
  routes (public/guest-readable — match whatever those Realia routes already use;
  do **not** invent a new auth policy).
- **Response body:** a plain JSON array of strings, e.g.

  ```json
  ["Pig", "Enlil, Ellil", "Anu", "Elam (Geschichte)"]
  ```

- **Which id:** return the Realia entry's **`_id`** value — the same identifier the
  single-entry route `GET /realia/{id}` resolves by. In the current data model the
  `_id` equals the entry's lemma (the human-readable navigation key). It is **not**
  the `realiaId` field — `realiaId` is not a resolvable navigation key on the
  frontend, so it must not be returned here.
- Return **every** Realia entry's id (no pagination, no query filter), consistent
  with how `/signs/all` and `/bibliography/all` behave.
- Order is not significant, but a stable/deterministic order (e.g. sorted) is
  preferred for reproducible sitemaps.

### Implementation guidance

1. Locate the existing Realia web resource/route (the handler backing
   `GET /realia/{id}` and the search route `GET /realia?query=`) and the Realia
   repository it uses.
2. Follow the pattern already used by the Signs / Bibliography "list all"
   endpoints:
   - Add a repository method that returns all Realia ids from the Realia
     collection, projecting only `_id` (avoid loading full documents).
   - Add a Falcon resource/route that returns that list as JSON.
   - Register the route so `GET /realia/all` resolves **before** the parameterized
     `GET /realia/{id}` route (so `all` is not captured as an `{id}`), matching how
     `signs/all` is registered relative to `signs/{id}`.
3. Keep the field naming aligned with the backend schema — the backend is the
   source of truth. Do not add aliases.

### Tests (match repo conventions)

- Repository test: returns all Realia ids from seeded fixtures; empty collection →
  `[]`.
- Route test: `GET /realia/all` returns `200` with the JSON array; verify auth
  behaviour matches the other Realia routes; verify `all` is not misrouted to the
  `{id}` handler.
- Run the API repo's lint/type/test gates before finalizing.

### Definition of done

- `GET /realia/all` returns a JSON string array of all Realia `_id`s.
- Route ordering verified (`/realia/all` not shadowed by `/realia/{id}`).
- Tests added and passing; existing tests still green.
- OpenAPI/spec docs updated if the repo documents endpoints there (mirror the
  `/signs/all` entry).
