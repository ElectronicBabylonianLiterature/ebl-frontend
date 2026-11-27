import _ from 'lodash'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
  LineStatus,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  annotationHandlers,
  resetLoadedLine,
} from 'corpus/ui/edit-lite/annotationReducer'
import {
  hasAnnotationDraft,
  withOutdatedAnnotation,
} from 'corpus/ui/edit-lite/lineAnnotations'
import {
  failedLine,
  findLineState,
  findNewLineIndex,
  hasLineChanged,
  loadingLine,
  readyLine,
} from 'corpus/ui/edit-lite/lineStates'
import {
  LineStateEntry,
  moveLine,
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

function startLine(
  state: EditLiteState,
  index: number,
  status: LineStatus,
): EditLiteState {
  return updateLine(state, index, (lineState) => ({
    ...lineState,
    status,
    error: null,
  }))
}

function settleLoadingLines(
  state: EditLiteState,
  entries: readonly LineStateEntry[],
): EditLiteState {
  const awaitedEntries = entries.filter(
    ([index]) => state.lines[index]?.status === 'loading',
  )
  return awaitedEntries.length === 0 ? state : withLines(state, awaitedEntries)
}

function isEditedLine(
  lineState: LineState,
  original: Line | null | undefined,
): boolean {
  return (
    lineState.original !== null &&
    (original === undefined || original === lineState.original)
  )
}

function changeLine(
  state: EditLiteState,
  index: number,
  draft: Line,
  original: Line | null | undefined,
): EditLiteState {
  const lineState = findLineState(state, index)
  return lineState !== undefined &&
    isEditedLine(lineState, original) &&
    !hasAnnotationDraft(lineState)
    ? withLine(state, index, { ...lineState, draft })
    : state
}

function withoutLine(state: EditLiteState, index: number): EditLiteState {
  return { ...state, lines: _.omit(state.lines, index) }
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
    const resetState = resetLoadedLine(lineState, lineState.original)
    return resetState === null
      ? withoutLine(state, index)
      : withLines(state, [[index, resetState]])
  }
  return lineState.status === 'failed' ? withoutLine(state, index) : state
}

function settleSavedLine(
  state: EditLiteState,
  index: number,
  line: Line | null,
): EditLiteState {
  if (state.lines[index]?.status !== 'saving') {
    return state
  }
  return line === null
    ? withoutLine(state, index)
    : withLines(state, [[index, readyLine(line)]])
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
  ...annotationHandlers,
  linesRequested: (state, action) =>
    withLines(
      state,
      action.indices.map((index) => [index, loadingLine]),
    ),
  linesLoaded: (state, action) =>
    settleLoadingLines(
      state,
      action.lines.map((line, position) => [
        action.offset + position,
        readyLine(line),
      ]),
    ),
  linesFailed: (state, action) =>
    settleLoadingLines(
      state,
      action.indices.map((index) => [index, failedLine(action.error)]),
    ),
  lineChanged: (state, action) =>
    changeLine(state, action.index, action.draft, action.original),
  lineReset: (state, action) => resetLine(state, action.index),
  saveStarted: (state, action) => startLine(state, action.index, 'saving'),
  saveSucceeded: (state, action) =>
    settleSavedLine(state, action.index, action.line),
  saveFailed: (state, action) =>
    updateLine(state, action.index, (lineState) =>
      failLine(lineState, action.error),
    ),
  lineAddStarted: (state) =>
    state.newLine === null ? { ...state, newLine: loadingLine } : state,
  lineAdded: (state, action) => ({ ...state, newLine: readyLine(action.line) }),
  newLineSaved: (state, action) =>
    replaceOutline({ ...state, newLine: null }, action.outline),
  newLineSaveFailed: (state, action) =>
    state.newLine === null
      ? state
      : { ...state, newLine: failLine(state.newLine, action.error) },
  deleteStarted: (state, action) => startLine(state, action.index, 'deleting'),
  lineDeleted: (state, action) =>
    removeLine(state, action.index, action.outline),
  moveStarted: (state, action) => startLine(state, action.index, 'moving'),
  lineMoved: (state, action) =>
    moveLine(state, action.from, action.to, action.outline),
  outlineReplaced: (state, action) => replaceOutline(state, action.outline),
  instancesLemmatized: (state, action) => {
    const replaced = replaceOutline(state, action.outline)
    return {
      ...replaced,
      lines: _.mapValues(replaced.lines, withOutdatedAnnotation),
    }
  },
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
