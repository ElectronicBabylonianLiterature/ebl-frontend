import { AbstractLine, LineBaseDto } from './abstract-line'
import { SurfaceLabel } from './labels'
import { LineNumber, LineNumberRange } from './line-number'
import MuseumNumber from 'fragmentarium/domain/MuseumNumber'
import { TextId } from 'corpus/domain/text'

export const parallelLinePrefix = '// '

export interface ParallelLineDto extends LineBaseDto {
  readonly type: 'ParallelFragment' | 'ParallelText' | 'ParallelComposition'
  readonly prefix: typeof parallelLinePrefix
  readonly hasCf: boolean
  readonly lineNumber: LineNumber | LineNumberRange
}

export interface ParallelFragmentDto extends ParallelLineDto {
  readonly type: 'ParallelFragment'
  readonly museumNumber: MuseumNumber
  readonly hasDuplicates: boolean
  readonly surface: SurfaceLabel | null
}

export class ParallelFragment extends AbstractLine {
  readonly type = 'ParallelFragment'
  readonly hasCf: boolean
  readonly museumNumber: MuseumNumber
  readonly hasDuplicates: boolean
  readonly surface: SurfaceLabel | null
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(
    data: Pick<
      ParallelFragmentDto,
      | 'content'
      | 'hasCf'
      | 'museumNumber'
      | 'hasDuplicates'
      | 'surface'
      | 'lineNumber'
    >
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.museumNumber = data.museumNumber
    this.hasDuplicates = data.hasDuplicates
    this.surface = data.surface
    this.lineNumber = data.lineNumber
  }
}

interface ChapterName {
  stage: string
  version: string
  name: string
}

export interface ParallelTextDto extends ParallelLineDto {
  readonly type: 'ParallelText'
  readonly text: TextId
  readonly chapter: ChapterName | null
}

export class ParallelText extends AbstractLine {
  readonly type = 'ParallelText'
  readonly hasCf: boolean
  readonly text: TextId
  readonly chapter: ChapterName | null
  readonly lineNumber: LineNumber | LineNumberRange

  constructor(
    data: Pick<
      ParallelTextDto,
      'content' | 'hasCf' | 'text' | 'chapter' | 'lineNumber'
    >
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.text = data.text
    this.chapter = data.chapter
    this.lineNumber = data.lineNumber
  }
}

export interface ParallelCompositionDto extends ParallelLineDto {
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
    >
  ) {
    super(parallelLinePrefix, data.content)
    this.hasCf = data.hasCf
    this.name = data.name
    this.lineNumber = data.lineNumber
  }
}
