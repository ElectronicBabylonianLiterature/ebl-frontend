import Reference from 'bibliography/domain/Reference'
import { Joins } from 'fragmentarium/domain/join'
import { immerable } from 'immer'
import _ from 'lodash'
import { Period, PeriodModifier, PeriodModifiers, Periods } from 'common/period'
import {
  compareAssyriaAndBabylonia,
  compareName,
  compareStandardText,
  Provenance,
  Provenances,
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
    order: 4,
  },
  Excerpt: { name: 'Excerpt', abbreviation: 'Ex', displayName: null, order: 3 },
  Parallel: {
    name: 'Parallel',
    abbreviation: 'Par',
    displayName: null,
    order: 5,
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
  ManuscriptTypes.Excerpt,
  ManuscriptTypes.Parallel,
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
    readonly provenance: Provenance = Provenances.Nineveh,
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
