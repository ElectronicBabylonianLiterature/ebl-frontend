import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import type { MapMouseEvent } from 'maplibre-gl'
import {
  resetMapLibreMock,
  setClusterExpansionZoom,
} from '__mocks__/maplibre-gl'
import {
  clusterLayer,
  excavationAreaFillLayer,
  polygonFillLayer,
  unclusteredLayer,
  SOURCE_ID,
} from './mapLayers'
import { handleMapClick } from './mapInteractions'
import { polygonFeature } from 'test-support/map-fixtures'
import {
  clusterFeature,
  pointFeature,
} from 'test-support/map-interaction-fixtures'

const event = { point: { x: 12, y: 34 } } as MapMouseEvent

beforeEach(() => {
  resetMapLibreMock()
})

describe('handleMapClick', () => {
  it('expands a cluster instead of selecting', async () => {
    const map = createMapMock()
    map.addSource(SOURCE_ID, {})
    setClusterExpansionZoom(11)
    map.setRenderedFeatures((layers) =>
      layers.includes(clusterLayer.id) ? [clusterFeature(7)] : [],
    )
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)
    await Promise.resolve()

    expect(onSelect).not.toHaveBeenCalled()
    expect(map.easeTo).toHaveBeenCalledWith({
      center: [43.25, 35.45],
      zoom: 11,
    })
  })

  it('ignores a cluster without a numeric cluster id', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(clusterLayer.id) ? [clusterFeature('seven')] : [],
    )

    handleMapClick(asLibreMap(map), event, jest.fn())

    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('selects a site from an unclustered point', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [pointFeature('babylon', 'Babylon')]
        : [],
    )
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)

    expect(onSelect).toHaveBeenCalledWith({
      type: 'site',
      provenanceId: 'babylon',
    })
    expect(map.easeTo).toHaveBeenCalledWith({
      center: [43.25, 35.45],
      zoom: 9,
    })
  })

  it('selects an excavation area and fits its bounds', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(excavationAreaFillLayer.id)
        ? [polygonFeature('assur-area-a', 'assur')]
        : [],
    )
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)

    expect(onSelect).toHaveBeenCalledWith({
      type: 'excavation-area',
      polygonId: 'assur-area-a',
    })
    expect(map.fitBounds).toHaveBeenCalled()
  })

  it('selects a site from a provenance polygon', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(polygonFillLayer.id)
        ? [polygonFeature('babylon', 'assur')]
        : [],
    )
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)

    expect(onSelect).toHaveBeenCalledWith({
      type: 'site',
      provenanceId: 'babylon',
    })
  })

  it('ignores a feature without a string id', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [{ ...(pointFeature('x', 'X') as object), properties: {} }]
        : [],
    )
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does nothing when no layer is hit', () => {
    const map = createMapMock()
    const onSelect = jest.fn()

    handleMapClick(asLibreMap(map), event, onSelect)

    expect(onSelect).not.toHaveBeenCalled()
  })
})
