import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import foldForSearch from 'map/domain/foldForSearch'

export function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null {
  if (!provenances) return null

  const normalizedFilter = foldForSearch(filter.trim())
  return normalizedFilter
    ? provenances.filter((provenance) =>
        foldForSearch(provenance.longName).includes(normalizedFilter),
      )
    : provenances
}

export function getEmptyStateMessage(filter: string): string {
  return filter.trim()
    ? `No findspots match “${filter}”.`
    : 'No findspot locations are available.'
}
