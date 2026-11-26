import fs from 'fs'
import path from 'path'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { downloadExportCsv } from 'map/domain/mapExportDownload'
import {
  makeFragmentService,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'

jest.mock('maplibre-gl')
jest.mock('map/domain/mapExportDownload', () => ({
  downloadExportCsv: jest.fn(),
  downloadExportGeoJson: jest.fn(),
}))

it('exports the inspected area with the current research context from the sidebar', async () => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(
    fs.readFileSync(
      path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
      'utf8',
    ),
  )
  const polygonId = 'assur-bb6i-3d76dc1e02af'
  renderMapTab(
    makeFragmentService([]),
    `/tools/map?mv=1&viz=evidence&selected=area%3A${polygonId}`,
  )
  await userEvent.click(await screen.findByRole('button', { name: 'Export' }))
  const panel = within(screen.getByRole('region', { name: 'Export' }))
  expect(
    panel.getByText('The selected excavation area will be exported.'),
  ).toHaveAttribute('role', 'status')
  await userEvent.click(panel.getByRole('button', { name: 'Download CSV' }))
  expect(downloadExportCsv).toHaveBeenCalledWith(
    [expect.objectContaining({ polygonId })],
    expect.objectContaining({
      visualization: 'evidence',
      scope: { type: 'selection', polygonId },
      shareUrl: window.location.href,
    }),
  )
  await userEvent.keyboard('{Escape}')
  expect(
    screen.queryByRole('region', { name: 'Export' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Export' })).toHaveFocus()
})
