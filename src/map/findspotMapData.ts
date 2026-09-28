export type LocationPrecision = 'excavation-area'
export type MatchMethod = 'curated' | 'verified-source'

export interface FindspotMapDataDto {
  readonly findspotId: number
  readonly siteId: string
  readonly siteName: string
  readonly polygonIds: readonly string[]
  readonly accessibleFragmentCount: number
  readonly locationPrecision: LocationPrecision
  readonly matchMethod: MatchMethod
  readonly sector?: string | null
  readonly area?: string | null
  readonly building?: string | null
  readonly room?: string | null
}

export interface FindspotMapDataResponseDto {
  readonly findspots: readonly FindspotMapDataDto[]
}

export type FindspotMapData = FindspotMapDataDto

export interface FindspotMapDataDiagnostics {
  readonly exactDuplicateRows: number
  readonly conflictingDuplicateFindspots: number
  readonly conflictingDuplicateRows: number
  readonly rejectedRows: number
}

export interface SanitizedFindspotMapDataResponse {
  readonly findspots: readonly FindspotMapData[]
  readonly diagnostics: FindspotMapDataDiagnostics
}

export interface PolygonFindspotSummary {
  readonly polygonId: string
  readonly findspotIds: readonly number[]
  readonly findspotCount: number
  readonly accessibleFragmentCount: number
  readonly findspots: readonly FindspotMapData[]
}

function isLocationPrecision(value: unknown): value is LocationPrecision {
  return value === 'excavation-area'
}

function isMatchMethod(value: unknown): value is MatchMethod {
  return value === 'curated' || value === 'verified-source'
}

function optionalString(value: unknown): string | null | undefined {
  return value === undefined || value === null || typeof value === 'string'
    ? value
    : undefined
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function hasValidPolygonIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isNonEmptyString) &&
    new Set(value).size === value.length
  )
}

export function sanitizeFindspotMapData(
  value: unknown,
): FindspotMapData | null {
  if (!value || typeof value !== 'object') return null

  const dto = value as Record<string, unknown>
  const findspotId = dto.findspotId
  const accessibleFragmentCount = dto.accessibleFragmentCount
  const polygonIds = dto.polygonIds
  const siteId = dto.siteId
  const siteName = dto.siteName
  const sector = optionalString(dto.sector)
  const area = optionalString(dto.area)
  const building = optionalString(dto.building)
  const room = optionalString(dto.room)

  const requiredValuesAreValid = [
    isNonNegativeSafeInteger(findspotId),
    isNonNegativeSafeInteger(accessibleFragmentCount),
    isNonEmptyString(siteId),
    isNonEmptyString(siteName),
    hasValidPolygonIds(polygonIds),
    isLocationPrecision(dto.locationPrecision),
    isMatchMethod(dto.matchMethod),
    sector !== undefined,
    area !== undefined,
    building !== undefined,
    room !== undefined,
  ].every(Boolean)

  if (!requiredValuesAreValid) return null

  return {
    findspotId: findspotId as number,
    siteId: siteId as string,
    siteName: siteName as string,
    polygonIds: polygonIds as string[],
    accessibleFragmentCount: accessibleFragmentCount as number,
    locationPrecision: dto.locationPrecision as LocationPrecision,
    matchMethod: dto.matchMethod as MatchMethod,
    sector,
    area,
    building,
    room,
  }
}
