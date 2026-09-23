import Bluebird from 'bluebird'
import {
  ProvenanceRecord,
  sanitizeProvenanceRecord,
  sortProvenances,
} from 'fragmentarium/domain/Provenance'
import {
  setProvenanceRecords,
  upsertProvenanceRecord,
} from 'corpus/domain/provenance'
import { FragmentCache } from 'fragmentarium/application/fragmentCache'
import { FragmentRepository } from 'fragmentarium/application/fragmentServicePorts'

export function fetchProvenances(
  repository: FragmentRepository,
  cache: FragmentCache,
): Bluebird<readonly ProvenanceRecord[]> {
  return cache.allProvenances(() =>
    repository.fetchProvenances().then((provenances) => {
      const sanitized = provenances.map(sanitizeProvenanceRecord)
      setProvenanceRecords(sanitized)
      sanitized.forEach((provenance) => cache.storeProvenance(provenance))
      return sanitized
    }),
  )
}

export function fetchProvenance(
  repository: FragmentRepository,
  cache: FragmentCache,
  id: string,
): Bluebird<ProvenanceRecord> {
  return cache.provenance(id, () =>
    repository.fetchProvenance(id).then((provenance) => {
      const sanitized = sanitizeProvenanceRecord(provenance)
      upsertProvenanceRecord(sanitized)
      return sanitized
    }),
  )
}

export function fetchProvenanceChildren(
  repository: FragmentRepository,
  cache: FragmentCache,
  id: string,
): Bluebird<readonly ProvenanceRecord[]> {
  return cache.provenanceChildren(id, () =>
    repository.fetchProvenanceChildren(id).then((children) => {
      const sorted = sortProvenances(children.map(sanitizeProvenanceRecord))
      sorted.forEach((provenance) => {
        upsertProvenanceRecord(provenance)
        cache.storeProvenance(provenance)
      })
      return sorted
    }),
  )
}
