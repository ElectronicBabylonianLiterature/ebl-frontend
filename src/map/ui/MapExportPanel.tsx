import React from 'react'
import { Button } from 'react-bootstrap'
import MapShareLink from 'map/ui/MapShareLink'
import type {
  MapExportContext,
  MapExportRow,
  MapExportScope,
} from 'map/domain/mapExportData'
import {
  downloadExportCsv,
  downloadExportGeoJson,
} from 'map/domain/mapExportDownload'

interface Props {
  readonly rows: readonly MapExportRow[]
  readonly scope: MapExportScope
  readonly buildContext: () => MapExportContext
}

function scopeDescription(scope: MapExportScope, rowCount: number): string {
  if (scope.type === 'selection') {
    return rowCount === 0
      ? 'The selected excavation area is not ready to export.'
      : 'The selected excavation area will be exported.'
  }
  if (rowCount === 0) {
    return 'No displayed excavation areas are in the current map view.'
  }
  const areaLabel = rowCount === 1 ? 'area' : 'areas'
  return `${rowCount} displayed excavation ${areaLabel} in the current map view will be exported.`
}

export default function MapExportPanel({
  rows,
  scope,
  buildContext,
}: Props): JSX.Element {
  const isEmpty = rows.length === 0

  return (
    <div className="map-tool-panel">
      <p className="map-tool-panel__status" role="status">
        {scopeDescription(scope, rows.length)}
      </p>
      <div className="map-tool-panel__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={isEmpty}
          onClick={() => downloadExportGeoJson(rows, buildContext())}
        >
          Download GeoJSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={isEmpty}
          onClick={() => downloadExportCsv(rows, buildContext())}
        >
          Download CSV
        </Button>
      </div>
      <MapShareLink />
      <p className="map-tool-panel__note">
        Image export is unavailable. Saving a rendered map image needs basemap
        and overlay licensing to be confirmed first. Use GeoJSON or CSV export,
        or the shareable map link.
      </p>
      <p className="map-tool-panel__note">
        Linked-data fields are blank when site data is unavailable. Counts are
        caller-authorized snapshots at the export time.
      </p>
    </div>
  )
}
