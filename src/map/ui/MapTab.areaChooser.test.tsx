import fs from 'fs'
import path from 'path'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import {
  makeFragmentService,
  makeProvenance,
  mockFitBounds,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')

const POLYGON_ID = 'assur-bb6i-3d76dc1e02af'
const SECOND_POLYGON_ID = 'assur-c6-1047f1e15a68'
const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)

beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
})

it('retains the native chooser and focus while inspecting, revising and clearing an area', async () => {
  renderMapTab(makeFragmentService([makeProvenance()]))
  const selector = await screen.findByRole('combobox', {
    name: 'Inspect excavation area',
  })
  await waitFor(() =>
    expect(within(selector).getAllByRole('option')).toHaveLength(295),
  )
  selector.focus()

  for (const polygonId of [POLYGON_ID, SECOND_POLYGON_ID]) {
    await userEvent.selectOptions(selector, polygonId)
    expect(selector).toHaveValue(polygonId)
    expect(selector).toHaveFocus()
    expect(
      screen.getByRole('combobox', {
        name: 'Inspect excavation area',
      }),
    ).toBe(selector)
    expect(
      screen.getByRole('region', { name: 'Location details' }),
    ).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'Location details' }),
      ).getByRole('tab', { name: 'Overview' }),
    ).toBeVisible()
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      `selected=area%3A${polygonId}`,
    )
    expect(mockFitBounds).toHaveBeenLastCalledWith(expect.any(Array), {
      padding: 40,
      maxZoom: 17,
    })
  }

  await userEvent.click(
    screen.getByRole('button', { name: 'Close location details' }),
  )
  expect(selector).toHaveFocus()
  expect(selector).toHaveValue('')
  expect(screen.getByTestId('current-location')).not.toHaveTextContent(
    'selected=',
  )

  await userEvent.selectOptions(selector, POLYGON_ID)
  expect(selector).toHaveFocus()
  expect(
    screen.queryByRole('button', { name: 'Selected area' }),
  ).not.toBeInTheDocument()
  expect(
    within(screen.getByRole('region', { name: 'Location details' })).getByRole(
      'tab',
      { name: 'Findspots' },
    ),
  ).toBeVisible()
  expect(
    screen.getByRole('combobox', { name: 'Inspect excavation area' }),
  ).toBe(selector)
})
