# Multi-site frontend handoff

Branch `final-map`, frontend only. Records what was verified, what shipped, and
what is blocked. Nothing blocked is described as a completed user feature.

## Backend verification — blocked

The reported multi-site backend could **not be verified from this workspace**.

| Check                                                                 | Result                                                                                                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `/workspaces/ebl-api` present                                         | **No.** The backend repository is not in this workspace.                                                                           |
| Multi-site archive (`*.tar.gz`, `.map-processing/backend-artifacts/`) | **Absent.** Neither exists.                                                                                                        |
| Production API `GET /findspots/map-data?site=ASSUR`                   | **404 Not Found.** The route does not exist in production, while `GET /findspots` on the same host returns 200 with 4 031 records. |
| Configured dev API (`REACT_APP_DICTIONARY_API_URL`)                   | Connection refused — no backend is running on it. Its value was not printed.                                                       |
| OpenAPI documentation                                                 | Not reachable.                                                                                                                     |

Because the live API contradicts the documented contract and no manifest,
checksum or inventory artifact is present, the following stages stopped at their
stop conditions:

- **Stage 2** — locate and validate backend transfer artifacts.
- **Stage 3** — canonical migration for Kalḫu and Nippur.
- **Stage 4** — enabling `mapDataSiteParam` for `URUK`, `KALHU`, `NIPPUR`.
- **Stage 5** — `scriptPeriod`, `scriptPeriodModifier`, `genre` map-data filters.
- **Stage 6** — the `findspotIds=1,2,3` multi-findspot fragment query.

No production code was written against an unverified parameter name, and no
backend response was simulated. `src/map/mapSites.ts` is unchanged: `assur`
keeps `mapDataSiteParam: 'ASSUR'` and the other three keep `null`, which the
capability model already reports as `not-configured` rather than as an error.

## Canonical asset state — verified from the committed assets

`public/map-data/findspots/all.geojson`, 294 features, 0 duplicate ids, all
`Polygon`:

| Site   | Polygons | Id form                                                   | Matches expected inventory        |
| ------ | -------- | --------------------------------------------------------- | --------------------------------- |
| Aššur  | 134      | canonical, checksum-suffixed (`assur-bb6i-3d76dc1e02af`)  | Yes (134)                         |
| Uruk   | 128      | canonical, checksum-suffixed (`uruk-dc-xiv-2-dafba03c06`) | Yes (128)                         |
| Kalḫu  | 12       | **legacy positional ordinal** (`kalhu-1`)                 | Count yes (12); ids not canonical |
| Nippur | 20       | **legacy positional ordinal** (`nippur-1`)                | Count yes (20); ids not canonical |

Polygon counts already match the expected inventory for all four sites, and
Aššur and Uruk are already migrated to canonical checksum ids.

**Kalḫu and Nippur were not migrated.** Canonical ids must come from backend
inventory artifacts, and those artifacts are absent. Deriving them in the
frontend would mean a manually typed id table or an order-based join — both
prohibited. Geometry was not touched.

The mapping counts (ASSUR 317, URUK 131, KALHU 8, NIPPUR 20) and the referenced
polygon count (ASSUR 133) are **not assertable** from any tracked frontend
artifact and were not verified.

## Required files, if the archive arrives

```
.map-processing/backend-artifacts/manifest.json          # sha256 per artifact, source revision, CRS
.map-processing/backend-artifacts/inventory-assur.json   # 134 canonical ids
.map-processing/backend-artifacts/inventory-uruk.json    # 128 canonical ids
.map-processing/backend-artifacts/inventory-kalhu.json   #  12 canonical ids
.map-processing/backend-artifacts/inventory-nippur.json  #  20 canonical ids
.map-processing/backend-artifacts/mappings-<site>.json   # findspotId → canonical polygon id
```

