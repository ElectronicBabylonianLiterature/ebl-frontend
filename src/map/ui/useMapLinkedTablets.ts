import type { FindspotService } from 'fragmentarium/application/FindspotService'
import useFragmentMapData from 'map/domain/useFragmentMapData'
import type { ExcavationPolygonIndexState } from 'map/maplibre/useExcavationPolygonIndex'

export default function useMapLinkedTablets({
  findspotService,
  polygons,
  isVisible,
  selectedAreaId,
}: {
  readonly findspotService: FindspotService
  readonly polygons: ExcavationPolygonIndexState
  readonly isVisible: boolean
  readonly selectedAreaId: string | null
}) {
  return useFragmentMapData(
    findspotService,
    polygons.isLoaded && polygons.error === null ? polygons.index : null,
    isVisible || selectedAreaId !== null,
  )
}
