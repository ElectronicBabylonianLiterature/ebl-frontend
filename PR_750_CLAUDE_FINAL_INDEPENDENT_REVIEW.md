# PR #750 Claude Final Independent Review

## 1. Executive Summary

| Item                     | Status                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Final assessment**     | The map MVP is correct, secure and accessible. Every remediation claim was independently re-proved from the tree, the compiled output, and GitHub's API — none accepted on report. |
| **Final verdict**        | **READY AFTER MINOR CORRECTIONS**                                                                                                                                                  |
| Findings                 | BLOCKER 0 · HIGH 0 · MEDIUM 2 · LOW 5                                                                                                                                              |
| Merge blockers           | None in code. Two process/documentation items.                                                                                                                                     |
| Confidence               | High for code; the two MEDIUMs are verifiable facts, not judgement calls.                                                                                                          |
| Candidate-tree status    | **Unambiguous.** Committed + pushed at `85cca955`; worktree clean of PR content.                                                                                                   |
| Branch/master status     | 1 behind `cccacb0e` (three Assurbanipal font binaries) — demonstrably unrelated.                                                                                                   |
| CI-final-SHA status      | ✅ CI ran on `85cca955`, which **is** the PR head.                                                                                                                                 |
| PR-goal status           | ✅ `/tools/map` delivers the stated MVP.                                                                                                                                           |
| Map/list synchronization | ✅ C1 genuinely fixed; regression test proved effective by analysis.                                                                                                               |
| Coordinate safety        | ✅ One rule, all three MapLibre paths gated.                                                                                                                                       |
| Popup / XSS              | ✅ Zero HTML sinks; DOM-only construction; unchanged since prior audit.                                                                                                            |
| Deep-link security       | ✅ One builder, literal same-origin path, strict encoding, delimiter test.                                                                                                         |
| Map lifecycle            | ✅ 6 on / 6 off, `remove()`, ref nulled, async guards.                                                                                                                             |
| Basemap security         | ✅ Structural `new URL()` host+path; spoof-proof.                                                                                                                                  |
| CSP                      | ✅ Compatible by static proof; one production-served smoke still recommended.                                                                                                      |
| Accessibility            | ✅ Code fallback complete. ⚠️ PR description sentence still missing.                                                                                                               |
| Qlty                     | ✅ `qlty check` **success** on `85cca955`. Visible comment is a stale thread.                                                                                                      |
| Tools mock / DRY         | ✅ 1 mapping site, 1 registration site; hoisting proved from Babel output.                                                                                                         |
| Hard gates               | ✅ 0 files > 250; 0 new `any`/suppressions/comments/console/relative imports.                                                                                                      |
| Scope                    | ✅ Clean. `craco.config.js` correctly excluded.                                                                                                                                    |
| Ready to approve         | After the PR-description sentence and resolving 5 stale threads.                                                                                                                   |

---

## 2. Repository / PR State

| Item                         | Value                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Branch                       | `map-mvp`                                                                           |
| Local HEAD                   | `85cca9557bb4c2488eb8c0e32ae7c8530a993bd5`                                          |
| `map-mvp` / `origin/map-mvp` | `85cca955` — **all three identical**                                                |
| GitHub PR head SHA           | `85cca955` — **matches**                                                            |
| `origin/master`              | `cccacb0e85443b098ffa218e203edacf71c12610`                                          |
| Merge base                   | `4f048a211b1bf44289753603c8db5d8f62566ba4`                                          |
| Ahead / behind               | 14 ahead, **1 behind**                                                              |
| `MERGE_HEAD`                 | none — the merge was finalized                                                      |
| `git diff --check` / stash   | clean / empty                                                                       |
| PR API                       | open, `mergeable: true`, `mergeable_state: clean`, 14 commits, 47 files, +3160/−325 |

`85cca955` is a **merge commit** (parents `5dcc5a43` + master `4f048a21`) that also carries the remediation. `git merge-base --is-ancestor 4f048a21 HEAD` → true: master `4f048a21` is integrated.

## 3. Effective Candidate Tree

Unambiguous. The candidate is the committed, pushed SHA `85cca955`. Working tree contains only:

- ` M craco.config.js` — unrelated, uncommitted, **verified absent from the PR diff**
- untracked `.deepcode/`, `docs/`, `.devcontainer/devcontainer-lock.json`, `PR_750_CLAUDE_FINAL_ADVERSARIAL_REVIEW.md`

None of these are in `origin/master...HEAD`. The previous review round's `BLOCKED BY WORKTREE STATE` risk is gone.

## 4. Current Master Compatibility

`origin/master` advanced `4f048a21` → `cccacb0e` during this review. The single missing commit is **#789 "Update Assurbanipal font"**, touching exactly:

```
src/Assurbanipal.ttf, src/Assurbanipal.woff, src/Assurbanipal.woff2
```

Three font binaries. Zero overlap with the 47 PR files; no router, Tools, map, provenance, Jest or package involvement. Two-dot vs three-dot differ by exactly these three files. **Not blocking**, and CI on `85cca955` remains a valid predictor of the merge result.

## 5. Current Frontend Rules

From `.github/copilot-instructions.md`: ≤250 lines per `.ts/.tsx` (hard gate); DRY (hard gate); no comments unless requested; full alias import paths; avoid `any`/`unknown`; 100% coverage on affected code; console-clean tests; no test removal; `yarn lint` and `yarn tsc` hard gates; **every automated-review finding must be resolved, not deferred**; review comment status tracking required. `.qlty/qlty.toml` sets no custom thresholds (defaults apply).

## 6. Existing Review Feedback

