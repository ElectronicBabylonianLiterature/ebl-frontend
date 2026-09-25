import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MapInspector from 'map/MapInspector'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { FragmentMapDataStatus } from 'map/useFragmentMapData'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

const POLYGON_ID = 'uruk-pd-xvi-4-first'
const polygon = excavationPolygon({
  polygonId: POLYGON_ID,
  siteId: 'uruk',
  name: 'Pd XVI/4',
})

function inspector(
  status: FragmentMapDataStatus,
  summary?: PolygonFindspotSummary,
): JSX.Element {
  return (
    <MemoryRouter>
      <MapInspector
        polygon={polygon}
        summary={summary}
        siteName="Uruk"
        status={status}
        visualizationMode="count"
        siteFilter=""
        onClear={jest.fn()}
      />
    </MemoryRouter>
  )
}

const unavailableStates: readonly [FragmentMapDataStatus, string][] = [
  ['not-configured', 'Linked fragment data is not configured for this site.'],
  ['loading', 'Loading linked fragment data…'],
  ['error', 'Linked fragment data is unavailable right now.'],
  ['incompatible', 'Linked fragment data is incompatible with this map.'],
]

describe('MapInspector', () => {
  it.each(unavailableStates)(
    'does not present derived zeroes while data is %s',
    (status, message) => {
      render(inspector(status))

      expect(screen.getByRole('status')).toHaveTextContent(message)
      expect(screen.queryByText('Mapped findspots')).not.toBeInTheDocument()
      expect(
        screen.queryByText('No fragments are linked to this excavation area.'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Copy research summary' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Download .md' }),
      ).not.toBeInTheDocument()
    },
  )

  it('reports legitimate zeroes after a successful empty response', async () => {
    render(inspector('loaded-empty'))

    expect(screen.getByRole('status')).toHaveTextContent(
      '0 accessible fragments across 0 findspots.',
    )
    expect(screen.getByText('Mapped findspots')).toBeInTheDocument()
    expect(screen.getByText('0 findspots')).toBeInTheDocument()
    expect(screen.getByText('0 fragments')).toBeInTheDocument()
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Copy research summary' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Download .md' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
    expect(
      screen.getByText('No fragments are linked to this excavation area.'),
    ).toBeInTheDocument()
  })

  it('exposes canonical polygon and findspot identities, including ID zero', async () => {
    const summary: PolygonFindspotSummary = {
      polygonId: POLYGON_ID,
      findspotIds: [0, 7],
      findspotCount: 2,
      accessibleFragmentCount: 3,
      findspots: [
        findspotMapDataDto({
          findspotId: 0,
          siteId: 'URUK',
          siteName: 'Uruk',
          polygonIds: [POLYGON_ID],
          area: 'Pd XVI/4',
          accessibleFragmentCount: 1,
        }),
        findspotMapDataDto({
          findspotId: 7,
          siteId: 'URUK',
          siteName: 'Uruk',
          polygonIds: [POLYGON_ID],
          area: 'Pd XVI/4',
          accessibleFragmentCount: 2,
        }),
      ],
    }
    render(inspector('loaded-with-mappings', summary))

    expect(screen.getByText('Polygon ID')).toBeInTheDocument()
    expect(screen.getByText(POLYGON_ID)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      '3 accessible fragments across 2 findspots.',
    )

    await userEvent.click(screen.getByRole('tab', { name: 'Findspots' }))
    expect(
      screen.getByRole('link', { name: 'Pd XVI/4 — Findspot 0' }),
    ).toHaveAttribute('href', '/library/search?findspotId=0')
    expect(
      screen.getByRole('link', { name: 'Pd XVI/4 — Findspot 7' }),
    ).toHaveAttribute('href', '/library/search?findspotId=7')
  })

  it('updates its polite atomic announcement when loading completes', () => {
    const { rerender } = render(inspector('loading'))

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')

    rerender(inspector('loaded-empty'))

    expect(screen.getByRole('status')).toHaveTextContent(
      '0 accessible fragments across 0 findspots.',
    )
  })
})
