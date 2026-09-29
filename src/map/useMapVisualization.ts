import { useMemo } from 'react'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import {
  type ChoroplethLegend,
  type MapVisualizationMode,
  buildChoroplethLegend,
  buildChoroplethScale,
} from 'map/mapChoroplethScale'
import {
  CATEGORICAL_PAINT,
  EVIDENCE_PAINT,
  type ExcavationPaint,
} from 'map/mapExcavationPaint'
import {
  SEQUENTIAL_COLORS,
  type ChoroplethScale,
} from 'map/mapPaintExpressions'
import {
  type PolygonVisualizationValues,
  buildVisualizationValues,
  isDensityAvailable,
  visualizationValuesFor,
} from 'map/mapVisualizationValues'
import type { FragmentMapDataState } from 'map/useFragmentMapData'

const ZERO_DENSITY_SCALE: ChoroplethScale = {
  valueKey: 'densityPerSquareKm',
  breaks: [],
  colors: [SEQUENTIAL_COLORS[0]],
}

export interface MapVisualization {
  readonly values: PolygonVisualizationValues
  readonly scale: ChoroplethScale | null
  readonly paint: ExcavationPaint
  readonly legend: ChoroplethLegend
  readonly isDensityAvailable: boolean
  readonly hasUnavailableData: boolean
  readonly effectiveMode: MapVisualizationMode
}

function paintFor(
  mode: MapVisualizationMode,
  scale: ChoroplethScale | null,
): ExcavationPaint {
  if (mode === 'evidence') return EVIDENCE_PAINT
  if (mode === 'density') {
    return { kind: 'choropleth', scale: scale ?? ZERO_DENSITY_SCALE }
  }
  return scale === null ? CATEGORICAL_PAINT : { kind: 'choropleth', scale }
}

export default function useMapVisualization(
  mapData: FragmentMapDataState,
  index: ExcavationPolygonIndex,
  mode: MapVisualizationMode,
): MapVisualization {
  const values = useMemo(
    () => buildVisualizationValues(mapData, index),
    [mapData, index],
  )
  const densityAvailable = useMemo(() => isDensityAvailable(values), [values])

  return useMemo(() => {
    const effectiveMode =
      mode === 'density' && !densityAvailable ? 'mapped' : mode
    const modeValues = visualizationValuesFor(values, effectiveMode)
    const scale = buildChoroplethScale(effectiveMode, modeValues)

    return {
      values,
      scale,
      paint: paintFor(effectiveMode, scale),
      legend: buildChoroplethLegend(effectiveMode, scale, modeValues),
      isDensityAvailable: densityAvailable,
      hasUnavailableData: [...values.values()].some(
        (value) => !value.dataAvailable,
      ),
      effectiveMode,
    }
  }, [values, densityAvailable, mode])
}