| Reviewer                      | State             | On commit  | Live?                                         |
| ----------------------------- | ----------------- | ---------- | --------------------------------------------- |
| khoidt                        | CHANGES_REQUESTED | `22153ef1` | superseded                                    |
| khoidt                        | CHANGES_REQUESTED | `11dfb1a5` | superseded                                    |
| khoidt                        | CHANGES_REQUESTED | `037d71d7` | **latest human review — not yet re-reviewed** |
| qltysh[bot]                   | COMMENTED         | `c1ed38fb` | stale thread                                  |
| chatgpt-codex-connector[bot]  | COMMENTED         | `c1ed38fb` | stale threads ×3                              |
| github-advanced-security[bot] | COMMENTED         | `8ff9af79` | stale thread                                  |

## 7. Complete Final File Inventory

47 files. All reviewed; no sampling.

| Group                 | Files                                                                                                               | Result                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Route integration     | `Tools.tsx`, `toolsConfig.tsx`, `toolsContent.tsx`, `toolsRoutes.entities.tsx`                                      | ✅ append-only tab; lazy import; description added |
| Map UI                | `MapTab.tsx` (77), `FindspotResults.tsx` (43)                                                                       | ✅ cohesive split                                  |
| Hooks                 | `useProvenances.ts` (40), `useFindspotMap.ts` (179), `useMapSourceData.ts` (21)                                     | ✅                                                 |
| Domain helpers        | `findspotFilter.ts`, `provenanceToGeoJson.ts`, `pointCoordinates.ts`, `mapBounds.ts`, `mapLayers.ts`, `mapLinks.ts` | ✅                                                 |
| Popup                 | `createFindspotPopup.ts`, `findspotPopupProperties.ts`                                                              | ✅ security-critical, unchanged                    |
| Interactions / errors | `mapCursor.ts`, `mapBackgroundError.ts`                                                                             | ✅ security-critical, unchanged                    |
| Styles                | `MapTab.sass` (34)                                                                                                  | ✅ fully scoped                                    |
| Test infrastructure   | `__mocks__/maplibre-gl.ts`, `testSupport/mapLibreMock.ts`, `testFixtures/provenance.ts`, `MapTab.testHelpers.tsx`   | ✅                                                 |
| Map tests             | 12 suites                                                                                                           | ✅                                                 |
| Router tests          | `Tools.{test,navigation,routes}.test.tsx`, `Tools.testSupport.tsx`, `Tools.contentMocks.testSupport.tsx`            | ✅                                                 |
| Config                | `package.json`                                                                                                      | ✅ minimal, necessary                              |
| Snapshot              | `Dictionary.integration.test.ts.snap`                                                                               | ✅ additive nav-link hunks only                    |
| Unrelated (mandated)  | `realiaOptionLoader.ts`                                                                                             | ⚠️ see §53                                         |

**`craco.config.js` and `yarn.lock` are NOT in the PR diff** — verified directly.

## 8. Final Feature Architecture

| Stage              | File / function                                                           | Correct?     |
| ------------------ | ------------------------------------------------------------------------- | ------------ |
| `/tools/map` route | `toolsRoutes.tsx` `tabIds.map(...)`, exact                                | ✅           |
| Lazy tab           | `toolsContent.tsx:30` `React.lazy(() => import('map/MapTab'))` + Suspense | ✅           |
| Fetch              | `useProvenances` → `fragmentService.fetchProvenances()`                   | ✅           |
| Filter             | `filterProvenances` (memoised)                                            | ✅           |
| GeoJSON            | `provenanceToGeoJson` → `toFindspotLocation` → `isValidPointCoordinate`   | ✅           |
| Map init           | `useFindspotMap` → `new maplibregl.Map` + `NavigationControl`             | ✅           |
| Source/layers      | `initializeFindspotSource` on `load`, from `latestProvenancesRef`         | ✅           |
| Source updates     | `useMapSourceData` → `getSource` → `setData`                              | ✅ **fixed** |
| Interaction        | `handleMapClick` → cluster → point → popup                                | ✅           |
| Popup              | `getPopupProperties` → `createFindspotPopup` → `setDOMContent`            | ✅           |
| Deep link          | `buildFragmentSearchLink`                                                 | ✅           |
| Text alternative   | `FindspotSearchList` → `<Link>` → same builder                            | ✅           |

## 9. Route / Lazy Loading

`'map'` appended to `tabIds` (`toolsConfig.tsx:16`) and `tabConfig` (`:48`); route auto-generated with `exact`; `tabDescriptions.map` present. MapLibre JS **and** `maplibre-gl.css` are imported inside `MapTab.tsx`, which is only reachable through the `React.lazy` boundary — users who never open `/tools/map` do not download MapLibre. No other tool route removed or reordered.

## 10. Provenance Data Contract

`GET /provenances` via the pre-existing `FragmentRepository.fetchProvenances` (unchanged, not in the diff). `ProvenanceRecord` unchanged. No new backend field, no unmerged backend dependency.

## 11. Fetch Lifecycle

`useProvenances.ts:18-37`: `let ignore = false`; **both** `.then` and `.catch` gated on `!ignore`; cleanup sets `ignore = true`. Mount→resolve→setState ✅. Mount→unmount→resolve/reject→no setState ✅ (tested for both outcomes).

## 12. Filtering

`findspotFilter.ts` — `trim().toLowerCase().includes(...)`. No regex construction from user input, so no injection or catastrophic backtracking. Semantics identical to pre-refactor.

## 13. Source Synchronization — C1 re-proved

`useMapSourceData.ts:14` now reads `if (!map || provenances === null) return`. `isStyleLoaded()` is gone from production entirely (grep-verified: zero non-test references).

| Case                               | Behaviour                                                                                      | Verdict    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| **A** source not yet initialized   | `getSource` → `undefined` → return; latest value still reaches init via `latestProvenancesRef` | ✅ safe    |
| **B** source exists, tiles loading | `setData` runs — the exact defect, now fixed                                                   | ✅ fixed   |
| **C** map removed                  | cleanup sets `mapRef.current = null` before any later effect                                   | ✅ safe    |
| **D** rapid successive filters     | effect re-runs per change, `setData` synchronous, last write wins                              | ✅ correct |

`getSource` is also safe before style load and after style failure (returns `undefined`, never throws), so a failed basemap cannot make this effect throw repeatedly.

