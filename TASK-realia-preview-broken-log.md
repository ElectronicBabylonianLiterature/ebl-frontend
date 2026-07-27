# TASK-realia-preview-broken — Work Log

Report: "the preview of realia tags is broken. When toggling the preview button,
only named entity tags are shown." Branch `add-realia-annotation`.

## What the display preview does

`Display.tsx` mounts `NamedEntityPreviewProvider` only while the toggle is on.
The provider rebuilds annotation spans **client-side from the fragment** (it does
not call the `/named-entities` editor endpoint):

- `createFragmentAnnotationSpans(fragment)` walks the word tokens and builds two
  independent maps — `word.namedEntities` → `fragment.namedEntities`, and
  `word.realia` → `fragment.realia`. Each id resolves only against its own kind's
  list (`fragmentSpans.ts:56-80`).
- `setTiers` lays the two layers out (entities on tiers 1..d, realia on d+1..).
- `NamedEntityPreviewToken` renders **both** — a `SpanIndicators` for
  `namedEntities` immediately followed by one for `realia`
  (`NamedEntityPreviewToken.tsx:29-38`).

So for a realia tag to be absent, `spans.realia` must be empty, i.e. either
`fragment.realia` is empty or no token carries a matching `.realia` id.

## The whole round-trip is symmetric

Checked the API branch `add-realia-annotation-api` because the display depends on
the fragment payload carrying `word.realia`:

- `token_schemas_words.py` — `BaseWordSchema` serialises **both** `namedEntities`
  and `realia` (data_key on each).
- `fragment_schema.py` — fragment emits `namedEntities` and `realia`;
  `resolve_realia_info` adds `realiaInfo` on GET.
- `named_entity.py` / `text.py` — on save, `set_named_entities` stamps
  `token.realia` with the annotation's **`id`** (`_map_spans_by_token`:
  `token_map[token_id].append(span.id)`), which is exactly the key the frontend
  joins on (`fragment.realia[].id`).
- `fragment_updater.update_named_entities` persists
  `("text", "named_entities", "realia")`, and the POST accepts both keys.

Frontend side: `text-line.ts` passes `data.content` through untouched (tokens keep
`realia`), and `createFragment` spreads `dto.realia` / `dto.realiaInfo` into
`Fragment.create`. No field is dropped.

## Reproduction attempts — the path renders realia correctly

1. **Real payload.** Took the production fragment NCBT.616, attached a realia
   annotation (`fragment.realia`, `fragment.realiaInfo`, and `token.realia` on the
   two annotated words) exactly as the API branch would, built the domain object
   through the real `ApiFragmentRepository.find` → `createFragment`, toggled the
   preview: **2 `.span-indicator--realia` elements rendered**, classed
   `named-entity__DIVINE_NAME span-indicator--realia` (the realia type maps to
   DIVINE_NAME). Repro test removed after confirming.
