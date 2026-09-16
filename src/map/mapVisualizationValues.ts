import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import {
  type MapVisualizationMode,
  visualizationValueKey,
} from './mapChoroplethScale'
import { type MappingEvidence, mappingEvidenceOf } from './mapResearchSummary'
import { EVIDENCE_CODES } from './mapEvidencePaint'

export interface PolygonVisualizationValue {
  readonly polygonId: string
  readonly findspotCount: number
  readonly accessibleFragmentCount: number
  readonly areaSquareKm: number | null
  readonly densityPerSquareKm: number | null
  readonly mappingEvidence: MappingEvidence
}

export type PolygonVisualizationValues = ReadonlyMap<
  string,
  PolygonVisualizationValue
>

function areaByPolygonId(
  index: ExcavationPolygonIndex,
): ReadonlyMap<string, number | null> {
  return new Map(
    [...index.values()]
      .flat()
      .map((polygon) => [polygon.polygonId, polygon.areaSquareKm]),
  )
}

/**
 * Density is only defined where a positive geodesic area exists. A polygon
 * with unusable geometry keeps a null density rather than a fabricated zero.
 */
export function buildVisualizationValues(
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
  index: ExcavationPolygonIndex,
): PolygonVisualizationValues {
  const areas = areaByPolygonId(index)

  return new Map(
    [...summaries.values()].map((summary) => {
      const areaSquareKm = areas.get(summary.polygonId) ?? null

      return [
        summary.polygonId,
        {
          polygonId: summary.polygonId,
          findspotCount: summary.findspotCount,
          accessibleFragmentCount: summary.accessibleFragmentCount,
          areaSquareKm,
          densityPerSquareKm:
            areaSquareKm === null || areaSquareKm <= 0
              ? null
              : summary.accessibleFragmentCount / areaSquareKm,
          mappingEvidence: mappingEvidenceOf(summary.findspots),
        },
      ]
    }),
  )
}

export function visualizationValuesFor(
  values: PolygonVisualizationValues,
  mode: MapVisualizationMode,
): readonly number[] {
  const key = visualizationValueKey(mode)

  return [...values.values()].flatMap((value) => {
    const candidate = value[key]
    return typeof candidate === 'number' ? [candidate] : []
  })
}

export function isDensityAvailable(
  values: PolygonVisualizationValues,
): boolean {
  return [...values.values()].some(
    (value) =>
      value.densityPerSquareKm !== null && value.densityPerSquareKm > 0,
  )
}

/**
 * Everything the polygon paint expressions read. `evidenceCode` is an ordered
 * numeric encoding of the mapping evidence so a `step` expression can class it
 * — a polygon with no state at all falls through to 0, i.e. unmapped.
 */
export function featureStateFor(
  value: PolygonVisualizationValue,
): Record<string, number> {
  return {
    findspotCount: value.findspotCount,
    accessibleFragmentCount: value.accessibleFragmentCount,
    evidenceCode: EVIDENCE_CODES[value.mappingEvidence],
    ...(value.densityPerSquareKm === null
      ? {}
      : { densityPerSquareKm: value.densityPerSquareKm }),
  }
}
