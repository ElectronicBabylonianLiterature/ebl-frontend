import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  deferMapLoad,
  failMapConstruction,
  makeFragmentService,
  makeProvenance,
  mockCaptureException,
  renderMapTab,
  resetMapMocks,
  triggerMapEvent,
} from 'map/ui/MapTab.testSupport'
import { MAP_STYLE_URL } from 'map/maplibre/mapBackgroundError'

jest.mock('maplibre-gl')

const BACKGROUND_WARNING = /The interactive map could not be loaded/

describe('MapTab map errors', () => {
  beforeEach(resetMapMocks)

  it('shows a user-visible warning when the style document fails to load', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    const input = await screen.findByLabelText('Filter findspots by name')

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

  it('shows a warning when the style request cannot reach the network', async () => {
    deferMapLoad()
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', {
        error: {
          url: MAP_STYLE_URL,
          message: `AJAXError:  (0): ${MAP_STYLE_URL}`,
        },
      })
    })

    expect(screen.getByText(BACKGROUND_WARNING)).toBeInTheDocument()
  })

  it('stays quiet when the map is used before the style has loaded', async () => {
    deferMapLoad()
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('mousemove', { point: { x: 10, y: 20 } })
      triggerMapEvent('click', { point: { x: 10, y: 20 } })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('clears the warning once the style finishes loading', async () => {
    deferMapLoad()
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', {
        error: { url: MAP_STYLE_URL, message: 'Not Found' },
      })
    })
    expect(screen.getByText(BACKGROUND_WARNING)).toBeInTheDocument()

    act(() => {
      triggerMapEvent('load')
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('ignores a tile failure', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', {
        error: { url: `${MAP_STYLE_URL}/../0/0/0.pbf`, message: 'Not Found' },
        sourceId: 'ebl-findspots',
        tile: {},
      })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })

  it('reports a sprite failure to Sentry without showing the banner', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
          message: 'Not Found',
        },
      })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
    expect(mockCaptureException).toHaveBeenCalledWith(new Error('Not Found'))
  })

  it('reports a generic style error without showing the banner', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', { error: { message: 'Failed to fetch' } })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('Failed to fetch'),
    )
  })

  it('falls back to the findspot list when the map cannot be constructed', async () => {
    failMapConstruction(new Error('Failed to initialize WebGL'))

    renderMapTab(makeFragmentService([makeProvenance()]))

    expect(await screen.findByText(BACKGROUND_WARNING)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Babylon' })).toBeInTheDocument()
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('Failed to initialize WebGL'),
    )
  })

  it('wraps a non-Error thrown while constructing the map', async () => {
    failMapConstruction('WebGL context lost')

    renderMapTab(makeFragmentService([makeProvenance()]))

    expect(await screen.findByText(BACKGROUND_WARNING)).toBeInTheDocument()
    expect(mockCaptureException).toHaveBeenCalledWith(
      new Error('WebGL context lost'),
    )
  })

  it('ignores map errors without a nested error object', async () => {
    renderMapTab(makeFragmentService([makeProvenance()]))
    await screen.findByLabelText('Filter findspots by name')

    act(() => {
      triggerMapEvent('error', { sourceId: 'ebl-findspots' })
    })

    expect(screen.queryByText(BACKGROUND_WARNING)).not.toBeInTheDocument()
  })
})
