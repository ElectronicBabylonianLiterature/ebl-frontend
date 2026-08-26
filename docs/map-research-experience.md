# Map research experience

The evidence-first layer of the eBL interactive map: how strong the spatial
evidence behind a polygon is, what a researcher can inspect, and how to
reproduce an exact view. Everything here is derived from data the frontend
already fetches — no new endpoint, no new asset, no new dependency.

## Research-summary model

`src/map/mapResearchSummary.ts` is the single pure derivation. Everything that
shows counts, badges, hover text or copied Markdown reads from it.

```ts
type MappingEvidence = 'verified-source' | 'curated' | 'mixed' | 'unmapped'

interface PolygonResearchSummary {
  polygonId
  siteId
  siteName
  displayName
  mappedFindspotCount
  accessibleFragmentCount
  findspots
  mappingEvidence
  locationPrecision
  areaSquareKm
}

interface SiteResearchSummary {
  siteId
  siteName
  totalPolygonCount
  linkedPolygonCount
  mappedFindspotCount
  accessibleFragmentCount
  historicalOverlayCount
}
```

Evidence is derived from the distinct `matchMethod` values of the findspots
linked to a polygon: one method → that method; several → `mixed`; none →
`unmapped`. `unmapped` means _no linked findspot_. It is never inferred from a
missing or unrecognised method, because `findspotMapData` already rejects a row
whose method is neither `curated` nor `verified-source`.

`useMapResearch` memoizes both derivations; `mapSiteSummaries` keys site
summaries by **provenance id**, because that is the id markers, selection and
the URL all speak. A provenance that resolves to no mapped site gets no entry
at all rather than a zeroed row reading "0 of 0 linked".

### Evidence fields available

From `/findspots/map-data` (see `findspotMapData.ts`):

| Field                                | Values                                 |
| ------------------------------------ | -------------------------------------- |
| `matchMethod`                        | `verified-source`, `curated`           |
| `locationPrecision`                  | `excavation-area` (single value today) |
| `sector`, `area`, `building`, `room` | optional strings, often `null`         |
| `accessibleFragmentCount`            | authorization-aware integer            |

From `/map-data/findspots/all.geojson`: `id`, `siteId`, `siteName`, `name`,
`locationType`, `sourceId`, plus geometry and its geodesic area.

### Evidence fields **not** available — blocked

`source` and `sourceRevision` are **not exposed** by the map-data response.
They are therefore:

- absent from `PolygonResearchSummary`;
- absent from the Evidence tab;
- absent from the copied research summary.

The Evidence tab instead carries one non-intrusive line —
"Detailed mapping provenance is not exposed by the current map-data response."
— rather than repeating "Source unavailable" per row. The canonical asset's
numeric `sourceId` is deliberately **not** rendered: it is an internal key, not
a citable provenance, and showing it would look like a citation that is not one.

Backend fields that would enrich the inspector later, in priority order:
`source` (human-readable name), `sourceRevision`, a per-findspot confidence or
date of mapping, and a polygon↔historical-sheet relation (see "Maps" below).

## Visual design system

### Excavation polygons

`mapExcavationPaint.ts` holds one discriminated union — `categorical`,
`evidence`, `choropleth` — so the initial layer definition, the in-place
repaint and the legend all read the same value.

Evidence mode (`mapEvidencePaint.ts`) encodes the state as an **ordered numeric
feature state** `evidenceCode` (0 unmapped, 1 verified-source, 2 curated,
3 mixed) so a `step` expression classes it without a per-feature filter.

| State                  | Fill                 | Opacity | Outline                                  |
| ---------------------- | -------------------- | ------- | ---------------------------------------- |
| Unmapped               | `#7b7f73` neutral    | 0.07    | dashed `[2, 1.5]`, muted                 |
| Verified source        | `#b3702a` clay       | 0.30    | solid, `#7f4f20`                         |
| Curated                | `#3f6f8f` slate      | 0.30    | solid, `#2c516b`                         |
| Mixed                  | `#6f5f9c`            | 0.30    | dash-dot `[3, 1.2, 1, 1.2]`, `#4b3f74`   |
| Mapped, zero fragments | evidence colour kept | 0.16    | evidence outline kept                    |
| Hovered                | —                    | 0.34    | width 2.4                                |
| Selected               | `#b35c1e`            | 0.40    | width 3.5 + white blurred halo (width 7) |

