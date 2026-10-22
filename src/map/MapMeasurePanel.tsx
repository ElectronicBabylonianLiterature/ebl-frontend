import React from 'react'
import type { Position } from 'geojson'
import { Button, Form } from 'react-bootstrap'
import {
  MEASUREMENT_DISCLAIMER,
  type MeasurementMode,
  type MeasurementUnits,
  measure,
} from 'map/mapMeasurement'
import type { MapElevationProfile } from 'map/useMapElevationProfile'
import MapElevationProfilePanel from 'map/MapElevationProfilePanel'

interface Props {
  readonly mode: MeasurementMode
  readonly units: MeasurementUnits
  readonly positions: readonly Position[]
  readonly onModeChange: (mode: MeasurementMode) => void
  readonly onUnitsChange: (units: MeasurementUnits) => void
  readonly onAddPointAtCenter: () => void
  readonly onClear: () => void
  readonly elevation: MapElevationProfile
}

export default function MapMeasurePanel({
  mode,
  units,
  positions,
  onModeChange,
  onUnitsChange,
  onAddPointAtCenter,
  onClear,
  elevation,
}: Props): JSX.Element {
  const measurement = measure(mode, positions, units)

  return (
    <div className="map-tool-panel">
      <Form.Group controlId="map-measure-mode">
        <Form.Label>Measure</Form.Label>
        <Form.Control
          as="select"
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as MeasurementMode)
          }
        >
          <option value="distance">Distance</option>
          <option value="area">Area</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="map-measure-units">
        <Form.Label>Units</Form.Label>
        <Form.Control
          as="select"
          value={units}
          onChange={(event) =>
            onUnitsChange(event.target.value as MeasurementUnits)
          }
        >
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </Form.Control>
      </Form.Group>
      <p
        className="map-tool-panel__measurement"
        role="status"
        aria-live="polite"
      >
        {measurement.label}
      </p>
      <p className="map-tool-panel__note">
        Click points on the map, or focus the map and use arrow keys to move it,
        then add its center. Escape clears the measurement.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        onClick={onAddPointAtCenter}
      >
        Add point at map center
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        disabled={positions.length === 0}
        onClick={onClear}
      >
        Clear measurement
      </Button>
      <p className="map-tool-panel__note">{MEASUREMENT_DISCLAIMER}</p>
      {mode === 'distance' ? (
        <MapElevationProfilePanel elevation={elevation} />
      ) : null}
    </div>
  )
}