## 14. C1 Regression-Test Audit

`MapTab.filtering.test.tsx` — _"updates the source while the style reports unfinished tile loading"_: source present, map loaded (`waitFor(mockAddSource)`), then `mockIsStyleLoaded.mockReturnValue(false)`, then types `nip`; asserts the **last** `setData` payload has 1 feature named `Nippur`.

I traced why it is genuinely effective rather than trusting the report. On mount, `setData` is already called once with all 2 features (style loaded at that point). With the old guard restored, the post-mount filter changes are dropped, so `mock.calls` still ends at the **mount** call — `toHaveBeenCalled()` would still pass, but `expect(lastData.features).toHaveLength(1)` fails against 2. The test therefore fails under the mutant through the payload assertion, exactly as reported.

The companion test _"does not update a source that has not been added yet"_ (`deferMapLoad()` + `getSource → undefined`) asserts `setData` is never called. It passes in **both** states, so it is real safety coverage, not a mirror of the first test. Prior safety coverage was preserved, not traded away.

## 15. Initial-Load Race

`useFindspotMap.ts:118-119` assigns `latestProvenancesRef.current = provenances` on every render; `handleLoad` (`:135-141`) reads that ref and guards `if (loadedProvenances)`. A filter typed before the style loads is therefore used for the initial source. Explicitly tested (_"uses the active filter when the style loads after filtering"_). The Codex P2 race stays closed.

## 16. Coordinate Invariant

`pointCoordinates.ts:14-22` — single exported rule:

```
typeof value === 'number' ∧ Number.isFinite(value) ∧ |longitude| ≤ 180 ∧ |latitude| ≤ 90
```

One implementation (`isWithinRange` + `isValidPointCoordinate`). No duplicate range logic anywhere.

## 17. Coordinate Consumer Matrix

| Consumer                                                     | Uses canonical rule?                       | Can an invalid value reach MapLibre? |
| ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------ |
| GeoJSON point                                                | ✅ `toFindspotLocation`                    | No                                   |
| GeoJSON polygon centroid                                     | ✅ same gate, applied to the derived point | No                                   |
| `LngLatBounds.extend` (`mapBounds.ts:16`)                    | ✅ `getFeaturePointCoordinates`            | No                                   |
| `Popup.setLngLat` (`useFindspotMap.ts:79`)                   | ✅ `getFeaturePointCoordinates`            | No                                   |
| `easeTo({center})` on cluster click (`useFindspotMap.ts:62`) | Indirect                                   | **No** — see below                   |

The cluster path takes `cluster.geometry.coordinates` from `queryRenderedFeatures`. That geometry is generated by supercluster from our own already-validated source points and reconstructed against **canonical** tile coordinates, so latitude cannot leave ±90. MapLibre's `LngLat` constructor range-checks latitude only (longitude wraps freely), so there is no throw path. Structurally indirect, materially safe.

## 18. GeoJSON Conversion

`provenanceToGeoJson.ts` — `getRenderableProvenanceGeometry` (master) first drops non-finite lat/lng and polygons with <3 valid vertices; `toFindspotLocation` then applies the range rule; invalid entries become `null` and are filtered out. `[longitude, latitude]` ordering correct (`:62`). Feature `id` and `properties.id` both use `provenance.id`, not the display name.

## 19. Polygon Handling

Vertex arithmetic mean, unchanged, deliberately not redesigned. The question asked was only whether a polygon-derived point can become invalid and still reach MapLibre — it cannot: the centroid passes through `isValidPointCoordinate`, tested with a polygon whose vertices average to latitude 130 (→ 0 features). Popup wording remains the honest "Approximate area location".

## 20. Map Bounds

`fitMapToData` extends only validated points and calls `fitBounds` only when `!bounds.isEmpty()`. No `Infinity`/`NaN` bounds possible. Fit happens once at initialization; filtering deliberately does not re-fit (asserted).

## 21. Map Initialization

Single `useEffect` with deps `[containerRef, isReady, onMapBackgroundError]`. `containerRef` is stable, `isReady` flips once (null → non-null, never back — `filterProvenances` returns `null` only when `provenances` is `null`), and `handleMapBackgroundError` is a `useCallback([])`. The map is created exactly once per mount. A basemap error re-render does **not** recreate the map.

## 22. Map Teardown

Cleanup: `isActive = false` → 6 × `map.off(...)` with the **same** handler references as the 6 `map.on(...)` → `map.remove()` → `mapRef.current = null`. Counted directly: 6 / 6. Asserted on unmount.

I probed one theoretical leak: if `error` became truthy while the map was mounted, MapTab would return early and unmount the container without the effect re-running. It is unreachable — a promise settles once, so `provenances !== null` implies the fetch never rejected.

## 23. Async Lifecycle / Cluster Expansion

`expandCluster` captures `isActive`; both `.then(easeToClusterCenter)` and `.catch(() => easeToClusterCenter())` route through `if (isActive())`. No `easeTo` on a disposed map. Four tests cover unmount-before-resolve, unmount-before-reject, stale generation after effect re-run, and missing source.

## 24. Source / Layers

`initializeFindspotSource` runs only inside `handleLoad`, which fires once: one `addSource`, three `addLayer` (asserted: exactly 3, ids in order). Source updates go through `setData` and never re-add layers. IDs `ebl-findspots`, `ebl-clusters`, `ebl-cluster-count`, `ebl-unclustered-points` are namespaced and declared once in `mapLayers.ts`.

## 25. Popup Architecture

`getFeaturePointCoordinates` → `getPopupProperties` (runtime validation) → `createFindspotPopup` (DOM build) → `new maplibregl.Popup().setLngLat().setDOMContent().addTo(map)`. Coordinates computed once and passed in.

## 26. Popup XSS

