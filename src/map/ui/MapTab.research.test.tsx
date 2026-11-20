import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import fs from 'fs'
import path from 'path'
import {
  CURRENT_LOCATION_TEST_ID,
  failMapConstruction,
  mockFitBounds,
  makeFragmentService,
  makeProvenance,
  mockEaseTo,
  mockQueryRenderedFeatures,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/maplibre/mapCamera'

jest.mock('maplibre-gl')
const ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)
beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponseOnce(ASSET)
})

it('opens site details from keyboard controls, frames the site and restores focus on Escape', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  const inspect = await screen.findByRole('button', { name: 'Inspect Babylon' })
  inspect.focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(
    within(screen.getByRole('region', { name: 'Location details' })).getByRole(
      'heading',
    ),
  ).toHaveFocus()
  expect(inspect).toHaveAttribute('aria-pressed', 'true')
  expect(mockEaseTo).toHaveBeenCalledWith(expect.objectContaining({ zoom: 14 }))
  await userEvent.keyboard('{Escape}')
  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(inspect).toHaveFocus()
  expect(inspect).toHaveAttribute('aria-pressed', 'false')
})

it('restores search focus if the original inspector trigger disappears', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  const inspect = await screen.findByRole('button', { name: 'Inspect Babylon' })
  await userEvent.click(inspect)
  inspect.remove()
  await userEvent.click(
    screen.getByRole('button', { name: 'Close location details' }),
  )
  expect(screen.getByLabelText('Search sites')).toHaveFocus()
})

it('allows inspection of sites without coordinates while leaving the map available', async () => {
  renderMapTab(
    makeFragmentService([makeProvenance({ coordinates: undefined })]),
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Inspect Babylon' }),
  )
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(
    screen.getByRole('region', { name: 'Interactive findspot map' }),
  ).toBeVisible()
  expect(screen.getByText('0 map markers')).toBeVisible()
})

it('keeps search, layers and selected research context when resetting all camera axes', async () => {
  renderMapTab(
    makeFragmentService([makeProvenance()]),
    '/tools/map?mv=1&findspot=Babylon&areas=1&source=archive',
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Inspect Babylon' }),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Reset view' }))
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(screen.getByLabelText('Excavation areas')).toBeChecked()
  expect(screen.getByTestId(CURRENT_LOCATION_TEST_ID)).toHaveTextContent(
    'findspot=Babylon&areas=1&source=archive',
  )
  expect(mockEaseTo).toHaveBeenLastCalledWith({
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    bearing: 0,
    pitch: 0,
  })
})

it('updates marker selection from the map and clears it when search changes', async () => {
  const provenance = makeProvenance()
  renderMapTab(makeFragmentService([provenance]))
  await screen.findByRole('button', { name: 'Inspect Babylon' })
  mockQueryRenderedFeatures.mockReturnValueOnce([]).mockReturnValueOnce([
    {
      properties: {
        id: provenance.id,
        name: 'Babylon',
        abbreviation: 'BAB',
        geometryType: 'point',
      },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    },
  ])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  expect(
    screen.getByRole('button', { name: 'Inspect Babylon' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await userEvent.type(screen.getByLabelText('Search sites'), 'Uruk')
  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(screen.getByText('No findspots match “Uruk”.')).toBeVisible()
})

it('opens excavation details and closes to search after a canvas click', async () => {
  const first = JSON.parse(ASSET).features[0]
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByRole('combobox', { name: 'Inspect excavation area' })
  mockQueryRenderedFeatures
    .mockReturnValueOnce([])
    .mockReturnValueOnce([])
    .mockReturnValueOnce([first])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  const inspector = screen.getByRole('region', { name: 'Location details' })
  expect(
    within(inspector).getByRole('heading', { name: first.properties.name }),
  ).toBeVisible()
  expect(within(inspector).getByText('Excavation area')).toBeVisible()
  fireEvent.keyDown(inspector, { key: 'Escape' })
  expect(screen.getByLabelText('Search sites')).toHaveFocus()
})

it('provides keyboard access to canonical excavation areas and restores selector focus', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  const select = await screen.findByRole('combobox', {
    name: 'Inspect excavation area',
  })
  const first = JSON.parse(ASSET).features[0]
  await userEvent.selectOptions(select, first.properties.id)
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(select).toHaveValue(first.properties.id)
  expect(select).toHaveFocus()
  expect(
    screen.getByText(`Showing details for ${first.properties.name}.`),
  ).toHaveAttribute('role', 'status')
  const second = JSON.parse(ASSET).features[1]
  await userEvent.selectOptions(select, second.properties.id)
  expect(select).toHaveFocus()
  expect(
    within(screen.getByRole('region', { name: 'Location details' })).getByRole(
      'heading',
      { name: second.properties.name },
    ),
  ).toBeVisible()
  expect(
    screen.getByText(`Showing details for ${second.properties.name}.`),
  ).toHaveAttribute('role', 'status')
  fireEvent.keyDown(select, { key: 'Escape' })
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  await userEvent.click(
    screen.getByRole('button', { name: 'Close location details' }),
  )
  expect(select).toHaveFocus()
  expect(screen.queryByText(/^Showing details for /)).not.toBeInTheDocument()
})

it('keeps an honest empty inspector if a selected marker has no current provenance', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByRole('button', { name: 'Inspect Babylon' })
  mockQueryRenderedFeatures.mockReturnValueOnce([]).mockReturnValueOnce([
    {
      properties: {
        id: 'removed-site',
        name: 'Unavailable site',
        abbreviation: 'U',
        geometryType: 'point',
      },
      geometry: { type: 'Point', coordinates: [44, 32] },
    },
  ])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  const inspector = screen.getByRole('region', { name: 'Location details' })
  expect(
    within(inspector).getByText(
      'The selected location is not available in the current site list.',
    ),
  ).toBeVisible()
  expect(within(inspector).queryByRole('link')).not.toBeInTheDocument()
})

it('omits stale polygon details rather than substituting another excavation area', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByRole('combobox', { name: 'Inspect excavation area' })
  mockQueryRenderedFeatures
    .mockReturnValueOnce([])
    .mockReturnValueOnce([])
    .mockReturnValueOnce([
      {
        properties: { id: 'unknown-polygon' },
        geometry: { type: 'Polygon', coordinates: [] },
      },
    ])
  act(() => triggerMapEvent('click', { point: { x: 10, y: 20 } }))
  expect(
    screen.getByText(
      'The selected location is not available in the current site list.',
    ),
  ).toBeVisible()
})

it('keeps excavation inspection available when WebGL cannot construct the map', async () => {
  failMapConstruction(new Error('WebGL unavailable'))
  renderMapTab(makeFragmentService([makeProvenance()]))
  const select = await screen.findByRole('combobox', {
    name: 'Inspect excavation area',
  })
  const first = JSON.parse(ASSET).features[0]
  await userEvent.selectOptions(select, first.properties.id)
  const inspector = screen.getByRole('region', { name: 'Location details' })
  expect(
    within(inspector).getByRole('heading', { name: first.properties.name }),
  ).toBeVisible()
  expect(within(inspector).getByText('Excavation area')).toBeVisible()
  expect(mockFitBounds).not.toHaveBeenCalled()
})