Curated is given an equally saturated, equally present colour: it differs from
verified-source in **where the link came from**, not in how much it is worth.
The visualization panel says so in one sentence.

Colour is never the only cue: line width, dash pattern, fill opacity, outline
contrast and the selection halo all carry state, and every state is named in
words in the legend and in the inspector badges.

Fills stay at or below 0.40 opacity so a historical raster underneath stays
legible; the selected halo is white and blurred so it survives a dark scanned
sheet and hillshaded terrain.

### Site markers and clusters

`mapSiteLayers.ts`, driven by `siteMarkerState` feature state:

- **Clusters** — deep-ink core `#26465f` with a parchment ring `#f7f3ea`,
  radius stepped 16 → 20 → 24 → 29 and stroke 3 → 4 by count; the count is
  haloed high-contrast text. Expansion on click is unchanged.
- **Markers** — colour by the strongest evidence the site carries: coordinates
  only `#5b6b7a`, excavation polygons `#2f6f8f`, live fragment-linked map data
  `#b36b24`. Radius 6.5 → 8 when the site has polygons. A site with historical
  overlays gets a heavier white collar (3 vs 2).
- **Selection** adds a ring — radius 11, stroke 5, fill `#8a3d10` — rather than
  replacing the marker's identity, so the fill still says what evidence exists.

Only states the data supports are represented. No category is invented.

## Evidence mode

New visualization mode, URL value `viz=evidence`, carried by the existing
versioned map-state system (`mapUrlState.ts`, `v=1`). It is categorical:
`buildChoroplethScale` returns `null` for it, exactly as for `mapped`.

`count`, `log` and `density` keep their formulas untouched. What changed there
is presentation only: selection/hover opacity raised (0.36 → 0.40, 0.30 → 0.32),
unmapped fill lowered (0.08 → 0.07) so overlays read through, outline opacity
raised (0.80 → 0.85), and the selected halo widened (6 → 7, with blur).

## Completeness summary

The site inspector shows four figures, from `SiteResearchSummary`:

```
133 of 134   Excavation polygons linked
317          Mapped findspots
1245         Accessible fragments
10           Historical maps available
```

**The only ratio ever displayed is linked excavation polygons.** It is labelled
"Excavation polygons linked" and nothing else — never "coverage", never a
percentage of the corpus or of findspots.

Every surface that shows counts carries `MapCompletenessNote`, a disclosure
button ("How to read these counts") expanding to:

> Fragment counts reflect records accessible to the current user.
> Excavation polygons represent mapped archaeological areas, not exact
> fragment coordinates.

It is a disclosure, not a paragraph laid over the map.

## Inspector architecture

No new permanent panel. The existing single panel drawer hosts compact
segmented sections (`MapInspectorTabs`, `role="tablist"` with roving tab focus
and arrow-key navigation):

| Tab       | Contents                                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview  | evidence badge, precision badge, mapped findspots, accessible fragments, completeness note                                                    |
| Evidence  | `MapInspectorEvidence` — method, precision, mapped area, sector/area/building/room; **absent rows are omitted**, plus the one provenance note |
| Findspots | first 6 rows, then "Show all _n_" / "Show fewer"; each row links to `/library/search?findspotId=<id>`                                         |
| Maps      | `MapInspectorMaps` — the site's historical sheets with date label, attribution, show/hide, and compare                                        |

The canonical polygon id is never rendered; the heading is the polygon's
`name` from the asset, falling back to a findspot `area`, then to the generic
noun "Excavation area".

