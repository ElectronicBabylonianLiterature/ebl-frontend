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
