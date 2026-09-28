import { type MapSiteId, mapSites } from 'map/mapSites'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'

export interface MapSiteCapabilities {
  readonly siteId: MapSiteId
  readonly siteName: string
  readonly hasExcavationPolygons: boolean
}

export function deriveMapSiteCapabilities(
  polygonIndex: ExcavationPolygonIndex,
): readonly MapSiteCapabilities[] {
  return mapSites().map((site) => ({
    siteId: site.siteId,
    siteName: site.siteName,
    hasExcavationPolygons: (polygonIndex.get(site.siteId)?.length ?? 0) > 0,
  }))
}

export function anySiteHasExcavationPolygons(
  capabilities: readonly MapSiteCapabilities[],
): boolean {
  return capabilities.some((capability) => capability.hasExcavationPolygons)
}
