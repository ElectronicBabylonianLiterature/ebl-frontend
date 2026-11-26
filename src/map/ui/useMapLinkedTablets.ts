import type { FindspotService } from 'fragmentarium/application/FindspotService'
import useFragmentMapData from 'map/domain/useFragmentMapData'
import type { ExcavationPolygonIndexState } from 'map/maplibre/useExcavationPolygonIndex'
import { usablePolygonIndex } from 'map/domain/excavationPolygonIndex'

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
    usablePolygonIndex(polygons),
    isVisible || selectedAreaId !== null,
  )
}
