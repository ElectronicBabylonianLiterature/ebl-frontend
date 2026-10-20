import type { HistoricalMapOverlay } from 'map/historicalOverlays'

export default function makeOverlay(
  overrides: Partial<HistoricalMapOverlay> = {},
): HistoricalMapOverlay {
  return {
    id: 'babylon-map',
    siteId: 'babylon',
    siteName: 'Babylon',
    title: 'Babylon Map',
    shortTitle: 'Babylon',
    dateLabel: 'c. 600 BCE',
    description: 'A historical map of Babylon',
    cartographer: 'Unknown',
    institution: 'British Museum',
    sourceFilename: 'babylon.tif',
    attribution: 'British Museum, 1900',
    sourceUrl: 'https://example.com/babylon',
    type: 'raster-tiles',
    tiles: ['https://example.com/tiles/{z}/{x}/{y}.png'],
    bounds: [44.0, 32.0, 45.0, 33.0],
    minZoom: 5,
    maxZoom: 15,
    tileSize: 256,
    defaultOpacity: 0.8,
    ...overrides,
  }
}