2. **Existing suites.** `Display.test.tsx` ("shows the named entity and realia
   spans when toggled on") and `NamedEntityPreviewToken.test.tsx` ("shows the
   realia indicators below the named entity indicators") both pass — these already
   assert realia visibility.
3. **CSS cascade.** `NamedEntities.css.test.ts` (42 tests) compiles the _migrated_
   `@use` Sass in worst-case global order and asserts each realia/entity badge
   resolves to its own colour and label. All pass — including "colours a mapped
   realia badge like its tag" and "labels a realia badge with its data-label".
   So the recent `@import`→`@use` migration (1e16d46b) did not reintroduce the
   earlier DEFAULT/red cascade bug.

## Conclusion

The realia preview **rendering path is correct** and proven at the component,
integration and compiled-CSS levels. This is not a data-mapping, join, or
layer-separation defect.

The only condition that produces the exact reported symptom — entities visible,
realia absent — is a fragment whose data has **no realia annotations**. In a
4,858-fragment live-corpus sweep, **none** carried realia (`fragment.realia` was
empty everywhere; `realiaInfo` absent everywhere): the realia layer exists only on
the unmerged feature branches, so no production or shared-DB fragment can show a
realia tag yet. A fragment annotated only with named entities will therefore show
named-entity tags and no realia — which matches the report exactly, without any
bug.

What I could not do here, and why it matters: this component has been hit twice
before by CSS-cascade bugs that render the tag in the DOM but make it visually
wrong/invisible — and jsdom applies no layout/cascade, so no test above can catch
that class of bug. The local API (:8001) is down and there is no browser, so I
could not load a realia-bearing fragment in a real browser.

## Pointed at NCBT.1121 — resolved to a data condition, not a code defect

The user pointed at `http://localhost:3000/library/NCBT.1121`.

Environment check: only :3000 (the frontend dev server) is listening. The API the
frontend targets (`REACT_APP_DICTIONARY_API_URL=http://localhost:8001`) is **down**
(:8001/:8000/:5000 all refused, no Docker, no Mongo on :27017). So the running app
cannot fetch fragment data at all right now; I could not reproduce against the live
local environment. No local Mongo client is available, and I did not use the shared
`ebldev` cluster credentials in `.env.local` to reach in for a fix task.

NCBT.1121 in the public corpus: **9 named-entity annotations, 0 realia** —
`fragment.realia` is `null`, `fragment.realiaInfo` is `null`, and every annotated
token carries `namedEntities` with `realia: null`. Types present: 3 DIVINE_NAME,
2 GEOGRAPHICAL_NAME, 1 ROYAL_NAME, 2 PERSONAL_NAME, 1 MONTH_NAME.

Faithful render test: took NCBT.1121's exact production payload, added two realia
annotations the way a save would (one on Word-24, which already carries a
DIVINE_NAME entity; one on a realia-only word), built the domain object through the
real `ApiFragmentRepository.find` → `createFragment`, toggled the preview:
**9 entity tags AND 2 realia tags rendered** (`data-label` "Gefäß", "Apkallu"),
including the realia that shares a token with a divine-name tag. Test removed after
confirming.

Save path re-checked: `SpanAnnotationDisplay.saveAnnotations` posts
`omitDerivedSpanFields(spans)` = `{namedEntities, realia}` (both), and the editor
reducer holds realia as its own collection. Realia is not dropped on save.

**Conclusion for NCBT.1121:** the preview correctly shows the 9 named entities the
fragment has and no realia because the fragment has no realia annotations. This
matches the report ("only named entity tags are shown") with no bug. The toggle
button uses the realia flower icon but toggles _both_ layers, which can read as
"realia is broken" on a fragment that only has named-entity tags.

**Diagnostic to settle it on the user's side** (once the local API is back up):
`curl .../fragments/NCBT.1121 | jq '{realia, realiaInfo}'` and grep the text tokens
for a non-null `realia`.

- `realia: null` / no token `realia` → nothing to render; expected, not a bug.
- `fragment.realia` populated but tokens lack `realia` → stale/old-format data
  (spans set, tokens never re-stamped); the display joins on `word.realia`, so it
  would show nothing. Re-saving the annotations (which re-stamps tokens) fixes it;
  if that recurs, it is a backend stamping bug in `text.set_named_entities`.
- both populated but no tag on screen → pixel-level CSS-cascade case; needs a real
  browser render (jsdom can't see it).

## Backend reply (2026-07-24) — traps tested against the documented T1 contract

The API side reported that at T1 `ebldev` held 9 named entities and **22 realia**
(all stamped on tokens), and that ~15 min later the realia were **0** with no
changelog entry — most likely an `ebldev` refresh from public `ebl` (which has 0
realia for this fragment). It named three traps in the real payload.

**Section 1 could not be run.** The local API is still down (:8001 refused; :8000,
:5000 too), and the frontend dev server on :3000 has since stopped as well. So the
live `{ne, realia, realiaInfo}` counts could not be taken, and the section 5 span
endpoint oracle was equally unreachable.

Instead the three traps were tested directly, by rebuilding NCBT.1121's real
payload with the documented T1 shape: 22 realia on **non-contiguous** ids
(`Realia-1`, `Realia-3..16`, `Realia-18..24`), 19 `realiaInfo` entries (with
`realia_004667` shared by Realia-3/7/13 and `realia_008501` by Realia-4/19),
multi-word spans (`Realia-5`→Word-16/17/18, `Realia-11`→Word-39..42) and tokens
carrying two realia plus named entities (Word-18, Word-40). Driven through the real
`ApiFragmentRepository.find` → `createFragment` → `Display` path:

| Trap                                               | Result                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 dedup by `realiaId`, no positional zip         | **Pass** — the 3 annotations sharing `realia_004667` all label correctly. `buildRealiaInfoLookup` (`realiaInfo.ts:37-43`) builds a `Map` keyed by `realiaId`; `getSpanLabel` looks up per annotation via `span.realiaId`. Nothing pairs the two arrays by index.                                                                             |
| 4.2 non-contiguous `Realia-*` ids                  | **Pass** — 22 of 22 rendered, none missing. The only place that parses the numeric suffix is `createAnnotationSpanId` (`annotationSpan.ts:182`), which is write-path only (`max+1` when the editor mints a new id) and is gap-safe. Nothing on the read path indexes by the suffix or sizes an array from it.                                |
| 4.3 realia overlapping named entities on one token | **Pass** — Word-18 rendered Entity-2, Entity-10, Realia-5, Realia-6; Word-40 rendered Entity-8, Realia-11, Realia-24. `NamedEntityPreviewToken` (`:26-40`) emits one wrapper containing **two** sequential `SpanIndicators` (entities then realia) with no early return, and `SpanIndicators` maps _every_ covering span keyed by `span.id`. |

So none of 4.1/4.2/4.3 is a client defect. Combined with the earlier proof that a
realia-bearing NCBT.1121 payload renders 9 entity tags plus its realia tags, the
client is exonerated for any non-empty payload; the reported symptom is fully
explained by the T1→T1+15min data loss the backend observed.

## Root cause found (2026-07-24, after realia were re-applied)

The user re-applied a realia annotation and the symptom persisted. The API is not
reachable from this devcontainer (only :3000 is in this network namespace; :8001,
the gateway, `host.docker.internal` and every service hostname all refuse), so the
payload could not be fetched — but the defect is a wiring absence visible in code.

**The Display tab renders a stale fragment: annotations saved in the Named Entities
tab never reach it without a full page reload.**

The chain:

1. `FragmentView.tsx:129-142` — the fragment is fetched by `withData` with
   `watch: (props) => [props.number]`. The **tab is not watched**, so switching
   tabs does not re-fetch.
2. `CuneiformFragment.tsx:142` — `CuneiformFragmentController` holds it in
   `const [currentFragment, setFragment] = useState(fragment)` and passes
   `currentFragment` to every tab. It is only ever replaced by `handleSave`
   (`:147-164`, `setFragment(updatedFragment)`), which is exposed to tabs as
   `onSave`.
3. `editorTabContents.tsx:68-75` — `NamedEntityAnnotationContents` is the **only**
   editor tab that never calls `props.onSave`. It renders
   `<TextAnnotation fragmentService number />`, which fetches its _own_ private
   copy of the fragment via `withData`.
4. `SpanAnnotationDisplay.tsx:45-51` — `saveAnnotations` calls
   `updateNamedEntityAnnotations(...)` and **discards the `Fragment` it returns**,
   using the result only to reset `initialAnnotations` for the dirty check.

Every other tab (Edition, Lemmatization, References, Archaeology, Colophon, Scope)
routes its save through `props.onSave(...)`, so the parent fragment is replaced and
the Display tab sees the change. The named-entity/realia tab does not.

Consequence, matching the report exactly: NCBT.1121's 9 named entities were already
persisted when the page loaded, so they are in `currentFragment` and render in the
preview. A realia annotation added in this session is persisted server-side but is
absent from `currentFragment`, so the preview shows named-entity tags and no realia
— until a hard reload.

### Secondary finding — retracted, it was wrong

I reported that the POST response omits `realiaInfo` (because
`NamedEntityResource.on_post` calls `self._dto_factory.create(...)` while the GET
route passes `resolve_realia_info(...)` explicitly). That was incorrect:
`FragmentDtoFactory.create` in `ebl/fragmentarium/web/dtos.py:57-62` calls
`resolve_realia_info(fragment, self._realia_repository)` itself, so **both** routes
embed `realiaInfo`. No cache degradation, no re-fetch needed, no fix applied.
Checked before writing any code to it.

## Fix applied

Route the named-entity/realia save through the parent's `onSave`, exactly as every
other editor tab does, so the fragment the Display tab renders is replaced with the
one the API returns.

- `editorTabContents.tsx` — `NamedEntityAnnotationContents` now builds
  `updateNamedEntityAnnotations` as
  `props.onSave(props.fragmentService.updateNamedEntityAnnotations(number, annotations))`
  and injects it. `TabsProps.onSave` gained its real type
  (`(updatedFragment: Promise<Fragment>) => Promise<Fragment>`); it was untyped.
- `TextAnnotation.tsx` — takes `updateNamedEntityAnnotations` and forwards it;
  it no longer hands `fragmentService` to the display (it still needs it to fetch).
- `SpanAnnotationDisplay.tsx` — calls the injected `updateNamedEntityAnnotations`
  instead of reaching for `fragmentService` itself, and now `.catch`es the failure
  so a rejected save clears the spinner instead of leaving an unhandled rejection
  (the parent already surfaces the error). Exports the shared
  `UpdateNamedEntityAnnotations` type.
- `CuneiformFragment.tsx` — `onSave` returns `Promise<Fragment>` rather than `void`,
  which is what `handleSave` already did; the save chain needs it.

Regression test: `editorTabContents.test.tsx` (new) drives the real annotation UI,
deletes an annotation, saves, and asserts both that the service was called and that
`onSave` was invoked — it fails on the pre-fix code, where `onSave` was never called.
This also closes part of the pre-existing coverage gap on the file's save callbacks.

## Pre-existing issues found and fixed

1. **`yarn tsc` was failing before this task** — two `TS18046` errors in
   `signs/ui/display/SignImages.tsx`. Root cause: `runWithConcurrencyLimit<T, R>`
   declared `task: (item: T) => Promise<R>`, and inferring `R` from the Bluebird
   returned by `signService.getClusterVariants` collapsed to `unknown`. Fixed by
   widening the parameter to `PromiseLike<R>` and giving the call site explicit type
   arguments. Confirmed pre-existing by stashing this change and re-running.
2. **`TextAnnotation.test.tsx` was 719 lines**, far over the 250-line ceiling, and is
   a file this change touches. Split by cohesion, behaviour identical:
   `TextAnnotation.test.tsx` (60) keeps the render/save tests;
   `TextAnnotation.selection.test.tsx` (174) the mouse-up selection tests;
   `TextAnnotation.selectionFallback.test.tsx` (240) the deferred-selection and
   range-fallback tests; `selectionUtils.test.tsx` (178) the pure `getSelectedTokens`
   tests. Shared scaffolding was extracted rather than duplicated:
   `selection.testSupport.tsx` (selection/range builders + DOM fixture),
   `textAnnotationRender.testSupport.tsx` (`testAnnotations`, `getMarkableButtons`,
   `renderTextAnnotation`) and `overlayStub.testSupport.tsx` (the react-bootstrap
   Overlay stub, referenced from each `jest.mock` factory via `requireActual` so the
   factory body is written once).
3. **`RealiaSelect.test.tsx` was flaky under a loaded full-suite run.** `RealiaSelect ›
searches realia entries and reports the realiaId` failed with
   `search` called once with `'A'` instead of `'Apk'`; it passed in isolation. Root
   cause: the test drove the component's 300 ms **real-timer** debounce with real
   time, so when 369 suites compete for the CPU the gap between two keystrokes can
   exceed 300 ms and the debounce fires on a partial query. External-state
   dependence, not a product defect. Fixed deterministically the way
   `ColophonEditor.test.tsx` already does it: `jest.useFakeTimers()` plus
   `userEvent.setup({ advanceTimers })`, then an explicit
   `advanceTimersByTime(SEARCH_DEBOUNCE_MS)` before asserting — and the assertion
   was tightened to `toHaveBeenCalledTimes(1)` so a partial-query search now fails
   the test rather than racing past it.

## Pre-existing issue NOT fixed — flagged deliberately

`signs/ui/display/SignImages.tsx` is **444 lines**, over the 250-line ceiling. It was
already over before this task; my change to it is a two-line type fix to clear the
tsc failure above. Splitting a 444-line component in an unrelated subsystem (sign
images / PCA clustering) is a large refactor with real regression risk and no
connection to the realia work, so it is called out here rather than attempted. It
wants its own task.

## Process failure during this task — `git stash`

To check whether the `SignImages` tsc errors and the realia-editing test failure were
pre-existing, I ran `git stash` on the shared working tree. Twice. The second time I
put it **inside a background command** that ran the full suite (~10 min) and only
popped afterwards — so all of this task's work sat in a stash while the suite ran,
and I kept editing on top of the stashed-clean tree without noticing.

That background job also had a pending `git stash pop`. Because I popped manually
first during recovery, its pop would have landed on `stash@{0}` — a **pre-existing
user stash** (`On add-realia: reali id url`) — restoring unrelated work into the
tree. The job was killed before it could run.

Nothing was lost: everything was recovered from the stash, the user's 25 stashes are
untouched, and no commit was ever made (HEAD stayed at `b4b16fe5`, branch level with
origin). But `git stash` is the wrong tool on a working tree that is not mine, and
catastrophically so inside a long-running background command. Use a scratch copy or
`git worktree` for "is this pre-existing?" checks instead.

## Gates — run before the commit (2026-07-27)

- `yarn lint` — clean (eslint + stylelint).
- `yarn tsc` — clean.
- `yarn test --watchAll=false` — **369/369 suites, 3739 passed, 2 skipped, 50
  snapshots passed, zero failures.** The first run of the gate failed on the
  pre-existing `RealiaSelect` timing flake (item 3 above); after the fix the full
  suite is green.
- Console-clean: zero `console.error` / `console.warn` / `Warning:` /
  unhandled-rejection lines in the full-suite output. Nothing is mocked to
  suppress output.
- 250-line ceiling: every file this change adds or edits is under it (largest is
  `TextAnnotation.selectionFallback.test.tsx` at 239). The one exception,
  `SignImages.tsx` at 444, is pre-existing and flagged above.
- Coverage of the affected code — `SpanAnnotationDisplay.tsx`, `TextAnnotation.tsx`
  and `RealiaSelect.tsx` are at **100%** on statements, branches, functions and
  lines; the new `NamedEntityAnnotationContents` save callback in
  `editorTabContents.tsx` is covered by `editorTabContents.test.tsx`.

### Data architecture check

- The change threads a callback; it introduces no collection. `AnnotationSpans`
  keeps `namedEntities` and `realia` as separate lists throughout, no id of one
  kind is resolved against the other's map, no new optional field acts as a
  discriminant, and no `as` cast crosses the kinds.
- The outbound payload is still built in exactly one place —
  `omitDerivedSpanFields(spans)` in `SpanAnnotationDisplay.saveAnnotations` — so
  derived/display-only fields (tiers, labels, `realiaInfo`) cannot leak to the API.

### API call efficiency check

- No request is added. The save is one POST, and the fix is precisely that its
  response is now _used_ (`handleSave` seeds `setFragment` with the returned
  `Fragment`) instead of discarded — which removes the page reload the user
  previously needed to see saved annotations. No re-fetch on tab switch.
- `handleSave` cancels the superseded promise (`cancelPromise`) before issuing the
  next save, so a stale response cannot write state after unmount.
- `RealiaSelect` search-as-you-type stays debounced (300 ms), skips the empty
  query, and cancels on unmount; the flake fix hardened the test around that
  behaviour without changing it.

### Pre-existing coverage gaps left in place (outside the changed code)

`editorTabContents.tsx` lines 53/111/128/138 (the `props.onSave(` callbacks of
_other_ editor tabs), `CuneiformFragment.tsx` 59 and 159-160 (the `handleSave`
error branch), and `SignImages.tsx` 102/191/284/367. None are in code this change
touches; covering them means writing tests for unrelated tabs and the sign-image
subsystem. Flagged rather than attempted, same reasoning as the `SignImages`
line-count item.

- Cleanup owed: remove `TASK-realia-preview-broken-{todo,log,api-prompt}.md` and
  `TASK-realia-annotation-candidates-{todo,log}.md` before the PR merges.
