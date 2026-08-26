# PR #750 — Final Adversarial Review (investigation only)

**Verdict: REQUEST CHANGES.** One real correctness defect (C1), two unmet gate/process
conditions (C2, C3), and four medium items. The feature itself is well built — the
security-critical parts (popup XSS, style-URL classification, teardown, unmount races)
are genuinely fixed, not papered over.

---

## 1. Exact branch state

| Item                                  | Value                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Local HEAD                            | `5dcc5a43bd0baad621af756cc129a57cf3678c7b`                             |
| `map-mvp` / `origin/map-mvp`          | `5dcc5a43` (identical — nothing unpushed)                              |
| GitHub PR head SHA                    | `5dcc5a43` (matches)                                                   |
| `origin/master`                       | `4f048a211b1bf44289753603c8db5d8f62566ba4`                             |
| Local `master`                        | `d93126190b…` (stale local ref; not used)                              |
| Merge base                            | `716c62a4932e130f4701f5095604880010768e73`                             |
| Ahead / behind                        | **13 ahead, 1 behind**                                                 |
| Two-dot vs three-dot                  | Differ **only** by the 1 missing master commit                         |
| Working tree                          | `M craco.config.js` (unrelated, uncommitted) + untracked scratch files |
| `git diff --check` / `git stash list` | clean / empty                                                          |
| PR mergeability (API)                 | `mergeable: true`, `mergeable_state: clean`                            |

**Committed PR diff (`origin/master...HEAD`): 44 files, +3042 / −289, 13 commits** — exactly
the numbers on the PR page. The branch has not silently grown.

### Effective candidate — what would actually merge

- **In the PR:** the 44 files above.
- **NOT in the PR (local noise, correctly excluded):** the uncommitted `craco.config.js`
  edit, `.deepcode/`, `docs/`, and all `TASK-*.md` / `FIX_N_CALLS_*.md` scratch files.
- The uncommitted `craco.config.js` hunk adds a `jest.moduleNameMapper` for
  `maplibre-gl.css` that **duplicates** the one already committed in `package.json`.
  It is inert for this PR but must not be committed here.

### Behind-master risk: quantified, not assumed

