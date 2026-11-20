import fs from 'fs'
import path from 'path'
import { act, screen, within } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import userEvent from '@testing-library/user-event'
import {
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { MAP_STYLE_URL } from 'map/maplibre/mapBackgroundError'

jest.mock('maplibre-gl')

const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../../public/map-data/findspots/all.geojson'),
  'utf8',
)

describe('MapTab research workspace', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
    fetchMock.mockResponse(CANONICAL_POLYGON_ASSET)
  })

  it('keeps the active tool beside the map in the research sidebar', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const sidebar = await screen.findByRole('complementary', {
      name: 'Site research',
    })
    await userEvent.click(
      within(sidebar).getByRole('button', { name: 'Measure' }),
    )

    expect(
      within(sidebar).getByRole('region', { name: 'Measure' }),
    ).toBeVisible()
    expect(
      within(
        screen.getByRole('region', { name: 'Interactive findspot map' }),
      ).queryByRole('region', { name: 'Measure' }),
    ).not.toBeInTheDocument()
  })

  it('restores focus after closing a tool with its button or Escape', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const measure = await screen.findByRole('button', { name: 'Measure' })
    await userEvent.click(measure)
    const close = screen.getByRole('button', { name: 'Close Measure' })
    expect(close).toHaveFocus()
    await userEvent.click(close)
    expect(measure).toHaveFocus()
    await userEvent.click(measure)
    await userEvent.keyboard('{Escape}')
    expect(
      screen.queryByRole('region', { name: 'Measure' }),
    ).not.toBeInTheDocument()
    expect(measure).toHaveFocus()
  })

  it('describes the map and the available sidebar searches accurately', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const region = await screen.findByRole('region', {
      name: 'Interactive findspot map',
    })
    expect(region).toHaveAccessibleDescription(
      'Explore mapped sites and excavation areas. Site details and Library searches are available beside or below the map.',
    )
    expect(
      screen.getByRole('complementary', { name: 'Site research' }),
    ).toBeVisible()
  })

  it('keeps the active visualization legend available while a tool is open', async () => {
    renderMapTab(
      makeFragmentService([makeProvenance()]),
      '/tools/map?mv=1&areas=1&viz=evidence',
    )
    const legend = await screen.findByRole('button', { name: 'Legend' })
    await userEvent.click(screen.getByRole('button', { name: 'Measure' }))
    await userEvent.click(legend)
    expect(
      screen.getByRole('region', { name: 'Map legend details' }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'Measure' })).toBeVisible()
  })

  it('clears a temporary measurement when its tool is closed', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await userEvent.click(
      await screen.findByRole('button', { name: 'Measure' }),
    )
    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })
    expect(
      within(screen.getByRole('region', { name: 'Measure' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('Add 1 more point.')
    await userEvent.click(screen.getByRole('button', { name: 'Close Measure' }))
    await userEvent.click(screen.getByRole('button', { name: 'Measure' }))
    expect(
      within(screen.getByRole('region', { name: 'Measure' })).getByRole(
        'status',
      ),
    ).toHaveTextContent('Select points on the map to measure a distance.')
  })

  it('keeps site research available after a map background failure', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByRole('button', { name: 'Measure' })
    await act(async () => {
      triggerMapEvent('error', {
        error: { url: MAP_STYLE_URL, message: 'Not Found' },
      })
    })
    expect(
      screen.getByText(
        'The map background is unavailable. You can still browse sites and use Library links.',
      ),
    ).toBeVisible()
    expect(
      screen.getByRole('complementary', { name: 'Site research' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Measure' }),
    ).not.toBeInTheDocument()
  })
})
