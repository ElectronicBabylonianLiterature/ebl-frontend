import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import { matchSiteCapabilities } from './provenanceSiteMatch'
import {
  type SiteResearchSummary,
  deriveSiteResearchSummary,
} from './mapResearchSummary'

export type SiteResearchSummaries = ReadonlyMap<string, SiteResearchSummary>

export interface SiteSummaryInput {
  readonly provenances: readonly ProvenanceRecord[]
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly excavationPolygonIndex: ExcavationPolygonIndex
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
}

/**
 * Site-level research summaries keyed by *provenance* id, because that is the
 * id the map markers, the selection and the URL all speak. Only provenances
 * that resolve to a mapped site get an entry — a provenance with nothing but
 * coordinates has no polygons to summarise and must not be given a zeroed row
 * that would read as "0 of 0 linked".
 */
export function buildSiteResearchSummaries(
  input: SiteSummaryInput,
): SiteResearchSummaries {
  return new Map(
    input.provenances.flatMap((provenance) => {
      const site = matchSiteCapabilities(provenance, input.capabilities)
      if (!site) return []

      const polygons = input.excavationPolygonIndex.get(site.siteId) ?? []

      return [
        [
          provenance.id,
          deriveSiteResearchSummary({
            siteId: site.siteId,
            siteName: site.siteName,
            polygons,
            summaries: input.polygonSummaries,
            historicalOverlayCount: site.historicalMapCount,
          }),
        ] as const,
      ]
    }),
  )
}

/**
 * How much evidence a marker stands for, as an ordered code the marker paint
 * expressions class with `step`. Only states the data actually supports are
 * represented: coordinates, mapped excavation polygons, and live
 * fragment-linked map data.
 */
export const SITE_MARKER_CODES = {
  coordinates: 0,
  excavationPolygons: 1,
  fragmentMapData: 2,
} as const

export interface SiteMarkerState extends Record<string, number> {
  readonly siteCode: number
  readonly historicalMapCount: number
  readonly linkedPolygonCount: number
}

export function siteMarkerState(
  summary: SiteResearchSummary | undefined,
): SiteMarkerState {
  if (!summary) {
    return {
      siteCode: SITE_MARKER_CODES.coordinates,
      historicalMapCount: 0,
      linkedPolygonCount: 0,
    }
  }

  return {
    siteCode:
      summary.linkedPolygonCount > 0
        ? SITE_MARKER_CODES.fragmentMapData
        : summary.totalPolygonCount > 0
          ? SITE_MARKER_CODES.excavationPolygons
          : SITE_MARKER_CODES.coordinates,
    historicalMapCount: summary.historicalOverlayCount,
    linkedPolygonCount: summary.linkedPolygonCount,
  }
}

export function siteMarkerStates(
  summaries: SiteResearchSummaries,
): ReadonlyMap<string, SiteMarkerState> {
  return new Map(
    [...summaries.entries()].map(([provenanceId, summary]) => [
      provenanceId,
      siteMarkerState(summary),
    ]),
  )
}
