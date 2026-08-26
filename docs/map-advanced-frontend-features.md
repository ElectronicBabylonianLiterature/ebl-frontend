# Map advanced frontend features — implementation status

Frontend-only. This is an honest status record: what ships, what is gated off,
and what was not attempted. Nothing listed as "not implemented" has hidden
scaffolding pretending otherwise.

## Implemented

### Test architecture

- `src/__mocks__/maplibre-gl.ts` is the single canonical MapLibre manual mock.
  Because it sits inside a Jest `root`, it is applied **automatically** to every
  suite — no `jest.mock('maplibre-gl', …)` call exists anywhere, and no test can
  accidentally initialise WebGL. It records sources, layers, feature state,
  listeners, camera and canvas, and exposes `lastMapMock()`,
  `createdMapMocks()`, `setClusterExpansionZoom()` and `resetMapLibreMock()` for
  per-suite isolation.
- `craco.config.js` maps `^maplibre-gl/dist/maplibre-gl\.css$` to
  `identity-obj-proxy` via `jest.configure`, prepended to CRA's existing
  `moduleNameMapper`. `node_modules` is **not** broadly transformed.
- The two `jest.mock(..., { virtual: true })` calls for modules that really
  exist were removed.

### Map lifecycle decomposition

`useFindspotMap.ts` went from 605 lines to a ~165-line coordinator that creates
the map, registers listeners, and delegates to focused modules:
`mapCamera`, `mapGeometry`, `mapSourceLifecycle`, `mapOverlayLifecycle`,
`mapFeatureState`, `mapInteractions`, `mapErrorClassification`.

### Shared geometry

`mapGeometry.ts` is the one side-effect-free source of centroids, coordinate
extraction and bounding boxes. It replaced duplicate centroid logic in
`provenanceToGeoJson.ts`, duplicate bounds-walking in `useFindspotMap.ts`, and
ad-hoc camera fitting in `MapTab.tsx`. `mapCamera.ts` is the one place that
turns geometry into MapLibre camera calls.

### Dead code removal

`createFindspotPopup` and `createExcavationAreaPopup` (and their tests) had no
production call sites after the inspector redesign and were deleted, along with
the `.maplibregl-popup-content` Sass rule — the only map style that leaked
document-wide once the lazy chunk loaded. The inspector is now the single
rendering path for feature detail.

### Narrow basemap error classification

`mapErrorClassification.ts` distinguishes style, tile, sprite, glyph and source
failures using the MapLibre `resourceType`, then the event shape, then the URL.
Only a confirmed failure of the configured style document raises "map background
unavailable"; the map stays usable when a tile, sprite, glyph or unrelated fetch
fails. Generic "failed to fetch" is explicitly **not** treated as fatal.

### Async unmount safety

Every asynchronous effect in `useMapSiteData` (provenances, excavation polygon
index, map data) uses the project's `isMounted` flag pattern. No fake
`AbortController` was added around Bluebird requests that cannot be aborted.

### Multi-site capability model

See `docs/map-multi-site-frontend-readiness.md`. `fetchAssurMapData()` became
`fetchMapData(siteId)`; `mapSites.ts` declares which sites have a confirmed
endpoint; `mapSiteCapabilities.ts` derives a typed capability record per site
and drives every UI gate.

### URL-persisted, shareable state

See `docs/map-state-contract.md`. Versioned (`v=1`), validated, clamped,
deterministic, length-protected; debounced replace for camera, push for
meaningful changes, back/forward restoration, and a "Copy map link" action with
accessible success and failure states.

### Keyboard-accessible exploration

The inspector provides the semantic alternative to pointer-only MapLibre
interaction: a list of `<button>` site cards with `aria-pressed`, headings,
real `<a>` findspot links to `/library/search?findspotId=…`, a "Back to explore"
control, and global Escape to clear selection. Keyboard traversal of arbitrary
rendered polygons was deliberately not attempted.

### Choropleth and true density (Stage 2)

Four visualization modes — categorical mapped status, absolute accessible
count, log-scaled count, and true area-normalized density — persisted as `viz=`
in the `v=1` URL schema. Thresholds are derived per render from the current
caller-authorized values using quantile breaks (geometric for log mode), so
nothing is hardcoded to Aššur and a single outlier cannot collapse the classes.

