import { TextLine } from 'transliteration/domain/text-line'
import TranslationLine from 'transliteration/domain/translation-line'
import { Line } from 'corpus/domain/line'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface ChapterInfoLine extends Omit<Line, 'translation'> {
  translation: ReadonlyArray<TranslationLine>
}

export default interface ChapterInfo {
  readonly id: ChapterId
  readonly textName: string
  readonly siglums: Record<string, string>
  readonly matchingLines: readonly ChapterInfoLine[]
  readonly matchingColophonLines: Record<string, readonly TextLine[]>
}
