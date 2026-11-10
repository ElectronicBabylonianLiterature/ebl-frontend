import { useContext, useEffect, useMemo, useState } from 'react'
import SessionContext from 'auth/SessionContext'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  IncompatibleFindspotMapDataError,
  aggregateFindspotMapData,
} from 'fragmentarium/domain/findspotMapDataSanitizer'
import type {
  FindspotMapData,
  PolygonFindspotSummary,
} from 'fragmentarium/domain/findspotMapData'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import {
  type MapSiteDefinition,
  type MapSiteId,
  mapSites,
} from 'fragmentarium/domain/mapSites'

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

async function fetchSiteState(
  findspotService: FindspotService,
  site: MapSiteDefinition,
  polygonIndex: ReadonlyMap<string, readonly ExcavationPolygon[]>,
  signal: AbortSignal,
): Promise<SiteFragmentMapDataState> {
  try {
    const findspots = await findspotService.fetchMapData(site.siteId, signal)
    return isCompatibleWithCanonicalPolygons(site, findspots, polygonIndex)
      ? {
          status:
            findspots.length === 0 ? 'loaded-empty' : 'loaded-with-mappings',
          findspots,
          polygonSummaries: aggregateFindspotMapData(findspots),
        }
      : emptySiteState('incompatible')
  } catch (error) {
    return emptySiteState(
      error instanceof IncompatibleFindspotMapDataError
        ? 'incompatible'
        : 'error',
    )
  }
}

export default function useFragmentMapData(
  findspotService: FindspotService,
  polygonIndex: ReadonlyMap<string, readonly ExcavationPolygon[]> | null,
  enabled = true,
): FragmentMapDataState {
  const session = useContext(SessionContext)
  const [snapshot, setSnapshot] = useState(() => ({
    session,
    findspotService,
    polygonIndex,
    enabled,
    sites: initialSiteStates(),
  }))
  const sites =
    snapshot.session === session &&
    snapshot.findspotService === findspotService &&
    snapshot.polygonIndex === polygonIndex &&
    snapshot.enabled === enabled
      ? snapshot.sites
      : initialSiteStates()

  useEffect(() => {
    setSnapshot({
      session,
      findspotService,
      polygonIndex,
      enabled,
      sites: initialSiteStates(),
    })
    if (!enabled || polygonIndex === null) return
    const controller = new AbortController()

    let isMounted = true
    const updateSite = (
      siteId: MapSiteId,
      next: SiteFragmentMapDataState,
    ): void => {
      if (!isMounted) return
      setSnapshot((current) => ({
        ...current,
        sites: new Map(current.sites).set(siteId, next),
      }))
    }

    mapSites().forEach((site) => {
      if (!site.mapDataSiteParam) return

      void fetchSiteState(
        findspotService,
        site,
        polygonIndex,
        controller.signal,
      ).then((next) => updateSite(site.siteId, next))
    })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [findspotService, polygonIndex, session, enabled])

  return useMemo(() => {
    const findspots = [...sites.values()].flatMap((site) => [...site.findspots])
    return {
      sites,
      findspots,
      polygonSummaries: aggregateFindspotMapData(findspots),
    }
  }, [sites])
}