Density divides the authorized count by a real geodesic polygon area computed
by `geodesicArea.ts` (spherical excess, holes subtracted, multi-polygon summed),
validated against the analytic area of a one-degree equatorial band. It returns
null — never zero — for degenerate geometry, so the density mode is hidden
entirely unless a positive area exists. It is labelled _Accessible fragments per
square kilometre_ and states that it describes association with a mapped
excavation area, not exact findspot-point density.

The visualization never relies on colour alone: outline width carries the class
index and unmapped polygons stay dashed. Mode changes repaint existing layers
via `setPaintProperty`; sources and layers are never recreated.

### Self-contained asset and generator tests

`findspotCanonicalAssets.test.ts` previously failed at import time because it
required the gitignored `.map-processing/backend-artifacts/`. It is replaced by
`findspotAssetIntegrity.test.ts` (validates the committed assets directly) and
`findspotGeneratorContract.test.ts` (drives the generator with tracked synthetic
fixtures). See `docs/map-frontend-advanced-phase-handoff.md`.

## Gated off — capability exists, feature does not

| Capability                   | Value                                         | Why                                                                                               |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `supportsMapFragmentFilters` | false                                         | map-data returns one undifferentiated count; see `docs/map-filter-frontend-contract.md`           |
| density mode                 | hidden unless a positive geodesic area exists | suppressed for invalid, zero-area and unmapped geometry                                           |
| `hasTerrain`                 | false                                         | no approved raster DEM is configured or committed; no DEM provider or token was introduced        |
| `has3dModels`                | false                                         | no GLB/GLTF asset, anchor coordinate, scale, rotation or rights metadata exists in the repository |
| `hasSiteBoundary`            | false                                         | every committed feature is `locationType: "excavation_area"`; no site-boundary geometry exists    |

No control is rendered for any of these.

## Not implemented in this pass

Historical-map swipe comparison, chronological timeline, GeoJSON/CSV/image
export, distance and area measurement, spatial search, and curator data-quality
mode were **not built**. No scaffolding for
them was added, because unused scaffolding that is never imported or exercised
is worse than its absence.

Two of these have a hard blocker recorded rather than a scheduling one:

- **Image export.** MapLibre is not created with `preserveDrawingBuffer`, so
  `toDataURL()` would yield an empty image, and overlay attributions still read
  "Publication rights pending confirmation", so redistribution rights are not
  established.
- **Curator data-quality mode.** No reliable curator role or scope was found in
  the frontend session model, so neither the route nor the control exists. The
  reusable diagnostic primitives that _do_ exist — duplicate and conflict
  detection in `sanitizeFindspotMapDataResponseWithDiagnostics`, and canonical-ID
  validation in `excavationPolygonIndex.ts` — are already exercised by tests.

The remaining items are ordinary unstarted work, not blocked work.

## Performance

Measured facts only:

- The map route remains lazily loaded (`React.lazy` in
  `src/router/toolsContent.tsx`); nothing in this change eagerly imports it.
- Hover and selection use MapLibre **feature state**, not source re-writes.
- `useMapCamera` listens to `moveend` only, so raw mouse movement causes no
  React update.
- Camera→URL writes are debounced at 400 ms and use `replace`.
- Map data is fetched once per mount for configured sites only — there is no
  request per polygon and no refetch on selection-only changes.
- `fetchExcavationPolygonIndex()` adds one 142 KB request for
  `/map-data/findspots/all.geojson`, the same URL MapLibre requests for the
  excavation-areas source, so it is normally an HTTP cache hit.

Bundle-size deltas, map initialisation time and choropleth update time were
**not measured**, and no figure for them is claimed.

## Dependencies

No dependency was added. `identity-obj-proxy` was already present;
`query-string`, `bluebird`, `react-router-dom` and `maplibre-gl` (5.24.0) were
already in use.

## Superseded by the research-experience layer

`viz=evidence`, the evidence feature-state encoding, the one-model contextual
legend, the tabbed inspector and presentation mode were added after this
document was written. See **`docs/map-research-experience.md`**. The export,
measurement, spatial-search, comparison, timeline and terrain behaviour
described above is unchanged — the research-summary action deliberately reuses
the existing export panel rather than duplicating any export code.
