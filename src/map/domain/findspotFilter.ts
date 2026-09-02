import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import foldForSearch from 'map/domain/foldForSearch'

export function matchesFindspot(name: string, query: string): boolean {
  const normalizedQuery = foldForSearch(query.trim())
  return normalizedQuery === '' || foldForSearch(name).includes(normalizedQuery)
}

export function filterProvenances(
  provenances: readonly ProvenanceRecord[],
  filter: string,
): readonly ProvenanceRecord[]
export function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null
export function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null {
  if (!provenances) return null

  return foldForSearch(filter.trim())
    ? provenances.filter((provenance) =>
        matchesFindspot(provenance.longName, filter),
      )
    : provenances
}

export function getEmptyStateMessage(filter: string): string {
  return filter.trim()
    ? `No findspots match “${filter}”.`
    : 'No findspot locations are available.'
}
