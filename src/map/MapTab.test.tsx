import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import { buildFragmentSearchLink } from 'map/mapLinks'

import {
  makeFailingFragmentService,
  makeFragmentService,
  makeProvenance,
  mockAddControl,
  mockAddLayer,
  mockAddSource,
  resetMapMocks,
} from 'map/MapTab.testHelpers'
import MapTab from 'map/MapTab'

jest.mock('maplibre-gl')

function mixedGeometryProvenances(): ReturnType<typeof makeProvenance>[] {
  return [
    makeProvenance(),
    makeProvenance({
      id: 'no-geom',
      longName: 'No Geometry',
      coordinates: undefined,
      polygonCoordinates: undefined,
    }),
  ]
}

describe('MapTab', () => {
  beforeEach(resetMapMocks)

  it('renders loading spinner while data is being fetched', () => {
    const fragmentService = {
      fetchProvenances: () => new Promise(() => {}),
    } as unknown as FragmentService

    render(<MapTab fragmentService={fragmentService} />)

    expect(screen.getByText('Loading map data...')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    render(
      <MapTab fragmentService={makeFailingFragmentService('Network error')} />,
    )

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load map data: Network error'),
      ).toBeInTheDocument()
    })
  })

  it('renders search input, map region, and findspot links', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)

    expect(
      await screen.findByPlaceholderText('Filter by site name...'),
    ).toBeInTheDocument()
    const mapRegion = screen.getByRole('region', {
      name: 'Interactive findspot map',
    })
    expect(mapRegion).toHaveAttribute('aria-describedby')
    expect(screen.getByText(/Matching fragment search links/)).toHaveAttribute(
      'id',
      mapRegion.getAttribute('aria-describedby'),
    )
    expect(screen.getByRole('link', { name: 'Babylon' })).toHaveAttribute(
      'href',
      buildFragmentSearchLink('Babylon'),
    )
  })

  it('shows empty state when filter matches nothing', async () => {
    render(
      <MapTab
        fragmentService={makeFragmentService([
          makeProvenance({ longName: 'Babylon' }),
        ])}
      />,
    )

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'Nippur')

    expect(
      await screen.findByText('No findspots match “Nippur”.'),
    ).toBeInTheDocument()
  })

  it('passes source and layer configs to map on load', async () => {
    const provenances = [
      makeProvenance(),
      makeProvenance({
        id: 'uruk',
        longName: 'Uruk',
        coordinates: { latitude: 31.32, longitude: 45.64 },
      }),
    ]

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    const sourceCall = mockAddSource.mock.calls[0]
    expect(sourceCall[0]).toBe('ebl-findspots')
    expect(sourceCall[1].type).toBe('geojson')
    expect(sourceCall[1].cluster).toBe(true)
    expect(sourceCall[1].data.features).toHaveLength(2)

    expect(mockAddLayer).toHaveBeenCalledTimes(3)
    const layerIds = mockAddLayer.mock.calls.map(
      (call: unknown[]) => (call[0] as { id: string }).id,
    )
    expect(layerIds).toEqual([
      'ebl-clusters',
      'ebl-cluster-count',
      'ebl-unclustered-points',
    ])
  })

  it('creates a map with navigation control', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)

    await waitFor(() => {
      expect(mockAddControl).toHaveBeenCalled()
    })
  })

  it('does not crash with empty provenance data', async () => {
    render(<MapTab fragmentService={makeFragmentService([])} />)

    expect(
      await screen.findByPlaceholderText('Filter by site name...'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Interactive findspot map' }),
    ).toBeInTheDocument()
  })

  it('reports missing data rather than a failed filter match', async () => {
    render(<MapTab fragmentService={makeFragmentService([])} />)

    expect(
      await screen.findByText('No findspot locations are available.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/No findspots match/)).not.toBeInTheDocument()
  })

  it('handles provenances with no spatial geometry gracefully', async () => {
    render(
      <MapTab
        fragmentService={makeFragmentService(mixedGeometryProvenances())}
      />,
    )

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    const sourceCall = mockAddSource.mock.calls[0]
    expect(sourceCall[1].data.features).toHaveLength(1)
    expect(sourceCall[1].data.features[0].properties.name).toBe('Babylon')
  })

  it('links to searches for provenances that have no map geometry', async () => {
    render(
      <MapTab
        fragmentService={makeFragmentService(mixedGeometryProvenances())}
      />,
    )

    expect(
      await screen.findByRole('link', { name: 'No Geometry' }),
    ).toHaveAttribute('href', buildFragmentSearchLink('No Geometry'))
  })

  it.each(['success', 'rejection'])(
    'does not update state after unmount before fetch %s',
    async (outcome) => {
      let resolveFetch!: (
        provenances: readonly ReturnType<typeof makeProvenance>[],
      ) => void
      let rejectFetch!: (error: Error) => void
      const fragmentService = {
        fetchProvenances: () =>
          new Promise((resolve, reject) => {
            resolveFetch = resolve
            rejectFetch = reject
          }),
      } as unknown as FragmentService

      const { unmount } = render(<MapTab fragmentService={fragmentService} />)
      unmount()

      await act(async () => {
        if (outcome === 'success') {
          resolveFetch([makeProvenance()])
        } else {
          rejectFetch(new Error('Late failure'))
        }
      })

      expect(screen.queryByText(/Late failure/)).not.toBeInTheDocument()
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument()
    },
  )
})
