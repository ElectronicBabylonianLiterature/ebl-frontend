import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { Line } from 'corpus/domain/line'
import { LineState } from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import { loadLine, reloadSavedLine } from 'corpus/ui/edit-lite/lineLoading'
import {
  findLineActivity,
  findLineState,
  findNewLineIndex,
} from 'corpus/ui/edit-lite/lineStates'

interface SavableLine {
  readonly original: Line
  readonly draft: Line
}

function findSavableLine(lineState: LineState | undefined): SavableLine | null {
  const original = lineState?.original ?? null
  const draft = lineState?.draft ?? null
  return original === null || draft === null || lineState?.status === 'saving'
    ? null
    : { original, draft }
}

async function saveExistingLine(
  store: EditLiteStore,
  index: number,
  { original, draft }: SavableLine,
): Promise<void> {
  const source = store.getSource()
  store.dispatch({ type: 'saveStarted', index })
  try {
    const outline = await source.saveLine(index, original, draft)
    const line = await reloadSavedLine(source, index)
    store.dispatch({ type: 'saveSucceeded', index, outline, line })
  } catch (error) {
    store.dispatch({ type: 'saveFailed', index, error: errorMessage(error) })
  }
}

async function saveNewLine(
  store: EditLiteStore,
  index: number,
  draft: Line,
): Promise<void> {
  const source = store.getSource()
  store.dispatch({ type: 'saveStarted', index })
  try {
    const outline = await source.addLine(draft)
    const line = await loadLine(source, outline.lines.length - 1)
    store.dispatch({ type: 'newLineSaved', outline, line })
  } catch (error) {
    store.dispatch({ type: 'newLineSaveFailed', error: errorMessage(error) })
  }
}

export function saveLine(store: EditLiteStore, index: number): void {
  const state = store.getState()
  const savableLine = findSavableLine(findLineState(state, index))
  if (savableLine === null || findLineActivity(state) === 'deleting') {
    return
  }
  if (index === findNewLineIndex(state)) {
    void saveNewLine(store, index, savableLine.draft)
  } else {
    void saveExistingLine(store, index, savableLine)
  }
}

export async function deleteLine(
  store: EditLiteStore,
  index: number,
): Promise<void> {
  const state = store.getState()
  if (!(index in state.lines) || findLineActivity(state) !== 'idle') {
    return
  }
  store.dispatch({ type: 'deleteStarted', index })
  try {
    const outline = await store.getSource().deleteLine(index)
    store.dispatch({ type: 'lineDeleted', index, outline })
  } catch (error) {
    store.dispatch({ type: 'saveFailed', index, error: errorMessage(error) })
  }
}

async function createDefaultLine(
  store: EditLiteStore,
  lastIndex: number,
): Promise<Line> {
  return createDefaultLineFactory(
    await loadLine(store.getSource(), lastIndex),
  )()
}

export function addLine(store: EditLiteStore): void {
  const state = store.getState()
  const lastIndex = state.outline.lines.length - 1
  const lastDraft = state.lines[lastIndex]?.draft ?? null
  if (state.newLine !== null) {
    return
  }
  if (lastIndex < 0 || lastDraft !== null) {
    store.dispatch({
      type: 'lineAdded',
      line: createDefaultLineFactory(lastDraft)(),
    })
  } else {
    store.dispatch({ type: 'lineAddStarted' })
    void createDefaultLine(store, lastIndex).then((line) =>
      store.dispatch({ type: 'lineAdded', line }),
    )
  }
}
