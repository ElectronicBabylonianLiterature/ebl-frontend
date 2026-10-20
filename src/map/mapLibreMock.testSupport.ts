import { createMapMock } from 'test-support/maplibre-map-helpers'
import {
  MockLngLatBounds,
  MockPopup,
} from 'map/mapLibreMockObjects.testSupport'
import {
  mockGetBounds,
  mockGetCenter,
  type MockErrorEvent,
  type MockEventHandler,
  type MockMapEvent,
} from 'map/mapLibreMockEvents.testSupport'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
export * from 'map/mapLibreMockObjects.testSupport'
export * from 'map/mapLibreMockEvents.testSupport'

const mockMapMethods = createMapMock()
const addedLayerIds = new Set<string>()
function rememberAddedLayer(layer: { id: string }): void {
  addedLayerIds.add(layer.id)
}
function findAddedLayer(layerId: string): { id: string } | undefined {
  return addedLayerIds.has(layerId) ? { id: layerId } : undefined
}
export const mockAddSource = mockMapMethods.addSource
export const mockAddLayer =
  mockMapMethods.addLayer.mockImplementation(rememberAddedLayer)
export const mockGetLayer =
  mockMapMethods.getLayer.mockImplementation(findAddedLayer)
export const mockRemoveLayer = mockMapMethods.removeLayer.mockImplementation(
  (layerId: string) => {
    addedLayerIds.delete(layerId)
  },
)
export const mockRemoveSource = mockMapMethods.removeSource
export const mockSetLayoutProperty = mockMapMethods.setLayoutProperty
export const mockSetTerrain = mockMapMethods.setTerrain
export const mockResize = mockMapMethods.resize
export const mockSetPaintProperty = mockMapMethods.setPaintProperty
export const mockSetFeatureState = jest.fn()
export const mockIsStyleLoaded = mockMapMethods.isStyleLoaded
export const mockGetStyle = jest.fn<object | undefined, []>(() => ({}))
export const mockOnce = mockMapMethods.once
export const mockAddControl = jest.fn()
export const mockRemove = mockMapMethods.remove
export const mockGetSource = mockMapMethods.getSource
export const mockCanvas = document.createElement('canvas')
export const mockGetCanvas = jest.fn<HTMLCanvasElement, []>(() => mockCanvas)
export const mockOn = mockMapMethods.on
export const mockOff = mockMapMethods.off
export const mockFitBounds = mockMapMethods.fitBounds
export const mockSetPadding = mockMapMethods.setPadding
export const mockSetData = jest.fn()
export const mockQueryRenderedFeatures = jest.fn<unknown[], unknown[]>(() => [])
export const mockEaseTo = mockMapMethods.easeTo
export const mockGetZoom = jest.fn(() => 5)
export const mockGetClusterExpansionZoom = jest.fn()
export const setWorkerUrl = jest.fn()
const mockEventHandlers: Record<string, MockEventHandler[]> = {}
let mockLoadImmediately = true
let mockMapConstructionError: unknown = null

export const mockMapInstance = {
  ...mockMapMethods,
  setFeatureState: mockSetFeatureState,
  getStyle: mockGetStyle,
  addControl: mockAddControl,
  getCanvas: mockGetCanvas,
  getBounds: mockGetBounds,
  queryRenderedFeatures: queryRenderedFeaturesFromStyle,
  getZoom: mockGetZoom,
  getCenter: mockGetCenter,
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

export function markLayersAdded(...layerIds: readonly string[]): void {
  layerIds.forEach((layerId) => addedLayerIds.add(layerId))
}
export function clearMockStyleResources(): void {
  addedLayerIds.clear()
  mockGetSource.mockReturnValue(undefined)
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
  mockGetBounds.mockReturnValue({
    getWest: () => 43,
    getSouth: () => 35,
    getEast: () => 44,
    getNorth: () => 36,
  })
  mockGetSource.mockReturnValue(undefined)
  mockIsStyleLoaded.mockReturnValue(true)
  mockGetStyle.mockReturnValue({})
  mockGetZoom.mockReturnValue(5)
  mockGetCenter.mockReturnValue({ lng: 43.25, lat: 35.45 })
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
