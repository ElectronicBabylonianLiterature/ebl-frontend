import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  createHistoricalRasterLayer,
  createHistoricalRasterSource,
  historicalRasterLayerId,
  historicalRasterSourceId,
  polygonFillLayer,
} from './mapLayers'

export interface ActiveHistoricalMapOverlay {
  readonly overlay: HistoricalMapOverlay
  readonly opacity: number
  readonly visible: boolean
}

export function clampRasterOpacity(opacity: number): number {
  return Number.isFinite(opacity) ? Math.min(Math.max(opacity, 0), 1) : 1
}

function removeHistoricalOverlay(map: MapLibreMap, overlayId: string): void {
  const layerId = historicalRasterLayerId(overlayId)
  const sourceId = historicalRasterSourceId(overlayId)

  if (map.getLayer(layerId)) {
    map.removeLayer(layerId)
  }

  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
  }
}

function addHistoricalOverlay(
  map: MapLibreMap,
  activeOverlay: ActiveHistoricalMapOverlay,
): void {
  const sourceId = historicalRasterSourceId(activeOverlay.overlay.id)
  const layerId = historicalRasterLayerId(activeOverlay.overlay.id)

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, createHistoricalRasterSource(activeOverlay.overlay))
  }

  if (map.getLayer(layerId)) return

  const layer = createHistoricalRasterLayer(
    activeOverlay.overlay,
    clampRasterOpacity(activeOverlay.opacity),
  )

  if (map.getLayer(polygonFillLayer.id)) {
    map.addLayer(layer, polygonFillLayer.id)
  } else {
    map.addLayer(layer)
  }
}

export function syncHistoricalOverlays(
  map: MapLibreMap,
  activeOverlays: readonly ActiveHistoricalMapOverlay[],
  activeOverlayIdsRef: MutableRefObject<readonly string[]>,
): void {
  const visibleOverlays = activeOverlays.filter((entry) => entry.visible)
  const nextIds = visibleOverlays.map((entry) => entry.overlay.id)
  const nextIdSet = new Set(nextIds)

  for (const previousId of activeOverlayIdsRef.current) {
    if (!nextIdSet.has(previousId)) {
      removeHistoricalOverlay(map, previousId)
    }
  }

  for (const activeOverlay of visibleOverlays) {
    addHistoricalOverlay(map, activeOverlay)
    const layerId = historicalRasterLayerId(activeOverlay.overlay.id)
    if (map.getLayer(layerId)) {
      map.setPaintProperty(
        layerId,
        'raster-opacity',
        clampRasterOpacity(activeOverlay.opacity),
      )
    }
  }

  activeOverlayIdsRef.current = nextIds
}