The Maps tab says "Historical maps available for _site_". It does **not** claim
a sheet is associated with the selected polygon — no such relation exists in
the data.

Multi-findspot querying was **not** verified as supported, so only individual
"View fragments" links are offered; no "View all mapped fragments" action was
added.

## Research summary

`mapResearchSummaryText.ts` builds plain Markdown from only what the view
already shows:

```
# bB6I — Aššur

Feature type: Excavation area
Mapped findspots: 13
Accessible fragments: 23
Mapping evidence: Verified source
Location precision: Excavation area

Mapped findspots:
- Findspot 7 — 1 accessible fragment

Active historical maps:
- Andrae 1938, Beilage

Active visualization:
- Mapping evidence

Active filters:
- Site name contains "aš"

Terrain:
- On

Map:
https://www.ebl.lmu.de/map?v=1&…

Generated: 2026-08-06T10:00:00.000Z

Fragment counts reflect records accessible to the current user.
Excavation polygons represent mapped archaeological areas, not exact fragment
coordinates.
```

`MapResearchSummaryActions` offers **Copy research summary** and
**Download .md**, both from one builder so the file and the clipboard can never
disagree. Status is announced through `role="status" aria-live="polite"` for
success, clipboard rejection and an unavailable clipboard. Filenames reduce the
title to an ASCII slug (`ebl-map-bb6i-assur-<iso>.md`), falling back to
`summary` when nothing survives.

The context is built **lazily at click time**, so the URL, timestamp and active
overlays describe the view as it is then. CSV and GeoJSON export remain in the
existing Export panel; no export code is duplicated.

## Presentation mode

`usePresentationMode` + `MapPresentationBar`. It hides the route header, the
toolbar, the panel drawer, the selection pill, the legend and the hover
tooltip; it keeps the map, MapLibre's own attribution and navigation controls,
and a compact selected-feature title.

- Selection, camera, overlays, terrain, filters and visualization all survive,
  because none of them live in this hook.
- Focus moves to "Exit presentation mode" on entry.
- Escape exits. While the mode is active, `useMapSelectionActions` suspends its
  own Escape handling (`isSuspended`), so leaving the mode never also drops the
  selection the presenter is standing on.
- The mode is **not** written to the URL, so a shared link never traps its
  recipient in it.
- No second map instance is created; browser fullscreen is not used.

## Hover previews

`mapHoverPreview.ts` — four short lines at most, no links, no canonical ids, no
raw response fields:

```
bB6I                      Excavation area           Aššur
13 mapped findspots       No mapped findspots       133 linked excavation polygons
23 accessible fragments   Click to inspect          10 historical maps
Verified-source mapping                             Click to explore
Click to inspect
```

Lines the data cannot support are omitted rather than zeroed. Hover state is
still MapLibre feature state, moved only when the hovered polygon id actually
changes, so staying inside one feature causes no React update and no flicker.
The tooltip is suppressed on touch-only devices by
`@media (hover: none)` — the same information is one tap away in the inspector.

## Legend

One model, `mapLegendEntries.ts`, rendered by `MapLegendList` in two places:
the collapsible on-map legend (`MapLegend`) and the visualization panel. They
cannot drift.

| Mode                  | Entries                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| evidence              | No mapped findspot · Verified-source mapping · Curated mapping · Mixed mapping evidence · Selected area   |
| mapped                | No mapped findspot · Mapped, zero accessible fragments · Mapped with accessible fragments · Selected area |
| count / log / density | No mapped findspot · Zero accessible fragments · class ranges · Selected area                             |

Each entry pairs words with a mark that repeats the polygon's own outline
treatment (solid, dashed, dash-dot, halo). The on-map legend starts collapsed,
sits top-left away from MapLibre's attribution and navigation controls, and is
hidden in presentation mode. Density mode adds the note that polygons without a
usable area are left unclassified rather than counted as zero.

## Responsive behaviour

