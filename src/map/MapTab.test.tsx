import React from 'react'
import type { FeatureCollection } from 'geojson'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import { buildFragmentSearchLink } from './mapLinks'
import {
  deferMapLoad,
  makeFailingFragmentService,
  makeFragmentService,
  makeProvenance,
  mockAddControl,
  mockAddLayer,
  mockAddSource,
  mockGetSource,
  mockIsStyleLoaded,
  mockSetData,
  resetMapMocks,
  triggerMapEvent,
} from './MapTab.testHelpers'
import MapTab from './MapTab'

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

  it('filters provenances case-insensitively', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
      makeProvenance({ id: 'uruk', longName: 'Uruk' }),
    ]
    mockGetSource.mockReturnValue({ setData: mockSetData })

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    const setDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    expect(setDataCall.features).toHaveLength(1)
    expect(setDataCall.features[0].properties?.name).toBe('Babylon')
  })

  it('uses the active filter when the style loads after filtering', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({ id: 'nippur', longName: 'Nippur' }),
    ]
    deferMapLoad()
    mockIsStyleLoaded.mockReturnValue(false)

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'bab')
    expect(mockAddSource).not.toHaveBeenCalled()

    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    const source = mockAddSource.mock.calls[0][1]
    expect(source.data.features).toHaveLength(1)
    expect(source.data.features[0].properties.name).toBe('Babylon')
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

  it('handles provenances with no spatial geometry gracefully', async () => {
    const provenances = [
      makeProvenance(),
      makeProvenance({
        id: 'no-geom',
        longName: 'No Geometry',
        coordinates: undefined,
        polygonCoordinates: undefined,
      }),
    ]

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    const sourceCall = mockAddSource.mock.calls[0]
    expect(sourceCall[1].data.features).toHaveLength(1)
    expect(sourceCall[1].data.features[0].properties.name).toBe('Babylon')
  })
})
