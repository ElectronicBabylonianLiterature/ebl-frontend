import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export const mockAddSource = jest.fn()
export const mockAddLayer = jest.fn()
export const mockAddControl = jest.fn()
export const mockRemove = jest.fn()
export const mockGetSource = jest.fn()
export const mockCanvas = document.createElement('div')
export const mockGetCanvas = jest.fn<HTMLElement | undefined, []>(
  () => mockCanvas,
)
export const mockOn = jest.fn()
export const mockOff = jest.fn()
export const mockIsStyleLoaded = jest.fn(() => true)
export const mockFitBounds = jest.fn()
export const mockSetData = jest.fn()
export const mockQueryRenderedFeatures = jest.fn<unknown[], unknown[]>(() => [])
export const mockEaseTo = jest.fn()
export const mockGetClusterExpansionZoom = jest.fn()
export const mockSetLngLat = jest.fn()
export const mockSetDOMContent = jest.fn()
export const mockSetHTML = jest.fn()
export const mockPopupAddTo = jest.fn()

export type MockMapEvent = { point: { x: number; y: number } }
export type MockErrorEvent = { error?: { message?: string } }
type MockEventHandler = (event?: MockMapEvent | MockErrorEvent) => void

const mockEventHandlers: Record<string, MockEventHandler> = {}
let mockLoadImmediately = true

export const mockMapInstance = {
  addSource: mockAddSource,
  addLayer: mockAddLayer,
  addControl: mockAddControl,
  remove: mockRemove,
  getSource: mockGetSource,
  getCanvas: mockGetCanvas,
  on: mockOn,
  off: mockOff,
  isStyleLoaded: mockIsStyleLoaded,
  fitBounds: mockFitBounds,
  queryRenderedFeatures: mockQueryRenderedFeatures,
  easeTo: mockEaseTo,
}

function eventKey(event: string, layerId?: string): string {
  return layerId ? `${event}:${layerId}` : event
}

function rememberHandler(
  event: string,
  layerOrCallback: string | MockEventHandler,
  callback?: MockEventHandler,
): void {
  const layerId =
    typeof layerOrCallback === 'string' ? layerOrCallback : undefined
  const handler = (callback ?? layerOrCallback) as MockEventHandler
  mockEventHandlers[eventKey(event, layerId)] = handler
  if (event === 'load' && mockLoadImmediately) {
    handler()
  }
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
        return this.sw === null
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

export function makeProvenance(
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

export function makeFragmentService(
  provenances: readonly ProvenanceRecord[],
): FragmentService {
  return {
    fetchProvenances: () => Bluebird.resolve(provenances),
  } as unknown as FragmentService
}

export function makeFailingFragmentService(message: string): FragmentService {
  return {
    fetchProvenances: () => Bluebird.reject(new Error(message)),
  } as unknown as FragmentService
}

export function deferMapLoad(): void {
  mockLoadImmediately = false
}

export function resetMapMocks(): void {
  jest.clearAllMocks()
  Object.keys(mockEventHandlers).forEach((event) => {
    delete mockEventHandlers[event]
  })
  mockCanvas.style.cursor = ''
  mockLoadImmediately = true
  mockIsStyleLoaded.mockReturnValue(true)
  mockGetCanvas.mockReturnValue(mockCanvas)
  mockGetSource.mockReturnValue(undefined)
  mockQueryRenderedFeatures.mockReturnValue([])
  mockOn.mockImplementation(
    (
      event: string,
      layerOrCallback: string | MockEventHandler,
      callback?: MockEventHandler,
    ) => {
      rememberHandler(event, layerOrCallback, callback)
      return mockMapInstance
    },
  )
  mockOff.mockReturnValue(mockMapInstance)
}

export function triggerMapEvent(
  event: string,
  eventPayload?: MockMapEvent | MockErrorEvent,
  layerId?: string,
): void {
  mockEventHandlers[eventKey(event, layerId)]?.(eventPayload)
}