- **Desktop (1440×1000, 1180×800)** — map dominant at `min(76vh, 760px)`; the
  drawer is a 24 rem right-hand overlay (19 rem below `lg`); the toolbar sits
  bottom-left and the legend top-left, so neither collides with the drawer or
  with MapLibre's controls.
- **Tablet (834×1112)** — below `md` the drawer becomes the bottom sheet at
  `min(55vh, 28rem)`; the map keeps at least 68vh; toolbar buttons and the
  drawer's controls take a 2.75 rem minimum target; the definition list in the
  Evidence tab collapses to a single column.
- **Mobile (390×844, 360×740)** — sheet at `min(50vh, 24rem)`; tabs and the
  disclosure toggle are 2.75 rem tall; the findspot list scrolls inside the
  sheet body (`overscroll-behavior: contain`) and stays collapsed to 6 rows
  until expanded; nothing overflows horizontally.

No mobile framework was added; the bottom-sheet distinction stays CSS-only.

## Accessibility

- The visualization control keeps its real `<label>`; the panel is a labelled
  `<section>`.
- Evidence and precision are **words** in badges; the modifier class only tints
  a mark that already reads as text.
- Selection is signalled by halo, width, opacity **and** the inspector heading,
  never colour alone.
- Inspector tabs use `role="tablist"`/`tab`/`tabpanel`, one tab stop, arrow-key
  movement, and `aria-selected`.
- The inspector opens only on a deliberate selection; the drawer moves focus to
  its close control, and the toolbar button regains focus when the panel closes.
- Presentation mode has a labelled entry button, a focused exit button, and
  Escape.
- Copy/download announce success and failure through a polite live region.
- Hover-only information is always also present in the inspector.
- The legend is a `<ul>` with an accessible name; marks are `aria-hidden`.
- Reduced motion is respected: tab and row transitions are disabled under
  `prefers-reduced-motion: reduce`, and no new animation was introduced.
- Map updates are not announced assertively.

## Performance

- No request is made per polygon, per visualization change or per inspector
  tab. `MapTab.evidence.test.tsx` asserts the `fetch` call count is unchanged
  across a mode switch.
- Mode switches call `setPaintProperty` on existing layers only; the same test
  asserts the source key set is identical before and after.
- Hover and selection are feature state; sources and layers are never recreated
  for them.
- Site and polygon research summaries, marker states, the active-overlay id set
  and the panel prop bags are all memoized (`useMapResearch`,
  `useMapPanelDockProps`).
- The findspot list renders 6 rows until expanded.
- Presentation mode creates no second map instance
  (`MapTab.presentation.test.tsx` asserts the mock map count is unchanged and
  the existing map was not removed).
- The route stays lazily loaded; every listener is still removed on unmount.

Timing figures (map initialisation, repaint duration, inspector render time,
bundle-size delta, React render counts) were **not measured** in this sprint
and no figure for them is claimed.

## Tests

New suites: `mapResearchSummary`, `mapResearchSummaryText`, `mapSiteSummaries`,
`mapHoverPreview`, `mapEvidencePaint`, `mapExcavationPaint`, `mapLegendEntries`,
`MapInspectorEvidence`, `MapInspectorTabs` (with Maps and the completeness
note), `MapResearchSummaryActions`, `usePresentationMode`, `MapTab.evidence`,
`MapTab.presentation`.

Updated: `mapPaintExpressions`, `mapExcavationLayers`, `mapSiteLayers`,
`mapVisualizationValues`, `mapFeatureState`, `mapInteractions.hover`,
`MapLegend`, `MapInspectorSelection`, `MapInspectorExplorer`,
`MapTab.visualization`, `MapTab.controls`, `MapTab.selection`. Shared inspector
fixtures live in `src/test-support/map-inspector-render.tsx`.

## Screenshots

**None captured.** No browser automation tooling was available in this
container, so live visual verification at 1440×1000, 1180×800, 834×1112,
390×844 and 360×740 is **blocked**. Layout claims above are read from the
stylesheets and the breakpoint tokens, not from a rendered page.
