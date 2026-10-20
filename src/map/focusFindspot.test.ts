import { Map as MapLibreMap } from 'maplibre-gl'
import { focusFindspot } from 'map/focusFindspot'
import { makeProvenance } from 'map/provenanceTestData'
import {
  mockEaseTo,
  mockFitBounds,
  mockGetZoom,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

function createMap(): MapLibreMap {
  return new MapLibreMap({ container: document.createElement('div') })
}

it('zooms a point to site detail while retaining a closer view', () => {
  const map = createMap()
  focusFindspot(map, [44, 33])
  expect(mockEaseTo).toHaveBeenLastCalledWith({ center: [44, 33], zoom: 14 })

  mockGetZoom.mockReturnValue(18)
  focusFindspot(map, [44, 33], makeProvenance())
  expect(mockEaseTo).toHaveBeenLastCalledWith({ center: [44, 33], zoom: 18 })
})

it('frames every vertex of an available site polygon', () => {
  const provenance = makeProvenance({
    polygonCoordinates: [
      { longitude: 43.25, latitude: 35.45 },
      { longitude: 43.27, latitude: 35.46 },
      { longitude: 43.26, latitude: 35.47 },
    ],
  })
  focusFindspot(createMap(), [43.26, 35.46], provenance)

  expect(mockFitBounds).toHaveBeenCalledWith(
    [
      [43.25, 35.45],
      [43.27, 35.47],
    ],
    { padding: 40, maxZoom: 14 },
  )
  expect(mockEaseTo).not.toHaveBeenCalled()
})

it('falls back to the rendered point for an unusable polygon', () => {
  const provenance = makeProvenance({
    polygonCoordinates: [
      { longitude: 181, latitude: 35 },
      { longitude: 43, latitude: 36 },
      { longitude: 44, latitude: 35 },
    ],
  })
  focusFindspot(createMap(), [44, 33], provenance)

  expect(mockEaseTo).toHaveBeenCalledWith({ center: [44, 33], zoom: 14 })
  expect(mockFitBounds).not.toHaveBeenCalled()
})
