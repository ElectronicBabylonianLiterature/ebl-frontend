import type { AddLayerObject, RasterSourceSpecification } from 'maplibre-gl'
import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  historicalRasterLayerId,
  historicalRasterSourceId,
} from './mapLayerIds'

export function createHistoricalRasterSource(
  overlay: HistoricalMapOverlay,
): RasterSourceSpecification {
  return {
    type: 'raster',
    tiles: [...overlay.tiles],
    attribution: overlay.attribution,
    ...(overlay.bounds
      ? { bounds: [...overlay.bounds] as [number, number, number, number] }
      : {}),
    ...(overlay.minZoom !== undefined ? { minzoom: overlay.minZoom } : {}),
    ...(overlay.maxZoom !== undefined ? { maxzoom: overlay.maxZoom } : {}),
    ...(overlay.tileSize !== undefined ? { tileSize: overlay.tileSize } : {}),
  }
}

export function createHistoricalRasterLayer(
  overlay: HistoricalMapOverlay,
  opacity: number,
): AddLayerObject {
  return {
    id: historicalRasterLayerId(overlay.id),
    type: 'raster',
    source: historicalRasterSourceId(overlay.id),
    paint: {
      'raster-opacity': opacity,
    },
  }
}
