import { Line } from 'corpus/domain/line'

export default interface TransliterationSearchResult {
  readonly id: {
    readonly textId: {
      readonly category: number
      readonly index: number
    }
    readonly stage: string
    readonly name: string
  }
  readonly siglums: Record<string, string>
  readonly matchingLines: readonly Line[]
  readonly matchingColophonLines: Record<string, readonly string[]>
}
