import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MapSelectedAreaCard from 'map/ui/MapSelectedAreaCard'
import type { FragmentMapDataStatus } from 'map/domain/useFragmentMapData'
import type { PolygonFindspotSummary } from 'fragmentarium/domain/findspotMapData'
import { findspotMapDataDto } from 'test-support/map-fixtures'

function renderCard(
  status: FragmentMapDataStatus,
  summary?: PolygonFindspotSummary,
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <MapSelectedAreaCard summary={summary} status={status} />
    </MemoryRouter>,
  )
}

describe('MapSelectedAreaCard', () => {
  it('shows linked information without repeating the inspector title or controls', () => {
    renderCard('loaded-empty')
    expect(screen.getByRole('region', { name: 'Linked tablets' })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Linked tablets' }),
    ).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('uses plural grammar for several linked findspots', () => {
    const findspots = [
      findspotMapDataDto({ findspotId: 1 }),
      findspotMapDataDto({ findspotId: 2 }),
    ]
    renderCard('loaded-with-mappings', {
      polygonId: 'assur-area-a-checksum',
      findspotIds: [1, 2],
      findspotCount: 2,
      accessibleFragmentCount: 2,
      findspots,
    })
    expect(
      screen.getByText('2 accessible tablets across 2 findspots.'),
    ).toBeVisible()
  })

  it.each([
    [
      'not-configured',
      'No linked tablet data is configured for this site yet.',
    ],
    ['loading', 'Loading linked tablets…'],
    ['loaded-empty', 'No tablets are linked to this excavation area.'],
    ['loaded-with-mappings', 'No tablets are linked to this excavation area.'],
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
  it('keeps the live status node mounted as linked counts replace loading text', () => {
    const { rerender } = renderCard('loading')
    const status = screen.getByRole('status')
    const findspot = findspotMapDataDto({ accessibleFragmentCount: 1 })
    rerender(
      <MemoryRouter>
        <MapSelectedAreaCard
          status="loaded-with-mappings"
          summary={{
            polygonId: 'assur-area-a-checksum',
            findspotIds: [findspot.findspotId],
            findspotCount: 1,
            accessibleFragmentCount: 1,
            findspots: [findspot],
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toBe(status)
    expect(status).toHaveTextContent('1 accessible tablet across 1 findspot.')
    expect(within(status).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Area A (1)' })).toBeVisible()
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
