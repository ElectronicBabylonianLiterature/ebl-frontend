# Map frontend advanced phase — handoff

Branch `final-map`, frontend only. This records what shipped, what is blocked
and why, and the exact backend contracts the next phase needs. Nothing blocked
or hidden is described as a completed user feature.

## Baseline hardening (Stage 1)

| Item                                                           | Status                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Stale `mapLayers` paint assertions                             | **Fixed.** Production `case` expressions were correct; the tests were stale. |
| `findspotCanonicalAssets.test.ts` requiring `.map-processing/` | **Fixed.** Replaced by two self-contained suites.                            |
| Files over 250 lines created by the previous phase             | **Fixed.** `MapInspector.test.tsx` (258) split in two.                       |
| `docs/map-ui-redesign.md`                                      | **Written.**                                                                 |

### mapLayers resolution

The two failing assertions expected scalars (`circle-stroke-width === 2`,
`circle-color === '#0077be'`) where production uses `case` expressions to
express selected-state highlighting. The production design was correct, so the
assertions were replaced rather than the code.

Assertions were **not** weakened to "is defined". `test-support/mapExpressionEvaluator`
evaluates the MapLibre expression subset in use (`case`, `step`, `interpolate`,
`coalesce`, `boolean`, `feature-state`, `get`, `has`, comparison and arithmetic
operators), so each test asserts the _rendered value_ for a given feature state —
unmapped, mapped-zero, mapped-with-fragments, hovered and selected. The
evaluator throws on an unsupported operator rather than silently returning a
wrong value, and has its own test suite.

`mapLayers.ts` is now a barrel over `mapLayerIds`, `mapSiteLayers`,
`mapExcavationLayers`, `mapHistoricalLayers` and `mapPaintExpressions`.

### Canonical asset test resolution

Split into two suites, neither of which touches `.map-processing/`:

1. **`findspotAssetIntegrity.test.ts`** — validates the committed
   `public/map-data/` assets directly: per-site counts against `catalog.json`,
   polygon geometry, `id === properties.id`, id uniqueness, site tagging,
   `locationType`, canonical checksum-suffixed Aššur ids with no legacy
   ordinals, unique source names, and that `all.geojson` is the exact verbatim
   union of the per-site collections. Always runs in CI.
2. **`findspotGeneratorContract.test.ts`** — drives
   `scripts/maps/build-findspot-map-assets.py` against **synthetic** fixtures in
   `src/test-support/map-generator-fixtures/` (2 Aššur polygons, 1 per other
   site, 2 inventory rows, 2 mapping rows). Covers canonicalization,
   determinism, non-Aššur preservation, and six failure modes that must leave
   output byte-identical.

To make the second possible, the generator gained an optional `--expectations`
JSON argument. **The defaults are unchanged** (134 inventory / 317 mapping / 133
mapped polygons / per-site counts), so the production invocation keeps exactly
the guarantees it had. No real backend mapping state is fabricated anywhere: the
synthetic fixtures use findspot ids 9001–9002 and obviously-fake checksums.

The optional cross-repository verification against the real artifacts stays
outside Jest:

```
python3 scripts/maps/build-findspot-map-assets.py   # uses the real defaults
```

Run it only where `.map-processing/backend-artifacts/` is present.

## Stage 2 — choropleth and true density

**Implemented.** Four modes, persisted as `viz=` in the `v=1` URL schema:

| Mode               | Value                           | Notes                                          |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| `mapped` (default) | categorical                     | unmapped / mapped-zero / mapped-with-fragments |
| `count`            | `accessibleFragmentCount`       | quantile classes                               |
| `log`              | `accessibleFragmentCount`       | geometric classes                              |
| `density`          | `accessibleFragmentCount ÷ km²` | only offered when a real area exists           |

### Threshold method

Thresholds are derived per render from the current caller-authorized values, and
nothing is hardcoded to Aššur.

- **Quantile breaks** for `count` and `density`. Quantiles keep classes
  populated under sparse and skewed data, so a single extreme outlier cannot
  collapse every other polygon into one class (tested).
- **Geometric breaks** for `log`, spanning the smallest to largest positive
  value.
