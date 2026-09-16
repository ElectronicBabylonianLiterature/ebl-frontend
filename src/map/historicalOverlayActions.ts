import type {
  ActiveHistoricalOverlay,
  HistoricalMapOverlay,
  HistoricalMapOverlaySeries,
} from './historicalOverlays'

export interface ActiveOverlayEntry {
  readonly overlay: HistoricalMapOverlay
  readonly opacity: number
  readonly visible: boolean
}

export function activeOverlayEntries(
  activeOverlays: readonly ActiveHistoricalOverlay[],
  overlayById: ReadonlyMap<string, HistoricalMapOverlay>,
): readonly ActiveOverlayEntry[] {
  return activeOverlays.flatMap((activeOverlay) => {
    const overlay = overlayById.get(activeOverlay.id)
    return overlay
      ? [
          {
            overlay,
            opacity: activeOverlay.opacity,
            visible: activeOverlay.visible,
          },
        ]
      : []
  })
}

export function withOverlayActive(
  current: readonly ActiveHistoricalOverlay[],
  overlay: HistoricalMapOverlay,
  isActive: boolean,
): readonly ActiveHistoricalOverlay[] {
  const withoutOverlay = current.filter((entry) => entry.id !== overlay.id)
  return isActive
    ? [
        ...withoutOverlay,
        { id: overlay.id, opacity: overlay.defaultOpacity, visible: true },
      ]
    : withoutOverlay
}

export function withOverlayOpacity(
  current: readonly ActiveHistoricalOverlay[],
  overlayId: string,
  opacity: number,
): readonly ActiveHistoricalOverlay[] {
  return current.map((entry) =>
    entry.id === overlayId ? { ...entry, opacity } : entry,
  )
}

export function withSeriesActive(
  current: readonly ActiveHistoricalOverlay[],
  series: HistoricalMapOverlaySeries,
  isActive: boolean,
): readonly ActiveHistoricalOverlay[] {
  const seriesIds = new Set(series.overlays.map((overlay) => overlay.id))
  const withoutSeries = current.filter((entry) => !seriesIds.has(entry.id))

  return isActive
    ? [
        ...withoutSeries,
        ...series.overlays.map((overlay) => ({
          id: overlay.id,
          opacity: overlay.defaultOpacity,
          visible: true,
        })),
      ]
    : withoutSeries
}

export function unionMaxZoom(
  overlays: readonly HistoricalMapOverlay[],
): number | undefined {
  const maxZooms = overlays
    .map((overlay) => overlay.maxZoom)
    .filter((zoom): zoom is number => typeof zoom === 'number')
  return maxZooms.length > 0 ? Math.min(...maxZooms) : undefined
}
