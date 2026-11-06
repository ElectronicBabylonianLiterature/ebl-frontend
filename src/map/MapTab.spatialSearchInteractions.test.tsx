import fs from 'fs'
import path from 'path'
import { act, screen, within } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import userEvent from '@testing-library/user-event'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  makeFragmentService,
  makeProvenance,
  mockCanvas,
  mockEaseTo,
  mockGetClusterExpansionZoom,
  mockQueryRenderedFeatures,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
  'utf8',
)

describe('MapTab spatial-search interactions', () => {
  const clusterIdProperty = 'cluster_id'
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
  })

  it('owns map clicks without expanding clusters or selecting areas', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    mockCanvas.style.cursor = 'pointer'
    await userEvent.click(
      await screen.findByRole('button', { name: 'Search area' }),
    )
    await userEvent.click(
      within(screen.getByRole('region', { name: 'Search area' })).getByRole(
        'button',
        { name: 'Draw a rectangle' },
      ),
    )
    expect(mockCanvas).toHaveStyle({ cursor: '' })

    mockQueryRenderedFeatures.mockReturnValue([
      {
        id: 'area-1',
        properties: { [clusterIdProperty]: 42 },
        geometry: { type: 'Point', coordinates: [44, 33] },
      },
    ])
    act(() => {
      triggerMapEvent('click', {
        point: { x: 10, y: 20 },
        lngLat: { lng: 44, lat: 33 },
      })
      triggerMapEvent(
        'click',
        { point: { x: 10, y: 20 }, lngLat: { lng: 44, lat: 33 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
    })

    expect(
      within(screen.getByRole('region', { name: 'Search area' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('Add corner 2 of 2.')
    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Selected area' }),
    ).not.toBeInTheDocument()
  })

  it('clears a pending rectangle across presentation mode', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await userEvent.click(
      await screen.findByRole('button', { name: 'Search area' }),
    )
    const panel = screen.getByRole('region', { name: 'Search area' })
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Draw a rectangle' }),
    )
    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })
    expect(within(panel).getByRole('status')).toHaveTextContent(
      'Add corner 2 of 2.',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Presentation mode' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Exit presentation mode' }),
    )

    expect(
      within(screen.getByRole('region', { name: 'Search area' })).getByRole(
        'status',
      ),
    ).toHaveTextContent(
      'Search excavation areas by the current view or a drawn rectangle.',
    )
  })
})
