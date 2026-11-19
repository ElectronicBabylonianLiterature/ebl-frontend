import { useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  EditLiteActions,
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'

export interface EditLite {
  readonly state: EditLiteState
  readonly context: EditLiteContextValue
}

interface EditLiteStore {
  getState(): EditLiteState
  getSource(): ChapterEditSource
  dispatch(action: EditLiteAction): void
}

export const lineNotReturnedMessage =
  'The line was not returned by the data source.'
export const lineNotReloadedMessage =
  'The line was saved, but it could not be reloaded. Reload the page to continue editing it.'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function toContiguousRanges(indices: readonly number[]): number[][] {
  return _.sortBy(_.uniq(indices)).reduce<number[][]>((ranges, index) => {
    const lastRange = _.last(ranges)
    if (lastRange !== undefined && _.last(lastRange) === index - 1) {
      lastRange.push(index)
    } else {
      ranges.push([index])
    }
    return ranges
  }, [])
}

async function loadRange(
  store: EditLiteStore,
  indices: readonly number[],
): Promise<void> {
  const offset = indices[0]
  try {
    const lines = await store.getSource().loadLines(offset, indices.length)
    store.dispatch({
      type: 'linesLoaded',
      offset,
      lines: lines.slice(0, indices.length),
    })
    const missingIndices = indices.slice(lines.length)
    if (missingIndices.length > 0) {
      store.dispatch({
        type: 'linesFailed',
        indices: missingIndices,
        error: lineNotReturnedMessage,
      })
    }
  } catch (error) {
    store.dispatch({
      type: 'linesFailed',
      indices,
      error: errorMessage(error),
    })
  }
}

async function reloadSavedLine(
  source: ChapterEditSource,
  index: number,
): Promise<Line> {
  const [line] = await source
    .loadLines(index, 1)
    .catch((): readonly Line[] => [])
  if (line === undefined) {
    throw new Error(lineNotReloadedMessage)
  }
  return line
}

async function saveLine(
  store: EditLiteStore,
  index: number,
  original: Line,
  draft: Line,
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

function findMissingIndices(
  state: EditLiteState,
  offset: number,
  limit: number,
): number[] {
  return _.range(
    Math.max(offset, 0),
    Math.min(offset + limit, state.outline.lines.length),
  ).filter((index) => !(index in state.lines))
}

function createEditLiteActions(store: EditLiteStore): EditLiteActions {
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
      const lineState: LineState | undefined = store.getState().lines[index]
      if (
        lineState !== undefined &&
        lineState.original !== null &&
        lineState.draft !== null &&
        lineState.status !== 'saving'
      ) {
        void saveLine(store, index, lineState.original, lineState.draft)
      }
    },
  }
}

export default function useEditLite(
  source: ChapterEditSource,
  outline: ChapterOutline,
): EditLite {
  const [state, setState] = useState<EditLiteState>(() =>
    createEditLiteState(outline),
  )
  const stateRef = useRef<EditLiteState>(state)
  const sourceRef = useRef<ChapterEditSource>(source)
  sourceRef.current = source

  const [actions] = useState<EditLiteActions>(() =>
    createEditLiteActions({
      getState: (): EditLiteState => stateRef.current,
      getSource: (): ChapterEditSource => sourceRef.current,
      dispatch: (action: EditLiteAction): void => {
        stateRef.current = editLiteReducer(stateRef.current, action)
        setState(stateRef.current)
      },
    }),
  )

  const manuscripts = state.outline.manuscripts
  const context = useMemo<EditLiteContextValue>(
    () => ({
      kind: source.kind,
      canSave: source.canSave,
      manuscripts,
      actions,
      describeSave: (index, draft) => source.describeSave(index, draft),
    }),
    [source, manuscripts, actions],
  )

  return { state, context }
}
