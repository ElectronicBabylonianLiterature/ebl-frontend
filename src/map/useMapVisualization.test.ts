import { renderHook } from '@testing-library/react'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type {
  FindspotMapData,
  PolygonFindspotSummary,
} from 'map/findspotMapData'
import { excavationPaintProperties } from 'map/mapExcavationPaint'
import {
  COLOR_DENSITY_UNCLASSIFIED,
  COLOR_MAPPED_ZERO,
} from 'map/mapPaintColors'
import { featureStateFor } from 'map/mapVisualizationValues'
import useMapVisualization from 'map/useMapVisualization'
import type {
  FragmentMapDataState,
  SiteFragmentMapDataState,
} from 'map/useFragmentMapData'
import { evaluateExpression } from 'test-support/mapExpressionEvaluator'

const ZERO_ID = 'assur-zero'
const NO_AREA_ID = 'assur-no-area'

function summary(
  polygonId: string,
  accessibleFragmentCount: number,
): PolygonFindspotSummary {
  const findspot: FindspotMapData = {
    findspotId: accessibleFragmentCount + 1,
    siteId: 'ASSUR',
    siteName: 'Aaaur',
    polygonIds: [polygonId],
    accessibleFragmentCount,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: null,
    building: null,
    room: null,
  }
  return {
    polygonId,
    findspotIds: [findspot.findspotId],
    findspotCount: 1,
    accessibleFragmentCount,
    findspots: [findspot],
  }
}

describe('useMapVisualization', () => {
  it('retains density paint when every usable density is zero', () => {
    const zero = summary(ZERO_ID, 0)
    const noArea = summary(NO_AREA_ID, 4)
    const summaries = new Map([
      [ZERO_ID, zero],
      [NO_AREA_ID, noArea],
    ])
    const site: SiteFragmentMapDataState = {
      status: 'loaded-with-mappings',
      findspots: [...zero.findspots, ...noArea.findspots],
      polygonSummaries: summaries,
    }
    const mapData: FragmentMapDataState = {
      sites: new Map([['assur', site]]),
      findspots: site.findspots,
      polygonSummaries: summaries,
    }
    const index = new Map([
      [
        'assur',
        [
          { polygonId: ZERO_ID, areaSquareKm: 2 },
          { polygonId: NO_AREA_ID, areaSquareKm: null },
        ],
      ],
    ]) as unknown as ExcavationPolygonIndex

    const { result } = renderHook(() =>
      useMapVisualization(mapData, index, 'density'),
    )

    expect(result.current.effectiveMode).toBe('density')
    expect(result.current.scale).toBeNull()
    expect(result.current.paint.kind).toBe('choropleth')

    const fill = excavationPaintProperties(result.current.paint).fillColor
    const colorFor = (polygonId: string): unknown =>
      evaluateExpression(fill, {
        featureState: featureStateFor(result.current.values.get(polygonId)!),
      })

    expect(colorFor(ZERO_ID)).toBe(COLOR_MAPPED_ZERO)
    expect(colorFor(NO_AREA_ID)).toBe(COLOR_DENSITY_UNCLASSIFIED)
  })
})
