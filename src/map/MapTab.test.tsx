import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import { findspotMapData, provenanceRecord } from 'test-support/map-fixtures'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
} from './mapLayers'

const babylon = provenanceRecord()
const assur = provenanceRecord({
  id: 'assur',
  longName: 'Aššur',
  abbreviation: 'Aš',
  sortKey: 2,
  coordinates: { latitude: 35.45, longitude: 43.26 },
})

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

async function flushPendingRequests(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

async function mountMapTab(
  harness: Parameters<typeof renderMapTab>[0] = {},
): Promise<void> {
  renderMapTab({ provenances: [babylon, assur], ...harness })
  await screen.findByLabelText('Findspot map')
  await flushPendingRequests()
  act(() => lastMapMock().emit('load'))
}

describe('loading and error states', () => {
  it('shows a spinner until provenances resolve', async () => {
    renderMapTab({ provenances: [babylon] })

    expect(screen.getByText('Loading map data...')).toBeInTheDocument()
    await flushPendingRequests()
  })

  it('shows an error when provenances fail to load', async () => {
    renderMapTab({ provenanceError: 'Network error' })

    expect(
      await screen.findByText('Failed to load map data: Network error'),
    ).toBeInTheDocument()
    await flushPendingRequests()
  })

  it('does not set state after unmounting', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    const { unmount } = renderMapTab({ provenances: [babylon] })
    unmount()
    await act(async () => undefined)

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

describe('map shell', () => {
  it('renders the atlas shell and a navigation control', async () => {
    await mountMapTab()

    expect(
      screen.getByRole('heading', { name: 'Archaeological atlas' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Legend' })).toBeInTheDocument()
    expect(lastMapMock().controls).toHaveLength(1)
  })

  it('creates polygon, excavation and point sources on load', async () => {
    await mountMapTab()

    expect([...lastMapMock().sources.keys()]).toEqual([
      POLYGON_SOURCE_ID,
      EXCAVATION_AREAS_SOURCE_ID,
      SOURCE_ID,
    ])
  })

  it('filters provenances case-insensitively', async () => {
    await mountMapTab()

    await userEvent.type(screen.getByLabelText('Site name'), 'aš')

    expect(await screen.findByText('1 visible sites')).toBeInTheDocument()
  })

  it('shows an empty state when the filter matches nothing', async () => {
    await mountMapTab()

    await userEvent.type(screen.getByLabelText('Site name'), 'nowhere')

    expect(await screen.findByText(/No findspots match/)).toBeInTheDocument()
  })

  it('removes the map and its listeners on unmount', async () => {
    const { unmount } = renderMapTab({ provenances: [babylon] })
    await screen.findByLabelText('Findspot map')
    await flushPendingRequests()
    const mapMock = lastMapMock()

    unmount()

    expect(mapMock.removed).toBe(true)
    expect(mapMock.listenerCount('mousemove')).toBe(0)
  })
})

describe('site data support', () => {
  it('reports fragment data as available only for a configured site', async () => {
    await mountMapTab({ mapData: [findspotMapData()] })

    expect(
      await screen.findByText(
        'Fragment-linked excavation data is available for Aššur.',
      ),
    ).toBeInTheDocument()
  })

  it('reports unsupported sites honestly rather than as zero', async () => {
    await mountMapTab({ mapData: [findspotMapData()] })

    const unsupported = await screen.findAllByText(
      'Fragment-linked excavation data is not yet available for this site.',
    )

    expect(unsupported).toHaveLength(3)
  })

  it('reports an empty response as empty, not unavailable', async () => {
    await mountMapTab({ mapData: [] })

    expect(
      await screen.findByText('No mapped excavation fragments available'),
    ).toBeInTheDocument()
  })

  it('reports a failed map-data request as unavailable', async () => {
    await mountMapTab({ mapDataError: 'boom' })

    expect(
      await screen.findByText('Excavation fragment data unavailable'),
    ).toBeInTheDocument()
  })
})

describe('base style failures', () => {
  it('warns only when the configured style document fails', async () => {
    await mountMapTab()

    act(() =>
      lastMapMock().emit('error', {
        error: { resourceType: 'Style' },
      }),
    )

    expect(
      await screen.findByText(/The map background is unavailable/),
    ).toBeInTheDocument()
  })

  it('stays usable when a tile, sprite or glyph fails', async () => {
    await mountMapTab()

    act(() => {
      const mapMock = lastMapMock()
      mapMock.emit('error', { tile: {}, error: { resourceType: 'Tile' } })
      mapMock.emit('error', { error: { resourceType: 'SpriteJSON' } })
      mapMock.emit('error', { error: new Error('Failed to fetch') })
    })

    expect(
      screen.queryByText(/The map background is unavailable/),
    ).not.toBeInTheDocument()
  })
})
