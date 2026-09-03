import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lastMapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'
import { renderMapTab } from 'test-support/map-render'
import { provenanceRecord } from 'test-support/map-fixtures'
import {
  historicalRasterLayerId,
  historicalRasterSourceId,
  polygonFillLayer,
  polygonOutlineLayer,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
} from './mapLayers'
import { validatedHistoricalMapOverlays } from './historicalOverlays'

const firstOverlay = validatedHistoricalMapOverlays[0]

beforeEach(() => {
  resetMapLibreMock()
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ type: 'FeatureCollection', features: [] }),
  }) as unknown as typeof fetch
})

async function openLayerPanel(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Layers' }))
}

async function mountMapTab(
  initialEntries?: readonly string[],
): Promise<MapMock> {
  renderMapTab({
    provenances: [provenanceRecord()],
    initialEntries,
  })
  await screen.findByLabelText('Findspot map')
  await act(async () => {
    await Promise.resolve()
  })
  act(() => lastMapMock().emit('load'))
  return lastMapMock()
}

function layerVisibility(mapMock: MapMock, layerId: string): unknown {
  return mapMock.getLayer(layerId)?.visibility
}

describe('layer visibility', () => {
  it('hides and restores boundary layers without touching points', async () => {
    const mapMock = await mountMapTab()
    await openLayerPanel()
    const toggle = screen.getByRole('checkbox', {
      name: 'Show site boundaries',
    })

    await userEvent.click(toggle)
    expect(layerVisibility(mapMock, polygonFillLayer.id)).toBe('none')
    expect(layerVisibility(mapMock, polygonOutlineLayer.id)).toBe('none')

    await userEvent.click(toggle)
    expect(layerVisibility(mapMock, polygonFillLayer.id)).toBe('visible')
  })

  it('toggles excavation areas independently of boundaries', async () => {
    const mapMock = await mountMapTab()
    await openLayerPanel()

    await userEvent.click(
      screen.getByRole('checkbox', { name: /Show excavation areas/ }),
    )

    expect(layerVisibility(mapMock, EXCAVATION_AREA_FILL_LAYER_ID)).toBe(
      'visible',
    )
    expect(layerVisibility(mapMock, EXCAVATION_AREA_OUTLINE_LAYER_ID)).toBe(
      'visible',
    )
    expect(layerVisibility(mapMock, polygonFillLayer.id)).toBe('visible')
  })
})

describe('historical overlays', () => {
  it('restores an overlay selected in the url below the vector layers', async () => {
    const mapMock = await mountMapTab([`/?v=1&o=${firstOverlay.id}:0.5`])

    expect(
      mapMock.getSource(historicalRasterSourceId(firstOverlay.id)),
    ).toBeDefined()
    expect(
      mapMock.getLayer(historicalRasterLayerId(firstOverlay.id)),
    ).toBeDefined()
  })

  it('applies the opacity from the url', async () => {
    const mapMock = await mountMapTab([`/?v=1&o=${firstOverlay.id}:0.25`])

    expect(mapMock.setPaintProperty).toHaveBeenCalledWith(
      historicalRasterLayerId(firstOverlay.id),
      'raster-opacity',
      0.25,
    )
  })

  it('keeps the layer panel collapsed until requested', async () => {
    await mountMapTab()

    expect(
      screen.queryByRole('checkbox', { name: new RegExp(firstOverlay.title) }),
    ).not.toBeInTheDocument()
  })
})
