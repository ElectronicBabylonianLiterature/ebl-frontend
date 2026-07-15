# TASK-named-entity-preview — TODO

Add a named-entity preview toggle to the library display, reuse the realia flower icon
(`⚘`, from `tools/realia`) for it and for the editor's "Named Entities" tab.

## Follow-up fix (browser rendering bug reported by the user)

Symptom: in the browser, N.E. indicator badges show "DEFAULT" and are red; realia badges
show the correct lemma but are also red.

- [x] Root cause: base `.span-indicator` includes `indicator-label("DEFAULT", red)`
      (TextAnnotation.sass:101). It ties on specificity with the standalone `.named-entity__*`
      rules, so in the display bundle a later copy of the fallback wins. Confirmed empirically:
      the rendered classes/titles are correct — the defect is purely CSS cascade.
- [x] Fix: nest the type/realia colour rules under `.span-indicator` (`&.named-entity__X`)
      so they carry one extra class of specificity and beat the fallback regardless of
      bundle order. DOM classes are unchanged.
- [x] Test the colour schema at the compiled-CSS level (`NamedEntities.css.test.ts` +
      `cssCascade.testSupport.ts`): compile NamedEntities.sass then TextAnnotation.sass
      (worst-case order) and assert every entity/realia badge resolves to its token colour and
      correct label, not the red DEFAULT fallback. Proven to FAIL on the pre-fix SASS.
- [x] Hard gates: `yarn lint` (eslint + stylelint) clean; `yarn tsc` clean; full suite
      358 suites / 3700 passed / 0 failed / **0 console noise**; new files 177 & 143 lines
      (under 250); `cssCascade.testSupport.ts` at 100% coverage
- [x] Confirm no other errors introduced by the branch changes — full suite green

## Decisions (confirmed with the user)

- "Disabled by default" = the preview starts **off**; the button itself stays clickable.
- The preview shows **both** layers: named entities and realia.

## Implementation

- [x] Shared flower icon constant (`realia/ui/realiaIcon.ts`) — tools nav, editor tab, display toggle
- [x] `fragmentSpans.ts` — rebuild `AnnotationSpans` from `fragment.namedEntities` / `fragment.realia`
      and the annotation ids carried by the word tokens (no extra API call). One lookup per kind.
- [x] `spanTiers.ts` — tier/name derivation extracted from `TextAnnotationContext` and shared
- [x] `SpanIndicators.tsx` — extracted from `Markable` and reused by the preview
- [x] `NamedEntityPreviewContext.tsx` — context + provider (derived spans, realia info, active span);
      empty by default, so every other transliteration render is unchanged
- [x] `NamedEntityPreviewToken.tsx` — wraps a display token with its indicators
- [x] `text-line.tsx` — preview wrapper around the existing lemma popover / realia links
- [x] `NamedEntities.sass` — `.named-entity-preview` positioning class
- [x] `FragmentDisplaySettings.tsx` — extracted from `Display.tsx`; toggle added to the existing
      `ButtonGroup`; the group now renders even without a translation
- [x] `Display.tsx` — preview state; the transliteration is wrapped in the provider when enabled
- [x] `CuneiformFragmentEditor.tsx` — flower icon for the "Named Entities" tab

## Hard gates

- [x] Data architecture: entity ids resolve only against `fragment.namedEntities`, realia ids only
      against `fragment.realia`; no mixed collection; two explicit negative tests
- [x] Tests added for every new module; **100% coverage on all affected code**
- [x] `yarn lint` — 0 errors
- [x] `yarn tsc` — 0 errors
- [x] `yarn test --watchAll=false` — 357 suites, 3665 passed, 0 failed, **zero console output**
- [x] Snapshots: diff inspected (new button group), updated only on `Display.test.tsx`
- [x] 250-line ceiling — no changed/added file over 250 lines
- [x] Pre-existing issues fixed at the root cause (see log §5): two files over the line ceiling,
      two flaky tests (`SignInformation`, `FragmentView`), untested `text-line.tsx`

## Open

- [ ] Verify in a real browser — not possible in this container (no browser/WebGL, no browser
      automation). Behaviour is asserted in jsdom against the real component tree.
- [ ] Delete `TASK-named-entity-preview-todo.md` and `TASK-named-entity-preview-log.md` before the
      PR is merged.
