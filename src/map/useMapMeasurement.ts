import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  type Measurement,
  type MeasurementMode,
  type MeasurementUnits,
  MAX_MEASUREMENT_POINTS,
  measure,
} from 'map/mapMeasurement'
import { updateMeasurementGeometry } from 'map/mapMeasurementLayers'
import { subscribeMeasurement } from 'map/mapMeasurementLifecycle'
import { finitePosition } from 'map/mapToolInput'

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

  useEffect(
    () =>
      subscribeMeasurement(
        mapRef,
        () => ({
          mode: modeRef.current,
          positions: positionsRef.current,
          isActive: isActiveRef.current,
        }),
        { addPoint, clear, removeLastPoint },
      ),
    [addPoint, clear, isActive, mapRef, removeLastPoint],
  )

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
