import { immerable } from 'immer'
import { ChapterAlignment } from 'corpus/domain/alignment'
import { Line, ManuscriptLine } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import { TextId } from 'transliteration/domain/text-id'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface ChapterProps {
  readonly textId: TextId
  readonly textHasDoi: boolean
  readonly classification: string
  readonly stage: string
  readonly version: string
  readonly name: string
  readonly order: number
  readonly manuscripts: ReadonlyArray<Manuscript>
  readonly uncertainFragments: ReadonlyArray<string>
  readonly lines: ReadonlyArray<Line>
}

export class Chapter implements ChapterProps {
  readonly [immerable] = true
  readonly textId: TextId
  readonly textHasDoi: boolean
  readonly classification: string
  readonly stage: string
  readonly version: string
  readonly name: string
  readonly order: number
  readonly manuscripts: ReadonlyArray<Manuscript>
  readonly uncertainFragments: ReadonlyArray<string>
  readonly lines: ReadonlyArray<Line>

  constructor(props: ChapterProps) {
    this.textId = props.textId
    this.textHasDoi = props.textHasDoi
    this.classification = props.classification
    this.stage = props.stage
    this.version = props.version
    this.name = props.name
    this.order = props.order
    this.manuscripts = props.manuscripts
    this.uncertainFragments = props.uncertainFragments
    this.lines = props.lines
  }

  get id(): ChapterId {
    return {
      textId: this.textId,
      stage: this.stage,
      name: this.name,
    }
  }

  get alignment(): ChapterAlignment {
    return new ChapterAlignment(
      this.lines.map((line) =>
        line.variants.map((variant) => variant.alignment),
      ),
    )
  }

  getSiglum(manuscriptLine: ManuscriptLine): string {
    const manuscript = this.manuscripts.find(
      (candidate) => candidate.id === manuscriptLine.manuscriptId,
    )
    if (manuscript) {
      return manuscript.siglum
    } else {
      return `<unknown ID: ${manuscriptLine.manuscriptId}>`
    }
  }
}

export type {
  LineVariantDisplay,
  LineDisplay,
  DictionaryLineDisplay,
  Author,
  Translator,
  Record,
  ChapterDisplayProps,
} from 'corpus/domain/chapterDisplay'
export { ChapterDisplay } from 'corpus/domain/chapterDisplay'
