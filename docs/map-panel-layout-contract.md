# Map panel and layout contract — handoff

Branch `final-map`, frontend only. This is the in-progress state of the
map-first layout redesign, stopped mid-task at the user's request. Validation
finished; browser verification and final documentation sweep did not start.

## What changed, in one paragraph

The map used to reserve a permanent left-hand column for the inspector and
scatter Layers/Visualization/tool controls as independently-toggled floating
boxes. All of that is now one unified panel system: a single `activePanel`
state (`useMapPanel`) governs an inspector, a layers browser, a visualization
control, and six feature panels (compare, timeline, spatial search, measure,
export, terrain) — nine panels, one drawer, one toolbar, at most one open at a
time. The map canvas is now the only permanent element in the route body.

## Core architecture

| Piece                      | File                                                                                                                  | Role                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel identity             | `mapPanel.ts`                                                                                                         | `MapPanelId` union (9 values) + `ActiveMapPanel` (`MapPanelId \| null`) + `toggledPanel`                                                                                                                                                                                                                                                                                                |
| Panel state                | `useMapPanel.ts`                                                                                                      | The one `useState<ActiveMapPanel>`. `open`, `toggle`, `close`.                                                                                                                                                                                                                                                                                                                          |
| Toolbar                    | `MapToolbar.tsx`                                                                                                      | Renders only `isSupported` panels; `aria-expanded`; moves focus back to the trigger button when its panel closes.                                                                                                                                                                                                                                                                       |
| Drawer / bottom sheet      | `MapPanelDrawer.tsx`                                                                                                  | One markup tree; CSS alone turns it into a right-side drawer (desktop/tablet) or a bottom sheet (mobile). Owns focus-on-open (closes button), the close action, and the mobile collapsed/expanded toggle.                                                                                                                                                                               |
| Assembly                   | `MapPanelDock.tsx` + `mapInfoPanels.tsx` (inspector/layers/visualization) + `mapToolPanels.tsx` (the six tool panels) | Builds the 9 `MapPanelDefinition`s and renders `<MapToolbar>` + the active `<MapPanelDrawer>`.                                                                                                                                                                                                                                                                                          |
| Selection actions          | `useMapSelectionActions.ts`                                                                                           | `selectFeature` (opens inspector), `deselectFeature` (clears selection, panel untouched — used by the inspector's own "Back to explore"), `dismissSelection` (clears selection **and** closes the inspector if it's open — used by the header's "Clear selection" and Escape's second stage), `browseHistoricalMaps` (filters + opens Layers). Also owns the two-stage Escape listener. |
| Camera padding             | `mapPanelPadding.ts` + `useMapPanelPadding.ts`                                                                        | `map.setPadding()` (never animates) reserves screen space for whichever side the open panel occupies, sized from the panel's **actual rendered box** via `useElementSize.ts` — not a constant duplicated from Sass.                                                                                                                                                                     |
| Resize                     | `useMapContainerResize.ts`                                                                                            | `ResizeObserver` + rAF-coalesced `map.resize()` on the map container itself. Panel open/close no longer resizes the container (panels are overlays now), so this mainly covers window/orientation changes.                                                                                                                                                                              |
| Breakpoint-aware behaviour | `useIsNarrowViewport.ts`                                                                                              | Reactive `matchMedia` (768px), used only to choose which side (`right` vs `bottom`) camera padding reserves.                                                                                                                                                                                                                                                                            |
| Legend                     | `MapLegend.tsx`                                                                                                       | Deliberately outside the shared panel model — a small always-available toggle that can coexist with an open panel.                                                                                                                                                                                                                                                                      |
| Selection restore          | `MapSelectionPill.tsx`                                                                                                | "Show selected area" — appears only when a feature is selected and the inspector isn't the open panel.                                                                                                                                                                                                                                                                                  |
| Layers content split       | `MapControls.tsx` / `MapControlsSeries.tsx` / `mapControlsHelpers.ts`                                                 | Split from one 473-line file. `MapControls.tsx` no longer owns its own open/collapsed chrome — the drawer does that uniformly now.                                                                                                                                                                                                                                                      |
| Z-index                    | `_map-zindex.sass`                                                                                                    | The only place stacking order is defined: legend (2) < tooltip (3) < toolbar (4) < panel (5), all below MapLibre's own controls conceptually (kept clear by geometry, see below).                                                                                                                                                                                                       |

## Escape and selection semantics (deliberately not what you'd guess)

- **First Escape**: closes whatever panel is open. Selection is untouched.
- **Second Escape** (panel already closed): clears the selection.
- **Header "Clear selection"**: clears the selection and closes the inspector
  _if it's the open panel_ — leaves an unrelated open panel (e.g. Export)
  alone.
- **Inspector's own "Back to explore"**: clears the selection but never
  touches panel state — it's already showing the inspector, and clearing the
  selection just switches that same panel to its explorer sub-view.
