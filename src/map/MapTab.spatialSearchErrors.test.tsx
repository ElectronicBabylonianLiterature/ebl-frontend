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
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
  'utf8',
)

describe('MapTab spatial-search availability', () => {
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
})
