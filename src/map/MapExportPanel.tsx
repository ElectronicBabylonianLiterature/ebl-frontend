import React from 'react'
import type { FindspotMapDataStatus } from 'map/findspotMapData'
import { Button } from 'react-bootstrap'
import MapShareLink from 'map/MapShareLink'
import type { MapExportContext, MapExportRow } from 'map/mapExportData'
import { downloadExportCsv, downloadExportGeoJson } from 'map/mapExportDownload'
import type { ImageExportAssessment } from 'map/mapImageExportRights'

interface Props {
  readonly dataStatus: FindspotMapDataStatus
  readonly rows: readonly MapExportRow[]
  readonly buildContext: () => MapExportContext
  readonly imageExport: ImageExportAssessment
}

export default function MapExportPanel({
  rows,
  dataStatus,
  buildContext,
  imageExport,
}: Props): JSX.Element {
  const isEmpty = rows.length === 0
  const isUnavailable = dataStatus !== 'loaded'

  return (
    <div className="map-tool-panel">
      <p className="map-tool-panel__status" role="status">
        {isUnavailable
          ? 'Tablet data is unavailable or still loading. Exports will be available after it loads.'
          : isEmpty
            ? 'No excavation areas are currently visible to export.'
            : `${rows.length} visible excavation areas will be exported.`}
      </p>
      <div className="map-tool-panel__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={isEmpty || isUnavailable}
          onClick={() => downloadExportGeoJson(rows, buildContext())}
        >
          Download GeoJSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={isEmpty || isUnavailable}
          onClick={() => downloadExportCsv(rows, buildContext())}
        >
          Download CSV
        </Button>
      </div>
      <MapShareLink />
      {imageExport.isAllowed ? null : (
        <p className="map-tool-panel__note" role="status">
          Image export is unavailable. {imageExport.explanation}
        </p>
      )}
      <p className="map-tool-panel__note">
        Exports describe excavation areas and their mapped findspot counts. They
        never include unrestricted tablet totals.
      </p>
    </div>
  )
}
