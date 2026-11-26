import React from 'react'
import { Alert } from 'react-bootstrap'

interface Props {
  readonly containerRef: React.RefObject<HTMLDivElement>
  readonly isBackgroundUnavailable: boolean
  readonly overlay?: React.ReactNode
  readonly legend?: React.ReactNode
  readonly describedById?: string
  readonly showFallbackHint?: boolean
}

export default function MapStage({
  containerRef,
  isBackgroundUnavailable,
  overlay,
  legend,
  describedById,
  showFallbackHint = false,
}: Props): JSX.Element {
  return (
    <div className="map-stage">
      {isBackgroundUnavailable ? (
        <Alert variant="warning" className="map-stage__background-alert">
          The map background is unavailable.
          {showFallbackHint
            ? ' You can still browse sites and use Library links.'
            : null}
        </Alert>
      ) : null}
      {legend}
      {overlay}
      <div
        ref={containerRef}
        className="map-tab__container map-stage__container"
        role="region"
        aria-label="Interactive findspot map"
        aria-describedby={describedById}
      />
    </div>
  )
}
