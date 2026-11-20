import _ from 'lodash'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  failedLine,
  findLineState,
  findNewLineIndex,
  hasLineChanged,
  loadingLine,
  readyLine,
} from 'corpus/ui/edit-lite/lineStates'
import {
  removeLine,
  replaceOutline,
  withLines,
} from 'corpus/ui/edit-lite/outlineChanges'

function withLine(
  state: EditLiteState,
  index: number,
  lineState: LineState,
): EditLiteState {
  return index === findNewLineIndex(state)
    ? { ...state, newLine: lineState }
    : withLines(state, [[index, lineState]])
}

function updateLine(
  state: EditLiteState,
  index: number,
  update: (lineState: LineState) => LineState,
): EditLiteState {
  const lineState = findLineState(state, index)
  return lineState === undefined
    ? state
    : withLine(state, index, update(lineState))
}

function changeLine(
  state: EditLiteState,
  index: number,
  draft: Line,
): EditLiteState {
  const lineState = findLineState(state, index)
  return lineState === undefined || lineState.original === null
    ? state
    : withLine(state, index, { ...lineState, draft })
}

function resetLine(state: EditLiteState, index: number): EditLiteState {
  const lineState: LineState | undefined = state.lines[index]
  if (index === findNewLineIndex(state)) {
    return state.newLine === null ? state : { ...state, newLine: null }
  }
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

function storeSavedNewLine(
  state: EditLiteState,
  savedOutline: ChapterOutline,
  line: Line | null,
): EditLiteState {
  const savedState = replaceOutline({ ...state, newLine: null }, savedOutline)
  return line === null
    ? savedState
    : withLines(savedState, [
        [savedState.outline.lines.length - 1, readyLine(line)],
      ])
}

function failLine(lineState: LineState, error: string): LineState {
  return { ...lineState, status: 'failed', error }
}

export function createEditLiteState(outline: ChapterOutline): EditLiteState {
  return {
    outline,
    lines: {},
    newLine: null,
    layoutVersion: 0,
    manuscriptsVersion: 0,
    hasUnsavedManuscripts: false,
  }
}

export function isLineDirty(lineState: LineState | undefined): boolean {
  return hasLineChanged(lineState)
}

type ActionHandler<Action> = (
  state: EditLiteState,
  action: Action,
) => EditLiteState

type ActionHandlers = {
  readonly [Type in EditLiteAction['type']]: ActionHandler<
    Extract<EditLiteAction, { readonly type: Type }>
  >
}

const actionHandlers: ActionHandlers = {
  linesRequested: (state, action) =>
    withLines(
      state,
      action.indices.map((index) => [index, loadingLine]),
    ),
  linesLoaded: (state, action) =>
    withLines(
      state,
      action.lines.map((line, position) => [
        action.offset + position,
        readyLine(line),
      ]),
    ),
  linesFailed: (state, action) =>
    withLines(
      state,
      action.indices.map((index) => [index, failedLine(action.error)]),
    ),
  lineChanged: (state, action) => changeLine(state, action.index, action.draft),
  lineReset: (state, action) => resetLine(state, action.index),
  saveStarted: (state, action) =>
    updateLine(state, action.index, (lineState) => ({
      ...lineState,
      status: 'saving',
      error: null,
    })),
  saveSucceeded: (state, action) =>
    withLines(replaceOutline(state, action.outline), [
      [action.index, readyLine(action.line)],
    ]),
  saveFailed: (state, action) =>
    updateLine(state, action.index, (lineState) =>
      failLine(lineState, action.error),
    ),
  lineAddStarted: (state) =>
    state.newLine === null ? { ...state, newLine: loadingLine } : state,
  lineAdded: (state, action) => ({ ...state, newLine: readyLine(action.line) }),
  newLineSaved: (state, action) =>
    storeSavedNewLine(state, action.outline, action.line),
  newLineSaveFailed: (state, action) =>
    state.newLine === null
      ? state
      : { ...state, newLine: failLine(state.newLine, action.error) },
  deleteStarted: (state, action) =>
    updateLine(state, action.index, (lineState) => ({
      ...lineState,
      status: 'deleting',
      error: null,
    })),
  lineDeleted: (state, action) =>
    removeLine(state, action.index, action.outline),
  outlineReplaced: (state, action) => replaceOutline(state, action.outline),
  manuscriptsSaved: (state, action) => ({
    ...replaceOutline(state, action.outline),
    manuscriptsVersion: state.manuscriptsVersion + 1,
    hasUnsavedManuscripts: false,
  }),
  manuscriptsEdited: (state, action) =>
    state.hasUnsavedManuscripts === action.hasUnsaved
      ? state
      : { ...state, hasUnsavedManuscripts: action.hasUnsaved },
}

export function editLiteReducer(
  state: EditLiteState,
  action: EditLiteAction,
): EditLiteState {
  const handle = actionHandlers[action.type] as ActionHandler<EditLiteAction>
  return handle(state, action)
}
