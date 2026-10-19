import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import type { MeasurementMode } from 'map/mapMeasurement'
import {
  addMeasurementLayers,
  removeMeasurementLayers,
  updateMeasurementGeometry,
} from 'map/mapMeasurementLayers'
import { finitePosition, isEditableTarget } from 'map/mapToolInput'

interface MeasurementState {
  readonly mode: MeasurementMode
  readonly positions: readonly Position[]
  readonly isActive: boolean
}

interface MeasurementActions {
  readonly addPoint: (position: Position) => void
  readonly clear: () => void
  readonly removeLastPoint: () => void
}

function handleMeasurementKeyDown(
  event: KeyboardEvent,
  state: MeasurementState,
  actions: MeasurementActions,
): void {
  if (
    !state.isActive ||
    isEditableTarget(event.target) ||
    state.positions.length === 0
  ) {
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    actions.clear()
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    actions.removeLastPoint()
  }
}

export function subscribeMeasurement(
  mapRef: MutableRefObject<MapLibreMap | null>,
  getState: () => MeasurementState,
  actions: MeasurementActions,
): (() => void) | undefined {
  const map = mapRef.current
  if (!map || !getState().isActive) return

  const install = (): void => {
    const { mode, positions } = getState()
    addMeasurementLayers(map)
    updateMeasurementGeometry(map, mode, positions)
  }
  const handleClick = (event: MapMouseEvent): void => {
    if (!getState().isActive) return
    const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
    if (position) actions.addPoint(position)
  }
  const handleKeyDown = (event: KeyboardEvent): void =>
    handleMeasurementKeyDown(event, getState(), actions)

  map.on(MAP_STYLE_LOAD_EVENT, install)
  if (map.getStyle()) install()
  map.on('click', handleClick)
  window.addEventListener('keydown', handleKeyDown)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    if (mapRef.current !== map) return
    map.off(MAP_STYLE_LOAD_EVENT, install)
    map.off('click', handleClick)
    removeMeasurementLayers(map)
  }
}
