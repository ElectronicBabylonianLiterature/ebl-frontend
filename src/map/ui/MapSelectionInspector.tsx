import React from 'react'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  type ExcavationPolygon,
  type ExcavationPolygonIndex,
  findExcavationPolygon,
} from 'map/domain/excavationPolygonIndex'
import MapResearchInspector from 'map/ui/MapResearchInspector'
import type useMapResearchSelection from 'map/ui/useMapResearchSelection'

export default function MapSelectionInspector({
  research,
  provenances,
  polygonIndex,
  renderAreaDetails,
}: {
  readonly research: ReturnType<typeof useMapResearchSelection>
  readonly provenances: readonly ProvenanceRecord[]
  readonly polygonIndex: ExcavationPolygonIndex
  readonly renderAreaDetails: (polygon: ExcavationPolygon) => React.ReactNode
}): JSX.Element | null {
  const { selection, selectedSiteId, selectedAreaId, close, focusInspector } =
    research
  const polygon = selectedAreaId
    ? findExcavationPolygon(polygonIndex, selectedAreaId)
    : undefined
  return (
    <>
      <span role="status" className="visually-hidden">
        {!focusInspector && polygon
          ? `Showing details for ${polygon.name ?? 'the selected excavation area'}.`
          : ''}
      </span>
      {selection ? (
        <MapResearchInspector
          selectionId={`${selection.kind}:${selection.id}`}
          provenance={provenances.find(({ id }) => id === selectedSiteId)}
          polygon={polygon ?? undefined}
          focusHeading={focusInspector}
          onClose={close}
        >
          {polygon ? renderAreaDetails(polygon) : null}
        </MapResearchInspector>
      ) : null}
    </>
  )
}
