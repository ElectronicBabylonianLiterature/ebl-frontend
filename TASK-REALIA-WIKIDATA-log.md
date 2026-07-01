# TASK-REALIA-WIKIDATA — Work Log

## Investigation

Traced `wikidataId` end to end.

**Frontend (all correct, unchanged since the first Realia commit):**

- DTO: `RealiaEntryDto.wikidataId: Nullable<string>`
  (`src/realia/infrastructure/RealiaRepository.ts`). Field name has been
  `wikidataId` since commit `5a261fb0` — never renamed.
- Mapping: `wikidataId: toArray(dto.wikidataId)` — same pattern as `type` and
  `relatedTerms`, which display fine.
- Entry page: `RealiaMetadata` renders
  `Wikidata: {id}` as an `ExternalLink`, and is rendered unconditionally by
  `RealiaDisplay` (line 127).
- Search: `RealiaResultsList` pushes a `Wikidata` badge when
  `entry.wikidataId.length > 0`.
- Tests pass, incl. `expectedEntry` mapping `wikidataId: ['Q787']` and
  "renders Wikidata ExternalLink with correct href".
- No CSS hides `.Realia__metadata` or the source badges.

**Backend (correct + tested, `add-realia` branch):**

- Domain `RealiaEntry.wikidata_id: Sequence[str]`.
- Schema `wikidata_id = fields.List(String, data_key="wikidataId", ...)` — both
  load and dump use the JSON key `wikidataId`.
- Tests: `test_realia_entry.py:121` asserts `dumped["wikidataId"] ==
list(realia_entry.wikidata_id)`; load from `{"wikidataId": ["Q34095"]}` yields
  the value; `test_realia_repository.py:69` round-trips it through Mongo.

**Conclusion:** the frontend key (`wikidataId`) matches the backend contract
exactly, and both layers are covered by passing tests. `type`/`relatedTerms` use
the identical mapping and display, so if they show but wikidata does not, the
Realia documents arriving from the API have an empty `wikidataId`. i.e. the
wikidata values are not present in the underlying DATA (the realia Mongo
documents), not dropped by frontend or backend code.

This mirrors the earlier realiaId/afoVolume situation, where the frontend was
"aligned" to a contract the served data did not actually fulfil. "Present at an
earlier stage in the PR" is consistent with the local DB having been re-seeded /
reshaped without the `wikidataId` field.

**Decisive check (DONE):** `curl http://localhost:8001/realia?query=Abzu`
returns `"wikidataId": []` for every entry, while sibling fields such as
`reallexikon` and `type` are populated. This confirms the API serves an empty
`wikidataId` — the value is absent from the underlying realia data.

**Root cause (confirmed):** the Realia MongoDB documents do not carry populated
`wikidataId` values (the schema loads with `unknown = EXCLUDE`, so if the raw
document stores the id under a different key, e.g. `wikidata`, it is dropped on
load and serialized as `[]`). This is a data/import problem in **ebl-api**, not a
defect in this frontend repo. Frontend and backend code are both correct and
tested.

No frontend code change made — none is warranted. Fix belongs in the ebl-api
realia data/import (see the drafted backend prompt below / handed to the user).
