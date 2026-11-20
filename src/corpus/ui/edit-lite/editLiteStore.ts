import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'

export interface EditLiteStore {
  getState(): EditLiteState
  getSource(): ChapterEditSource
  dispatch(action: EditLiteAction): void
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
