import React from 'react'
import { Button, ButtonGroup, Form } from 'react-bootstrap'
import { MEASUREMENT_DISCLAIMER } from 'map/mapMeasurement'
import type { MeasurementController } from 'map/useMapMeasurement'

interface Props {
  readonly measurement: MeasurementController
}

export default function MapMeasurePanel({ measurement }: Props): JSX.Element {
  return (
    <div className="map-measure">
      <ButtonGroup size="sm" aria-label="Measurement type">
        <Button
          type="button"
          variant={
            measurement.mode === 'distance' ? 'secondary' : 'outline-secondary'
          }
          aria-pressed={measurement.mode === 'distance'}
          onClick={() => measurement.setMode('distance')}
        >
          Distance
        </Button>
        <Button
          type="button"
          variant={
            measurement.mode === 'area' ? 'secondary' : 'outline-secondary'
          }
          aria-pressed={measurement.mode === 'area'}
          onClick={() => measurement.setMode('area')}
        >
          Area
        </Button>
      </ButtonGroup>
      <Form.Check
        type="switch"
        id="map-measure-units"
        label="Imperial units"
        checked={measurement.units === 'imperial'}
        onChange={(event) =>
          measurement.setUnits(
            event.currentTarget.checked ? 'imperial' : 'metric',
          )
        }
      />
      <p className="map-measure__value" role="status">
        {measurement.measurement.label}
      </p>
      <div className="map-measure__actions">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={measurement.pointCount === 0}
          onClick={measurement.removeLastPoint}
        >
          Undo point
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={measurement.pointCount === 0}
          onClick={measurement.clear}
        >
          Clear
        </Button>
      </div>
      <p className="map-measure__disclaimer">{MEASUREMENT_DISCLAIMER}</p>
    </div>
  )
}
