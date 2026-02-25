export interface ProvenanceCoordinates {
  readonly latitude: number
  readonly longitude: number
  readonly uncertaintyRadiusKm?: number
  readonly notes?: string
}

export interface ProvenancePolygonCoordinate {
  readonly latitude: number
  readonly longitude: number
}

export interface ProvenanceRecord {
  readonly id: string
  readonly longName: string
  readonly abbreviation: string
  readonly parent?: string | null
  readonly cigsKey?: string | null
  readonly sortKey: number
  readonly coordinates?: ProvenanceCoordinates
  readonly polygonCoordinates?: readonly ProvenancePolygonCoordinate[]
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function hasValidLatLng(
  coordinates:
    | ProvenanceCoordinates
    | ProvenancePolygonCoordinate
    | null
    | undefined,
): coordinates is ProvenanceCoordinates | ProvenancePolygonCoordinate {
  return (
    !!coordinates &&
    isFiniteNumber(coordinates.latitude) &&
    isFiniteNumber(coordinates.longitude)
  )
}

function sanitizeCoordinates(
  coordinates: ProvenanceRecord['coordinates'],
): ProvenanceCoordinates | undefined {
  if (!hasValidLatLng(coordinates)) {
    return undefined
  }

  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    ...(isFiniteNumber(coordinates.uncertaintyRadiusKm)
      ? { uncertaintyRadiusKm: coordinates.uncertaintyRadiusKm }
      : {}),
    ...(typeof coordinates.notes === 'string'
      ? { notes: coordinates.notes }
      : {}),
  }
}

function sanitizePolygonCoordinates(
  polygonCoordinates: ProvenanceRecord['polygonCoordinates'],
): readonly ProvenancePolygonCoordinate[] | undefined {
  if (!Array.isArray(polygonCoordinates)) {
    return undefined
  }

  const validCoordinates = polygonCoordinates.filter(hasValidLatLng)
  return validCoordinates.length >= 3 ? validCoordinates : undefined
}

export function sanitizeProvenanceRecord(
  provenance: ProvenanceRecord,
): ProvenanceRecord {
  const coordinates = sanitizeCoordinates(provenance.coordinates)
  const polygonCoordinates = sanitizePolygonCoordinates(
    provenance.polygonCoordinates,
  )

  return {
    ...provenance,
    coordinates,
    polygonCoordinates,
  }
}

export function getRenderableProvenanceGeometry(provenance: ProvenanceRecord):
  | {
      readonly type: 'polygon'
      readonly coordinates: readonly ProvenancePolygonCoordinate[]
    }
  | { readonly type: 'point'; readonly coordinates: ProvenanceCoordinates }
  | undefined {
  const sanitized = sanitizeProvenanceRecord(provenance)

  if (sanitized.polygonCoordinates) {
    return {
      type: 'polygon',
      coordinates: sanitized.polygonCoordinates,
    }
  }

  if (sanitized.coordinates) {
    return {
      type: 'point',
      coordinates: sanitized.coordinates,
    }
  }

  return undefined
}

export function sortProvenances(
  provenances: readonly ProvenanceRecord[],
): readonly ProvenanceRecord[] {
  return [...provenances].sort(
    (first, second) =>
      first.sortKey - second.sortKey ||
      first.longName.localeCompare(second.longName),
  )
}
