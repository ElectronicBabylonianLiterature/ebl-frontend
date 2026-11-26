import { createContext, useContext } from 'react'
import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  AnnotationDraft,
  AnnotationView,
} from 'corpus/ui/edit-lite/editLiteState'
import Word from 'dictionary/domain/Word'

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
  openAnnotation(index: number, view: AnnotationView): void
  changeAnnotation(index: number, draft: AnnotationDraft, line: Line): void
  saveAnnotation(index: number, view: AnnotationView): void
  leaveAnnotation(index: number, view: AnnotationView, onLeft: () => void): void
  countWordInstances(word: string): Promise<WordInstances>
  lemmatizeInstances(
    index: number,
    word: string,
    lemmaIds: readonly string[],
    onDone: () => void,
  ): string | null
}

export interface EditLiteContextValue {
  readonly canWrite: boolean
  readonly manuscripts: readonly ManuscriptSummary[]
  readonly actions: EditLiteActions
  searchLemma(query: string): Promise<readonly Word[]>
  createProperNoun(lemma: string, namedEntityTag: string): Promise<Word>
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
