# TASK-REALIA-WIKIDATA — Investigate missing wikidataId in search + Realia pages

## Scope

PR #743. Report: `wikidataId` is missing on the Realia search results and entry
pages, though it appeared earlier in the PR. Example data provided (lemma ->
Q-number -> type), e.g. `Abi-ešuḫ -> Q1778286 — Personal names`.

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] Trace the wikidata data flow: DTO -> mapping -> display + search rendering.
- [x] Verify the frontend field name vs the backend contract (data_key).
- [x] Check whether a frontend commit on the branch removed/broke wikidata.
- [x] Rule out CSS hiding.
- [x] Check the backend serializes/loads wikidataId (tests).
- [x] Decide fix location based on evidence (frontend vs backend vs data) and
      verify against a running instance.
- [x] Verified against `http://localhost:8001`: API returns `wikidataId: []` for
      every entry while sibling fields are populated. Confirmed the values are
      absent from the realia data.
- [x] Conclusion: no frontend change warranted; fix belongs in the ebl-api
      realia data/import. Backend fix prompt drafted (see log).
- [ ] Follow-up (ebl-api, out of this repo): inspect a raw realia document
      (`Object.keys(db.realia.findOne({_id:"Abzu"}))`) to distinguish
      wrong-key-dropped-by-EXCLUDE vs never-imported, then migrate/re-import.
- [ ] Remove `TASK-REALIA-WIKIDATA-*.md` before the PR is merged.
