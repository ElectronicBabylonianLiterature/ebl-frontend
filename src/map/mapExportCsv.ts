import type { MapExportContext, MapExportRow } from 'map/mapExportData'
import { exportPolygonProvenance } from 'map/mapArtifactProvenance'

export const CSV_COLUMNS = [
  'siteId',
  'polygonId',
  'label',
  'dataStatus',
  'mappedFindspotIds',
  'mappedFindspotCount',
  'accessibleFragmentCount',
  'areaSquareKm',
  'locationPrecision',
  'matchMethod',
  'scopeType',
  'scopeBounds',
  'scopePolygonId',
  'visualization',
  'siteFilter',
  'exportedAt',
  'shareUrl',
  'canonicalSiteId',
  'artifactSourceRevision',
  'mappingSourceRevisions',
  'artifactManifestSha256',
  'polygonGeometrySha256',
] as const

function startsWithFormula(value: string): boolean {
  for (const character of value) {
    const codePoint = character.charCodeAt(0)
    if (
      /\s/.test(character) ||
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f)
    ) {
      continue
    }
    return '=+-@'.includes(character)
  }
  return false
}

function escapeCsvValue(value: string): string {
  const guarded = startsWithFormula(value) ? `'${value}` : value
  return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded
}

function optional(value: number | string | null): string {
  return value === null ? '' : String(value)
}

function csvCells(row: MapExportRow, context: MapExportContext): string[] {
  const provenance = exportPolygonProvenance(row.siteId)
  const scopeBounds =
    context.scope.type === 'viewport'
      ? JSON.stringify(context.scope.bounds)
      : ''
  const scopePolygonId =
    context.scope.type === 'selection' ? context.scope.polygonId : ''
  return [
    row.siteId,
    row.polygonId,
    row.label,
    row.dataStatus,
    row.mappedFindspotIds?.join(' ') ?? '',
    optional(row.mappedFindspotCount),
    optional(row.accessibleFragmentCount),
    row.areaSquareKm === null ? '' : row.areaSquareKm.toFixed(6),
    row.locationPrecision ?? '',
    row.matchMethod ?? '',
    context.scope.type,
    scopeBounds,
    scopePolygonId,
    context.visualization,
    context.siteFilter,
    context.exportedAt,
    context.shareUrl,
    provenance.canonicalSiteId ?? '',
    provenance.artifactSourceRevision ?? '',
    provenance.mappingSourceRevisions.join('|'),
    provenance.artifactManifestSha256 ?? '',
    provenance.polygonGeometrySha256 ?? '',
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
