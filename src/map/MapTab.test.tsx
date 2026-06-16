import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import MapTab from './MapTab'

const mockAddSource = jest.fn()
const mockAddLayer = jest.fn()
const mockAddControl = jest.fn()
const mockRemove = jest.fn()
const mockGetSource = jest.fn()
const mockGetCanvas = jest.fn(() => ({ style: {} }))
const mockOn = jest.fn()
const mockIsStyleLoaded = jest.fn(() => true)
const mockFitBounds = jest.fn()
const mockSetData = jest.fn()

const mockMapInstance = {
  addSource: mockAddSource,
  addLayer: mockAddLayer,
  addControl: mockAddControl,
  remove: mockRemove,
  getSource: mockGetSource,
  getCanvas: mockGetCanvas,
  on: mockOn,
  isStyleLoaded: mockIsStyleLoaded,
  fitBounds: mockFitBounds,
}

jest.mock('maplibre-gl', () => {
  class MockLngLatBounds {
    private sw: [number, number] | null = null
    private ne: [number, number] | null = null
    extend() {
      this.sw = [0, 0]
      this.ne = [1, 1]
      return this
    }
    isEmpty() {
      return false
    }
  }

  class MockPopup {
    setLngLat() {
      return this
    }
    setHTML() {
      return this
    }
    addTo() {
      return this
    }
  }

  return {
    __esModule: true,
    default: {
      Map: jest.fn(() => mockMapInstance),
      NavigationControl: jest.fn(),
      LngLatBounds: MockLngLatBounds,
      Popup: MockPopup,
      GeoJSONSource: jest.fn(),
    },
  }
})

jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}))
jest.mock('./MapTab.sass', () => ({}))

function makeProvenance(
  overrides: Partial<ProvenanceRecord> = {},
): ProvenanceRecord {
  return {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    sortKey: 1,
    coordinates: { latitude: 32.542, longitude: 44.42 },
    ...overrides,
  }
}

function makeFragmentService(
  provenances: readonly ProvenanceRecord[],
): FragmentService {
  return {
    fetchProvenances: () => Bluebird.resolve(provenances),
  } as unknown as FragmentService
}

function makeFailingFragmentService(message: string): FragmentService {
  return {
    fetchProvenances: () => Bluebird.reject(new Error(message)),
  } as unknown as FragmentService
}

describe('MapTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsStyleLoaded.mockReturnValue(true)
    mockOn.mockImplementation((event: string, callback: unknown) => {
      if (event === 'load') {
        const cb = callback as (() => void) | undefined
        if (typeof cb === 'function') cb()
      }
    })
  })

  it('renders loading spinner while data is being fetched', () => {
    const fragmentService = {
      fetchProvenances: () => new Bluebird(() => {}),
    } as unknown as FragmentService

    render(<MapTab fragmentService={fragmentService} />)
    expect(screen.getByText('Loading map data...')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    const fragmentService = makeFailingFragmentService('Network error')

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(
        screen.getByText('Failed to load map data: Network error'),
      ).toBeInTheDocument()
    })
  })

  it('renders search input and map container after data loads', async () => {
    const provenances = [makeProvenance()]
    const fragmentService = makeFragmentService(provenances)

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Filter by site name...'),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Findspot map')).toBeInTheDocument()
  })

  it('shows empty state when filter matches nothing', async () => {
    const provenances = [makeProvenance({ longName: 'Babylon' })]
    const fragmentService = makeFragmentService(provenances)

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Filter by site name...'),
      ).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'Nippur')

    await waitFor(() => {
      expect(
        screen.getByText('No findspots match “Nippur”.'),
      ).toBeInTheDocument()
    })
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
    const fragmentService = makeFragmentService(provenances)

    render(<MapTab fragmentService={fragmentService} />)
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
    const provenances = [makeProvenance()]
    const fragmentService = makeFragmentService(provenances)

    render(<MapTab fragmentService={fragmentService} />)
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
    const fragmentService = makeFragmentService(provenances)
    mockIsStyleLoaded.mockReturnValue(true)
    mockGetSource.mockReturnValue({ setData: mockSetData })

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Filter by site name...'),
      ).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Filter by site name...')
    await userEvent.clear(input)
    await userEvent.type(input, 'bab')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    const setDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as GeoJSON.FeatureCollection
    expect(setDataCall.features).toHaveLength(1)
    expect((setDataCall.features[0].properties as { name: string }).name).toBe(
      'Babylon',
    )
  })

  it('cleans up map on unmount', async () => {
    const provenances = [makeProvenance()]
    const fragmentService = makeFragmentService(provenances)

    const { unmount } = render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    unmount()
    expect(mockRemove).toHaveBeenCalled()
  })

  it('does not crash with empty provenance data', async () => {
    const fragmentService = makeFragmentService([])

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Filter by site name...'),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Findspot map')).toBeInTheDocument()
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
    const fragmentService = makeFragmentService(provenances)

    render(<MapTab fragmentService={fragmentService} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    const sourceCall = mockAddSource.mock.calls[0]
    expect(sourceCall[1].data.features).toHaveLength(1)
    expect(sourceCall[1].data.features[0].properties.name).toBe('Babylon')
  })
})
