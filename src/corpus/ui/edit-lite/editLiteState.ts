import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'

export type LineStatus =
  | 'loading'
  | 'ready'
  | 'saving'
  | 'deleting'
  | 'moving'
  | 'failed'

export interface LineState {
  readonly status: LineStatus
  readonly original: Line | null
  readonly draft: Line | null
  readonly error: string | null
}

export interface EditLiteState {
  readonly outline: ChapterOutline
  readonly lines: Readonly<Record<number, LineState>>
  readonly newLine: LineState | null
  readonly layoutVersion: number
  readonly manuscriptsVersion: number
  readonly hasUnsavedManuscripts: boolean
}

interface IndexedAction<Type extends string> {
  readonly type: Type
  readonly index: number
}

interface OutlineAction<Type extends string> {
  readonly type: Type
  readonly outline: ChapterOutline
}

interface FailureAction<Type extends string> {
  readonly type: Type
  readonly error: string
}

export type EditLiteAction =
  | { readonly type: 'linesRequested'; readonly indices: readonly number[] }
  | {
      readonly type: 'linesLoaded'
      readonly offset: number
      readonly lines: readonly Line[]
    }
  | (FailureAction<'linesFailed'> & { readonly indices: readonly number[] })
  | (IndexedAction<'lineChanged'> & {
      readonly draft: Line
      readonly original?: Line | null
    })
  | IndexedAction<'lineReset'>
  | IndexedAction<'saveStarted'>
  | (IndexedAction<'saveSucceeded'> & { readonly line: Line | null })
  | (IndexedAction<'saveFailed'> & FailureAction<'saveFailed'>)
  | { readonly type: 'lineAddStarted' }
  | { readonly type: 'lineAdded'; readonly line: Line }
  | OutlineAction<'newLineSaved'>
  | FailureAction<'newLineSaveFailed'>
  | IndexedAction<'deleteStarted'>
  | (IndexedAction<'lineDeleted'> & OutlineAction<'lineDeleted'>)
  | IndexedAction<'moveStarted'>
  | (OutlineAction<'lineMoved'> & {
      readonly from: number
      readonly to: number
    })
  | OutlineAction<'outlineReplaced'>
  | OutlineAction<'manuscriptsSaved'>
  | { readonly type: 'manuscriptsEdited'; readonly hasUnsaved: boolean }
