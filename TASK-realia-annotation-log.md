# TASK-realia-annotation — Work Log

## 2026-07-10 — Investigation

- Branch `add-realia-annotation` created off `origin/master`.
- Read the annotation stack: `TextAnnotation.tsx`, `TextAnnotationContext.tsx`,
  `SpanAnnotator.tsx`, `SpanEditor.tsx`, `Markable.tsx`, `EntityType.ts`.
- Established the existing derived-field pattern: `tier` and `name` are computed
  client-side by `setTiers` and stripped by `omitTiers` before POST. The realia layer
  follows the same pattern, with `realiaId` as the stored source of truth.

### Backend verification (API schema is source of truth)

Downloaded `ebl-api@master` and inspected it directly:

- `ebl/fragmentarium/application/named_entity_schema.py` → `EntityAnnotationSpanSchema`
  is `{id, type, span}`; `type` is `required=True`; no realia field; no `Meta.unknown`,
  so marshmallow's default `RAISE` rejects unknown keys.
- `grep -rn realia ebl/fragmentarium/` → **0 hits**.
- Branches `add-realia`, `add-realia-slugs-endpoint`, `add-named-entity-schemas`,
  `separate-named-entity-tags`, `retrieve-annotations`, `add-lemma-annotation-route`
  all have **0** realia hits in the entity schema.
- Live API: `GET /api/realia?query=apkallu` returns entries with `realiaId`;
  `GET /api/fragments/{n}/named-entities` is served by the `master` code above.
  Did **not** POST — requires `transliterate:fragments` scope and would mutate production.

**Conclusion:** the backend does not yet support realia annotation. Confirmed with the
user; proceeding frontend-first against the payload recorded in the TODO file.

Also found, deployed and unused by the frontend: `GET /realia/by-id/{realia_id}`
(`RealiaByIdResource.find_by_realia_id`). `RealiaRepository.find()` currently hits
`/realia/{realiaId}`, which resolves by lemma `_id` — see the note in `RealiaEntry.ts`.
This is the endpoint the `realiaId`-as-source-of-truth design needs.

### Design decisions

- **Separate parallel span layer** (user-selected): realia spans are their own spans
  `{id, span, realiaId}`, so a token range can carry both a `PN` span and a realia span.
- **Tiering computed over the combined set** of both layers, so an entity span and a
  realia span covering the same tokens stack on different tiers instead of colliding.
- **`RealiaServiceContext`** rather than prop-drilling `realiaService` through
  `FragmentView → CuneiformFragment → CuneiformFragmentEditor → TextAnnotation`.
  Precedent: `SessionContext`, `RouterLinkModeContext`.
- **Read-only links** go straight to `/tools/realia/{realiaId}` (user-selected), which
  requires the display route to resolve realia ids via `/realia/by-id/`.

### Pre-existing issues found

- 89 of 961 `.ts`/`.tsx` files exceed the 250-line ceiling. Root cause: the ceiling was
  introduced after much of the code was written and is not retroactively enforced.
  Treated as a forward-looking gate for files this task creates or grows.
  `Markable.tsx` (245) is split because this task would push it over.

## Implementation

### New files

- `fragmentarium/ui/text-annotation/annotationSpan.ts` — the entity | realia span union,
  type guards, derived-name/class helpers, `omitDerivedSpanFields`, per-prefix id
  generation (`Entity-N` / `Realia-N`, numbered independently).
- `fragmentarium/ui/text-annotation/RealiaSelect.tsx` — `AsyncSelect` over
  `RealiaService.search`; option value is the `realiaId`, label the lemma.
- `fragmentarium/ui/text-annotation/SpanIndicator.tsx`, `InlineEditor.tsx` — extracted
  from `Markable.tsx` (245 lines) so it stays under the 250-line ceiling; now 177.
- `realia/application/RealiaServiceContext.ts` — context + `useRealiaService`.
- `fragmentarium/domain/realiaAnnotations.ts` — `createRealiaIdLookup` /
  `getTokenRealiaIds` for the read-only view.
- `transliteration/ui/RealiaAnnotationsContext.ts`, `RealiaTokenLinks.tsx` (+ `.sass`).
- `fragmentarium/ui/text-annotation/textAnnotation.testSupport.tsx` — one shared realia
  service mock/provider, reused by five test files (DRY gate).

### Notable decisions

- `SpanEditor` was split into `EntitySpanEditor` / `RealiaSpanEditor` behind one
  `SpanEditorForm`. The first cut used a single component with union state, which left a
  dead `selectedType === null` branch (the entity select is not clearable). Splitting
  removed the dead branch instead of testing around it.
