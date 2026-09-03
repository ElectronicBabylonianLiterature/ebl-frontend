import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import { findspotMapData, provenanceRecord } from 'test-support/map-fixtures'
import {
  excavationAreaFillLayer,
  historicalRasterLayerId,
  historicalRasterSourceId,
  unclusteredLayer,
} from './mapLayers'
import { validatedHistoricalMapOverlays } from './historicalOverlays'
import { historicalOverlayLabel } from './historicalOverlays'

const assurOverlay = validatedHistoricalMapOverlays.find(
  (overlay) => overlay.siteId === 'assur',
)!
const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })
const manyFindspots = Array.from({ length: 8 }, (_entry, index) =>
  findspotMapData({
    findspotId: 100 + index,
    polygonIds: ['assur-area-a-checksum'],
  }),
)

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

async function mountMapTab(mapData = [findspotMapData()]): Promise<MapMock> {
  renderMapTab({ provenances: [assur], mapData })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
  return lastMapMock()
}

async function openLayerPanel(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Layers' }))
}

describe('historical overlay controls', () => {
  it('activates an overlay from the catalogue and creates its layer', async () => {
    const mapMock = await mountMapTab()
    await openLayerPanel()
    await userEvent.type(
      screen.getByLabelText('Search historical maps'),
      assurOverlay.title,
    )

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: historicalOverlayLabel(assurOverlay),
      }),
    )

    expect(
      mapMock.getSource(historicalRasterSourceId(assurOverlay.id)),
    ).toBeDefined()
    expect(
      mapMock.getLayer(historicalRasterLayerId(assurOverlay.id)),
    ).toBeDefined()
  })

  it('clears every active overlay', async () => {
    const mapMock = await mountMapTab()
    await openLayerPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Clear maps' }))

    expect(
      mapMock.getLayer(historicalRasterLayerId(assurOverlay.id)),
    ).toBeUndefined()
  })

  it('zooms to the active overlays', async () => {
    const mapMock = await mountMapTab()
    await openLayerPanel()
    await userEvent.type(
      screen.getByLabelText('Search historical maps'),
      assurOverlay.title,
    )
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: historicalOverlayLabel(assurOverlay),
      }),
    )

    const [zoomButton] = screen.getAllByRole('button', {
      name: 'Zoom to active maps',
    })
    await userEvent.click(zoomButton)

    expect(mapMock.fitBounds).toHaveBeenCalled()
  })
})

describe('hover preview', () => {
  it('shows and clears a tooltip for a hovered site', async () => {
    const mapMock = await mountMapTab()
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [43.26, 35.45] },
              properties: { id: 'assur', name: 'Aššur' },
            },
          ]
        : [],
    )

    act(() => mapMock.emit('mousemove', { point: { x: 20, y: 30 } }))
    expect(await screen.findByText('Click to explore')).toBeInTheDocument()

    act(() => mapMock.emit('mouseleave'))
    expect(screen.queryByText('Click to explore')).not.toBeInTheDocument()
  })
})

describe('findspot list expansion', () => {
  it('expands and collapses a long findspot list', async () => {
    const mapMock = await mountMapTab(manyFindspots)
    mapMock.setRenderedFeatures((layers) =>
      layers.includes(excavationAreaFillLayer.id)
        ? [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [43.25, 35.45],
                    [43.26, 35.45],
                    [43.26, 35.46],
                    [43.25, 35.45],
                  ],
                ],
              },
              properties: { id: 'assur-area-a-checksum', name: 'Area A' },
            },
          ]
        : [],
    )
    act(() => mapMock.emit('click', { point: { x: 5, y: 5 } }))
    await screen.findByRole('heading', { name: 'Area A' })
    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))

    expect(screen.queryByText('Findspot 107')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show all 8' }))
    expect(screen.getByText('Findspot 107')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Show fewer' }))
    expect(screen.queryByText('Findspot 107')).not.toBeInTheDocument()
  })
})
