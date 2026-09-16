import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygon } from './excavationPolygonIndex'
import type { MapVisualizationMode } from './mapChoroplethScale'

export interface MapExportContext {
  readonly visualization: MapVisualizationMode
  readonly siteFilter: string
  readonly shareUrl: string
  readonly exportedAt: string
}

export interface MapExportRow {
  readonly siteId: string
  readonly polygonId: string
  readonly label: string
  readonly geometry: Geometry
  readonly mappedFindspotIds: readonly number[]
  readonly mappedFindspotCount: number
  readonly accessibleFragmentCount: number
  readonly areaSquareKm: number | null
  readonly locationPrecision: string
  readonly matchMethod: string
}

const NOT_MAPPED = 'not-mapped'

function distinctValues(
  summary: PolygonFindspotSummary | undefined,
  select: (findspot: PolygonFindspotSummary['findspots'][number]) => string,
): string {
  if (!summary || summary.findspots.length === 0) return NOT_MAPPED

  return [...new Set(summary.findspots.map(select))].sort().join('|')
}

export function toExportRows(
  polygons: readonly ExcavationPolygon[],
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
): readonly MapExportRow[] {
  return [...polygons]
    .sort((left, right) => left.polygonId.localeCompare(right.polygonId))
    .map((polygon) => {
      const summary = summaries.get(polygon.polygonId)

      return {
        siteId: polygon.siteId,
        polygonId: polygon.polygonId,
        label: polygon.name ?? polygon.polygonId,
        geometry: polygon.geometry,
        mappedFindspotIds: summary?.findspotIds ?? [],
        mappedFindspotCount: summary?.findspotCount ?? 0,
        accessibleFragmentCount: summary?.accessibleFragmentCount ?? 0,
        areaSquareKm: polygon.areaSquareKm,
        locationPrecision: distinctValues(
          summary,
          (findspot) => findspot.locationPrecision,
        ),
        matchMethod: distinctValues(
          summary,
          (findspot) => findspot.matchMethod,
        ),
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
      polygonId: row.polygonId,
      label: row.label,
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
    readonly source: string
    readonly note: string
    readonly crs: 'EPSG:4326'
    readonly visualization: MapVisualizationMode
    readonly siteFilter: string
    readonly shareUrl: string
    readonly exportedAt: string
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
      note: 'Excavation-area geometry. Fragments are associated with an excavation area, not an exact findspot coordinate.',
      crs: 'EPSG:4326',
      visualization: context.visualization,
      siteFilter: context.siteFilter,
      shareUrl: context.shareUrl,
      exportedAt: context.exportedAt,
    },
  }
}

export const CSV_COLUMNS = [
  'siteId',
  'polygonId',
  'label',
  'mappedFindspotIds',
  'mappedFindspotCount',
  'accessibleFragmentCount',
  'areaSquareKm',
  'locationPrecision',
  'matchMethod',
  'visualization',
  'siteFilter',
  'exportedAt',
  'shareUrl',
] as const

const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@\t\r]/

function escapeCsvValue(value: string): string {
  const guarded = SPREADSHEET_FORMULA_PREFIX.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded
}

function csvCells(row: MapExportRow, context: MapExportContext): string[] {
  return [
    row.siteId,
    row.polygonId,
    row.label,
    row.mappedFindspotIds.join(' '),
    String(row.mappedFindspotCount),
    String(row.accessibleFragmentCount),
    row.areaSquareKm === null ? '' : row.areaSquareKm.toFixed(6),
    row.locationPrecision,
    row.matchMethod,
    context.visualization,
    context.siteFilter,
    context.exportedAt,
    context.shareUrl,
  ]
}

export function buildExportCsv(
  rows: readonly MapExportRow[],
  context: MapExportContext,
): string {
  return [
    CSV_COLUMNS.join(','),
    ...rows.map((row) => csvCells(row, context).map(escapeCsvValue).join(',')),
  ].join('\r\n')
}
