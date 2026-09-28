import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import {
  type MapVisualizationMode,
  visualizationValueKey,
} from 'map/mapChoroplethScale'
import { EVIDENCE_CODES } from 'map/mapEvidencePaint'
import { type MappingEvidence, mappingEvidenceOf } from 'map/mapResearchSummary'
import { isMapSiteId } from 'map/mapSites'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
} from 'map/useFragmentMapData'

export interface PolygonVisualizationValue {
  readonly polygonId: string
  readonly dataAvailable: boolean
  readonly findspotCount: number
  readonly accessibleFragmentCount: number
  readonly areaSquareKm: number | null
  readonly densityAvailable: boolean
  readonly densityPerSquareKm: number | null
  readonly mappingEvidence: MappingEvidence
}

export type PolygonVisualizationValues = ReadonlyMap<
  string,
  PolygonVisualizationValue
>

function hasLoaded(status: FragmentMapDataStatus | undefined): boolean {
  return status === 'loaded-with-mappings' || status === 'loaded-empty'
}

function valueFor(
  polygonId: string,
  areaSquareKm: number | null,
  dataAvailable: boolean,
  summary: PolygonFindspotSummary | undefined,
): PolygonVisualizationValue {
  const findspotCount = dataAvailable ? (summary?.findspotCount ?? 0) : 0
  const accessibleFragmentCount = dataAvailable
    ? (summary?.accessibleFragmentCount ?? 0)
    : 0
  const densityAvailable =
    dataAvailable &&
    summary !== undefined &&
    areaSquareKm !== null &&
    areaSquareKm > 0

  return {
    polygonId,
    dataAvailable,
    findspotCount,
    accessibleFragmentCount,
    areaSquareKm,
    densityAvailable,
    densityPerSquareKm: densityAvailable
      ? accessibleFragmentCount / areaSquareKm
      : null,
    mappingEvidence: dataAvailable
      ? mappingEvidenceOf(summary?.findspots ?? [])
      : 'unmapped',
  }
}

export function buildVisualizationValues(
  mapData: FragmentMapDataState,
  index: ExcavationPolygonIndex,
): PolygonVisualizationValues {
  return new Map(
    [...index.entries()].flatMap(([siteId, polygons]) => {
      const site = isMapSiteId(siteId) ? mapData.sites.get(siteId) : undefined
      const dataAvailable = hasLoaded(site?.status)

      return polygons.map((polygon) => [
        polygon.polygonId,
        valueFor(
          polygon.polygonId,
          polygon.areaSquareKm,
          dataAvailable,
          site?.polygonSummaries.get(polygon.polygonId),
        ),
      ])
    }),
  )
}

export function visualizationValuesFor(
  values: PolygonVisualizationValues,
  mode: MapVisualizationMode,
): readonly number[] {
  const key = visualizationValueKey(mode)

  return [...values.values()].flatMap((value) => {
    if (!value.dataAvailable) return []
    if (mode === 'density' && !value.densityAvailable) return []
    const candidate = value[key]
    return typeof candidate === 'number' ? [candidate] : []
  })
}

export function isDensityAvailable(
  values: PolygonVisualizationValues,
): boolean {
  return [...values.values()].some(
    (value) => value.dataAvailable && value.densityAvailable,
  )
}

export function featureStateFor(
  value: PolygonVisualizationValue,
): Record<string, number | boolean> {
  return {
    dataAvailable: value.dataAvailable,
    findspotCount: value.findspotCount,
    accessibleFragmentCount: value.accessibleFragmentCount,
    evidenceCode: EVIDENCE_CODES[value.mappingEvidence],
    densityAvailable: value.densityAvailable,
    densityPerSquareKm: value.densityPerSquareKm ?? 0,
  }
}
