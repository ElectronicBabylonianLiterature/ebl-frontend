import { useEffect, useState } from 'react'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  type FindspotMapData,
  type FindspotMapDataStatus,
  type PolygonFindspotSummary,
  aggregateFindspotMapData,
} from './findspotMapData'
import {
  type ExcavationPolygonIndex,
  fetchExcavationPolygonIndex,
} from './excavationPolygonIndex'
import { mapSites } from './mapSites'

export interface MapSiteData {
  readonly provenances: readonly ProvenanceRecord[] | null
  readonly provenanceError: string | null
  readonly excavationPolygonIndex: ExcavationPolygonIndex
  readonly fragmentMapData: readonly FindspotMapData[]
  readonly fragmentMapDataStatus: FindspotMapDataStatus
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
}

const EMPTY_SUMMARIES = aggregateFindspotMapData([])

function configuredMapDataSiteIds(): readonly string[] {
  return mapSites()
    .filter((site) => site.mapDataSiteParam !== null)
    .map((site) => site.siteId)
}

export default function useMapSiteData(
  findspotService: FindspotService,
  fragmentService: FragmentService,
): MapSiteData {
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [provenanceError, setProvenanceError] = useState<string | null>(null)
  const [excavationPolygonIndex, setExcavationPolygonIndex] =
    useState<ExcavationPolygonIndex>(() => new Map())
  const [fragmentMapData, setFragmentMapData] = useState<
    readonly FindspotMapData[]
  >([])
  const [fragmentMapDataStatus, setFragmentMapDataStatus] =
    useState<FindspotMapDataStatus>('idle')
  const [polygonSummaries, setPolygonSummaries] = useState(EMPTY_SUMMARIES)

  useEffect(() => {
    let isMounted = true

    fragmentService
      .fetchProvenances()
      .then((records) => {
        if (isMounted) setProvenances(records)
      })
      .catch((error: Error) => {
        if (isMounted) setProvenanceError(error.message)
      })

    return () => {
      isMounted = false
    }
  }, [fragmentService])

  useEffect(() => {
    let isMounted = true

    fetchExcavationPolygonIndex()
      .then((index) => {
        if (isMounted) setExcavationPolygonIndex(index)
      })
      .catch(() => {
        if (isMounted) setExcavationPolygonIndex(new Map())
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const siteIds = configuredMapDataSiteIds()

    if (siteIds.length === 0) {
      setFragmentMapDataStatus('loaded')
      return
    }

    setFragmentMapDataStatus('loading')
    Bluebird.all(siteIds.map((siteId) => findspotService.fetchMapData(siteId)))
      .then((responses) => {
        if (!isMounted) return
        const findspots = responses.flatMap((response) => [...response])
        setFragmentMapData(findspots)
        setPolygonSummaries(aggregateFindspotMapData(findspots))
        setFragmentMapDataStatus('loaded')
      })
      .catch(() => {
        if (!isMounted) return
        setFragmentMapData([])
        setPolygonSummaries(EMPTY_SUMMARIES)
        setFragmentMapDataStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [findspotService])

  return {
    provenances,
    provenanceError,
    excavationPolygonIndex,
    fragmentMapData,
    fragmentMapDataStatus,
    polygonSummaries,
  }
}
