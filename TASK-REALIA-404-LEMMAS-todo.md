# TASK-REALIA-404-LEMMAS — Investigate 404s for previously working Realia lemmas

## Scope

`/tools/realia/Königsinschriften`, `Gudea`, `Eninnû`, `Tempel` now show
"Realia entry '<lemma>' not found." — all previously available. API =
ebl-api PR #715 (`add-realia`), DB credentials in `.env.local` (not exposed).

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Rule out frontend regression (find() still requests `/realia/{lemma}`;
      navigation unchanged; error text originates from the API).
- [x] Try direct DB inspection from this container (pymongo + MONGODB_URI)
      — blocked: BAdW Mongo hosts are firewalled from this container.
- [x] Re-inspect the current PR #715 head (updated 2026-07-01): routes,
      RealiaResource, RealiaLemmaSink, find/find_by_realia_id.
- [x] Rule out the new Falcon sink shadowing the route (Falcon routes take
      precedence over sinks; error message proves find-by-\_id executed).
- [x] Rule out URL-encoding (Gudea/Tempel are ASCII and also 404).
- [x] Conclusion: the documents are absent under those `_id`s in the DB the
      API queries → data-side change (re-import/re-key), not a code bug.
- [ ] User-side check: run the API search / raw-Mongo one-liners to see what
      `_id`s now exist (renamed? realiaId-keyed? dropped?).
- [ ] Decide fix (data restore vs frontend/backend adaptation) once the new
      key shape is known.
- [ ] Remove `TASK-REALIA-404-LEMMAS-*.md` before merge.
