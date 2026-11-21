import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesFailedActions,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  isLineDirty,
} from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { findMissingIndices } from 'corpus/ui/edit-lite/lineLoading'
import { failedLine, readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(6)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const fourthDraft: Line = setLineNumber(lines[3], '4a')
const newLine: Line = setLineNumber(lines[5], '7')
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines.slice(0, 4)),
  { type: 'lineChanged', index: 0, draft: firstDraft },
  { type: 'lineChanged', index: 3, draft: fourthDraft },
  { type: 'linesRequested', indices: [4] },
  ...buildLinesFailedActions([5], 'Network error'),
  { type: 'lineAdded', line: newLine },
)
const outlineWithoutSecond = buildEditLiteOutline(
  lines.filter((_line, index) => index !== 1),
  'revision-2',
)

function deleteSecondLine(state: EditLiteState): EditLiteState {
  return reduceEditLite(
    state,
    { type: 'deleteStarted', index: 1 },
    { type: 'lineDeleted', index: 1, outline: outlineWithoutSecond },
  )
}

test('deleteStarted marks the line as being deleted', () => {
  const failedState = reduceEditLite(loadedState, {
    type: 'saveFailed',
    index: 1,
    error: 'Conflict',
  })
  const deletingState = reduceEditLite(failedState, {
    type: 'deleteStarted',
    index: 1,
  })

  expect(deletingState.lines[1]).toEqual({
    status: 'deleting',
    original: lines[1],
    draft: lines[1],
    error: null,
  })
  expect(reduceEditLite(loadedState, { type: 'deleteStarted', index: 9 })).toBe(
    loadedState,
  )
})

test('a failed deletion keeps the line and shows the error', () => {
  const failedState = reduceEditLite(
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
})

test('lineDeleted forgets the deleted line and the entries that hold no line', () => {
  const state = deleteSecondLine(loadedState)

  expect(loadedState.lines[4].status).toBe('loading')
  expect(loadedState.lines[5]).toEqual(failedLine('Network error'))
  expect(Object.keys(state.lines)).toEqual(['0', '1', '2'])
  expect(findMissingIndices(state, 0, 5)).toEqual([3, 4])
})

test('lineDeleted keeps a line whose save failed with its draft and its error', () => {
  const failedState = reduceEditLite(loadedState, {
    type: 'saveFailed',
    index: 3,
    error: 'Conflict',
  })
  const state = deleteSecondLine(failedState)

  expect(state.lines[2]).toBe(failedState.lines[3])
  expect(state.lines[2]).toEqual({
    status: 'failed',
    original: lines[3],
    draft: fourthDraft,
    error: 'Conflict',
  })
})

test('lineDeleted keeps the unsaved new line and starts a new layout', () => {
  const state = deleteSecondLine(loadedState)

  expect(state.newLine).toBe(loadedState.newLine)
  expect(loadedState.layoutVersion).toBe(0)
  expect(state.layoutVersion).toBe(1)
  expect(deleteSecondLine(state).layoutVersion).toBe(2)
})

test('deleting the last line leaves the other entries where they are', () => {
  const state = reduceEditLite(loadedState, {
    type: 'lineDeleted',
    index: 5,
    outline: buildEditLiteOutline(lines.slice(0, 5)),
  })

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3'])
  expect(state.lines[3]).toBe(loadedState.lines[3])
  expect(state.outline.lines).toHaveLength(5)
  expect(state.outline.lines[4]).toBe(loadedState.outline.lines[4])
})
