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
      'No linked fragment data is configured for this site yet.',
    ],
    ['loading', 'Loading linked fragments…'],
    ['loaded-empty', 'No fragments are linked to this excavation area.'],
    ['error', 'Linked fragment data is unavailable right now.'],
    ['incompatible', 'Linked fragment data is incompatible with this map.'],
  ] as const)('announces the %s state honestly', (status, message) => {
    renderCard(status)

    expect(screen.getByText(message)).toBeInTheDocument()
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveAttribute('aria-live', 'polite')
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true')
    if (status === 'error' || status === 'incompatible') {
      expect(
        screen.queryByText(/0 accessible fragments/),
      ).not.toBeInTheDocument()
    }
  })
  it.each([
    [1, '1 accessible fragment across 1 findspot.'],
    [2, '2 accessible fragments across 1 findspot.'],
  ] as const)('uses count-aware fragment grammar for %s', (count, text) => {
    const findspot = findspotMapDataDto({ accessibleFragmentCount: count })
    renderCard('loaded-with-mappings', {
      polygonId: 'assur-area-a-checksum',
      findspotIds: [findspot.findspotId],
      findspotCount: 1,
      accessibleFragmentCount: count,
      findspots: [findspot],
    })

    expect(screen.getByText(text)).toBeInTheDocument()
  })
})
