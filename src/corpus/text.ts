import Reference from 'bibliography/domain/Reference'
import { Period, PeriodModifier } from './period'
import { periodModifiers, periods } from './period'
import { Provenance } from './provenance'
import { provenances } from './provenance'
import { immerable, produce } from 'immer'
import { Draft } from 'immer'
import _ from 'lodash'

export type ManuscriptType = {
  readonly name: string
  readonly abbreviation: string
}
export const types: ReadOnlyMap<string, ManuscriptType> = new Map([
  ['Library', { name: 'Library', abbreviation: '' }],
  ['School', { name: 'School', abbreviation: 'Sch' }],
  ['Varia', { name: 'Varia', abbreviation: 'Var' }],
  ['Commentary', { name: 'Commentary', abbreviation: 'Com' }],
  ['Quotation', { name: 'Quotation', abbreviation: 'Quo' }]
])

export class Manuscript {
  id: number | undefined | null = null
  siglumDisambiguator: string = ''
  museumNumber: string = ''
  accession: string = ''
  periodModifier: PeriodModifier = periodModifiers.get('None')
  period: Period = periods.get('Neo-Assyrian')
  provenance: Provenance = provenances.get('Nineveh')
  type: ManuscriptType = types.get('Library')
  notes: string = ''
  references: ReadonlyArray<Reference> = []

  get siglum() {
    return [
      _.get(this, 'provenance.abbreviation', ''),
      _.get(this, 'period.abbreviation', ''),
      _.get(this, 'type.abbreviation', ''),
      this.siglumDisambiguator
    ].join('')
  }
}
Manuscript[immerable] = true

export function createManuscript(data: $Shape<Manuscript>): Manuscript {
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
  x0: $Shape<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: $Shape<ManuscriptLine>): ManuscriptLine => ({
    manuscriptId: 0,
    labels: [],
    number: '',
    atf: '',
    atfTokens: [],
    ...draft
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
  readonly manuscripts: ReadonlyArray<ManuscriptLine>
}
export const createLine: (x0: $Shape<Line>) => Line = produce(
  (draft: $Shape<Line>): Line => ({
    number: '',
    reconstruction: '',
    manuscripts: [],
    ...draft
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
export const createChapter: (x0: $Shape<Chapter>) => Chapter = produce(
  (draft: $Shape<Chapter>): Chapter => ({
    classification: 'Ancient',
    stage: 'Neo-Assyrian',
    version: '',
    name: '',
    order: 0,
    manuscripts: [],
    lines: [],
    ...draft
  })
)

export class Text {
  category: number = 0
  index: number = 0
  name: string = ''
  numberOfVerses: number = 0
  approximateVerses: boolean = false
  chapters: ReadonlyArray<Chapter> = []

  findChapterIndex(stage: string, name: string) {
    return this.chapters.findIndex(
      chapter => chapter.stage === stage && chapter.name === name
    )
  }
}
Text[immerable] = true

export function createText(data: $Shape<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
