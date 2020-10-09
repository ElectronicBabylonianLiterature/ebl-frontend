import Reference from 'bibliography/domain/Reference'
import { Period, PeriodModifier, periodModifiers, periods } from './period'

import { Provenance, provenances } from './provenance'

import produce, { Draft, immerable } from 'immer'

import _ from 'lodash'

export type ManuscriptType = {
  readonly name: string
  readonly abbreviation: string
}
export const types: ReadonlyMap<string, ManuscriptType> = new Map([
  ['Library', { name: 'Library', abbreviation: '' }],
  ['School', { name: 'School', abbreviation: 'Sch' }],
  ['Varia', { name: 'Varia', abbreviation: 'Var' }],
  ['Commentary', { name: 'Commentary', abbreviation: 'Com' }],
  ['Quotation', { name: 'Quotation', abbreviation: 'Quo' }],
])

export class Manuscript {
  id: number | undefined | null = null
  siglumDisambiguator = ''
  museumNumber = ''
  accession = ''
  periodModifier: PeriodModifier = periodModifiers.get('None') || {
    name: 'None',
    displayName: '-',
  }
  period: Period = periods.get('Neo-Assyrian') || {
    name: 'Neo-Assyrian',
    abbreviation: 'NA',
    description: '(ca. 1000–609 BCE)',
  }
  provenance: Provenance = provenances.get('Nineveh') || {
    name: 'Nineveh',
    abbreviation: 'Nin',
    parent: 'Assyria',
  }
  type: ManuscriptType = types.get('Library') || {
    name: 'Library',
    abbreviation: '',
  }
  notes = ''
  references: ReadonlyArray<Reference> = []

  get siglum(): string {
    return [
      _.get(this, 'provenance.abbreviation', ''),
      _.get(this, 'period.abbreviation', ''),
      _.get(this, 'type.abbreviation', ''),
      this.siglumDisambiguator,
    ].join('')
  }
}
Manuscript[immerable] = true

export function createManuscript(data: Partial<Manuscript>): Manuscript {
  return produce(new Manuscript(), (draft: Draft<Manuscript>) => {
    _.assign(draft, data)
  })
}

export type AtfToken = {
  readonly type: string
  readonly value: string
  readonly uniqueLemma?: ReadonlyArray<string>
  readonly normalized?: boolean
  readonly language?: string
  readonly lemmatizable?: boolean
  readonly erasure?: string
  readonly alignment?: number | null
}
export type ManuscriptLine = {
  readonly manuscriptId: number
  readonly labels: ReadonlyArray<string>
  readonly number: string
  readonly atf: string
  readonly atfTokens: ReadonlyArray<AtfToken>
}
export const createManuscriptLine: (
  x0: Partial<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: Partial<ManuscriptLine>): ManuscriptLine => ({
    manuscriptId: 0,
    labels: [],
    number: '',
    atf: '',
    atfTokens: [],
    ...draft,
  })
)
export type ReconstructionToken = {
  readonly type: string
  readonly value: string
}
export type Line = {
  readonly number: string
  readonly reconstruction: string
  readonly reconstructionTokens: ReadonlyArray<ReconstructionToken>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly manuscripts: ReadonlyArray<ManuscriptLine>
}
export const createLine: (config: Partial<Line>) => Line = produce(
  (draft: Draft<Partial<Line>>): Line => ({
    number: '',
    reconstruction: '',
    manuscripts: [],
    reconstructionTokens: [],
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    ...draft,
  })
)

export type Chapter = {
  readonly classification: string
  readonly stage: string
  readonly version: string
  readonly name: string
  readonly order: number
  readonly manuscripts: ReadonlyArray<Manuscript>
  readonly lines: ReadonlyArray<Line>
}
export const createChapter: (config: Partial<Chapter>) => Chapter = produce(
  (draft: any): Chapter => ({
    classification: 'Ancient',
    stage: 'Neo-Assyrian',
    version: '',
    name: '',
    order: 0,
    manuscripts: [],
    lines: [],
    ...draft,
  })
)

export class Text {
  category = 0
  index = 0
  name = ''
  numberOfVerses = 0
  approximateVerses = false
  chapters: ReadonlyArray<Chapter> = []

  findChapterIndex(stage: string, name: string): number {
    return this.chapters.findIndex(
      (chapter) => chapter.stage === stage && chapter.name === name
    )
  }
}
Text[immerable] = true

export function createText(data: Partial<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
