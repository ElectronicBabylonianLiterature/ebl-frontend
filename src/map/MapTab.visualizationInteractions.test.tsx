import fs from 'fs'
import path from 'path'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  makeFragmentService,
  mockSetFeatureState,
  mockSetPaintProperty,
  mockGetSource,
  renderMapTab,
  resetMapMocks,
} from 'map/MapTab.testSupport'
import { findspotMapDataDto } from 'test-support/map-fixtures'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapLayerIds'

jest.mock('maplibre-gl')

it('switches visualization through its drawer and keeps URL, legend and feature state consistent', async () => {
  resetMapMocks()
  mockGetSource.mockImplementation((sourceId: string) =>
    sourceId === EXCAVATION_AREAS_SOURCE_ID ? {} : undefined,
  )
  fetchMock.resetMocks()
  fetchMock.mockResponse(
    fs.readFileSync(
      path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
      'utf8',
    ),
  )
  const polygonId = 'assur-bb6i-3d76dc1e02af'
  const service = {
    fetchMapData: jest.fn((siteId: string) =>
      Promise.resolve(
        siteId === 'assur'
          ? [
              findspotMapDataDto({
                polygonIds: [polygonId],
                accessibleFragmentCount: 3,
              }),
            ]
          : [],
      ),
    ),
  } as unknown as FindspotService
  renderMapTab(makeFragmentService([]), '/tools/map?mv=1&areas=1', service)
  const visualization = await screen.findByRole('button', {
    name: 'Visualization',
  })
  await userEvent.click(visualization)
  await waitFor(() =>
    expect(mockSetFeatureState).toHaveBeenCalledWith(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
      expect.objectContaining({
        dataAvailable: true,
        accessibleFragmentCount: 3,
      }),
    ),
  )
  const selector = screen.getByLabelText('Visualize')
  await userEvent.selectOptions(selector, 'count')
  expect(screen.getByTestId('current-location')).toHaveTextContent('viz=count')
  expect(selector).toHaveValue('count')
  expect(
    screen.getByRole('list', { name: 'Map legend classes' }),
  ).toHaveTextContent('3')
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'fill-color',
    expect.any(Array),
  )
  await userEvent.selectOptions(selector, 'evidence')
  expect(screen.getByTestId('current-location')).toHaveTextContent(
    'viz=evidence',
  )
  expect(
    screen.getByRole('list', { name: 'Map legend classes' }),
  ).toHaveTextContent('Verified-source mapping')
  await userEvent.click(screen.getByRole('button', { name: 'Legend' }))
  expect(
    within(
      screen.getByRole('region', { name: 'Map legend details' }),
    ).getByText('Mapping evidence source'),
  ).toBeVisible()
})
