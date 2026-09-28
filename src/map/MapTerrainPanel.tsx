import React from 'react'
import { Form } from 'react-bootstrap'
import { TERRAIN_PRECISION_NOTE } from 'map/mapTerrainSource'
import type { MapTerrainResult } from 'map/useMapTerrain'

interface Props {
  readonly terrain: MapTerrainResult
  readonly onChange: (isEnabled: boolean) => void
}

function TerrainStatus({
  terrain,
}: {
  terrain: MapTerrainResult
}): JSX.Element | null {
  const message =
    terrain.status === 'loading'
      ? 'Loading elevation terrain…'
      : terrain.status === 'error'
        ? (terrain.errorMessage ?? 'Elevation terrain is unavailable.')
        : terrain.unavailableReason === 'low-power-device'
          ? 'Elevation is unavailable because this device reports limited memory or processor cores.'
          : terrain.unavailableReason === 'no-approved-source'
            ? 'Elevation is unavailable because no approved terrain source is configured.'
            : null
  return message ? (
    <p className="map-tool-panel__status" role="status">
      {message}
    </p>
  ) : null
}

export default function MapTerrainPanel({
  terrain,
  onChange,
}: Props): JSX.Element {
  return (
    <div className="map-tool-panel">
      <Form.Check
        type="switch"
        id="map-terrain-toggle"
        label="Modern elevation model"
        checked={terrain.isEnabled}
        disabled={!terrain.isSupported || terrain.status === 'loading'}
        onChange={(event) => onChange(event.target.checked)}
      />
      <p className="map-tool-panel__note">{TERRAIN_PRECISION_NOTE}</p>
      {terrain.source ? (
        <p className="map-tool-panel__attribution">
          {terrain.source.attribution}{' '}
          <a
            href={terrain.source.licenceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Terrain licence and attribution
          </a>
        </p>
      ) : null}
      <TerrainStatus terrain={terrain} />
    </div>
  )
}
