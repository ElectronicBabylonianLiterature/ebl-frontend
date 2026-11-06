import React from 'react'
import { Form } from 'react-bootstrap'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import { findMapSite } from 'map/mapSites'

interface Props {
  readonly polygons: readonly ExcavationPolygon[]
  readonly selectedPolygonId: string | null
  readonly onSelect: (polygonId: string | null) => void
}

export default function MapExcavationAreaSelector({
  polygons,
  selectedPolygonId,
  onSelect,
}: Props): JSX.Element {
  const baseLabels = polygons.map(
    (polygon) =>
      (findMapSite(polygon.siteId)?.siteName ?? polygon.siteId) +
      ' — ' +
      (polygon.name ?? polygon.polygonId),
  )
  const duplicateLabels = new Set(
    baseLabels.filter((label, index) => baseLabels.indexOf(label) !== index),
  )

  return (
    <Form.Group controlId="map-excavation-area-selector">
      <Form.Label>Excavation area</Form.Label>
      <Form.Select
        aria-label="Select excavation area"
        value={selectedPolygonId ?? ''}
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">No area selected</option>
        {polygons.map((polygon, index) => (
          <option key={polygon.polygonId} value={polygon.polygonId}>
            {baseLabels[index]}
            {duplicateLabels.has(baseLabels[index])
              ? ' — ' + polygon.polygonId
              : ''}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}
