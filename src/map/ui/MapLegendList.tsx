import React from 'react'
import type { MapLegendEntry } from 'map/domain/mapLegendEntries'

interface Props {
  readonly entries: readonly MapLegendEntry[]
  readonly label: string
}

function markStyle({
  color,
  pattern,
  outlineWidth,
  outlineColor,
}: MapLegendEntry): React.CSSProperties {
  return {
    borderColor: outlineColor ?? color,
    borderWidth: outlineWidth === undefined ? undefined : `${outlineWidth}px`,
    backgroundColor: pattern === 'solid' ? color : 'transparent',
    backgroundImage:
      pattern === 'dash-dot'
        ? `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 7px, ${color} 7px 9px, transparent 9px 12px)`
        : undefined,
  }
}

export default function MapLegendList({ entries, label }: Props): JSX.Element {
  return (
    <ul className="map-legend__entries" aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.key} className="map-legend__entry">
          <span
            aria-hidden="true"
            data-testid="map-legend-mark"
            className={`map-legend__mark map-legend__mark--${entry.pattern}`}
            style={markStyle(entry)}
          />
          <span className="map-legend__label">{entry.label}</span>
        </li>
      ))}
    </ul>
  )
}
