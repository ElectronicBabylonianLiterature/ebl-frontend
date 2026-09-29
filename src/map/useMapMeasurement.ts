import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  type Measurement,
  type MeasurementMode,
  type MeasurementUnits,
  MAX_MEASUREMENT_POINTS,
  measure,
} from 'map/mapMeasurement'
import {
  addMeasurementLayers,
  removeMeasurementLayers,
  updateMeasurementGeometry,
} from 'map/mapMeasurementLayers'

export interface MeasurementController {
  readonly mode: MeasurementMode
  readonly units: MeasurementUnits
  readonly measurement: Measurement
  readonly pointCount: number
  readonly isAtPointLimit: boolean
  readonly setMode: (mode: MeasurementMode) => void
  readonly setUnits: (units: MeasurementUnits) => void
  readonly addPointAtCenter: () => void
  readonly clear: () => void
  readonly removeLastPoint: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return [
    target.isContentEditable,
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName),
  ].some(Boolean)
}

function finitePosition(longitude: number, latitude: number): Position | null {
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? [longitude, latitude]
    : null
}

interface MeasurementRefs {
  readonly mode: MutableRefObject<MeasurementMode>
  readonly positions: MutableRefObject<readonly Position[]>
  readonly isActive: MutableRefObject<boolean>
}

interface MeasurementActions {
  readonly addPoint: (position: Position) => void
  readonly clear: () => void
  readonly removeLastPoint: () => void
}

function ownsMap(
  mapRef: MutableRefObject<MapLibreMap | null>,
  map: MapLibreMap,
): boolean {
  return mapRef.current === map
}

function createMapClickHandler(
  refs: MeasurementRefs,
  addPoint: MeasurementActions['addPoint'],
): (event: MapMouseEvent) => void {
  return (event) => {
    if (!refs.isActive.current) return
    const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
    if (position) addPoint(position)
  }
}

function createKeyDownHandler(
  refs: MeasurementRefs,
  actions: Pick<MeasurementActions, 'clear' | 'removeLastPoint'>,
): (event: KeyboardEvent) => void {
  return (event) => {
    const shouldIgnore = [
      !refs.isActive.current,
      isEditableTarget(event.target),
      refs.positions.current.length === 0,
    ].some(Boolean)
    if (shouldIgnore) return

    const action =
      event.key === 'Escape'
        ? actions.clear
        : event.key === 'Backspace'
          ? actions.removeLastPoint
          : null
    if (action) {
      event.preventDefault()
      action()
    }
  }
}

function useMeasurementLifecycle(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
  refs: MeasurementRefs,
  actions: MeasurementActions,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive) return

    const install = (): void => {
      addMeasurementLayers(map)
      updateMeasurementGeometry(map, refs.mode.current, refs.positions.current)
    }
    const handleClick = createMapClickHandler(refs, actions.addPoint)
    const handleKeyDown = createKeyDownHandler(refs, actions)

    if (map.isStyleLoaded()) install()
    else map.once('load', install)
    map.on('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (!ownsMap(mapRef, map)) return
      map.off('load', install)
      map.off('click', handleClick)
      removeMeasurementLayers(map)
    }
  }, [actions, isActive, mapRef, refs])
}

export default function useMapMeasurement(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
): MeasurementController {
  const [mode, setMode] = useState<MeasurementMode>('distance')
  const [units, setUnits] = useState<MeasurementUnits>('metric')
  const [positions, setPositions] = useState<readonly Position[]>([])
  const modeRef = useRef(mode)
  const positionsRef = useRef(positions)
  const isActiveRef = useRef(isActive)
  modeRef.current = mode
  positionsRef.current = positions
  isActiveRef.current = isActive

  const replacePositions = useCallback((next: readonly Position[]): void => {
    positionsRef.current = next
    setPositions(next)
  }, [])
  const clear = useCallback(() => replacePositions([]), [replacePositions])
  const removeLastPoint = useCallback(
    () => replacePositions(positionsRef.current.slice(0, -1)),
    [replacePositions],
  )
  const addPoint = useCallback(
    (position: Position): void => {
      if (positionsRef.current.length >= MAX_MEASUREMENT_POINTS) return
      replacePositions([...positionsRef.current, position])
    },
    [replacePositions],
  )
  const setMeasurementMode = useCallback(
    (next: MeasurementMode): void => {
      if (next === modeRef.current) return
      modeRef.current = next
      setMode(next)
      clear()
    },
    [clear],
  )
  const addPointAtCenter = useCallback((): void => {
    const map = mapRef.current
    if (!map || !isActiveRef.current) return
    const center = map.getCenter()
    const position = finitePosition(center.lng, center.lat)
    if (position) addPoint(position)
  }, [addPoint, mapRef])

  useEffect(() => {
    if (!isActive) clear()
  }, [clear, isActive])

  const refs = useMemo(
    () => ({ mode: modeRef, positions: positionsRef, isActive: isActiveRef }),
    [],
  )
  const actions = useMemo(
    () => ({ addPoint, clear, removeLastPoint }),
    [addPoint, clear, removeLastPoint],
  )
  useMeasurementLifecycle(mapRef, isActive, refs, actions)

  useEffect(() => {
    const map = mapRef.current
    if (map && isActive) updateMeasurementGeometry(map, mode, positions)
  }, [isActive, mapRef, mode, positions])

  return {
    mode,
    units,
    measurement: measure(mode, positions, units),
    pointCount: positions.length,
    isAtPointLimit: positions.length >= MAX_MEASUREMENT_POINTS,
    setMode: setMeasurementMode,
    setUnits,
    addPointAtCenter,
    clear,
    removeLastPoint,
  }
}
