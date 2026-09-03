import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_LAYER_IDS,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
} from 'map/mapExcavationLayers'

function addExcavationAreas(map: MapLibreMap): void {
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) return
  map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  map.addLayer(excavationAreaFillLayer)
  map.addLayer(excavationAreaOutlineLayer)
}

function removeExcavationAreas(map: MapLibreMap): void {
  EXCAVATION_AREA_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

function setExcavationAreasVisible(map: MapLibreMap, isVisible: boolean): void {
  EXCAVATION_AREA_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const install = (): void => {
      addExcavationAreas(map)
      setExcavationAreasVisible(map, isVisible)
    }

    if (map.isStyleLoaded()) {
      install()
    } else {
      map.once('load', install)
    }

    return () => {
      map.off('load', install)
      removeExcavationAreas(map)
    }
  }, [mapRef, isVisible])
}