- `RealiaService.find` now dispatches on `isRealiaId(id)` (`/^realia_\d+$/`) to
  `findByRealiaId` → `/realia/by-id/`. Verified against the live API: lemma `_id`s are
  words (`Apkallu=`, `Assyrien (Geschichte)`), `realiaId`s are always `realia_\d{6}`, and
  `GET /api/realia/by-id/realia_000846` resolves. This makes `/tools/realia/{realiaId}`
  work without a router change.
- `RealiaTokenLinks` honours `RouterLinkModeContext`, so the Word/PDF export paths (which
  render outside a router) emit nothing rather than throwing.
- Tiering is computed over the **combined** span set, so an entity span and a realia span
  covering the same tokens land on different tiers instead of overlapping.

### Pre-existing issues found and fixed

- `clearSelection` in `SpanAnnotator.tsx` had no test coverage for either browser branch
  (`empty` vs `removeAllRanges`) nor the no-selection-API case. Root cause: it was never
  exercised directly, only as a side effect. Added three focused tests.
- `useRealiaService`'s missing-provider guard originally threw during render, which made
  React log `console.error` in the test that asserted it — a console-noise defect. Fixed
  at the root by extracting the pure `requireRealiaService(service)` guard and testing
  that directly, rather than suppressing the output.
- 89 of 961 `.ts`/`.tsx` files exceed the 250-line ceiling. Verified none of them crossed
  the line because of this task (`git show origin/master:<file> | wc -l` for each changed
  file); `Markable.tsx` went 245 → 177.

## Gates

- `yarn lint` — clean.
- `yarn tsc` — clean.
- `yarn test --watchAll=false` — 345 suites, 3517 passed, 2 skipped, 50 snapshots, exit 0.
- Console output across the full run: **0** occurrences of `console.error`/`console.warn`/
  `Warning:`/`not wrapped in act`/unhandled rejections.
- One snapshot updated (`SpanAnnotator`), inspected first: the only diff is the added
  `annotate-realia` select.
- Coverage of affected code: `annotationSpan.ts`, `realiaAnnotations.ts`,
  `RealiaTokenLinks.tsx`, `SpanIndicator.tsx`, `InlineEditor.tsx`, `SpanEditor.tsx`,
  `RealiaSelect.tsx`, `RealiaServiceContext.ts`, `RealiaService.ts` — 100% across
  statements, branches, functions and lines.

## Not verified end-to-end

The annotation UI cannot be driven against a real backend: the deployed
`/fragments/{n}/named-entities` rejects a realia span (`type` required, `unknown=RAISE`).
Behaviour is covered by unit/integration tests with a mocked `FragmentService`.
`GET /realia/by-id/{realia_id}` and `GET /realia?query=` were exercised against the live
API. No POST was made against production.

## Follow-up round: UI polish and tag/realia synchronisation

Requested changes, all implemented:

1. **Placeholders.** Entity select: `Select...` → `Select tag` (both the annotator and the
   editor). Realia select: `Search realia…` → `Search realia`.
2. **Lemma in the preview.** The realia indicator showed the static CSS label `RLA`. It now
   shows the full lemma. `realiaId` remains the only stored field; the lemma is derived.
   `SpanIndicator` writes it to `data-label` and the SASS rule
   `.span-indicator--realia[data-label]` renders it with `content: attr(data-label)`
   (attribute selector raises specificity so it beats the tag class's static label
   regardless of stylesheet order). Long lemmas are ellipsised at `16em`.
3. **Preview order.** Tier 1 sits closest to the text, so "tag above, realia below" means
   tags must take lower tiers. `setTiers` now computes tiers per layer via
   `computeLayerTiers` and offsets the realia layer by the deepest tag tier, so every
   realia span sits below every tag even when tags are nested.
4. **Classification → tag mapping + colour sync.** `realiaTypeMapping.ts` maps the five
   name-classes (`Personal names`→PN, `Divine names`→DN, `Geographical names`→GN,
   `Objects`→ON, `Peoples`→EN). Topical classes (Religion, Literature, Fauna, Art,
   Astronomy, …) and untyped entries are deliberately unmapped. On realia selection, the
   mapped tag is added automatically **only when the span carries no tag**. A realia
   indicator takes its mapped tag's colour; unmapped realia keep the distinct teal
   (`$ebl-color-entity-realia`), so "no tag matched" stays visible.

### Vocabulary check (live API)

