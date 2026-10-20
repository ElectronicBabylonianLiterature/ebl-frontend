import type { HistoricalMapOverlay } from 'map/historicalOverlays'
import type { FindspotMapData } from 'map/findspotMapData'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import { type MapSiteDefinition, mapSites } from 'map/mapSites'

export type MapFragmentDataState =
  | 'not-configured'
  | 'idle'
  | 'loading'
  | 'available'
  | 'empty'
  | 'error'

export interface MapSiteCapabilities {
  readonly siteId: string
  readonly siteName: string
  readonly hasCoordinates: boolean
  readonly hasSiteBoundary: boolean
  readonly hasExcavationPolygons: boolean
  readonly excavationPolygonCount: number
  readonly hasHistoricalMaps: boolean
  readonly historicalMapCount: number
  readonly hasFragmentMapData: boolean
  readonly fragmentDataState: MapFragmentDataState
  readonly supportsMapFragmentFilters: boolean
  readonly hasTerrain: boolean
  readonly has3dModels: boolean
}

export interface MapSiteCapabilityInput {
  readonly overlays: readonly HistoricalMapOverlay[]
  readonly excavationPolygons: readonly ExcavationPolygon[]
  readonly fragmentMapData?: readonly FindspotMapData[]
  readonly fragmentDataStatus?: 'idle' | 'loading' | 'loaded' | 'error'
}

function fragmentDataState(
  site: MapSiteDefinition,
  input: MapSiteCapabilityInput,
): MapFragmentDataState {
  if (site.mapDataSiteParam === null) return 'not-configured'

  switch (input.fragmentDataStatus) {
    case 'loading':
      return 'loading'
    case 'error':
      return 'error'
    case 'loaded':
      return (input.fragmentMapData?.length ?? 0) > 0 ? 'available' : 'empty'
    default:
      return 'idle'
  }
}

export function deriveMapSiteCapabilities(
  site: MapSiteDefinition,
  input: MapSiteCapabilityInput,
): MapSiteCapabilities {
  const overlays = input.overlays.filter(
    (overlay) => overlay.siteId === site.siteId,
  )
  const polygons = input.excavationPolygons.filter(
    (polygon) => polygon.siteId === site.siteId,
  )
  const state = fragmentDataState(site, input)

  return {
    siteId: site.siteId,
    siteName: site.siteName,
    hasCoordinates: polygons.some((polygon) => polygon.bounds !== null),
    hasSiteBoundary: false,
    hasExcavationPolygons: polygons.length > 0,
    excavationPolygonCount: polygons.length,
    hasHistoricalMaps: overlays.length > 0,
    historicalMapCount: overlays.length,
    hasFragmentMapData: state === 'available',
    fragmentDataState: state,
    supportsMapFragmentFilters: false,
    hasTerrain: false,
    has3dModels: false,
  }
}

export function deriveAllMapSiteCapabilities(
  input: MapSiteCapabilityInput,
): readonly MapSiteCapabilities[] {
  return mapSites().map((site) => deriveMapSiteCapabilities(site, input))
}

export function fragmentDataStatusText(
  capabilities: MapSiteCapabilities,
): string {
  switch (capabilities.fragmentDataState) {
    case 'not-configured':
      return 'Tablet-linked excavation data is not yet available for this site.'
    case 'loading':
    case 'idle':
      return 'Loading excavation tablet data...'
    case 'error':
      return 'Excavation tablet data unavailable'
    case 'empty':
      return 'No mapped excavation tablets available'
    default:
      return `Tablet-linked excavation data is available for ${capabilities.siteName}.`
  }
}

export function isLinkedDataLoaded(
  site: MapSiteCapabilities | undefined,
): boolean {
  return (
    site?.fragmentDataState === 'available' ||
    site?.fragmentDataState === 'empty'
  )
}
