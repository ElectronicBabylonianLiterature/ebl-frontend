import type { MapMouseEvent } from 'maplibre-gl'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { clusterFeature } from 'test-support/map-interaction-fixtures'
import { handleMapClick, handleMapHover } from 'map/mapInteractions'
import { clusterLayer, SOURCE_ID } from 'map/mapLayers'

const event = { point: { x: 1, y: 2 } } as MapMouseEvent

function clusteredMap() {
  const map = createMapMock()
  map.addLayer({ ...clusterLayer })
  map.addSource(SOURCE_ID, {})
  map.setRenderedFeatures(() => [clusterFeature(1)])
  return map
}

test('ignores clicks and hover queries before the interactive layers exist', () => {
  const map = createMapMock()
  const query = jest.spyOn(map, 'queryRenderedFeatures')
  const select = jest.fn()
  const hover = jest.fn()
  handleMapClick(asLibreMap(map), event, select)
  handleMapHover(
    asLibreMap(map),
    event,
    { current: null },
    { findspotSummaries: new Map(), siteSummaries: new Map() },
    hover,
  )
  expect(query).not.toHaveBeenCalled()
  expect(select).not.toHaveBeenCalled()
  expect(hover).toHaveBeenCalledWith(null)
})

test('ignores cluster expansion after the interaction is superseded', async () => {
  const map = clusteredMap()
  let resolveZoom!: (zoom: number) => void
  map.getSource(SOURCE_ID)?.getClusterExpansionZoom.mockReturnValue(
    new Promise((resolve) => {
      resolveZoom = resolve
    }),
  )
  let active = true
  handleMapClick(asLibreMap(map), event, jest.fn(), () => active)
  active = false
  resolveZoom(12)
  await Promise.resolve()
  expect(map.easeTo).not.toHaveBeenCalled()
})

test('ignores cluster expansion after its source is removed', async () => {
  const map = clusteredMap()
  handleMapClick(asLibreMap(map), event, jest.fn())
  map.removeSource(SOURCE_ID)
  await Promise.resolve()
  expect(map.easeTo).not.toHaveBeenCalled()
})

test('handles rejected cluster expansion without an unhandled rejection', async () => {
  const map = clusteredMap()
  map
    .getSource(SOURCE_ID)
    ?.getClusterExpansionZoom.mockRejectedValue(new Error('removed source'))
  handleMapClick(asLibreMap(map), event, jest.fn())
  await Promise.resolve()
  await Promise.resolve()
  expect(map.easeTo).not.toHaveBeenCalled()
})
