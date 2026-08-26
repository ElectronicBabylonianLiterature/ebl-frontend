# Multi-site frontend readiness (Aššur, Kalḫu, Nippur, Uruk)

Frontend-only. This document records what the frontend can prove from its own
assets and API responses, and exactly what the backend must provide to activate
each remaining site. Nothing here is inferred from data the frontend cannot see.

## Verified frontend data by site

Counted directly from the committed assets in `public/map-data/`.

| Site              | Canonical polygons | Geometry | Polygon ID format         | Historical overlays | Static association rows |
| ----------------- | ------------------ | -------- | ------------------------- | ------------------- | ----------------------- |
| Aššur (`assur`)   | 134                | Polygon  | `assur-<name>-<checksum>` | 10                  | 347                     |
| Kalḫu (`kalhu`)   | 12                 | Polygon  | `kalhu-<n>` (ordinal)     | 6                   | 25                      |
| Nippur (`nippur`) | 20                 | Polygon  | `nippur-<n>` (ordinal)    | 11                  | 39                      |
| Uruk (`uruk`)     | 128                | Polygon  | `uruk-<name>-<checksum>`  | 9                   | 181                     |

`public/map-data/findspots/all.geojson` holds all 294 features. Every feature
carries `id`, `siteId`, `siteName`, `name`, `locationType: "excavation_area"`;
Aššur, Kalḫu and Nippur additionally carry `sourceId`. Every feature's top-level
`id` equals `properties.id`, which is what
`excavationPolygonIndex.ts` requires before a polygon enters the index.

`public/map-data/catalog.json` records `unresolvedSourceReferences`, which is
empty for Aššur, Kalḫu and Nippur, and contains one entry (`LS220@Taf37`) for
Uruk.

### Baseline figures that could not be verified here

The task brief cites 317 mapped findspots, 133 linked excavation polygons and 29
unresolved findspots for Aššur. **Only the 134 canonical polygon count is
verifiable from frontend assets.** The other three figures derive from
`/findspots/map-data` responses and from
`.map-processing/backend-artifacts/`, which is gitignored and absent from this
working tree. They are therefore neither confirmed nor contradicted here, and
none of them is hardcoded anywhere in UI behaviour.

## Polygon identity

Aššur and Uruk use content-addressed canonical IDs (`<site>-<slug>-<checksum>`).
Kalḫu and Nippur still use ordinal IDs (`kalhu-1`, `nippur-1`, …). Ordinal IDs
are **positional**, so they are not stable across regeneration. Before fragment
linking is enabled for Kalḫu or Nippur, their polygon IDs should be regenerated
in the canonical checksum form, exactly as was done for Aššur and Uruk.

The frontend never falls back from a canonical polygon ID to a label, and never
uses array position as identity.

## Static association files are not fragment records

`public/map-data/associations/*.json` are ODS-derived and **must not** be read
as fragment records. Inspection shows:

- the first row of each file is the spreadsheet header ingested as data
  (`area: "_id"`, `sector: "area"`, `building: "sector"`);
- the `area` / `sector` / `building` fields are assigned positionally, and the
  column order differs per site — Aššur's `sourceValues` begin
  `[_id, area, sector, site, map, …]` while Kalḫu's begin
  `[_id, site, sector, area, building, "", map, …]`, so the same field name
  means different things in different files;
- no row carries a `findspotId`, a fragment count, or any authorization signal;
- `mapId` is `null` in the sampled rows.

Consequently these files are **not loaded by any production module**. They
remain in the repository as provenance for the asset build only.

## Live API capability

`ApiFindspotRepository.fetchMapData(siteParam)` issues
`GET /findspots/map-data?site=<siteParam>` and passes the response through
`sanitizeFindspotMapDataResponse`. The request is generic; the _decision to
issue it_ is not.

`src/map/mapSites.ts` is the single place that declares which sites have a
confirmed map-data endpoint:

