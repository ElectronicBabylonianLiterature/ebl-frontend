import Reference from 'bibliography/domain/Reference'
import produce, { Draft, immerable } from 'immer'
import _ from 'lodash'
import { Period, PeriodModifier, periodModifiers, periods } from './period'
import { Provenance, provenances } from './provenance'

export interface ManuscriptType {
  readonly name: string
  readonly abbreviation: string
  readonly displayName?: string
}

export const types: ReadonlyMap<string, ManuscriptType> = new Map([
  ['None', { name: 'None', abbreviation: '', displayName: '-' }],
  ['Library', { name: 'Library', abbreviation: '' }],
  ['School', { name: 'School', abbreviation: 'Sch' }],
  ['Varia', { name: 'Varia', abbreviation: 'Var' }],
  ['Commentary', { name: 'Commentary', abbreviation: 'Com' }],
  ['Quotation', { name: 'Quotation', abbreviation: 'Quo' }],
  ['Excerpt', { name: 'Excerpt', abbreviation: 'Ex' }],
  ['Parallel', { name: 'Parallel', abbreviation: 'Par' }],
])

export class Manuscript {
  readonly [immerable] = true
  readonly id: number | undefined | null = null
  readonly siglumDisambiguator: string = ''
  readonly museumNumber: string = ''
  readonly accession: string = ''
  readonly periodModifier: PeriodModifier = periodModifiers.get('None') || {
    name: 'None',
    displayName: '-',
  }
  readonly period: Period = periods.get('Neo-Assyrian') || {
    name: 'Neo-Assyrian',
    abbreviation: 'NA',
    description: '(ca. 1000–609 BCE)',
  }
  readonly provenance: Provenance = provenances.get('Nineveh') || {
    name: 'Nineveh',
    abbreviation: 'Nin',
    parent: 'Assyria',
  }
  readonly type: ManuscriptType = types.get('Library') || {
    name: 'Library',
    abbreviation: '',
  }
  readonly notes: string = ''
  readonly colophon: string = ''
  readonly unplacedLines: string = ''
  readonly references: readonly Reference[] = []

  get siglum(): string {
    return [
      _.get(this, 'provenance.abbreviation', ''),
      _.get(this, 'period.abbreviation', ''),
      _.get(this, 'type.abbreviation', ''),
      this.siglumDisambiguator,
    ].join('')
  }
}

export function createManuscript(data: Partial<Manuscript>): Manuscript {
  return produce(new Manuscript(), (draft: Draft<Manuscript>) => {
    _.assign(draft, data)
  })
}
