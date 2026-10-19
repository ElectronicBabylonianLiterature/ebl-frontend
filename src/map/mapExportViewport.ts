import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import type { MapExportScope } from 'map/mapExportData'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import { viewportSearchBounds } from 'map/spatialBounds'

function renderedPolygons(
  map: MapLibreMap,
  isLayerVisible: boolean,
  polygonsById: ReadonlyMap<string, ExcavationPolygon>,
): readonly ExcavationPolygon[] {
  if (!isLayerVisible || !map.getLayer(EXCAVATION_AREA_FILL_LAYER_ID)) return []
  const ids = new Set(
    map
      .queryRenderedFeatures(undefined, {
        layers: [EXCAVATION_AREA_FILL_LAYER_ID],
      })
      .map(({ id }) => id)
      .filter((id): id is string => typeof id === 'string'),
  )
  return [...ids]
    .map((id) => polygonsById.get(id))
    .filter((polygon): polygon is ExcavationPolygon => polygon !== undefined)
}

interface ExportViewportOptions {
  readonly isLayerVisible: boolean
  readonly polygonsById: ReadonlyMap<string, ExcavationPolygon>
  readonly setVisiblePolygons: (polygons: readonly ExcavationPolygon[]) => void
  readonly setScope: (scope: MapExportScope) => void
}

export function subscribeExportViewport(
  map: MapLibreMap,
  mapRef: MutableRefObject<MapLibreMap | null>,
  {
    isLayerVisible,
    polygonsById,
    setVisiblePolygons,
    setScope,
  }: ExportViewportOptions,
): () => void {
  const update = (): void => {
    if (mapRef.current !== map) return
    const mapBounds = map.getBounds()
    const bounds =
      viewportSearchBounds(
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth(),
      ) ?? []
    setScope({ type: 'viewport', bounds })
    setVisiblePolygons(renderedPolygons(map, isLayerVisible, polygonsById))
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
}
