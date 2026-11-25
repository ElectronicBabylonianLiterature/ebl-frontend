import React from 'react'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import { findMapSite } from 'fragmentarium/domain/mapSites'

interface Props {
  readonly polygonIndex: ExcavationPolygonIndex
  readonly selectedId: string | null
  readonly onSelect: (id: string, trigger: HTMLSelectElement) => void
}

export default function MapExcavationBrowser({
  polygonIndex,
  selectedId,
  onSelect,
}: Props): JSX.Element | null {
  if (polygonIndex.size === 0) return null
  return (
    <div className="map-excavation-browser">
      <label htmlFor="map-excavation-browser">Inspect excavation area</label>
      <select
        id="map-excavation-browser"
        className="form-select"
        value={selectedId ?? ''}
        onChange={(event) => {
          if (event.currentTarget.value) {
            onSelect(event.currentTarget.value, event.currentTarget)
          }
        }}
      >
        <option value="">Choose a site and area…</option>
        {[...polygonIndex].map(([siteId, polygons]) => (
          <optgroup
            key={siteId}
            label={findMapSite(siteId)?.siteName ?? siteId}
          >
            {polygons.map((polygon) => (
              <option key={polygon.polygonId} value={polygon.polygonId}>
                {polygon.name ?? polygon.polygonId}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
