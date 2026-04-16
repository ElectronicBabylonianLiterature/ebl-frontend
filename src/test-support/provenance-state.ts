import {
  Provenance,
  provenances,
  setProvenanceRecords,
  upsertProvenanceRecord,
} from 'corpus/domain/provenance'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

function toRecord(provenance: Provenance, index: number): ProvenanceRecord {
  return {
    id: provenance.id ?? `test-${provenance.name}-${index}`,
    longName: provenance.name,
    abbreviation: provenance.abbreviation,
    parent: provenance.parent,
    cigsKey: provenance.cigsKey,
    sortKey: provenance.sortKey ?? index + 1,
  }
}

export type ProvenanceStateSnapshot = readonly ProvenanceRecord[]

export function snapshotProvenanceState(): ProvenanceStateSnapshot {
  return provenances.map((provenance, index) => toRecord(provenance, index))
}

export function restoreProvenanceState(
  snapshot: ProvenanceStateSnapshot,
): void {
  setProvenanceRecords(snapshot)
}

export function upsertProvenanceRecords(
  records: readonly ProvenanceRecord[],
): void {
  records.forEach((record) => upsertProvenanceRecord(record))
}
