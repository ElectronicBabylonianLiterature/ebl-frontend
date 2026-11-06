import { act, screen } from '@testing-library/react'
import {
  makeFragmentService,
  makeProvenance,
  mockQueryRenderedFeatures,
  mockSetDOMContent,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { mockFitBounds } from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('frames the clicked provenance polygon before showing its tablet link', async () => {
  const provenance = makeProvenance({
    id: 'assur',
    polygonCoordinates: [
      { longitude: 43.25, latitude: 35.45 },
      { longitude: 43.27, latitude: 35.46 },
      { longitude: 43.26, latitude: 35.47 },
    ],
  })
  renderMapTab(makeFragmentService([provenance]))
  await screen.findByLabelText('Filter findspots by name')
  mockFitBounds.mockClear()
  mockQueryRenderedFeatures.mockReturnValueOnce([]).mockReturnValueOnce([
    {
      type: 'Feature',
      properties: {
        id: provenance.id,
        name: provenance.longName,
        abbreviation: provenance.abbreviation,
        geometryType: 'polygon',
      },
      geometry: { type: 'Point', coordinates: [43.26, 35.46] },
    },
  ])

  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))

  expect(mockFitBounds).toHaveBeenCalledWith(
    [
      [43.25, 35.45],
      [43.27, 35.47],
    ],
    { padding: 40, maxZoom: 14 },
  )
  expect(mockSetDOMContent).toHaveBeenCalledTimes(1)
})
