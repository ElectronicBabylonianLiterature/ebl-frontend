import { useMemo } from 'react'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ExcavationPolygon } from './excavationPolygonIndex'
import type { MapSiteData } from './useMapSiteData'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import type { MapSelection } from './mapSelection'
import {
  type PolygonResearchSummary,
  type SiteResearchSummary,
  derivePolygonResearchSummary,
} from './mapResearchSummary'
import {
  type SiteMarkerState,
  type SiteResearchSummaries,
  buildSiteResearchSummaries,
  siteMarkerStates,
} from './mapSiteSummaries'

export interface MapResearch {
  readonly siteSummaries: SiteResearchSummaries
  readonly markerStates: ReadonlyMap<string, SiteMarkerState>
  readonly selectedPolygonSummary: PolygonResearchSummary | null
  readonly selectedSiteSummary: SiteResearchSummary | undefined
}

function findPolygon(
  siteData: MapSiteData,
  polygonId: string,
): ExcavationPolygon | undefined {
  return [...siteData.excavationPolygonIndex.values()]
    .flat()
    .find((polygon) => polygon.polygonId === polygonId)
}

/**
 * Every research-facing derivation the map needs, memoized in one place.
 * Selecting a polygon, changing visualization mode or opening a tab must not
 * recompute the site summaries, and none of these derivations touches the
 * network — they read only data already fetched for the map itself.
 */
export default function useMapResearch(
  siteData: MapSiteData,
  capabilities: readonly MapSiteCapabilities[],
  provenances: readonly ProvenanceRecord[],
  selection: MapSelection | null,
  selectedPolygonSite: MapSiteCapabilities | undefined,
): MapResearch {
  const siteSummaries = useMemo(
    () =>
      buildSiteResearchSummaries({
        provenances,
        capabilities,
        excavationPolygonIndex: siteData.excavationPolygonIndex,
        polygonSummaries: siteData.polygonSummaries,
      }),
    [
      provenances,
      capabilities,
      siteData.excavationPolygonIndex,
      siteData.polygonSummaries,
    ],
  )

  const markerStates = useMemo(
    () => siteMarkerStates(siteSummaries),
    [siteSummaries],
  )

  const selectedPolygonSummary = useMemo(() => {
    if (selection?.type !== 'excavation-area') return null

    return derivePolygonResearchSummary({
      polygonId: selection.polygonId,
      polygon: findPolygon(siteData, selection.polygonId),
      summary: siteData.polygonSummaries.get(selection.polygonId),
      siteName: selectedPolygonSite?.siteName ?? '',
    })
  }, [selection, siteData, selectedPolygonSite])

  const selectedSiteSummary = useMemo(
    () =>
      selection?.type === 'site'
        ? siteSummaries.get(selection.provenanceId)
        : undefined,
    [selection, siteSummaries],
  )

  return {
    siteSummaries,
    markerStates,
    selectedPolygonSummary,
    selectedSiteSummary,
  }
}
