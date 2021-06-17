import Reference from 'bibliography/domain/Reference'
import produce, { Draft, immerable } from 'immer'
import _ from 'lodash'
import { ChapterAlignment } from './alignment'
import { Line, ManuscriptLine } from './line'
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

export class Chapter {
  readonly [immerable] = true

  constructor(
    readonly textId: {
      readonly genre: string
      readonly category: number
      readonly index: number
    },
    readonly classification: string,
    readonly stage: string,
    readonly version: string,
    readonly name: string,
    readonly order: number,
    readonly manuscripts: ReadonlyArray<Manuscript>,
    readonly uncertainFragments: ReadonlyArray<string>,
    readonly lines: ReadonlyArray<Line>
  ) {}

  get alignment(): ChapterAlignment {
    return new ChapterAlignment(
      this.lines.map((line) =>
        line.variants.map((variant) => variant.alignment)
      )
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
  return new Chapter(
    data.textId ?? { genre: 'L', category: 0, index: 0 },
    data.classification ?? 'Ancient',
    data.stage ?? 'Neo-Assyrian',
    data.version ?? '',
    data.name ?? '',
    data.order ?? 0,
    data.manuscripts ?? [],
    data.uncertainFragments ?? [],
    data.lines ?? []
  )
}

export interface TextInfo {
  genre: string
  category: number
  index: number
  name: string
  numberOfVerses: number
  approximateVerses: boolean
}

export class Text implements TextInfo {
  readonly [immerable] = true
  genre = 'L'
  category = 0
  index = 0
  name = ''
  numberOfVerses = 0
  approximateVerses = false
  intro = ''
  chapters: ReadonlyArray<{ name: string; stage: string }> = []
}

export function createText(data: Partial<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
