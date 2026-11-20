import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
  isLineDirty,
} from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'

const lines: readonly Line[] = buildEditLiteLines()
const outline: ChapterOutline = buildEditLiteOutline(lines)
const initialState: EditLiteState = createEditLiteState(outline)
const loadedState: EditLiteState = editLiteReducer(initialState, {
  type: 'linesLoaded',
  offset: 0,
  lines: lines.slice(0, 2),
})
const changedLine: Line = setLineNumber(lines[0], '1a')
const changedState: EditLiteState = editLiteReducer(loadedState, {
  type: 'lineChanged',
  index: 0,
  draft: changedLine,
})
const loadingLine: LineState = {
  status: 'loading',
  original: null,
  draft: null,
  error: null,
}

function readyLine(line: Line): LineState {
  return { status: 'ready', original: line, draft: line, error: null }
}

test('createEditLiteState starts without loaded lines', () => {
  expect(initialState).toEqual({
    outline,
    lines: {},
    newLine: null,
    layoutVersion: 0,
    manuscriptsVersion: 0,
    hasUnsavedManuscripts: false,
  })
})

test('linesRequested marks the indices as loading', () => {
  const state = editLiteReducer(loadedState, {
    type: 'linesRequested',
    indices: [2, 5],
  })

  expect(state.lines).toEqual({
    ...loadedState.lines,
    2: loadingLine,
    5: loadingLine,
  })
})

test('linesLoaded stores the lines from the offset on', () => {
  const state = editLiteReducer(initialState, {
    type: 'linesLoaded',
    offset: 1,
    lines: lines.slice(1),
  })

  expect(state.lines).toEqual({
    1: readyLine(lines[1]),
    2: readyLine(lines[2]),
  })
  expect(state.outline).toBe(outline)
})

test('linesFailed stores the error for every index', () => {
  const state = editLiteReducer(initialState, {
    type: 'linesFailed',
    indices: [0, 1],
    error: 'Network error',
  })
  const failedLine: LineState = {
    status: 'failed',
    original: null,
    draft: null,
    error: 'Network error',
  }

  expect(state.lines).toEqual({ 0: failedLine, 1: failedLine })
})

test('lineChanged replaces the draft and keeps the original', () => {
  expect(changedState.lines[0]).toEqual({
    status: 'ready',
    original: lines[0],
    draft: changedLine,
    error: null,
  })
  expect(changedState.lines[1]).toBe(loadedState.lines[1])
})

test.each([
  ['an unknown line', initialState],
  [
    'a line that is still loading',
    editLiteReducer(initialState, { type: 'linesRequested', indices: [0] }),
  ],
])('lineChanged ignores %s', (_description, state) => {
  expect(
    editLiteReducer(state, { type: 'lineChanged', index: 0, draft: lines[0] }),
  ).toBe(state)
})

test('lineReset restores the original', () => {
  const state = editLiteReducer(changedState, { type: 'lineReset', index: 0 })

  expect(state.lines[0]).toEqual(readyLine(lines[0]))
})

test('lineReset clears a failed save', () => {
  const failedState = editLiteReducer(changedState, {
    type: 'saveFailed',
    index: 0,
    error: 'Conflict',
  })

  expect(
    editLiteReducer(failedState, { type: 'lineReset', index: 0 }).lines[0],
  ).toEqual(readyLine(lines[0]))
})

test('lineReset forgets a line that failed to load', () => {
  const failedState = editLiteReducer(loadedState, {
    type: 'linesFailed',
    indices: [2],
    error: 'Network error',
  })

  expect(
    editLiteReducer(failedState, { type: 'lineReset', index: 2 }).lines,
  ).toEqual(loadedState.lines)
})

test.each([
  ['an unknown line', initialState],
  [
    'a line that is still loading',
    editLiteReducer(initialState, { type: 'linesRequested', indices: [0] }),
  ],
])('lineReset ignores %s', (_description, state) => {
  expect(editLiteReducer(state, { type: 'lineReset', index: 0 })).toBe(state)
})

test('saveStarted marks the line as saving and clears the error', () => {
  const failedState = editLiteReducer(changedState, {
    type: 'saveFailed',
    index: 0,
    error: 'Conflict',
  })

  expect(
    editLiteReducer(failedState, { type: 'saveStarted', index: 0 }).lines[0],
  ).toEqual({
    status: 'saving',
    original: lines[0],
    draft: changedLine,
    error: null,
  })
})

test('saveFailed keeps the draft and stores the error', () => {
  expect(
    editLiteReducer(changedState, {
      type: 'saveFailed',
      index: 0,
      error: 'Conflict',
    }).lines[0],
  ).toEqual({
    status: 'failed',
    original: lines[0],
    draft: changedLine,
    error: 'Conflict',
  })
})

test.each([
  [{ type: 'saveStarted', index: 7 } as const],
  [{ type: 'saveFailed', index: 7, error: 'Conflict' } as const],
])('%o ignores an unknown line', (action) => {
  expect(editLiteReducer(loadedState, action)).toBe(loadedState)
})

test('saveSucceeded stores the saved line and the new outline', () => {
  const savedLines = [changedLine, ...lines.slice(1)]
  const savedOutline = buildEditLiteOutline(savedLines)
  const state = editLiteReducer(changedState, {
    type: 'saveSucceeded',
    index: 0,
    outline: { ...savedOutline, manuscripts: [...savedOutline.manuscripts] },
    line: changedLine,
  })

  expect(state.outline).toEqual(savedOutline)
  expect(state.lines[0]).toEqual(readyLine(changedLine))
  expect(state.lines[1]).toBe(changedState.lines[1])
  expect(state.outline.manuscripts).toBe(outline.manuscripts)
  expect(state.outline.lines[0]).not.toBe(outline.lines[0])
  expect(state.outline.lines[1]).toBe(outline.lines[1])
  expect(state.outline.lines[2]).toBe(outline.lines[2])
})

test('saveSucceeded reuses the line outlines when nothing changed', () => {
  const state = editLiteReducer(loadedState, {
    type: 'saveSucceeded',
    index: 0,
    outline: buildEditLiteOutline(lines),
    line: lines[0],
  })

  expect(state.outline.lines).toBe(outline.lines)
})

test.each<[string, LineState | undefined, boolean]>([
  ['an unknown line', undefined, false],
  ['a loading line', loadingLine, false],
  ['an untouched line', loadedState.lines[0], false],
  ['a changed line', changedState.lines[0], true],
  [
    'a line changed back to its original content',
    { ...loadedState.lines[0], draft: setLineNumber(changedLine, '1') },
    false,
  ],
])('isLineDirty of %s', (_description, lineState, expected) => {
  expect(isLineDirty(lineState)).toBe(expected)
})

test('a reset line is not dirty', () => {
  const state = editLiteReducer(changedState, { type: 'lineReset', index: 0 })

  expect(isLineDirty(changedState.lines[0])).toBe(true)
  expect(isLineDirty(state.lines[0])).toBe(false)
})
