import {
  ProvenanceRecord,
  sanitizeProvenanceRecord,
  sortProvenances,
} from 'fragmentarium/domain/Provenance'
import {
  setProvenanceRecords,
  upsertProvenanceRecord,
} from 'corpus/domain/provenance'
import FragmentCache, {
  maximumCachedProvenanceChildren,
  maximumCachedProvenanceRecords,
  provenanceCacheKey,
} from 'fragmentarium/application/FragmentCache'
import { FragmentRepository } from 'fragmentarium/application/FragmentRepositoryTypes'

export default class FragmentProvenanceLoader {
  constructor(
    private readonly fragmentRepository: FragmentRepository,
    private readonly cache: FragmentCache,
  ) {}

  fetchProvenances(): Promise<readonly ProvenanceRecord[]> {
    return this.cache.getOrFetch(
      this.cache.provenances,
      this.cache.provenanceRequests,
      provenanceCacheKey,
      1,
      () =>
        this.fragmentRepository.fetchProvenances().then((provenances) => {
          const sanitized = provenances.map(sanitizeProvenanceRecord)
          setProvenanceRecords(sanitized)
          sanitized.forEach((provenance) => {
            this.cache.setProvenanceById(provenance)
          })
          return sanitized
        }),
    )
  }

  fetchProvenance(id: string): Promise<ProvenanceRecord> {
    return this.cache.getOrFetch(
      this.cache.provenanceById,
      this.cache.provenanceByIdRequests,
      id,
      maximumCachedProvenanceRecords,
      () =>
        this.fragmentRepository.fetchProvenance(id).then((provenance) => {
          const sanitized = sanitizeProvenanceRecord(provenance)
          upsertProvenanceRecord(sanitized)
          return sanitized
        }),
    )
  }

  fetchProvenanceChildren(id: string): Promise<readonly ProvenanceRecord[]> {
    return this.cache.getOrFetch(
      this.cache.provenanceChildrenById,
      this.cache.provenanceChildrenByIdRequests,
      id,
      maximumCachedProvenanceChildren,
      () =>
        this.fragmentRepository.fetchProvenanceChildren(id).then((children) => {
          const sanitized = children.map(sanitizeProvenanceRecord)
          const sorted = sortProvenances(sanitized)
          sorted.forEach((provenance) => {
            upsertProvenanceRecord(provenance)
            this.cache.setProvenanceById(provenance)
          })
          return sorted
        }),
    )
  }
}
