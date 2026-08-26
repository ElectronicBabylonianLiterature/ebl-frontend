# Map filter frontend contract (script, language, period, genre)

Status: **not implemented.** No filter UI exists in the map, because the current
map-data response cannot support one honestly. This document records the audit
that led to that decision and the exact backend contract required.

## Capability audit

Classification of each requested filter against what the frontend can do today.

| Filter        | Map counts | Fragment results                                   | Classification                        |
| ------------- | ---------- | -------------------------------------------------- | ------------------------------------- |
| Script        | no         | yes — `SearchForm` already supports a script query | `AVAILABLE_FOR_FRAGMENT_RESULTS_ONLY` |
| Language      | no         | yes                                                | `AVAILABLE_FOR_FRAGMENT_RESULTS_ONLY` |
| Period / date | no         | yes                                                | `AVAILABLE_FOR_FRAGMENT_RESULTS_ONLY` |
| Genre         | no         | yes                                                | `AVAILABLE_FOR_FRAGMENT_RESULTS_ONLY` |

None is `AVAILABLE_FOR_MAP_COUNTS`.

## Why no filter affects map counts

`FindspotMapDataDto` (`src/map/findspotMapData.ts`) carries exactly:

```
findspotId, siteId, siteName, polygonIds, accessibleFragmentCount,
locationPrecision, matchMethod, sector, area, building, room
```

`accessibleFragmentCount` is a **single pre-aggregated scalar** with no
dimensional breakdown. There is no per-script, per-language, per-period or
per-genre count, and no fragment identifiers to re-aggregate from.

Client-side filtering of that scalar is therefore impossible without inventing
numbers. Per the data-integrity rules, the frontend does not client-filter an
aggregate count without dimensional data, so `supportsMapFragmentFilters` is
`false` for every site in `mapSiteCapabilities.ts`, and no map filter panel is
rendered.

## Existing honest drill-down

The one filter path that is real today is per-findspot drill-down:
`buildFindspotFragmentSearchLink(findspotId)` produces
`/library/search?findspotId=<id>`, rendered in the excavation-area inspector.
Users reach fragment-level results — with the full fragment-search filter set —
from a selected polygon. Nothing in that path is fabricated.

## Required backend contract

To enable map-count filtering, `/findspots/map-data` must either

**(a) accept filter parameters and return filtered counts:**

```
GET /findspots/map-data?site=ASSUR&script=NA&language=akk&genre=...&periodFrom=...&periodTo=...
→ { "findspots": [ { …, "accessibleFragmentCount": <count under these filters> } ] }
```

The count must remain caller-authorized under every filter combination.

**or (b) return dimensional counts the frontend can aggregate:**

```
{ "findspots": [ {
    …,
    "accessibleFragmentCounts": {
      "byScript":   { "<scriptId>": <count>, … },
      "byLanguage": { "<languageId>": <count>, … },
      "byGenre":    { "<genreId>": <count>, … },
      "byPeriod":   { "<periodId>": <count>, … }
    }
} ] }
```

Option (b) permits instant client-side re-aggregation with no request per filter
change, but the buckets must be caller-authorized and must not leak the
existence of restricted fragments through bucket presence.

Whichever is chosen, the vocabularies (`scriptId`, `languageId`, `genreId`,
`periodId`) must match those already used by fragment search so the map filter
state can be forwarded into the findspot drill-down URL unchanged.

## Frontend work once the contract lands

1. Flip `supportsMapFragmentFilters` in `deriveMapSiteCapabilities` to derive
   from the presence of the new response fields.
2. Add a typed filter state module with multi-value support, URL persistence
   (additive keys under `v=1`; see `docs/map-state-contract.md`), active-filter
   chips, clear-one and clear-all.
3. Forward the active filters into `buildFindspotFragmentSearchLink`.
4. Gate the filter panel on `supportsMapFragmentFilters` so unsupported sites
   never show a filter that cannot work.
