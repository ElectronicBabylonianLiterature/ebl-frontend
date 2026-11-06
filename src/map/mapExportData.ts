import type { Feature, FeatureCollection, Geometry } from 'geojson'
import {
  MAP_ARTIFACT_PROVENANCE,
  exportPolygonProvenance,
} from 'map/mapArtifactProvenance'
import { EXCAVATION_AREA_NOTE } from 'map/mapResearchLabels'
import type { BoundingBox } from 'map/mapGeometry'
import { EXCAVATION_POLYGON_GEOJSON_URL } from 'map/excavationPolygonIndex'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { MapVisualizationMode } from 'map/mapChoroplethScale'
import { isMapSiteId } from 'map/mapSites'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
} from 'map/useFragmentMapData'

export type MapExportScope =
  | { readonly type: 'selection'; readonly polygonId: string }
  | { readonly type: 'viewport'; readonly bounds: readonly BoundingBox[] }

export interface MapExportContext {
  readonly visualization: MapVisualizationMode
  readonly siteFilter: string
  readonly shareUrl: string
  readonly exportedAt: string
  readonly scope: MapExportScope
  readonly dataStatuses: Readonly<Record<string, FragmentMapDataStatus>>
}

export interface MapExportRow {
  readonly siteId: string
  readonly polygonId: string
  readonly label: string
  readonly geometry: Geometry
  readonly dataStatus: FragmentMapDataStatus
  readonly mappedFindspotIds: readonly number[] | null
  readonly mappedFindspotCount: number | null
  readonly accessibleFragmentCount: number | null
  readonly areaSquareKm: number | null
  readonly locationPrecision: string | null
  readonly matchMethod: string | null
}

const NOT_MAPPED = 'not-mapped'

function hasLoaded(status: FragmentMapDataStatus): boolean {
  return status === 'loaded-with-mappings' || status === 'loaded-empty'
}

function distinctValues(
  summary: PolygonFindspotSummary | undefined,
  select: (findspot: PolygonFindspotSummary['findspots'][number]) => string,
): string {
  if (!summary || summary.findspots.length === 0) return NOT_MAPPED
  return [...new Set(summary.findspots.map(select))].sort().join('|')
}

export function exportDataStatuses(
  sites: FragmentMapDataState['sites'],
): Readonly<Record<string, FragmentMapDataStatus>> {
  return Object.fromEntries(
    [...sites].map(([siteId, site]) => [siteId, site.status]),
  )
}

export function toExportRows(
  polygons: readonly ExcavationPolygon[],
  sites: FragmentMapDataState['sites'],
): readonly MapExportRow[] {
  return [...polygons]
    .sort((left, right) => left.polygonId.localeCompare(right.polygonId))
    .map((polygon) => {
      const site = isMapSiteId(polygon.siteId)
        ? sites.get(polygon.siteId)
        : undefined
      const dataStatus = site?.status ?? 'not-configured'
      const isLoaded = hasLoaded(dataStatus)
      const summary = isLoaded
        ? site?.polygonSummaries.get(polygon.polygonId)
        : undefined

      return {
        siteId: polygon.siteId,
        polygonId: polygon.polygonId,
        label: polygon.name ?? polygon.polygonId,
        geometry: polygon.geometry,
        dataStatus,
        mappedFindspotIds: isLoaded ? (summary?.findspotIds ?? []) : null,
        mappedFindspotCount: isLoaded ? (summary?.findspotCount ?? 0) : null,
        accessibleFragmentCount: isLoaded
          ? (summary?.accessibleFragmentCount ?? 0)
          : null,
        areaSquareKm: polygon.areaSquareKm,
        locationPrecision: isLoaded
          ? distinctValues(summary, (entry) => entry.locationPrecision)
          : null,
        matchMethod: isLoaded
          ? distinctValues(summary, (entry) => entry.matchMethod)
          : null,
      }
    })
}

function toFeature(row: MapExportRow): Feature {
  return {
    type: 'Feature',
    id: row.polygonId,
    geometry: row.geometry,
    properties: {
      siteId: row.siteId,
      ...exportPolygonProvenance(row.siteId),
      polygonId: row.polygonId,
      label: row.label,
      dataStatus: row.dataStatus,
      mappedFindspotIds: row.mappedFindspotIds,
      mappedFindspotCount: row.mappedFindspotCount,
      accessibleFragmentCount: row.accessibleFragmentCount,
      areaSquareKm: row.areaSquareKm,
      locationPrecision: row.locationPrecision,
      matchMethod: row.matchMethod,
    },
  }
}

export interface MapExportFeatureCollection extends FeatureCollection {
  readonly metadata: {
    readonly artifactProvenance: typeof MAP_ARTIFACT_PROVENANCE
    readonly source: string
    readonly polygonSource: string
    readonly note: string
    readonly accessNote: string
    readonly crs: 'EPSG:4326'
    readonly visualization: MapVisualizationMode
    readonly siteFilter: string
    readonly shareUrl: string
    readonly exportedAt: string
    readonly scope: MapExportScope
    readonly dataStatuses: Readonly<Record<string, FragmentMapDataStatus>>
  }
}

export function buildExportGeoJson(
  rows: readonly MapExportRow[],
  context: MapExportContext,
): MapExportFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rows.map(toFeature),
    metadata: {
      source: 'electronic Babylonian Library map',
      artifactProvenance: MAP_ARTIFACT_PROVENANCE,
      polygonSource: EXCAVATION_POLYGON_GEOJSON_URL,
      note: EXCAVATION_AREA_NOTE,
      accessNote:
        'Counts are caller-authorized snapshots at the export time; blank linked-data fields mean that site data was unavailable.',
      crs: 'EPSG:4326',
      visualization: context.visualization,
      siteFilter: context.siteFilter,
      shareUrl: context.shareUrl,
      exportedAt: context.exportedAt,
      scope: context.scope,
      dataStatuses: context.dataStatuses,
    },
  }
}

export { CSV_COLUMNS, buildExportCsv } from 'map/mapExportCsv'
