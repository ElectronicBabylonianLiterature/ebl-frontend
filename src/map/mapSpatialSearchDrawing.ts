import type { Position } from 'geojson'
import { drawnRectangleBounds } from 'map/spatialBounds'
import type { SpatialSearchShape } from 'map/spatialSearch'

interface SpatialDrawingState {
  readonly isActive: boolean
  readonly isDrawing: boolean
  readonly firstCorner: Position | null
}

interface SpatialDrawingActions {
  readonly setValidationMessage: (message: string | null) => void
  readonly replaceDrawStart: (position: Position | null) => void
  readonly replaceShape: (shape: SpatialSearchShape | null) => void
  readonly replaceDrawing: (isDrawing: boolean) => void
}

export function addSpatialSearchCorner(
  position: Position,
  state: SpatialDrawingState,
  actions: SpatialDrawingActions,
): void {
  if (!state.isActive || !state.isDrawing) return
  const start = state.firstCorner
  if (start === null) {
    actions.setValidationMessage(null)
    actions.replaceDrawStart(position)
    return
  }
  const bounds = drawnRectangleBounds(start, position)
  if (bounds === null) {
    actions.setValidationMessage(
      'Choose a second corner with a different latitude and longitude.',
    )
    return
  }
  actions.setValidationMessage(null)
  actions.replaceShape({ type: 'bounding-box', bounds })
  actions.replaceDrawing(false)
  actions.replaceDrawStart(null)
}
