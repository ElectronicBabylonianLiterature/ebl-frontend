import { isMapSiteId } from 'fragmentarium/domain/mapSites'
import type { PolygonFindspotSummary } from 'fragmentarium/domain/findspotMapData'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
} from 'map/domain/useFragmentMapData'

export interface PolygonLinkedData {
  readonly summary: PolygonFindspotSummary | undefined
  readonly status: FragmentMapDataStatus
}

export function polygonLinkedData(
  data: FragmentMapDataState,
  polygon: Pick<ExcavationPolygon, 'siteId' | 'polygonId'>,
): PolygonLinkedData {
  const site = isMapSiteId(polygon.siteId)
    ? data.sites.get(polygon.siteId)
    : undefined
  return {
    summary: site?.polygonSummaries.get(polygon.polygonId),
    status: site?.status ?? 'not-configured',
  }
}
