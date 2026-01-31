import { AbstractLine, LineBaseDto } from 'transliteration/domain/abstract-line'
import {
  ColumnAtLine,
  CompositeAtLine,
  DiscourseAtLine,
  DivisionAtLine,
  HeadingAtLine,
  ObjectAtLine,
  SealAtLine,
  SurfaceAtLine,
} from 'transliteration/domain/at-lines'
import {
  ImageDollarLine,
  LooseDollarLine,
  RulingDollarLine,
  SealDollarLine,
  StateDollarLine,
} from 'transliteration/domain/dollar-lines'
import { ControlLine, EmptyLine } from 'transliteration/domain/line'
import { NoteLine } from 'transliteration/domain/note-line'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'
import {
  ParallelFragment,
  ParallelText,
  ParallelComposition,
} from 'transliteration/domain/parallel-line'
import { TextDto } from 'fragmentarium/domain/FragmentDtos'

const lineClasses = {
  TextLine: TextLine,
  ControlLine: ControlLine,
  EmptyLine: EmptyLine,
  NoteLine: NoteLine,
  LooseDollarLine: LooseDollarLine,
  ImageDollarLine: ImageDollarLine,
  RulingDollarLine: RulingDollarLine,
  SealDollarLine: SealDollarLine,
  StateDollarLine: StateDollarLine,
  SealAtLine: SealAtLine,
  HeadingAtLine: HeadingAtLine,
  ColumnAtLine: ColumnAtLine,
  DiscourseAtLine: DiscourseAtLine,
  SurfaceAtLine: SurfaceAtLine,
  ObjectAtLine: ObjectAtLine,
  DivisionAtLine: DivisionAtLine,
  CompositeAtLine: CompositeAtLine,
  ParallelFragment: ParallelFragment,
  ParallelText: ParallelText,
  ParallelComposition: ParallelComposition,
  TranslationLine: TranslationLine,
} as const

export function fromTransliterationLineDto<T extends LineBaseDto>(
  lineDto: T,
): AbstractLine {
  const LineClass = lineClasses[lineDto.type]
  if (LineClass) {
    return new LineClass(lineDto)
  } else {
    console.error(`Unknown line type "${lineDto.type}".`)
    return new ControlLine(lineDto)
  }
}

export function createTransliteration(textDto: TextDto): Text {
  return new Text({
    lines: textDto.lines.map(fromTransliterationLineDto),
  })
}
