# TASK-named-entity-preview — Work Log

Branch: `add-realia-annotation`. No commit was made (none was requested).

## Follow-up: separate display from editing; drop the RlA link (2026-07-15)

**Asks:** in the read-only display, NE/realia tags must not be selectable and must not show the
highlight shadow; the realia tag itself (not a separate `RlA` link) provides alt+click-to-open-
Realia-page + the same hint as the editor; DRY/reuse; editing mechanisms securely separated from
display.

**Provenance check first:** the `RlA` link (`RealiaTokenLinks`) and the alt+click-on-the-tag
mechanism were both authored by the user (Ilya Khait) earlier on this branch (`ea5c9a23`,
`c74362c5`). Confirmed with the user before proceeding. User chose: realia visibility follows the
NE preview toggle, and remove whatever becomes orphaned.

**Structure (DRY + secure separation).**

- `useSpanIndicator.ts` — shared presentation hook: realiaId, title (with `realiaPageHint`),
  data-label, base className (tier + entity/realia colour class + initial/final), plus the shared
  `isRealiaPageShortcut`. Single source of truth for both editor and display.
- `SpanIndicatorView.tsx` — **display only**. No `setActiveSpanId`, no `activeSpanId`, never renders
  `highlight`. onMouseUp is attached only for realia and only opens the Realia page on alt+click;
  non-realia tags are fully inert. Adds `span-indicator--static`. The display path has _no reference_
  to any editing entry point — separation is structural, not a runtime flag.
- `SpanIndicator.tsx` — **editor only**. Reuses the hook; keeps select (`setActiveSpanId`) + highlight.
- `SpanIndicators.tsx` — now a pure render-prop list (filter spans covering the token, render each via
  an injected `renderSpan`). Editor injects `SpanIndicator`; display injects `SpanIndicatorView`.
- `NamedEntityPreviewContext` — dropped `activeSpanId`/`setActiveSpanId` entirely, so the display
  context carries no editing state.

**RlA link removed + orphans deleted** (user-approved): `text-line.tsx` no longer renders
`RealiaTokenLinks`; deleted `RealiaTokenLinks.{tsx,test,sass}`, `RealiaAnnotationsContext.ts`,
`realiaAnnotations.{ts,test}`, and the `RealiaAnnotationsContext` provider + `createRealiaIdLookup`
memo in `CuneiformFragment.tsx`. `RouterLinkModeContext` kept (broadly used). Realia is now reachable
only under the NE preview toggle, via the realia tag's alt+click — a deliberate behaviour change the
user chose.

**CSS.** `.span-indicator--static` gives display tags `cursor: default`; realia overrides to
`pointer`. Nested under `.span-indicator` (`.span-indicator.span-indicator--static`) so it out-
specifies the base `.span-indicator { cursor: pointer }` regardless of bundle order — the same
specificity-tie trap as the earlier DEFAULT-colour bug; avoided here from the start and guarded by a
compiled-CSS test (proven to fail on the un-nested form).

**Tests.** New `SpanIndicatorView.test.tsx` (realia alt+click opens page, hint title, data-label,
colour class, `span-indicator--static`, never `highlight`, and every non-alt/non-realia interaction
is inert). `SpanIndicators.test.tsx` rewritten for the render-prop API. `NamedEntities.css.test.ts`
extended with the static-cursor cascade assertions. Editor `SpanIndicator.test.tsx` unchanged and
still green. All six feature files at **100%** coverage.

**Gates:** `yarn lint` (eslint + stylelint) clean; `yarn tsc` clean; full suite **357 suites /
3697 passed / 0 failed / 0 console noise**; touched files all under 250 lines.

**Not machine-verified:** the shadow/cursor pixels in a browser (jsdom has no cascade). The absence
of `highlight` and the static cursor are asserted at the component + compiled-CSS level; a quick
visual check on the fragment display is still worth doing before merge.

## Follow-up: badge colour/label rendering bug (2026-07-15)

**Report:** in the browser, named-entity badges showed "DEFAULT" and were red; realia badges
showed the right lemma but were also red.

**Root cause (CSS cascade, not data).** Confirmed empirically by rendering the preview tokens:
the DOM classes and `title`/`data-label` were already correct (`named-entity__PERSONAL_NAME` /
"Personal Name"; `named-entity__REALIA span-indicator--realia` / "ARTAXERXES"). The base
`.span-indicator` rule includes `indicator-label("DEFAULT", red)` (TextAnnotation.sass:101). Its
`::before` rule `.span-indicator.initial::before` ties on specificity (0,2,1) with the standalone
`.named-entity__X.initial::before` rules, so whichever copy of the fallback lands last in the
bundle wins. In the display bundle a later `TextAnnotation.sass` chunk re-emits the fallback after
the type rules, so DEFAULT/red won. Realia kept its label only because
`.span-indicator--realia[data-label]…::before` out-specifies the fallback for `content`, but its
background still fell through to red. This is exactly the "not verified in a real browser" gap
called out in §6 of the original log — jsdom does not apply the CSS cascade, so no component test
caught it.

