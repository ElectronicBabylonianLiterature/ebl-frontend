import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  type ExcavationPolygonIndex,
  findExcavationPolygon,
} from 'map/domain/excavationPolygonIndex'

export function fitExcavationArea(
  map: MapLibreMap | null,
  polygonIndex: ExcavationPolygonIndex,
  polygonId: string,
): void {
  const polygon = findExcavationPolygon(polygonIndex, polygonId)
  if (polygon?.bounds && map) {
    map.fitBounds([...polygon.bounds] as [number, number, number, number], {
      padding: 40,
      maxZoom: 17,
    })
  }
}