Zero occurrences of `setHTML`, `innerHTML`, `insertAdjacentHTML`, `dangerouslySetInnerHTML` in `src/map` production code. Construction is `document.createElement` / `textContent` / `setAttribute` only. `MapTab.interactions.test.tsx` additionally asserts `mockSetHTML` was **never** called, which locks the regression shut. Both XSS tests still present, and every popup source file is byte-identical to the version I audited in the previous round.

## 27. Popup Property Validation

`findspotPopupProperties.ts:15-30` validates each field read back off the MapLibre feature: `name`/`abbreviation` must be strings, `parent` string-or-absent, `geometryType` narrowed by a type guard; otherwise `null` and no popup. No unsafe cast justified by "we produced this GeoJSON ourselves".

## 28. Search URL Construction

Exactly one builder — `mapLinks.ts:4`, `` `/library/search?${stringify({ site: provenanceName })}` ``. Scheme and path are literal constants, so `javascript:` and origin control are unreachable by construction. `query-string@7` strict `stringify` percent-encodes `& = # ? /` and non-ASCII. Confirmed the fragment-search contract is still `site=<longName>`: `SearchFormProvenance` uses `site.longName` as the option **value**, `SearchForm` binds `controlId="site"`, and `fragmentariumRoutes` parses the query into `FragmentQuery.site`.

## 29. Accessible Link Navigation

`FindspotResults.tsx:35` uses `<Link to={buildFragmentSearchLink(...)}>` from `react-router-dom` v6.30.4 — SPA navigation, no full reload. The popup keeps a raw `<a>` because it is built outside React and handed to MapLibre. Both call the **same** builder; no second implementation exists. Encoding survives `Link`: an existing test asserts `href === buildFragmentSearchLink('No Geometry')` → `/library/search?site=No%20Geometry`.

## 30. URL Injection / Delimiter Safety

`mapLinks.test.ts` now round-trips `'A & B = C # D?'` through `new URL(...)` and asserts `searchParams.get('site')` equals the original **and** that `site` is the only key. That is the right contract expression — it proves no extra parameter or fragment can be forged.

## 31. Style URL Security

`mapBackgroundError.ts:16-26` — `new URL(value)` inside `try/catch`, then `hostname.toLowerCase() === MAP_STYLE_HOST && pathname === MAP_STYLE_PATH`. Exact equality on both; no substring matching. `MAP_STYLE_URL` is derived from the same two constants, so drift is impossible. Regression tests cover `basemaps.cartocdn.com.evil.example`, `style.json.evil`, relative URLs, unparseable URLs, sprite, glyph, tile, layer, non-object and null events. CodeQL passes on the final SHA.

**Protocol:** still host+path only, so `http://basemaps.cartocdn.com/gl/positron-gl-style/style.json` would classify as trusted. Impact is limited to which warning banner shows; the loaded `MAP_STYLE_URL` is HTTPS. Remains LOW, unchanged.

## 32. Basemap Error Classification

`isSourceOrLayerScoped` excludes anything carrying `sourceId`, `layer.id` or `tile` before any URL work, so tile/source/layer failures never disable the map. Only the structured `error.url` is inspected — arbitrary error **text** cannot spoof the style URL. Malformed URLs are caught. Malformed events return `false` rather than throwing.

## 33. External Resource / Privacy Review

I fetched the style document read-only. Its only source is `type: "vector"`; sprite, glyphs and tiles all resolve to `tiles.basemaps.cartocdn.com`. No API key, no token, no provenance name, no search term and no eBL user state appears in any external URL. `Referrer-Policy: strict-origin-when-cross-origin` limits cross-origin leakage to the origin. Default attribution control is not disabled, so CARTO/OSM attribution is preserved.

## 34. CSP Analysis

`public/serve.json` ships into `build/` and is served by `serve -s build` (Dockerfile), so it is live in production.

| Resource            | Mechanism                                                                  | Directive                         | Allowed? |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------- | -------- |
| style JSON          | fetch/XHR                                                                  | `connect-src 'self' https:`       | ✅       |
| vector tiles        | worker fetch                                                               | `connect-src https:`              | ✅       |
| glyph `.pbf`        | worker fetch                                                               | `connect-src https:`              | ✅       |
| sprite JSON         | fetch                                                                      | `connect-src https:`              | ✅       |
| sprite imagery      | `getImage` → `makeRequest` arrayBuffer → `createImageBitmap` / `blob:` URL | `connect-src` + `img-src … blob:` | ✅       |
| worker              | `URL.createObjectURL(new Blob(...))`                                       | `worker-src 'self' blob:`         | ✅       |
| MapLibre inline CSS | —                                                                          | `style-src 'unsafe-inline'`       | ✅       |

The one path that would need `img-src <cdn-host>` is `getImageUsingHtmlImage` (`image_request.ts:209`, `img.src = remoteUrl`), gated on `supportImageRefresh === false` — used only by raster and raster-DEM sources. `load_sprite.ts:46` calls `getImage` with two arguments, so `supportImageRefresh` defaults to `true`; and the style has no raster source. That path is unreachable here. **No CSP change required, and none was made.**

## 35. Development-Server Caveat

Earlier browser verification in this PR used `yarn start`, which does **not** apply `public/serve.json` headers. The static chain above is decisive on directive coverage, but a single load of a `serve`-hosted production build would convert proof-by-analysis into proof-by-observation. Recommended, not blocking.

## 36. Accessibility / Fallback Equivalence

`<nav aria-label="Findspot fragment searches">` with real keyboard-focusable `<a>` elements; map container has `role="region"`, `aria-label` and `aria-describedby` pointing at a real description paragraph; nav icons are `aria-hidden`. The list survives basemap failure (asserted), includes geometry-less provenances (asserted), and respects filtering. MapLibre's `NavigationControl` is added and is keyboard operable, so the pointer-only limitation is specifically **findspot inspection**, not the whole map.

## 37. Empty / Loading / Error States