Then run `python3 scripts/maps/build-findspot-map-assets.py`, which already
performs the exact one-to-one join, validates before writing, writes to a
temporary file and replaces atomically. Run it twice and compare checksums.

## What shipped

| Stage                  | Status                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 7 Spatial search       | **Shipped** — viewport, drawn rectangle and selected excavation area, intersecting canonical polygon geometry. No new dependency.            |
| 8 Comparison           | **Partly shipped** — cross-fade, solo, explicit left/right labels, keyboard slider, URL persistence. Split-screen swipe deferred; see below. |
| 9 Publication timeline | **Shipped** — year range, undated inclusion, reset, URL persistence.                                                                         |
| 10 Export              | **Shipped** — GeoJSON, CSV, share link. Image export withheld on rights and canvas grounds.                                                  |
| 11 Measurement         | **Shipped** — geodesic distance and area, metric/imperial, clear.                                                                            |
| 12 Terrain             | **Shipped** — AWS Open Data terrain-tiles, all gates passed.                                                                                 |
| 13–15 3D models        | **Not shipped** — no approved asset exists.                                                                                                  |
| 16 Unified tool UI     | **Shipped** — progressive disclosure, unsupported tools hidden.                                                                              |

### Spatial search

`spatialPredicates.ts` implements bounding-box rejection, even–odd ray casting
and segment intersection; `spatialSearch.ts` runs a bounds pre-filter and then a
true ring intersection against canonical polygon geometry — never proximity,
never feature order.

Matched polygons yield mapped findspot ids through the existing polygon
summaries, and the panel links **individual** findspots through the verified
`buildFindspotFragmentSearchLink`. No aggregate multi-findspot action is
offered, because the `findspotIds` parameter and its limit are unverified. The
panel states that fragments are associated with an excavation area, not an exact
findspot coordinate.

### Timeline

`overlayPublicationDates.ts` classifies each overlay label as `exact-year`,
`year-range`, `approximate`, `unknown` or `invalid`. The catalogue contains
labels `2323` and `2747`, derived by the generator from source filenames such as
`kalhu-rn2323-201`, where `rn2323` is a record number. These are **not**
publication years, are classified `invalid`, and are never plotted. Of 36
overlays, 28 carry a `dateLabel` and 2 of those are unusable.

### Export

GeoJSON carries geometry, canonical identity, mapped findspot ids and counts,
accessible fragment counts, location precision, match method, active filters,
visualization mode, timestamp, share URL and `EPSG:4326`. CSV carries the same
per row, with spreadsheet-formula prefixes neutralised. No unrestricted totals
are included.

**Image export is not offered.** Every one of the 36 overlays still carries
"Publication rights pending confirmation", and MapLibre is not created with
`preserveDrawingBuffer`, so a canvas capture would be empty. The panel explains
both. CORS is not bypassed.

### Deferred

Split-screen swipe. MapLibre 5.24 raster layers have no screen-space clipping,
so it needs a second synchronised WebGL map, which cannot be verified in this
headless environment.

## Validation

The **full repository suite was not run to completion** — the operator asked for
it to be stopped. Before it was stopped, 107 suites had run: 106 passed and 1
failed, `AnnotationsView.integration.test.ts`, on an order-dependent Bootstrap
`useId` counter (`Header-8` vs `Header-7`) in a snapshot. It is unrelated to map
work, reproduced identically in two independent runs, and touches no changed
file.

The map suite passes in full. See the final report for the remaining gates.

## Research-experience layer

Site-level research summaries are keyed by **provenance id** and resolved
through the same exact normalized-name association described above
(`provenanceSiteMatch`). A provenance that resolves to no mapped site gets no
summary at all rather than a zeroed row. Nothing in the research layer uses
fuzzy matching, and label matching is never a fallback for a canonical polygon
id. See **`docs/map-research-experience.md`**, including the list of backend
fields (`source`, `sourceRevision`) that remain unavailable and are therefore
not rendered anywhere.
