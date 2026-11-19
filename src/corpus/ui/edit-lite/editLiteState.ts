import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'

export type LineStatus = 'loading' | 'ready' | 'saving' | 'failed'

export interface LineState {
  readonly status: LineStatus
  readonly original: Line | null
  readonly draft: Line | null
  readonly error: string | null
}

export interface EditLiteState {
  readonly outline: ChapterOutline
  readonly lines: Readonly<Record<number, LineState>>
}

export type EditLiteAction =
  | { readonly type: 'linesRequested'; readonly indices: readonly number[] }
  | {
      readonly type: 'linesLoaded'
      readonly offset: number
      readonly lines: readonly Line[]
    }
  | {
      readonly type: 'linesFailed'
      readonly indices: readonly number[]
      readonly error: string
    }
  | {
      readonly type: 'lineChanged'
      readonly index: number
      readonly draft: Line
    }
  | { readonly type: 'lineReset'; readonly index: number }
  | { readonly type: 'saveStarted'; readonly index: number }
  | {
      readonly type: 'saveSucceeded'
      readonly index: number
      readonly outline: ChapterOutline
      readonly line: Line
    }
  | {
      readonly type: 'saveFailed'
      readonly index: number
      readonly error: string
    }
