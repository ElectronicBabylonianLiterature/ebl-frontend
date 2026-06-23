# TASK-REALIA-XREF-DISPLAY — TODO

AfO-Register cross-references are not shown. Each `AfoRegisterEntry` carries a
`crossReference` string (mapped from the backend in `RealiaRepository`), but
`RealiaDisplay` never renders it, and `afoEntryHasVisibleContent` ignores it
(so an entry whose only content is a cross-reference is filtered out).

## Checklist

- [x] Confirm entry-level `crossReferences`/`afoCrossReferences` already display
      (the "IV. See Also" section)
- [x] Confirm per-AfO-entry `crossReference` string is mapped but never rendered
- [x] Render `afoEntry.crossReference` in `AfoRegisterEntryItem`
- [x] Include `crossReference` in `afoEntryHasVisibleContent`
- [x] Add `.Realia__afo-cross-reference` style in `Realia.sass`
- [x] Add tests (renders cross-reference; entry kept when only a cross-reference)
- [x] `yarn lint` — zero errors
- [x] `yarn tsc` — zero errors
- [x] Affected tests pass with zero console output (28 RealiaDisplay tests)
- [x] 100% coverage on affected code (`RealiaDisplay.tsx` 100%)

## Follow-up: link + restyle cross-references

- [x] Link the cross-reference to `/tools/realia/<lemma>` (mirror See Also)
- [x] Add an arrow icon (`fas fa-arrow-right`)
- [x] Restyle `.Realia__afo-cross-reference` to be visually distinct
      (flex row, brand-coloured arrow, link text)
- [x] Update tests to assert the link + href
- [x] `yarn lint` / `yarn tsc` / tests console-clean / 100% coverage

## Follow-up: links navigate but page didn't reload

- [x] Root cause: `RealiaDisplay`'s `withData` had no `watch` config, so the
      fetch effect (deps default `[]`) never re-ran on `id` change — URL
      updated but the entry never re-fetched (also affected See Also links)
- [x] Add `watch: (props) => [props.id]` to the `withData` config
- [x] Add a regression test (re-render with a new id → re-fetches + renders it)
- [x] `yarn lint` / `yarn tsc` / tests console-clean / 100% coverage
- [ ] Remind to remove TASK-\* tracking files before merge

## Notes

- `crossReference` is an unstructured string (no id), so render as text, like
  `note`/`reference` — unlike the entry-level cross-references which carry
  `{id, lemma}` and are rendered as links in "See Also".
