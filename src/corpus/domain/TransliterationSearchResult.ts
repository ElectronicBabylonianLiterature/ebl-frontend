import { Line } from 'corpus/domain/line'

export default interface TransliterationSearchResult {
  readonly id: {
    readonly category: number
    readonly index: number
  }
  readonly matchingChapters: readonly {
    readonly id: {
      stage: string
      name: string
    }
    readonly siglums: { [key: string]: string }
    readonly matchingLines: readonly Line[]
    readonly matchingColophonLines: {
      [key: string]: readonly string[]
    }
  }[]
}
