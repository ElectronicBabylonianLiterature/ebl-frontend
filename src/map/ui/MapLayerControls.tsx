import React from 'react'
import { Form } from 'react-bootstrap'

interface Props {
  readonly showExcavationAreas: boolean
  readonly canShowExcavationAreas: boolean
  readonly onShowExcavationAreasChange: (isVisible: boolean) => void
}

export default function MapLayerControls({
  showExcavationAreas,
  canShowExcavationAreas,
  onShowExcavationAreasChange,
}: Props): JSX.Element {
  return (
    <fieldset className="map-layer-controls">
      <legend className="map-layer-controls__legend">Map layers</legend>
      <Form.Check
        type="checkbox"
        id="map-layer-excavation-areas"
        label="Excavation areas"
        checked={showExcavationAreas}
        disabled={!canShowExcavationAreas}
        onChange={(event) =>
          onShowExcavationAreasChange(event.currentTarget.checked)
        }
      />
    </fieldset>
  )
}
