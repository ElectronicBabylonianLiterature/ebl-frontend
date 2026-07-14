import React from 'react'
import type { FeatureCollection } from 'geojson'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
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
const mockGetLayer = jest.fn((id: string): { id: string } | undefined => ({
  id,
}))
const mockRemoveLayer = jest.fn()
const mockRemoveSource = jest.fn()
const mockSetPaintProperty = jest.fn()

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
  removeLayer: mockRemoveLayer,
  removeSource: mockRemoveSource,
  setPaintProperty: mockSetPaintProperty,
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

let mockValidatedOverlays: readonly {
  id: string
  title: string
  shortTitle?: string
  dateLabel?: string
  cartographer?: string
  institution?: string
  description?: string
  attribution: string
  sourceUrl?: string
  tiles: readonly string[]
  bounds?: readonly [number, number, number, number]
  minZoom?: number
  maxZoom?: number
  tileSize?: number
  defaultOpacity: number
  type: string
}[] = []

jest.mock('./historicalOverlays', () => {
  const actual = jest.requireActual(
    './historicalOverlays',
  ) as typeof import('./historicalOverlays')
  return {
    __esModule: true,
    ...actual,
    get validatedHistoricalMapOverlays() {
      return mockValidatedOverlays
    },
  }
})

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
  let rasterLayerExists = false

  beforeEach(() => {
    jest.clearAllMocks()
    mockSources.clear()
    rasterLayerExists = false
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
    mockGetLayer.mockImplementation((id: string) => {
      if (id === 'ebl-historical-raster-layer' && !rasterLayerExists) {
        return undefined
      }
      return { id }
    })
    mockAddSource.mockImplementation((id: string) => {
      if (!mockSources.has(id)) {
        mockSources.set(id, {})
      }
    })
    mockAddLayer.mockImplementation((layer: { id: string }) => {
      if (layer.id === 'ebl-historical-raster-layer') {
        rasterLayerExists = true
      }
    })
    mockRemoveLayer.mockImplementation((id: string) => {
      if (id === 'ebl-historical-raster-layer') {
        rasterLayerExists = false
      }
    })
    mockRemoveSource.mockImplementation((id: string) => {
      mockSources.delete(id)
    })
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

  it('renders grouped search, display controls, and map container after data loads', async () => {
    const fragmentService = makeFragmentService([makeProvenance()])

    render(<MapTab fragmentService={fragmentService} />)

    expect(
      await screen.findByRole('heading', { name: 'Find a site' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Map display' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Site name')).toBeInTheDocument()
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
    const canvas = document.createElement('canvas')
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

  describe('Historical map overlay', () => {
    function makeOverlayFixture(overrides = {}) {
      return {
        id: 'babylon-map',
        title: 'Babylon Historical Map',
        shortTitle: 'Babylon',
        dateLabel: 'c. 600 BCE',
        cartographer: 'Unknown',
        institution: 'British Museum',
        description: 'A historical map',
        attribution: 'British Museum, 1900',
        sourceUrl: 'https://example.com/source',
        type: 'raster-tiles',
        tiles: ['https://example.com/{z}/{x}/{y}.png'],
        bounds: [44, 32, 45, 33],
        minZoom: 5,
        maxZoom: 15,
        tileSize: 256,
        defaultOpacity: 0.8,
        ...overrides,
      }
    }

    function makeOverlayFixture2(overrides = {}) {
      return {
        id: 'nippur-map',
        title: 'Nippur Historical Map',
        shortTitle: 'Nippur',
        dateLabel: 'c. 1500 BCE',
        attribution: 'University of Pennsylvania, 1920',
        sourceUrl: 'https://example.com/nippur',
        type: 'raster-tiles',
        tiles: ['https://example.com/nippur/{z}/{x}/{y}.png'],
        defaultOpacity: 0.6,
        ...overrides,
      }
    }

    beforeEach(() => {
      mockValidatedOverlays = [
        makeOverlayFixture(),
        makeOverlayFixture2(),
      ] as unknown as typeof mockValidatedOverlays
    })

    afterEach(() => {
      mockValidatedOverlays = []
    })

    it('shows empty state when production manifest is empty', async () => {
      mockValidatedOverlays = []
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      expect(select).toBeDisabled()
      expect(
        screen.getByText('No historical maps available'),
      ).toBeInTheDocument()
    })

    it('renders fixture entries in the selector', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select: HTMLSelectElement = await screen.findByLabelText(
        'Select historical map overlay',
      )
      expect(select).toBeEnabled()
      expect(screen.getByText('No historical map')).toBeInTheDocument()
      expect(screen.getByText('Babylon - c. 600 BCE')).toBeInTheDocument()
      expect(screen.getByText('Nippur - c. 1500 BCE')).toBeInTheDocument()
    })

    it('renders optional date label in selector', async () => {
      mockValidatedOverlays = [
        makeOverlayFixture(),
      ] as unknown as typeof mockValidatedOverlays
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      expect(
        await screen.findByText('Babylon - c. 600 BCE'),
      ).toBeInTheDocument()
    })

    it('defaults to None selection', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select: HTMLSelectElement = await screen.findByLabelText(
        'Select historical map overlay',
      )
      expect(select.value).toBe('')
    })

    it('adds raster source and layer when an overlay is selected', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.objectContaining({ type: 'raster' }),
        )
      })
      await waitFor(() => {
        expect(mockAddLayer).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'ebl-historical-raster-layer',
            type: 'raster',
          }),
          'ebl-findspot-polygon-fill',
        )
      })
    })

    it('inserts raster layer beneath polygon fill', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        const layerCalls = mockAddLayer.mock.calls.filter(
          (call: unknown[]) =>
            (call[0] as { id: string }).id === 'ebl-historical-raster-layer',
        )
        expect(layerCalls.length).toBeGreaterThan(0)
      })
      const layerCalls = mockAddLayer.mock.calls.filter(
        (call: unknown[]) =>
          (call[0] as { id: string }).id === 'ebl-historical-raster-layer',
      )
      expect(layerCalls[0][1]).toBe('ebl-findspot-polygon-fill')
    })

    it('shows opacity slider when overlay is selected', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      expect(
        await screen.findByLabelText('Historical map opacity'),
      ).toBeInTheDocument()
    })

    it('uses default opacity from overlay', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument()
      })
    })

    it('updates opacity via setPaintProperty without recreating source', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.anything(),
        )
      })

      mockAddSource.mockClear()
      mockAddLayer.mockClear()

      const slider = screen.getByLabelText('Historical map opacity')
      fireEvent.change(slider, { target: { value: '0.5' } })

      await waitFor(() => {
        expect(mockSetPaintProperty).toHaveBeenCalledWith(
          'ebl-historical-raster-layer',
          'raster-opacity',
          expect.any(Number),
        )
      })
      expect(mockAddSource).not.toHaveBeenCalled()
      expect(mockAddLayer).not.toHaveBeenCalled()
    })

    it('removes old layer and source when switching overlays', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.anything(),
        )
      })

      mockRemoveLayer.mockClear()
      mockRemoveSource.mockClear()
      mockAddSource.mockClear()

      await userEvent.selectOptions(select, 'nippur-map')

      await waitFor(() => {
        expect(mockRemoveLayer).toHaveBeenCalledWith(
          'ebl-historical-raster-layer',
        )
      })
      await waitFor(() => {
        expect(mockRemoveSource).toHaveBeenCalledWith('ebl-historical-raster')
      })
      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.objectContaining({
            tiles: ['https://example.com/nippur/{z}/{x}/{y}.png'],
          }),
        )
      })
    })

    it('removes raster layer and source when clearing overlay', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument()
      })

      mockRemoveLayer.mockClear()
      mockRemoveSource.mockClear()

      await userEvent.click(screen.getByText('Remove'))

      await waitFor(() => {
        expect(mockRemoveLayer).toHaveBeenCalledWith(
          'ebl-historical-raster-layer',
        )
      })
      await waitFor(() => {
        expect(mockRemoveSource).toHaveBeenCalledWith('ebl-historical-raster')
      })
    })

    it('preserves boundaries when overlay is selected', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      expect(
        await screen.findByRole('checkbox', { name: 'Show site boundaries' }),
      ).toBeChecked()

      const select = screen.getByLabelText('Select historical map overlay')
      await userEvent.selectOptions(select, 'babylon-map')

      expect(
        screen.getByRole('checkbox', { name: 'Show site boundaries' }),
      ).toBeChecked()
    })

    it('preserves filter state when overlay is selected', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const filterInput = await screen.findByPlaceholderText(
        'Filter by site name...',
      )
      await userEvent.type(filterInput, 'Babylon')

      const select = screen.getByLabelText('Select historical map overlay')
      await userEvent.selectOptions(select, 'babylon-map')

      expect(filterInput).toHaveValue('Babylon')
    })

    it('keeps point and polygon sources intact after overlay selection', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-findspot-polygons',
          expect.anything(),
        )
      })
      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-findspots',
          expect.anything(),
        )
      })

      mockAddSource.mockClear()

      const select = screen.getByLabelText('Select historical map overlay')
      await userEvent.selectOptions(select, 'babylon-map')

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.anything(),
        )
      })

      const nonRasterCalls = mockAddSource.mock.calls.filter(
        (call: unknown[]) => call[0] !== 'ebl-historical-raster',
      )
      expect(nonRasterCalls).toHaveLength(0)
    })

    it('renders source link with secure attributes', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      const link: HTMLAnchorElement = await screen.findByText('Source')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.href).toBe('https://example.com/source')
    })

    it('renders metadata as plain text without markup', async () => {
      mockValidatedOverlays = [
        makeOverlayFixture({
          description: '<script>alert(1)</script>',
        }),
      ] as unknown as typeof mockValidatedOverlays

      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      const details = await screen.findByText('<script>alert(1)</script>')
      expect(details).toBeInTheDocument()
      expect(details.innerHTML).not.toContain('<script>')
    })

    it('renders attribution text', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      expect(
        await screen.findByText('British Museum, 1900'),
      ).toBeInTheDocument()
    })

    it('hides opacity when no overlay is selected', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await screen.findByLabelText('Select historical map overlay')

      expect(
        screen.queryByLabelText('Historical map opacity'),
      ).not.toBeInTheDocument()
    })

    it('hides metadata and source link when no overlay is active', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await screen.findByLabelText('Select historical map overlay')

      expect(screen.queryByText('Source')).not.toBeInTheDocument()
      expect(screen.queryByText('British Museum, 1900')).not.toBeInTheDocument()
    })

    it('does not render a source link when sourceUrl is absent', async () => {
      mockValidatedOverlays = [
        makeOverlayFixture({ sourceUrl: undefined }),
      ] as unknown as typeof mockValidatedOverlays

      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      await userEvent.selectOptions(select, 'babylon-map')

      await screen.findByText('British Museum, 1900')
      expect(screen.queryByText('Source')).not.toBeInTheDocument()
    })

    it('selects real overlay entry with expected tile template and bounds', async () => {
      const assurOverlay = {
        id: 'assur-andrae-1938-beilage',
        title: 'Andrae 1938, Aššur, Beilage',
        shortTitle: 'Andrae 1938',
        dateLabel: '1938',
        description:
          'Georeferenced historical plan of Aššur. The overlay is suitable for site-scale orientation, but historical source material and georeferencing may include spatial inaccuracies.',
        attribution:
          'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
        type: 'raster-tiles',
        tiles: [
          '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
        ],
        bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
        minZoom: 12,
        maxZoom: 17,
        tileSize: 256,
        defaultOpacity: 0.7,
      }

      mockValidatedOverlays = [
        assurOverlay,
      ] as unknown as typeof mockValidatedOverlays

      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const select = await screen.findByLabelText(
        'Select historical map overlay',
      )
      expect(select).toBeEnabled()
      expect(screen.getByText('No historical map')).toBeInTheDocument()
      expect(screen.getByText('Andrae 1938 - 1938')).toBeInTheDocument()

      await userEvent.selectOptions(select, 'assur-andrae-1938-beilage')

      await waitFor(() => {
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.objectContaining({
            type: 'raster',
            tiles: [
              '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
            ],
            bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
            minzoom: 12,
            maxzoom: 17,
            tileSize: 256,
            attribution:
              'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
          }),
        )
      })

      await waitFor(() => {
        expect(mockAddLayer).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'ebl-historical-raster-layer',
            type: 'raster',
          }),
          'ebl-findspot-polygon-fill',
        )
      })

      expect(
        await screen.findByText(
          'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
        ),
      ).toBeInTheDocument()
      expect(screen.queryByText('Source')).not.toBeInTheDocument()
      expect(screen.getByText('70%')).toBeInTheDocument()
    })

    describe('style-load race', () => {
      it('applies the latest overlay exactly once when style loads after selection', async () => {
        const assurOverlay = {
          id: 'assur-andrae-1938-beilage',
          title: 'Andrae 1938, Aššur, Beilage',
          shortTitle: 'Andrae 1938',
          dateLabel: '1938',
          attribution:
            'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
          type: 'raster-tiles',
          tiles: [
            '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
          ],
          bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
          minZoom: 12,
          maxZoom: 17,
          tileSize: 256,
          defaultOpacity: 0.7,
        }

        mockValidatedOverlays = [
          assurOverlay,
        ] as unknown as typeof mockValidatedOverlays

        mockLoadImmediately = false
        mockIsStyleLoaded.mockReturnValue(false)

        render(
          <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
        )

        const select = await screen.findByLabelText(
          'Select historical map overlay',
        )
        await userEvent.selectOptions(select, 'assur-andrae-1938-beilage')

        expect(mockAddSource).not.toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.anything(),
        )

        act(() => {
          mockIsStyleLoaded.mockReturnValue(true)
          mockEventHandlers.load()
        })

        const rasterSourceCalls = mockAddSource.mock.calls.filter(
          (call: unknown[]) => call[0] === 'ebl-historical-raster',
        )
        expect(rasterSourceCalls).toHaveLength(1)

        const rasterLayerCalls = mockAddLayer.mock.calls.filter(
          (call: unknown[]) =>
            (call[0] as { id: string }).id === 'ebl-historical-raster-layer',
        )
        expect(rasterLayerCalls).toHaveLength(1)

        expect(rasterLayerCalls[0][1]).toBe('ebl-findspot-polygon-fill')

        expect(rasterSourceCalls[0][1]).toEqual(
          expect.objectContaining({
            type: 'raster',
            tiles: [
              '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
            ],
          }),
        )
      })

      it('uses the expected opacity from the overlay', async () => {
        const assurOverlay = {
          id: 'assur-andrae-1938-beilage',
          title: 'Andrae 1938, Aššur, Beilage',
          shortTitle: 'Andrae 1938',
          dateLabel: '1938',
          attribution:
            'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
          type: 'raster-tiles',
          tiles: [
            '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
          ],
          bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
          minZoom: 12,
          maxZoom: 17,
          tileSize: 256,
          defaultOpacity: 0.7,
        }

        mockValidatedOverlays = [
          assurOverlay,
        ] as unknown as typeof mockValidatedOverlays

        mockLoadImmediately = false
        mockIsStyleLoaded.mockReturnValue(false)

        render(
          <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
        )

        const select = await screen.findByLabelText(
          'Select historical map overlay',
        )
        await userEvent.selectOptions(select, 'assur-andrae-1938-beilage')

        act(() => {
          mockIsStyleLoaded.mockReturnValue(true)
          mockEventHandlers.load()
        })

        const rasterLayerCalls = mockAddLayer.mock.calls.filter(
          (call: unknown[]) =>
            (call[0] as { id: string }).id === 'ebl-historical-raster-layer',
        )

        const layerObj = rasterLayerCalls[0][0] as {
          paint?: { 'raster-opacity'?: number }
        }
        expect(layerObj.paint?.['raster-opacity']).toBe(0.7)
      })

      it('does not create duplicate sources when overlay re-selected', async () => {
        const assurOverlay = {
          id: 'assur-andrae-1938-beilage',
          title: 'Andrae 1938, Aššur, Beilage',
          shortTitle: 'Andrae 1938',
          dateLabel: '1938',
          attribution:
            'Andrae 1938, Aššur, Beilage. Georeferenced dataset supplied to eBL. Publication rights pending confirmation.',
          type: 'raster-tiles',
          tiles: [
            '/historical-maps/assur-andrae-1938-beilage/tiles/{z}/{x}/{y}.png',
          ],
          bounds: [43.2507948, 35.4442168, 43.268817, 35.4629941],
          minZoom: 12,
          maxZoom: 17,
          tileSize: 256,
          defaultOpacity: 0.7,
        }

        mockValidatedOverlays = [
          assurOverlay,
        ] as unknown as typeof mockValidatedOverlays

        mockLoadImmediately = false
        mockIsStyleLoaded.mockReturnValue(false)

        render(
          <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
        )

        const select = await screen.findByLabelText(
          'Select historical map overlay',
        )
        await userEvent.selectOptions(select, 'assur-andrae-1938-beilage')

        expect(mockAddSource).not.toHaveBeenCalledWith(
          'ebl-historical-raster',
          expect.anything(),
        )

        act(() => {
          mockIsStyleLoaded.mockReturnValue(true)
          mockEventHandlers.load()
        })

        const rasterSourceCalls = mockAddSource.mock.calls.filter(
          (call: unknown[]) => call[0] === 'ebl-historical-raster',
        )
        expect(rasterSourceCalls).toHaveLength(1)
      })
    })
  })
})