- Breaks are rounded, deduplicated and clamped inside the observed range, and
  the class count is reduced when there are fewer distinct values than colours.
- No positive values → no scale at all, and the legend says so rather than
  drawing empty classes. All-zero, single-polygon and repeated-value inputs are
  covered by tests.

### Density correctness

Density uses a real geodesic area, not a bounding box. `geodesicArea.ts`
implements the standard spherical-excess (Chamberlain–Duquette) ring formula on
a sphere of radius 6 371 008.8 m, subtracts interior rings, and sums
multi-polygon parts. It is validated against the analytic area of a one-degree
equatorial band, checked for latitude dependence and winding-order invariance,
and returns **null** — never 0 — for a point, line, empty ring, degenerate ring,
non-numeric coordinates or a geometry collection.

Density is therefore suppressed for invalid geometry, zero-area geometry,
polygons absent from the index, and any site without map data. The mode itself
disappears from the control unless at least one polygon yields a positive
density, and `useMapVisualization` falls back to `mapped` if a URL requests
`density` when none is available.

The label is explicit — _Accessible fragments per square kilometre_ — and the
control states that this describes association with a mapped excavation area,
not the density of exact findspot points. Raw counts are never called density.

### Dependency decision

**No dependency was added.** `package.json` contains no Turf, geodesic or
scale package. `@turf/area` was considered and rejected: the single formula
needed is ~40 lines, is exactly testable against a closed-form analytic result,
and avoids adding a runtime dependency plus its `@turf/helpers` and
`@turf/meta` transitive graph to the map chunk.

### Non-colour encoding

The visualization never relies on colour alone. Outline **width** carries the
choropleth class index, unmapped polygons keep a **dashed** outline while mapped
ones are solid, and fill opacity separates unmapped from classified. Selection
and hover take precedence over every data state, in that order (tested).

Switching mode calls `setPaintProperty` on the existing layers — sources and
layers are reused, never recreated (tested).

## Stages 3–8, 10–13 — not implemented

No scaffolding was added for any of these; unused scaffolding is worse than its
absence.

| Stage                          | Status                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 3 Comparison / swipe           | Not started. No blocker — ordinary unstarted work.                                                          |
| 4 Overlay publication timeline | Not started. `dateLabel` exists on overlays and is parseable, so this is unblocked work.                    |
| 5 Export (GeoJSON/CSV/image)   | Not started. Image export additionally needs the rights audit in the table below.                           |
| 6 Measurement                  | Not started. `geodesicArea.ts` now provides the area primitive it would need.                               |
| 7 Spatial search               | Not started. `excavationPolygonIndex` bounds provide the primitive it would need.                           |
| 8 Data-quality mode            | **Blocked** — see below.                                                                                    |
| 10 Unified tool UI             | Partially applies; the visualization control was integrated into the existing surfaces without a new panel. |
| 11 Accessibility               | Reviewed in code; **not verified in a browser**.                                                            |
| 12 Performance                 | Safeguards in place; **not measured**.                                                                      |
| 13 Browser verification        | **Not performed.**                                                                                          |

## Blockers

### Data-quality mode (Stage 8.2) — blocked on authorization

`src/auth/Session.ts` exposes `isAllowedToReadWords`, `…WriteWords`,
`…ReadFragments`, `…TransliterateFragments`, `…LemmatizeFragments`,
`…AnnotateFragments`, `…ReadBibliography`, `…WriteBibliography`, `…ReadTexts`,
`…WriteTexts`, `…CreateProperNouns`, `…ReadFolio`, `…ReadRealia`,
`hasBetaAccess` and `isGuestSession`.

There is **no curator or admin scope**. `hasBetaAccess` is a feature flag, not
an authorization boundary, and using it as one would be wrong. `NODE_ENV` was
not used. The route and control therefore do not exist.

The diagnostic primitives that already exist and are tested:
`sanitizeFindspotMapDataResponseWithDiagnostics` (exact duplicates, conflicting
duplicates), `buildExcavationPolygonIndex` (canonical-id/feature-id mismatch,
duplicate ids, malformed rows), and `findspotAssetIntegrity.test.ts`
(GeoJSON/catalog consistency).

