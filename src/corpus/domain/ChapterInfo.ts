import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'
import { Line } from 'corpus/domain/line'

export interface ChapterInfoLine extends Omit<Line, 'translation'> {
  translation: ReadonlyArray<TranslationLine>
}

export default interface ChapterInfo {
  readonly id: {
    readonly textId: {
      readonly genre: 'L' | 'D' | 'Lex' | 'Med'
      readonly category: number
      readonly index: number
    }
    readonly stage: string
    readonly name: string
  }
  readonly textName: string
  readonly siglums: Record<string, string>
  readonly matchingLines: readonly ChapterInfoLine[]
  readonly matchingColophonLines: Record<string, readonly TextLine[]>
}
