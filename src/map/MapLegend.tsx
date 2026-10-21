import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from 'map/mapChoroplethScale'
import { mapLegendEntries } from 'map/mapLegendEntries'
import MapLegendList from 'map/MapLegendList'

interface Props {
  readonly mode: MapVisualizationMode
  readonly legend: ChoroplethLegend
}
export default function MapLegend({ mode, legend }: Props): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const entries = useMemo(() => mapLegendEntries(mode, legend), [mode, legend])

  useEffect(() => {
    if (!isExpanded) return
    const closeOutside = (event: PointerEvent): void => {
      if (!event.composedPath().some((target) => target === rootRef.current)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [isExpanded])

  return (
    <div
      ref={rootRef}
      className="map-legend"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsExpanded(false)
        }
      }}
      onKeyDown={(event) => {
        if (isExpanded && event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          setIsExpanded(false)
          toggleRef.current?.focus()
        }
      }}
    >
      <Button
        ref={toggleRef}
        type="button"
        size="sm"
        variant="outline-secondary"
        aria-expanded={isExpanded}
        aria-controls="map-legend-body"
        onClick={() => setIsExpanded((current) => !current)}
      >
        Legend
      </Button>
      {isExpanded ? (
        <div
          id="map-legend-body"
          className="map-legend__body"
          role="region"
          aria-label="Map legend details"
          tabIndex={0}
        >
          <p className="map-legend__unit">{legend.unit}</p>
          <MapLegendList entries={entries} label="Map legend" />
        </div>
      ) : null}
    </div>
  )
}
