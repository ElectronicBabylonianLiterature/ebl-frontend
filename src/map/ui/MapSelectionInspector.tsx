import React from 'react'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  type ExcavationPolygonIndex,
  findExcavationPolygon,
} from 'map/domain/excavationPolygonIndex'
import MapResearchInspector from 'map/ui/MapResearchInspector'
import type useMapResearchSelection from 'map/ui/useMapResearchSelection'

export default function MapSelectionInspector({
  research,
  provenances,
  polygonIndex,
}: {
  readonly research: ReturnType<typeof useMapResearchSelection>
  readonly provenances: readonly ProvenanceRecord[]
  readonly polygonIndex: ExcavationPolygonIndex
}): JSX.Element | null {
  const { selection, selectedSiteId, selectedAreaId, close } = research
  if (!selection) return null
  return (
    <MapResearchInspector
      selectionId={`${selection.kind}:${selection.id}`}
      provenance={provenances.find(({ id }) => id === selectedSiteId)}
      polygon={
        selectedAreaId
          ? findExcavationPolygon(polygonIndex, selectedAreaId)
          : undefined
      }
      onClose={close}
    />
  )
}
