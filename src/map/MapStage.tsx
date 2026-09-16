import React from 'react'
import { Alert } from 'react-bootstrap'
import type { MapHoverPreview } from './mapSelection'
import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from './mapChoroplethScale'
import MapLegend from './MapLegend'

interface Props {
  readonly containerRef: React.RefObject<HTMLDivElement>
  readonly controls: React.ReactNode
  readonly selectionPill: React.ReactNode
  readonly hoverPreview: MapHoverPreview | null
  readonly isBackgroundUnavailable: boolean
  readonly legend: ChoroplethLegend
  readonly visualizationMode: MapVisualizationMode
  readonly showLegend: boolean
  readonly analyticalNote: string | null
}

export default function MapStage({
  containerRef,
  controls,
  selectionPill,
  hoverPreview,
  isBackgroundUnavailable,
  legend,
  visualizationMode,
  showLegend,
  analyticalNote,
}: Props): JSX.Element {
  return (
    <div className="map-tab__map-frame map-stage">
      {showLegend ? (
        <MapLegend mode={visualizationMode} legend={legend} />
      ) : null}
      {controls}
      {selectionPill}
      {analyticalNote === null ? null : (
        <p className="map-stage__analytical-note">{analyticalNote}</p>
      )}
      {isBackgroundUnavailable ? (
        <Alert variant="warning" className="map-stage__background-alert">
          The map background is unavailable. Sites, excavation areas and
          historical overlays are still shown.
        </Alert>
      ) : null}
      {hoverPreview ? (
        <div
          className="map-hover-tooltip"
          role="status"
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <strong>{hoverPreview.title}</strong>
          {hoverPreview.details.map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="map-tab__container"
        aria-label="Findspot map"
      />
    </div>
  )
}
