import React from 'react'
import { Form } from 'react-bootstrap'
import {
  type MapDimensionMode,
  type MapExtrusionMetric,
  MAP_EXTRUSION_METRICS,
  MAX_EXTRUSION_SCALE,
  MIN_EXTRUSION_SCALE,
  MIN_TERRAIN_EXAGGERATION,
} from './map3dState'
import { MAX_TERRAIN_EXAGGERATION } from './mapTerrainLayers'
import type { ExtrusionScale } from './mapExtrusionScale'
import type { Map3dTour } from './useMap3dTour'
import type { MapTerrainResult } from './useMapTerrain'
import {
  DIMENSION_MODE_LABELS,
  EXTRUSION_METRIC_LABELS,
  TERRAIN_RELIEF_NOTE,
  TERRAIN_RELIEF_TITLE,
} from './map3dLabels'
import Map3dExtrusionLegend from './Map3dExtrusionLegend'
import Map3dTourControls from './Map3dTourControls'

export interface Map3dPanelProps {
  readonly mode: MapDimensionMode
  readonly metric: MapExtrusionMetric
  readonly extrusionScale: number
  readonly terrainExaggeration: number
  readonly hillshadeVisible: boolean
  readonly scale: ExtrusionScale | null
  readonly terrain: MapTerrainResult
  readonly tour: Map3dTour
  readonly hasExtrusionData: boolean
  readonly isDensityAvailable: boolean
  readonly onModeChange: (mode: MapDimensionMode) => void
  readonly onMetricChange: (metric: MapExtrusionMetric) => void
  readonly onExtrusionScaleChange: (value: number) => void
  readonly onTerrainExaggerationChange: (value: number) => void
  readonly onHillshadeChange: (isVisible: boolean) => void
}

const AVAILABLE_MODES: readonly MapDimensionMode[] = [
  '2d',
  'terrain',
  'extrusion',
]

function ViewControls({
  mode,
  terrain,
  hasExtrusionData,
  onModeChange,
}: Pick<
  Map3dPanelProps,
  'mode' | 'terrain' | 'hasExtrusionData' | 'onModeChange'
>): JSX.Element {
  const modes = AVAILABLE_MODES.filter(
    (entry) =>
      (entry !== 'terrain' || terrain.isSupported) &&
      (entry !== 'extrusion' || hasExtrusionData),
  )

  return (
    <fieldset className="map-3d-panel__group">
      <legend>View</legend>
      {modes.map((entry) => (
        <Form.Check
          key={entry}
          type="radio"
          name="map-3d-mode"
          id={`map-3d-mode-${entry}`}
          label={DIMENSION_MODE_LABELS[entry]}
          checked={mode === entry}
          onChange={() => onModeChange(entry)}
        />
      ))}
    </fieldset>
  )
}

function ReliefControls({
  terrainExaggeration,
  hillshadeVisible,
  onTerrainExaggerationChange,
  onHillshadeChange,
}: Pick<
  Map3dPanelProps,
  | 'terrainExaggeration'
  | 'hillshadeVisible'
  | 'onTerrainExaggerationChange'
  | 'onHillshadeChange'
>): JSX.Element {
  return (
    <fieldset className="map-3d-panel__group">
      <legend>{TERRAIN_RELIEF_TITLE}</legend>
      <Form.Group controlId="map-3d-exaggeration">
        <Form.Label>{`Terrain exaggeration (${terrainExaggeration.toFixed(1)}×)`}</Form.Label>
        <Form.Control
          type="range"
          min={MIN_TERRAIN_EXAGGERATION}
          max={MAX_TERRAIN_EXAGGERATION}
          step={0.1}
          value={terrainExaggeration}
          onChange={(event) =>
            onTerrainExaggerationChange(Number(event.target.value))
          }
        />
      </Form.Group>
      <Form.Check
        type="switch"
        id="map-3d-hillshade"
        label="Hillshade"
        checked={hillshadeVisible}
        onChange={(event) => onHillshadeChange(event.target.checked)}
      />
      <p className="map-tool-panel__note">{TERRAIN_RELIEF_NOTE}</p>
    </fieldset>
  )
}

/**
 * One compact panel inside the existing drawer, not another permanent surface.
 * A control appears only when the data behind it exists: no extrusion without
 * mapped polygons, no density without a usable geodesic area, no terrain
 * controls on a device where terrain is unsupported, no tour without a site.
 */
export default function Map3dPanel(props: Map3dPanelProps): JSX.Element {
  const metrics = MAP_EXTRUSION_METRICS.filter(
    (entry) => entry !== 'fragment-density' || props.isDensityAvailable,
  )

  return (
    <div className="map-tool-panel map-3d-panel">
      <ViewControls
        mode={props.mode}
        terrain={props.terrain}
        hasExtrusionData={props.hasExtrusionData}
        onModeChange={props.onModeChange}
      />
      {props.mode === 'extrusion' ? (
        <fieldset className="map-3d-panel__group">
          <legend>Extrusion metric</legend>
          <Form.Group controlId="map-3d-metric">
            <Form.Label>Height represents</Form.Label>
            <Form.Control
              as="select"
              value={props.metric}
              onChange={(event) =>
                props.onMetricChange(event.target.value as MapExtrusionMetric)
              }
            >
              {metrics.map((entry) => (
                <option key={entry} value={entry}>
                  {EXTRUSION_METRIC_LABELS[entry]}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="map-3d-extrusion-scale">
            <Form.Label>
              {`Height scale (${props.extrusionScale.toFixed(1)}×)`}
            </Form.Label>
            <Form.Control
              type="range"
              min={MIN_EXTRUSION_SCALE}
              max={MAX_EXTRUSION_SCALE}
              step={0.1}
              value={props.extrusionScale}
              onChange={(event) =>
                props.onExtrusionScaleChange(Number(event.target.value))
              }
            />
          </Form.Group>
          <Map3dExtrusionLegend metric={props.metric} scale={props.scale} />
        </fieldset>
      ) : null}
      {props.terrain.isSupported ? (
        <ReliefControls
          terrainExaggeration={props.terrainExaggeration}
          hillshadeVisible={props.hillshadeVisible}
          onTerrainExaggerationChange={props.onTerrainExaggerationChange}
          onHillshadeChange={props.onHillshadeChange}
        />
      ) : null}
      <fieldset className="map-3d-panel__group">
        <legend>Research tools</legend>
        <Map3dTourControls tour={props.tour} />
      </fieldset>
    </div>
  )
}
