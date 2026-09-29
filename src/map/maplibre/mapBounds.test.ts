import type { Feature } from 'geojson'
import {
  mockBoundsExtend,
  mockFitBounds,
  mockMapInstance,
  resetMapMocks,
} from 'map/testSupport/mapLibreMock'
import { fitMapToData } from 'map/maplibre/mapBounds'

jest.mock('maplibre-gl')

function point(longitude: number, latitude: number): Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
  }
}

describe('fitMapToData', () => {
  beforeEach(resetMapMocks)

  it('does not fit the map for empty data', () => {
    fitMapToData(mockMapInstance as never, [])

    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('does not fit the map when no point features are valid', () => {
    fitMapToData(mockMapInstance as never, [
      { geometry: { type: 'Polygon', coordinates: [] } } as unknown as Feature,
      point(Number.NaN, 32.542),
    ])

    expect(mockFitBounds).not.toHaveBeenCalled()
  })

  it('fits a one-point collection with the configured padding and max zoom', () => {
    fitMapToData(mockMapInstance as never, [point(44.42, 32.542)])

    expect(mockBoundsExtend).toHaveBeenCalledWith([44.42, 32.542])
    expect(mockFitBounds).toHaveBeenCalledWith(expect.anything(), {
      padding: 40,
      maxZoom: 12,
    })
  })

  it('extends bounds for each valid point in a multi-point collection', () => {
    fitMapToData(mockMapInstance as never, [
      point(44.42, 32.542),
      point(45.64, 31.32),
    ])

    expect(mockBoundsExtend).toHaveBeenCalledTimes(2)
    expect(mockBoundsExtend).toHaveBeenNthCalledWith(2, [45.64, 31.32])
    expect(mockFitBounds).toHaveBeenCalledTimes(1)
  })
})
