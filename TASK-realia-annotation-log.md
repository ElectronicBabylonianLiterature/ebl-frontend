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

### New files (this round)

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

## Bug: picking a realia in the editor did not display it

**Symptom.** In the span editor, the realia menu opened and search worked, but the picked
entry was never shown in the select.

**Root cause — a pre-existing remount bug, not the realia code.** `DisplayAnnotationLine`
declares `TokenTrigger` _inside its own body_, so it is a brand-new component type on every
render. React cannot reconcile a changed component type: it unmounts and remounts the whole
`Markable` subtree — including any open popover — on every re-render of the line. All local
state in `SpanAnnotator` / `SpanEditor` is destroyed.

The entity editor never exposed this: changing the tag select only touches state local to
`EntitySpanEditor`, so nothing above it re-renders. The realia editor did, because
`register(entry)` updates the realia lookup held in `TextAnnotationView`. That parent state
update re-rendered the line, gave `TokenTrigger` a new identity, remounted `SpanEditor`, and
reset `selectedRealia` to its initial value — so the pick vanished.

**Fix.**

1. Root cause: `TokenTrigger` is now wrapped in `useCallback`, keyed on the props it closes
   over, so its identity is stable across unrelated re-renders. Remounts now happen only
   when the selection or the active span actually changes, where fresh state is wanted.
   This also removes a real performance problem: previously _every_ re-render tore down and
   rebuilt every `Markable` on the line.
2. Defence in depth: `RealiaSpanEditor` no longer calls `register` while the user is
   choosing. The chosen entry is held in local state and registered on **Apply**, so the
   editor no longer mutates parent state mid-edit, and unconfirmed picks no longer enter
   the lookup.

**Regression cover.** `TextAnnotation.realiaEditing.test.tsx` drives the real component
tree (fragment → line → `Markable` → `SpanEditor`): the indicator shows the resolved lemma,
a picked realia stays displayed in the editor, Apply relabels the indicator to the new
lemma, and a realia span opens the realia editor rather than the tag editor. The second of
these fails on the pre-fix code, which is how the diagnosis was confirmed.

## Structural separation of the two kinds (data architecture gate)

The instructions now require that different kinds of data are never intermixed in one array,
map, or field — end to end, not just at the API boundary. **Our own code violated that**, and
was fixed:

The API payload was already two lists, but inside the app both kinds were pooled into a
single heterogeneous array: `State.annotations: readonly AnnotationSpan[]`, with mixed
`TaggedAnnotationSpan[]` threaded through every helper. The `layer` tag existed precisely to
make that pooled array type-safe — which is the defect the rule names, not the remedy.

What changed:

- **Reducer state holds two collections**, `namedEntities` and `realia`, never one list.
  Actions are per-kind (`{ type, layer, annotation }` / `{ type: 'delete', layer, id }`), so
  a payload is routed to exactly one collection.
- **Duplicate checks are per kind** (`isDuplicateEntitySpan` / `isDuplicateRealiaSpan`,
  `dedupeEntitySpans` / `dedupeRealiaSpans`), each keyed by its own value plus the token
  range. Cross-kind comparison is no longer expressible, which is what makes "a tag and a
  realia on the same range are not duplicates" true by construction rather than by a filter.
- **`getUsedEntityTypes` / `getUsedRealiaIds` each take only their own collection.**
- **`spanAnnotatorActions` returns `{ tag, realia }`** — two named fields — instead of a mixed
  array the caller had to re-split. `createAnnotationSpanId` now takes a homogeneous
  `readonly string[]` of existing ids, so id uniqueness across both kinds needs no mixed array.
- **`Markable` iterates the two collections separately** and renders one after the other.
  `SpanIndicators` is generic over a single kind (`Span extends AnnotationSpan`), so it cannot
  be handed an array containing both — and it needs no cast.
- The `AnnotationSpan` union now survives only where the rule allows it: **single values**
  whose kind is genuinely dynamic (the active span, an indicator's span, an editor's span).

### Gate verification (required by the instructions)

- No array, map, or field holds more than one kind — checked in reducer state and component
  props, not only the API payload. `grep` for `AnnotationSpan[]` returns no mixed collection.
- No type carries mutually exclusive optional fields as a de facto discriminant.
- Each kind's ids resolve only against its own collection (`word.realia` → `fragment.realia`).
- No `as` cast converts between the kinds. (A first cut of `SpanIndicators` widened a
  union-of-arrays with `as readonly AnnotationSpan[]`; it was made generic instead, removing
  the cast.)
- The outbound payload is built in one place (`omitDerivedSpanFields`), carries no derived
  field, and is pinned by repository tests.

## Migration to the two-list named-entities contract

