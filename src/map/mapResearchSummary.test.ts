import { aggregateFindspotMapData } from './findspotMapData'
import {
  UNNAMED_EXCAVATION_AREA,
  derivePolygonResearchSummary,
  deriveSiteResearchSummary,
  mappingEvidenceOf,
  polygonDisplayName,
  summaryLocationPrecisionOf,
} from './mapResearchSummary'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'

const POLYGON = 'assur-bb6i'

function summariesFor(
  findspots: readonly ReturnType<typeof findspotMapData>[],
): ReturnType<typeof aggregateFindspotMapData> {
  return aggregateFindspotMapData(findspots)
}

function summaryFor(
  findspots: readonly ReturnType<typeof findspotMapData>[],
): ReturnType<typeof derivePolygonResearchSummary> {
  return derivePolygonResearchSummary({
    polygonId: POLYGON,
    polygon: excavationPolygon({ polygonId: POLYGON, name: 'bB6I' }),
    summary: summariesFor(findspots).get(POLYGON),
    siteName: 'Aššur',
  })
}

const verified = findspotMapData({
  findspotId: 1,
  polygonIds: [POLYGON],
  matchMethod: 'verified-source',
  accessibleFragmentCount: 23,
})
const curated = findspotMapData({
  findspotId: 2,
  polygonIds: [POLYGON],
  matchMethod: 'curated',
  accessibleFragmentCount: 0,
})

describe('mappingEvidenceOf', () => {
  it.each([
    ['verified-source', [verified]],
    ['curated', [curated]],
    ['mixed', [verified, curated]],
    ['unmapped', []],
  ] as const)('reports %s', (expected, findspots) => {
    expect(mappingEvidenceOf(findspots)).toBe(expected)
  })
})

describe('summaryLocationPrecisionOf', () => {
  it('reports the single shared precision', () => {
    expect(summaryLocationPrecisionOf([verified])).toBe('excavation-area')
  })

  it('reports unknown without findspots', () => {
    expect(summaryLocationPrecisionOf([])).toBe('unknown')
  })

  it('reports mixed when precisions disagree', () => {
    expect(
      summaryLocationPrecisionOf([
        verified,
        { locationPrecision: 'site' as never },
      ]),
    ).toBe('mixed')
  })
})

describe('polygonDisplayName', () => {
  it('prefers the polygon asset name', () => {
    expect(polygonDisplayName({ name: 'bB6I' }, [{ area: 'Area A' }])).toBe(
      'bB6I',
    )
  })

  it('falls back to a findspot area, then to a generic noun', () => {
    expect(polygonDisplayName({ name: null }, [{ area: 'Area A' }])).toBe(
      'Area A',
    )
    expect(polygonDisplayName(undefined, [])).toBe(UNNAMED_EXCAVATION_AREA)
  })
})

describe('derivePolygonResearchSummary', () => {
  it('carries the visible counts, evidence and precision', () => {
    expect(summaryFor([verified, curated])).toMatchObject({
      polygonId: POLYGON,
      siteId: 'assur',
      siteName: 'Aššur',
      displayName: 'bB6I',
      mappedFindspotCount: 2,
      accessibleFragmentCount: 23,
      mappingEvidence: 'mixed',
      locationPrecision: 'excavation-area',
      areaSquareKm: 0.8,
    })
  })

  it('normalizes absent optional context fields to null', () => {
    expect(summaryFor([verified]).findspots[0]).toEqual({
      findspotId: 1,
      accessibleFragmentCount: 23,
      matchMethod: 'verified-source',
      locationPrecision: 'excavation-area',
      sector: null,
      area: 'Area A',
      building: null,
      room: null,
    })
  })

  it('describes an unmapped polygon without inventing a method', () => {
    expect(summaryFor([])).toMatchObject({
      mappedFindspotCount: 0,
      accessibleFragmentCount: 0,
      mappingEvidence: 'unmapped',
      locationPrecision: 'unknown',
      findspots: [],
    })
  })

  it('keeps a mapped polygon with zero fragments mapped', () => {
    expect(summaryFor([curated]).mappingEvidence).toBe('curated')
    expect(summaryFor([curated]).accessibleFragmentCount).toBe(0)
  })

  it('handles a polygon absent from the canonical asset', () => {
    expect(
      derivePolygonResearchSummary({
        polygonId: 'unknown',
        polygon: undefined,
        summary: undefined,
        siteName: '',
      }),
    ).toMatchObject({
      siteId: '',
      displayName: UNNAMED_EXCAVATION_AREA,
      areaSquareKm: null,
    })
  })
})

describe('deriveSiteResearchSummary', () => {
  const polygons = [
    excavationPolygon({ polygonId: POLYGON }),
    excavationPolygon({ polygonId: 'assur-unlinked' }),
  ]

  it('counts only the site’s own linked polygons', () => {
    expect(
      deriveSiteResearchSummary({
        siteId: 'assur',
        siteName: 'Aššur',
        polygons,
        summaries: summariesFor([verified, curated]),
        historicalOverlayCount: 10,
      }),
    ).toEqual({
      siteId: 'assur',
      siteName: 'Aššur',
      totalPolygonCount: 2,
      linkedPolygonCount: 1,
      mappedFindspotCount: 2,
      accessibleFragmentCount: 23,
      historicalOverlayCount: 10,
    })
  })

  it('counts a findspot spanning two polygons once', () => {
    expect(
      deriveSiteResearchSummary({
        siteId: 'assur',
        siteName: 'Aššur',
        polygons,
        summaries: summariesFor([
          findspotMapData({
            findspotId: 9,
            polygonIds: [POLYGON, 'assur-unlinked'],
            accessibleFragmentCount: 5,
          }),
        ]),
        historicalOverlayCount: 0,
      }),
    ).toMatchObject({
      linkedPolygonCount: 2,
      mappedFindspotCount: 1,
      accessibleFragmentCount: 5,
    })
  })
})
