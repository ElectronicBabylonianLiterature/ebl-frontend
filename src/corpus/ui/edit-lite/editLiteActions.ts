import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  leaveAnnotation,
  lemmatizeInstances,
  openAnnotation,
  saveAnnotation,
} from 'corpus/ui/edit-lite/annotationActions'
import {
  EditLiteActions,
  ImportedLines,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  AnnotationDraft,
  AnnotationView,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import {
  findMissingIndices,
  loadRange,
  toContiguousRanges,
} from 'corpus/ui/edit-lite/lineLoading'
import {
  addLine,
  deleteLine,
  moveLine,
  saveLine,
} from 'corpus/ui/edit-lite/lineSaving'

interface LinesRequest {
  readonly layoutVersion: number
  readonly indices: readonly number[]
}

function rejectWithMessage(error: unknown): never {
  throw new Error(errorMessage(error))
}

async function importLines(
  store: EditLiteStore,
  atf: string,
): Promise<ImportedLines> {
  const outline = await store
    .getSource()
    .importLines(atf)
    .catch(rejectWithMessage)
  const firstIndex = store.getState().outline.lines.length
  store.dispatch({ type: 'outlineReplaced', outline })
  return { firstIndex, count: outline.lines.length - firstIndex }
}

async function saveManuscripts(
  store: EditLiteStore,
  manuscripts: readonly Manuscript[],
  uncertainFragments: readonly string[],
): Promise<void> {
  const outline = await store
    .getSource()
    .saveManuscripts(manuscripts, uncertainFragments)
    .catch(rejectWithMessage)
  store.dispatch({ type: 'manuscriptsSaved', outline })
}

export function createEditLiteActions(store: EditLiteStore): EditLiteActions {
  let pendingRequests: LinesRequest[] = []

  function loadPendingLines(): void {
    const { layoutVersion } = store.getState()
    const indices = pendingRequests
      .filter((request) => request.layoutVersion === layoutVersion)
      .flatMap((request) => request.indices)
    pendingRequests = []
    toContiguousRanges(indices).forEach((range) => {
      void loadRange(store, range)
    })
  }

  return {
    ensureLines(offset: number, limit: number): void {
      const state = store.getState()
      const missingIndices = findMissingIndices(state, offset, limit)
      if (missingIndices.length === 0) {
        return
      }
      store.dispatch({ type: 'linesRequested', indices: missingIndices })
      if (pendingRequests.length === 0) {
        void Promise.resolve().then(loadPendingLines)
      }
      pendingRequests.push({
        layoutVersion: state.layoutVersion,
        indices: missingIndices,
      })
    },
    changeLine(index: number, draft: Line, original?: Line | null): void {
      store.dispatch({ type: 'lineChanged', index, draft, original })
    },
    resetLine(index: number): void {
      store.dispatch({ type: 'lineReset', index })
    },
    saveLine(index: number): void {
      saveLine(store, index)
    },
    addLine(): void {
      addLine(store)
    },
    deleteLine(index: number, onDeleted: () => void): void {
      void deleteLine(store, index, onDeleted)
    },
    moveLine(from: number, to: number, onMoved: () => void): void {
      void moveLine(store, from, to, onMoved)
    },
    importLines(atf: string): Promise<ImportedLines> {
      return importLines(store, atf)
    },
    saveManuscripts(
      manuscripts: readonly Manuscript[],
      uncertainFragments: readonly string[],
    ): Promise<void> {
      return saveManuscripts(store, manuscripts, uncertainFragments)
    },
    reportUnsavedManuscripts(hasUnsaved: boolean): void {
      store.dispatch({ type: 'manuscriptsEdited', hasUnsaved })
    },
    openAnnotation(index: number, view: AnnotationView): void {
      openAnnotation(store, index, view)
    },
    changeAnnotation(index: number, draft: AnnotationDraft, line: Line): void {
      store.dispatch({ type: 'annotationChanged', index, line, draft })
    },
    saveAnnotation(index: number, view: AnnotationView): void {
      saveAnnotation(store, index, view)
    },
    leaveAnnotation(
      index: number,
      view: AnnotationView,
      onLeft: () => void,
    ): void {
      leaveAnnotation(store, index, view, onLeft)
    },
    countWordInstances(word: string): Promise<WordInstances> {
      return store.getSource().countWordInstances(word)
    },
    lemmatizeInstances(
      index: number,
      word: string,
      lemmaIds: readonly string[],
      onDone: () => void,
    ): boolean {
      return lemmatizeInstances(store, index, word, lemmaIds, onDone)
    },
  }
}
