import { AbstractLine, LineBaseDto } from 'transliteration/domain/abstract-line'
import { Labels } from 'transliteration/domain/labels'
import { LineNumber, LineNumberRange } from 'transliteration/domain/line-number'
import MuseumNumber from 'fragmentarium/domain/MuseumNumber'
import { TextId } from 'transliteration/domain/text-id'

export const parallelLinePrefix = '// '

interface ParallelLineBaseDto extends LineBaseDto {
  readonly type: 'ParallelFragment' | 'ParallelText' | 'ParallelComposition'
  readonly prefix: typeof parallelLinePrefix
  readonly hasCf: boolean
  readonly lineNumber: LineNumber | LineNumberRange
}

export interface ParallelFragmentDto extends ParallelLineBaseDto {
  readonly type: 'ParallelFragment'
  readonly museumNumber: MuseumNumber
  readonly hasDuplicates: boolean
  readonly labels: Labels
  readonly exists: boolean | null
}

abstract class ParallelLineBase extends AbstractLine {
  readonly hasCf: boolean
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(
    data: Pick<ParallelLineBaseDto, 'content' | 'hasCf' | 'lineNumber'>,
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.lineNumber = data.lineNumber
  }
}

type ParallelLineData<T extends ParallelLineBaseDto> = Omit<
  T,
  'type' | 'prefix'
>

export class ParallelFragment extends ParallelLineBase {
  readonly type = 'ParallelFragment'
  readonly museumNumber: MuseumNumber
  readonly hasDuplicates: boolean
  readonly labels: Labels
  readonly exists: boolean | null

  constructor(data: ParallelLineData<ParallelFragmentDto>) {
    super(data)
    this.museumNumber = data.museumNumber
    this.hasDuplicates = data.hasDuplicates
    this.labels = data.labels
    this.exists = data.exists
  }
}

interface ChapterName {
  stage: string
  version: string
  name: string
}

export interface ParallelTextDto extends ParallelLineBaseDto {
  readonly type: 'ParallelText'
  readonly text: TextId
  readonly chapter: ChapterName | null
  readonly exists: boolean | null
  readonly implicitChapter: ChapterName | null
}

export class ParallelText extends ParallelLineBase {
  readonly type = 'ParallelText'
  readonly text: TextId
  readonly chapter: ChapterName | null
  readonly exists: boolean | null
  readonly implicitChapter: ChapterName | null

  constructor(data: ParallelLineData<ParallelTextDto>) {
    super(data)
    this.text = data.text
    this.chapter = data.chapter
    this.exists = data.exists
    this.implicitChapter = data.implicitChapter
  }
}

export interface ParallelCompositionDto extends ParallelLineBaseDto {
  readonly type: 'ParallelComposition'
  readonly name: string
}

export class ParallelComposition extends ParallelLineBase {
  readonly type = 'ParallelComposition'
  readonly name: string

  constructor(data: ParallelLineData<ParallelCompositionDto>) {
    super(data)
    this.name = data.name
  }
}

export type ParallelLineDto =
  | ParallelFragmentDto
  | ParallelTextDto
  | ParallelCompositionDto
export type ParallelLine = ParallelFragment | ParallelText | ParallelComposition
