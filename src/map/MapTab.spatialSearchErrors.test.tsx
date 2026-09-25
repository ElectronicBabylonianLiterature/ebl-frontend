import fs from 'fs'
import path from 'path'
import { act, screen } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import userEvent from '@testing-library/user-event'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'
import {
  failMapConstruction,
  makeFragmentService,
  makeProvenance,
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

describe('MapTab tool availability', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
  })

  it('does not offer spatial search when the map cannot be constructed', async () => {
    failMapConstruction(new Error('Failed to initialize WebGL'))
    renderMapTab(makeFragmentService([makeProvenance()]))

    expect(
      await screen.findByText(/The interactive map could not be loaded/),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Search area' }),
    ).not.toBeInTheDocument()
  })

  it('closes spatial search when excavation rendering fails', async () => {
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
    renderMapTab(makeFragmentService([makeProvenance()]))
    await userEvent.click(
      await screen.findByRole('button', { name: 'Search area' }),
    )
    expect(
      screen.getByRole('region', { name: 'Search area' }),
    ).toBeInTheDocument()

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
      })
    })

    expect(
      screen.queryByRole('region', { name: 'Search area' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Search area' }),
    ).not.toBeInTheDocument()
  })

  it('exports only polygons rendered in the current viewport', async () => {
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
    mockQueryRenderedFeatures.mockReturnValue([
      { id: 'assur-bb6i-3d76dc1e02af' },
    ])
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1',
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Export' }))
    act(() => triggerMapEvent('idle'))

    expect(
      await screen.findByText(
        '1 displayed excavation area in the current map view will be exported.',
      ),
    ).toBeInTheDocument()
  })

  it('closes export when excavation rendering fails', async () => {
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
    renderMapTab(makeFragmentService([makeProvenance()]))
    await userEvent.click(await screen.findByRole('button', { name: 'Export' }))
    expect(screen.getByRole('region', { name: 'Export' })).toBeInTheDocument()

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
      })
    })

    expect(
      screen.queryByRole('region', { name: 'Export' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Export' }),
    ).not.toBeInTheDocument()
  })
})
