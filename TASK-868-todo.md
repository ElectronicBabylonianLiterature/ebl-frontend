# TASK-868 TODO: eBL Realia section and referenceType

Source: `realia/ebl-realia-api-frontend-prompt.md` (ebl-api-data-preparation, branch `realia-data-refining`), frontend prompt.

- [x] Domain: `EblRealiaEntry`, `RealiaReferenceType`, `referenceType` + `eblRealia` on `RealiaEntry` (default `[]`)
- [x] Domain: `getReferenceTypes` (data value; fallback derived from non-empty sections for documents without the field)
- [x] Domain: eBL entries count as own content (no redirect)
- [x] Repository: map `referenceType`, `eblRealia` (reference via `createReference`, hydrated document fallback from `references`)
- [x] Repository: drop document references that repeat an RlA or eBL reference
- [x] Entry page: `III. eBL Realia` section, nav entry, renumber References (IV) and See Also (V)
- [x] Entry page: reference type badges under the headword
- [x] eBL entry: transliteration (logograms upright, Akkadian italic), normalisation, translation, identification, POS, reference, Wikidata, remarks
- [x] Search results: RlA / AfO / eBL badges from reference types with counts
- [x] Links: headwords with `?`, `,`, Greek letters, superscripts percent-encoded (test)
- [x] Fixtures: η Piscium, Lisi(n), φ, χ, ψ¹, ψ², ψ³ Aquarii?
- [x] Tests: domain, repository, display, results list; 100% coverage of changed files
- [x] Gates: yarn lint, yarn tsc, yarn test:ci (zero console output), 250-line limit, DRY
- [ ] PR; remind to remove TASK-868 files before merge
