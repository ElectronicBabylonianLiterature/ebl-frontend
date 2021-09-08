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

const lineClases = {
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
  ParallelFragment: ControlLine,
  ParallelText: ControlLine,
  ParallelComposition: ControlLine,
  TranslationLine: TranslationLine,
} as const

export function createTransliteration(text): Text {
  return new Text({
    lines: text.lines.map((lineDto) => {
      const LineClass = lineClases[lineDto.type]
      if (LineClass) {
        return new LineClass(lineDto)
      } else {
        console.error(`Unknown line type "${lineDto.type}.`)
        return new ControlLine(lineDto)
      }
    }),
  })
}
