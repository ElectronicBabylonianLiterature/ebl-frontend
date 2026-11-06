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

describe('MapTab measurement interaction ownership', () => {
  const clusterIdProperty = 'cluster_id'
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
  })

  it('measures a click without expanding clusters or selecting areas', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    mockCanvas.style.cursor = 'pointer'
    await userEvent.click(
      await screen.findByRole('button', { name: 'Measure' }),
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
        { point: { x: 10, y: 20 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
    })

    expect(
      within(screen.getByRole('region', { name: 'Measure' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('Add 1 more point.')
    expect(mockGetClusterExpansionZoom).not.toHaveBeenCalled()
    expect(mockEaseTo).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'Selected area' }),
    ).not.toBeInTheDocument()
  })
})

it('clears keyboard-added points before Escape dismisses the measurement drawer', async () => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
  renderMapTab(makeFragmentService([makeProvenance()]))
  await userEvent.click(await screen.findByRole('button', { name: 'Measure' }))
  await userEvent.click(
    screen.getByRole('button', { name: 'Add point at map center' }),
  )
  const addPoint = screen.getByRole('button', {
    name: 'Add point at map center',
  })
  const undoPoint = screen.getByRole('button', { name: 'Undo point' })
  expect(addPoint).toHaveFocus()
  expect(undoPoint).toBeEnabled()
  expect(
    within(screen.getByRole('region', { name: 'Measure' })).getByRole('status'),
  ).toHaveTextContent('Add 1 more point.')
  await userEvent.keyboard('{Escape}')
  expect(
    within(screen.getByRole('region', { name: 'Measure' })).getByRole('status'),
  ).toHaveTextContent('Select points on the map to measure a distance.')
  expect(addPoint).toHaveFocus()
  expect(undoPoint).toBeDisabled()
  await userEvent.keyboard('{Escape}')
  expect(
    screen.queryByRole('region', { name: 'Measure' }),
  ).not.toBeInTheDocument()
})
