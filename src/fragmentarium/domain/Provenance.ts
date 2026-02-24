export interface ProvenanceCoordinates {
  readonly latitude: number
  readonly longitude: number
  readonly uncertaintyRadiusKm?: number
  readonly notes?: string
}

export interface ProvenanceRecord {
  readonly id: string
  readonly longName: string
  readonly abbreviation: string
  readonly parent?: string | null
  readonly cigsKey?: string | null
  readonly sortKey: number
  readonly coordinates?: ProvenanceCoordinates
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
