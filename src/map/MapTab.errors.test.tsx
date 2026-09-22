import fs from 'fs'
import path from 'path'
import { act, screen, waitFor } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
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
} from 'map/MapTab.testSupport'
import { MAP_STYLE_URL } from 'map/mapBackgroundError'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'

jest.mock('maplibre-gl')

const BACKGROUND_WARNING = /The interactive map could not be loaded/
const EXCAVATION_WARNING = 'Excavation areas are unavailable.'
const CANONICAL_POLYGON_ASSET = fs.readFileSync(
  path.resolve(__dirname, '../../public/map-data/findspots/all.geojson'),
  'utf8',
)

async function openLayerControls(): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Map layers' }),
  )
}

describe('MapTab map errors', () => {
  beforeEach(() => {
    resetMapMocks()
    fetchMock.resetMocks()
  })

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

  it('shows an unavailable state when the polygon index fails', async () => {
    fetchMock.mockRejectOnce(new Error('asset unavailable'))

    renderMapTab(makeFragmentService([makeProvenance()]))

    expect(await screen.findByText(EXCAVATION_WARNING)).toBeInTheDocument()
    await openLayerControls()
    expect(screen.getByLabelText('Excavation areas')).toBeDisabled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Presentation mode' }),
    )
    expect(screen.getByText(EXCAVATION_WARNING)).toBeInTheDocument()
  })

  it('shows an unavailable state for a malformed HTTP-200 asset', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ type: 'FeatureCollection', features: [] }),
    )

    renderMapTab(makeFragmentService([makeProvenance()]))

    expect(await screen.findByText(EXCAVATION_WARNING)).toBeInTheDocument()
    await openLayerControls()
    expect(screen.getByLabelText('Excavation areas')).toBeDisabled()
  })

  it('shows an unavailable state when the rendered polygon source fails', async () => {
    fetchMock.mockResponseOnce(CANONICAL_POLYGON_ASSET)
    renderMapTab(makeFragmentService([makeProvenance()]))
    await openLayerControls()

    await waitFor(() =>
      expect(screen.getByLabelText('Excavation areas')).toBeEnabled(),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Visualization' }))
    expect(
      screen.getByRole('region', { name: 'Map visualization' }),
    ).toBeInTheDocument()

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
      })
    })

    expect(screen.getByText(EXCAVATION_WARNING)).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Map visualization' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Visualization' }),
    ).not.toBeInTheDocument()
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
