# Map UI architecture

Describes the architecture as it exists on `final-map`, not a proposed redesign.

## Layout

`MapTab` is the composition root and holds no rendering logic of its own. It
loads data, derives capabilities, and composes four regions:

```
MapTab
├── MapExperienceHeader     site filter, visible-site count, clear selection,
│                           copy map link, reset view
├── (empty-state Alert)     shown when the filter matches no site
└── map-experience__body
    ├── MapInspector        the semantic, keyboard-operable panel
    │   ├── MapInspectorExplorer   default view: metrics, per-site support, site list
    │   ├── MapInspectorSite       a selected provenance
    │   └── MapInspectorArea       a selected excavation polygon
    └── MapStage
        ├── MapLayerControls → MapControls   layer + historical overlay panel
        ├── MapVisualizationControl          choropleth mode + legend
        ├── map-hover-tooltip                pointer-only hover preview
        ├── map-legend                       static feature-type key
        └── map-tab__container               the MapLibre canvas
```

The map canvas is always the visually dominant region: the inspector is a fixed
left column and every other surface is a small overlay positioned inside the
stage.

## Selection model

`MapSelection` is a discriminated union with exactly two shapes:

```ts
{
  type: 'site'
  provenanceId: string
}
{
  type: 'excavation-area'
  polygonId: string
}
```

There is one selection at a time and it lives in `useMapExperience`. Both the
map (via `handleMapClick`) and the inspector site list write to the same state,
so pointer and keyboard paths cannot diverge. Selection is mirrored into
MapLibre **feature state**, never into a source rewrite, and is reflected in the
URL as `site=` or `area=`.

Escape clears the selection and the hover preview from anywhere in the tab.

## MapLibre lifecycle boundaries

`useFindspotMap` is a coordinator only. It creates the map, registers listeners,
and delegates everything else:

| Module                   | Responsibility                                               |
| ------------------------ | ------------------------------------------------------------ |
| `mapSourceLifecycle`     | creates sources/layers once on `load`; layer visibility      |
| `mapOverlayLifecycle`    | historical raster source/layer add, remove, opacity          |
| `mapChoroplethLayers`    | repaints excavation layers in place when the scale changes   |
| `mapFeatureState`        | hover, selection and authorized-count feature state          |
| `mapInteractions`        | click, hover, cluster expansion, hover previews              |
| `mapCamera`              | every camera movement, fitting and reset                     |
| `mapErrorClassification` | separates a fatal style failure from tile/sprite/glyph noise |

The rule the boundaries encode: **React owns state, MapLibre owns rendering.**
Nothing outside these modules calls a MapLibre mutation method.

## Layer modules

`mapLayers.ts` is now a barrel re-export. The real definitions are split by
responsibility so paint logic is independently testable:

- `mapLayerIds` — every source/layer id and the cluster constants
- `mapSiteLayers` — provenance polygons, clusters, unclustered points
- `mapExcavationLayers` — excavation source and its three layers
- `mapHistoricalLayers` — historical raster source and layer
- `mapPaintExpressions` — pure MapLibre expression builders

Paint expressions are asserted through `test-support/mapExpressionEvaluator`,
which evaluates the expression subset in use, so tests check the _rendered
value_ for a given feature state rather than that an expression exists.

## Map controls

Controls are progressive rather than a permanent wall of toggles:

- The layer panel is collapsed by default behind a "Show map layers" button and
  summarises its own state ("N historical maps active · Excavation areas off").
- `MapVisualizationControl` is a single select plus a legend; the density option
  is absent unless a positive geodesic area actually yields a density.
- The inspector reveals actions contextually — "Show excavation areas" only for
  a site with polygons, "Open historical maps" only for a site with overlays.

## Mobile behaviour

`map-experience__body` collapses to a single column below the `lg` breakpoint
and the inspector loses its fixed height. `MapVisualizationControl` switches
from an absolutely positioned overlay to static flow below the `md` breakpoint
so it never covers the canvas on a phone. The layer panel is already collapsed
by default, which is the mobile-first state.

## Accessibility

- The inspector is the semantic alternative to pointer-only map interaction:
  `<button>` site cards carrying `aria-pressed`, real `<a>` findspot links,
  headings, and a "Back to explore" control.
- The visualization select has a real `<label>`; the legend is a `<ul>` with an
  accessible name, and each class states its numeric range as text.
- Choropleth classes are distinguished by **outline width and dash pattern as
  well as colour**, so the visualization does not rely on colour alone.
- Status messages (`copied`, `no data to classify`) use `role="status"` with
  polite live regions. Camera movement is never announced.
- Escape clears selection; focus styling is inherited from the app-wide focus
  treatment.

Not yet verified: contrast ratios and touch-target sizes were not measured in a
browser during this phase.

## Performance safeguards

- The route stays lazily loaded (`React.lazy` in `router/toolsContent.tsx`).
- Hover and selection use feature state; sources are never rewritten for them.
- `useMapCamera` listens to `moveend` only, so panning causes no React update.
- Camera→URL writes are debounced 400 ms and use `replace`; selection, layer,
  overlay, filter and visualization changes push immediately.
- Changing visualization mode calls `setPaintProperty` on existing layers —
  sources and layers are reused, never recreated.
- Map data is requested once per mount, only for sites with a configured
  endpoint. There is no request per polygon.
- Every listener registered in `useFindspotMap` is removed on unmount.

## Intentionally deferred

Comparison/swipe, the publication timeline, export, measurement, spatial search,
the curator data-quality UI, terrain and 3D are **not implemented**, and no
scaffolding for them exists. See `docs/map-frontend-advanced-phase-handoff.md`
for the blocker or scheduling status of each.

## Research-experience layer (later sprint)

The evidence visualization mode, the refined polygon/marker/cluster visual
system, the tabbed evidence-first inspector, the site completeness summary, the
research-summary copy/download action, presentation mode and the contextual
legend are documented in **`docs/map-research-experience.md`**. That document
supersedes the visual specifics above where the two differ; the panel model,
URL-state contract and lazy-loading guarantees described here are unchanged.