The single missing commit is `4f048a21` (#788, "Restore corpus alignment highlight").
Files it touches:

```
src/corpus/ui/ChapterView.sass, ChapterViewLine.tsx, ChapterView snapshot,
src/transliteration/ui/AlignmentPopover.{tsx,test.tsx}, WordInfo.{tsx,sass},
WordInfoAlignments.test.tsx
```

Intersection with the 44 PR files: **empty**. No reversion, no conflict, no shared
module. Unlike prior review rounds, "behind master" here is a formality, not a
correctness risk — the two-dot diff's apparent deletion of `AlignmentPopover.tsx` is
purely the missing master commit, not a revert by this branch.

---

## 2. Critical / blocking findings

### C1 — Filter changes are silently dropped whenever basemap tiles are in flight

`src/map/useMapSourceData.ts:14`

```ts
if (!map || !map.isStyleLoaded() || provenances === null) return
const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
if (!source) return
source.setData(provenanceToGeoJson(provenances))
```

`Map.isStyleLoaded()` delegates to `Style.loaded()`, which returns **false while any
source cache still has tiles loading** (and while there are pending style changes) — not
merely "before first load". Vector basemap tiles load on every pan, zoom and initial
render, so this is a common state, not an exotic one.

**Failure scenario:** open `/tools/map`, and type into the filter while the CARTO tiles
are still loading (typical on first open or after a zoom). The effect returns before
`setData`. There is **no retry, no `styledata`/`idle` listener, and no queued value** —
`filteredProvenances` only changes on the next keystroke. If the _last_ keystroke is the
one that lands in that window, the map keeps rendering the previous (or unfiltered)
marker set while the link list, the empty-state alert and the filter input all show the
new one. The map and the text alternative disagree, permanently, until the user types
again.

**Root cause:** `isStyleLoaded()` is a redundant and over-strict guard. The real
precondition is already tested on the next line — `getSource(SOURCE_ID)` returns
`undefined` until `initializeFindspotSource` has run, and `Map.getSource` is safe to call
before style load (it resolves through `Style.sourceCaches`, returning `undefined`, not
throwing). Deleting `!map.isStyleLoaded() ||` fixes the desync without weakening any
guard.

**Why no test caught it:** `MapTab.filtering.test.tsx:31` leaves `mockIsStyleLoaded`
at its `true` default; the one test that sets it `false` (`:74`) also defers map load, so
it only exercises the already-fixed pre-load path. The "style loaded, source present,
`isStyleLoaded()` false" combination is never constructed.

**Severity: Medium-High.** Silent, user-visible data/UI divergence in the feature's
primary interaction. Fix is one clause plus one test.

---

### C2 — The accessibility statement (F11 → F18) is still absent from the PR description

Fetched live from the API at review time; the body is verbatim the original three
sentences and contains no mention of accessibility, pointer-only interaction, or the
link list. The reviewer made this an explicit, minimal acceptance condition twice
(2026-07-28 and 2026-08-11) and confirmed the code side is fine. It remains unmet.

For accuracy in whatever sentence is added: interaction is **not** wholly pointer-only.
`NavigationControl` is added (`useFindspotMap.ts:132`) and is keyboard operable. What is
pointer-only is **findspot inspection** — the cluster/point click that opens a popup. The
`Findspot searches` list is the keyboard/screen-reader equivalent for that.

---

### C3 — Open automated-review findings on the current head

`qltysh[bot]`, posted against **commit `5dcc5a43` (the current head)**, on
`src/map/MapTab.tsx:137`:

- `qlty:return-statements` — Function with many returns (count = 13): `MapTab`
- `qlty:function-complexity` — Function with high complexity (count = 38): `MapTab`

`.github/copilot-instructions.md` ("Review Guidelines") makes resolving **every** finding,
"including … those raised by automated review bots", a hard gate, and forbids deferring
them. These are the only bot findings not yet resolved: the Codex P1 (missing dependency)
is moot (`maplibre-gl@^5.24.0` is already in `origin/master`'s `package.json` and
`yarn.lock`), the Codex P2 filter-on-load issue is fixed by the `latestProvenancesRef`
path, the Codex P2 `setHTML` XSS is fixed (see §4), and CodeQL alert 31 is fixed (see §4).

Either resolve them (extracting the empty-state/link-list JSX from `MapTab` would drop
both counts) or record an explicit, justified exception.

---

## 3. Medium findings

### M1 — No geographic range validation; a finite-but-invalid latitude throws inside the `load` handler

Nothing on the path enforces `-180..180` / `-90..90`. `sanitizeProvenanceRecord`
(`src/fragmentarium/domain/Provenance.ts:24-40`, pre-existing on master) checks only
`Number.isFinite`, and `getFeaturePointCoordinates` repeats exactly that. So
`latitude: 1e308` — or a transposed record, or a typo'd `925.4` — survives to
`fitMapToData` → `maplibregl.LngLatBounds.extend()`, and real MapLibre's `LngLat.convert`
**throws** `Invalid LngLat latitude value: must be between -90 and 90`. That throw
happens inside `handleLoad`, i.e. inside MapLibre's event dispatch, from an effect —
the map does not finish initializing and there is no `try`/`catch` anywhere on that path.
Supercluster also produces NaN mercator coordinates for `|lat| > 90`.

The prior reviewer's own F20 note anticipated this exact case ("if the rule ever changes
— say, a latitude range check"). The tests cannot see it because the mock
`LngLatBounds.extend` (`testSupport/mapLibreMock.ts:78`) accepts anything.

There is no upstream guarantee to lean on: `/provenances` is a plain
`apiClient.fetchJson` with no schema validation
(`FragmentRepository.ts:124`). Add a range check to `getFeaturePointCoordinates` (the
now-canonical single implementation) and one out-of-range fixture.

### M2 — DRY hard gate (F21) is still failing, and the duplication grew

`Tools.test.tsx:22-44`, `Tools.navigation.test.tsx:23-44`, `Tools.routes.test.tsx:24-45`

The 12 `jest.mock` registration lines plus the `mockToolsContent` helper are now
byte-identical across **three** files, one more than when F21 was raised. What was
extracted is the mock _components_ (`Tools.contentMocks.testSupport.tsx`) — real progress,
and the `expectToolsContentPagesMocked` guard test in each suite does close the specific
failure mode the reviewer named (add a tool, forget a file, silently import the real
page). But the letter of the hard gate — "if the same domain logic or mapping appears in
more than one place, extract and reuse a shared helper" — is still unmet, and the
suggested remedy (a shared setup module these three suites opt into via
`setupFilesAfterEach`) was not attempted. Call it consciously accepted or fix it; it
should not be reported as closed.

### M3 — Findspot list links break SPA navigation

`src/map/MapTab.tsx:128`

```jsx
<a href={buildFragmentSearchLink(provenance.longName)}>{provenance.longName}</a>
```

Inside the React tree, a plain `<a href>` triggers a **full document reload** of the whole
app — bundle re-download, auth re-init, scroll loss — where every other internal link in
this very file's neighbourhood uses `react-router`'s `Link` (`Tools.tsx:92`). The popup
anchor genuinely must be a raw `<a>` (it is built with `document.createElement` outside
React and handed to MapLibre), but the list has no such constraint. This is the
accessible alternative the whole MVP a11y argument rests on, so it is the path that
should feel best, not worst.

### M4 — The new third-party origin is not in the shipped CSP, and no verification covers it

`public/serve.json`

Production is `serve -s /usr/src/ebl-frontend/build` (`Dockerfile`), and `serve` applies
`build/serve.json`, so this CSP is live:

```
default-src 'self'; connect-src 'self' https: …; worker-src 'self' blob:;
img-src 'self' data: blob: https://cdli.earth …; style-src 'self' 'unsafe-inline' …
```

`basemaps.cartocdn.com` appears nowhere. Static analysis says it most likely still works
— style JSON, sprite JSON, glyph `.pbf` and vector tiles all go through `fetch`/XHR and
are permitted by the blanket `connect-src https:`; the worker is a `blob:` URL covered by
`worker-src blob:`; sprite bitmaps decode from an arrayBuffer or a `blob:` object URL
covered by `img-src … blob:`. But that is a chain of four assumptions resting on a
wildcard nobody added deliberately for this feature.

Critically, **none of the browser verification in this PR's history exercised it**:
`yarn start` (webpack-dev-server) does not serve `public/serve.json` headers. Before
merge, load a `serve`-hosted production build once and confirm a clean console, or add
the origin explicitly to `connect-src`/`img-src`.

---

## 4. What I tried to break and could not — verified good

| Contract item                    | Verdict        | Evidence                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `/tools/map` route            | ✅             | Auto-generated from `tabIds` in `toolsRoutes.tsx:90-113`; `exact`; asserted in `Tools.navigation.test.tsx`                                                                                                                                                                                                    |
| 2. Lazy-loaded                   | ✅             | `React.lazy(() => import('map/MapTab'))` (`toolsContent.tsx:30`); element creation ≠ import; `import type` conversions keep service modules out of the eager graph; MapLibre JS **and** its CSS land in the async chunk                                                                                       |
| 3. No backend change             | ✅             | Pre-existing `GET /provenances` (`FragmentRepository.ts:124`), `ProvenanceRecord` untouched, no new fields                                                                                                                                                                                                    |
| 4. Only valid geometry → GeoJSON | ✅             | `getRenderableProvenanceGeometry` (master) drops non-finite lat/lng and polygons with <3 valid vertices; `provenanceToGeoJson.test.ts` covers point/polygon/missing/NaN/mixed/all-invalid                                                                                                                     |
| 5. Longitude/latitude order      | ✅             | Traced end-to-end: `[point.longitude, point.latitude]` (`provenanceToGeoJson.ts:51`) → `getFeaturePointCoordinates` → `setLngLat` → `bounds.extend`. Fixture `[44.42, 32.542]` is Babylon (32.54°N 44.42°E) — right continent. Popup re-maps `[0]→longitude, [1]→latitude` correctly                          |
| 6. Clustering                    | ✅             | `cluster: true`, radius 50, maxZoom 14; `['has','point_count']` / `['!',['has','point_count']]` filters are correct and mutually exclusive                                                                                                                                                                    |
| 7. Interaction                   | ✅             | `click` → cluster query first, then unclustered; layer-scoped `mouseenter`/`mouseleave` + `mousemove` cursor                                                                                                                                                                                                  |
| 8. Safe popups                   | ✅             | See "XSS" below                                                                                                                                                                                                                                                                                               |
| 9. Deep links                    | ✅             | `/library/search?site=<longName>`; verified `SearchFormProvenance.tsx:26` uses `site.longName` as the option **value**, `SearchForm.tsx:326` binds it to `controlId="site"`, `fragmentariumRoutes.tsx:94` `parse`s the query, `FragmentQuery.site: string`. Same `query-string` library on both sides         |
| 10. Text alternative             | ✅             | `<nav aria-label="Findspot fragment searches">` with real `<a>` links; survives basemap failure (asserted, `MapTab.errors.test.tsx:40`) and includes geometry-less provenances (asserted, `MapTab.test.tsx:171`) — F27 settled deliberately, as the reviewer preferred                                        |
| 11. Empty/error states           | ✅             | F22 fixed: `getEmptyStateMessage` distinguishes "no data" from "no match", both asserted (`MapTab.test.tsx:146`)                                                                                                                                                                                              |
| 12. Basemap failure              | ✅             | Distinct warning alert; list stays usable; provenance-API failure is a separate `Alert variant="danger"` — the two external dependencies are not conflated                                                                                                                                                    |
| 13. Resource cleanup             | ✅             | Every `map.on` has a matching `map.off` with the **same handler reference**, then `map.remove()`, then `mapRef.current = null`; asserted on unmount                                                                                                                                                           |
| 14. No post-unmount state        | ✅             | `ignore` flag honoured on **both** `.then` and `.catch`; parameterised test covers success and rejection (`MapTab.test.tsx:183`)                                                                                                                                                                              |
| 15/16. No unsafe HTML/URL        | ✅             | See below                                                                                                                                                                                                                                                                                                     |
| 17/18. CSS scope                 | ✅             | Everything nests under `.map-tab`; `.maplibregl-popup-content a` is correctly scoped (popups are appended to the map container, a `.map-tab` descendant, so the selector still matches) — F13 fixed properly. No `!important`, no bare element selectors, no global MapLibre overrides anywhere else in `src` |
| 19. Existing Tools routes/tests  | ✅             | `tabIds` append-only; nav order asserted for all 11 tabs; `Dictionary` snapshot churn is purely additive (5 identical `+16` nav-link hunks, no removals); `router.lazy-loading.test.tsx` mocks `router/toolsRoutes` wholesale and is unaffected                                                               |
| 20. 250-line gate                | ✅             | Largest changed file is `useFindspotMap.test.tsx` at **235**; `useFindspotMap.ts` 179, `MapTab.tsx` 138. All 44 pass                                                                                                                                                                                          |
| 21. Unrelated scope              | ✅ (with note) | Only `realiaOptionLoader.ts` — see below                                                                                                                                                                                                                                                                      |

### XSS (§31–33) — proved from code, not from tests

`createFindspotPopup.ts` uses **only** `document.createElement`, `textContent` and
`setAttribute`; there is no `setHTML`, `innerHTML`, `insertAdjacentHTML` or
`dangerouslySetInnerHTML` anywhere in `src/map` production code (grep-verified).
`useFindspotMap.ts:87` passes the built node via `setDOMContent`. The href is built by
`buildFragmentSearchLink`, which is `` `/library/search?${stringify({site: name})}` `` —
the scheme and path are literal constants, so `javascript:` is unreachable by construction,
and `query-string@7`'s strict `stringify` percent-encodes `&`, `=`, `#`, `/` and non-ASCII.
`MapTab.interactions.test.tsx:85` additionally asserts `setHTML` is **never** called, which
locks the regression shut.

### Style-URL classification (§37–39, CodeQL alert 31)

`isStyleUrl` parses with `new URL()` inside `try`/`catch` and compares
`hostname.toLowerCase() === MAP_STYLE_HOST && pathname === MAP_STYLE_PATH` — exact
equality on both, no substring matching. `MAP_STYLE_URL` is now **derived** from the same
two constants (F23 fixed), so drift is impossible. `isSourceOrLayerScoped` correctly
excludes tile/source/layer-scoped errors before any URL work. The regression tests
(`mapBackgroundError.test.ts:44-134`) independently cover the lookalike host
(`basemaps.cartocdn.com.evil.example`), the path lookalike (`style.json.evil`), relative
URLs, unparseable URLs, sprite, glyph, tile, layer, non-object and null events — with
literal strings, not values derived from the helper under test. Spoofing via error _text_
is impossible: only the structured `error.url` is inspected. This is a genuine fix.

### Cluster expansion (F17/F25)

`.catch(() => easeToClusterCenter())` is now real behaviour — pan to the cluster centre
without changing zoom — not a no-op guard, and `isActive()` gates both branches so a
disposed map is never touched. The test (`useFindspotMap.test.tsx:114`) installs a
`process.on('unhandledRejection')` recorder, asserts it stays empty, **and** asserts
`easeTo` was called with `{center}` only. It now proves what its name claims.

### `realiaOptionLoader.ts` — unrelated but justified

`RealiaService` does `import Promise from 'bluebird'`, so `search()` returns a Bluebird
promise whose overloaded `then` defeats `PromiseLike<T>` inference in `toNativePromise`,
collapsing `T` to `unknown` (TS18046). The defect is pre-existing, still present on
`origin/master`, and the reviewer explicitly required fixing it here (F16) under the
repo's "fix pre-existing issues in the same task" rule. The one-token fix is correct and
minimal. Keep it — but be aware it will conflict if master fixes the same line first.

---

## 5. Low findings

1. **`isStyleUrl` ignores protocol** (`mapBackgroundError.ts:16`) — `http://basemaps.cartocdn.com/gl/positron-gl-style/style.json` classifies as trusted. Impact is confined to which warning banner shows; add `parsed.protocol === 'https:'` for completeness.
2. **Polygon "centroid" is a vertex mean, not a centroid** (`provenanceToGeoJson.ts:7`). A closed ring (first vertex repeated, the GeoJSON norm) biases it toward that vertex, and a concave outline can place the marker outside its own polygon. The fixture at `provenanceToGeoJson.test.ts:30` bakes a duplicated vertex into the expectation. Acceptable for an MVP **because** the popup says "Approximate area location" (F10 honestly resolved) — worth a comment-free rename or a bounds-centre swap later.
3. **Coincident findspots** — `queryRenderedFeatures(...)[0]` means only one of two provenances at identical coordinates is ever reachable by popup, at any zoom (clustering stops at zoom 14). The link list covers both, so nothing is lost; it is simply undocumented and untested.
4. **Popup lifecycle** — popups are never held in a ref. MapLibre's default `closeOnClick` means a stale popup is dismissed by the next map click, but a popup left open for a feature the filter has just removed stays on screen with stale content in the meantime, and nothing closes it on unmount ahead of React tearing down the container.
5. **`mapLinks.test.ts` has no query-delimiter case** — space and non-ASCII are covered, but not `&`, `=` or `#`, which is the security-relevant assertion. The implementation is safe; the test does not say so.
6. **`event: MapLibreErrorEvent | unknown`** (`mapBackgroundError.ts:37`) collapses to plain `unknown`; the union member is dead. Prefer `unknown` alone.
7. **Mock blind spots** — `mockMapInstance` is a module-level singleton, so a second MapLibre instance leaking across a remount would be invisible; `rememberHandler` overwrites by `event:layer` key, so duplicate `map.on` registrations would also be invisible. Both are exactly the leak classes §12/§57 ask about. The production code is correct on inspection; the tests simply cannot prove it.
8. **Raw fetch error text is rendered** (`MapTab.tsx:81`) — safe (React escapes it) but may surface internal URLs from `ApiError` messages.
9. **Task scratch files** — `TASK-MAP-MVP-{todo,log}.md` exist locally but are untracked and **not** in the PR. Per the repo's cleanup rule, delete them before merge; no action needed on the PR itself.

---

## 6. Historical findings — reassessed against the final tree

| #         | Finding                          | Root fixed?                     | Evidence                                                                                                                                                                       |
| --------- | -------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1        | Jest fails on `maplibre-gl.css`  | ✅                              | `package.json` `moduleNameMapper` `^maplibre-gl/dist/maplibre-gl\.css$` — anchored on both ends, single module, zero blast radius                                              |
| —         | `jest.mock(…, {virtual:true})`   | ✅                              | Zero occurrences repo-wide                                                                                                                                                     |
| —         | Missing real manual mock         | ✅                              | `src/__mocks__/maplibre-gl.ts` (2 lines, `export *` + default)                                                                                                                 |
| F2        | `useFindspotMap.ts` 271 lines    | ✅                              | 179; four genuine extractions, dependency direction is hook → pure helpers throughout (F7's inversion is gone), no import cycles                                               |
| F3        | Popup coverage                   | ✅                              | `coordinates: undefined` case added (`createFindspotPopup.test.ts:83`)                                                                                                         |
| F4/F75    | Duplicated `makeProvenance`      | ✅                              | Single side-effect-free `map/testFixtures/provenance.ts`                                                                                                                       |
| F5        | Broad basemap error matching     | ✅                              | Pattern list gone; structured `error.url` + source/layer/tile scoping                                                                                                          |
| F6        | Popup coordinates computed twice | ✅                              | Computed once, passed into `getPopupProperties`                                                                                                                                |
| F8        | Broad cursor catch               | ✅                              | Replaced by an `if (canvas?.style)` guard                                                                                                                                      |
| F10       | Misleading polygon popup text    | ✅                              | "Approximate area location"                                                                                                                                                    |
| F13       | Global popup CSS                 | ✅                              | Nested under `.map-tab`                                                                                                                                                        |
| F14/F21   | Duplicated Tools mocks           | ⚠️ **Partial**                  | See M2 — components shared + guard test added; 12 registrations still ×3                                                                                                       |
| F16       | `yarn tsc` red                   | ✅                              | See §4                                                                                                                                                                         |
| F17       | Dead catch / coverage            | ✅                              | Catch now pans to cluster centre                                                                                                                                               |
| F18/F11   | A11y statement in PR description | ❌ **Open**                     | See C2                                                                                                                                                                         |
| F19/F15   | Behind master                    | ⚠️ 5 → **1**, zero file overlap | See §1                                                                                                                                                                         |
| F20       | Duplicated coordinate extraction | ✅                              | Single `map/pointCoordinates.ts`, both call sites use it                                                                                                                       |
| F22       | Empty-state copy                 | ✅                              | `getEmptyStateMessage` + test                                                                                                                                                  |
| F23       | Style-URL drift                  | ✅                              | `MAP_STYLE_URL` derived from host+path                                                                                                                                         |
| F24       | Re-export boilerplate            | ✅                              | `MapTab.testHelpers.tsx` down to 20 lines                                                                                                                                      |
| F25       | Weak rejection test              | ✅                              | `unhandledRejection` recorder + behavioural assertion                                                                                                                          |
| F26       | Non-null assertion               | ✅                              | Replaced with `const loadedProvenances = …; if (loadedProvenances)`                                                                                                            |
| F27       | Geometry-less in link list       | ✅                              | Deliberate, now explicitly tested                                                                                                                                              |
| Codex P1  | Missing dependency               | ✅ (moot)                       | `maplibre-gl@^5.24.0` already on `origin/master` in both `package.json` and `yarn.lock`; lockfile needs no change for `identity-obj-proxy@^3.0.0` (descriptor already present) |
| Codex P2  | Filter lost on style load        | ✅                              | `latestProvenancesRef` read in `handleLoad`; asserted (`MapTab.filtering.test.tsx:68`)                                                                                         |
| Codex P2  | `setHTML` XSS                    | ✅                              | DOM construction + `setHTML` never-called assertion                                                                                                                            |
| CodeQL 31 | URL substring sanitization       | ✅                              | Exact host+path via `new URL()`, with lookalike regression tests                                                                                                               |
| qlty      | `MapTab` complexity/returns      | ❌ **Open on HEAD**             | See C3                                                                                                                                                                         |

---

## 7. Other checks — no finding

- **Type safety:** no `any`, no `@ts-ignore`/`@ts-expect-error`, no `eslint-disable`, no `istanbul ignore`, no `.only`/`.skip` anywhere in the diff. Non-null assertions: none remaining in `src/map`. `unknown` appears only in type guards and test casts.
- **Comments:** zero comments in `src/map` — complies with the repo rule.
- **Imports:** zero relative imports in `src/map` and the new router files; all alias-based.
- **Logging:** no `console.*`, no `debugger`.
- **Feature identity:** GeoJSON `feature.id` and `properties.id` both use `provenance.id` (the same value used as `/provenances/{id}`), not the display name. React keys use `provenance.id`, not the index or the label — duplicate `longName` values cannot collide.
- **Popup property parsing:** `getPopupProperties` validates every field at runtime (`typeof name === 'string'`, parent string-or-absent, `geometryType` narrowed by a type guard) before any DOM use, and returns `null` otherwise. Rejection cases are parameterised in two suites.
- **Mutation:** no `sort`/`reverse`/`splice` on service data; `filter`/`map` only; GeoJSON objects are freshly built per call.
- **MapLibre expressions:** layer filters and paint expressions are static literals; no provenance string ever reaches an expression, a source URL or a DOM attribute other than the encoded `href`.
- **Navigation:** no `window.open`, no `window.location` assignment. All links are same-origin relative paths; origin cannot be influenced by backend data.
- **Third-party privacy:** style/tiles/glyphs/sprites only; no API key, no eBL data, no search terms in any external URL. `Referrer-Policy: strict-origin-when-cross-origin` limits leakage to the origin. `NavigationControl` is added and default attribution is not disabled, so CARTO/OSM attribution is preserved.
- **Jest config blast radius:** the one `moduleNameMapper` entry is anchored `^…$` on a single file path; `transformIgnorePatterns` is untouched.
- **Effects:** `useFindspotMap`'s deps are `[containerRef, isReady, onMapBackgroundError]` — `containerRef` is stable, `isReady` flips once, and `handleMapBackgroundError` is a `useCallback([])`. The map is created exactly once per mount, and is idempotent under a StrictMode double-invoke (cleanup fully removes and nulls before re-creation). The app does not use `StrictMode` today in any case.
- **Layer-ID collisions:** `ebl-findspots`, `ebl-clusters`, `ebl-cluster-count`, `ebl-unclustered-points` — namespaced, defined once in `mapLayers.ts`, asserted in tests.
- **Performance:** GeoJSON conversion is memoised behind `filteredProvenances`; the list is a linear render of a provenance set numbering in the dozens/low hundreds. No O(N²), no virtualization needed.
- **Layout:** `.map-tab__container` has an explicit `height: 500px` and `width: 100%` (MapLibre's non-zero-height requirement satisfied); the list uses `columns: 2 14rem`, which collapses to one column on narrow screens.

---

## 8. What has to be done

1. **Remove the `!map.isStyleLoaded() ||` clause** from `src/map/useMapSourceData.ts:14`, keeping the `getSource` guard, and add a test with `mockIsStyleLoaded` returning `false` while `mockGetSource` returns a source — asserting `setData` still runs. _(C1, blocker)_
2. **Add the accessibility sentence to the PR description**, wording it as _findspot inspection_ being pointer-only (navigation controls are keyboard operable) with the `Findspot searches` list as the equivalent. _(C2, blocker — explicit reviewer condition)_
3. **Resolve or formally waive the two open qlty findings** on `MapTab` (complexity 38, 13 returns) on commit `5dcc5a43`. Extracting the empty-state + link-list JSX into a sibling component addresses both. _(C3, blocker under the repo's own review rules)_
4. **Add latitude/longitude range validation** to `getFeaturePointCoordinates`, plus an out-of-range fixture, so a bad record cannot throw inside the MapLibre `load` handler. _(M1)_
5. **Decide M2 explicitly:** either move the 12 shared `jest.mock` registrations into a setup module the three Tools suites opt into, or record that the `expectToolsContentPagesMocked` guard is the accepted mitigation. Do not report F21 as closed either way.
6. **Switch the findspot list to `react-router`'s `Link`**, leaving the popup's raw `<a>` as is. _(M3)_
7. **Verify the map against a `serve`-hosted production build** (so `public/serve.json`'s CSP actually applies) and confirm a clean console; add `https://basemaps.cartocdn.com` to `connect-src`/`img-src` if anything is blocked. _(M4)_
8. **Merge `origin/master`** (1 commit, `4f048a21`, zero file overlap) and let CI re-run so a green check describes the merge result. _(F19 — formality, but the branch has been reported green against a non-merge tree three times now.)_
9. **Do not commit** the local `craco.config.js` edit — it duplicates the `moduleNameMapper` already in `package.json`. Delete `TASK-MAP-MVP-{todo,log}.md` before merge.
10. Optionally close the low findings in §5 — at minimum the protocol check (5.1) and the `&`/`=` link-encoding test (5.5).

---

_Investigation only. No source, test, config, snapshot, package or Git state was modified;
no tests or quality gates were run. Reviewed at `origin/map-mvp` `5dcc5a43` against
`origin/master` `4f048a21`._
