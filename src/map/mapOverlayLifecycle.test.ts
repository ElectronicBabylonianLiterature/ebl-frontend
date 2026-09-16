import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { MapMock, resetMapLibreMock } from '__mocks__/maplibre-gl'
import {
  clampRasterOpacity,
  syncHistoricalOverlays,
} from './mapOverlayLifecycle'
import {
  historicalRasterLayerId,
  historicalRasterSourceId,
  polygonFillLayer,
} from './mapLayers'
import { historicalMapOverlay } from 'test-support/map-fixtures'

const overlayA = historicalMapOverlay({ id: 'overlay-a' })
const overlayB = historicalMapOverlay({ id: 'overlay-b' })

function sync(
  map: MapMock,
  overlays: readonly {
    overlay: typeof overlayA
    opacity: number
    visible: boolean
  }[],
  ref: { current: readonly string[] },
): void {
  syncHistoricalOverlays(asLibreMap(map), overlays, ref)
}

beforeEach(() => {
  resetMapLibreMock()
})

describe('clampRasterOpacity', () => {
  it.each([
    [0.5, 0.5],
    [-1, 0],
    [2, 1],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
  ])('clamps %s to %s', (input, expected) => {
    expect(clampRasterOpacity(input)).toBe(expected)
  })
})

describe('syncHistoricalOverlays', () => {
  it('adds a source and layer for a visible overlay', () => {
    const map = createMapMock()
    const ref = { current: [] as readonly string[] }

    sync(map, [{ overlay: overlayA, opacity: 0.6, visible: true }], ref)

    expect(map.getSource(historicalRasterSourceId('overlay-a'))).toBeDefined()
    expect(map.getLayer(historicalRasterLayerId('overlay-a'))).toBeDefined()
    expect(ref.current).toEqual(['overlay-a'])
  })

  it('inserts the raster below the provenance polygon layer when present', () => {
    const map = createMapMock()
    map.addLayer(polygonFillLayer as unknown as Record<string, unknown>)
    const addLayer = jest.spyOn(map, 'addLayer')

    sync(map, [{ overlay: overlayA, opacity: 1, visible: true }], {
      current: [],
    })

    expect(addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: historicalRasterLayerId('overlay-a') }),
      polygonFillLayer.id,
    )
  })

  it('updates opacity without recreating the source', () => {
    const map = createMapMock()
    const ref = { current: [] as readonly string[] }
    sync(map, [{ overlay: overlayA, opacity: 0.6, visible: true }], ref)
    const source = map.getSource(historicalRasterSourceId('overlay-a'))

    sync(map, [{ overlay: overlayA, opacity: 0.2, visible: true }], ref)

    expect(map.getSource(historicalRasterSourceId('overlay-a'))).toBe(source)
    expect(map.setPaintProperty).toHaveBeenLastCalledWith(
      historicalRasterLayerId('overlay-a'),
      'raster-opacity',
      0.2,
    )
  })

  it('removes one overlay without affecting another', () => {
    const map = createMapMock()
    const ref = { current: [] as readonly string[] }
    sync(
      map,
      [
        { overlay: overlayA, opacity: 1, visible: true },
        { overlay: overlayB, opacity: 1, visible: true },
      ],
      ref,
    )

    sync(map, [{ overlay: overlayB, opacity: 1, visible: true }], ref)

    expect(map.getLayer(historicalRasterLayerId('overlay-a'))).toBeUndefined()
    expect(map.getSource(historicalRasterSourceId('overlay-a'))).toBeUndefined()
    expect(map.getLayer(historicalRasterLayerId('overlay-b'))).toBeDefined()
    expect(ref.current).toEqual(['overlay-b'])
  })

  it('removes every overlay when the selection is cleared', () => {
    const map = createMapMock()
    const ref = { current: [] as readonly string[] }
    sync(map, [{ overlay: overlayA, opacity: 1, visible: true }], ref)

    sync(map, [], ref)

    expect(map.layers.size).toBe(0)
    expect(ref.current).toEqual([])
  })

  it('skips overlays that are not visible', () => {
    const map = createMapMock()
    const ref = { current: [] as readonly string[] }

    sync(map, [{ overlay: overlayA, opacity: 1, visible: false }], ref)

    expect(map.layers.size).toBe(0)
    expect(ref.current).toEqual([])
  })
})