`GET /api/realia?query=a` returns 18,953 entries. Distinct `type` values, by frequency:
11,293 have **no** type; then Geographical names (2,436), Divine names (2,179), Personal
names (1,209), Religion (577), Literature (577), Miscellaneous (394), Objects (203),
Realia (203), History of science (141), Jurisprudence (102), Fauna (73), Peoples (62),
Flora (58), Minerals (55), Materials (55), Art (53), Art styles (53), Sciences (42),
Professions (34), Language (26), Linguistics (26), Astronomy (18), Excavated sites (2),
plus a handful of malformed values (`Per–7`, `Geographical name–6`). The mapping was
chosen against this real vocabulary, not guessed.

### New files

- `realiaTypeMapping.ts` — classification → `EntityType`.
- `realiaInfo.ts` — derived display data (lemma, mapped tag, indicator class) keyed by
  `realiaId`; `getRealiaIds` collects the realia layer's ids.
- `RealiaInfoContext.tsx` — the lookup plus `useRealiaInfoService`, which resolves lemmas
  for realia ids in the loaded annotations through `RealiaService.find` (→ `/realia/by-id/`)
  and lets the picker register a chosen entry without a round-trip. Each id is fetched at
  most once; a failed lookup degrades to showing the raw `realiaId`.
- `spanAnnotatorActions.ts` — pure `buildTagAnnotations` / `buildRealiaAnnotations` /
  `hasTagForSpan`. Extracted so the auto-tagging rules are unit-testable and so the
  component holds no unreachable null-guards (this took `SpanAnnotator` to 100% branch
  coverage rather than leaving dead defensive branches).

### Gates (this round)

- `yarn lint` clean; `yarn tsc` clean.
- `yarn test --watchAll=false` — 350 suites, 3578 passed, 2 skipped, exit 0, **0** console
  errors/warnings/act-warnings/unhandled rejections.
- One snapshot updated (`SpanAnnotator`), diff inspected: only the two placeholder strings.
- Coverage 100% (statements, branches, functions, lines) on every file this round touched:
  `realiaTypeMapping.ts`, `realiaInfo.ts`, `RealiaInfoContext.tsx`,
  `spanAnnotatorActions.ts`, `SpanIndicator.tsx`, `SpanAnnotator.tsx`, `SpanEditor.tsx`,
  `RealiaSelect.tsx`, `annotationSpan.ts`.

### Scope note

Auto-tagging fires on realia **selection in the annotator** (creating an annotation), not
when re-picking realia on an already-existing span in the editor, where an existing tag is
assumed deliberate. Flag if the editor should behave the same way.

## Git incident and recovery (2026-07-10)

- The feature commit (`ea5c9a23`) was accidentally pushed to `master`. Root cause: the
  branch was created with `git checkout -b add-realia-annotation origin/master`, which set
  `branch.add-realia-annotation.merge = refs/heads/master`. The branch was never published,
  so a push resolved its destination from that upstream and fast-forwarded `master`.
- Recovery: pushed the branch to its own ref first (`git push -u origin
add-realia-annotation`), then rewound `master` with
  `git push --force-with-lease=refs/heads/master:ea5c9a23 origin 24d6dd36:refs/heads/master`,
  and verified against the remote with `git ls-remote` (not the stale `origin/*` refs).
- Post-recovery remote state: `master` at `24d6dd36`; `add-realia-annotation` at `ea5c9a23`
  (its own ref, tracking itself); `ea5c9a23` is provably not an ancestor of `master`.
- Side effect not undone by the rewind: the master push triggered the `docker` /
  `docker-test` jobs in `.github/workflows/main.yml`, which build and publish a registry
  image on any master push. The registry may still hold an image built from `ea5c9a23`.
  Re-run that workflow on `24d6dd36` (or check the published tag) — outside git, not done here.

## Pending working-tree change

- `.github/copilot-instructions.md` has an uncommitted +30-line "Git Branching and Pushing"
  section (require `--no-track` when branching, publish with `-u` immediately, verify the
  upstream before finalizing, verify remote state with `git ls-remote`). Left uncommitted
  for the user to decide how to land.

## Progress

- [x] Branch created, backend contract verified and confirmed with the user.
- [x] Implementation complete; all hard gates green.
- [x] Feature committed (`ea5c9a23`) and branch published to `origin/add-realia-annotation`.
- [ ] Backend schema change in `ebl-api` (see TODO file, "Blocked on the backend").
- [ ] Decide how to land the pending `copilot-instructions.md` edit.
- [ ] Re-publish the Docker image from `24d6dd36` (or confirm the bad image was superseded).
- [ ] Remove `TASK-realia-annotation-todo.md` / `TASK-realia-annotation-log.md` before merge.
