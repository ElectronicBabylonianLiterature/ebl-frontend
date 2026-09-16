import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import {
  initializeFindspotSources,
  setBoundaryVisibility,
  setExcavationAreaVisibility,
} from './mapSourceLifecycle'
import {
  historicalRasterLayerId,
  historicalRasterSourceId,
  polygonFillLayer,
  polygonOutlineLayer,
  clusterCountLayer,
  clusterLayer,
  unclusteredLayer,
  excavationAreaSelectedLayer,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
} from './mapLayers'
import { syncHistoricalOverlays } from './mapOverlayLifecycle'
import {
  historicalMapOverlay,
  provenanceRecord,
} from 'test-support/map-fixtures'

beforeEach(() => {
  resetMapLibreMock()
})

describe('initializeFindspotSources', () => {
  it('adds every source and layer in render order', () => {
    const mapMock = createMapMock()

    initializeFindspotSources(
      asLibreMap(mapMock),
      [provenanceRecord()],
      true,
      false,
    )

    expect([...mapMock.sources.keys()]).toEqual([
      POLYGON_SOURCE_ID,
      EXCAVATION_AREAS_SOURCE_ID,
      SOURCE_ID,
    ])
    expect([...mapMock.layers.keys()]).toEqual([
      polygonFillLayer.id,
      polygonOutlineLayer.id,
      EXCAVATION_AREA_FILL_LAYER_ID,
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      excavationAreaSelectedLayer.id,
      clusterLayer.id,
      clusterCountLayer.id,
      unclusteredLayer.id,
    ])
  })

  it('applies the requested initial visibility', () => {
    const mapMock = createMapMock()

    initializeFindspotSources(
      asLibreMap(mapMock),
      [provenanceRecord()],
      false,
      true,
    )

    expect(mapMock.getLayer(polygonFillLayer.id)?.visibility).toBe('none')
    expect(mapMock.getLayer(EXCAVATION_AREA_FILL_LAYER_ID)?.visibility).toBe(
      'visible',
    )
  })

  it('fits the map to the provenance points', () => {
    const mapMock = createMapMock()

    initializeFindspotSources(
      asLibreMap(mapMock),
      [provenanceRecord()],
      true,
      false,
    )

    expect(mapMock.fitBounds).toHaveBeenCalled()
  })

  it('does not fit an empty provenance list', () => {
    const mapMock = createMapMock()

    initializeFindspotSources(asLibreMap(mapMock), [], true, false)

    expect(mapMock.fitBounds).not.toHaveBeenCalled()
  })
})

describe('visibility helpers on a bare map', () => {
  it('ignores boundary layers that do not exist yet', () => {
    const mapMock = createMapMock()

    setBoundaryVisibility(asLibreMap(mapMock), false)

    expect(mapMock.setLayoutProperty).not.toHaveBeenCalled()
  })

  it('ignores excavation layers that do not exist yet', () => {
    const mapMock = createMapMock()

    setExcavationAreaVisibility(asLibreMap(mapMock), true)

    expect(mapMock.setLayoutProperty).not.toHaveBeenCalled()
  })
})

describe('overlay removal on a bare map', () => {
  it('tolerates a previously tracked overlay whose layer and source are gone', () => {
    const mapMock = createMapMock()
    const ref = { current: ['overlay-a'] as readonly string[] }

    syncHistoricalOverlays(asLibreMap(mapMock), [], ref)

    expect(ref.current).toEqual([])
    expect(mapMock.layers.size).toBe(0)
  })

  it('reuses an existing source when the layer was removed separately', () => {
    const mapMock = createMapMock()
    const overlay = historicalMapOverlay({ id: 'overlay-a' })
    const ref = { current: [] as readonly string[] }
    syncHistoricalOverlays(
      asLibreMap(mapMock),
      [{ overlay, opacity: 1, visible: true }],
      ref,
    )
    mapMock.removeLayer(historicalRasterLayerId('overlay-a'))

    syncHistoricalOverlays(
      asLibreMap(mapMock),
      [{ overlay, opacity: 1, visible: true }],
      ref,
    )

    expect(
      mapMock.getSource(historicalRasterSourceId('overlay-a')),
    ).toBeDefined()
    expect(mapMock.getLayer(historicalRasterLayerId('overlay-a'))).toBeDefined()
  })
})