### Terrain (Stage 9.1) — blocked on assets

No `raster-dem` source, `setTerrain` call, hillshade layer or DEM URL exists
anywhere in tracked frontend configuration or assets. No DEM provider or token
was introduced. `hasTerrain` stays `false` and no control is rendered.

### 3D models (Stage 9.2) — blocked on assets

No `.glb` or `.gltf` file exists under `public/` or `src/`, and
`public/map-data/catalog.json` has only `sites`, `rasterOverlays` and
`unresolvedSourceReferences` — no model catalog, anchor coordinate, altitude,
rotation, scale or rights field. No Three.js or equivalent was added.
`has3dModels` stays `false` and no control is rendered.

### Image export (Stage 5.3) — audit result

Historical overlay tiles are same-origin (`/historical-maps/…`), so canvas
tainting is unlikely, but MapLibre is **not** currently created with
`preserveDrawingBuffer: true`, so `canvas.toDataURL()` would return an empty
image. Enabling it carries a continuous rendering cost on every frame. Separately,
overlay attributions in `historicalOverlays.generated.ts` read
"Publication rights pending confirmation", so redistribution rights for the
raster imagery are **not** established. Image export was therefore not built.

## Site support matrix

| Site   | Polygons | Overlays | Fragment map data         |
| ------ | -------- | -------- | ------------------------- |
| Aššur  | 134      | 10       | configured (`site=ASSUR`) |
| Kalḫu  | 12       | 6        | not configured            |
| Nippur | 20       | 11       | not configured            |
| Uruk   | 128      | 9        | not configured            |

Counts verified against the committed assets by `findspotAssetIntegrity.test.ts`.
The 317/133/29 Aššur figures are **not** asserted anywhere and are not available
from tracked frontend artifacts.

## Validation status

| Gate                             | Result                                               |
| -------------------------------- | ---------------------------------------------------- |
| `yarn lint` (ESLint + Stylelint) | passes, exit 0                                       |
| `npx tsc --noEmit`               | passes, exit 0                                       |
| Map-scoped tests (42 suites)     | 530 passed, 0 failed                                 |
| `yarn build:ci-stable`           | see final report                                     |
| Full suite                       | **not run** — the operator stopped it                |
| Qlty                             | **not run** — binary not installed in this container |
| New/changed file line limit      | no file over 250 lines                               |

Residual coverage below 100% on changed modules: `useMapSiteData` (90.6% stmts,
64.3% branches), `useMapUrlState` (97.4%), `provenanceToGeoJson` (90%), and
single residual branches in `mapUrlState`, `mapCamera`, `mapInteractions`,
`mapOverlayLifecycle`, `mapSiteCapabilities`, `mapPaintExpressions`,
`useMapCamera` and `useFindspotMap`. `mapLayers.ts` (barrel) and
`mapSelection.ts` (types only) contain no executable statements.

## Backend contracts required for the next phase

1. `GET /findspots/map-data?site=<SITE>` for `KALHU`, `NIPPUR` and `URUK` in the
   existing `FindspotMapDataDto` shape with caller-authorized
   `accessibleFragmentCount`. Then set `mapDataSiteParam` in `src/map/mapSites.ts`.
2. Backend-owned canonical polygon inventories and explicit curated crosswalks
   for Kalḫu, Nippur and Uruk. Kalḫu and Nippur still carry positional ordinal
   ids (`kalhu-1`) which are unstable across regeneration.
3. A stable `siteId` on the provenance DTO, so the normalized-name association
   in `provenanceSiteMatch.ts` can be deleted.
4. Map-data filters or authorized per-dimension count buckets for script,
   language, period and genre. See `docs/map-filter-frontend-contract.md`.
5. A validated multi-findspot or spatial-search endpoint for large result sets.
6. A reliable curator/admin scope on `Session` for the data-quality mode.
7. Approved raster DEM source metadata: URL template, tile size, max zoom,
   encoding, attribution and rights clearance.
8. An approved georeferenced 3D model catalog: asset URL, anchor coordinate,
   altitude, rotation, scale, attribution and rights.
9. Explicit export-rights metadata per historical overlay, replacing the current
   "Publication rights pending confirmation" attribution text.
