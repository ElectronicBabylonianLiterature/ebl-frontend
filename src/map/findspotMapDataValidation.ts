import type { FindspotMapData } from 'map/findspotMapData'

function isNonnegativeSafeInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isNonblankString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

function hasValidIdentity(dto: Record<string, unknown>): boolean {
  return (
    [dto.findspotId, dto.accessibleFragmentCount].every(
      isNonnegativeSafeInteger,
    ) && [dto.siteId, dto.siteName].every(isNonblankString)
  )
}

function hasValidPolygonIds(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false
  return value.every(isNonblankString) && new Set(value).size === value.length
}

function hasValidEvidence(dto: Record<string, unknown>): boolean {
  return (
    dto.locationPrecision === 'excavation-area' &&
    (dto.matchMethod === 'curated' || dto.matchMethod === 'verified-source')
  )
}

function hasValidLocationMetadata(dto: Record<string, unknown>): boolean {
  return [dto.sector, dto.area, dto.building, dto.room].every(
    (value) => value === null || typeof value === 'string',
  )
}

function isFindspotMapData(value: unknown): value is FindspotMapData {
  if (!value || typeof value !== 'object') return false
  const dto = value as Record<string, unknown>
  if (!hasValidIdentity(dto) || !hasValidPolygonIds(dto.polygonIds))
    return false
  return hasValidEvidence(dto) && hasValidLocationMetadata(dto)
}

export function sanitizeFindspotMapData(
  value: unknown,
): FindspotMapData | null {
  if (!isFindspotMapData(value)) return null
  const {
    findspotId,
    siteId,
    siteName,
    polygonIds,
    accessibleFragmentCount,
    locationPrecision,
    matchMethod,
    sector,
    area,
    building,
    room,
  } = value

  return {
    findspotId,
    siteId,
    siteName,
    polygonIds,
    accessibleFragmentCount,
    locationPrecision,
    matchMethod,
    sector,
    area,
    building,
    room,
  }
}
