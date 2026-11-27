import { immerable } from 'immer'
import { Line } from 'corpus/domain/line'
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
}

export function createChapter(data: Partial<Chapter>): Chapter {
  return new Chapter({
    textId: data.textId ?? { genre: 'L', category: 0, index: 0 },
    textHasDoi: data.textHasDoi ?? false,
    classification: data.classification ?? 'Ancient',
    stage: data.stage ?? 'Neo-Assyrian',
    version: data.version ?? '',
    name: data.name ?? '',
    order: data.order ?? 0,
    manuscripts: data.manuscripts ?? [],
    uncertainFragments: data.uncertainFragments ?? [],
    lines: data.lines ?? [],
  })
}
