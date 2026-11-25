export type MapPanelId =
  | 'inspector'
  | 'visualization'
  | 'measurement'
  | 'spatial-search'

export type ActiveMapPanel = MapPanelId | null

export function toggledPanel(
  current: ActiveMapPanel,
  requested: MapPanelId,
): ActiveMapPanel {
  return current === requested ? null : requested
}
