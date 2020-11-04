import Reference from 'bibliography/domain/Reference'
import { Period, PeriodModifier, periodModifiers, periods } from './period'

import { Provenance, provenances } from './provenance'

import produce, { Draft, immerable } from 'immer'

import _ from 'lodash'

export interface ManuscriptType {
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

export interface AtfToken {
  readonly type: string
  readonly value: string
  readonly uniqueLemma?: ReadonlyArray<string>
  readonly normalized?: boolean
  readonly language?: string
  readonly lemmatizable?: boolean
  readonly erasure?: string
  readonly alignment?: number | null
}
export interface ManuscriptLine {
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
export interface ReconstructionToken {
  readonly type: string
  readonly value: string
}
export interface Line {
  readonly number: string
  readonly reconstruction: string
  readonly reconstructionTokens: ReadonlyArray<ReconstructionToken>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly manuscripts: ReadonlyArray<ManuscriptLine>
}
export const createLine: (config: Partial<Line>) => Line = produce(
  (draft): Line => ({
    number: '',
    reconstruction: '',
    manuscripts: [],
    reconstructionTokens: [],
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    ...draft,
  })
)

export class Chapter {
  readonly [immerable] = true
  readonly classification: string
  readonly stage: string
  readonly version: string
  readonly name: string
  readonly order: number
  readonly manuscripts: ReadonlyArray<Manuscript>
  readonly lines: ReadonlyArray<Line>

  constructor({
    classification,
    stage,
    version,
    name,
    order,
    manuscripts,
    lines,
  }: Partial<Chapter>) {
    this.classification = classification ?? 'Ancient'
    this.stage = stage ?? 'Neo-Assyrian'
    this.version = version ?? ''
    this.name = name ?? ''
    this.order = order ?? 0
    this.manuscripts = manuscripts ?? []
    this.lines = lines ?? []
  }

  getSiglum(manuscriptLine: ManuscriptLine): string {
    const manuscript = this.manuscripts.find(
      (candidate) => candidate.id === manuscriptLine.manuscriptId
    )
    if (manuscript) {
      return manuscript.siglum
    } else {
      return `<unknown ID: ${manuscriptLine.manuscriptId}>`
    }
  }
}

export function createChapter(data: Partial<Chapter>): Chapter {
  return new Chapter(data)
}

export interface TextInfo {
  category: number
  index: number
  name: string
  numberOfVerses: number
  approximateVerses: boolean
}

export class Text implements TextInfo {
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
