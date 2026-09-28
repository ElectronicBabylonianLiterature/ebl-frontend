import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { MapSiteId } from 'map/mapSites'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import { EVIDENCE_CODES } from 'map/mapEvidencePaint'
import {
  buildVisualizationValues,
  featureStateFor,
  isDensityAvailable,
  visualizationValuesFor,
} from 'map/mapVisualizationValues'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
  SiteFragmentMapDataState,
} from 'map/useFragmentMapData'
import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'

function summariesFor(
  entries: readonly {
    polygonId: string
    fragments: number
    siteId?: string
    siteName?: string
  }[],
): ReturnType<typeof aggregateFindspotMapData> {
  return aggregateFindspotMapData(
    entries.map((entry, index) =>
      findspotMapData({
        findspotId: 100 + index,
        polygonIds: [entry.polygonId],
        accessibleFragmentCount: entry.fragments,
        siteId: entry.siteId ?? 'ASSUR',
        siteName: entry.siteName ?? 'Aššur',
      }),
    ),
  )
}

function siteState(
  status: FragmentMapDataStatus,
  summaries: ReadonlyMap<string, PolygonFindspotSummary> = new Map(),
): SiteFragmentMapDataState {
  return { status, findspots: [], polygonSummaries: summaries }
}

function mapData(
  assur: SiteFragmentMapDataState,
  uruk?: SiteFragmentMapDataState,
): FragmentMapDataState {
  const sites = new Map<MapSiteId, SiteFragmentMapDataState>([['assur', assur]])
  if (uruk) sites.set('uruk', uruk)

  return {
    sites,
    findspots: [],
    polygonSummaries: new Map(
      [...sites.values()].flatMap((site) => [
        ...site.polygonSummaries.entries(),
      ]),
    ),
  }
}

const index: ExcavationPolygonIndex = new Map([
  [
    'assur',
    [
      excavationPolygon({ polygonId: 'a', areaSquareKm: 2 }),
      excavationPolygon({ polygonId: 'b', areaSquareKm: 0.5 }),
      excavationPolygon({ polygonId: 'no-area', areaSquareKm: null }),
      excavationPolygon({ polygonId: 'zero-area', areaSquareKm: 0 }),
    ],
  ],
])

describe('buildVisualizationValues', () => {
  it('divides authorized counts by geodesic area', () => {
    const summaries = summariesFor([
      { polygonId: 'a', fragments: 10 },
      { polygonId: 'b', fragments: 10 },
    ])
    const values = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    )

    expect(values.get('a')?.densityPerSquareKm).toBe(5)
    expect(values.get('b')?.densityPerSquareKm).toBe(20)
  })

  it('keeps missing denominators unclassified rather than zero', () => {
    const summaries = summariesFor([
      { polygonId: 'no-area', fragments: 4 },
      { polygonId: 'zero-area', fragments: 4 },
    ])
    const values = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    )

    expect(values.get('no-area')).toMatchObject({
      densityAvailable: false,
      densityPerSquareKm: null,
      accessibleFragmentCount: 4,
    })
    expect(values.get('zero-area')?.densityAvailable).toBe(false)
  })

  it('represents a successful missing summary as genuinely unmapped', () => {
    const values = buildVisualizationValues(
      mapData(siteState('loaded-empty')),
      index,
    )

    expect(values.get('a')).toMatchObject({
      dataAvailable: true,
      findspotCount: 0,
      accessibleFragmentCount: 0,
    })
  })

  it.each(['loading', 'error', 'incompatible', 'not-configured'] as const)(
    'keeps %s data unavailable instead of unmapped',
    (status) => {
      const values = buildVisualizationValues(mapData(siteState(status)), index)

      expect(values.get('a')).toMatchObject({
        dataAvailable: false,
        findspotCount: 0,
      })
      expect(visualizationValuesFor(values, 'count')).toEqual([])
    },
  )

  it('keeps successful and failed sites distinct during partial loading', () => {
    const assurSummaries = summariesFor([{ polygonId: 'a', fragments: 7 }])
    const mixedIndex: ExcavationPolygonIndex = new Map([
      ...index,
      [
        'uruk',
        [
          excavationPolygon({
            polygonId: 'uruk-a',
            siteId: 'uruk',
            areaSquareKm: 1,
          }),
        ],
      ],
    ])
    const values = buildVisualizationValues(
      mapData(
        siteState('loaded-with-mappings', assurSummaries),
        siteState('error'),
      ),
      mixedIndex,
    )

    expect(values.get('a')?.dataAvailable).toBe(true)
    expect(values.get('uruk-a')?.dataAvailable).toBe(false)
    expect(visualizationValuesFor(values, 'count')).toContain(7)
  })

  it('ignores non-canonical summary IDs absent from the polygon index', () => {
    const summaries = summariesFor([{ polygonId: 'unknown', fragments: 4 }])
    const values = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    )

    expect(values.has('unknown')).toBe(false)
  })
})

describe('visualization classification', () => {
  it('omits unavailable density while retaining authorized counts', () => {
    const summaries = summariesFor([
      { polygonId: 'a', fragments: 10 },
      { polygonId: 'no-area', fragments: 3 },
    ])
    const values = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    )

    expect(visualizationValuesFor(values, 'count')).toEqual(
      expect.arrayContaining([10, 3]),
    )
    expect(visualizationValuesFor(values, 'density')).toEqual([5])
  })

  it('offers density even when a valid mapped density is zero', () => {
    const summaries = summariesFor([{ polygonId: 'a', fragments: 0 }])
    const values = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    )

    expect(isDensityAvailable(values)).toBe(true)
    expect(visualizationValuesFor(values, 'density')).toContain(0)
  })
})

describe('featureStateFor', () => {
  it('writes every key explicitly so later states cannot retain stale values', () => {
    const summaries = summariesFor([{ polygonId: 'a', fragments: 10 }])
    const available = buildVisualizationValues(
      mapData(siteState('loaded-with-mappings', summaries)),
      index,
    ).get('a')!
    const unavailable = buildVisualizationValues(
      mapData(siteState('error')),
      index,
    ).get('a')!

    expect(featureStateFor(available)).toEqual({
      dataAvailable: true,
      findspotCount: 1,
      accessibleFragmentCount: 10,
      evidenceCode: EVIDENCE_CODES['verified-source'],
      densityAvailable: true,
      densityPerSquareKm: 5,
    })
    expect(featureStateFor(unavailable)).toEqual({
      dataAvailable: false,
      findspotCount: 0,
      accessibleFragmentCount: 0,
      evidenceCode: EVIDENCE_CODES.unmapped,
      densityAvailable: false,
      densityPerSquareKm: 0,
    })
  })
})
