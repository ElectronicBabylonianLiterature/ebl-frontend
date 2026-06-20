# TASK-REALIA-SECTIONS — Realia entry page: sections, type, See Also

## Goal

On the Realia entry page:

1. Move RlA references from "III. References" into the expandable part of
   "I. Reallexikon …". If no other (non-RlA) references remain, hide the
   References section entirely.
2. Audit & fix the Type display (currently renders "undefined").
3. Add a "IV. See Also" section listing the linked cross-references (both the
   RlA `crossReferences` and the AfO `afoCrossReferences`), if present.

## Backend contract (verified against the live DB, collection `realia`)

- `type`: `string[]` of free-text labels (e.g. `["Divine names"]`) — NOT the
  `OBJECT_NAME`-style enum the frontend assumed. → all values rendered as
  literal "undefined".
- `reallexikon`: an **array** of `{ id, title, content, reference }` (reference
  is an id string). The frontend currently expects a single object, so its
  RlA-reference filtering is skipped → the RlA reference leaks into III
  (reproduced on `/realia/Enlil, Ellil`, whose only reference IS the RlA one).
- New top-level fields `crossReferences` and `afoCrossReferences`: arrays of
  `{ id, lemma }`. `_id == lemma` for 25148/25173 docs → links target
  `/tools/realia/{lemma}`.

## TODO

- [x] Domain `RealiaEntry.ts`: `type: string[]`; `reallexikon: ReallexikonEntry[]`;
      add `RealiaCrossReference {id, lemma}` + `crossReferences` +
      `afoCrossReferences`; remove `RealiaType`/`REALIA_TYPE_LABELS`/
      `getRealiaTypeLabels`; add `getRealiaCrossReferences` (merge + dedupe).
- [x] Repository: align DTO + map (resolve every reallexikon reference id, filter
      all of them out of `references`, map cross-references, pass type through).
- [x] `RealiaDisplay`: array-based Reallexikon section; type shown raw; add
      `IV. See Also`; drop the now-duplicated inline AfO "See also:" line.
- [x] `RealiaResultsList`: type chips from raw strings; RlA badge on array length.
- [x] Fixtures + all realia tests + integration snapshot.
- [x] Hard gates: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false`
      (zero failures except pre-existing unrelated ApiImage/Corpus.integration;
      zero console noise), 100% coverage on changed files.

## Cleanup

- [ ] Remind to remove TASK-REALIA-SECTIONS-\*.md before the PR is merged.
- [ ] Confirm with user: inline AfO "See also:" removed in favour of section IV.
