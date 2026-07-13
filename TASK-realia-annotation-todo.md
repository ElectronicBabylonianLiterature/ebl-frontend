# TASK-realia-annotation — TODO

## Goal

Add a **realia annotation layer** to the named-entity text annotation UI, running in
parallel to the existing entity layer (PN, DN, …) and reusing the same UI components
for editing and display. `realiaId` is the source of truth; all embedded/display data
is derived client-side and stripped before saving.

## Backend contract (shipped — two separate layers)

The backend now keeps tags and realia in two lists that are **never intermixed**. The client
is aligned to it; there are no aliases for the old `annotations` shape.

```jsonc
// GET and POST /fragments/{number}/named-entities
{
  "namedEntities": [
    { "id": "Entity-1", "type": "PERSONAL_NAME", "span": ["Word-2", "Word-3"] },
  ],
  "realia": [
    { "id": "Realia-1", "realiaId": "realia_000846", "span": ["Word-2"] },
  ],
}
```

- A `namedEntities` entry never carries `realiaId`; a `realia` entry never carries `type`.
  Mixing them is a `422`, as is any unknown key — so `tier` and `name` must keep being
  stripped by `omitDerivedSpanFields`.
- A missing key means an empty list.
- `realiaId` must match `^realia_\d+$` and must exist.
- `id` must be unique across **both** lists; `Entity-N` / `Realia-N` counters satisfy this.
- Duplicates are dropped silently, keeping the first. A duplicate is the same value on the
  same token range, and **span order is irrelevant**.
- Fragment DTO exposes `namedEntities` and `realia` separately; `Word` carries two id lists
  (`namedEntities`, `realia`), each resolved only against its own layer.

Still allowed: many tags and many realia per fragment; a tag _and_ a realia on one range;
two different tags on one range; the same tag or realia at different ranges.

Also deployed: `GET /realia/by-id/{realia_id}` (`RealiaByIdResource`), and `GET /realia?query=`
for the picker.

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

## Data architecture: kinds held structurally apart

- [x] 23. Hardened `.github/copilot-instructions.md`: different kinds of data must never
      intermix in one array, map, or field — end to end, not just at the API boundary. A
      heterogeneous array is the defect; a discriminant that makes it type-safe is not a
      remedy.
- [x] 24. Fixed our own violation. Reducer state pooled both kinds into one
      `annotations: AnnotationSpan[]`. It now holds separate `namedEntities` and `realia`
      collections; actions are per-kind; duplicate checks, dedupe and the used-value helpers
      are per-kind; `spanAnnotatorActions` returns `{ tag, realia }` instead of a mixed
      array; `Markable` iterates the two collections separately. The `AnnotationSpan` union
      survives only for single values (active span, indicator, editor).

## Two-list contract migration

- [x] 18. POST/GET `{ namedEntities, realia }`; the `annotations` key is gone. A missing key
      reads as an empty list.
- [x] 19. Split the span types: distinct tag and realia types, discriminated by a derived
      `layer` tag, so the **compiler** enforces non-intermixing instead of probing for an
      optional `realiaId` at runtime. `layer` is stripped on save like `tier` and `name`.
      Deleted the `FragmentNamedEntity` union.
- [x] 20. `Fragment` exposes `namedEntities` and `realia` separately; `Word` carries two id
      lists. The read-only view resolves `word.realia` against `fragment.realia` only.
- [x] 21. Duplicate detection treats a span as an unordered range (`spanRangeKey` sorts).
- [x] 22. Repository tests pin the wire shape (two lists, no `annotations` key, missing key
      → empty list).

## Follow-up round: UI polish and tag/realia synchronisation

- [x] 12. Placeholders: `Select tag` (entity select), `Search realia` (realia select).
- [x] 13. Realia indicator shows the full lemma instead of the static `RLA` label,
      derived from `realiaId` via `RealiaService` (`realiaId` stays the source of truth).
- [x] 14. Preview order: the tag layer always sits above the realia layer.
- [x] 15. Map the realia classification to a tag (5 name-classes), auto-select it on realia
      selection when the span has no tag, and colour the realia indicator to match its tag
      (unmapped realia keep the distinct teal).

## Uniqueness

- [x] 17. No duplicate tag or realia can be inserted. Uniqueness is per span (same key on
      the same token range); the same tag or realia may still be used on other spans, and a
      tag and a realia on one span are not duplicates of each other. Enforced in the reducer
      (`add`, `edit`, and the auto-tag path all go through it), deduplicated on load, and
      prevented in the UI by omitting already-used options from both pickers.

## Bug fixes

- [x] 16. Editing a realia annotation did not display the picked entry. Root cause was a
      pre-existing remount bug: `TokenTrigger` was declared inside `DisplayAnnotationLine`,
      so every re-render created a new component type and remounted the whole `Markable`
      subtree, destroying the open editor's state. Fixed with `useCallback`; the editor
      now also registers the chosen entry on Apply rather than mid-edit. Covered by
      `TextAnnotation.realiaEditing.test.tsx`.

## Open follow-ups (post-implementation)

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
