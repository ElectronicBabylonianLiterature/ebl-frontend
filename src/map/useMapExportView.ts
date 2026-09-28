import { useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  toExportRows,
  type MapExportRow,
  type MapExportScope,
} from 'map/mapExportData'
import { viewportSearchBounds } from 'map/spatialBounds'
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

    const isCurrentMap = (): boolean => mapRef.current === map
    const update = (): void => {
      if (!isCurrentMap()) return
      const mapBounds = map.getBounds()
      const bounds =
        viewportSearchBounds(
          mapBounds.getWest(),
          mapBounds.getSouth(),
          mapBounds.getEast(),
          mapBounds.getNorth(),
        ) ?? []
      setScope({ type: 'viewport', bounds })

      if (!isLayerVisible || !map.getLayer(EXCAVATION_AREA_FILL_LAYER_ID)) {
        setVisiblePolygons([])
        return
      }
      const ids = new Set(
        map
          .queryRenderedFeatures(undefined, {
            layers: [EXCAVATION_AREA_FILL_LAYER_ID],
          })
          .map(({ id }) => id)
          .filter((id): id is string => typeof id === 'string'),
      )
      setVisiblePolygons(
        [...ids]
          .map((id) => polygonsById.get(id))
          .filter(
            (polygon): polygon is ExcavationPolygon => polygon !== undefined,
          ),
      )
    }

    map.on('moveend', update)
    map.on('idle', update)
    if (map.isStyleLoaded()) update()
    else map.once('load', update)

    return () => {
      map.off('moveend', update)
      map.off('idle', update)
      map.off('load', update)
    }
  }, [isLayerVisible, mapRef, polygonsById, selectedPolygon])

  const rows = useMemo(
    () => toExportRows(visiblePolygons, fragmentMapData.sites),
    [fragmentMapData.sites, visiblePolygons],
  )

  return { rows, scope }
}