**Fix (root cause).** Nested the type/realia colour rules under `.span-indicator`
(`&.named-entity__X`) in `NamedEntities.sass`, so they compile to `.span-indicator.named-entity__X…`
(0,3,1) and deterministically beat the fallback regardless of bundle order. DOM classes are
unchanged, so every existing component test and snapshot is untouched.

**Colour-schema test (the reported bug's regression guard).**

- `cssCascade.testSupport.ts` — compiles the real SASS with dart-sass and resolves the winning
  declaration for a given element via a minimal specificity + source-order cascade model.
- `NamedEntities.css.test.ts` — compiles `NamedEntities.sass` **followed by** `TextAnnotation.sass`
  (the worst-case global order that triggers the bug) and asserts all 13 entity/realia badges
  resolve to their design-token colour and correct label, the element background is the type colour
  (not red), realia keep their `data-label`, the fallback still applies to a typeless indicator, and
  hover expands the realia label. **Proven to fail on the pre-fix SASS** (every badge resolved to
  red DEFAULT) and to pass after the fix.

**Gates:** `yarn lint` (eslint + stylelint) clean; `yarn tsc` clean; full suite 358 suites /
3700 passed / 0 failed / 0 console noise; new files 177 & 143 lines; resolver at 100% coverage.

**Still not machine-verified:** the actual pixels in a browser. The cascade fix is proven at the
compiled-CSS level (the layer the bug lived in), but this container has no browser/WebGL. Worth a
quick visual confirmation on the fragment display before merge.

## 1. Investigation

- The library display is `fragmentarium/ui/display/Display.tsx` (the `display` tab of
  `CuneiformFragmentEditor`, and the only view a guest session gets).
- The button group to extend is `FragmentDisplaySettings` inside `Display.tsx`
  (`toggle-layout`, `switch-language`). It was rendered only when the fragment has a translation,
  so it had to be lifted out of that condition for the new toggle to be reachable everywhere.
- **No new API call is needed.** `Fragment` already carries `namedEntities` (`id` → `type`) and
  `realia` (`id` → `realiaId`), and every word token carries `namedEntities` / `realia` arrays of
  annotation ids (this is what `RealiaTokenLinks` already uses). The editor's span model
  (`AnnotationSpans`) can therefore be rebuilt client-side from the fragment.
- The flower icon `⚘` was the realia tools tab icon in `router/toolsConfig.tsx`; the editor's
  "Named Entities" tab used `⊛`.

## 2. Decisions (confirmed with the user)

- "Disabled by default" = the preview starts **off**; the button itself stays clickable.
- The preview shows **both** layers: named entities and realia.

## 3. Design

- `realia/ui/realiaIcon.ts` — one `realiaIcon` constant, used by the tools nav, the editor tab and
  the new display toggle (DRY gate: the glyph is no longer repeated).
- `fragmentSpans.ts` rebuilds `AnnotationSpans` from the fragment: word ids in reading order, then
  one span per annotation id. Entity ids resolve **only** against `fragment.namedEntities` and
  realia ids **only** against `fragment.realia`.
- `spanTiers.ts` — tier/label derivation moved out of `TextAnnotationContext`, shared by the
  read-only preview and the editing reducer.
- `SpanIndicators.tsx` — extracted from `Markable`, reused by the preview, so both render identical
  indicators from one component.
- `NamedEntityPreviewContext.tsx` — context + provider (derived spans, realia info lookup, active
  span). Its default value is empty, so `transliteration/ui/text-line.tsx` renders nothing extra for
  every other transliteration (corpus, chapters, dictionary); only the Display mounts the provider,
  and only while the toggle is on — so no realia lookups are fetched with the preview off.
- `FragmentDisplaySettings.tsx` — extracted from `Display.tsx`; the group now always renders, with
  the translation controls inside it only when the fragment has a translation.

## 4. Data-architecture verification (hard gate)

- No array, map or field holds more than one kind: the API DTO, the domain `Fragment`, the rebuilt
  `AnnotationSpans`, the derived spans, the preview context and the token wrapper all keep
  `namedEntities` and `realia` as two separate collections, iterated and rendered separately.
- No type carries mutually exclusive optional fields as a discriminant: `ApiEntityAnnotationSpan`
  (`type`) and `ApiRealiaAnnotationSpan` (`realiaId`) each have their own required fields, and the
  `layer` discriminant is set by `setTiers`, not inferred from a field's presence.
- One lookup per kind: `createEntitySpans` reads only `word.namedEntities` against
  `fragment.namedEntities`; `createRealiaSpans` reads only `word.realia` against `fragment.realia`.
  Two explicit negative tests pin this (a realia id in a token's `namedEntities` resolves to
  nothing, and vice versa).
- No `as` cast converts between the kinds; no guard leaves its else-branch unnarrowed.
- No outbound payload changed: the preview is read-only and adds no serialization path. The derived
  fields (`tier`, `name`, `layer`) never reach the API — the editor's single
  `omitDerivedSpanFields` boundary is untouched.

## 5. Pre-existing issues found and fixed at the root cause

1. **`CuneiformFragmentEditor.tsx` (304 lines) and `TextAnnotation.tsx` (364 lines) were over the
   250-line ceiling** before this task, and both are files this change touches. Split, behaviour
   identical (pure moves): tab contents → `fragment/editorTabContents.tsx`; annotation rows →
   `text-annotation/AnnotationLines.tsx`; annotation display → `text-annotation/SpanAnnotationDisplay.tsx`.
   The dead `export default ScopeContents` of the editor (imported nowhere) was dropped in the move.
2. **Flaky test — `signs/ui/display/SignInformation.test.tsx`.** It failed in a full run and passed
   in isolation. Root cause: the test awaited `Words (as logogram):`, which renders _synchronously_,
   and then asserted synchronously on the word data, which arrives from an _async_ `wordService.find`.
   Under load the assertions ran before the promises flushed. Fixed by awaiting the data the test
   actually asserts on (`findByRole('link', …)` for both words) — no production change, no mocking.
3. **Flaky test — `fragmentarium/ui/fragment/FragmentView.test.tsx`.** Failed only under coverage
   instrumentation. Root cause: `waitForSpinnerToBeRemoved` used `waitFor`'s default 1 s budget,
   which the image/folio/corpus/dossier-heavy fragment view exceeds when the machine is loaded. The
   shared helper now waits up to 3 s (still under Jest's 5 s test timeout); a spinner that never
   disappears still fails the test.
4. `transliteration/ui/text-line.tsx` had no test file and an uncovered active-line branch. Added
   `text-line.test.tsx`; the file is now at 100%.

## 6. Verification

| Gate             | Command                                                                 | Result                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint             | `yarn lint` (eslint + stylelint)                                        | PASS — 0 errors                                                                                                                                           |
| Types            | `yarn tsc`                                                              | PASS — 0 errors                                                                                                                                           |
| Full suite       | `CI=true yarn test --watchAll=false`                                    | PASS — 357 suites, 3665 passed, 2 skipped, 0 failed                                                                                                       |
| Console noise    | grep of the full-run log for `console.*` / `Warning:` / act / unhandled | **0 occurrences**                                                                                                                                         |
| Snapshots        | 50 passed; 1 updated (`Display`)                                        | Diff inspected first: it is exactly the new button group appearing on a fragment without translations. Updated with `--updateSnapshot` on that file only. |
| Coverage         | `--coverage` over every touched file                                    | 100% on all feature code (see below)                                                                                                                      |
| 250-line ceiling | `wc -l` on every changed/added `.ts`/`.tsx`                             | PASS — no file over 250                                                                                                                                   |

Coverage, affected code: `Display.tsx`, `FragmentDisplaySettings.tsx`, `fragmentSpans.ts`,
`spanTiers.ts`, `SpanIndicators.tsx`, `NamedEntityPreviewContext.tsx`, `NamedEntityPreviewToken.tsx`,
`AnnotationLines.tsx`, `TextAnnotation.tsx`, `text-line.tsx`, `toolsConfig.tsx`, `realiaIcon.ts` —
all **100%** statements/branches/functions/lines.

Two files carry gaps that are **pre-existing and inherited verbatim** by the split, i.e. the same
lines were uncovered before this task and no line of them was modified:
`editorTabContents.tsx` (77%: the tab save callbacks, previously inside `CuneiformFragmentEditor`)
and `SpanAnnotationDisplay.tsx` (93%: the selection-retry path, previously inside `TextAnnotation`).
`Markable.tsx` (83%, alt-click selection merge and popover callbacks) is likewise pre-existing.

Not verified: the preview in a real browser. This container has no browser/WebGL and no browser
automation, so the check is the jsdom render of the real component tree (`Display.test.tsx` toggles
the button and asserts the indicators appear on the transliteration).

## 7. Cleanup reminder

`TASK-named-entity-preview-todo.md` and `TASK-named-entity-preview-log.md` are working artifacts and
**must be deleted before the PR is merged**.
