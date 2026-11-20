import fs from 'fs'
import path from 'path'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import type { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
} from 'map/ui/MapTab.testSupport'
import { findspotMapDataDto } from 'test-support/map-fixtures'

jest.mock('maplibre-gl')

const POLYGON_ID = 'assur-bb6i-3d76dc1e02af'

it('keeps the map tools ahead of a dense linked-tablet inspector in keyboard order', async () => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(
    fs.readFileSync(
      path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
      'utf8',
    ),
  )
  const service = {
    fetchMapData: (siteId: string) =>
      Promise.resolve(
        siteId === 'assur'
          ? Array.from({ length: 30 }, (_, index) =>
              findspotMapDataDto({
                findspotId: index + 1,
                polygonIds: [POLYGON_ID],
              }),
            )
          : [],
      ),
  } as unknown as FindspotService
  renderMapTab(
    makeFragmentService([makeProvenance()]),
    '/tools/map?mv=1&selected=area%3A' + POLYGON_ID,
    service,
  )
  expect(
    await screen.findByText('60 accessible tablets across 30 findspots.'),
  ).toBeVisible()
  expect(
    within(screen.getByRole('region', { name: 'Linked tablets' })).getAllByRole(
      'link',
    ),
  ).toHaveLength(30)
  expect(
    screen.queryByRole('button', { name: 'Show selected area' }),
  ).not.toBeInTheDocument()
  screen.getByRole('button', { name: 'Legend' }).focus()
  for (const label of [
    'Selected area',
    'Visualization',
    'Measure',
    'Search area',
  ]) {
    await userEvent.tab()
    expect(screen.getByRole('button', { name: label })).toHaveFocus()
  }
  await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))
  expect(screen.getByRole('region', { name: 'Selected area' })).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Close Selected area' }),
  ).toHaveFocus()
  expect(screen.getByRole('tab', { name: 'Findspots' })).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Show selected area' }),
  ).not.toBeInTheDocument()
})
