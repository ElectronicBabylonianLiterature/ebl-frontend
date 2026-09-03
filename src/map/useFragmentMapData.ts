import { useEffect, useState } from 'react'
import Bluebird from 'bluebird'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { mapSites } from 'map/mapSites'
import type {
  FindspotMapData,
  PolygonFindspotSummary,
} from 'map/findspotMapData'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'

export type FragmentMapDataStatus =
  | 'not-configured'
  | 'loading'
  | 'loaded'
  | 'error'

export interface FragmentMapDataState {
  readonly status: FragmentMapDataStatus
  readonly findspots: readonly FindspotMapData[]
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
}

const EMPTY_SUMMARIES = aggregateFindspotMapData([])

function configuredMapDataSiteIds(): readonly string[] {
  return mapSites()
    .filter((site) => site.mapDataSiteParam !== null)
    .map((site) => site.siteId)
}

export default function useFragmentMapData(
  findspotService: FindspotService,
): FragmentMapDataState {
  const [state, setState] = useState<FragmentMapDataState>({
    status: 'not-configured',
    findspots: [],
    polygonSummaries: EMPTY_SUMMARIES,
  })

  useEffect(() => {
    const siteIds = configuredMapDataSiteIds()
    if (siteIds.length === 0) {
      setState({
        status: 'not-configured',
        findspots: [],
        polygonSummaries: EMPTY_SUMMARIES,
      })
      return
    }

    let isMounted = true
    setState((current) => ({ ...current, status: 'loading' }))

    Bluebird.all(
      siteIds.map((siteId) => findspotService.fetchMapData(siteId)),
    )
      .then((responses) => {
        if (!isMounted) return
        const findspots = responses.flatMap((response) => [...response])
        setState({
          status: 'loaded',
          findspots,
          polygonSummaries: aggregateFindspotMapData(findspots),
        })
      })
      .catch(() => {
        if (!isMounted) return
        setState({
          status: 'error',
          findspots: [],
          polygonSummaries: EMPTY_SUMMARIES,
        })
      })

    return () => {
      isMounted = false
    }
  }, [findspotService])

  return state
}
