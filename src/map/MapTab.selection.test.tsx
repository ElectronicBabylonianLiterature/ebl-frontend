import fs from 'fs'
import path from 'path'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Bluebird from 'bluebird'
import fetchMock from 'jest-fetch-mock'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  makeFragmentService,
  makeProvenance,
  mockAddLayer,
  mockQueryRenderedFeatures,
  mockSetLayoutProperty,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapExcavationLayers'
import { findspotMapDataDto } from 'test-support/map-fixtures'

jest.mock('maplibre-gl')

const POLYGON_ID = 'assur-bb6i-3d76dc1e02af'
const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
  'utf8',
)

function makeFindspotService(): FindspotService {
  return {
    fetchMapData: jest.fn((siteId: string) =>
      Bluebird.resolve(
        siteId === 'assur'
          ? [
              findspotMapDataDto({
                findspotId: 7,
                polygonIds: [POLYGON_ID],
                accessibleFragmentCount: 3,
              }),
            ]
          : [],
      ),
    ),
  } as unknown as FindspotService
}

describe('MapTab excavation selection', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
  })

  it('preserves a deep-link selection when the polygon index is unavailable', async () => {
    fetchMock.resetMocks()
    fetchMock.mockRejectOnce(new Error('asset offline'))
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&selected=area%3A' + POLYGON_ID,
      makeFindspotService(),
    )

    expect(
      await screen.findByText('Excavation areas are unavailable.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      'selected=area%3A' + POLYGON_ID,
    )
  })

  it('clears a stale URL selection after loading the canonical index', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&selected=area%3Aunknown-polygon',
      makeFindspotService(),
    )

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).not.toHaveTextContent(
        'selected=',
      ),
    )
    expect(
      screen.queryByRole('region', { name: 'Selected excavation area' }),
    ).not.toBeInTheDocument()
  })

  it('stores a canonical click, highlights it, and shows one linked-data card', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
      makeFindspotService(),
    )

    await waitFor(() =>
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: EXCAVATION_AREA_FILL_LAYER_ID }),
      ),
    )
    await waitFor(() =>
      expect(mockSetLayoutProperty).toHaveBeenCalledWith(
        EXCAVATION_AREA_FILL_LAYER_ID,
        'visibility',
        'visible',
      ),
    )
    mockQueryRenderedFeatures.mockReturnValue([{ id: POLYGON_ID }])

    act(() => {
      triggerMapEvent(
        'click',
        { point: { x: 10, y: 20 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
    })

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        `selected=area%3A${POLYGON_ID}`,
      ),
    )
    expect(mockSetLayoutProperty).toHaveBeenCalled()
    const showSelectedArea = await screen.findByRole('button', {
      name: 'Show selected area',
    })

    await userEvent.click(showSelectedArea)

    expect(
      screen.getAllByRole('region', { name: 'Selected excavation area' }),
    ).toHaveLength(1)
    expect(
      await screen.findByText('3 accessible fragments across 1 findspot.'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(
      screen.queryByRole('region', { name: 'Selected excavation area' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('current-location')).not.toHaveTextContent(
      'selected=',
    )
    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      { layers: [EXCAVATION_AREA_FILL_LAYER_ID] },
    )
    expect(mockAddLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: EXCAVATION_AREA_SELECTED_LAYER_ID }),
    )
  })
})
