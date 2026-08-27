import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null {
  if (!provenances) return null

  const normalizedFilter = filter.trim().toLowerCase()
  return normalizedFilter
    ? provenances.filter((provenance) =>
        provenance.longName.toLowerCase().includes(normalizedFilter),
      )
    : provenances
}

export function getEmptyStateMessage(filter: string): string {
  return filter.trim()
    ? `No findspots match “${filter}”.`
    : 'No findspot locations are available.'
}
