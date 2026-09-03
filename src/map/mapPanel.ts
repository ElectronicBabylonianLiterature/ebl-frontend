export type MapPanelId =
  | 'layers'
  | 'inspector'
  | 'visualization'
  | 'measurement'
  | 'spatial-search'
  | 'export'

export type ActiveMapPanel = MapPanelId | null

export function toggledPanel(
  current: ActiveMapPanel,
  requested: MapPanelId,
): ActiveMapPanel {
  return current === requested ? null : requested
}