The backend now keeps tags and realia in **two separate lists that are never intermixed**.
The client was aligned to it; no aliases for the old shape were added.

### Wire shape

`GET` and `POST /fragments/{number}/named-entities` both use `{ namedEntities, realia }`.
The old `annotations` key is gone. A `namedEntities` entry never carries `realiaId`, and a
`realia` entry never carries `type` — sending either is a `422`. `omitDerivedSpanFields`
still strips `tier` and `name`, which remain unknown keys.

`FragmentRepository.fetchNamedEntityAnnotations` normalises a missing key to an empty list;
`updateNamedEntityAnnotations` posts the two lists directly.

### Types: the compiler now enforces non-intermixing

Previously one union was discriminated by an _optional_ `realiaId`, so telling the kinds
apart meant probing for a field at runtime. Now `ApiEntityAnnotationSpan` and
`ApiRealiaAnnotationSpan` are distinct types, and the UI works on layer-tagged spans
(`TaggedEntitySpan` / `TaggedRealiaSpan`, discriminated by `layer`). The `layer` tag is a
derived, client-only field: it is added by `toTaggedSpans` on load and removed by
`omitDerivedSpanFields` on save, exactly like `tier` and `name`. Guards return
`Extract<Span, …>` so both branches of a check narrow, which is what lets `SpanEditor` hand a
`RealiaAnnotationSpan` to the realia editor and an `EntityAnnotationSpan` to the tag editor
without a cast. A tag can no longer be constructed with a `realiaId` — it is a type error,
not a runtime check.

`FragmentNamedEntity` (the old `NamedEntity | RealiaNamedEntity` union on the fragment) was
deleted for the same reason: `Fragment` now has separate `namedEntities` and `realia` lists.

### Word tokens and the read-only view

`Word` carries two id lists. `createRealiaIdLookup` is built from `fragment.realia` and
resolved against `word.realia`; a tag id is never looked up in the realia layer, and
`word.realia` defaults to `[]`. There is a regression test asserting exactly that
(`never resolves a tag id against the realia layer`).

### Duplicates: span order is now irrelevant

`["Word-2","Word-3"]` and `["Word-3","Word-2"]` are the same range, so the duplicate key
sorts the span (`spanRangeKey`). This changed `isDuplicateAnnotation`, `dedupeAnnotations`,
`getUsedEntityTypes` and `getUsedRealiaIds`. The backend drops duplicates silently, and the
client still prevents them being created at all.

Ids stay unique across both lists because `Entity-N` / `Realia-N` use independent counters
over disjoint prefixes — covered by a test.

## Uniqueness of tags and realia

Requirement: no duplicate tag or realia may be inserted if one is already present.

**Scope: per span, not per fragment.** The same tag or the same realia entry may legitimately
occur on several different token ranges (one person appears in many places in a text). A
duplicate is therefore _the same key on the same span_, where the key is the entity type for
a tag and the `realiaId` for a realia. A tag and a realia on the same span are never
duplicates of each other — that pairing is the point of the feature.

**Enforced in the reducer**, so no path can bypass it — manual selection, editing, and the
automatic tag added from a realia classification all go through `add` / `edit`:

- `isDuplicateAnnotation` compares the layer key and the span, ignoring the annotation's own
  id (so re-applying an unchanged edit is not a self-duplicate).
- `add` and `edit` return the state unchanged when the result would duplicate.
- `dedupeAnnotations` also runs over the annotations loaded from the API, so duplicates
  already stored server-side collapse on load rather than being rendered twice.

**Prevented in the UI**, so a duplicate cannot even be clicked: the tag select omits types
already on the span, and the realia search omits `realiaId`s already on the span. The editor
applies the same filters but excludes the annotation being edited, so its own current value
stays selectable.

`cacheOptions` was removed from the realia `AsyncSelect`: with an exclusion list that varies
by span, a cached result set would keep offering an entry that had just been used.

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

## Bug: the tag editor showed the raw entity type (2026-07-13)

**Symptom.** Opening the editor on an existing tag showed the stored value (`ROYAL_NAME`) in
the select instead of the option label (`RN: Royal Name`). Picking any entry from the menu
replaced it with a correctly formatted label, so the raw value only ever appeared on first
open.

**Root cause.** `EntitySpanEditor` hand-built its initial react-select value as
`{ label: entitySpan.type, value: entitySpan.type }`, reusing the stored type as the _label_.
react-select renders whatever `label` the value object carries, so it printed the enum. The
menu entries were unaffected because they come from `entityTypeOptions`, which formats labels
as `${entity.label}: ${entity.name}` from `EntityType.ts`. The two disagreed because the
editor duplicated option construction instead of using the shared list — the same
single-source-of-truth failure the DRY gate names.

