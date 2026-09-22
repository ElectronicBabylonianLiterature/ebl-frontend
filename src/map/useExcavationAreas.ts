import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
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
import {
  featureStateFor,
  type PolygonVisualizationValues,
} from 'map/mapVisualizationValues'

const ALL_LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
]
const EMPTY_VALUES: PolygonVisualizationValues = new Map()

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

function applyVisualizationValues(
  map: MapLibreMap,
  values: PolygonVisualizationValues,
): void {
  values.forEach((value, polygonId) => {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
      featureStateFor(value),
    )
  })
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
  readonly paint?: ExcavationPaint
  readonly values?: PolygonVisualizationValues
  readonly onSelectPolygon: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  const latestOptionsRef = useRef(options)
  const previousSelectedIdRef = useRef<string | null>(null)
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

    const updateSelection = (): void => {
      const nextId = options.isVisible ? options.selectedPolygonId : null
      applySelection(map, previousSelectedIdRef.current, nextId)
      previousSelectedIdRef.current = nextId
    }
    if (map.isStyleLoaded()) updateSelection()
    else map.once('load', updateSelection)

    return () => {
      if (mapRef.current === map) map.off('load', updateSelection)
    }
  }, [mapRef, options.isVisible, options.selectedPolygonId])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updatePaint = (): void =>
      applyExcavationPaint(map, options.paint ?? CATEGORICAL_PAINT)
    if (map.isStyleLoaded()) updatePaint()
    else map.once('load', updatePaint)

    return () => {
      if (mapRef.current === map) map.off('load', updatePaint)
    }
  }, [mapRef, options.paint])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateValues = (): void =>
      applyVisualizationValues(map, options.values ?? EMPTY_VALUES)
    if (map.isStyleLoaded()) updateValues()
    else map.once('load', updateValues)

    return () => {
      if (mapRef.current === map) map.off('load', updateValues)
    }
  }, [mapRef, options.values])
}
