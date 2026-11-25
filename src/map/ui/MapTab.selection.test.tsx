import fs from 'fs'
import path from 'path'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  makeFragmentService,
  makeProvenance,
  mockAddLayer,
  mockQueryRenderedFeatures,
  mockSetLayoutProperty,
  mockSetFeatureState,
  mockGetSource,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/maplibre/mapExcavationLayers'
import { findspotMapDataDto } from 'test-support/map-fixtures'

jest.mock('maplibre-gl')

const POLYGON_ID = 'assur-bb6i-3d76dc1e02af'
const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)

function makeFindspotService(): FindspotService {
  return {
    fetchMapData: jest.fn((siteId: string) =>
      Promise.resolve(
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
    mockGetSource.mockImplementation((sourceId: string) =>
      sourceId === 'excavation-areas' ? {} : undefined,
    )
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
      screen.queryByRole('region', { name: 'Location details' }),
    ).not.toBeInTheDocument()
  })

  it('stores a canonical click, highlights it, and opens one evidence inspector', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
      makeFindspotService(),
    )

    await waitFor(() =>
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: EXCAVATION_AREA_FILL_LAYER_ID }),
        'excavation-area-outline',
      ),
    )
    await waitFor(() =>
      expect(mockSetLayoutProperty).toHaveBeenCalledWith(
        EXCAVATION_AREA_FILL_LAYER_ID,
        'visibility',
        'visible',
      ),
    )
    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{ properties: { id: POLYGON_ID } }])

    act(() => {
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent(
        `selected=area%3A${POLYGON_ID}`,
      ),
    )
    expect(mockSetLayoutProperty).toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))
    expect(
      within(screen.getByRole('region', { name: 'Selected area' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('3 accessible tablets across 1 findspot.')

    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
    expect(screen.getByRole('link', { name: 'Area A' })).toHaveAttribute(
      'href',
      '/library/search?findspotId=7',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Close location details' }),
    )

    expect(
      screen.queryByRole('region', { name: 'Location details' }),
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText('Search sites')).toHaveFocus(),
    )
    expect(screen.getByTestId('current-location')).not.toHaveTextContent(
      'selected=',
    )
    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(
      { x: 10, y: 20 },
      { layers: [EXCAVATION_AREA_FILL_LAYER_ID] },
    )
    expect(mockSetFeatureState).toHaveBeenCalledWith(
      { source: 'excavation-areas', id: POLYGON_ID },
      { selected: true },
    )
  })

  it('shows linked tablets for a deep-linked area even when excavation rendering is off', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      `/tools/map?mv=1&areas=0&selected=area%3A${POLYGON_ID}`,
      makeFindspotService(),
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Selected area' }),
    )
    expect(
      within(screen.getByRole('region', { name: 'Selected area' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('3 accessible tablets across 1 findspot.')
    expect(screen.getByLabelText('Excavation areas')).not.toBeChecked()
    expect(
      screen.getByRole('combobox', { name: 'Inspect excavation area' }),
    ).toHaveValue(POLYGON_ID)
  })

  it('retains selector focus while showing honest linked-data failures in the sidebar', async () => {
    const findspotService = {
      fetchMapData: jest.fn().mockRejectedValue(new Error('offline')),
    } as unknown as FindspotService
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map',
      findspotService,
    )
    const select = await screen.findByRole('combobox', {
      name: 'Inspect excavation area',
    })
    await userEvent.selectOptions(select, POLYGON_ID)
    await waitFor(() => expect(findspotService.fetchMapData).toHaveBeenCalled())
    expect(select).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))
    await waitFor(() =>
      expect(
        within(screen.getByRole('region', { name: 'Selected area' })).getByRole(
          'status',
        ),
      ).toHaveTextContent('Linked tablet data is unavailable right now.'),
    )
    expect(screen.queryByText(/0 accessible tablets/)).not.toBeInTheDocument()
  })
})
