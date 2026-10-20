import type { HistoricalMapOverlay } from 'map/historicalOverlays'
import overlays from 'map/historicalOverlays.generated.json'

export const generatedHistoricalMapOverlays: readonly HistoricalMapOverlay[] =
  overlays.map((overlay) => ({
    ...overlay,
    type: 'raster-tiles',
    bounds: [
      overlay.bounds[0],
      overlay.bounds[1],
      overlay.bounds[2],
      overlay.bounds[3],
    ],
  }))
