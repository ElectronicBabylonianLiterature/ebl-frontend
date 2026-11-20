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
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(6)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const fourthDraft: Line = setLineNumber(lines[3], '4a')
const newLine: Line = setLineNumber(lines[5], '7')
const loadedState: EditLiteState = reduce(
  createEditLiteState(buildEditLiteOutline(lines)),
  { type: 'linesLoaded', offset: 0, lines: lines.slice(0, 4) },
  { type: 'lineChanged', index: 0, draft: firstDraft },
  { type: 'lineChanged', index: 3, draft: fourthDraft },
  { type: 'linesRequested', indices: [4] },
  { type: 'linesFailed', indices: [5], error: 'Network error' },
  { type: 'lineAdded', line: newLine },
)
const outlineWithoutSecond = buildEditLiteOutline(
  lines.filter((_line, index) => index !== 1),
  'revision-2',
)

function reduce(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

function deleteSecondLine(state: EditLiteState): EditLiteState {
  return reduce(
    state,
    { type: 'deleteStarted', index: 1 },
    { type: 'lineDeleted', index: 1, outline: outlineWithoutSecond },
  )
}

test('deleteStarted marks the line as being deleted', () => {
  const failedState = reduce(loadedState, {
    type: 'saveFailed',
    index: 1,
    error: 'Conflict',
  })
  const deletingState = reduce(failedState, { type: 'deleteStarted', index: 1 })

  expect(deletingState.lines[1]).toEqual({
    status: 'deleting',
    original: lines[1],
    draft: lines[1],
    error: null,
  })
  expect(reduce(loadedState, { type: 'deleteStarted', index: 9 })).toBe(
    loadedState,
  )
})

test('a failed deletion keeps the line and shows the error', () => {
  const failedState = reduce(
    loadedState,
    { type: 'deleteStarted', index: 1 },
    { type: 'saveFailed', index: 1, error: 'The chapter was changed.' },
  )

  expect(failedState.lines[1]).toEqual({
    status: 'failed',
    original: lines[1],
    draft: lines[1],
    error: 'The chapter was changed.',
  })
  expect(failedState.outline).toBe(loadedState.outline)
})

test('lineDeleted replaces the outline with the one without the line', () => {
  const state = deleteSecondLine(loadedState)

  expect(state.outline.revision).toBe('revision-2')
  expect(state.outline.lines.map((line) => line.number)).toEqual([
    '1',
    '3',
    '4',
    '5',
    '6',
  ])
  expect(state.outline.lines.map((line) => line.index)).toEqual([0, 1, 2, 3, 4])
  expect(state.outline.lines[0]).toBe(loadedState.outline.lines[0])
  expect(state.outline.manuscripts).toBe(loadedState.outline.manuscripts)
})

test('lineDeleted keeps the entries before the deleted line in place', () => {
  const state = deleteSecondLine(loadedState)

  expect(state.lines[0]).toBe(loadedState.lines[0])
  expect(state.lines[0].draft).toBe(firstDraft)
})

test('lineDeleted moves the entries after the deleted line down by one', () => {
  const state = deleteSecondLine(loadedState)

  expect(state.lines[1]).toBe(loadedState.lines[2])
  expect(state.lines[1]).toEqual(readyLine(lines[2]))
  expect(state.lines[2]).toBe(loadedState.lines[3])
  expect(state.lines[2].draft).toBe(fourthDraft)
  expect(isLineDirty(state.lines[2])).toBe(true)
  expect(state.lines[2].status).toBe('ready')
  expect(state.lines[4]).toBe(loadedState.lines[5])
})

test('lineDeleted forgets the deleted line and the lines still being loaded', () => {
  const state = deleteSecondLine(loadedState)

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '4'])
  expect(state.lines[3]).toBeUndefined()
})

test('lineDeleted keeps the unsaved new line and starts a new layout', () => {
  const state = deleteSecondLine(loadedState)

  expect(state.newLine).toBe(loadedState.newLine)
  expect(loadedState.layoutVersion).toBe(0)
  expect(state.layoutVersion).toBe(1)
  expect(deleteSecondLine(state).layoutVersion).toBe(2)
})

test('deleting the last line leaves the other entries where they are', () => {
  const state = reduce(loadedState, {
    type: 'lineDeleted',
    index: 5,
    outline: buildEditLiteOutline(lines.slice(0, 5)),
  })

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3'])
  expect(state.lines[3]).toBe(loadedState.lines[3])
  expect(state.outline.lines).toHaveLength(5)
  expect(state.outline.lines[4]).toBe(loadedState.outline.lines[4])
})
