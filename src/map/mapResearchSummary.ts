import type {
  FindspotMapData,
  LocationPrecision,
  MatchMethod,
  PolygonFindspotSummary,
} from './findspotMapData'
import type { ExcavationPolygon } from './excavationPolygonIndex'

/**
 * How strong the spatial evidence linking fragments to a polygon is.
 *
 * `unmapped` means no findspot is linked at all — it is never inferred from a
 * missing or unrecognised `matchMethod`, because `findspotMapData` already
 * rejects a row whose method is neither `curated` nor `verified-source`.
 */
export type MappingEvidence =
  | 'verified-source'
  | 'curated'
  | 'mixed'
  | 'unmapped'

export type SummaryLocationPrecision = LocationPrecision | 'mixed' | 'unknown'

export interface FindspotSummary {
  readonly findspotId: number
  readonly accessibleFragmentCount: number
  readonly matchMethod: MatchMethod
  readonly locationPrecision: LocationPrecision
  readonly sector: string | null
  readonly area: string | null
  readonly building: string | null
  readonly room: string | null
}

/**
 * `source` and `sourceRevision` are deliberately absent: `/findspots/map-data`
 * does not expose them (see docs/map-research-experience.md). They belong here
 * as optional fields the day the response carries them, and nowhere else.
 */
export interface PolygonResearchSummary {
  readonly polygonId: string
  readonly siteId: string
  readonly siteName: string
  readonly displayName: string
  readonly mappedFindspotCount: number
  readonly accessibleFragmentCount: number
  readonly findspots: readonly FindspotSummary[]
  readonly mappingEvidence: MappingEvidence
  readonly locationPrecision: SummaryLocationPrecision
  readonly areaSquareKm: number | null
}

export interface SiteResearchSummary {
  readonly siteId: string
  readonly siteName: string
  readonly totalPolygonCount: number
  readonly linkedPolygonCount: number
  readonly mappedFindspotCount: number
  readonly accessibleFragmentCount: number
  readonly historicalOverlayCount: number
}

export const UNNAMED_EXCAVATION_AREA = 'Excavation area'

function distinct<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)]
}

export function mappingEvidenceOf(
  findspots: readonly Pick<FindspotMapData, 'matchMethod'>[],
): MappingEvidence {
  const methods = distinct(findspots.map((findspot) => findspot.matchMethod))

  if (methods.length === 0) return 'unmapped'
  return methods.length === 1 ? methods[0] : 'mixed'
}

export function summaryLocationPrecisionOf(
  findspots: readonly Pick<FindspotMapData, 'locationPrecision'>[],
): SummaryLocationPrecision {
  const precisions = distinct(
    findspots.map((findspot) => findspot.locationPrecision),
  )

  if (precisions.length === 0) return 'unknown'
  return precisions.length === 1 ? precisions[0] : 'mixed'
}

function toFindspotSummary(findspot: FindspotMapData): FindspotSummary {
  return {
    findspotId: findspot.findspotId,
    accessibleFragmentCount: findspot.accessibleFragmentCount,
    matchMethod: findspot.matchMethod,
    locationPrecision: findspot.locationPrecision,
    sector: findspot.sector ?? null,
    area: findspot.area ?? null,
    building: findspot.building ?? null,
    room: findspot.room ?? null,
  }
}

/**
 * The polygon's own `name` is the researcher-facing label; the canonical
 * polygon id is never shown. Falling back to a findspot's `area` keeps a
 * label when the asset carries none, and only then is the generic noun used.
 */
export function polygonDisplayName(
  polygon: Pick<ExcavationPolygon, 'name'> | undefined,
  findspots: readonly Pick<FindspotMapData, 'area'>[],
): string {
  return polygon?.name ?? findspots[0]?.area ?? UNNAMED_EXCAVATION_AREA
}

export interface PolygonResearchSummaryInput {
  readonly polygonId: string
  readonly polygon: ExcavationPolygon | undefined
  readonly summary: PolygonFindspotSummary | undefined
  readonly siteName: string
}

export function derivePolygonResearchSummary({
  polygonId,
  polygon,
  summary,
  siteName,
}: PolygonResearchSummaryInput): PolygonResearchSummary {
  const findspots = summary?.findspots ?? []

  return {
    polygonId,
    siteId: polygon?.siteId ?? '',
    siteName,
    displayName: polygonDisplayName(polygon, findspots),
    mappedFindspotCount: summary?.findspotCount ?? 0,
    accessibleFragmentCount: summary?.accessibleFragmentCount ?? 0,
    findspots: findspots.map(toFindspotSummary),
    mappingEvidence: mappingEvidenceOf(findspots),
    locationPrecision: summaryLocationPrecisionOf(findspots),
    areaSquareKm: polygon?.areaSquareKm ?? null,
  }
}

export interface SiteResearchSummaryInput {
  readonly siteId: string
  readonly siteName: string
  readonly polygons: readonly ExcavationPolygon[]
  readonly summaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly historicalOverlayCount: number
}

/**
 * Site totals are counted over the site's own polygons only, so a multi-site
 * summary map never inflates one site with another's linked areas.
 */
export function deriveSiteResearchSummary({
  siteId,
  siteName,
  polygons,
  summaries,
  historicalOverlayCount,
}: SiteResearchSummaryInput): SiteResearchSummary {
  const linked = polygons.flatMap((polygon) => {
    const summary = summaries.get(polygon.polygonId)
    return summary ? [summary] : []
  })
  const findspotIds = new Set(
    linked.flatMap((summary) => [...summary.findspotIds]),
  )
  const accessibleFragmentCount = [
    ...new Map(
      linked.flatMap((summary) =>
        summary.findspots.map(
          (findspot) => [findspot.findspotId, findspot] as const,
        ),
      ),
    ).values(),
  ].reduce((total, findspot) => total + findspot.accessibleFragmentCount, 0)

  return {
    siteId,
    siteName,
    totalPolygonCount: polygons.length,
    linkedPolygonCount: linked.length,
    mappedFindspotCount: findspotIds.size,
    accessibleFragmentCount,
    historicalOverlayCount,
  }
}
