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
const mockSetPolygonData = jest.fn()
const mockQueryRenderedFeatures = jest.fn<unknown[], unknown[]>(() => [])
const mockEaseTo = jest.fn()
const mockGetClusterExpansionZoom = jest.fn()
const mockSetLngLat = jest.fn()
const mockSetDOMContent = jest.fn()
const mockSetHTML = jest.fn()
const mockPopupAddTo = jest.fn()
const mockSetLayoutProperty = jest.fn()
const mockGetLayer = jest.fn((id: string) => ({ id }))

type MockMapEvent = {
  point: { x: number; y: number }
  lngLat: { lng: number; lat: number }
}
type MockEventHandler = (event?: MockMapEvent) => void

const mockEventHandlers: Record<string, MockEventHandler> = {}
let mockLoadImmediately = true
const mockSources = new Map<
  string,
  {
    setData?: typeof mockSetData
    getClusterExpansionZoom?: typeof mockGetClusterExpansionZoom
  }
>()

const mockMapInstance = {
  addSource: mockAddSource,
  addLayer: mockAddLayer,
  addControl: mockAddControl,
  remove: mockRemove,
  getSource: mockGetSource,
  getCanvas: mockGetCanvas,
  getLayer: mockGetLayer,
  on: mockOn,
  isStyleLoaded: mockIsStyleLoaded,
  fitBounds: mockFitBounds,
  queryRenderedFeatures: mockQueryRenderedFeatures,
  easeTo: mockEaseTo,
  setLayoutProperty: mockSetLayoutProperty,
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
    mockSources.clear()
    mockSources.set('ebl-findspots', {
      setData: mockSetData,
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockSources.set('ebl-findspot-polygons', {
      setData: mockSetPolygonData,
    })
    Object.keys(mockEventHandlers).forEach(
      (event) => delete mockEventHandlers[event],
    )
    mockLoadImmediately = true
    mockIsStyleLoaded.mockReturnValue(true)
    mockGetSource.mockImplementation((id: string) => mockSources.get(id))
    mockQueryRenderedFeatures.mockReturnValue([])
    mockGetLayer.mockImplementation((id: string) => ({ id }))
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

  it('renders search input, boundary toggle, and map container after data loads', async () => {
    const fragmentService = makeFragmentService([makeProvenance()])

    render(<MapTab fragmentService={fragmentService} />)

    expect(
      await screen.findByPlaceholderText('Filter by site name...'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Show site boundaries' }),
    ).toBeChecked()
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

  it('adds polygon and point sources with layers in the correct order on load', async () => {
    const provenances = [
      makeProvenance(),
      makeProvenance({
        id: 'nineveh',
        longName: 'Nineveh',
        polygonCoordinates: [
          { latitude: 36.3, longitude: 43.1 },
          { latitude: 36.4, longitude: 43.2 },
          { latitude: 36.35, longitude: 43.15 },
        ],
      }),
    ]

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalledTimes(2)
    })

    expect(mockAddSource.mock.calls[0][0]).toBe('ebl-findspot-polygons')
    expect(mockAddSource.mock.calls[0][1].type).toBe('geojson')
    expect(mockAddSource.mock.calls[0][1].cluster).toBeUndefined()
    expect(mockAddSource.mock.calls[0][1].data.features).toHaveLength(1)

    expect(mockAddSource.mock.calls[1][0]).toBe('ebl-findspots')
    expect(mockAddSource.mock.calls[1][1].cluster).toBe(true)
    expect(mockAddSource.mock.calls[1][1].data.features).toHaveLength(2)

    expect(mockAddLayer).toHaveBeenCalledTimes(5)
    const layerIds = mockAddLayer.mock.calls.map(
      (call: unknown[]) => (call[0] as { id: string }).id,
    )
    expect(layerIds).toEqual([
      'ebl-findspot-polygon-fill',
      'ebl-findspot-polygon-outline',
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

  it('filters provenances case-insensitively across both sources', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({
        id: 'nippur',
        longName: 'Nippur',
        polygonCoordinates: [
          { latitude: 32.1, longitude: 44.1 },
          { latitude: 32.2, longitude: 44.2 },
          { latitude: 32.3, longitude: 44.3 },
        ],
      }),
      makeProvenance({ id: 'uruk', longName: 'Uruk' }),
    ]

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'nip')

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
    expect(mockSetPolygonData).toHaveBeenCalled()

    const pointSetDataCall = mockSetData.mock.calls[
      mockSetData.mock.calls.length - 1
    ][0] as FeatureCollection
    const polygonSetDataCall = mockSetPolygonData.mock.calls[
      mockSetPolygonData.mock.calls.length - 1
    ][0] as FeatureCollection

    expect(pointSetDataCall.features).toHaveLength(1)
    expect(
      (pointSetDataCall.features[0].properties as { name: string }).name,
    ).toBe('Nippur')
    expect(polygonSetDataCall.features).toHaveLength(1)
    expect(
      (polygonSetDataCall.features[0].properties as { name: string }).name,
    ).toBe('Nippur')
  })

  it('uses the active filter when the style loads after filtering', async () => {
    const provenances = [
      makeProvenance({ id: 'babylon', longName: 'Babylon' }),
      makeProvenance({
        id: 'nippur',
        longName: 'Nippur',
        polygonCoordinates: [
          { latitude: 32.1, longitude: 44.1 },
          { latitude: 32.2, longitude: 44.2 },
          { latitude: 32.3, longitude: 44.3 },
        ],
      }),
    ]
    mockLoadImmediately = false
    mockIsStyleLoaded.mockReturnValue(false)

    render(<MapTab fragmentService={makeFragmentService(provenances)} />)

    const input = await screen.findByPlaceholderText('Filter by site name...')
    await userEvent.type(input, 'nip')
    expect(mockAddSource).not.toHaveBeenCalled()

    act(() => {
      mockIsStyleLoaded.mockReturnValue(true)
      mockEventHandlers.load()
    })

    expect(mockAddSource).toHaveBeenCalledTimes(2)
    expect(mockAddSource.mock.calls[0][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[0][1].data.features[0].properties.name,
    ).toBe('Nippur')
    expect(mockAddSource.mock.calls[1][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[1][1].data.features[0].properties.name,
    ).toBe('Nippur')
  })

  it('disables and re-enables boundary layers without hiding points or clusters', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Show site boundaries',
    })

    mockSetLayoutProperty.mockClear()
    await userEvent.click(checkbox)

    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-findspot-polygon-fill',
      'visibility',
      'none',
    )
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-findspot-polygon-outline',
      'visibility',
      'none',
    )
    expect(mockSetLayoutProperty).not.toHaveBeenCalledWith(
      'ebl-unclustered-points',
      'visibility',
      expect.anything(),
    )

    mockSetLayoutProperty.mockClear()
    await userEvent.click(checkbox)

    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-findspot-polygon-fill',
      'visibility',
      'visible',
    )
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-findspot-polygon-outline',
      'visibility',
      'visible',
    )
  })

  it('expands a clicked cluster before checking points or polygons', async () => {
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

    mockQueryRenderedFeatures.mockReturnValueOnce([cluster])
    mockGetClusterExpansionZoom.mockResolvedValue(9)

    act(() => {
      mockEventHandlers.click({
        point: { x: 10, y: 20 },
        lngLat: { lng: 40, lat: 30 },
      })
    })

    expect(mockGetClusterExpansionZoom).toHaveBeenCalledWith(42)
    expect(mockQueryRenderedFeatures).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(mockEaseTo).toHaveBeenCalledWith({
        center: [44.42, 32.542],
        zoom: 9,
      })
    })
  })

  it('opens an unclustered point popup with DOM-safe content', async () => {
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
      mockEventHandlers.click({
        point: { x: 10, y: 20 },
        lngLat: { lng: 50, lat: 40 },
      })
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

  it('opens a polygon popup at the click coordinates', async () => {
    const polygon = {
      type: 'Feature',
      properties: {
        name: 'Nineveh',
        parent: 'Assyria',
        abbreviation: 'Nin',
        geometryType: 'polygon',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [43.1, 36.3],
            [43.2, 36.4],
            [43.15, 36.35],
            [43.1, 36.3],
          ],
        ],
      },
    }
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([polygon])

    act(() => {
      mockEventHandlers.click({
        point: { x: 10, y: 20 },
        lngLat: { lng: 45, lat: 35 },
      })
    })

    expect(mockSetLngLat).toHaveBeenCalledWith([45, 35])
    const content = mockSetDOMContent.mock.calls[0][0] as HTMLElement
    document.body.append(content)
    expect(
      within(content).getByText('Area boundary available'),
    ).toBeInTheDocument()
  })

  it('uses point clicks ahead of polygon clicks when both overlap', async () => {
    const point = {
      type: 'Feature',
      properties: {
        name: 'Babylon',
        abbreviation: 'Bab',
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
      .mockReturnValueOnce([point])

    act(() => {
      mockEventHandlers.click({
        point: { x: 10, y: 20 },
        lngLat: { lng: 45, lat: 35 },
      })
    })

    expect(mockSetLngLat).toHaveBeenCalledWith([44.42, 32.542])
    expect(mockQueryRenderedFeatures).toHaveBeenCalledTimes(2)
  })

  it('sets a pointer cursor for polygon hover and restores it elsewhere', async () => {
    const canvas = { style: { cursor: '' } }
    mockGetCanvas.mockReturnValue(canvas)

    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    mockQueryRenderedFeatures.mockReturnValueOnce([{ id: 'polygon' }])
    act(() => {
      mockEventHandlers.mousemove({
        point: { x: 10, y: 20 },
        lngLat: { lng: 45, lat: 35 },
      })
    })
    expect(canvas).toHaveStyle({ cursor: 'pointer' })

    mockQueryRenderedFeatures.mockReturnValueOnce([])
    act(() => {
      mockEventHandlers.mousemove({
        point: { x: 11, y: 21 },
        lngLat: { lng: 46, lat: 36 },
      })
    })
    expect(canvas).toHaveStyle({ cursor: '' })
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

    expect(mockAddSource.mock.calls[0][1].data.features).toHaveLength(0)
    expect(mockAddSource.mock.calls[1][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[1][1].data.features[0].properties.name,
    ).toBe('Babylon')
  })
})
