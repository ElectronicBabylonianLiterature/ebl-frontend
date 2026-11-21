import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'

export type LineStatus =
  | 'loading'
  | 'ready'
  | 'saving'
  | 'deleting'
  | 'moving'
  | 'failed'

export type AnnotationView = 'alignment' | 'lemmatization'

export type LineView = 'text' | AnnotationView

export type Loadable<Value> =
  | { readonly status: 'loading'; readonly value: null; readonly error: null }
  | { readonly status: 'ready'; readonly value: Value; readonly error: null }
  | {
      readonly status: 'failed'
      readonly value: null
      readonly error: string
    }

export type AnnotationDraft =
  | { readonly view: 'alignment'; readonly alignment: LineAlignment }
  | {
      readonly view: 'lemmatization'
      readonly lemmatization: readonly LineLemmatization[]
    }

export interface LineAnnotation {
  readonly tokens: Loadable<Line>
  readonly lemmas: Loadable<readonly LineLemmatization[]> | null
  readonly draft: AnnotationDraft | null
  readonly isStale: boolean
}

export interface LineState {
  readonly status: LineStatus
  readonly original: Line | null
  readonly draft: Line | null
  readonly error: string | null
  readonly annotation?: LineAnnotation
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
  | IndexedAction<'annotationRequested'>
  | {
      readonly type: 'annotationSettled'
      readonly original: Line
      readonly tokens: Loadable<Line>
    }
  | IndexedAction<'lemmasRequested'>
  | {
      readonly type: 'lemmasSettled'
      readonly line: Line
      readonly lemmas: Loadable<readonly LineLemmatization[]>
    }
  | (IndexedAction<'annotationChanged'> & {
      readonly line: Line
      readonly draft: AnnotationDraft
    })
  | OutlineAction<'outlineReplaced'>
  | OutlineAction<'manuscriptsSaved'>
  | { readonly type: 'manuscriptsEdited'; readonly hasUnsaved: boolean }
