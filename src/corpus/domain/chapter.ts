import { immerable } from 'immer'
import { LineNumber } from 'transliteration/domain/line-number'
import { MarkupPart } from 'transliteration/domain/markup'
import { Token } from 'transliteration/domain/token'
import { ChapterAlignment } from './alignment'
import { Line, ManuscriptLine } from './line'
import { Manuscript } from './manuscript'
import { TextId } from './text'

export interface ChapterId {
  readonly textId: TextId
  readonly stage: string
  readonly name: string
}

export class Chapter {
  readonly [immerable] = true

  constructor(
    readonly textId: TextId,
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

export interface LineDisplay {
  readonly number: LineNumber
  readonly intertext: ReadonlyArray<MarkupPart>
  readonly reconstruction: ReadonlyArray<Token>
  readonly translation: ReadonlyArray<MarkupPart>
}

export interface ChapterDisplay {
  readonly id: ChapterId
  readonly textName: string
  readonly isSingleStage: boolean
  readonly title: ReadonlyArray<MarkupPart>
  readonly lines: ReadonlyArray<LineDisplay>
}
