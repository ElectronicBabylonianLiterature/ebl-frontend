import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { MapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  fitMapToBoundingBox,
  fitMapToData,
  focusFeature,
  focusProvenance,
  resetCamera,
} from './mapCamera'
import { polygonFeature, provenanceRecord } from 'test-support/map-fixtures'

beforeEach(() => {
  resetMapLibreMock()
})

describe('fitMapToBoundingBox', () => {
  it('ignores a null bounding box', () => {
    const map = createMapMock()

    fitMapToBoundingBox(asLibreMap(map), null, { padding: 10 })

    expect(map.fitBounds).not.toHaveBeenCalled()
  })

  it('passes south-west and north-east corners', () => {
    const map = createMapMock()

    fitMapToBoundingBox(asLibreMap(map), [1, 2, 3, 4], { padding: 10 })

    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [1, 2],
        [3, 4],
      ],
      { padding: 10 },
    )
  })
})

describe('fitMapToData', () => {
  it('does nothing without features', () => {
    const map = createMapMock()

    fitMapToData(asLibreMap(map), [])

    expect(map.fitBounds).not.toHaveBeenCalled()
  })

  it('fits the union of point features', () => {
    const map = createMapMock()

    fitMapToData(asLibreMap(map), [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [1, 2] },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [5, 6] },
      },
    ])

    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [1, 2],
        [5, 6],
      ],
      { padding: 40, maxZoom: 12 },
    )
  })
})

describe('focusFeature', () => {
  it('eases to a point feature', () => {
    const map = createMapMock()

    focusFeature(asLibreMap(map), {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [43.25, 35.45] },
    })

    expect(map.easeTo).toHaveBeenCalledWith({
      center: [43.25, 35.45],
      zoom: 9,
    })
  })

  it('ignores a point feature without coordinates', () => {
    const map = createMapMock()

    focusFeature(asLibreMap(map), {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [] as unknown as [number, number],
      },
    })

    expect(map.easeTo).not.toHaveBeenCalled()
  })

  it('fits a polygon feature with inspector padding', () => {
    const map = createMapMock()

    focusFeature(asLibreMap(map), polygonFeature('assur-a', 'assur'))

    expect(map.fitBounds).toHaveBeenCalledWith(
      [
        [43.25, 35.45],
        [43.26, 35.46],
      ],
      {
        padding: { top: 48, right: 48, bottom: 48, left: 360 },
        maxZoom: 16,
      },
    )
  })
})

describe('focusProvenance', () => {
  it('eases to a point provenance', () => {
    const map = createMapMock()

    focusProvenance(asLibreMap(map), provenanceRecord())

    expect(map.easeTo).toHaveBeenCalledWith({
      center: [44.42, 32.542],
      zoom: 9,
    })
  })

  it('eases to the centroid of a polygon provenance', () => {
    const map = createMapMock()

    focusProvenance(
      asLibreMap(map),
      provenanceRecord({
        coordinates: undefined,
        polygonCoordinates: [
          { latitude: 0, longitude: 0 },
          { latitude: 0, longitude: 4 },
          { latitude: 4, longitude: 4 },
        ],
      }),
    )

    expect(map.easeTo).toHaveBeenCalledWith({
      center: [8 / 3, 4 / 3],
      zoom: 9,
    })
  })

  it.each([
    ['a missing map', null, provenanceRecord()],
    ['a missing provenance', createMapMock(), undefined],
  ])('ignores %s', (_label, map, provenance) => {
    expect(() =>
      focusProvenance(map && asLibreMap(map as MapMock), provenance),
    ).not.toThrow()
  })

  it('ignores a provenance without geometry', () => {
    const map = createMapMock()

    focusProvenance(
      asLibreMap(map),
      provenanceRecord({ coordinates: undefined }),
    )

    expect(map.easeTo).not.toHaveBeenCalled()
  })
})

describe('resetCamera', () => {
  it('returns to the initial view', () => {
    const map = createMapMock()

    resetCamera(asLibreMap(map))

    expect(map.easeTo).toHaveBeenCalledWith({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
  })

  it('tolerates a missing map', () => {
    expect(() => resetCamera(null)).not.toThrow()
  })
})
