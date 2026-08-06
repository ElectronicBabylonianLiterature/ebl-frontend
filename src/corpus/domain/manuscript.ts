import Reference from 'bibliography/domain/Reference'
import { Joins } from 'fragmentarium/domain/join'
import { immerable } from 'immer'
import _ from 'lodash'
import {
  Period,
  PeriodModifier,
  PeriodModifiers,
  Periods,
} from 'common/utils/period'
import {
  compareAssyriaAndBabylonia,
  compareName,
  compareStandardText,
  getProvenanceByName,
  Provenance,
} from './provenance'

export const ManuscriptTypes = {
  None: { name: 'None', abbreviation: '', displayName: '-', order: null },
  Library: { name: 'Library', abbreviation: '', displayName: null, order: 1 },
  School: { name: 'School', abbreviation: 'Sch', displayName: null, order: 2 },
  Varia: { name: 'Varia', abbreviation: 'Var', displayName: null, order: null },
  Commentary: {
    name: 'Commentary',
    abbreviation: 'Com',
    displayName: null,
    order: null,
  },
  Quotation: {
    name: 'Quotation',
    abbreviation: 'Quo',
    displayName: null,
    order: 5,
  },
  Amulet: { name: 'Amulet', abbreviation: 'Amu', displayName: null, order: 3 },
  Excerpt: { name: 'Excerpt', abbreviation: 'Ex', displayName: null, order: 4 },
  Parallel: {
    name: 'Parallel',
    abbreviation: 'Par',
    displayName: null,
    order: 6,
  },
  MultiColumnTablet: {
    name: 'MultiColumnTablet',
    abbreviation: 'MultCol',
    displayName: 'Multi-column tablet',
    order: 7,
  },
  CollectiveTablet: {
    name: 'CollectiveTablet',
    abbreviation: 'Coll',
    displayName: 'Collective tablet',
    order: 8,
  },
  StudentTeacherTablet: {
    name: 'StudentTeacherTablet',
    abbreviation: 'StuTea',
    displayName: 'Student-teacher tablet',
    order: 9,
  },
  SchoolLentil: {
    name: 'SchoolLentil',
    abbreviation: 'SchLen',
    displayName: 'School lentils',
    order: 10,
  },
  Prism: {
    name: 'Prism',
    abbreviation: 'Prism',
    displayName: 'Prisms',
    order: 11,
  },
  Uncertain: {
    name: 'Uncertain',
    abbreviation: 'Unc',
    displayName: null,
    order: null,
  },
} as const

export type ManuscriptType =
  (typeof ManuscriptTypes)[keyof typeof ManuscriptTypes]
export const types = [
  ManuscriptTypes.None,
  ManuscriptTypes.Library,
  ManuscriptTypes.School,
  ManuscriptTypes.Varia,
  ManuscriptTypes.Commentary,
  ManuscriptTypes.Quotation,
  ManuscriptTypes.Amulet,
  ManuscriptTypes.Excerpt,
  ManuscriptTypes.Parallel,
  ManuscriptTypes.MultiColumnTablet,
  ManuscriptTypes.CollectiveTablet,
  ManuscriptTypes.StudentTeacherTablet,
  ManuscriptTypes.SchoolLentil,
  ManuscriptTypes.Prism,
  ManuscriptTypes.Uncertain,
] as const

export function compareManuscriptTypes(
  first: ManuscriptType,
  second: ManuscriptType,
): number {
  if (_.isNil(first.order) && _.isNil(second.order)) {
    return 0
  } else if (_.isNil(first.order)) {
    return 1
  } else if (_.isNil(second.order)) {
    return -1
  } else {
    return Math.sign(first.order - second.order)
  }
}

export class OldSiglum {
  readonly [immerable] = true

  constructor(
    readonly siglum: string,
    readonly reference: Reference,
  ) {}
}

export class Manuscript {
  readonly [immerable] = true

  constructor(
    readonly id: number | null = null,
    readonly siglumDisambiguator: string = '',
    readonly oldSigla: OldSiglum[] = [],
    readonly museumNumber: string = '',
    readonly accession: string = '',
    readonly periodModifier: PeriodModifier = PeriodModifiers.None,
    readonly period: Period = Periods['Neo-Assyrian'],
    readonly provenance: Provenance = getProvenanceByName('Nineveh'),
    readonly type: ManuscriptType = ManuscriptTypes.Library,
    readonly notes: string = '',
    readonly colophon: string = '',
    readonly unplacedLines: string = '',
    readonly references: readonly Reference[] = [],
    readonly joins: Joins = [],
    readonly isInFragmentarium: boolean = false,
  ) {}

  get siglum(): string {
    return [
      _.get(this, 'provenance.abbreviation', ''),
      _.get(this, 'period.abbreviation', ''),
      _.get(this, 'type.abbreviation', ''),
      this.siglumDisambiguator,
    ].join('')
  }
}

export function compareManuscripts(
  first: Pick<Manuscript, 'provenance' | 'type'>,
  second: Pick<Manuscript, 'provenance' | 'type'>,
): number {
  return (
    compareStandardText(first.provenance, second.provenance) ||
    compareManuscriptTypes(first.type, second.type) ||
    compareAssyriaAndBabylonia(first.provenance, second.provenance) ||
    compareName(first.provenance, second.provenance)
  )
}
