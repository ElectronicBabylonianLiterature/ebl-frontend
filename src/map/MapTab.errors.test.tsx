import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  deferMapLoad,
  makeFragmentService,
  makeProvenance,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/MapTab.testHelpers'
import { MAP_STYLE_URL } from 'map/mapBackgroundError'

jest.mock('maplibre-gl')

const BACKGROUND_WARNING = /The interactive map could not be loaded/

describe('MapTab map errors', () => {
  beforeEach(resetMapMocks)

  it('shows a user-visible warning when the style document fails to load', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const input = await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', {
        error: {
          url: MAP_STYLE_URL,
          message: `AJAXError: Not Found (404): ${MAP_STYLE_URL}`,
        },
      })
    })

    expect(screen.getByText(BACKGROUND_WARNING)).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Interactive findspot map' }),
    ).toBeInTheDocument()

    await userEvent.type(input, 'Bab')
    expect(screen.getByRole('link', { name: 'Babylon' })).toBeInTheDocument()
  })

  it('shows a warning for an unresolvable style request before the style has ever loaded', async () => {
    deferMapLoad()
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', { error: { message: 'Failed to fetch' } })
    })

    expect(screen.getByText(BACKGROUND_WARNING)).toBeInTheDocument()
  })

  it('ignores a tile failure', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', {
        error: { url: `${MAP_STYLE_URL}/../0/0/0.pbf`, message: 'Not Found' },
        sourceId: 'ebl-findspots',
        tile: {},
      })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('ignores a sprite failure', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
          message: 'Not Found',
        },
      })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('ignores a generic error once the style has already loaded', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', { error: { message: 'Failed to fetch' } })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('ignores map errors without a nested error object', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByPlaceholderText('Filter by site name...')

    act(() => {
      triggerMapEvent('error', { sourceId: 'ebl-findspots' })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })
})
