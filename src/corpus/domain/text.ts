import Reference from 'bibliography/domain/Reference'
import produce, { Draft, immerable } from 'immer'
import _ from 'lodash'
import { numberToRoman } from 'big-roman'
import { ChapterAlignment } from './alignment'
import { Line, ManuscriptLine } from './line'
import { Manuscript } from './manuscript'
import { MarkupPart } from 'transliteration/domain/markup'

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
  readonly genre: string
  readonly category: number
  readonly index: number
  readonly name: string
  readonly numberOfVerses: number
  readonly approximateVerses: boolean
}

export interface UncertainFragment {
  readonly museumNumber: string
  readonly isInFragmentarium: boolean
}

export interface ChapterListing {
  readonly name: string
  readonly stage: string
  readonly title: readonly MarkupPart[]
  readonly uncertainFragments: readonly UncertainFragment[]
}

export class Text implements TextInfo {
  readonly [immerable] = true
  readonly genre: string = 'L'
  readonly category: number = 0
  readonly index: number = 0
  readonly name: string = ''
  readonly numberOfVerses: number = 0
  readonly approximateVerses: boolean = false
  readonly intro: string = ''
  readonly chapters: ReadonlyArray<ChapterListing> = []
  readonly references: ReadonlyArray<Reference> = []

  get title(): string {
    return `${this.category && numberToRoman(this.category)}.${this.index} ${
      this.name
    }`
  }

  get hasMultipleStages(): boolean {
    return _(this.chapters).map('stage').uniq().size() > 1
  }
}

export function createText(data: Partial<Text>): Text {
  return produce(new Text(), (draft: Draft<Text>) => {
    _.assign(draft, data)
  })
}
