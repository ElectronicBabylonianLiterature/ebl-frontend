import React from 'react'
import { Alert } from 'react-bootstrap'
import MapLayerControls from 'map/MapLayerControls'

interface Props {
  readonly isLoaded: boolean
  readonly isUnavailable: boolean
  readonly showExcavationAreas: boolean
  readonly canShowExcavationAreas: boolean
  readonly onShowExcavationAreasChange: (isVisible: boolean) => void
}

export default function MapExcavationLayerPanel({
  isLoaded,
  isUnavailable,
  ...controls
}: Props): JSX.Element {
  return (
    <>
      {isLoaded ? null : <p role="status">Loading excavation areas…</p>}
      {isUnavailable ? (
        <Alert variant="warning">Excavation areas are unavailable.</Alert>
      ) : null}
      <MapLayerControls {...controls} />
    </>
  )
}
