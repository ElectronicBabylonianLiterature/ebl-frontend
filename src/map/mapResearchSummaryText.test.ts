import {
  type MapResearchContext,
  polygonResearchMarkdown,
  researchSummaryFileName,
  siteResearchMarkdown,
} from './mapResearchSummaryText'
import type {
  PolygonResearchSummary,
  SiteResearchSummary,
} from './mapResearchSummary'

const context: MapResearchContext = {
  visualizationLabel: 'Mapping evidence',
  activeOverlayTitles: ['Andrae 1938, Beilage'],
  isTerrainEnabled: true,
  siteFilter: 'aš',
  shareUrl: 'https://example.test/map?v=1&viz=evidence',
  generatedAt: '2026-08-06T10:00:00.000Z',
}

const polygon: PolygonResearchSummary = {
  polygonId: 'assur-bb6i-3d76dc1e02af',
  siteId: 'assur',
  siteName: 'Aššur',
  displayName: 'bB6I',
  mappedFindspotCount: 13,
  accessibleFragmentCount: 23,
  findspots: [
    {
      findspotId: 7,
      accessibleFragmentCount: 1,
      matchMethod: 'verified-source',
      locationPrecision: 'excavation-area',
      sector: null,
      area: null,
      building: null,
      room: null,
    },
  ],
  mappingEvidence: 'verified-source',
  locationPrecision: 'excavation-area',
  areaSquareKm: 0.8,
}

const site: SiteResearchSummary = {
  siteId: 'assur',
  siteName: 'Aššur',
  totalPolygonCount: 134,
  linkedPolygonCount: 133,
  mappedFindspotCount: 317,
  accessibleFragmentCount: 1245,
  historicalOverlayCount: 10,
}

describe('polygonResearchMarkdown', () => {
  const markdown = polygonResearchMarkdown(polygon, context)

  it('titles the summary with the display name and site', () => {
    expect(markdown.startsWith('# bB6I — Aššur')).toBe(true)
  })

  it('records the visible counts, evidence and precision', () => {
    expect(markdown).toContain('Feature type: Excavation area')
    expect(markdown).toContain('Mapped findspots: 13')
    expect(markdown).toContain('Accessible fragments: 23')
    expect(markdown).toContain('Mapping evidence: Verified source')
    expect(markdown).toContain('Location precision: Excavation area')
    expect(markdown).toContain('Findspot 7 — 1 accessible fragment')
  })

  it('records the reproducible view', () => {
    expect(markdown).toContain('- Andrae 1938, Beilage')
    expect(markdown).toContain('- Mapping evidence')
    expect(markdown).toContain('Site name contains "aš"')
    expect(markdown).toContain('- On')
    expect(markdown).toContain(context.shareUrl)
    expect(markdown).toContain(`Generated: ${context.generatedAt}`)
  })

  it('carries the precision caveats and never the canonical id', () => {
    expect(markdown).toContain('accessible to the current user')
    expect(markdown).toContain('not exact fragment coordinates')
    expect(markdown).not.toContain(polygon.polygonId)
  })

  it('omits sections the view has nothing for', () => {
    const bare = polygonResearchMarkdown(
      { ...polygon, findspots: [] },
      {
        ...context,
        activeOverlayTitles: [],
        siteFilter: '',
        isTerrainEnabled: false,
      },
    )

    expect(bare).not.toContain('Active historical maps:')
    expect(bare).not.toContain('Active filters:')
    expect(bare).not.toContain('Mapped findspots:\n-')
    expect(bare).toContain('- Off')
  })
})

describe('siteResearchMarkdown', () => {
  it('labels the one ratio for exactly what it counts', () => {
    const markdown = siteResearchMarkdown(site, context)

    expect(markdown.startsWith('# Aššur')).toBe(true)
    expect(markdown).toContain('Excavation polygons linked: 133 of 134')
    expect(markdown).toContain('Mapped findspots: 317')
    expect(markdown).toContain('Historical maps available: 10')
    expect(markdown).not.toContain('coverage')
  })
})

describe('researchSummaryFileName', () => {
  it('reduces a diacritic name to a stable ascii slug', () => {
    expect(researchSummaryFileName('bB6I Aššur', context.generatedAt)).toBe(
      'ebl-map-bb6i-assur-2026-08-06T10-00-00-000Z.md',
    )
  })

  it('falls back to a generic stem when nothing survives', () => {
    expect(researchSummaryFileName('***', context.generatedAt)).toBe(
      'ebl-map-summary-2026-08-06T10-00-00-000Z.md',
    )
  })

  it('bounds the slug length', () => {
    expect(
      researchSummaryFileName('a'.repeat(200), context.generatedAt),
    ).toContain(`ebl-map-${'a'.repeat(60)}-`)
  })
})
