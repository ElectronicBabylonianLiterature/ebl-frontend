import {
  MockLngLatBounds,
  MockPopup,
} from 'map/mapLibreMockObjects.testSupport'
import type {
  MockErrorEvent,
  MockEventHandler,
  MockMapEvent,
} from 'map/mapLibreMockEvents.testSupport'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
export * from 'map/mapLibreMockObjects.testSupport'
export * from 'map/mapLibreMockEvents.testSupport'

const addedLayerIds = new Set<string>()
function rememberAddedLayer(layer: { id: string }): void {
  addedLayerIds.add(layer.id)
}
function findAddedLayer(layerId: string): { id: string } | undefined {
  return addedLayerIds.has(layerId) ? { id: layerId } : undefined
}
export const mockAddSource = jest.fn()
export const mockAddLayer = jest.fn(rememberAddedLayer)
export const mockGetLayer = jest.fn(findAddedLayer)
export const mockRemoveLayer = jest.fn((layerId: string) => {
  addedLayerIds.delete(layerId)
})
export const mockRemoveSource = jest.fn()
export const mockSetLayoutProperty = jest.fn()
export const mockSetPaintProperty = jest.fn()
export const mockIsStyleLoaded = jest.fn(() => true)
export const mockGetStyle = jest.fn<object | undefined, []>(() => ({}))
export const mockOnce = jest.fn()
export const mockAddControl = jest.fn()
export const mockRemove = jest.fn()
export const mockGetSource = jest.fn()
export const mockCanvas = document.createElement('canvas')
export const mockGetCanvas = jest.fn<HTMLCanvasElement, []>(() => mockCanvas)
export const mockOn = jest.fn()
export const mockOff = jest.fn()
export const mockFitBounds = jest.fn()
export const mockSetPadding = jest.fn()
export const mockSetData = jest.fn()
export const mockQueryRenderedFeatures = jest.fn<unknown[], unknown[]>(() => [])
export const mockEaseTo = jest.fn()
export const mockGetClusterExpansionZoom = jest.fn()
export const setWorkerUrl = jest.fn()
const mockEventHandlers: Record<string, MockEventHandler[]> = {}
let mockLoadImmediately = true
let mockMapConstructionError: unknown = null

export const mockMapInstance = {
  addSource: mockAddSource,
  addLayer: mockAddLayer,
  getLayer: mockGetLayer,
  removeLayer: mockRemoveLayer,
  removeSource: mockRemoveSource,
  setLayoutProperty: mockSetLayoutProperty,
  setPaintProperty: mockSetPaintProperty,
  isStyleLoaded: mockIsStyleLoaded,
  getStyle: mockGetStyle,
  once: mockOnce,
  addControl: mockAddControl,
  remove: mockRemove,
  getSource: mockGetSource,
  getCanvas: mockGetCanvas,
  on: mockOn,
  off: mockOff,
  fitBounds: mockFitBounds,
  setPadding: mockSetPadding,
  queryRenderedFeatures: queryRenderedFeaturesFromStyle,
  easeTo: mockEaseTo,
}

function eventKey(event: string, layerId?: string): string {
  return layerId ? `${event}:${layerId}` : event
}

function fireMapEvent(
  event: string,
  eventPayload?: MockMapEvent | MockErrorEvent,
  layerId?: string,
): void {
  if (event === 'load' || event === MAP_STYLE_LOAD_EVENT) {
    mockIsStyleLoaded.mockReturnValue(true)
    mockGetStyle.mockReturnValue({})
  }
  mockEventHandlers[eventKey(event, layerId)]?.forEach((handler) =>
    handler(eventPayload),
  )
}

function queryRenderedFeaturesFromStyle(
  point: unknown,
  options?: { layers?: readonly string[] },
): unknown[] {
  const missingLayerId = options?.layers?.find(
    (layerId) => !addedLayerIds.has(layerId),
  )
  if (missingLayerId !== undefined) {
    fireMapEvent('error', {
      error: {
        message: `The layer '${missingLayerId}' does not exist in the map's style and cannot be queried for features.`,
      },
    })
    return []
  }

  return mockQueryRenderedFeatures(point, options)
}

export function clearMockStyleResources(): void {
  addedLayerIds.clear()
  mockGetSource.mockReturnValue(undefined)
}

export function markLayersAdded(...layerIds: readonly string[]): void {
  layerIds.forEach((layerId) => addedLayerIds.add(layerId))
}

function rememberHandler(
  event: string,
  layerOrCallback: string | MockEventHandler,
  callback?: MockEventHandler,
): void {
  const layerId =
    typeof layerOrCallback === 'string' ? layerOrCallback : undefined
  const handler = (callback ?? layerOrCallback) as MockEventHandler
  const key = eventKey(event, layerId)
  mockEventHandlers[key] = [...(mockEventHandlers[key] ?? []), handler]
  if (event === 'load' && mockLoadImmediately) {
    handler()
  }
}

class MockMap {
  constructor() {
    if (mockMapConstructionError) {
      throw mockMapConstructionError
    }
    return mockMapInstance
  }
}

const NavigationControl = jest.fn()

export function deferMapLoad(): void {
  mockLoadImmediately = false
  mockIsStyleLoaded.mockReturnValue(false)
  mockGetStyle.mockReturnValue(undefined)
}

export function failMapConstruction(error: unknown): void {
  mockMapConstructionError = error
}

export function resetMapMocks(): void {
  jest.clearAllMocks()
  Object.keys(mockEventHandlers).forEach((event) => {
    delete mockEventHandlers[event]
  })
  addedLayerIds.clear()
  mockCanvas.style.cursor = ''
  mockLoadImmediately = true
  mockMapConstructionError = null
  mockGetCanvas.mockReturnValue(mockCanvas)
  mockGetSource.mockReturnValue(undefined)
  mockIsStyleLoaded.mockReturnValue(true)
  mockGetStyle.mockReturnValue({})
  mockQueryRenderedFeatures.mockReturnValue([])
  mockAddLayer.mockImplementation(rememberAddedLayer)
  mockGetLayer.mockImplementation(findAddedLayer)
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
  mockOnce.mockImplementation((event: string, callback: MockEventHandler) => {
    const onceHandler: MockEventHandler = (payload) => {
      const handlers = mockEventHandlers[event] ?? []
      mockEventHandlers[event] = handlers.filter(
        (handler) => handler !== onceHandler,
      )
      callback(payload)
    }
    onceHandler.originalHandler = callback
    rememberHandler(event, onceHandler)
    return mockMapInstance
  })
  mockOff.mockImplementation(
    (
      event: string,
      layerOrCallback: string | MockEventHandler,
      callback?: MockEventHandler,
    ) => {
      const layerId =
        typeof layerOrCallback === 'string' ? layerOrCallback : undefined
      const handler = (callback ?? layerOrCallback) as MockEventHandler
      const key = eventKey(event, layerId)
      mockEventHandlers[key] = (mockEventHandlers[key] ?? []).filter(
        (candidate) =>
          candidate !== handler && candidate.originalHandler !== handler,
      )
      return mockMapInstance
    },
  )
}

export function triggerMapEvent(
  event: string,
  eventPayload?: MockMapEvent | MockErrorEvent,
  layerId?: string,
): void {
  fireMapEvent(event, eventPayload, layerId)
}

const maplibregl = {
  Map: MockMap,
  NavigationControl,
  LngLatBounds: MockLngLatBounds,
  Popup: MockPopup,
  setWorkerUrl,
}

export {
  MockMap as Map,
  NavigationControl,
  MockLngLatBounds as LngLatBounds,
  MockPopup as Popup,
}
export default maplibregl
