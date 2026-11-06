import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapSelectedAreaCard from 'map/MapSelectedAreaCard'
import type { FragmentMapDataStatus } from 'map/useFragmentMapData'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import { findspotMapDataDto } from 'test-support/map-fixtures'

function renderCard(
  status: FragmentMapDataStatus,
  summary?: PolygonFindspotSummary,
): void {
  render(
    <MemoryRouter>
      <MapSelectedAreaCard
        polygonId="assur-area-a-checksum"
        polygonName="Area A"
        summary={summary}
        status={status}
        onClear={jest.fn()}
      />
    </MemoryRouter>,
  )
}

describe('MapSelectedAreaCard', () => {
  it.each([
    [
      'not-configured',
      'No linked tablet data is configured for this site yet.',
    ],
    ['loading', 'Loading linked tablets…'],
    ['loaded-empty', 'No tablets are linked to this excavation area.'],
    ['error', 'Linked tablet data is unavailable right now.'],
    ['incompatible', 'Linked tablet data is incompatible with this map.'],
  ] as const)('announces the %s state honestly', (status, message) => {
    renderCard(status)

    expect(screen.getByText(message)).toBeInTheDocument()
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveAttribute('aria-live', 'polite')
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true')
    if (status === 'error' || status === 'incompatible') {
      expect(screen.queryByText(/0 accessible tablets/)).not.toBeInTheDocument()
    }
  })
  it.each([
    [1, '1 accessible tablet across 1 findspot.'],
    [2, '2 accessible tablets across 1 findspot.'],
  ] as const)('uses count-aware tablet grammar for %s', (count, text) => {
    const findspot = findspotMapDataDto({ accessibleFragmentCount: count })
    renderCard('loaded-with-mappings', {
      polygonId: 'assur-area-a-checksum',
      findspotIds: [findspot.findspotId],
      findspotCount: 1,
      accessibleFragmentCount: count,
      findspots: [findspot],
    })

    expect(screen.getByText(text)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: `Area A (${count})` }),
    ).toHaveAttribute(
      'href',
      `/library/search?findspotId=${findspot.findspotId}`,
    )
    expect(screen.queryByText(/Findspot \d/)).not.toBeInTheDocument()
  })
})