| State                | Behaviour                                | Preserved? |
| -------------------- | ---------------------------------------- | ---------- |
| loading              | `<Spinner>Loading map data...</Spinner>` | ✅         |
| fetch error          | `Alert variant="danger"`                 | ✅         |
| backend returns `[]` | "No findspot locations are available."   | ✅         |
| filter matches none  | `No findspots match “…”.`                | ✅         |
| basemap failure      | warning alert; list still usable         | ✅         |

The early return changed from `!provenances` to `!filteredProvenances`. These are exactly equivalent: `filterProvenances` returns `null` **only** when `provenances` is `null`, and an empty array is truthy — so "not loaded yet" and "loaded but empty" remain distinct, which is what the empty-state copy depends on.

## 38. MapTab Refactor / Qlty

| Module                | Responsibility                   | Lines | Cohesive? |
| --------------------- | -------------------------------- | ----: | --------- |
| `MapTab.tsx`          | shell: state, map wiring, layout |    77 | ✅        |
| `useProvenances.ts`   | fetch + unmount-safe state       |    40 | ✅        |
| `findspotFilter.ts`   | filter rule + empty-state copy   |    21 | ✅        |
| `FindspotResults.tsx` | empty-state alert + link list    |    43 | ✅        |

This is responsibility extraction, not metric gaming: no suppression, no rename, no 300-line replacement monolith. The `MapTab` function now contains exactly **3** `return` statements (error, loading, main) in 77 lines, against a qlty default threshold of 6; the JSX has **zero** ternaries. DOM output is byte-identical to the pre-refactor version — the two conditionals moved _into_ the children, which is why no state disappeared.

## 39. Tools Test Mock Architecture

- **Mapping defined in:** 1 file (`Tools.contentMocks.testSupport.tsx`, `TOOLS_CONTENT_MOCKS`)
- **Registered in:** **1 file** (`Tools.testSupport.tsx`) — was 3. Verified by `grep -rl "jest.mock('signs/ui/search/Signs'"` → exactly one path.
- The duplicated `router/compat` history stub also collapsed 3 → 1.

The DRY hard gate is genuinely satisfied, not waived.

## 40. Jest Hoisting Analysis

I did not accept the remediation's explanation. I compiled `Tools.testSupport.tsx` with Babel + `babel-plugin-jest-hoist` and read the output:

```
  3  _getJestObj().mock('router/compat', …)
  9  _getJestObj().mock('signs/ui/search/Signs', …)
 …
 19  _getJestObj().mock('map/MapTab', …)
 …
 31  var _Tools = _interopRequireDefault(require("router/Tools"));
```

All 12 registrations are emitted **above** `require("router/Tools")`. `mockToolsContent` is a function declaration (runtime-hoisted) and the factories are lazy, so there is no TDZ hazard.

I then traced every import that could precede `Tools.testSupport` in the three suites: `@testing-library/*`, `auth/Session` (→ `Folio`, JSON), `router/Tools.contentMocks.testSupport` (→ React only), `router/toolsConfig` (→ `auth/Session`, `common/ui/Breadcrumbs`, `realia/ui/realiaIcon` — a bare string constant), `test-support/matchMedia`. **None reaches `router/Tools`, `router/toolsContent`, or any of the 11 mocked pages.** Real tool pages cannot load before registration.

## 41. MapLibre Mock Quality

`mockMapInstance` is a module-level singleton and `rememberHandler` overwrites by `event:layer` key, so a duplicated `map.on` registration or a leaked second map instance would be invisible to the tests. Production code is correct on direct inspection (§21, §22, §24), so this stays LOW — but it means test coverage is not evidence for those specific properties.

## 42. CSS Isolation

Every rule in `MapTab.sass` nests under `.map-tab`, including `.maplibregl-popup-content a`. That scoping still works after the refactor because MapLibre appends popups to `map.getContainer()` — the `.map-tab__container` div, a descendant of `.map-tab`. No `!important`, no bare element selectors, no global MapLibre overrides anywhere in `src`. Component extraction introduced no wrapper elements, so no selector was invalidated.

## 43. Test Architecture — Static Review

| Scenario                                      | Covered? | Quality                                            |
| --------------------------------------------- | -------- | -------------------------------------------------- |
| load success                                  | ✅       | good                                               |
| API error                                     | ✅       | good                                               |
| empty data                                    | ✅       | distinguishes no-data from no-match                |
| filter no match                               | ✅       | good                                               |
| filter update while `isStyleLoaded === false` | ✅       | **strong** (mutation-effective)                    |
| source absent before init                     | ✅       | strong (true safety assertion)                     |
| pre-load latest filter                        | ✅       | good                                               |
| invalid lon/lat                               | ✅       | 12 parameterised cases + 4 boundaries              |
| polygon invalid derived point                 | ✅       | good                                               |
| cluster click                                 | ✅       | good                                               |
| cluster rejection                             | ✅       | strong — `unhandledRejection` recorder + behaviour |
| popup XSS                                     | ✅       | strong — 2 suites, plus `setHTML` never-called     |
| URL delimiters                                | ✅       | strong — round-trip parse                          |
| style lookalike host / path                   | ✅       | strong — literal attack strings                    |
| basemap failure fallback                      | ✅       | good                                               |
| unmount fetch success/rejection               | ✅       | parameterised                                      |
| map teardown                                  | ✅       | on/off/remove asserted                             |
| accessible list `Link`                        | ✅       | href asserted incl. encoding                       |
| geometry-less list entry                      | ✅       | explicit                                           |
| Tools mocking                                 | ✅       | guard + behavioural                                |

## 44. File-Length Audit

Measured directly on the final tree; **0 of 44 `.ts/.tsx` files exceed 250 lines.** Top of the list:

| File                                   | Lines | Pass? |
| -------------------------------------- | ----: | ----: |
| `src/map/useFindspotMap.test.tsx`      |   235 |    ✅ |
| `src/map/MapTab.interactions.test.tsx` |   227 |    ✅ |
| `src/router/toolsRoutes.entities.tsx`  |   214 |    ✅ |
| `src/map/MapTab.test.tsx`              |   196 |    ✅ |
| `src/map/useFindspotMap.ts`            |   179 |    ✅ |
| `src/map/testSupport/mapLibreMock.ts`  |   156 |    ✅ |
| `src/router/Tools.tsx`                 |   138 |    ✅ |
| `src/map/MapTab.filtering.test.tsx`    |   128 |    ✅ |
| `src/router/Tools.routes.test.tsx`     |   106 |    ✅ |
| `src/router/Tools.testSupport.tsx`     |    96 |    ✅ |
| `src/map/MapTab.tsx`                   |    77 |    ✅ |
| `src/map/FindspotResults.tsx`          |    43 |    ✅ |
| `src/map/useProvenances.ts`            |    40 |    ✅ |
| `src/map/pointCoordinates.ts`          |    36 |    ✅ |
| _(all remaining ≤ 128)_                |       |    ✅ |

## 45. Type / Suppression Audit

Scanning **added** lines of the PR diff for `as any`, `: any`, `<any>`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `istanbul ignore`, `TODO`, `FIXME`, `HACK`, `console.`, `debugger`, `.only(`, `.skip(`, `xit(`, `xdescribe(` → **zero hits**. Zero added code comments. Zero added relative imports. `unknown` appears only in type guards (`isWithinRange`, `isGeometryType`) and test casts. `new any: 0 · new type suppressions: 0 · new lint suppressions: 0`.

## 46. Package / Config Scope

`package.json` adds exactly one narrowly anchored mapper `^maplibre-gl/dist/maplibre-gl\.css$` → `identity-obj-proxy`, plus that devDependency. `transformIgnorePatterns` untouched, so no node_modules CSS behaviour changes beyond that one file. `maplibre-gl@^5.24.0` and `identity-obj-proxy@^3.0.0` descriptors both already exist in **current master's** `yarn.lock`, so `--frozen-lockfile` is satisfied without a lockfile change. `craco.config.js` and `yarn.lock` are **not** in the PR.

## 47. Accessibility PR-Description Status

Fetched live from the API at review time. The body is still verbatim the original three sentences and contains no mention of accessibility, pointer-only interaction, or the link list. The requesting reviewer made this an explicit acceptance condition in two consecutive reviews (2026-07-28, 2026-08-11) and confirmed the code side is fine. **Still outstanding.**

## 48. CI / Qlty / Security Check Evidence

| Check                | SHA        | Status         | Final candidate? |
| -------------------- | ---------- | -------------- | ---------------- |
| test                 | `85cca955` | ✅ success     | ✅ yes           |
| CodeQL               | `85cca955` | ✅ success     | ✅ yes           |
| Analyze (javascript) | `85cca955` | ✅ success     | ✅ yes           |
| GitGuardian ×3       | `85cca955` | ✅ success     | ✅ yes           |
| **qlty check**       | `85cca955` | ✅ **success** | ✅ yes           |
| qlty coverage        | `85cca955` | ✅ success     | ✅ yes           |
| qlty coverage diff   | `85cca955` | ✅ success     | ✅ yes           |
| docker / docker-test | `85cca955` | skipped        | —                |

Combined commit status: **success**. Because `85cca955` **is** the PR head, this CI evidence validates the exact tree that will merge — unlike previous rounds.

## 49. Historical Findings Matrix

| Finding                           | Status         | Root fixed? | Evidence                                                        |
| --------------------------------- | -------------- | ----------: | --------------------------------------------------------------- |
| MapLibre CSS Jest failure         | Closed         |          ✅ | anchored `moduleNameMapper` in `package.json`                   |
| `virtual: true`                   | Closed         |          ✅ | zero occurrences repo-wide                                      |
| Manual MapLibre mock              | Closed         |          ✅ | `src/__mocks__/maplibre-gl.ts`                                  |
| File-size violations              | Closed         |          ✅ | 0 of 44 over 250                                                |
| Coverage gaps                     | Closed         |          ✅ | `qlty coverage` + `coverage diff` success on final SHA          |
| Basemap error handling            | Closed         |          ✅ | structured `error.url` + scoping                                |
| Mouse/pointer accessibility       | Closed (code)  |          ✅ | `<nav>` + `<Link>` fallback                                     |
| State-after-unmount               | Closed         |          ✅ | `ignore` on both branches, both tested                          |
| Duplicated `makeProvenance`       | Closed         |          ✅ | single `testFixtures/provenance.ts`                             |
| Duplicated coordinate parsing     | Closed         |          ✅ | single `pointCoordinates.ts`                                    |
| Helper → hook inversion           | Closed         |          ✅ | hook → pure helpers only                                        |
| Cursor exception swallowing       | Closed         |          ✅ | `if (canvas?.style)` guard                                      |
| Relative imports                  | Closed         |          ✅ | zero added                                                      |
| Misleading polygon language       | Closed         |          ✅ | "Approximate area location"                                     |
| Global popup CSS                  | Closed         |          ✅ | scoped under `.map-tab`                                         |
| Route mock import-order fragility | Closed         |          ✅ | **proved from Babel output** (§40)                              |
| Branch/master currency            | Open (trivial) |           — | 1 behind: 3 font binaries                                       |
| TypeScript hard gate              | Closed         |          ✅ | `test` check green; branch carries the `realiaOptionLoader` fix |
| Cluster catch dead code           | Closed         |          ✅ | pans to cluster centre; behaviour asserted                      |
| Tools mock duplication            | Closed         |          ✅ | 1 mapping / 1 registration                                      |
| Empty-state message               | Closed         |          ✅ | `getEmptyStateMessage` + test                                   |
| Style URL drift                   | Closed         |          ✅ | `MAP_STYLE_URL` derived                                         |
| Manual re-export boilerplate      | Closed         |          ✅ | `export *`                                                      |
| Weak rejection test               | Closed         |          ✅ | `unhandledRejection` recorder                                   |
| Non-null assertion                | Closed         |          ✅ | explicit guard in `handleLoad`                                  |
| Geometry-less list behaviour      | Closed         |          ✅ | deliberate + tested                                             |
| CodeQL style-URL                  | Closed         |          ✅ | CodeQL success on final SHA                                     |
| **C1 dropped source updates**     | Closed         |          ✅ | §13–14, mutation-effective test                                 |
| **M1 coordinate ranges**          | Closed         |          ✅ | §16–17, 16 cases                                                |
| **C3 Qlty complexity/returns**    | Closed         |          ✅ | `qlty check` success on `85cca955`                              |
| **M3 SPA list navigation**        | Closed         |          ✅ | `<Link>` + href-encoding assertion                              |
| **CSP production compatibility**  | Closed         |          ✅ | §34 static chain                                                |

