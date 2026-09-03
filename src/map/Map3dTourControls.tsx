import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import type { Map3dTour } from './useMap3dTour'
import { tourProgressLabel } from './map3dTour'

interface Props {
  readonly tour: Map3dTour
  readonly isCompact?: boolean
}
export default function Map3dTourControls({
  tour,
  isCompact = false,
}: Props): JSX.Element | null {
  const startRef = useRef<HTMLButtonElement>(null)
  const wasRunning = useRef(tour.isRunning)

  useEffect(() => {
    if (wasRunning.current && !tour.isRunning) startRef.current?.focus()
    wasRunning.current = tour.isRunning
  }, [tour.isRunning])

  if (!tour.canStart) return null

  return (
    <div
      className={`map-3d-tour${isCompact ? ' map-3d-tour--compact' : ''}`}
      role="group"
      aria-label="Guided 3D tour"
    >
      {tour.isRunning ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            disabled={tour.index === 0}
            onClick={tour.previous}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            disabled={tour.index >= tour.steps.length - 1}
            onClick={tour.next}
          >
            Next
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={tour.exit}
          >
            Exit tour
          </Button>
        </>
      ) : (
        <Button
          ref={startRef}
          type="button"
          size="sm"
          variant="outline-primary"
          onClick={tour.start}
        >
          Start 3D tour
        </Button>
      )}
      <span className="map-3d-tour__progress" role="status" aria-live="polite">
        {tour.isRunning
          ? tourProgressLabel(
              tour.index,
              tour.steps.length,
              tour.steps[tour.index],
            )
          : ''}
      </span>
    </div>
  )
}
