import { Line } from 'corpus/domain/line'
import { TextLine } from 'transliteration/domain/text-line'

export default interface TransliterationSearchResult {
  readonly id: {
    readonly textId: {
      readonly genre: string
      readonly category: number
      readonly index: number
    }
    readonly stage: string
    readonly name: string
  }
  readonly siglums: Record<string, string>
  readonly matchingLines: readonly Line[]
  readonly matchingColophonLines: Record<string, readonly TextLine[]>
}
