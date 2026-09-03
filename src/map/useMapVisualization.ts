import { useMemo } from 'react'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import {
  type ChoroplethLegend,
  type MapVisualizationMode,
  buildChoroplethLegend,
  buildChoroplethScale,
} from './mapChoroplethScale'
import type { ChoroplethScale } from './mapPaintExpressions'
import {
  CATEGORICAL_PAINT,
  EVIDENCE_PAINT,
  type ExcavationPaint,
} from './mapExcavationPaint'
import {
  type PolygonVisualizationValues,
  buildVisualizationValues,
  isDensityAvailable,
  visualizationValuesFor,
} from './mapVisualizationValues'

export interface MapVisualization {
  readonly values: PolygonVisualizationValues
  readonly scale: ChoroplethScale | null
  readonly paint: ExcavationPaint
  readonly legend: ChoroplethLegend
  readonly isDensityAvailable: boolean
  readonly effectiveMode: MapVisualizationMode
}

function paintFor(
  mode: MapVisualizationMode,
  scale: ChoroplethScale | null,
): ExcavationPaint {
  if (mode === 'evidence') return EVIDENCE_PAINT
  return scale === null ? CATEGORICAL_PAINT : { kind: 'choropleth', scale }
}

export default function useMapVisualization(
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
  index: ExcavationPolygonIndex,
  mode: MapVisualizationMode,
): MapVisualization {
  const values = useMemo(
    () => buildVisualizationValues(summaries, index),
    [summaries, index],
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
      effectiveMode,
    }
  }, [values, densityAvailable, mode])
}
