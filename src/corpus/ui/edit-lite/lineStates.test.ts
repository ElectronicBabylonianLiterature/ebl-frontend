import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  countLines,
  failedLine,
  findLineActivity,
  findLineState,
  findNewLineIndex,
  hasLineChanged,
  hasUnsavedChanges,
  loadingLine,
  readyLine,
} from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines()
const newLine: Line = setLineNumber(lines[2], '4')
const loadedState: EditLiteState = reduce(
  createEditLiteState(buildEditLiteOutline(lines)),
  { type: 'linesLoaded', offset: 0, lines },
)
const stateWithNewLine: EditLiteState = reduce(loadedState, {
  type: 'lineAdded',
  line: newLine,
})

function reduce(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

test('builds the states of a loading, a loaded and a failed line', () => {
  expect(loadingLine).toEqual({
    status: 'loading',
    original: null,
    draft: null,
    error: null,
  })
  expect(readyLine(lines[0])).toEqual({
    status: 'ready',
    original: lines[0],
    draft: lines[0],
    error: null,
  })
  expect(failedLine('Network error')).toEqual({
    status: 'failed',
    original: null,
    draft: null,
    error: 'Network error',
  })
})

test('a line has changed when its draft differs from the original', () => {
  const ready = readyLine(lines[0])

  expect(hasLineChanged(undefined)).toBe(false)
  expect(hasLineChanged(loadingLine)).toBe(false)
  expect(hasLineChanged(ready)).toBe(false)
  expect(hasLineChanged({ ...ready, draft: { ...lines[0] } })).toBe(false)
  expect(
    hasLineChanged({ ...ready, draft: setLineNumber(lines[0], '1a') }),
  ).toBe(true)
})

test('the new line sits after the last line of the outline', () => {
  expect(findNewLineIndex(loadedState)).toBe(3)
  expect(countLines(loadedState)).toBe(3)
  expect(countLines(stateWithNewLine)).toBe(4)
})

test('finds the state of a loaded line and of the new line by position', () => {
  expect(findLineState(loadedState, 1)).toBe(loadedState.lines[1])
  expect(findLineState(loadedState, 3)).toBeUndefined()
  expect(findLineState(loadedState, 7)).toBeUndefined()
  expect(findLineState(stateWithNewLine, 3)).toBe(stateWithNewLine.newLine)
  expect(findLineState(stateWithNewLine, 2)).toBe(stateWithNewLine.lines[2])
})

test.each<[string, readonly EditLiteAction[], string]>([
  ['nothing is pending', [], 'idle'],
  ['a line is saved', [{ type: 'saveStarted', index: 1 }], 'saving'],
  ['the new line is saved', [{ type: 'saveStarted', index: 3 }], 'saving'],
  ['a line is deleted', [{ type: 'deleteStarted', index: 1 }], 'deleting'],
  [
    'a line is deleted while another is saved',
    [
      { type: 'saveStarted', index: 0 },
      { type: 'deleteStarted', index: 1 },
    ],
    'deleting',
  ],
])('the lines are busy as far as %s', (_name, actions, activity) => {
  expect(findLineActivity(reduce(stateWithNewLine, ...actions))).toBe(activity)
})

test.each<[string, EditLiteState, boolean]>([
  ['nothing was changed', loadedState, false],
  ['a new line is waiting', stateWithNewLine, true],
  [
    'a line has a draft',
    reduce(loadedState, {
      type: 'lineChanged',
      index: 1,
      draft: setLineNumber(lines[1], '2a'),
    }),
    true,
  ],
  [
    'the manuscripts were edited',
    reduce(loadedState, { type: 'manuscriptsEdited', hasUnsaved: true }),
    true,
  ],
  [
    'a draft was reset',
    reduce(
      loadedState,
      { type: 'lineChanged', index: 1, draft: setLineNumber(lines[1], '2a') },
      { type: 'lineReset', index: 1 },
    ),
    false,
  ],
])('has unsaved changes when %s: %#', (_name, state, expected) => {
  expect(hasUnsavedChanges(state)).toBe(expected)
})
