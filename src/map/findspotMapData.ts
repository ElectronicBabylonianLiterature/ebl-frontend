export const ASSUR_SITE_ID = 'ASSUR'

export type FindspotMapDataStatus = 'idle' | 'loading' | 'loaded' | 'error'

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

function sanitizeFindspotMapData(value: unknown): FindspotMapData | null {
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

  if (typeof findspotId !== 'number' || !Number.isInteger(findspotId)) {
    return null
  }
  if (
    typeof accessibleFragmentCount !== 'number' ||
    !Number.isFinite(accessibleFragmentCount) ||
    accessibleFragmentCount < 0
  ) {
    return null
  }
  if (
    typeof siteId !== 'string' ||
    siteId.trim() === '' ||
    typeof siteName !== 'string' ||
    siteName.trim() === ''
  ) {
    return null
  }
  if (
    !Array.isArray(polygonIds) ||
    polygonIds.length === 0 ||
    polygonIds.some((id) => typeof id !== 'string' || id.trim() === '')
  ) {
    return null
  }
  if (new Set(polygonIds).size !== polygonIds.length) return null
  if (!isLocationPrecision(dto.locationPrecision)) return null
  if (!isMatchMethod(dto.matchMethod)) return null
  if (
    sector === undefined ||
    area === undefined ||
    building === undefined ||
    room === undefined
  ) {
    return null
  }

  return {
    findspotId,
    siteId,
    siteName,
    polygonIds,
    accessibleFragmentCount,
    locationPrecision: dto.locationPrecision,
    matchMethod: dto.matchMethod,
    sector,
    area,
    building,
    room,
  }
}

export function sanitizeFindspotMapDataResponse(
  response: unknown,
): readonly FindspotMapData[] {
  if (!response || typeof response !== 'object') return []

  const findspots = (response as Record<string, unknown>).findspots
  if (!Array.isArray(findspots)) return []

  const seenFindspotIds = new Set<number>()
  return findspots.flatMap((findspot) => {
    const sanitized = sanitizeFindspotMapData(findspot)
    if (!sanitized || seenFindspotIds.has(sanitized.findspotId)) return []

    seenFindspotIds.add(sanitized.findspotId)
    return [sanitized]
  })
}

export function aggregateFindspotMapData(
  findspots: readonly FindspotMapData[],
): ReadonlyMap<string, PolygonFindspotSummary> {
  const summaries = new Map<
    string,
    {
      findspotIds: number[]
      accessibleFragmentCount: number
      findspots: FindspotMapData[]
    }
  >()
  const seenFindspotIds = new Set<number>()

  for (const findspot of findspots) {
    if (seenFindspotIds.has(findspot.findspotId)) continue
    seenFindspotIds.add(findspot.findspotId)

    for (const polygonId of [...new Set(findspot.polygonIds)].sort()) {
      const summary = summaries.get(polygonId) ?? {
        findspotIds: [],
        accessibleFragmentCount: 0,
        findspots: [],
      }
      summary.findspotIds.push(findspot.findspotId)
      summary.accessibleFragmentCount += findspot.accessibleFragmentCount
      summary.findspots.push(findspot)
      summaries.set(polygonId, summary)
    }
  }

  return new Map(
    [...summaries.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([polygonId, summary]) => [
        polygonId,
        {
          polygonId,
          findspotIds: [...summary.findspotIds].sort(
            (left, right) => left - right,
          ),
          findspotCount: summary.findspotIds.length,
          accessibleFragmentCount: summary.accessibleFragmentCount,
          findspots: [...summary.findspots].sort(
            (left, right) => left.findspotId - right.findspotId,
          ),
        },
      ]),
  )
}
