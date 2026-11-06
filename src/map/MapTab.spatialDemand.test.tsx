import fs from 'fs'
import path from 'path'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { makeFragmentService, makeProvenance, renderMapTab, resetMapMocks } from 'map/MapTab.testSupport'

jest.mock('maplibre-gl')

it('requests scoped counts on spatial-search demand while excavation fills stay off', async () => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(fs.readFileSync(path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'), 'utf8'))
  const fetchMapData = jest.fn(() => Promise.resolve([]))
  renderMapTab(makeFragmentService([makeProvenance()]), { fetchMapData } as unknown as FindspotService)
  const button = await screen.findByRole('button', { name: 'Search area' })
  expect(fetchMapData).not.toHaveBeenCalled()
  await userEvent.click(button)
  await waitFor(() => expect(fetchMapData).toHaveBeenCalledTimes(4))
  expect(screen.getByTestId('current-location')).not.toHaveTextContent('areas=1')
})
