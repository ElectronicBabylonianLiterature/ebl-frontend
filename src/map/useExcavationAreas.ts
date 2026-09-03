import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from 'map/mapExcavationLayers'

const ALL_LAYER_IDS: readonly string[] = [
  ...EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
]

function addExcavationAreas(map: MapLibreMap): void {
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) return
  map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  map.addLayer(excavationAreaFillLayer)
  map.addLayer(excavationAreaOutlineLayer)
  map.addLayer(excavationAreaSelectedLayer)
}

function removeExcavationAreas(map: MapLibreMap): void {
  ALL_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

function setVisible(map: MapLibreMap, isVisible: boolean): void {
  ALL_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

function applySelectedState(
  map: MapLibreMap,
  selectedPolygonId: string | null,
): void {
  map.setPaintProperty(
    EXCAVATION_AREA_SELECTED_LAYER_ID,
    'line-opacity',
    selectedPolygonId === null
      ? 0
      : [
          'case',
          ['==', ['get', 'id'], selectedPolygonId],
          0.9,
          0,
        ],
  )
}

export interface ExcavationAreaOptions {
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly onSelectPolygon: (polygonId: string) => void
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  { isVisible, selectedPolygonId, onSelectPolygon }: ExcavationAreaOptions,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = (event: MapMouseEvent): void => {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [EXCAVATION_AREA_FILL_LAYER_ID],
      })
      const polygonId = feature?.properties?.id
      if (typeof polygonId === 'string') onSelectPolygon(polygonId)
    }

    const install = (): void => {
      addExcavationAreas(map)
      setVisible(map, isVisible)
      applySelectedState(map, isVisible ? selectedPolygonId : null)
    }

    if (map.isStyleLoaded()) install()
    else map.once('load', install)
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)

    return () => {
      map.off('load', install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      removeExcavationAreas(map)
    }
  }, [mapRef, isVisible, selectedPolygonId, onSelectPolygon])
}
