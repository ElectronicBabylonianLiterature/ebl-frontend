import { useMemo, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  runSpatialSearch,
  type SpatialSearchData,
  type SpatialSearchDataStatus,
  type SpatialSearchResult,
  type SpatialSearchShape,
} from 'map/spatialSearch'
import useSpatialSearchDrawing from 'map/useSpatialSearchDrawing'
import useSpatialSearchInteraction from 'map/useSpatialSearchInteraction'

export interface SpatialSearchController {
  readonly shape: SpatialSearchShape | null
  readonly result: SpatialSearchResult
  readonly isDrawing: boolean
  readonly cornerCount: number
  readonly validationMessage: string | null
  readonly searchViewport: () => void
  readonly startDrawing: () => void
  readonly addCornerAtCenter: () => void
  readonly clear: () => void
}

function dataStatus(status: string): SpatialSearchDataStatus {
  if (status === 'loaded-with-mappings' || status === 'loaded-empty') {
    return 'available'
  }
  return status === 'loading' ? 'loading' : 'unavailable'
}

export default function useMapSpatialSearch(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
  index: ExcavationPolygonIndex,
  fragmentMapData: FragmentMapDataState,
): SpatialSearchController {
  const drawing = useSpatialSearchDrawing(mapRef, isActive)
  useSpatialSearchInteraction(mapRef, {
    isActive,
    refs: drawing.refs,
    drawStart: drawing.drawStart,
    shape: drawing.shape,
    addCorner: drawing.addCorner,
    clear: drawing.clear,
  })

  const data = useMemo<SpatialSearchData>(
    () => ({
      summaries: fragmentMapData.polygonSummaries,
      siteStatuses: new Map(
        [...fragmentMapData.sites].map(([siteId, site]) => [
          siteId,
          dataStatus(site.status),
        ]),
      ),
    }),
    [fragmentMapData],
  )
  const result = useMemo(
    () =>
      drawing.shape
        ? runSpatialSearch(drawing.shape, index, data)
        : EMPTY_SPATIAL_SEARCH_RESULT,
    [data, drawing.shape, index],
  )

  return {
    shape: drawing.shape,
    result,
    isDrawing: drawing.isDrawing,
    cornerCount: drawing.drawStart === null ? 0 : 1,
    validationMessage: drawing.validationMessage,
    searchViewport: drawing.searchViewport,
    startDrawing: drawing.startDrawing,
    addCornerAtCenter: drawing.addCornerAtCenter,
    clear: drawing.clear,
  }
}
