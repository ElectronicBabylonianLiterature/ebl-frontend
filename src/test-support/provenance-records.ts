import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export const provenanceRecords: ProvenanceRecord[] = [
  {
    id: 'standard-text',
    longName: 'Standard Text',
    abbreviation: 'Std',
    parent: null,
    sortKey: 1,
  },
  {
    id: 'assyria',
    longName: 'Assyria',
    abbreviation: 'Assa',
    parent: null,
    sortKey: 2,
  },
  {
    id: 'assur',
    longName: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria',
    sortKey: 3,
  },
  {
    id: 'dur-katlimmu',
    longName: 'Dūr-Katlimmu',
    abbreviation: 'Dka',
    parent: 'Assyria',
    sortKey: 4,
  },
]
