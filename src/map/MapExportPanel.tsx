import React from 'react'
import { Button } from 'react-bootstrap'
import MapShareLink from './MapShareLink'
import type { MapExportContext, MapExportRow } from './mapExportData'
import { downloadExportCsv, downloadExportGeoJson } from './mapExportDownload'
import type { ImageExportAssessment } from './mapImageExportRights'

interface Props {
  readonly rows: readonly MapExportRow[]
  readonly buildContext: () => MapExportContext
  readonly imageExport: ImageExportAssessment
}

export default function MapExportPanel({
  rows,
  buildContext,
  imageExport,
}: Props): JSX.Element {
  const isEmpty = rows.length === 0

  return (
    <div className="map-tool-panel">
      <p className="map-tool-panel__status" role="status">
        {isEmpty
          ? 'No excavation areas are currently visible to export.'
          : `${rows.length} visible excavation areas will be exported.`}
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
      {imageExport.isAllowed ? null : (
        <p className="map-tool-panel__note" role="status">
          Image export is unavailable. {imageExport.explanation}
        </p>
      )}
      <p className="map-tool-panel__note">
        Exports describe excavation areas and their mapped findspot counts. They
        never include unrestricted fragment totals.
      </p>
    </div>
  )
}
