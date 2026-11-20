import React from 'react'
import { Form } from 'react-bootstrap'

interface Props {
  readonly showExcavationAreas: boolean
  readonly onShowExcavationAreasChange: (isVisible: boolean) => void
}

export default function MapLayerControls({
  showExcavationAreas,
  onShowExcavationAreasChange,
}: Props): JSX.Element {
  return (
    <Form.Check
      className="map-layer-controls"
      type="checkbox"
      id="map-layer-excavation-areas"
      label="Excavation areas"
      checked={showExcavationAreas}
      onChange={(event) =>
        onShowExcavationAreasChange(event.currentTarget.checked)
      }
    />
  )
}
