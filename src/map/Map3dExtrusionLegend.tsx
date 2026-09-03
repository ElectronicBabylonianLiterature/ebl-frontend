import React from 'react'
import type { MapExtrusionMetric } from './map3dState'
import {
  type ExtrusionScale,
  extrusionLegendSamples,
} from './mapExtrusionScale'
import {
  ANALYTICAL_3D_TITLE,
  EXTRUSION_METRIC_LABELS,
  EXTRUSION_UNIT_NOTE,
  SCALE_METHOD_LABELS,
  analyticalHeightDisclaimer,
} from './map3dLabels'

interface Props {
  readonly metric: MapExtrusionMetric
  readonly scale: ExtrusionScale | null
}
export default function Map3dExtrusionLegend({
  metric,
  scale,
}: Props): JSX.Element {
  return (
    <section className="map-3d-legend" aria-label={ANALYTICAL_3D_TITLE}>
      <h3 className="map-3d-legend__title">{ANALYTICAL_3D_TITLE}</h3>
      <p className="map-3d-legend__metric">{EXTRUSION_METRIC_LABELS[metric]}</p>
      {scale === null ? (
        <p className="map-tool-panel__status" role="status">
          No mapped polygon has a value for this metric, so nothing is extruded.
        </p>
      ) : (
        <>
          <p className="map-3d-legend__method">
            {SCALE_METHOD_LABELS[scale.method]}
          </p>
          <ul className="map-3d-legend__samples">
            {extrusionLegendSamples(scale).map((sample) => (
              <li key={sample.heightFraction}>
                <span
                  aria-hidden="true"
                  className="map-3d-legend__bar"
                  style={{ height: `${sample.heightFraction * 100}%` }}
                />
                <span>{sample.label}</span>
              </li>
            ))}
            <li>
              <span
                aria-hidden="true"
                className="map-3d-legend__bar map-3d-legend__bar--flat"
              />
              <span>No mapped findspot — stays flat</span>
            </li>
            <li>
              <span
                aria-hidden="true"
                className="map-3d-legend__bar map-3d-legend__bar--selected"
              />
              <span>Selected area</span>
            </li>
          </ul>
        </>
      )}
      <p className="map-3d-legend__note">{EXTRUSION_UNIT_NOTE}</p>
      <p className="map-3d-legend__disclaimer">
        {analyticalHeightDisclaimer(metric)}
      </p>
    </section>
  )
}
