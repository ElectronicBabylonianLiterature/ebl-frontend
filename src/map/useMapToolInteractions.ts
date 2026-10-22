import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { MeasurementMode, MeasurementUnits } from 'map/mapMeasurement'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  runSpatialSearch,
} from 'map/spatialSearch'

import { isFiniteToolPosition, subscribeToolInput } from 'map/mapToolInput'

import useMapSpatialDrawing, {
  type MapSpatialDrawing,
} from 'map/useMapSpatialDrawing'

export interface MapToolInteractions extends MapSpatialDrawing {
  readonly measurementPositions: readonly Position[]
  readonly measurementMode: MeasurementMode
  readonly measurementUnits: MeasurementUnits
  readonly setMeasurementMode: (mode: MeasurementMode) => void
  readonly setMeasurementUnits: (units: MeasurementUnits) => void
  readonly addMeasurementAtCenter: () => void
  readonly clearMeasurement: () => void
  readonly searchResult: ReturnType<typeof runSpatialSearch>
}

export default function useMapToolInteractions(
  mapRef: MutableRefObject<MapLibreMap | null>,
  index: ExcavationPolygonIndex,
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
  isMeasuring: boolean,
  isSearching: boolean,
): MapToolInteractions {
  const [measurementPositions, setMeasurementPositions] = useState<
    readonly Position[]
  >([])
  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>('distance')
  const [measurementUnits, setMeasurementUnits] =
    useState<MeasurementUnits>('metric')
  const clearMeasurement = useCallback(
    (): void => setMeasurementPositions([]),
    [],
  )

  useEffect(() => {
    if (!isMeasuring) clearMeasurement()
  }, [isMeasuring, clearMeasurement])

  const drawing = useMapSpatialDrawing(mapRef, isSearching)
  const {
    searchShape,
    isDrawing,
    clearSearch,
    addPosition: addCorner,
  } = drawing
  const addPosition = useCallback(
    (position: Position): void => {
      if (!isFiniteToolPosition(position)) return
      if (isMeasuring)
        setMeasurementPositions((current) => [...current, position])
      else addCorner(position)
    },
    [isMeasuring, addCorner],
  )

  const addMeasurementAtCenter = useCallback((): void => {
    if (!isMeasuring) return
    const center = mapRef.current?.getCenter()
    if (center) addPosition([center.lng, center.lat])
  }, [mapRef, isMeasuring, addPosition])

  useEffect(() => {
    if (!isMeasuring && !isDrawing) return
    return subscribeToolInput(
      mapRef,
      addPosition,
      isDrawing ? clearSearch : clearMeasurement,
    )
  }, [
    mapRef,
    isMeasuring,
    isDrawing,
    addPosition,
    clearSearch,
    clearMeasurement,
  ])

  const searchResult = useMemo(
    () =>
      searchShape === null
        ? EMPTY_SPATIAL_SEARCH_RESULT
        : runSpatialSearch(searchShape, index, summaries),
    [searchShape, index, summaries],
  )

  return {
    ...drawing,
    measurementPositions,
    measurementMode,
    measurementUnits,
    setMeasurementMode,
    setMeasurementUnits,
    addMeasurementAtCenter,
    clearMeasurement,
    searchResult,
    addPosition,
  }
}
