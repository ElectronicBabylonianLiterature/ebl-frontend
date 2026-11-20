import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import fs from 'fs'
import path from 'path'
import {
  makeFragmentService,
  makeProvenance,
  mockSetLayoutProperty,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/maplibre/mapExcavationLayers'

jest.mock('maplibre-gl')

const WARNING = 'Excavation areas are unavailable.'
const ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)

beforeEach(() => {
  resetMapMocks()
  fetchMock.resetMocks()
})

it('announces invalid default assets before the map without opening controls', async () => {
  fetchMock.mockResponseOnce('{"type":"FeatureCollection","features":[]}')
  renderMapTab(makeFragmentService([makeProvenance()]))
  const warning = await screen.findByText(WARNING)
  expect(screen.getByRole('alert')).toBeVisible()
  expect(
    warning.compareDocumentPosition(
      screen.getByRole('region', { name: 'Interactive findspot map' }),
    ) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(screen.getByLabelText('Excavation areas')).toBeChecked()
  expect(screen.getByRole('link', { name: 'Babylon' })).toBeVisible()
})

it('keeps source failures visible while location details are closed', async () => {
  fetchMock.mockResponseOnce(ASSET)
  renderMapTab(makeFragmentService([makeProvenance()]))
  await waitFor(() => expect(mockSetLayoutProperty).toHaveBeenCalled())
  await userEvent.click(screen.getByRole('button', { name: 'Inspect Babylon' }))
  await userEvent.click(
    screen.getByRole('button', { name: 'Close location details' }),
  )
  act(() => {
    triggerMapEvent('error', {
      sourceId: EXCAVATION_AREAS_SOURCE_ID,
      error: { message: 'unavailable' },
    })
  })
  expect(await screen.findByText(WARNING)).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Retry excavation areas' }),
  ).toBeVisible()
})

it('recovers a failed asset with Retry and restores default boundary visibility', async () => {
  fetchMock.mockRejectOnce(new Error('unavailable')).mockResponseOnce(ASSET)
  renderMapTab(makeFragmentService([makeProvenance()]))
  await screen.findByText(WARNING)
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry excavation areas' }),
  )
  await waitFor(() => {
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'excavation-area-fill',
      'visibility',
      'visible',
    )
  })
  expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(screen.getByLabelText('Excavation areas')).toBeChecked()
})

it('retains a disabled layer preference when retrying a failed asset', async () => {
  fetchMock.mockRejectOnce(new Error('unavailable')).mockResponseOnce(ASSET)
  renderMapTab(
    makeFragmentService([makeProvenance()]),
    '/tools/map?mv=1&areas=0',
  )
  await screen.findByText(WARNING)
  expect(screen.getByLabelText('Excavation areas')).not.toBeChecked()
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry excavation areas' }),
  )
  await waitFor(() =>
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'excavation-area-fill',
      'visibility',
      'none',
    ),
  )
  expect(screen.getByLabelText('Excavation areas')).not.toBeChecked()
})
