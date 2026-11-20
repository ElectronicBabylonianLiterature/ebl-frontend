import React from 'react'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import type { FragmentMapDataState } from 'map/domain/useFragmentMapData'
import { isMapSiteId } from 'fragmentarium/domain/mapSites'
import MapSelectedAreaCard from 'map/ui/MapSelectedAreaCard'

export default function MapAreaLinkedTablets({
  polygon,
  data,
}: {
  readonly polygon: ExcavationPolygon
  readonly data: FragmentMapDataState
}): JSX.Element {
  const site = isMapSiteId(polygon.siteId)
    ? data.sites.get(polygon.siteId)
    : undefined
  return (
    <MapSelectedAreaCard
      summary={site?.polygonSummaries.get(polygon.polygonId)}
      status={site?.status ?? 'not-configured'}
    />
  )
}
