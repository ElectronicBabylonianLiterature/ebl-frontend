import { createContext, useContext } from 'react'
import {
  ChapterEditSourceKind,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'

export interface EditLiteActions {
  ensureLines(offset: number, limit: number): void
  changeLine(index: number, draft: Line): void
  resetLine(index: number): void
  saveLine(index: number): void
}

export interface EditLiteContextValue {
  readonly kind: ChapterEditSourceKind
  readonly canSave: boolean
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly actions: EditLiteActions
  describeSave(index: number, draft: Line): LinesUpdateDto
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
