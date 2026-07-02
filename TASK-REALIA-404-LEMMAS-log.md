# TASK-REALIA-404-LEMMAS — Work Log

## Symptom

`GET /realia/Königsinschriften` (and `Gudea`, `Eninnû`, `Tempel`) → 404 with the
API message `Realia entry '<lemma>' not found.` All worked previously.

## What was ruled out

1. **Frontend regression** — `RealiaRepository.find` still requests
   `/realia/{encodeURIComponent(lemma)}`; navigation is lemma-based as before;
   the error text is the API's, so the request reaches the backend.
2. **Backend code regression** — PR #715 head (`e2b84fa8`, updated 2026-07-01)
   inspected: `/realia/{realia_id}` still resolves via `find()` →
   `find_one_by_id(_id)`. The new `RealiaLemmaSink` (slash-lemma support) cannot
   shadow the route: Falcon routes take precedence over sinks, and the observed
   message is `find()`'s (`"Realia entry '<id>' not found."`), proving the
   by-`_id` lookup executed and missed.
3. **URL encoding** — `Gudea` and `Tempel` are pure ASCII and fail identically,
   so `%C3%B6` handling is not the common factor.

## Direct DB check attempt

`MONGODB_URI` from `.env.local` points at the BAdW production replica set
(`badwcai-ebl01.srv.mwn.de` reachable-but-connection-closed = firewalled from
this container; the second host in the URI appears truncated —
`badwcai-ebl02.srv.mw` fails DNS; worth double-checking the secret's value).
Raw inspection must run from the user's environment.

## Conclusion (evidence-based)

The API executes the correct lookup and the documents are **absent under those
`_id`s** in the database the API queries. This is a data-side change — the
realia collection was re-imported / re-keyed / trimmed after the earlier state
(consistent with the active data workstream: realiaId + wikidataId import
work; also note PR #715 removed the dev seed on 2026-06-29).

## Decisive user-side checks

1. Via the running API (no credentials):
   `curl 'http://localhost:8001/realia?query=Gudea'` — search matches `_id` and
   `relatedTerms` by regex, so renamed entries will surface with their new
   `_id`s.
2. Raw Mongo (run in the ebl-api environment):
   check `count`, exact `_id` hits for the four lemmas, near-match regexes, and
   a sample of current `_id`s to see the new key shape.

## Outcome options

- Data restore/re-import → no frontend change.
- `_id`s intentionally re-keyed (e.g. stable realiaId as `_id`, or qualified
  lemmas) → frontend navigation must adopt the new key (that decision belongs
  to the user; the realiaId/by-id route already exists in the API).
