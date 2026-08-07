import React from 'react'
import { Form } from 'react-bootstrap'
import type { MapTerrainResult } from './useMapTerrain'
import { TERRAIN_PRECISION_NOTE } from './mapTerrainSource'

interface Props {
  readonly terrain: MapTerrainResult
  readonly isRequested: boolean
  readonly onChange: (isEnabled: boolean) => void
}

export default function MapTerrainPanel({
  terrain,
  isRequested,
  onChange,
}: Props): JSX.Element {
  return (
    <div className="map-tool-panel">
      <Form.Check
        type="switch"
        id="map-terrain-toggle"
        label="Modern elevation model"
        checked={isRequested && terrain.isEnabled}
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
      {terrain.unavailableReason === 'low-power-device' ? (
        <p className="map-tool-panel__status" role="status">
          Elevation is disabled on this device because it reports limited memory
          or processor cores.
        </p>
      ) : null}
    </div>
  )
}
