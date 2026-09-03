import { useCallback, useEffect, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  type Measurement,
  type MeasurementMode,
  type MeasurementUnits,
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
  readonly positions: readonly Position[]
  readonly pointCount: number
  readonly setMode: (mode: MeasurementMode) => void
  readonly setUnits: (units: MeasurementUnits) => void
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

  const clear = useCallback(() => setPositions([]), [])
  const removeLastPoint = useCallback(
    () => setPositions((current) => current.slice(0, -1)),
    [],
  )

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive) return

    const handleClick = (event: MapMouseEvent): void => {
      setPositions((current) => [
        ...current,
        [event.lngLat.lng, event.lngLat.lat],
      ])
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') clear()
      if (event.key === 'Backspace') removeLastPoint()
    }

    const install = (): void => addMeasurementLayers(map)
    if (map.isStyleLoaded()) install()
    else map.once('load', install)

    map.on('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      map.off('load', install)
      map.off('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
      removeMeasurementLayers(map)
      setPositions([])
    }
  }, [mapRef, isActive, clear, removeLastPoint])

  useEffect(() => {
    const map = mapRef.current
    if (map && isActive) updateMeasurementGeometry(map, positions)
  }, [mapRef, isActive, positions])

  return {
    mode,
    units,
    measurement: measure(mode, positions, units),
    positions,
    pointCount: positions.length,
    setMode: useCallback((next: MeasurementMode) => {
      setMode(next)
      setPositions([])
    }, []),
    setUnits,
    clear,
    removeLastPoint,
  }
}
