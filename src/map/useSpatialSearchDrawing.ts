import { useEffect, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Position } from 'geojson'
import type { SpatialSearchShape } from 'map/spatialSearch'
import useSpatialSearchDrawingActions from 'map/useSpatialSearchDrawingActions'
import useSpatialSearchDrawingState, {
  type SpatialSearchDrawingRefs,
} from 'map/useSpatialSearchDrawingState'

export type { SpatialSearchDrawingRefs } from 'map/useSpatialSearchDrawingState'
export { finitePosition } from 'map/useSpatialSearchDrawingActions'

export interface SpatialSearchDrawingState {
  readonly shape: SpatialSearchShape | null
  readonly isDrawing: boolean
  readonly drawStart: Position | null
  readonly validationMessage: string | null
  readonly refs: SpatialSearchDrawingRefs
  readonly addCorner: (position: Position) => void
  readonly searchViewport: () => void
  readonly startDrawing: () => void
  readonly addCornerAtCenter: () => void
  readonly clear: () => void
}

export default function useSpatialSearchDrawing(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
): SpatialSearchDrawingState {
  const store = useSpatialSearchDrawingState(isActive)
  const actions = useSpatialSearchDrawingActions(mapRef, store)
  const { clear } = actions

  useEffect(() => {
    if (!isActive) clear()
  }, [clear, isActive])

  return {
    shape: store.shape,
    isDrawing: store.isDrawing,
    drawStart: store.drawStart,
    validationMessage: store.validationMessage,
    refs: store.refs,
    ...actions,
  }
}
