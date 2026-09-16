/**
 * The single set of large, mutually exclusive map overlays. At most one is
 * ever open, so opening any panel implicitly closes every other one — this is
 * what makes tool interactions (measuring vs. drawing a search box, etc.)
 * mutually exclusive without separate bookkeeping per tool.
 */
export type MapPanelId =
  | 'inspector'
  | 'layers'
  | 'visualization'
  | 'comparison'
  | 'timeline'
  | 'spatial-search'
  | 'measurement'
  | 'export'
  | 'terrain'
  | 'three-d'

export type ActiveMapPanel = MapPanelId | null

export function toggledPanel(
  current: ActiveMapPanel,
  requested: MapPanelId,
): ActiveMapPanel {
  return current === requested ? null : requested
}

/** Panels whose primary purpose is a map-click drawing/measuring interaction. */
const INTERACTIVE_PANELS: ReadonlySet<MapPanelId> = new Set([
  'spatial-search',
  'measurement',
])

export function isInteractivePanel(panel: ActiveMapPanel): boolean {
  return panel !== null && INTERACTIVE_PANELS.has(panel)
}
