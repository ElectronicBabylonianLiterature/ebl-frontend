import { useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import {
  toExportRows,
  type MapExportRow,
  type MapExportScope,
} from 'map/mapExportData'
import { subscribeExportViewport } from 'map/mapExportViewport'
import type { FragmentMapDataState } from 'map/useFragmentMapData'

export interface MapExportView {
  readonly rows: readonly MapExportRow[]
  readonly scope: MapExportScope
}

const EMPTY_SCOPE: MapExportScope = { type: 'viewport', bounds: [] }

export default function useMapExportView(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isLayerVisible: boolean,
  polygons: readonly ExcavationPolygon[],
  selectedPolygon: ExcavationPolygon | null,
  fragmentMapData: FragmentMapDataState,
): MapExportView {
  const [visiblePolygons, setVisiblePolygons] = useState<
    readonly ExcavationPolygon[]
  >([])
  const [scope, setScope] = useState<MapExportScope>(EMPTY_SCOPE)
  const polygonsById = useMemo(
    () => new Map(polygons.map((polygon) => [polygon.polygonId, polygon])),
    [polygons],
  )

  useEffect(() => {
    const map = mapRef.current
    if (selectedPolygon) {
      setVisiblePolygons([selectedPolygon])
      setScope({ type: 'selection', polygonId: selectedPolygon.polygonId })
      return
    }
    if (!map) {
      setVisiblePolygons([])
      setScope(EMPTY_SCOPE)
      return
    }

    return subscribeExportViewport(map, mapRef, {
      isLayerVisible,
      polygonsById,
      setVisiblePolygons,
      setScope,
    })
  }, [isLayerVisible, mapRef, polygonsById, selectedPolygon])

  const rows = useMemo(
    () => toExportRows(visiblePolygons, fragmentMapData.sites),
    [fragmentMapData.sites, visiblePolygons],
  )

  return { rows, scope }
}
