import type { Map as MapLibreMap } from 'maplibre-gl'

export interface MapMockHandle {
  readonly resize: jest.Mock
  readonly setPadding: jest.Mock
  readonly setTerrain: jest.Mock
  readonly setLayoutProperty: jest.Mock
  readonly setPaintProperty: jest.Mock
  readonly addSource: jest.Mock
  readonly addLayer: jest.Mock
  readonly removeLayer: jest.Mock
  readonly removeSource: jest.Mock
  readonly getSource: jest.Mock
  readonly getLayer: jest.Mock
  readonly on: jest.Mock
  readonly off: jest.Mock
  readonly once: jest.Mock
  readonly easeTo: jest.Mock
  readonly fitBounds: jest.Mock
  readonly isStyleLoaded: jest.Mock
  readonly remove: jest.Mock
}

export function createMapMock(): MapMockHandle {
  return {
    resize: jest.fn(),
    setPadding: jest.fn(),
    setTerrain: jest.fn(),
    setLayoutProperty: jest.fn(),
    setPaintProperty: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    removeSource: jest.fn(),
    getSource: jest.fn().mockReturnValue(undefined),
    getLayer: jest.fn().mockReturnValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    easeTo: jest.fn(),
    fitBounds: jest.fn(),
    isStyleLoaded: jest.fn().mockReturnValue(true),
    remove: jest.fn(),
  }
}

export function asLibreMap(map: MapMockHandle): MapLibreMap {
  return map as unknown as MapLibreMap
}

export function resetMapLibreMock(): void {
  jest.clearAllMocks()
}
