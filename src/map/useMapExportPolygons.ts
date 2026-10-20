import { useEffect, useMemo, useState, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type {
  ExcavationPolygon,
  ExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'
import { subscribeExportPolygons } from 'map/mapExportPolygons'

export default function useMapExportPolygons(
  mapRef: MutableRefObject<MapLibreMap | null>,
  index: ExcavationPolygonIndex,
): readonly ExcavationPolygon[] {
  const [visibleIds, setVisibleIds] = useState<readonly string[]>([])
  const map = mapRef.current
  useEffect(() => {
    setVisibleIds((current) => (current.length === 0 ? current : []))
    if (!map) return
    return subscribeExportPolygons(mapRef, map, (next) => {
      setVisibleIds((current) =>
        current.join('\0') === next.join('\0') ? current : next,
      )
    })
  }, [map, mapRef])
  return useMemo(() => {
    const visible = new Set(visibleIds)
    return [...index.values()]
      .flat()
      .filter(({ polygonId }) => visible.has(polygonId))
  }, [index, visibleIds])
}
