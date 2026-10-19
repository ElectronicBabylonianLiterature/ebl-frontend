import type { Map as MapLibreMap, MapSourceDataEvent } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'

export function observeExcavationAvailability(
  map: MapLibreMap,
  layerIds: readonly string[],
  onChange?: (unavailable: boolean) => void,
): () => void {
  const handleError = (event: MapLibreErrorEvent): void => {
    if (
      event.sourceId === EXCAVATION_AREAS_SOURCE_ID ||
      (typeof event.layer?.id === 'string' && layerIds.includes(event.layer.id))
    )
      onChange?.(true)
  }
  const handleData = (event: MapSourceDataEvent): void => {
    if (
      event.sourceId === EXCAVATION_AREAS_SOURCE_ID &&
      event.sourceDataType === 'content' &&
      event.isSourceLoaded &&
      map.getSource(EXCAVATION_AREAS_SOURCE_ID)
    )
      onChange?.(false)
  }
  map.on('error', handleError)
  map.on('sourcedata', handleData)
  return () => {
    map.off('error', handleError)
    map.off('sourcedata', handleData)
  }
}
