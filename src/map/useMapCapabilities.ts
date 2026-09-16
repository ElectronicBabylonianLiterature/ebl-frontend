import { useMemo } from 'react'
import { validatedHistoricalMapOverlays } from './historicalOverlays'
import type { MapSelection } from './mapSelection'
import type { MapSiteData } from './useMapSiteData'
import {
  type MapSiteCapabilities,
  deriveAllMapSiteCapabilities,
} from './mapSiteCapabilities'

export interface MapCapabilities {
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly selectedPolygonSite: MapSiteCapabilities | undefined
}

function siteIdOfPolygon(
  siteData: MapSiteData,
  polygonId: string,
): string | undefined {
  return [...siteData.excavationPolygonIndex.entries()].find(([, polygons]) =>
    polygons.some((polygon) => polygon.polygonId === polygonId),
  )?.[0]
}

export default function useMapCapabilities(
  siteData: MapSiteData,
  selection: MapSelection | null,
): MapCapabilities {
  const capabilities = useMemo(
    () =>
      deriveAllMapSiteCapabilities({
        overlays: validatedHistoricalMapOverlays,
        excavationPolygons: [
          ...siteData.excavationPolygonIndex.values(),
        ].flat(),
        fragmentMapData: siteData.fragmentMapData,
        fragmentDataStatus: siteData.fragmentMapDataStatus,
      }),
    [
      siteData.excavationPolygonIndex,
      siteData.fragmentMapData,
      siteData.fragmentMapDataStatus,
    ],
  )

  const selectedPolygonSite = useMemo(() => {
    if (selection?.type !== 'excavation-area') return undefined

    const siteId = siteIdOfPolygon(siteData, selection.polygonId)
    return capabilities.find((site) => site.siteId === siteId)
  }, [selection, siteData, capabilities])

  return { capabilities, selectedPolygonSite }
}
