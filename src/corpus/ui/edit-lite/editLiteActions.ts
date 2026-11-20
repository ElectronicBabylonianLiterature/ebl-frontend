import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  EditLiteActions,
  ImportedLines,
} from 'corpus/ui/edit-lite/EditLiteContext'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import {
  findMissingIndices,
  loadRange,
  toContiguousRanges,
} from 'corpus/ui/edit-lite/lineLoading'
import { addLine, deleteLine, saveLine } from 'corpus/ui/edit-lite/lineSaving'

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
  let pendingIndices: number[] = []

  function loadPendingLines(): void {
    const indices = pendingIndices
    pendingIndices = []
    toContiguousRanges(indices).forEach((range) => {
      void loadRange(store, range)
    })
  }

  return {
    ensureLines(offset: number, limit: number): void {
      const missingIndices = findMissingIndices(store.getState(), offset, limit)
      if (missingIndices.length === 0) {
        return
      }
      store.dispatch({ type: 'linesRequested', indices: missingIndices })
      if (pendingIndices.length === 0) {
        void Promise.resolve().then(loadPendingLines)
      }
      pendingIndices.push(...missingIndices)
    },
    changeLine(index: number, draft: Line): void {
      store.dispatch({ type: 'lineChanged', index, draft })
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
    deleteLine(index: number): void {
      void deleteLine(store, index)
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
  }
}
