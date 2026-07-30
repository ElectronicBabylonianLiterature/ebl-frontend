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
export const mockBoundsExtend = jest.fn()

export type MockMapEvent = { point: { x: number; y: number } }
export type MockErrorEvent = {
  error?: { message?: string }
  resourceType?: string
  url?: string
}
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

class MockMap {
  constructor() {
    return mockMapInstance
  }
}

class MockLngLatBounds {
  private points: [number, number][] = []

  extend(coordinates: [number, number]) {
    this.points.push(coordinates)
    mockBoundsExtend(coordinates)
    return this
  }

  isEmpty() {
    return this.points.length === 0
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

const NavigationControl = jest.fn()

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

const maplibregl = {
  Map: MockMap,
  NavigationControl,
  LngLatBounds: MockLngLatBounds,
  Popup: MockPopup,
}

export default maplibregl
