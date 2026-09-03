import React from 'react'
import { render, screen } from '@testing-library/react'
import MapInspectorEvidence, { evidenceRows } from './MapInspectorEvidence'
import type { PolygonResearchSummary } from './mapResearchSummary'

function summary(
  overrides: Partial<PolygonResearchSummary> = {},
): PolygonResearchSummary {
  return {
    polygonId: 'assur-bb6i',
    siteId: 'assur',
    siteName: 'Aššur',
    displayName: 'bB6I',
    mappedFindspotCount: 1,
    accessibleFragmentCount: 3,
    findspots: [
      {
        findspotId: 1,
        accessibleFragmentCount: 3,
        matchMethod: 'verified-source',
        locationPrecision: 'excavation-area',
        sector: 'Sector E',
        area: null,
        building: '   ',
        room: null,
      },
    ],
    mappingEvidence: 'verified-source',
    locationPrecision: 'excavation-area',
    areaSquareKm: 0.125,
    ...overrides,
  }
}

function labels(polygon: PolygonResearchSummary): readonly string[] {
  return evidenceRows(polygon).map((row) => row.label)
}

describe('evidenceRows', () => {
  it('reports the method, precision and mapped area', () => {
    expect(evidenceRows(summary())).toEqual([
      { label: 'Mapping method', value: 'Verified-source mapping' },
      { label: 'Location precision', value: 'Excavation area' },
      { label: 'Mapped area', value: '0.125 km²' },
      { label: 'Sector', value: 'Sector E' },
    ])
  })

  it('hides every absent or blank optional context field', () => {
    expect(labels(summary())).not.toContain('Area')
    expect(labels(summary())).not.toContain('Building')
    expect(labels(summary())).not.toContain('Room')
  })

  it('merges distinct context values across findspots', () => {
    const rows = evidenceRows(
      summary({
        mappedFindspotCount: 2,
        findspots: [
          ...summary().findspots,
          { ...summary().findspots[0], findspotId: 2, room: 'Room 5' },
        ],
      }),
    )

    expect(rows).toContainEqual({ label: 'Room', value: 'Room 5' })
  })

  it('names both methods when the evidence is mixed', () => {
    const rows = evidenceRows(
      summary({
        mappingEvidence: 'mixed',
        findspots: [
          summary().findspots[0],
          { ...summary().findspots[0], findspotId: 2, matchMethod: 'curated' },
        ],
      }),
    )

    expect(rows[0].value).toBe('Curated mapping, Verified-source mapping')
  })

  it('omits method and precision for an unmapped polygon', () => {
    expect(
      labels(
        summary({
          mappedFindspotCount: 0,
          findspots: [],
          areaSquareKm: null,
        }),
      ),
    ).toEqual([])
  })
})

describe('MapInspectorEvidence', () => {
  it('renders the rows it has and the provenance note', () => {
    render(<MapInspectorEvidence summary={summary()} />)

    expect(screen.getByText('Mapping method')).toBeInTheDocument()
    expect(screen.getByText('Verified-source mapping')).toBeInTheDocument()
    expect(
      screen.getByText(/Detailed mapping provenance is not exposed/),
    ).toBeInTheDocument()
    expect(screen.queryByText('Source unavailable')).not.toBeInTheDocument()
  })

  it('says so plainly when there is no evidence at all', () => {
    render(
      <MapInspectorEvidence
        summary={summary({
          mappedFindspotCount: 0,
          findspots: [],
          areaSquareKm: null,
        })}
      />,
    )

    expect(
      screen.getByText(
        'No mapping evidence is recorded for this excavation area.',
      ),
    ).toBeInTheDocument()
  })
})
