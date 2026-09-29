import fs from 'fs'
import path from 'path'
import { act, screen, waitFor, within } from '@testing-library/react'
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
  mockSetPadding,
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
jest.mock('map/useElementSize', () => () => ({ width: 320, height: 200 }))

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

  it('stores a canonical click, highlights it, and opens one evidence inspector', async () => {
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
    expect(
      await screen.findAllByRole('region', { name: 'Selected area' }),
    ).toHaveLength(1)
    expect(
      screen.queryByRole('button', { name: 'Show selected area' }),
    ).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Selected area' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('3 accessible fragments across 1 findspot.')

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear selection' }),
    )

    expect(
      screen.queryByRole('region', { name: 'Selected area' }),
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Visualization' }),
      ).toHaveFocus(),
    )
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
  it('keeps a selected-site error distinct while another site loads', async () => {
    const fetchMapData = jest.fn((siteId: string) =>
      siteId === 'assur'
        ? Bluebird.reject(new Error('Assur API unavailable'))
        : Bluebird.resolve([]),
    )
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
      { fetchMapData } as unknown as FindspotService,
    )

    await waitFor(() =>
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: EXCAVATION_AREA_FILL_LAYER_ID }),
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

    const inspector = within(
      await screen.findByRole('region', { name: 'Selected area' }),
    )
    expect(await inspector.findByRole('status')).toHaveTextContent(
      'Linked fragment data is unavailable right now.',
    )
    expect(inspector.queryByText('Mapped findspots')).not.toBeInTheDocument()
    expect(fetchMapData).toHaveBeenCalledWith('uruk')
  })
  it('closes and unpads the inspector after external navigation clears selection', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1&selected=area%3A' + POLYGON_ID,
      makeFindspotService(),
    )

    await userEvent.click(
      await screen.findByRole('button', { name: 'Show selected area' }),
    )
    expect(
      screen.getByRole('region', { name: 'Selected area' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(mockSetPadding).toHaveBeenLastCalledWith({
        top: 0,
        right: 320,
        bottom: 0,
        left: 0,
      }),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Navigate without selection' }),
    )

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Selected area' }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByTestId('current-location')).not.toHaveTextContent(
      'selected=',
    )
    expect(screen.getByRole('button', { name: 'Visualization' })).toHaveFocus()
    expect(mockSetPadding).toHaveBeenLastCalledWith({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })
})