- Selecting a **new** feature always calls `open('inspector')`, even if some
  other panel was open — this is what makes "feature selected → inspector
  opens" true regardless of what the user was doing.

This required rewriting `MapTab.selection.test.tsx`'s old single-Escape test
into a two-Escape test — the previous behavior (one Escape both closed the
detail view and cleared the selection) no longer exists.

## Positioning (avoids the two real overlap bugs that existed before)

Previously `.map-tools` and `.map-legend` shared the exact same
`right: 0.75rem; bottom: 0.75rem` corner. Now:

- Legend: top-left.
- Toolbar: bottom-left.
- Selection pill: bottom-left, stacked above the toolbar.
- Drawer (desktop/tablet): right edge, inset `top: 3.5rem` / `bottom: 1.75rem`
  specifically to stay clear of MapLibre's own top-right `NavigationControl`
  and its default bottom-right `AttributionControl` — verify this inset is
  still correct if either control's rendered size changes.
- Drawer (mobile, ≤768px): bottom sheet, `_map-panel-drawer.sass`'s
  `@media` block. Two states — expanded (default) and collapsed (header only,
  via the `map-panel-drawer__handle` grip button) — this is a **local**
  `useState` inside `MapPanelDrawer`, not part of the shared panel model,
  since "collapsed vs. expanded" only matters for the sheet.

## Testing state

70 map test suites, 838 tests, all passing. `yarn lint` (ESLint + Stylelint)
and `npx tsc --noEmit` are both clean (one ESLint _warning_, not an error, for
a deliberate `javascript:` URL in a rejection test).

Coverage on everything genuinely new this phase is 100%, with these known
residual gaps, left as-is because closing them needed disproportionate new
test scaffolding for pre-existing (not newly written) logic:

| File                                                                                                                    | Gap                                   | Why it's not closed                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MapLayerControls.tsx`                                                                                                  | ~50%                                  | `zoomToOverlay`/`zoomToSeries`/`setSeriesActive` wiring is only exercised through a real historical-map _series_, and the only site with a real series in the catalogue is Nippur, not the Aššur fixture the existing controls tests use. The callback wiring itself is tested directly in `MapControlsSeries.test.tsx`. |
| `MapComparePanel.tsx`, `MapExportPanel.tsx`, `MapTerrainPanel.tsx`, `MapSpatialSearchPanel.tsx`, `MapTimelinePanel.tsx` | small branch gaps                     | Pre-existing branches (not logic I wrote this phase) whose only change here was `<section aria-label>` → `<div>` to stop them creating a second nested ARIA region inside the drawer's own region (this fixed several `getByRole('region', ...)` test collisions — see below).                                           |
| `useMapPanelDockProps.ts` line 79                                                                                       | `onShowExcavationAreas` callback body | Never invoked by any test; needs a fixture with `hasExcavationPolygons` support wired through the inspector's own button, not just the layers-panel checkbox.                                                                                                                                                            |
| `useMapTools.ts`                                                                                                        | 2 lines                               | Setter pass-throughs not independently exercised outside integration tests.                                                                                                                                                                                                                                              |

### A pitfall worth knowing about if you keep working here

`getByLabelText` in Testing Library matches **any** element with a matching
`aria-label`, not just form-label associations. Once the drawer itself carries
`aria-label={panel title}`, a form control inside that panel with the _same_
label text (e.g. `MapVisualizationControl`'s `<Form.Label>Visualize</Form.Label>`
under a panel titled "Visualize") becomes ambiguous to `screen.getByLabelText`.
Fix is to scope with `within(screen.getByRole('region', {name}))` — see
`MapTab.visualization.test.tsx`'s `visualizationSelect()` helper — rather than
renaming the production label.

## Deferred / not started

- **Browser verification** (Stage 21 of the original brief — 5 viewports, 20
  flows). Not performed; this environment is headless. The drawer inset
  numbers (`top: 3.5rem`, `bottom: 1.75rem`) and the mobile sheet heights
  (`min(55vh, 28rem)` / `min(50vh, 24rem)`) are reasoned estimates that need
  visual confirmation against the real MapLibre attribution/navigation control
  sizes, not measured.
- **Reduced-motion**: `MapPanelDrawer`'s CSS has a `prefers-reduced-motion`
  block, but no transition/animation was actually added to the drawer's
  open/close in this phase (it's a conditional render, not an animated one),
  so there's nothing to suppress yet — noted for whoever adds a transition.
- Documentation sweep: `docs/map-ui-redesign.md` and
  `docs/map-frontend-multisite-handoff.md` were not updated to reflect this
  layout change — the previous doc's description of the layout (permanent
  inspector sidebar, floating boxes) is now stale.
- `yarn build:ci-stable` was not run in this final state (only `tsc`,
  `eslint`, `stylelint`, and the map test suite were).

## Confirmations

No commit, push, stage, merge, rebase, reset, clean, or stash occurred. No
backend, MongoDB, canonical GeoJSON, raw `Maps/` source, or environment/secret
file was touched. Still on `final-map`.
