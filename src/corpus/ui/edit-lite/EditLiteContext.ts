import { createContext, useContext } from 'react'
import {
  ChapterChange,
  ChapterEditSourceKind,
  ChapterRequest,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

export interface ImportedLines {
  readonly firstIndex: number
  readonly count: number
}

export interface EditLiteActions {
  ensureLines(offset: number, limit: number): void
  changeLine(index: number, draft: Line, original?: Line | null): void
  resetLine(index: number): void
  saveLine(index: number): void
  addLine(): void
  deleteLine(index: number, onDeleted: () => void): void
  moveLine(from: number, to: number, onMoved: () => void): void
  importLines(atf: string): Promise<ImportedLines>
  saveManuscripts(
    manuscripts: readonly Manuscript[],
    uncertainFragments: readonly string[],
  ): Promise<void>
  reportUnsavedManuscripts(hasUnsaved: boolean): void
}

export interface EditLiteContextValue {
  readonly kind: ChapterEditSourceKind
  readonly canSave: boolean
  readonly canWrite: boolean
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly actions: EditLiteActions
  describeChange(change: ChapterChange): ChapterRequest
}

const EditLiteContext = createContext<EditLiteContextValue | null>(null)

export function useEditLiteContext(): EditLiteContextValue {
  const value = useContext(EditLiteContext)
  if (value === null) {
    throw new Error('EditLiteContext is not provided.')
  }
  return value
}

export default EditLiteContext
