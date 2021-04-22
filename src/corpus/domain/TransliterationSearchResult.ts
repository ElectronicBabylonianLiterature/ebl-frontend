import { Line } from 'corpus/domain/line'

export interface ChapterInfo {
  readonly id: {
    stage: string
    name: string
  }
  readonly siglums: Record<string, string>
  readonly matchingLines: readonly Line[]
  readonly matchingColophonLines: Record<string, readonly string[]>
}

export default interface TransliterationSearchResult {
  readonly id: {
    readonly category: number
    readonly index: number
  }
  readonly matchingChapters: readonly ChapterInfo[]
}
