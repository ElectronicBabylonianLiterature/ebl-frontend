import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { createDefaultLineFactory } from 'corpus/application/line-factory'
import { Line } from 'corpus/domain/line'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import { hasAnnotationDraft } from 'corpus/ui/edit-lite/lineAnnotations'
import { loadLine } from 'corpus/ui/edit-lite/lineLoading'
import {
  findLineActivity,
  findLineState,
  findNewLineIndex,
  isLayoutChanging,
  isLineLoaded,
} from 'corpus/ui/edit-lite/lineStates'
import { hasSameLineCount } from 'corpus/ui/edit-lite/outlineChanges'

interface SavableLine {
  readonly original: Line
  readonly draft: Line
}

function findSavableLine(lineState: LineState | undefined): SavableLine | null {
  const original = lineState?.original ?? null
  const draft = lineState?.draft ?? null
  const isRefused =
    lineState?.status === 'saving' || hasAnnotationDraft(lineState)
  return original === null || draft === null || isRefused
    ? null
    : { original, draft }
}

export async function saveStoredLine(
  store: EditLiteStore,
  index: number,
  save: (source: ChapterEditSource) => Promise<ChapterOutline>,
): Promise<void> {
  const source = store.getSource()
  store.dispatch({ type: 'saveStarted', index })
  try {
    const outline = await save(source)
    store.dispatch({ type: 'outlineReplaced', outline })
  } catch (error) {
    store.dispatch({ type: 'saveFailed', index, error: errorMessage(error) })
    return
  }
  const line = await loadLine(source, index)
  store.dispatch({ type: 'saveSucceeded', index, line })
}

async function saveNewLine(
  store: EditLiteStore,
  index: number,
  draft: Line,
): Promise<void> {
  store.dispatch({ type: 'saveStarted', index })
  try {
    const outline = await store.getSource().addLine(draft)
    store.dispatch({ type: 'newLineSaved', outline })
  } catch (error) {
    store.dispatch({ type: 'newLineSaveFailed', error: errorMessage(error) })
  }
}

export function saveLine(store: EditLiteStore, index: number): void {
  const state = store.getState()
  const savableLine = findSavableLine(findLineState(state, index))
  if (savableLine === null || isLayoutChanging(findLineActivity(state))) {
    return
  }
  const { original, draft } = savableLine
  if (index === findNewLineIndex(state)) {
    void saveNewLine(store, index, draft)
  } else {
    void saveStoredLine(store, index, (source) =>
      source.saveLine(index, original, draft),
    )
  }
}

export async function deleteLine(
  store: EditLiteStore,
  index: number,
  onDeleted: () => void,
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
    return
  }
  onDeleted()
}

function isStoredPosition(state: EditLiteState, index: number): boolean {
  return (
    Number.isInteger(index) && index >= 0 && index < state.outline.lines.length
  )
}

function isMoveBetweenStoredPositions(
  state: EditLiteState,
  from: number,
  to: number,
): boolean {
  return (
    from !== to &&
    [from, to].every((position) => isStoredPosition(state, position))
  )
}

function canMoveLine(state: EditLiteState, from: number, to: number): boolean {
  return (
    findLineActivity(state) === 'idle' &&
    isMoveBetweenStoredPositions(state, from, to) &&
    isLineLoaded(state.lines[from])
  )
}

export async function moveLine(
  store: EditLiteStore,
  from: number,
  to: number,
  onMoved: () => void,
): Promise<void> {
  if (!canMoveLine(store.getState(), from, to)) {
    return
  }
  store.dispatch({ type: 'moveStarted', index: from })
  let isRekeyed: boolean
  try {
    const outline = await store.getSource().moveLine(from, to)
    isRekeyed = hasSameLineCount(store.getState(), outline)
    store.dispatch({ type: 'lineMoved', from, to, outline })
  } catch (error) {
    store.dispatch({
      type: 'saveFailed',
      index: from,
      error: errorMessage(error),
    })
    return
  }
  if (isRekeyed) {
    onMoved()
  }
}

function createDefaultLine(state: EditLiteState, lastLine: Line | null): Line {
  return createDefaultLineFactory(
    lastLine,
    state.outline.lines.map((line) => line.number),
  )()
}

async function loadDefaultLine(
  store: EditLiteStore,
  lastIndex: number,
): Promise<Line> {
  const lastLine = await loadLine(store.getSource(), lastIndex)
  return createDefaultLine(store.getState(), lastLine)
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
      line: createDefaultLine(state, lastDraft),
    })
  } else {
    store.dispatch({ type: 'lineAddStarted' })
    void loadDefaultLine(store, lastIndex).then((line) =>
      store.dispatch({ type: 'lineAdded', line }),
    )
  }
}
