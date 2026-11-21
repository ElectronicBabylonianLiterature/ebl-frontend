import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { findMissingIndices } from 'corpus/ui/edit-lite/lineLoading'
import { loadingLine, readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines()
const newLine: Line = setLineNumber(lines[2], '4')
const newLineDraft: Line = setLineNumber(newLine, '4a')
const draft: Line = setLineNumber(lines[1], '2a')
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines),
  { type: 'lineChanged', index: 1, draft },
)
const addedState: EditLiteState = reduceEditLite(loadedState, {
  type: 'lineAdded',
  line: newLine,
})
const savedOutline = buildEditLiteOutline(
  [...lines, newLineDraft],
  'revision-2',
)

test('lineAddStarted shows a placeholder until the line is ready', () => {
  const startedState = reduceEditLite(loadedState, { type: 'lineAddStarted' })

  expect(startedState.newLine).toBe(loadingLine)
  expect(startedState.lines).toBe(loadedState.lines)
  expect(reduceEditLite(startedState, { type: 'lineAddStarted' })).toBe(
    startedState,
  )
  expect(reduceEditLite(addedState, { type: 'lineAddStarted' })).toBe(
    addedState,
  )
})

test('lineAdded stores the new line apart from the loaded lines', () => {
  expect(addedState.newLine).toEqual(readyLine(newLine))
  expect(addedState.lines).toBe(loadedState.lines)
  expect(addedState.outline).toBe(loadedState.outline)
})

test('the new line is changed at the position after the last line', () => {
  const changedState = reduceEditLite(addedState, {
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
    reduceEditLite(loadedState, {
      type: 'lineChanged',
      index: 3,
      draft: newLineDraft,
    }),
  ).toBe(loadedState)
})

test('resetting the new line discards it', () => {
  const discardedState = reduceEditLite(addedState, {
    type: 'lineReset',
    index: 3,
  })

  expect(discardedState.newLine).toBeNull()
  expect(discardedState.lines[1].draft).toBe(draft)
  expect(reduceEditLite(loadedState, { type: 'lineReset', index: 3 })).toBe(
    loadedState,
  )
})

test('saveStarted and newLineSaveFailed track the save of the new line', () => {
  const savingState = reduceEditLite(addedState, {
    type: 'saveStarted',
    index: 3,
  })
  const failedState = reduceEditLite(savingState, {
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
    reduceEditLite(loadedState, {
      type: 'newLineSaveFailed',
      error: 'Invalid line',
    }),
  ).toBe(loadedState)
})

test('newLineSaved turns the new line into the last line of the outline and leaves it to be loaded', () => {
  const savedState = reduceEditLite(
    addedState,
    { type: 'saveStarted', index: 3 },
    { type: 'newLineSaved', outline: savedOutline },
  )

  expect(savedState.newLine).toBeNull()
  expect(savedState.outline.revision).toBe('revision-2')
  expect(savedState.outline.lines.map((line) => line.number)).toEqual([
    '1',
    '2',
    '3',
    '4a',
  ])
  expect(Object.keys(savedState.lines)).toEqual(['0', '1', '2'])
  expect(findMissingIndices(savedState, 0, 4)).toEqual([3])
  expect(savedState.lines[1]).toBe(addedState.lines[1])
  expect(savedState.outline.lines[0]).toBe(addedState.outline.lines[0])
})
