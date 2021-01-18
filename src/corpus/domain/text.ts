import Reference from 'bibliography/domain/Reference'
import produce, { Draft, immerable } from 'immer'
import _ from 'lodash'
import { Token } from 'transliteration/domain/token'
import {
  ChapterAlignment,
  createAlignmentToken,
  ManuscriptAlignment,
} from './alignment'
import { Period, PeriodModifier, periodModifiers, periods } from './period'
import { Provenance, provenances } from './provenance'
import { isAnyWord } from 'transliteration/domain/type-guards'

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

export interface ManuscriptLine {
  readonly manuscriptId: number
  readonly labels: readonly string[]
  readonly number: string
  readonly atf: string
  readonly atfTokens: readonly Token[]
  readonly omittedWords: readonly number[]
}

export const createManuscriptLine: (
  data: Partial<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: Partial<ManuscriptLine>): ManuscriptLine => ({
    manuscriptId: 0,
    labels: [],
    number: '',
    atf: '',
    atfTokens: [],
    omittedWords: [],
    ...draft,
  })
)

export interface LineVariant {
  readonly reconstruction: string
  readonly reconstructionTokens: ReadonlyArray<Token>
  readonly manuscripts: ReadonlyArray<ManuscriptLine>
}

export interface Line {
  readonly number: string
  readonly variants: ReadonlyArray<LineVariant>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
}

export const createLine: (config: Partial<Line>) => Line = produce(
  (draft): Line => ({
    number: '',
    variants: [],
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    ...draft,
  })
)

export const createVariant: (
  config: Partial<LineVariant>
) => LineVariant = produce(
  (draft): LineVariant => ({
    reconstruction: '',
    manuscripts: [],
    reconstructionTokens: [],
    ...draft,
  })
)

export function createVariantAlignment(
  variant: LineVariant
): ManuscriptAlignment[] {
  const reconstruction = variant.reconstructionTokens
  return variant.manuscripts.map((manuscript) => ({
    alignment: manuscript.atfTokens.map((token, index) => {
      const alignment = createAlignmentToken(token)
      return alignment.isAlignable &&
        _.isNil(alignment.alignment) &&
        isAnyWord(reconstruction[index])
        ? {
            ...alignment,
            alignment: index,
            suggested: true,
          }
        : alignment
    }),
    omittedWords: manuscript.omittedWords,
  }))
}

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

  get alignment(): ChapterAlignment {
    return new ChapterAlignment(
      this.lines.map((line) => line.variants.map(createVariantAlignment))
    )
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
