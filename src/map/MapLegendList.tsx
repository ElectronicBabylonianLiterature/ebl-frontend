import React from 'react'
import type { MapLegendEntry } from './mapLegendEntries'

interface Props {
  readonly entries: readonly MapLegendEntry[]
  readonly label: string
}

/**
 * Each entry pairs a mark with its words, and the mark itself carries the
 * pattern (solid, dashed, dash-dot, halo) that the polygon outline uses — so
 * the legend stays usable without colour perception.
 */
export default function MapLegendList({ entries, label }: Props): JSX.Element {
  return (
    <ul className="map-legend__entries" aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.key} className="map-legend__entry">
          <span
            aria-hidden="true"
            className={`map-legend__mark map-legend__mark--${entry.pattern}`}
            style={{ borderColor: entry.color, background: entry.color }}
          />
          <span className="map-legend__label">{entry.label}</span>
        </li>
      ))}
    </ul>
  )
}
