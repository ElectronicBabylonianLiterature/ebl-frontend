import { useCallback, useEffect, useRef, useState } from 'react'
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
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  )
}

function finitePosition(longitude: number, latitude: number): Position | null {
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? [longitude, latitude]
    : null
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

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const install = (): void => {
      addMeasurementLayers(map)
      updateMeasurementGeometry(map, modeRef.current, positionsRef.current)
    }
    const handleClick = (event: MapMouseEvent): void => {
      if (!isActiveRef.current) return
      const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
      if (position) addPoint(position)
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        !isActiveRef.current ||
        isEditableTarget(event.target) ||
        positionsRef.current.length === 0
      ) {
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        clear()
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        removeLastPoint()
      }
    }

    if (map.isStyleLoaded()) install()
    else map.once('load', install)
    map.on('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (!isCurrentMap()) return
      map.off('load', install)
      map.off('click', handleClick)
      removeMeasurementLayers(map)
    }
  }, [addPoint, clear, isActive, mapRef, removeLastPoint])

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
