import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationAreaOptions } from 'map/excavationAreaOptions'
import useExcavationAreaLifecycle from 'map/useExcavationAreaLifecycle'
import {
  useExcavationAreaSelection,
  useExcavationAreaVisibility,
  useExcavationAreaVisualization,
} from 'map/useExcavationAreaRendering'

export type { ExcavationAreaOptions } from 'map/excavationAreaOptions'

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  useExcavationAreaLifecycle(mapRef, options)
  useExcavationAreaVisibility(mapRef, options.isVisible)
  useExcavationAreaSelection(
    mapRef,
    options.isVisible,
    options.selectedPolygonId,
  )
  useExcavationAreaVisualization(mapRef, options.paint, options.values)
}
