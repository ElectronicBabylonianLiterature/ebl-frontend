import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
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
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  }
  ;[
    excavationAreaFillLayer,
    excavationAreaOutlineLayer,
    excavationAreaSelectedLayer,
  ].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer)
  })
}

function removeExcavationAreas(map: MapLibreMap): void {
  ;[...ALL_LAYER_IDS].reverse().forEach((layerId) => {
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
  if (!map.getLayer(EXCAVATION_AREA_SELECTED_LAYER_ID)) return
  map.setPaintProperty(
    EXCAVATION_AREA_SELECTED_LAYER_ID,
    'line-opacity',
    selectedPolygonId === null
      ? 0
      : ['case', ['==', ['get', 'id'], selectedPolygonId], 0.9, 0],
  )
}

function isExcavationAreaError(event: MapLibreErrorEvent): boolean {
  return (
    event.sourceId === EXCAVATION_AREAS_SOURCE_ID ||
    (typeof event.layer?.id === 'string' &&
      ALL_LAYER_IDS.includes(event.layer.id))
  )
}

export interface ExcavationAreaOptions {
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly onSelectPolygon: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  const latestOptionsRef = useRef(options)
  latestOptionsRef.current = options

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const install = (): void => addExcavationAreas(map)
    const handleError = (event: MapLibreErrorEvent): void => {
      if (isExcavationAreaError(event)) {
        latestOptionsRef.current.onAvailabilityChange?.(true)
      }
    }
    const handleClick = (event: MapMouseEvent): void => {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [EXCAVATION_AREA_FILL_LAYER_ID],
      })
      if (typeof feature?.id === 'string') {
        latestOptionsRef.current.onSelectPolygon(feature.id)
      }
    }

    map.on('error', handleError)
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
    if (map.isStyleLoaded()) install()
    else map.once('load', install)

    return () => {
      if (!isCurrentMap()) return
      map.off('error', handleError)
      map.off('load', install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      removeExcavationAreas(map)
    }
  }, [mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateVisibility = (): void => setVisible(map, options.isVisible)
    if (map.isStyleLoaded()) updateVisibility()
    else map.once('load', updateVisibility)

    return () => {
      if (mapRef.current === map) map.off('load', updateVisibility)
    }
  }, [mapRef, options.isVisible])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateSelection = (): void =>
      applySelectedState(
        map,
        options.isVisible ? options.selectedPolygonId : null,
      )
    if (map.isStyleLoaded()) updateSelection()
    else map.once('load', updateSelection)

    return () => {
      if (mapRef.current === map) map.off('load', updateSelection)
    }
  }, [mapRef, options.isVisible, options.selectedPolygonId])
}
