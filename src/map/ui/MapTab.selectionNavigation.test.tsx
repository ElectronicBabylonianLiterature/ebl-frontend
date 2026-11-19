import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import fetchMock from 'jest-fetch-mock'
import fs from 'fs'
import path from 'path'
import ErrorReporterContext from 'ErrorReporterContext'
import MapTab from 'map/ui/MapTab'
import {
  makeFragmentService,
  makeProvenance,
  mockErrorReporter,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

const ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)
const FIRST_AREA_ID = JSON.parse(ASSET).features[0].properties.id

function HistoryControls(): JSX.Element {
  const navigate = useNavigate()
  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Forward
      </button>
    </>
  )
}

function renderHistory(
  entries = [
    '/tools/map?findspot=Uruk&areas=0',
    '/tools/map?findspot=Babylon&areas=1',
  ],
): void {
  const service = makeFragmentService([
    makeProvenance({ id: 'babylon', longName: 'Babylon' }),
    makeProvenance({ id: 'uruk', longName: 'Uruk' }),
  ])
  render(
    <ErrorReporterContext.Provider value={mockErrorReporter}>
      <MemoryRouter initialEntries={entries}>
        <MapTab fragmentService={service} />
        <HistoryControls />
      </MemoryRouter>
    </ErrorReporterContext.Provider>,
  )
}

beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponseOnce(ASSET)
})

it('clears inspected sites on Back and Forward and restores search focus when their inspector disappears', async () => {
  renderHistory()
  fireEvent.click(
    await screen.findByRole('button', { name: 'Inspect Babylon' }),
  )
  expect(
    within(screen.getByRole('region', { name: 'Location details' })).getByRole(
      'heading',
    ),
  ).toHaveFocus()

  fireEvent.click(screen.getByRole('button', { name: 'Back' }))

  expect(
    await screen.findByRole('button', { name: 'Inspect Uruk' }),
  ).toBeVisible()
  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(screen.getByLabelText('Search sites')).toHaveFocus()
  expect(screen.getByLabelText('Excavation areas')).not.toBeChecked()

  fireEvent.click(screen.getByRole('button', { name: 'Inspect Uruk' }))
  fireEvent.click(screen.getByRole('button', { name: 'Forward' }))

  expect(
    await screen.findByRole('button', { name: 'Inspect Babylon' }),
  ).toBeVisible()
  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(screen.getByLabelText('Search sites')).toHaveFocus()
})

it('clears inspected areas after history changes the filter without taking focus from the area selector', async () => {
  renderHistory()
  const select = await screen.findByRole('combobox', {
    name: 'Inspect excavation area',
  })
  select.focus()
  fireEvent.change(select, { target: { value: FIRST_AREA_ID } })
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(select).toHaveFocus()

  fireEvent.click(screen.getByRole('button', { name: 'Back' }))

  await screen.findByRole('button', { name: 'Inspect Uruk' })
  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(select).toHaveValue('')
  expect(select).toHaveFocus()
})

it('keeps a site selection through Reset and history changes that only affect layers', async () => {
  renderHistory([
    '/tools/map?findspot=Babylon&areas=0',
    '/tools/map?findspot=Babylon&areas=1',
  ])
  const inspect = await screen.findByRole('button', { name: 'Inspect Babylon' })
  fireEvent.click(inspect)
  fireEvent.click(screen.getByRole('button', { name: 'Reset view' }))
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()

  fireEvent.click(screen.getByRole('button', { name: 'Back' }))

  expect(screen.getByLabelText('Excavation areas')).not.toBeChecked()
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
  expect(inspect).toHaveAttribute('aria-pressed', 'true')
})

it('clears selection on typed search changes while keeping focus in the search input', async () => {
  renderHistory(['/tools/map'])
  fireEvent.click(
    await screen.findByRole('button', { name: 'Inspect Babylon' }),
  )
  const search = screen.getByLabelText('Search sites')

  await userEvent.type(search, 'Uruk')

  expect(
    screen.queryByRole('region', { name: 'Location details' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Inspect Uruk' })).toBeVisible()
  expect(search).toHaveValue('Uruk')
  expect(search).toHaveFocus()
})
