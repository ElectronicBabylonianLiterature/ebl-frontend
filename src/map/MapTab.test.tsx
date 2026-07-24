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
  siteId: string
  siteName: string
  title: string
  shortTitle?: string
  dateLabel?: string
  cartographer?: string
  institution?: string
  description?: string
  sourceFilename: string
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

async function openLayerPanel(): Promise<void> {
  await userEvent.click(await screen.findByRole('button', { name: 'Show' }))
}

async function expandHistoricalSite(siteName: string): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', {
      name: new RegExp(`${siteName} historical maps`),
    }),
  )
}

describe('MapTab', () => {
  let rasterLayerIds = new Set<string>()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSources.clear()
    rasterLayerIds = new Set<string>()
    mockSources.set('ebl-findspots', {
      setData: mockSetData,
      getClusterExpansionZoom: mockGetClusterExpansionZoom,
    })
    mockSources.set('ebl-findspot-polygons', {
      setData: mockSetPolygonData,
    })
    mockSources.set('ebl-excavation-areas', {})
    Object.keys(mockEventHandlers).forEach(
      (event) => delete mockEventHandlers[event],
    )
    mockLoadImmediately = true
    mockIsStyleLoaded.mockReturnValue(true)
    mockGetSource.mockImplementation((id: string) => mockSources.get(id))
    mockQueryRenderedFeatures.mockReturnValue([])
    mockGetLayer.mockImplementation((id: string) => {
      if (id.startsWith('ebl-historical-raster-layer-')) {
        return rasterLayerIds.has(id) ? { id } : undefined
      }
      return { id }
    })
    mockAddSource.mockImplementation((id: string) => {
      if (!mockSources.has(id)) {
        mockSources.set(id, {})
      }
    })
    mockAddLayer.mockImplementation((layer: { id: string }) => {
      if (layer.id.startsWith('ebl-historical-raster-layer-')) {
        rasterLayerIds.add(layer.id)
      }
    })
    mockRemoveLayer.mockImplementation((id: string) => {
      if (id === 'ebl-historical-raster-layer') {
        rasterLayerIds = new Set<string>()
      }
    })
    mockRemoveSource.mockImplementation((id: string) => {
      mockSources.delete(id)
    })
    document.body.innerHTML = ''
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
      screen.getByRole('heading', { name: 'Map layers' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Site name')).toBeInTheDocument()
    expect(screen.getByText(/0 historical maps active/)).toBeInTheDocument()
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
      expect(mockAddSource).toHaveBeenCalledTimes(3)
    })

    expect(mockAddSource.mock.calls[0][0]).toBe('ebl-findspot-polygons')
    expect(mockAddSource.mock.calls[0][1].type).toBe('geojson')
    expect(mockAddSource.mock.calls[0][1].cluster).toBeUndefined()
    expect(mockAddSource.mock.calls[0][1].data.features).toHaveLength(1)

    expect(mockAddSource.mock.calls[1][0]).toBe('ebl-excavation-areas')
    expect(mockAddSource.mock.calls[1][1].type).toBe('geojson')
    expect(mockAddSource.mock.calls[1][1].data).toBe(
      '/map-data/findspots/all.geojson',
    )

    expect(mockAddSource.mock.calls[2][0]).toBe('ebl-findspots')
    expect(mockAddSource.mock.calls[2][1].cluster).toBe(true)
    expect(mockAddSource.mock.calls[2][1].data.features).toHaveLength(2)

    expect(mockAddLayer).toHaveBeenCalledTimes(7)
    const layerIds = mockAddLayer.mock.calls.map(
      (call: unknown[]) => (call[0] as { id: string }).id,
    )
    expect(layerIds).toEqual([
      'ebl-findspot-polygon-fill',
      'ebl-findspot-polygon-outline',
      'ebl-excavation-area-fill',
      'ebl-excavation-area-outline',
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

    expect(mockAddSource).toHaveBeenCalledTimes(3)
    expect(mockAddSource.mock.calls[0][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[0][1].data.features[0].properties.name,
    ).toBe('Nippur')
    expect(mockAddSource.mock.calls[2][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[2][1].data.features[0].properties.name,
    ).toBe('Nippur')
  })

  it('disables and re-enables boundary layers without hiding points or clusters', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)

    await openLayerPanel()
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

  it('toggles excavation areas without changing boundary layers', async () => {
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)

    await openLayerPanel()
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Show excavation areas',
    })
    expect(checkbox).not.toBeChecked()

    await waitFor(() => {
      expect(mockSetLayoutProperty).toHaveBeenCalledWith(
        'ebl-excavation-area-fill',
        'visibility',
        'none',
      )
    })

    mockSetLayoutProperty.mockClear()
    await userEvent.click(checkbox)

    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-excavation-area-fill',
      'visibility',
      'visible',
    )
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      'ebl-excavation-area-outline',
      'visibility',
      'visible',
    )
    expect(mockSetLayoutProperty).not.toHaveBeenCalledWith(
      'ebl-findspot-polygon-fill',
      'visibility',
      expect.anything(),
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

  it('opens an excavation-area popup before site-boundary polygons', async () => {
    const excavationArea = {
      type: 'Feature',
      properties: {
        siteName: 'Uruk',
        name: '<script>Eanna</script>',
        sourceId: 12,
      },
      geometry: { type: 'Polygon', coordinates: [] },
    }
    render(<MapTab fragmentService={makeFragmentService([makeProvenance()])} />)
    await waitFor(() => {
      expect(mockAddSource).toHaveBeenCalled()
    })

    mockQueryRenderedFeatures
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce([excavationArea])

    act(() => {
      mockEventHandlers.click({
        point: { x: 10, y: 20 },
        lngLat: { lng: 45, lat: 35 },
      })
    })

    expect(mockSetLngLat).toHaveBeenCalledWith([45, 35])
    expect(mockSetHTML).not.toHaveBeenCalled()
    expect(mockQueryRenderedFeatures).toHaveBeenCalledTimes(3)
    const content = mockSetDOMContent.mock.calls[0][0] as HTMLElement
    document.body.append(content)
    expect(content.innerHTML).not.toContain('<script>')
    expect(
      within(content).getByText('<script>Eanna</script>'),
    ).toBeInTheDocument()
    expect(within(content).getByText('Uruk')).toBeInTheDocument()
    expect(within(content).getByText('Excavation area')).toBeInTheDocument()
    expect(within(content).getByText('Source ID: 12')).toBeInTheDocument()

    await userEvent.click(
      within(content).getByRole('button', {
        name: 'Browse historical maps for Uruk',
      }),
    )

    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByLabelText('Search historical maps')).toHaveValue('Uruk')
    expect(mockAddSource).not.toHaveBeenCalledWith(
      expect.stringMatching(/^ebl-historical-raster-/),
      expect.anything(),
    )
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
    expect(mockAddSource.mock.calls[2][1].data.features).toHaveLength(1)
    expect(
      mockAddSource.mock.calls[2][1].data.features[0].properties.name,
    ).toBe('Babylon')
  })

  describe('Historical map overlays', () => {
    function makeOverlayFixture(overrides = {}) {
      return {
        id: 'babylon-map',
        siteId: 'babylon',
        siteName: 'Babylon',
        title: 'Babylon Historical Map',
        shortTitle: 'Babylon',
        dateLabel: 'c. 600 BCE',
        sourceFilename: 'babylon.tif',
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

    const rnPlate5 = () =>
      makeOverlayFixture({
        id: 'nippur-rn2747-pl5',
        siteId: 'nippur',
        siteName: 'Nippur',
        title: 'RN 2747, Nippur, Plate 5',
        shortTitle: 'RN 2747 — Plate 5',
        seriesId: 'nippur-rn2747',
        seriesTitle: 'RN 2747',
        plateLabel: 'Plate 5',
        sourceFilename: 'RN2747@pl5.tif',
        tiles: [
          '/historical-maps/nippur/nippur-rn2747-pl5/tiles/{z}/{x}/{y}.png',
        ],
        bounds: [45.22, 32.12, 45.23, 32.13],
      })

    const rnPlate52 = () =>
      makeOverlayFixture({
        id: 'nippur-rn2747-pl52',
        siteId: 'nippur',
        siteName: 'Nippur',
        title: 'RN 2747, Nippur, Plate 52',
        shortTitle: 'RN 2747 — Plate 52',
        seriesId: 'nippur-rn2747',
        seriesTitle: 'RN 2747',
        plateLabel: 'Plate 52',
        sourceFilename: 'RN2747@pl52.tif',
        tiles: [
          '/historical-maps/nippur/nippur-rn2747-pl52/tiles/{z}/{x}/{y}.png',
        ],
        bounds: [45.24, 32.14, 45.25, 32.15],
        defaultOpacity: 0.6,
      })

    beforeEach(() => {
      mockValidatedOverlays = [
        makeOverlayFixture(),
        rnPlate5(),
        rnPlate52(),
      ] as unknown as typeof mockValidatedOverlays
    })

    afterEach(() => {
      mockValidatedOverlays = []
    })

    it('is compact by default and reveals grouped checkboxes on demand', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      const toggle = await screen.findByRole('button', { name: 'Show' })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByLabelText('Historical maps')).not.toBeInTheDocument()

      await openLayerPanel()
      expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
      expect(
        screen.getByRole('button', { name: /Babylon historical maps/ }),
      ).toHaveAttribute('aria-expanded', 'false')
      expect(
        screen.getByRole('button', { name: /Nippur historical maps/ }),
      ).toBeInTheDocument()

      await expandHistoricalSite('Babylon')
      expect(
        screen.getByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      ).not.toBeChecked()
      expect(
        screen.queryByText('Active historical maps'),
      ).not.toBeInTheDocument()
    })

    it('selects multiple overlays and creates unique sources and layers below vectors', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Babylon')
      await expandHistoricalSite('Nippur')

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      )
      await userEvent.click(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      )

      await waitFor(() =>
        expect(mockAddSource).toHaveBeenCalledWith(
          'ebl-historical-raster-babylon-map',
          expect.objectContaining({ type: 'raster' }),
        ),
      )
      expect(mockAddSource).toHaveBeenCalledWith(
        'ebl-historical-raster-nippur-rn2747-pl5',
        expect.objectContaining({ type: 'raster' }),
      )
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ebl-historical-raster-layer-babylon-map',
        }),
        'ebl-findspot-polygon-fill',
      )
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ebl-historical-raster-layer-nippur-rn2747-pl5',
        }),
        'ebl-findspot-polygon-fill',
      )
    })

    it('filters catalog entries without removing active overlay controls', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      expect(screen.getByLabelText('Historical maps')).toHaveClass(
        'map-controls__scroll',
      )
      await expandHistoricalSite('Nippur')
      await userEvent.click(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      )

      await userEvent.type(
        screen.getByLabelText('Search historical maps'),
        '52',
      )

      expect(
        screen.queryByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 52' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Active historical maps')).toBeInTheDocument()
      expect(
        screen.getByLabelText('RN 2747 — Plate 5 opacity'),
      ).toBeInTheDocument()
    })

    it('updates opacity for only one active overlay without recreating sources', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Babylon')
      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      )
      expect(await screen.findByText('80%')).toBeInTheDocument()

      mockAddSource.mockClear()
      fireEvent.change(screen.getByLabelText('Babylon — c. 600 BCE opacity'), {
        target: { value: '0.5' },
      })

      await waitFor(() => {
        expect(mockSetPaintProperty).toHaveBeenCalledWith(
          'ebl-historical-raster-layer-babylon-map',
          'raster-opacity',
          0.5,
        )
      })
      expect(mockAddSource).not.toHaveBeenCalled()
    })

    it('removes one overlay without affecting another and can clear all', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Babylon')
      await expandHistoricalSite('Nippur')
      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      )
      await userEvent.click(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      )
      expect(
        await screen.findByText('Active historical maps'),
      ).toBeInTheDocument()

      const activeRows = screen.getAllByRole('button', { name: 'Remove' })
      await userEvent.click(activeRows[0])

      expect(mockRemoveLayer).toHaveBeenCalledWith(
        'ebl-historical-raster-layer-babylon-map',
      )
      expect(mockRemoveSource).toHaveBeenCalledWith(
        'ebl-historical-raster-babylon-map',
      )
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      ).toBeChecked()

      await userEvent.click(screen.getByRole('button', { name: 'Clear maps' }))
      expect(mockRemoveLayer).toHaveBeenCalledWith(
        'ebl-historical-raster-layer-nippur-rn2747-pl5',
      )
    })

    it('shows, hides, and zooms the RN2747 series', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Nippur')

      await userEvent.click(
        await screen.findByRole('button', { name: 'Show series' }),
      )
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      ).toBeChecked()
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 52' }),
      ).toBeChecked()

      await userEvent.click(screen.getAllByRole('button', { name: 'Zoom' })[0])
      expect(mockFitBounds).toHaveBeenCalledWith([45.22, 32.12, 45.25, 32.15], {
        padding: 48,
        maxZoom: 15,
      })

      await userEvent.click(screen.getByRole('button', { name: 'Hide series' }))
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      ).not.toBeChecked()
      expect(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 52' }),
      ).not.toBeChecked()
    })

    it('zooms to one overlay and to all active overlays', async () => {
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Babylon')
      await expandHistoricalSite('Nippur')
      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      )
      await userEvent.click(
        screen.getByRole('checkbox', { name: 'RN 2747 — Plate 5' }),
      )

      await userEvent.click(screen.getAllByRole('button', { name: 'Zoom' })[1])
      expect(mockFitBounds).toHaveBeenCalledWith([44, 32, 45, 33], {
        padding: 48,
        maxZoom: 15,
      })

      await userEvent.click(
        screen.getAllByRole('button', { name: 'Zoom to active maps' })[0],
      )
      expect(mockFitBounds).toHaveBeenCalledWith([44, 32, 45.23, 33], {
        padding: 48,
        maxZoom: 15,
      })
    })

    it('restores selected overlays when style loads after selection', async () => {
      mockLoadImmediately = false
      mockIsStyleLoaded.mockReturnValue(false)
      render(
        <MapTab fragmentService={makeFragmentService([makeProvenance()])} />,
      )

      await openLayerPanel()
      await expandHistoricalSite('Babylon')

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Babylon — c. 600 BCE' }),
      )
      expect(mockAddSource).not.toHaveBeenCalledWith(
        'ebl-historical-raster-babylon-map',
        expect.anything(),
      )

      act(() => {
        mockIsStyleLoaded.mockReturnValue(true)
        mockEventHandlers.load()
      })

      expect(mockAddSource).toHaveBeenCalledWith(
        'ebl-historical-raster-babylon-map',
        expect.anything(),
      )
    })
  })
})
