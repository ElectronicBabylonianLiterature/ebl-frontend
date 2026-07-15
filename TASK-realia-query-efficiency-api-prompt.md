# API prompt — embed realia display titles in the fragment response

This is the exact data-modelling prompt for **ebl-api**. It removes the client's
per-id realia lookups by embedding realia display data into the fragment (text)
query, so the frontend never issues a follow-up `/realia/by-id/{id}` request to
label a realia annotation.

## Corresponding API PR — status

Checked ebl-api for an in-flight change. The only open realia PR is
[#735 "Add GET /realia/all endpoint for listing Realia IDs"](https://github.com/ElectronicBabylonianLiterature/ebl-api/pull/735),
which returns a sorted array of all realia `_id`s for sitemap generation. **It is
unrelated to embedding titles in the fragment** and does not satisfy this need.
No PR embeds realia display data in the fragment response yet — this prompt asks
for that new change. Reuse #735's batch/`$in` repository style as a pattern.

---

## Prompt to implement

> **Goal.** The frontend renders realia named-entity annotations on a fragment
> (both the read-only text display and the annotation editor). To label each
> annotation it currently fetches every referenced realia entry individually via
> `GET /realia/by-id/{realiaId}` — N requests per fragment. Eliminate those
> requests by **embedding the realia display data directly in the fragment
> response**, computed server-side in one batch query.
>
> **Add a `realiaInfo` field to the fragment response.** On every endpoint that
> serializes a full fragment (primarily `GET /fragments/{number}`, and the
> sub-resource reads that return a full fragment), add a read-only field:
>
> ```json
> "realiaInfo": [
>   { "realiaId": "realia_000846", "lemma": "Apkallu", "type": ["Divine names"] }
> ]
> ```
>
> One entry per **distinct** `realiaId` referenced by the fragment's realia
> named-entity annotations (`word.realia[].realiaId` / the fragment's realia
> annotation list). Fields:
>
> - `realiaId` — the realia entry's `realiaId` (the value stored on the
>   annotation; matches the client's lookup key).
> - `lemma` — the realia entry's `_id` (its human-readable lemma / title, shown
>   as the indicator label).
> - `type` — the realia entry's `type` array (classification strings, e.g.
>   `["Divine names"]`). The client maps these to a display colour; send the raw
>   values, do not pre-map.
>
> **Compute it in one batch query.** Collect the distinct realiaIds on the
> fragment, load their realia entries with a single `$in` query (mirror the
> repository style in #735 / `find_by_realia_id`), and project
> `{realiaId, _id→lemma, type}`. Do **not** query per id.
>
> **Read-only / inbound-only.** `realiaInfo` is denormalized display data derived
> on read. It is:
>
> - present on fragment GET responses only;
> - **never required and never accepted** on any fragment write — reject or ignore
>   it on input exactly as other derived/unknown keys are handled, and never
>   persist it;
> - independent of the stored realia annotations, which remain the source of
>   truth and are unchanged.
>
> **Missing entries.** If a referenced realiaId has no realia entry (dangling
> reference), omit it from `realiaInfo` (the client already falls back to showing
> the raw id). Do not fail the fragment request.
>
> **Serialization.** Use marshmallow with `data_key="realiaInfo"` (camelCase in
> JSON, snake_case internally per project convention). The nested entry schema is
> `{ realiaId (String), lemma (String), type (List[String]) }`.
>
> **Tests (mirror existing fragment/realia route + schema tests).**
>
> - A fragment with several realia annotations returns one `realiaInfo` entry per
>   distinct realiaId, each with the correct lemma and type, from a single batch
>   load (assert one repository call, not N).
> - Distinct-id dedup: repeated realiaIds across annotations yield one entry.
> - A dangling realiaId is omitted, and the request still succeeds.
> - A fragment with no realia annotations returns `realiaInfo: []`.
> - A fragment **write** round-trip neither requires nor emits `realiaInfo`
>   (posting it does not 422 the client, and it is not stored).

---

## Frontend contract already built against this

The client consumes exactly the shape above (built this branch, ahead of the API):

- `FragmentDto.realiaInfo?: readonly RealiaInfoEntry[]`, mapped straight onto
  `Fragment.realiaInfo` (`RealiaInfoEntry = { realiaId, lemma, type }`).
- `useRealiaInfoService(fragment.realiaInfo ?? [])` builds the label/colour lookup
  from this inline data — **no `/realia/by-id` calls** for display or editing.
- When the field is absent (older API), the client degrades to showing the raw
  realiaId, so shipping the API is backward-compatible and can land independently.
