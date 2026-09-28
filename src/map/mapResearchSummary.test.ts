import {
  derivePolygonResearchSummary,
  mappingEvidenceOf,
  polygonDisplayName,
  summaryLocationPrecisionOf,
} from 'map/mapResearchSummary'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

describe('mappingEvidenceOf', () => {
  it('is unmapped with no findspots', () => {
    expect(mappingEvidenceOf([])).toBe('unmapped')
  })

  it('is the single method when all rows agree', () => {
    expect(
      mappingEvidenceOf([
        { matchMethod: 'curated' },
        { matchMethod: 'curated' },
      ]),
    ).toBe('curated')
  })

  it('is mixed when rows disagree', () => {
    expect(
      mappingEvidenceOf([
        { matchMethod: 'curated' },
        { matchMethod: 'verified-source' },
      ]),
    ).toBe('mixed')
  })
})

describe('summaryLocationPrecisionOf', () => {
  it('is unknown with no findspots', () => {
    expect(summaryLocationPrecisionOf([])).toBe('unknown')
  })

  it('is the shared precision otherwise', () => {
    expect(
      summaryLocationPrecisionOf([{ locationPrecision: 'excavation-area' }]),
    ).toBe('excavation-area')
  })
})

describe('polygonDisplayName', () => {
  it('prefers the canonical polygon name and falls back to its stable ID', () => {
    expect(polygonDisplayName({ name: 'Ištar Temple' }, 'p1')).toBe(
      'Ištar Temple',
    )
    expect(polygonDisplayName({ name: null }, 'p1')).toBe('p1')
    expect(polygonDisplayName(undefined, 'p1')).toBe('p1')
  })
})

describe('derivePolygonResearchSummary', () => {
  it('folds the summary rows into a research view', () => {
    const research = derivePolygonResearchSummary({
      polygonId: 'p1',
      polygon: excavationPolygon({ polygonId: 'p1', name: 'Area A' }),
      summary: {
        polygonId: 'p1',
        findspotIds: [1, 2],
        findspotCount: 2,
        accessibleFragmentCount: 5,
        findspots: [
          findspotMapDataDto({ findspotId: 1, accessibleFragmentCount: 2 }),
          findspotMapDataDto({ findspotId: 2, accessibleFragmentCount: 3 }),
        ],
      },
      siteName: 'Aššur',
    })

    expect(research.displayName).toBe('Area A')
    expect(research.mappedFindspotCount).toBe(2)
    expect(research.accessibleFragmentCount).toBe(5)
    expect(research.mappingEvidence).toBe('verified-source')
  })
})
