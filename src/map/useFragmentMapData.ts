import { useEffect, useMemo, useState } from 'react'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  IncompatibleFindspotMapDataError,
  aggregateFindspotMapData,
} from 'map/findspotMapDataSanitizer'
import type {
  FindspotMapData,
  PolygonFindspotSummary,
} from 'map/findspotMapData'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import { type MapSiteDefinition, type MapSiteId, mapSites } from 'map/mapSites'

export type FragmentMapDataStatus =
  | 'not-configured'
  | 'loading'
  | 'loaded-with-mappings'
  | 'loaded-empty'
  | 'error'
  | 'incompatible'

export interface SiteFragmentMapDataState {
  readonly status: FragmentMapDataStatus
  readonly findspots: readonly FindspotMapData[]
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
}

export interface FragmentMapDataState {
  readonly sites: ReadonlyMap<MapSiteId, SiteFragmentMapDataState>
  readonly findspots: readonly FindspotMapData[]
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
}

const EMPTY_SUMMARIES = aggregateFindspotMapData([])

function emptySiteState(
  status: FragmentMapDataStatus,
): SiteFragmentMapDataState {
  return { status, findspots: [], polygonSummaries: EMPTY_SUMMARIES }
}

function initialSiteStates(): Map<MapSiteId, SiteFragmentMapDataState> {
  return new Map(
    mapSites().map((site) => [
      site.siteId,
      emptySiteState(site.mapDataSiteParam ? 'loading' : 'not-configured'),
    ]),
  )
}

function isCompatibleWithCanonicalPolygons(
  site: MapSiteDefinition,
  findspots: readonly FindspotMapData[],
  polygonIndex: ReadonlyMap<string, readonly ExcavationPolygon[]>,
): boolean {
  const canonicalPolygons = polygonIndex.get(site.siteId)
  if (!canonicalPolygons) return false
  const canonicalIds = new Set(
    canonicalPolygons.map((polygon) => polygon.polygonId),
  )

  return findspots.every(
    (findspot) =>
      findspot.siteId === site.mapDataSiteParam &&
      findspot.siteName === site.siteName &&
      findspot.polygonIds.every((polygonId) => canonicalIds.has(polygonId)),
  )
}

function loadedSiteState(
  findspots: readonly FindspotMapData[],
): SiteFragmentMapDataState {
  return {
    status: findspots.length === 0 ? 'loaded-empty' : 'loaded-with-mappings',
    findspots,
    polygonSummaries: aggregateFindspotMapData(findspots),
  }
}

function loadSiteMapData(
  site: MapSiteDefinition,
  findspotService: FindspotService,
  polygonIndex: ReadonlyMap<string, readonly ExcavationPolygon[]>,
  updateSite: (siteId: MapSiteId, next: SiteFragmentMapDataState) => void,
): void {
  if (!site.mapDataSiteParam) return

  findspotService
    .fetchMapData(site.siteId)
    .then((findspots) => {
      const next = isCompatibleWithCanonicalPolygons(
        site,
        findspots,
        polygonIndex,
      )
        ? loadedSiteState(findspots)
        : emptySiteState('incompatible')
      updateSite(site.siteId, next)
    })
    .catch((error: unknown) => {
      const status =
        error instanceof IncompatibleFindspotMapDataError
          ? 'incompatible'
          : 'error'
      updateSite(site.siteId, emptySiteState(status))
    })
}

function aggregateSiteStates(
  sites: ReadonlyMap<MapSiteId, SiteFragmentMapDataState>,
): FragmentMapDataState {
  const findspots = [...sites.values()].flatMap((site) => [...site.findspots])
  return {
    sites,
    findspots,
    polygonSummaries: aggregateFindspotMapData(findspots),
  }
}

export default function useFragmentMapData(
  findspotService: FindspotService,
  polygonIndex: ReadonlyMap<string, readonly ExcavationPolygon[]> | null,
): FragmentMapDataState {
  const [sites, setSites] = useState(initialSiteStates)

  useEffect(() => {
    setSites(initialSiteStates())
    if (polygonIndex === null) return

    let isMounted = true
    const updateSite = (
      siteId: MapSiteId,
      next: SiteFragmentMapDataState,
    ): void => {
      if (!isMounted) return
      setSites((current) => new Map(current).set(siteId, next))
    }

    mapSites().forEach((site) =>
      loadSiteMapData(site, findspotService, polygonIndex, updateSite),
    )

    return () => {
      isMounted = false
    }
  }, [findspotService, polygonIndex])

  return useMemo(() => aggregateSiteStates(sites), [sites])
}
