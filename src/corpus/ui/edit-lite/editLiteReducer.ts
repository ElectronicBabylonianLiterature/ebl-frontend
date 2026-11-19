import _ from 'lodash'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { areLinesEqual } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'

type LineStateEntry = readonly [number, LineState]

export const lineChangedOnServerMessage =
  'This line has changed on the server since it was loaded. Reload the chapter and apply your changes again.'

const loadingLine: LineState = {
  status: 'loading',
  original: null,
  draft: null,
  error: null,
}

function readyLine(line: Line): LineState {
  return { status: 'ready', original: line, draft: line, error: null }
}

function failedLine(error: string): LineState {
  return { status: 'failed', original: null, draft: null, error }
}

function withLines(
  state: EditLiteState,
  entries: readonly LineStateEntry[],
): EditLiteState {
  return {
    ...state,
    lines: { ...state.lines, ...Object.fromEntries(entries) },
  }
}

function updateLine(
  state: EditLiteState,
  index: number,
  update: (lineState: LineState) => LineState,
): EditLiteState {
  const lineState: LineState | undefined = state.lines[index]
  return lineState === undefined
    ? state
    : withLines(state, [[index, update(lineState)]])
}

function changeLine(
  state: EditLiteState,
  index: number,
  draft: Line,
): EditLiteState {
  const lineState: LineState | undefined = state.lines[index]
  return lineState === undefined || lineState.original === null
    ? state
    : withLines(state, [[index, { ...lineState, draft }]])
}

function resetLine(state: EditLiteState, index: number): EditLiteState {
  const lineState: LineState | undefined = state.lines[index]
  if (lineState === undefined) {
    return state
  }
  if (lineState.original !== null) {
    return withLines(state, [[index, readyLine(lineState.original)]])
  }
  return lineState.status === 'failed'
    ? { ...state, lines: _.omit(state.lines, index) }
    : state
}

function reuseEqualItems<Item>(
  previous: readonly Item[],
  next: readonly Item[],
): readonly Item[] {
  return _.isEqual(previous, next)
    ? previous
    : next.map((item, index) =>
        _.isEqual(item, previous[index]) ? previous[index] : item,
      )
}

function mergeOutline(
  previous: ChapterOutline,
  next: ChapterOutline,
): ChapterOutline {
  return {
    ...next,
    manuscripts: reuseEqualItems(previous.manuscripts, next.manuscripts),
    lines: reuseEqualItems(previous.lines, next.lines),
  }
}

export function createEditLiteState(outline: ChapterOutline): EditLiteState {
  return { outline, lines: {} }
}

export function isLineDirty(lineState: LineState | undefined): boolean {
  const original = lineState?.original ?? null
  const draft = lineState?.draft ?? null
  return (
    original !== null &&
    draft !== null &&
    draft !== original &&
    !areLinesEqual(original, draft)
  )
}

function reconcileLine(
  lineState: LineState,
  isOutlineUnchanged: boolean,
): LineState | null {
  if (
    isOutlineUnchanged ||
    lineState.status === 'loading' ||
    lineState.status === 'saving'
  ) {
    return lineState
  }
  return isLineDirty(lineState)
    ? { ...lineState, status: 'failed', error: lineChangedOnServerMessage }
    : null
}

function reconcileLines(
  state: EditLiteState,
  outline: ChapterOutline,
): readonly LineStateEntry[] {
  return Object.keys(state.lines)
    .map(Number)
    .flatMap((index): LineStateEntry[] => {
      const isOutlineUnchanged =
        index < outline.lines.length &&
        outline.lines[index] === state.outline.lines[index]
      const lineState = reconcileLine(state.lines[index], isOutlineUnchanged)
      return lineState === null ? [] : [[index, lineState]]
    })
}

function storeSavedLine(
  state: EditLiteState,
  index: number,
  savedOutline: ChapterOutline,
  line: Line,
): EditLiteState {
  const outline = mergeOutline(state.outline, savedOutline)
  return {
    outline,
    lines: Object.fromEntries([
      ...reconcileLines(state, outline),
      [index, readyLine(line)],
    ]),
  }
}

export function editLiteReducer(
  state: EditLiteState,
  action: EditLiteAction,
): EditLiteState {
  switch (action.type) {
    case 'linesRequested':
      return withLines(
        state,
        action.indices.map((index) => [index, loadingLine]),
      )
    case 'linesLoaded':
      return withLines(
        state,
        action.lines.map((line, position) => [
          action.offset + position,
          readyLine(line),
        ]),
      )
    case 'linesFailed':
      return withLines(
        state,
        action.indices.map((index) => [index, failedLine(action.error)]),
      )
    case 'lineChanged':
      return changeLine(state, action.index, action.draft)
    case 'lineReset':
      return resetLine(state, action.index)
    case 'saveStarted':
      return updateLine(state, action.index, (lineState) => ({
        ...lineState,
        status: 'saving',
        error: null,
      }))
    case 'saveSucceeded':
      return storeSavedLine(state, action.index, action.outline, action.line)
    case 'saveFailed':
      return updateLine(state, action.index, (lineState) => ({
        ...lineState,
        status: 'failed',
        error: action.error,
      }))
  }
}