## 50. New Independent Findings

Ignoring all history, I re-read the implementation hunting for fresh defects. Probed and found **safe**: list/map divergence (only the intended geometry subset); crash-by-provenance (all coordinate paths gated; string feature ids are valid GeoJSON); popup navigation hijack (literal path + strict encoding); post-teardown execution (`isActive`, nulled ref, `ignore`); error-text spoofing (structured `url` only); tests silently importing real Tools pages (compiled-output proof); route staleness (master delta is fonts); full-page reload from the list (`<Link>`); branch-only config creep (`craco.config.js` excluded).

Two theoretical paths I chased and closed rather than reported: an `error`-set-while-mounted teardown gap (unreachable — a promise settles once), and a wrapped-longitude popup rejection introduced by the new range check (unreachable — `queryRenderedFeatures` reconstructs geometry against canonical tile coordinates, so longitude stays within ±180).

Only §51's LOW items emerged as genuinely new.

## 51. Findings

### BLOCKER

None.

### HIGH

None.

### MEDIUM

#### `[MEDIUM] PR description still lacks the required accessibility statement`

- **Location:** GitHub PR #750 body
- **Classification:** documentation / stated acceptance condition
- **Evidence:** live API fetch — body is the original three sentences, no mention of accessibility, pointer-only interaction or the link list
- **PR requirement affected:** reviewer acceptance condition F11 → F18
- **Expected:** one sentence naming the _Findspot searches_ list as the keyboard/screen-reader equivalent
- **Actual:** absent after three review rounds
- **Concrete scenario:** a future maintainer reads the PR, assumes full keyboard map interaction was delivered, and removes the list as redundant
- **Test coverage:** N/A (documentation)
- **Introduced by PR or pre-existing:** by PR
- **Merge blocking:** No for code; the requesting reviewer conditioned approval on it
- **Recommended direction:** append the sentence below, wording the limitation as _findspot inspection_, since `NavigationControl` is keyboard operable
- **Pasteable PR comment:**
  > Please append to the PR description: "Findspot inspection on the interactive map is pointer-driven in this MVP. The **Findspot searches** list below the map provides the keyboard- and screen-reader-accessible equivalent, linking to the same fragment searches exposed through map popups. (MapLibre's navigation controls are keyboard operable; the pointer-only limitation is specific to opening findspot popups.)"

#### `[MEDIUM] Five stale bot threads remain unresolved on the final SHA`

- **Location:** PR #750 review threads — qlty ×1 (`src/map/MapTab.tsx`), Codex ×3 (`src/map/MapTab.tsx`), CodeQL ×1 (`src/map/mapBackgroundError.ts`)
- **Classification:** review hygiene / repo rule
- **Evidence:** the qlty thread has `created_at == updated_at == 2026-06-16T13:03:50Z` and `original_commit_id = c1ed38fb` — the PR's first commit. GitHub re-anchored its `commit_id` to `85cca955` and its line from 186 → 76, but it was never re-posted. Meanwhile `qlty check` reports **success** on `85cca955`, and `MapTab` now has 3 returns in 77 lines. Same pattern for the three Codex threads (`c1ed38fb`) and the CodeQL thread (`8ff9af79`).
- **PR requirement affected:** `.github/copilot-instructions.md` — "resolve all findings … including those raised by automated review bots"; review-status tracking
- **Expected:** threads resolved once their root causes are fixed
- **Actual:** they render as open findings against the current head
- **Concrete scenario:** a reviewer opens the PR, sees "Function with many returns (count = 13): MapTab" attributed to the current head, and requests changes for an already-fixed defect
- **Test coverage:** N/A
- **Introduced by PR or pre-existing:** by PR (process)
- **Merge blocking:** No
- **Recommended direction:** resolve the five threads, noting the fixing commit for each
- **Pasteable PR comment:**
  > The qlty / Codex / CodeQL inline threads are stale — all were created on `c1ed38fb`/`8ff9af79` and only re-anchored to the current head by GitHub (`created_at == updated_at`). `qlty check`, CodeQL and `test` are all green on `85cca955`, and `MapTab` is now 77 lines with 3 returns. Could you resolve these five threads so the remaining feedback is readable?

### LOW

