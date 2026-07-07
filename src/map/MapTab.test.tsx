import React from 'react'
import type { FeatureCollection } from 'geojson'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import MapTab from './MapTab'
import { buildFragmentSearchLink } from './mapLinks'

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
const mockQueryRenderedFeatures = jest.fn<unknown[], unknown[]>(() => [])
const mockEaseTo = jest.fn()
const mockGetClusterExpansionZoom = jest.fn()
const mockSetLngLat = jest.fn()
const mockSetDOMContent = jest.fn()
const mockSetHTML = jest.fn()
const mockPopupAddTo = jest.fn()

type MockMapEvent = { point: { x: number; y: number } }
type MockEventHandler = (event?: MockMapEvent) => void

const mockEventHandlers: Record<string, MockEventHandler> = {}
let mockLoadImmediately = true

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
  queryRenderedFeatures: mockQueryRenderedFeatures,
  easeTo: mockEaseTo,
}

jest.mock(
  'maplibre-gl',
  () => {
    class MockMap {
      constructor() {
        return mockMapInstance
      }
    }

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
      setLngLat(coordinates: [number, number]) {
        mockSetLngLat(coordinates)
        return this
      }

      setDOMContent(content: Node) {
        mockSetDOMContent(content)
        return this
      }

      setHTML(content: string) {
        mockSetHTML(content)
        return this
      }

      addTo(map: unknown) {
        mockPopupAddTo(map)
        return this
      }
    }

    return {
      __esModule: true,
      default: {
        Map: MockMap,
        NavigationControl: jest.fn(),
        LngLatBounds: MockLngLatBounds,
        Popup: MockPopup,
      },
    }
  },
  { virtual: true },
)

jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}), { virtual: true })
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
    Object.keys(mockEventHandlers).forEach(
      (event) => delete mockEventHandlers[event],
    )
    mockLoadImmediately = true
    mockIsStyleLoaded.mockReturnValue(true)
    mockGetSource.mockReturnValue(undefined)
    mockQueryRenderedFeatures.mockReturnValue([])
    mockOn.mockImplementation((event: string, callback: unknown) => {
      const handler = callback as MockEventHandler
      mockEventHandlers[event] = handler
      if (event === 'load' && mockLoadImmediately) {
        handler()
      }
      return mockMapInstance
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
    const fragmentService = makeFragmentService([makeProvenance()])

    render(<MapTab fragmentService={fragmentService} />)

    expect(
      await screen.findByPlaceholderText('Filter by site name...'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Findspot map')).toBeInTheDocument()
  })

  it('shows empty state when filter matches nothing', async () => {
    const fragmentService = makeFragmentService([
      makeProvenance({ longName: 'Babylon' }),
    ])

    render(<MapTab fragmentService={fragmentService} />)

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
    mockLoadImmediately = false
    mockIsStyleLoaded.mockReturnValue(false)

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'bab')
    expect(mockAddSource).not.toHaveBeenCalled()

    act(() => {
      mockEventHandlers.load()
    })

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    const source = mockAddSource.mock.calls[0][1]
    expect(source.data.features).toHaveLength(1)
    expect(source.data.features[0].properties.name).toBe('Babylon')
  })

  it('expands a clicked cluster', async () => {
    const clusterIdProperty = 'cluster_id'
    const cluster = {
      type: 'Feature',
      properties: { [clusterIdProperty]: 42 },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    }
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    mockQueryRenderedFeatures.mockReturnValue([cluster])
    mockGetClusterExpansionZoom.mockResolvedValue(9)
    mockGetSource.mockReturnValue({
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })

    act(() => {
      mockEventHandlers.click({ point: { x: 10, y: 20 } })
    })

    expect(mockGetClusterExpansionZoom).toHaveBeenCalledWith(42)
    await waitFor(() => {
      expect(mockEaseTo).toHaveBeenCalledWith({
        center: [44.42, 32.542],
        zoom: 9,
      })
    })
  })

  it('opens an unclustered findspot popup with DOM-safe content', async () => {
    const name = '<img src=x onerror=alert(1)>'
    const parent = 'Babylonia<script>xss</script>'
    const abbreviation = '<script>alert(1)</script>'
    const findspot = {
      type: 'Feature',
      properties: {
        name,
        parent,
        abbreviation,
        geometryType: 'point',
      },
      geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    }
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([findspot])

    act(() => {
      mockEventHandlers.click({ point: { x: 10, y: 20 } })
    })

    expect(mockSetLngLat).toHaveBeenCalledWith([44.42, 32.542])
    expect(mockSetDOMContent).toHaveBeenCalledTimes(1)
    expect(mockSetHTML).not.toHaveBeenCalled()
    expect(mockPopupAddTo).toHaveBeenCalledWith(mockMapInstance)

    const content = mockSetDOMContent.mock.calls[0][0] as HTMLElement
    document.body.append(content)
    const popup = within(content)
    expect(content.innerHTML).not.toContain('<img')
    expect(content.innerHTML).not.toContain('<script')
    expect(popup.getByText(name, { selector: 'strong' })).toHaveTextContent(
      name,
    )
    expect(popup.getByText(`${parent} · ${abbreviation}`)).toBeInTheDocument()
    expect(popup.getByText('32.54°N, 44.42°E')).toBeInTheDocument()
    expect(popup.getByText('Single point')).toBeInTheDocument()
    const link = popup.getByRole('link', { name: 'View fragments' })
    expect(link).toHaveAttribute('href', buildFragmentSearchLink(name))
  })

  it('cleans up map on unmount', async () => {
    const { unmount } = render(
      <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
    )
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    unmount()

    expect(mockRemove).toHaveBeenCalled()
  })

  it('does not crash with empty provenance data', async () => {
    render(<MapTab fragmentService={makeFragmentService([])} />)

    expect(
      await screen.findByPlaceholderText('Filter by site name...'),
    ).toBeInTheDocument()
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

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    const sourceCall = mockAddSource.mock.calls[0]
    expect(sourceCall[1].data.features).toHaveLength(1)
    expect(sourceCall[1].data.features[0].properties.name).toBe('Babylon')
  })
})
