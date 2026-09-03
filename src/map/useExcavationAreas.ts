import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapLayerIds'
import {
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from 'map/mapExcavationLayers'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import { CATEGORICAL_PAINT, type ExcavationPaint } from 'map/mapExcavationPaint'

const LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
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
  LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

function setVisible(map: MapLibreMap, isVisible: boolean): void {
  LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

function applySelection(
  map: MapLibreMap,
  previousId: string | null,
  nextId: string | null,
): void {
  if (previousId && previousId !== nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: previousId },
      { selected: false },
    )
  }
  if (nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: nextId },
      { selected: true },
    )
  }
}

export interface ExcavationAreaOptions {
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly paint: ExcavationPaint
  readonly onSelectPolygon: (polygonId: string) => void
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  {
    isVisible,
    selectedPolygonId,
    paint = CATEGORICAL_PAINT,
    onSelectPolygon,
  }: ExcavationAreaOptions,
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
      applyExcavationPaint(map, paint)
      applySelection(map, null, isVisible ? selectedPolygonId : null)
    }

    if (map.isStyleLoaded()) install()
    else map.once('load', install)
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)

    return () => {
      map.off('load', install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      removeExcavationAreas(map)
    }
  }, [mapRef, isVisible, selectedPolygonId, paint, onSelectPolygon])
}
