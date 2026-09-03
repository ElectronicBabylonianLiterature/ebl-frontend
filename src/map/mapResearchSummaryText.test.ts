import {
  type MapResearchContext,
  polygonResearchMarkdown,
  researchSummaryFileName,
} from 'map/mapResearchSummaryText'
import type { PolygonResearchSummary } from 'map/mapResearchSummary'

const context: MapResearchContext = {
  visualizationLabel: 'Mapped status',
  siteFilter: '',
  shareUrl: 'https://www.ebl.lmu.de/tools/map?mv=1',
  generatedAt: '2026-01-02T03:04:05.000Z',
}

const summary: PolygonResearchSummary = {
  polygonId: 'assur-area-a',
  siteId: 'assur',
  siteName: 'Aššur',
  displayName: 'Area A',
  mappedFindspotCount: 2,
  accessibleFragmentCount: 5,
  findspots: [
    {
      findspotId: 1,
      accessibleFragmentCount: 5,
      matchMethod: 'verified-source',
      locationPrecision: 'excavation-area',
      sector: null,
      area: 'Area A',
      building: null,
      room: null,
    },
  ],
  mappingEvidence: 'verified-source',
  locationPrecision: 'excavation-area',
  areaSquareKm: 0.8,
}

describe('polygonResearchMarkdown', () => {
  it('renders a heading, the counts and the share url', () => {
    const markdown = polygonResearchMarkdown(summary, context)
    expect(markdown).toContain('# Area A — Aššur')
    expect(markdown).toContain('Accessible fragments: 5')
    expect(markdown).toContain(context.shareUrl)
  })

  it('omits the filter section when no filter is set', () => {
    expect(polygonResearchMarkdown(summary, context)).not.toContain(
      'Active filters:',
    )
  })
})

describe('researchSummaryFileName', () => {
  it('produces a filesystem-safe markdown filename', () => {
    expect(
      researchSummaryFileName('Aššur — Area A', context.generatedAt),
    ).toBe('ebl-map-assur-area-a-2026-01-02T03-04-05-000Z.md')
  })

  it('falls back to a generic stem when the title has no ascii', () => {
    expect(researchSummaryFileName('—', context.generatedAt)).toMatch(
      /^ebl-map-summary-/,
    )
  })
})
