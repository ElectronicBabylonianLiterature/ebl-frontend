# TASK-realia-annotation — TODO

## Goal

Add a **realia annotation layer** to the named-entity text annotation UI, running in
parallel to the existing entity layer (PN, DN, …) and reusing the same UI components
for editing and display. `realiaId` is the source of truth; all embedded/display data
is derived client-side and stripped before saving.

## Backend contract (agreed, frontend-first)

Deployed `ebl-api@master` `EntityAnnotationSpanSchema` is `{id, type (required), span}`
with marshmallow's default `unknown=RAISE`. It has **no** realia support, and
`grep -rn realia ebl/fragmentarium/` returns zero hits. The backend change is tracked
separately. The frontend targets this agreed payload:

```jsonc
POST /fragments/{number}/named-entities
{ "annotations": [
    { "id": "Entity-1", "type": "PERSONAL_NAME", "span": ["t1", "t2"] },
    { "id": "Realia-1", "realiaId": "realia_000846", "span": ["t1", "t2"] }
] }
```

- Realia spans carry `realiaId` and **no** `type`; entity spans are unchanged.
- Derived fields (`tier`, `name`) are stripped before POST, as `omitTiers` does today.

Already deployed and usable now: `GET /realia/by-id/{realia_id}` (`RealiaByIdResource`),
and `GET /realia?query=` for the picker.

## Checklist

- [x] 1. Extract span types + guards into `annotationSpan.ts` (entity | realia union).
- [x] 2. Generalise `TextAnnotationContext` reducer + tiering across both layers.
- [x] 3. `RealiaServiceContext` provided in `InjectedApp` (avoids 5-level prop drilling).
- [x] 4. `RealiaSelect` async picker over `RealiaService.search`; option value = `realiaId`.
- [x] 5. `SpanAnnotator` + `SpanEditor` handle both layers (same components).
- [x] 6. `Markable` renders realia indicators; `NamedEntities.sass` gets a realia colour.
- [x] 7. Save both layers via `updateNamedEntityAnnotations`, stripping derived fields.
- [x] 8. `RealiaRepository.findByRealiaId` → `/realia/by-id/`; `RealiaService.find` resolves
     `realia_*` ids through it, so `/tools/realia/{realiaId}` works unchanged.
- [x] 9. Read-only display: annotated tokens link to `/tools/realia/{realiaId}`.
- [x] 10. Tests for every new/changed unit; 100% coverage of affected code.
- [x] 11. Hard gates: `yarn lint`, `yarn tsc`, `yarn test --watchAll=false` console-clean.

## Blocked on the backend

The frontend is complete and green, but **nothing round-trips until `ebl-api` ships the
matching schema change**. Required there:

1. `EntityAnnotationSpanSchema` must accept a realia span: `type` optional (or a sibling
   `RealiaAnnotationSpanSchema`), plus a `realiaId` string field. Marshmallow's default
   `unknown=RAISE` currently rejects `realiaId` outright.
2. `Fragment.named_entities` must persist realia entries (`{id, realiaId}`) and
   `NamedEntityResource._create_annotation_spans` must echo `realiaId` back on GET.
3. Once (2) lands, the read-only links light up automatically — `CuneiformFragment`
   already builds the lookup from `fragment.namedEntities`.

## Follow-up round: UI polish and tag/realia synchronisation

- [x] 12. Placeholders: `Select tag` (entity select), `Search realia` (realia select).
- [x] 13. Realia indicator shows the full lemma instead of the static `RLA` label,
      derived from `realiaId` via `RealiaService` (`realiaId` stays the source of truth).
- [x] 14. Preview order: the tag layer always sits above the realia layer.
- [x] 15. Map the realia classification to a tag (5 name-classes), auto-select it on realia
      selection when the span has no tag, and colour the realia indicator to match its tag
      (unmapped realia keep the distinct teal).

## Bug fixes

- [x] 16. Editing a realia annotation did not display the picked entry. Root cause was a
      pre-existing remount bug: `TokenTrigger` was declared inside `DisplayAnnotationLine`,
      so every re-render created a new component type and remounted the whole `Markable`
      subtree, destroying the open editor's state. Fixed with `useCallback`; the editor
      now also registers the chosen entry on Apply rather than mid-edit. Covered by
      `TextAnnotation.realiaEditing.test.tsx`.

## Open follow-ups (post-implementation)

- [ ] Backend schema change in `ebl-api` (see "Blocked on the backend" above).
- [ ] Decide how to land the uncommitted `.github/copilot-instructions.md` edit
      (the new "Git Branching and Pushing" section).
- [ ] Re-publish the Docker image from `master` at `24d6dd36`, or confirm the image built
      from the accidental master push was superseded (see log, "Git incident and recovery").
- [ ] Remove this file and `TASK-realia-annotation-log.md` before the PR merges.

## Constraints (from .github/copilot-instructions.md)

- 250-line ceiling on every file created or grown. `Markable.tsx` is at 245 → split it.
- Full import paths (`fragmentarium/ui/...`), never relative.
- No code comments. Full variable/function names. No `any`/`unknown`.
- DRY: one shared helper for any mapping used twice.
- Never suppress console output; fix warnings at the root.

## Pre-existing issues log

- 89 of 961 `.ts`/`.tsx` files already exceed the 250-line ceiling. Treated as a
  forward-looking gate (files created or grown by this task), not a repo-wide refactor.
  Recorded here per the "note pre-existing issues" rule.
