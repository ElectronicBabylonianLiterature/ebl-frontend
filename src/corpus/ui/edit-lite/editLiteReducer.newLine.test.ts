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
import { loadingLine, readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines()
const newLine: Line = setLineNumber(lines[2], '4')
const newLineDraft: Line = setLineNumber(newLine, '4a')
const draft: Line = setLineNumber(lines[1], '2a')
const loadedState: EditLiteState = reduce(
  createEditLiteState(buildEditLiteOutline(lines)),
  { type: 'linesLoaded', offset: 0, lines },
  { type: 'lineChanged', index: 1, draft },
)
const addedState: EditLiteState = reduce(loadedState, {
  type: 'lineAdded',
  line: newLine,
})
const savedOutline = buildEditLiteOutline([...lines, newLineDraft])

function reduce(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

test('lineAddStarted shows a placeholder until the line is ready', () => {
  const startedState = reduce(loadedState, { type: 'lineAddStarted' })

  expect(startedState.newLine).toBe(loadingLine)
  expect(startedState.lines).toBe(loadedState.lines)
  expect(reduce(startedState, { type: 'lineAddStarted' })).toBe(startedState)
  expect(reduce(addedState, { type: 'lineAddStarted' })).toBe(addedState)
})

test('lineAdded stores the new line apart from the loaded lines', () => {
  expect(addedState.newLine).toEqual(readyLine(newLine))
  expect(addedState.lines).toBe(loadedState.lines)
  expect(addedState.outline).toBe(loadedState.outline)
})

test('the new line is changed at the position after the last line', () => {
  const changedState = reduce(addedState, {
    type: 'lineChanged',
    index: 3,
    draft: newLineDraft,
  })

  expect(changedState.newLine).toEqual({
    ...readyLine(newLine),
    draft: newLineDraft,
  })
  expect(changedState.lines).toBe(addedState.lines)
  expect(
    reduce(loadedState, { type: 'lineChanged', index: 3, draft: newLineDraft }),
  ).toBe(loadedState)
})

test('resetting the new line discards it', () => {
  const discardedState = reduce(addedState, { type: 'lineReset', index: 3 })

  expect(discardedState.newLine).toBeNull()
  expect(discardedState.lines[1].draft).toBe(draft)
  expect(reduce(loadedState, { type: 'lineReset', index: 3 })).toBe(loadedState)
})

test('saveStarted and newLineSaveFailed track the save of the new line', () => {
  const savingState = reduce(addedState, { type: 'saveStarted', index: 3 })
  const failedState = reduce(savingState, {
    type: 'newLineSaveFailed',
    error: 'Invalid line',
  })

  expect(savingState.newLine?.status).toBe('saving')
  expect(failedState.newLine).toEqual({
    status: 'failed',
    original: newLine,
    draft: newLine,
    error: 'Invalid line',
  })
  expect(
    reduce(loadedState, { type: 'newLineSaveFailed', error: 'Invalid line' }),
  ).toBe(loadedState)
})

test('newLineSaved turns the new line into the last line of the outline', () => {
  const savedState = reduce(
    addedState,
    { type: 'saveStarted', index: 3 },
    { type: 'newLineSaved', outline: savedOutline, line: newLineDraft },
  )

  expect(savedState.newLine).toBeNull()
  expect(savedState.outline.lines.map((line) => line.number)).toEqual([
    '1',
    '2',
    '3',
    '4a',
  ])
  expect(savedState.lines[3]).toEqual(readyLine(newLineDraft))
  expect(savedState.lines[1]).toBe(addedState.lines[1])
  expect(savedState.outline.lines[0]).toBe(addedState.outline.lines[0])
})

test('newLineSaved leaves the saved line to be loaded when it could not be reloaded', () => {
  const savedState = reduce(addedState, {
    type: 'newLineSaved',
    outline: savedOutline,
    line: null,
  })

  expect(savedState.newLine).toBeNull()
  expect(savedState.outline.lines).toHaveLength(4)
  expect(Object.keys(savedState.lines)).toEqual(['0', '1', '2'])
})
