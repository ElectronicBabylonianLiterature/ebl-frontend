import { AbstractLine, LineBaseDto } from './abstract-line'
import { Labels } from './labels'
import { LineNumber, LineNumberRange } from './line-number'
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

export class ParallelFragment extends AbstractLine {
  readonly type = 'ParallelFragment'
  readonly hasCf: boolean
  readonly museumNumber: MuseumNumber
  readonly hasDuplicates: boolean
  readonly labels: Labels
  readonly lineNumber: LineNumber | LineNumberRange
  readonly exists: boolean | null

  constructor(
    data: Pick<
      ParallelFragmentDto,
      | 'content'
      | 'hasCf'
      | 'museumNumber'
      | 'hasDuplicates'
      | 'labels'
      | 'lineNumber'
      | 'exists'
    >,
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.museumNumber = data.museumNumber
    this.hasDuplicates = data.hasDuplicates
    this.labels = data.labels
    this.lineNumber = data.lineNumber
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

export class ParallelText extends AbstractLine {
  readonly type = 'ParallelText'
  readonly hasCf: boolean
  readonly text: TextId
  readonly chapter: ChapterName | null
  readonly lineNumber: LineNumber | LineNumberRange
  readonly exists: boolean | null
  readonly implicitChapter: ChapterName | null

  constructor(
    data: Pick<
      ParallelTextDto,
      | 'content'
      | 'hasCf'
      | 'text'
      | 'chapter'
      | 'lineNumber'
      | 'exists'
      | 'implicitChapter'
    >,
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.text = data.text
    this.chapter = data.chapter
    this.lineNumber = data.lineNumber
    this.exists = data.exists
    this.implicitChapter = data.implicitChapter
  }
}

export interface ParallelCompositionDto extends ParallelLineBaseDto {
  readonly type: 'ParallelComposition'
  readonly name: string
}

export class ParallelComposition extends AbstractLine {
  readonly type = 'ParallelComposition'
  readonly hasCf: boolean
  readonly name: string
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(
    data: Pick<
      ParallelCompositionDto,
      'content' | 'hasCf' | 'name' | 'lineNumber'
    >,
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.name = data.name
    this.lineNumber = data.lineNumber
  }
}

export type ParallelLineDto =
  | ParallelFragmentDto
  | ParallelTextDto
  | ParallelCompositionDto
export type ParallelLine = ParallelFragment | ParallelText | ParallelComposition
