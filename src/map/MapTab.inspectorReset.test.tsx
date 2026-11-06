import fs from 'fs'
import path from 'path'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
  mockQueryRenderedFeatures,
  triggerMapEvent,
} from 'map/MapTab.testSupport'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapExcavationLayers'
import { findspotMapDataDto } from 'test-support/map-fixtures'

jest.mock('maplibre-gl')

it('resets expanded findspots and the active inspector tab when a different area is selected', async () => {
  resetMapMocks()
  fetchMock.resetMocks()
  fetchMock.mockResponse(
    fs.readFileSync(
      path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
      'utf8',
    ),
  )
  const first = 'assur-bb6i-3d76dc1e02af'
  const second = 'assur-c6-1047f1e15a68'
  const service = {
    fetchMapData: (site: string) =>
      Promise.resolve(
        site === 'assur'
          ? [
              ...Array.from({ length: 11 }, (_, index) =>
                findspotMapDataDto({ findspotId: index, polygonIds: [first] }),
              ),
              ...Array.from({ length: 13 }, (_, index) =>
                findspotMapDataDto({
                  findspotId: index + 20,
                  polygonIds: [second],
                }),
              ),
            ]
          : [],
      ),
  } as unknown as FindspotService
  renderMapTab(
    makeFragmentService([makeProvenance()]),
    '/tools/map?mv=1&areas=1&selected=area%3A' + first,
    service,
  )
  await userEvent.click(
    await screen.findByRole('button', { name: 'Show selected area' }),
  )
  await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
  await userEvent.click(
    await screen.findByRole('button', { name: 'Show all 11' }),
  )
  expect(
    within(screen.getByRole('tabpanel')).getAllByRole('link'),
  ).toHaveLength(11)
  mockQueryRenderedFeatures.mockReturnValue([{ id: second }])
  act(() =>
    triggerMapEvent(
      'click',
      { point: { x: 1, y: 1 } },
      EXCAVATION_AREA_FILL_LAYER_ID,
    ),
  )
  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
  expect(
    within(screen.getByRole('tabpanel')).getAllByRole('link'),
  ).toHaveLength(10)
  expect(screen.getByRole('button', { name: 'Show all 13' })).toBeVisible()
})
