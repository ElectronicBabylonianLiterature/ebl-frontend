import type { PolygonResearchSummary } from 'map/mapResearchSummary'
import {
  type MapResearchContext,
  polygonResearchMarkdown,
  researchSummaryFileName,
} from 'map/mapResearchSummaryText'

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
  it('renders canonical identities, area, counts and the share url', () => {
    const markdown = polygonResearchMarkdown(summary, context)
    expect(markdown).toContain('# Area A — Aššur')
    expect(markdown).toContain('Site ID: assur')
    expect(markdown).toContain('Polygon ID: assur-area-a')
    expect(markdown).toContain('Mapped area: 0.800 km²')
    expect(markdown).toContain('Accessible fragments: 5')
    expect(markdown).toContain('Findspot 1 (Area A) — 5 accessible fragments')
    expect(markdown).toContain(context.shareUrl)
  })

  it('omits absent filters and mapped area', () => {
    const markdown = polygonResearchMarkdown(
      { ...summary, areaSquareKm: null },
      context,
    )
    expect(markdown).not.toContain('Active filters:')
    expect(markdown).not.toContain('Mapped area:')
  })

  it('normalizes newlines and escapes untrusted Markdown values', () => {
    const markdown = polygonResearchMarkdown(
      {
        ...summary,
        displayName: 'Area [A]\n# injected',
        siteName: '<Uruk>\n- forged',
        siteId: 'uruk\n# forged',
        polygonId: 'poly_[x]',
        findspots: [{ ...summary.findspots[0], area: '`Area`\n* forged' }],
      },
      {
        ...context,
        visualizationLabel: 'Mapped *status*\n# forged',
        siteFilter: 'Uruk"]\n# forged',
        shareUrl: 'https://example.test/<map>\n# forged',
      },
    )

    expect(markdown).toContain(
      '# Area \\[A\\] \\# injected — \\<Uruk\\> - forged',
    )
    expect(markdown).toContain('Site ID: uruk \\# forged')
    expect(markdown).toContain('Polygon ID: poly\\_\\[x\\]')
    expect(markdown).toContain('Site name contains "Uruk"\\] \\# forged"')
    expect(markdown).toContain('Findspot 1 (\\`Area\\` \\* forged)')
    expect(markdown).not.toContain('\n# forged')
    expect(markdown).not.toContain('\n- forged')
  })

  it('distinguishes duplicate display names by canonical IDs', () => {
    const first = polygonResearchMarkdown(summary, context)
    const second = polygonResearchMarkdown(
      { ...summary, siteId: 'uruk', polygonId: 'uruk-area-a' },
      context,
    )

    expect(first).not.toBe(second)
    expect(first).toContain('Polygon ID: assur-area-a')
    expect(second).toContain('Polygon ID: uruk-area-a')
  })
})

describe('researchSummaryFileName', () => {
  it('produces a filesystem-safe markdown filename', () => {
    expect(researchSummaryFileName('Aššur — Area A', context.generatedAt)).toBe(
      'ebl-map-assur-area-a-2026-01-02T03-04-05-000Z.md',
    )
  })

  it('falls back to a generic stem when the title has no ascii', () => {
    expect(researchSummaryFileName('—', context.generatedAt)).toMatch(
      /^ebl-map-summary-/,
    )
  })
})
