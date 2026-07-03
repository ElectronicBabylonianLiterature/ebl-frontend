# Prompt for the API agent — finish & harden `GET /realia/all`

## Context

The eBL frontend (`ebl-frontend`) generates its sitemap by listing the ids of
every database-backed entity and expanding one URL per id, mirroring the existing
pattern:

- `GET /signs/all` → `["a2", ...]`
- `GET /bibliography/all` → `["RN2016", ...]`
- (words and fragments have equivalent list-all endpoints)

The frontend has been extended to add **Realia** pages to the sitemap and calls:

```
GET /realia/all
```

Frontend caller (merged/verified on branch `add-realia-slugs`):

```ts
// realia/infrastructure/RealiaRepository.ts
listAllRealia(): Promise<string[]> {
  return this.apiClient.fetchJson<string[]>(`/realia/all`, false)
}
```

**Current state:** this endpoint has already been implemented and is live on the
`ebl-api` branch `add-realia-slugs-endpoint`; it returns a JSON array of Realia
lemma ids. The frontend side is complete and has been verified end-to-end against
the live response. This task is therefore **verify + complete**, not build from
scratch — the one behaviour the frontend cannot enforce is redirect-stub
exclusion (see below).

## Task

In `ebl-api` (Python/Falcon), verify `GET /realia/all` against the contract below
and complete the missing pieces — chiefly redirect-stub exclusion and tests.

### Exact contract

- **Method / path:** `GET /realia/all`
- **Auth:** same as the existing `GET /realia/{id}` and `GET /realia?query=` Realia
  routes (public/guest-readable — match whatever those Realia routes already use;
  do **not** invent a new auth policy).
- **Response body:** a plain JSON array of strings. Verified live sample:

  ```json
  [
    "'Babylomanie'",
    "(A)wê-ilu",
    "(Heiliger) Hügel",
    "(Nin-)Šud-bindu-basag; Tu-bindu-basag",
    "(*)Biṭūṭī-dugul"
  ]
  ```

- **Which id:** return the Realia entry's **`_id`** value — the same identifier the
  single-entry route `GET /realia/{id}` resolves by. In the current data model the
  `_id` equals the entry's lemma (the human-readable navigation key). It is **not**
  the `realiaId` field — `realiaId` is not a resolvable navigation key on the
  frontend, so it must not be returned here.
- **Return ids RAW / unencoded.** The live output correctly returns lemmas with
  reserved characters verbatim (single quotes, spaces, semicolons, parentheses,
  accented letters). Keep it that way — the frontend applies `encodeURIComponent`
  when building sitemap/link URLs, so the server must **not** URL-encode.
- Return every Realia entry id **except pure cross-reference stubs** (see next
  section). Otherwise no pagination and no query filter, consistent with how
  `/signs/all` and `/bibliography/all` behave.
- Order is not significant, but a stable/deterministic order (e.g. sorted) is
  preferred for reproducible sitemaps.

### Exclude redirect stubs (sitemap correctness) — the key open item

These ids feed the sitemap. Some Realia entries have no own content and are
**client-side redirected** to a canonical entry, so listing them would put
redirecting URLs in the sitemap (an SEO smell). Exclude them.

The frontend's canonical definition of a redirect stub is `getRedirectTarget` /
`hasOwnContent` in `realia/domain/RealiaEntry.ts`. Reproduce that rule on the
backend: **exclude** an entry when it has _no own content_ AND has exactly one
`crossReferences` entry, where "own content" means any of:

- a non-empty `afoRegister`,
- a non-empty top-level `references`,
- a non-empty `afoCrossReferences`,
- more than one `reallexikon` entry, or
- at least one `reallexikon` entry with a non-null `reference` (i.e. not a stub).

All other entries (including those with real content, or with zero/multiple
cross-references) are included. If reproducing this exactly on the backend is
impractical, prefer returning the full list over silently dropping real entries,
and flag it back so the filtering can be moved elsewhere — do **not** invent a
different exclusion rule.

### Implementation guidance (verify, then complete)

1. Confirm the existing `GET /realia/all` resource/repository method returns raw
   `_id`s and projects only `_id` from the Realia collection (avoid loading full
   documents).
2. Confirm route registration puts `GET /realia/all` **before** the parameterized
   `GET /realia/{id}` route so `all` is not captured as an `{id}` — matching how
   `signs/all` is registered relative to `signs/{id}`.
3. Add the redirect-stub exclusion described above if not already present.
4. Keep field naming aligned with the backend schema — the backend is the source
   of truth. Do not add aliases.

### Tests (match repo conventions)

- Repository test: returns all Realia ids from seeded fixtures; empty collection →
  `[]`.
- **Stub-exclusion test:** seed a pure cross-reference stub (no own content +
  exactly one `crossReferences`) alongside a canonical entry, and assert the stub
  id is **absent** while the canonical id is present.
- Route test: `GET /realia/all` returns `200` with the JSON array; verify auth
  behaviour matches the other Realia routes; verify `all` is not misrouted to the
  `{id}` handler.
- Raw-id test: an id containing reserved characters (e.g. `(Heiliger) Hügel`) is
  returned verbatim, not URL-encoded.
- Run the API repo's lint/type/test gates before finalizing.

### Definition of done

- `GET /realia/all` returns a JSON string array of raw Realia `_id`s, excluding
  pure cross-reference redirect stubs.
- Route ordering verified (`/realia/all` not shadowed by `/realia/{id}`).
- Tests added and passing; existing tests still green.
- OpenAPI/spec docs updated if the repo documents endpoints there (mirror the
  `/signs/all` entry).
