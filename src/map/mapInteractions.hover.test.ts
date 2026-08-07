import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import type { MapMouseEvent } from 'maplibre-gl'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { unclusteredLayer, EXCAVATION_AREAS_SOURCE_ID } from './mapLayers'
import {
  clearHoverState,
  handleMapHover,
  type MapHoverContext,
} from './mapInteractions'
import {
  aggregateFindspotMapData,
  type PolygonFindspotSummary,
} from './findspotMapData'
import type { SiteResearchSummaries } from './mapSiteSummaries'
import { findspotMapData, polygonFeature } from 'test-support/map-fixtures'
import { pointFeature } from 'test-support/map-interaction-fixtures'

const event = { point: { x: 12, y: 34 } } as MapMouseEvent

const babylonSummary = {
  siteId: 'babylon',
  siteName: 'Babylon',
  totalPolygonCount: 4,
  linkedPolygonCount: 3,
  mappedFindspotCount: 7,
  accessibleFragmentCount: 12,
  historicalOverlayCount: 2,
}

function hoverContext(
  findspotSummaries: ReadonlyMap<string, PolygonFindspotSummary>,
  siteSummaries: SiteResearchSummaries = new Map(),
): MapHoverContext {
  return { findspotSummaries, siteSummaries }
}

function cursorOf(map: { canvas: { style: Record<string, string> } }): string {
  return map.canvas.style.cursor
}

beforeEach(() => {
  resetMapLibreMock()
})

describe('handleMapHover', () => {
  const summaries = aggregateFindspotMapData([
    findspotMapData({ polygonIds: ['assur-area-a'] }),
  ])

  it('previews a polygon with its authorized counts and sets hover state', () => {
    const map = createMapMock()
    map.setRenderedFeatures(() => [polygonFeature('assur-area-a', 'assur')])
    const hoveredRef = { current: null as string | null }
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      hoveredRef,
      hoverContext(summaries),
      onHover,
    )

    expect(cursorOf(map)).toBe('pointer')
    expect(hoveredRef.current).toBe('assur-area-a')
    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({ hover: true })
    expect(onHover).toHaveBeenCalledWith({
      x: 12,
      y: 34,
      title: 'Area A',
      details: [
        '1 mapped findspot',
        '4 accessible fragments',
        'Verified-source mapping',
        'Click to inspect',
      ],
    })
  })

  it('previews a polygon without mapped findspots', () => {
    const map = createMapMock()
    map.setRenderedFeatures(() => [polygonFeature('assur-area-z', 'assur')])
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      { current: null },
      hoverContext(new Map()),
      onHover,
    )

    expect(onHover).toHaveBeenCalledWith(
      expect.objectContaining({
        details: ['No mapped findspots', 'Click to inspect'],
      }),
    )
  })

  it('moves hover state between polygons', () => {
    const map = createMapMock()
    map.setRenderedFeatures(() => [polygonFeature('assur-area-b', 'assur')])
    const hoveredRef = { current: 'assur-area-a' as string | null }

    handleMapHover(
      asLibreMap(map),
      event,
      hoveredRef,
      hoverContext(summaries),
      jest.fn(),
    )

    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({ hover: false })
    expect(hoveredRef.current).toBe('assur-area-b')
  })

  it('previews a site point with its linked polygons and maps', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [pointFeature('babylon', 'Babylon')]
        : [],
    )
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      { current: null },
      hoverContext(summaries, new Map([['babylon', babylonSummary]])),
      onHover,
    )

    expect(onHover).toHaveBeenCalledWith({
      x: 12,
      y: 34,
      title: 'Babylon',
      details: [
        '3 linked excavation polygons',
        '2 historical maps',
        'Click to explore',
      ],
    })
  })

  it('previews a site without linked polygons or maps', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [pointFeature('uruk', 'Uruk')]
        : [],
    )
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      { current: null },
      hoverContext(summaries),
      onHover,
    )

    expect(onHover).toHaveBeenCalledWith(
      expect.objectContaining({ details: ['Click to explore'] }),
    )
  })

  it('clears the preview when nothing is hovered', () => {
    const map = createMapMock()
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      { current: null },
      hoverContext(summaries),
      onHover,
    )

    expect(cursorOf(map)).toBe('')
    expect(onHover).toHaveBeenCalledWith(null)
  })

  it('drops a site preview without a name', () => {
    const map = createMapMock()
    map.setRenderedFeatures((layers) =>
      layers.includes(unclusteredLayer.id)
        ? [{ ...(pointFeature('x', 'X') as object), properties: { id: 'x' } }]
        : [],
    )
    const onHover = jest.fn()

    handleMapHover(
      asLibreMap(map),
      event,
      { current: null },
      hoverContext(summaries),
      onHover,
    )

    expect(onHover).toHaveBeenCalledWith(null)
  })
})

describe('clearHoverState', () => {
  it('resets the hovered polygon, cursor and preview', () => {
    const map = createMapMock()
    const hoveredRef = { current: 'assur-area-a' as string | null }
    map.canvas.style.cursor = 'pointer'
    const onHover = jest.fn()

    clearHoverState(asLibreMap(map), hoveredRef, onHover)

    expect(hoveredRef.current).toBeNull()
    expect(cursorOf(map)).toBe('')
    expect(onHover).toHaveBeenCalledWith(null)
    expect(
      map.getFeatureState({
        source: EXCAVATION_AREAS_SOURCE_ID,
        id: 'assur-area-a',
      }),
    ).toEqual({ hover: false })
  })
})