| Site     | `mapDataSiteParam` | Requested at runtime |
| -------- | ------------------ | -------------------- |
| `assur`  | `"ASSUR"`          | yes                  |
| `kalhu`  | `null`             | no                   |
| `nippur` | `null`             | no                   |
| `uruk`   | `null`             | no                   |

Sites with `null` are never requested. `FindspotService.fetchMapData` rejects
with `UnsupportedMapDataSiteError` if called for such a site, so an unconfigured
site can never be silently rendered as an empty result.

## Capability model

`deriveMapSiteCapabilities` (`src/map/mapSiteCapabilities.ts`) is a pure
function over: the compiled overlay catalogue, the runtime-loaded excavation
polygon index, and the map-data response plus its status. It reports:

| Field                                              | Derived from                                          | Current value                                                          |
| -------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `hasCoordinates`                                   | polygons in the index with a computable bounding box  | true for all four sites                                                |
| `hasSiteBoundary`                                  | presence of a site-boundary feature                   | false everywhere — no such feature exists in the assets                |
| `hasExcavationPolygons` / `excavationPolygonCount` | the polygon index                                     | true for all four sites                                                |
| `hasHistoricalMaps` / `historicalMapCount`         | `validatedHistoricalMapOverlays`                      | true for all four sites                                                |
| `hasFragmentMapData`                               | a loaded, non-empty map-data response                 | Aššur only, and only at runtime                                        |
| `supportsMapFragmentFilters`                       | map-data response dimensions                          | **false everywhere** — see below                                       |
| density visualization                              | positive geodesic polygon area from `geodesicArea.ts` | available wherever map data exists; suppressed for degenerate geometry |
| `hasTerrain`                                       | approved DEM configuration                            | false — no approved DEM exists                                         |
| `has3dModels`                                      | approved model catalogue                              | false — no approved models exist                                       |

`fragmentDataState` distinguishes six states, so "unsupported" is never rendered
as zero: `not-configured`, `idle`, `loading`, `available`, `empty`, `error`.

## Provenance ↔ map-site association

The provenance API does not expose a canonical map site id. `provenanceSiteMatch.ts`
therefore associates a `ProvenanceRecord` with a mapped site by **exact
normalized-name equality** (NFD, diacritics stripped, trimmed, lowercased), which
maps `Aššur → assur`, `Kalḫu → kalhu`, `Nippur → nippur`, `Uruk → uruk`.

This is a display-level association only. It is never used to resolve findspot,
polygon or fragment identity. It is not substring or fuzzy matching.

**Backend dependency:** add a canonical `siteId` to the provenance DTO so this
name comparison can be deleted.

## What the backend must provide to activate a site

For each of Kalḫu, Nippur and Uruk:

1. Serve `GET /findspots/map-data?site=<SITE>` returning
   `{ "findspots": [ … ] }` where each entry matches the existing
   `FindspotMapDataDto`:
   `findspotId` (integer), `siteId`, `siteName`, `polygonIds` (non-empty, unique,
   matching the canonical GeoJSON IDs), `accessibleFragmentCount` (caller-authorized,
   non-negative), `locationPrecision: "excavation-area"`,
   `matchMethod: "curated" | "verified-source"`, and nullable
   `sector`/`area`/`building`/`room`.
2. Guarantee `accessibleFragmentCount` reflects the **calling user's**
   authorization. The frontend never infers authorization.
3. For Kalḫu and Nippur, regenerate canonical checksum polygon IDs first.
4. Then set `mapDataSiteParam` for that site in `src/map/mapSites.ts`. No other
   frontend change is required.

## Runtime asset dependency

`fetchExcavationPolygonIndex()` fetches `/map-data/findspots/all.geojson` (142 KB)
once per mount to build the polygon index used by the capability model and by
polygon→site resolution. MapLibre already requests the same URL for the
excavation-areas source, so the browser HTTP cache normally serves the second
request.
