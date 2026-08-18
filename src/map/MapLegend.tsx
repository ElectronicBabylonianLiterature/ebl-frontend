import React, { useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from './mapChoroplethScale'
import { mapLegendEntries } from './mapLegendEntries'
import MapLegendList from './MapLegendList'

interface Props {
  readonly mode: MapVisualizationMode
  readonly legend: ChoroplethLegend
}

/**
 * A small, self-contained toggle — deliberately outside the shared panel
 * model. It never competes with a tool panel for the same space, so it may
 * coexist with one open, and its contents follow whichever visualization
 * mode is active.
 */
export default function MapLegend({ mode, legend }: Props): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const entries = useMemo(() => mapLegendEntries(mode, legend), [mode, legend])

  return (
    <div className="map-legend">
      <Button
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
        <div id="map-legend-body" className="map-legend__body">
          <p className="map-legend__unit">{legend.unit}</p>
          <MapLegendList entries={entries} label="Map legend" />
        </div>
      ) : null}
    </div>
  )
}