**Fix.** `getEntityTypeOption(type)` in `SpanAnnotator.tsx` resolves a type against
`entityTypeOptions`; `EntitySpanEditor` seeds its state from it. No option is constructed by
hand any more, so the displayed value and the menu cannot drift apart again.

Not a stale-state bug: `SpanEditor` is only rendered while a span is active, so the
`useState` initialiser re-runs on every open.

**Regression cover.** `SpanEditor.test.tsx` asserts the editor shows `PN: Personal Name` and
**not** `PERSONAL_NAME` on open. The existing "still offers the tag the span already has"
case began matching two nodes once the fix landed (the selected value _and_ the menu option),
which confirmed the diagnosis; it was narrowed to `getByRole('option', …)` so it keeps testing
the menu rather than the value. The `SpanEditor` snapshot was updated — the only diff is
`PERSONAL_NAME` → `PN: Personal Name` in `singleValue`.

### Gates (tag-label fix)

- `yarn lint` clean; `yarn tsc` clean.
- `yarn test --watchAll=false` — 351 suites, 3630 passed, 2 skipped, 50 snapshots, exit 0,
  **0** `console.error`/`console.warn`/`Warning:`/`not wrapped in act` occurrences.
- One snapshot updated (`SpanEditor`), diff inspected before accepting: the single
  `singleValue` line, nothing else.

## 2026-07-13 — Alt+click on a realia indicator opens the RlA page

**Ask.** In the realia (RlA) indicator display, holding `alt` and pressing the left mouse
button should open the realia page in a new tab; the hover element must hint at it beside
the RlA lemma.

**Change.** `SpanIndicator`'s `onMouseUp` now branches: for a realia span, `alt` + left
button (`event.button === 0`) opens `/tools/realia/{realiaId}` via `window.open(…,
'_blank', 'noopener,noreferrer')` and returns without activating the span; every other
combination — plain click, another button, any click on a tag span — still opens the
editor as before. The `title` (the hover element) becomes
`{lemma} (Alt+click to open the Realia page in a new tab)` for realia spans and stays the
plain name for tag spans. `alt` on a _token_ keeps its existing meaning (add/remove words
from the selection, handled in `Markable`); the indicator is a different target, so the
two shortcuts do not collide.

**DRY.** The `/tools/realia/{id}` mapping was inline in several places. Added
`realia/ui/realiaPage.ts` with `getRealiaPageUrl` / `openRealiaPageInNewTab`, and pointed
the new code and the read-only `RealiaTokenLinks` at it.

### Gates (Alt+click shortcut)

- `yarn lint` clean; `yarn tsc` clean.
- `yarn test --watchAll=false` green and console-clean.
- New `SpanIndicator` cases: opens the page and does not activate the span on alt + left
  click; activates (and does not open) on a plain click, on alt + a non-left button, and on
  alt + left click on a tag span; the hover title carries the hint for realia only.

## 2026-07-13 — Realia labels of neighbouring tokens no longer collide

**Symptom.** Two annotated tokens next to each other rendered their lemmas on top of one
another, so the labels read as one run-on string (`Texte / astrono Monc Mondomina`).

**Cause.** The realia label is an absolutely positioned `::before` on the indicator with
`max-width: 16em`. A lemma wider than its own token therefore spilled over the next
token's label; nothing bounded it to its own span.

**Fix (chosen by the user out of three options).** The label is clamped to its own span's
width minus a gutter (`max-width: calc(100% - .25rem)`), so it can never reach the next
label; the existing `text-overflow: ellipsis` truncates it. Hovering the indicator — or
having the span active (`.highlight`) — expands it back to `16em` and lifts it to
`z-index: 2`, so the full lemma reads above its neighbours on demand. The full lemma also
remains in the `title` tooltip. Tier offsets, line height and the token-to-tag vertical
alignment are untouched.

Options not taken: a dedicated tier row per realia span (full lemma at rest, but every
extra annotation grows the line), and reverting to a short `RlA` badge (compact, but drops
the at-a-glance lemma added in item 13).

## Progress

- [x] Branch created, backend contract verified and confirmed with the user.
- [x] Implementation complete; all hard gates green.
- [x] Feature committed (`ea5c9a23`) and branch published to `origin/add-realia-annotation`.
- [x] Git branching/pushing rules added to `.github/copilot-instructions.md` (`7093386c`).
- [x] Backend shipped the two-list contract; the client is aligned to it.
- [ ] Re-publish the Docker image from `24d6dd36` (or confirm the bad image was superseded).
- [ ] Remove `TASK-realia-annotation-todo.md` / `TASK-realia-annotation-log.md` before merge.