1. **Branch 1 commit behind `origin/master`** (`cccacb0e`, #789) — three Assurbanipal font binaries, zero overlap. Merge before landing so the green checks describe the merge result exactly, but there is no correctness risk.
2. **`isStyleUrl` ignores protocol** (`mapBackgroundError.ts:16`) — `http://basemaps.cartocdn.com/gl/positron-gl-style/style.json` would classify as trusted. Affects only which warning banner shows; the loaded URL is HTTPS. Unchanged, correctly left out of scope.
3. **`expectToolsContentPagesMocked` overstates its name** (`Tools.contentMocks.testSupport.tsx:80`) — it asserts every _listed_ mock resolves, not that every tools content page is mocked. Adding a 12th tool page without adding it to `TOOLS_CONTENT_MOCKS` would slip past this guard (the behavioural tests would likely catch it). Now that registration is single-site, the original failure mode is structurally gone.
4. **MapLibre mock blind spots** — singleton map instance and handler-map overwriting mean a leaked second map or duplicate `map.on` would be invisible. Production code verified correct by inspection instead.
5. **Popup not held in a ref** — a popup open for a feature the filter has just removed stays on screen until the next map click (MapLibre's default `closeOnClick` dismisses it then). Transient UX only; the link it carries remains valid. Also: coincident findspots remain popup-reachable one at a time, and the polygon marker is a vertex mean — both previously accepted MVP limitations, both honestly labelled in the UI.

## 52. Positive Findings

The security-critical modules (`useFindspotMap.ts`, `createFindspotPopup.ts`, `mapBackgroundError.ts`, `mapLinks.ts`, `mapLayers.ts`, `mapCursor.ts`, `findspotPopupProperties.ts`, `mapLibreMock.ts`) are byte-identical to the versions audited last round — the refactor did not disturb them. The C1 fix is the right fix: it removes an over-strict guard rather than layering a retry or a state machine on top, and the regression test genuinely fails under the mutant. The coordinate invariant is expressed once and consumed by every path that can reach MapLibre. The Tools mock deduplication is the rare case of a DRY fix that is also provably safe under Jest hoisting. And the qlty resolution is confirmed by the tool itself on the exact merge candidate, not estimated.

## 53. Scope Audit

| Change                           | Necessary?                                                                                                                                                                       | Scope creep?           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `useProvenances`                 | ✅ C3 extraction                                                                                                                                                                 | No                     |
| `FindspotResults`                | ✅ C3 + M3                                                                                                                                                                       | No                     |
| `findspotFilter`                 | ✅ C3 extraction                                                                                                                                                                 | No                     |
| `pointCoordinates` range rule    | ✅ M1                                                                                                                                                                            | No                     |
| `useMapSourceData` guard removal | ✅ C1                                                                                                                                                                            | No                     |
| Tools test support consolidation | ✅ M2 / DRY hard gate                                                                                                                                                            | No                     |
| `<Link>` in list                 | ✅ M3                                                                                                                                                                            | No                     |
| `package.json` mapper + devDep   | ✅ MapLibre CSS under Jest                                                                                                                                                       | No                     |
| Master merge files               | ✅ integration                                                                                                                                                                   | No                     |
| `realiaOptionLoader.ts`          | ⚠️ unrelated to the map, but explicitly mandated by the reviewer (F16) under the repo's "fix pre-existing issues in the same task" rule; current master still carries the defect | Justified              |
| `craco.config.js`                | —                                                                                                                                                                                | **Correctly excluded** |

## 54. Reviewer Handoff

1. **Blocking issues:** none in code.
2. **Non-blocking:** PR-description sentence; five stale threads; optionally merge the 1 master commit; five LOW items.
3. **Files to inspect first:** [useMapSourceData.ts:14](src/map/useMapSourceData.ts#L14), [pointCoordinates.ts:14-22](src/map/pointCoordinates.ts#L14-L22), [MapTab.tsx](src/map/MapTab.tsx), [Tools.testSupport.tsx:23-50](src/router/Tools.testSupport.tsx#L23-L50), [MapTab.filtering.test.tsx](src/map/MapTab.filtering.test.tsx).
4. **Map synchronization:** fixed; no drop path survives after source initialization.
5. **Coordinate safety:** one rule; every MapLibre path gated; cluster centres derive from validated data.
6. **Popup security:** zero HTML sinks; DOM-only; regression-locked.
7. **Lifecycle:** 6/6 on-off, `remove()`, ref nulled, async guards, no use-after-remove.
8. **Basemap/CSP:** structural URL validation; CSP compatible by static proof; one production-served smoke recommended.
9. **Accessibility:** code complete; description sentence outstanding.
10. **Qlty/hard gates:** `qlty check` green on the final SHA; 0 files > 250; no suppressions.
11. **Tools test architecture:** 1 mapping, 1 registration, hoisting proved from compiled output.
12. **Scope:** clean; the one unrelated file was reviewer-mandated.
13. **Pasteable comments:** in §51.

## 55. Final Verdict

**READY AFTER MINOR CORRECTIONS**

No BLOCKER or HIGH finding survives. Every correctness, security, lifecycle and hard-gate criterion is met and independently verified against the exact SHA CI evaluated. The two MEDIUM items are documentation and review hygiene: the accessibility sentence the requesting reviewer conditioned approval on, and five stale bot threads that misrepresent the current head. Neither affects the merged behaviour of `/tools/map`.

## 56. Verification Checklist

- [x] Candidate tree unambiguous — committed and pushed at `85cca955`
- [x] CI/Qlty/CodeQL correspond to the exact PR head
- [x] Master `4f048a21` integrated; only 3 unrelated font files missing
- [x] `/tools/map` route correct, lazy-loading preserved
- [x] Provenance API contract unchanged
- [x] Filter updates cannot be silently dropped (C1)
- [x] Initial-load latest-data race safe
- [x] All MapLibre coordinate paths enforce valid ranges (M1)
- [x] Malformed provenance cannot crash bounds/popups/source
- [x] Backend strings cannot become HTML
- [x] Search URLs safely encoded and same-origin
- [x] Accessible list uses SPA navigation (M3)
- [x] Popup and list share one URL builder
- [x] Style URL validation exact and structural
- [x] No security-bot bypass
- [x] Map teardown complete; no async use-after-remove
- [x] Basemap failure preserves text navigation
- [x] CSP compatible by static evidence
- [x] MapTab qlty findings gone (`qlty check` success)
- [x] Tools mock DRY genuinely resolved; hoisting proved
- [x] All changed `.ts/.tsx` ≤ 250 lines
- [x] No unsafe type/suppression/comment/debug additions
- [x] No unrelated config changes (`craco.config.js` excluded)
- [ ] Accessibility statement present in PR description
- [ ] Stale bot threads resolved
- [ ] Final master commit merged (optional, unrelated)

---

_Investigation only. No production source, test, style, snapshot, package, configuration or Git state was modified; no tests, lint, type-check, build or Qlty runs were performed. Reviewed at `origin/map-mvp` `85cca955` against `origin/master` `cccacb0e`._
