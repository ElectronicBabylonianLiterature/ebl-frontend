import { saveAs } from 'file-saver'
import {
  type MapExportContext,
  type MapExportRow,
  buildExportCsv,
  buildExportGeoJson,
} from './mapExportData'

export const GEOJSON_MEDIA_TYPE = 'application/geo+json;charset=utf-8'
export const CSV_MEDIA_TYPE = 'text/csv;charset=utf-8'

export function exportFileName(extension: string, exportedAt: string): string {
  const stamp = exportedAt.replace(/[:.]/g, '-')
  return `ebl-map-${stamp}.${extension}`
}

export function downloadExportGeoJson(
  rows: readonly MapExportRow[],
  context: MapExportContext,
): void {
  const blob = new Blob(
    [JSON.stringify(buildExportGeoJson(rows, context), null, 2)],
    { type: GEOJSON_MEDIA_TYPE },
  )
  saveAs(blob, exportFileName('geojson', context.exportedAt))
}

export function downloadExportCsv(
  rows: readonly MapExportRow[],
  context: MapExportContext,
): void {
  const blob = new Blob([buildExportCsv(rows, context)], {
    type: CSV_MEDIA_TYPE,
  })
  saveAs(blob, exportFileName('csv', context.exportedAt))
}
