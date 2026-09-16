import React, { useMemo } from 'react'
import { Form } from 'react-bootstrap'
import {
  type ChoroplethLegend,
  type MapVisualizationMode,
  MAP_VISUALIZATION_MODES,
} from './mapChoroplethScale'
import { DENSITY_UNAVAILABLE_NOTE, mapLegendEntries } from './mapLegendEntries'
import MapLegendList from './MapLegendList'
import MapCompletenessNote from './MapCompletenessNote'

const MODE_LABELS: Readonly<Record<MapVisualizationMode, string>> = {
  mapped: 'Mapped status',
  evidence: 'Mapping evidence',
  count: 'Accessible fragments',
  log: 'Accessible fragments (log)',
  density: 'Fragments per km²',
}

export function visualizationModeLabel(mode: MapVisualizationMode): string {
  return MODE_LABELS[mode]
}

interface Props {
  readonly mode: MapVisualizationMode
  readonly legend: ChoroplethLegend
  readonly isDensityAvailable: boolean
  readonly onModeChange: (mode: MapVisualizationMode) => void
}

export default function MapVisualizationControl({
  mode,
  legend,
  isDensityAvailable,
  onModeChange,
}: Props): JSX.Element {
  const availableModes = MAP_VISUALIZATION_MODES.filter(
    (entry) => entry !== 'density' || isDensityAvailable,
  )
  const entries = useMemo(() => mapLegendEntries(mode, legend), [mode, legend])

  return (
    <section className="map-visualization" aria-label="Map visualization">
      <Form.Group controlId="map-visualization-mode">
        <Form.Label>Visualize</Form.Label>
        <Form.Control
          as="select"
          value={mode}
          onChange={(event) =>
            onModeChange(event.target.value as MapVisualizationMode)
          }
        >
          {availableModes.map((entry) => (
            <option key={entry} value={entry}>
              {MODE_LABELS[entry]}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <p className="map-visualization__unit">{legend.unit}</p>
      <div className="map-legend map-legend--inline">
        <MapLegendList entries={entries} label="Map legend classes" />
      </div>
      {mode === 'evidence' ? (
        <p className="map-visualization__caveat">
          Curated and verified-source mappings are both scholarly links; they
          differ in where the link came from, not in how much they are worth.
        </p>
      ) : null}
      {legend.classes.length === 0 &&
      mode !== 'mapped' &&
      mode !== 'evidence' ? (
        <p className="map-visualization__empty" role="status">
          No accessible fragment data is available to classify.
        </p>
      ) : null}
      {mode === 'density' ? (
        <p className="map-visualization__caveat">
          Density is fragments per square kilometre of excavation area. It
          describes association with a mapped excavation area, not the density
          of exact findspot points. {DENSITY_UNAVAILABLE_NOTE}
        </p>
      ) : null}
      <MapCompletenessNote />
    </section>
  )
}
