import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { MapMock } from '__mocks__/maplibre-gl'

export function createMapMock(): MapMock {
  return new maplibregl.Map({
    container: document.createElement('div'),
  }) as unknown as MapMock
}

export function asLibreMap(map: MapMock): MapLibreMap {
  return map as unknown as MapLibreMap
}
