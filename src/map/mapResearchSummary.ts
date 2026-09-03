import type {
  FindspotMapData,
  LocationPrecision,
  MatchMethod,
  PolygonFindspotSummary,
} from './findspotMapData'
import type { ExcavationPolygon } from './excavationPolygonIndex'
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
