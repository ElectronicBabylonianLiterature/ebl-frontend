import fs from 'fs'
import path from 'path'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
} from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

const POLYGON_ID = 'assur-bb6i-3d76dc1e02af'
const SECOND_POLYGON_ID = 'assur-c6-1047f1e15a68'
const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
  'utf8',
)

beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
})

it('retains the chooser and focus for selection, revision and clearing until View area is activated', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  await userEvent.click(
    await screen.findByRole('button', { name: 'Map layers' }),
  )
  const selector = screen.getByRole('combobox', {
    name: 'Select excavation area',
  })
  await waitFor(() =>
    expect(within(selector).getAllByRole('option')).toHaveLength(295),
  )
  const viewButton = screen.getByRole('button', { name: 'View area' })
  expect(viewButton).toBeDisabled()
  selector.focus()

  for (const polygonId of [POLYGON_ID, SECOND_POLYGON_ID]) {
    await userEvent.selectOptions(selector, polygonId)
    expect(selector).toHaveValue(polygonId)
    expect(selector).toHaveFocus()
    expect(
      screen.getByRole('combobox', { name: 'Select excavation area' }),
    ).toBe(selector)
    expect(
      screen.getByRole('region', { name: 'Map layers' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Selected area' }),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      `selected=area%3A${polygonId}`,
    )
    expect(viewButton).toBeEnabled()
  }

  await userEvent.selectOptions(selector, '')
  expect(selector).toHaveFocus()
  expect(selector).toHaveValue('')
  expect(viewButton).toBeDisabled()
  expect(screen.getByRole('region', { name: 'Map layers' })).toBeInTheDocument()
  expect(screen.getByTestId('current-location')).not.toHaveTextContent(
    'selected=',
  )

  await userEvent.selectOptions(selector, POLYGON_ID)
  await userEvent.tab()
  expect(viewButton).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  expect(
    screen.getByRole('region', { name: 'Selected area' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Close Selected area' }),
  ).toHaveFocus()
  expect(
    screen.queryByRole('combobox', { name: 'Select excavation area' }),
  ).not.toBeInTheDocument()
})
