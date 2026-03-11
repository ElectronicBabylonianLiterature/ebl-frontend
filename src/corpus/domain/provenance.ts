import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export interface Provenance {
  readonly id?: string
  readonly name: string
  readonly abbreviation: string
  readonly parent: string | null
  readonly cigsKey?: string | null
  readonly sortKey?: number
}

const provenanceByName = new Map<string, Provenance>()
const provenanceById = new Map<string, Provenance>()

export const provenances: Provenance[] = []

function addOrUpdateProvenance(provenance: Provenance): Provenance {
  const existing = provenanceByName.get(provenance.name)
  const next = existing
    ? Object.isFrozen(existing)
      ? { ...existing, ...provenance }
      : Object.assign(existing, provenance)
    : provenance
  provenanceByName.set(next.name, next)
  if (next.id) {
    provenanceById.set(next.id, next)
  }
  const index = provenances.findIndex((item) => item.name === next.name)
  if (index === -1) {
    provenances.push(next)
  } else {
    provenances.splice(index, 1, next)
  }
  return next
}

export function toProvenance(record: ProvenanceRecord): Provenance {
  return {
    id: record.id,
    name: record.longName,
    abbreviation: record.abbreviation,
    parent: record.parent ?? null,
    cigsKey: record.cigsKey,
    sortKey: record.sortKey,
  }
}

export function setProvenanceRecords(
  records: readonly ProvenanceRecord[],
): void {
  provenanceById.clear()

  const sortedRecords = records
    .slice()
    .sort(
      (first, second) =>
        first.sortKey - second.sortKey ||
        first.longName.localeCompare(second.longName),
    )

  const nextProvenances = sortedRecords.map((record) =>
    addOrUpdateProvenance(toProvenance(record)),
  )

  const nextNames = new Set(
    nextProvenances.map((provenance) => provenance.name),
  )
  Array.from(provenanceByName.keys()).forEach((name) => {
    if (!nextNames.has(name)) {
      provenanceByName.delete(name)
    }
  })

  provenances.splice(0, provenances.length, ...nextProvenances)
}

export function upsertProvenanceRecord(record: ProvenanceRecord): Provenance {
  return addOrUpdateProvenance(toProvenance(record))
}

export function getProvenanceById(id: string): Provenance | undefined {
  return provenanceById.get(id)
}

export function getProvenanceByName(name: string): Provenance {
  return (
    provenanceByName.get(name) ??
    addOrUpdateProvenance({
      name,
      abbreviation: '',
      parent: null,
    })
  )
}

export const Provenances = new Proxy({} as Record<string, Provenance>, {
  get(_target, property: string | symbol) {
    if (typeof property !== 'string') {
      return undefined
    }
    return getProvenanceByName(property)
  },
  ownKeys() {
    return provenances.map((provenance) => provenance.name)
  },
  getOwnPropertyDescriptor(_target, property: string | symbol) {
    if (typeof property !== 'string') {
      return undefined
    }
    return {
      enumerable: true,
      configurable: true,
      value: getProvenanceByName(property),
      writable: false,
    }
  },
})

export function compareStandardText(
  first: Provenance,
  second: Provenance,
): number {
  if (first.name === second.name) {
    return 0
  } else if (first.name === 'Standard Text') {
    return -1
  } else if (second.name === 'Standard Text') {
    return 1
  } else {
    return 0
  }
}

export function compareAssyriaAndBabylonia(
  first: Provenance,
  second: Provenance,
): number {
  function isCity(provenance: Provenance): boolean {
    return !['Standard Text', 'Assyria', 'Babylonia'].includes(provenance.name)
  }
  if (isCity(first) && isCity(second)) {
    return 0
  } else if (isCity(first)) {
    return 1
  } else if (isCity(second)) {
    return -1
  } else {
    return compareName(first, second)
  }
}

export function compareName(first: Provenance, second: Provenance): number {
  return first.name.localeCompare(second.name)
}
