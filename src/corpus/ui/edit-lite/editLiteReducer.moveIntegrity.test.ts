import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { findMissingIndices } from 'corpus/ui/edit-lite/lineLoading'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { findLineActivity, readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(6)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const fourthDraft: Line = setLineNumber(lines[3], '4a')
const lateDraft: Line = setLineNumber(lines[3], '4b')
const newLine: Line = setLineNumber(lines[5], '7')
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines.slice(0, 4)),
  { type: 'lineChanged', index: 0, draft: firstDraft },
  { type: 'lineChanged', index: 3, draft: fourthDraft },
  { type: 'linesRequested', indices: [4] },
  { type: 'lineAdded', line: newLine },
)

function move(
  from: number,
  to: number,
  returnedLines: readonly Line[],
): EditLiteState {
  return reduceEditLite(
    loadedState,
    { type: 'moveStarted', index: from },
    {
      type: 'lineMoved',
      from,
      to,
      outline: buildEditLiteOutline(returnedLines, 'revision-2'),
    },
  )
}

test('the drafts follow their lines when a line that is not loaded differs on the server', () => {
  const state = move(1, 2, [
    ...moveItem(lines, 1, 2).slice(0, 5),
    setLineNumber(lines[5], '6x'),
  ])

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3'])
  expect(state.lines[0]).toBe(loadedState.lines[0])
  expect(state.lines[1]).toBe(loadedState.lines[2])
  expect(state.lines[2]).toEqual(readyLine(lines[1]))
  expect(state.lines[3]).toBe(loadedState.lines[3])
  expect(state.outline.lines[5].number).toBe('6x')
})

test('a clean line that differs on the server is forgotten at its new place', () => {
  const state = move(0, 3, [
    lines[1],
    setLineNumber(lines[2], '3x'),
    lines[3],
    lines[0],
    ...lines.slice(4),
  ])

  expect(Object.keys(state.lines)).toEqual(['0', '2', '3'])
  expect(findMissingIndices(state, 0, 4)).toEqual([1])
  expect(state.lines[0]).toBe(loadedState.lines[1])
  expect(state.lines[2]).toBe(loadedState.lines[3])
  expect(state.lines[3]).toEqual({ ...readyLine(lines[0]), draft: firstDraft })
  expect(state.outline.lines[1].number).toBe('3x')
})

test('the draft of a line that differs on the server is flagged at its new place', () => {
  const state = move(0, 3, [
    lines[1],
    lines[2],
    setLineNumber(lines[3], '4z'),
    lines[0],
    ...lines.slice(4),
  ])

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3'])
  expect(state.lines[2]).toEqual({
    status: 'failed',
    original: lines[3],
    draft: fourthDraft,
    error: lineChangedOnServerMessage,
  })
  expect(state.lines[0]).toBe(loadedState.lines[1])
  expect(state.lines[1]).toBe(loadedState.lines[2])
  expect(state.lines[3]).toEqual({ ...readyLine(lines[0]), draft: firstDraft })
})

test('the draft of the moved line is flagged when the moved line differs on the server', () => {
  const state = move(0, 3, [
    ...lines.slice(1, 4),
    setLineNumber(lines[0], '1z'),
    ...lines.slice(4),
  ])

  expect(state.lines[3]).toEqual({
    status: 'failed',
    original: lines[0],
    draft: firstDraft,
    error: lineChangedOnServerMessage,
  })
  expect(state.lines[2]).toBe(loadedState.lines[3])
})

test.each<[string, readonly Line[], string[]]>([
  ['another order', moveItem(lines, 0, 2), ['0', '1', '2', '3']],
  ['the old order', lines, ['2', '3']],
])(
  'lines that come back in %s are moved as asked and settled where they differ',
  (_name, returnedLines, positions) => {
    const state = move(0, 3, returnedLines)

    expect(state.outline.lines.map((line) => line.number)).toEqual(
      returnedLines.map((line) => line.number),
    )
    expect(Object.keys(state.lines)).toEqual(positions)
    expect(state.lines[2]).toEqual({
      status: 'failed',
      original: lines[3],
      draft: fourthDraft,
      error: lineChangedOnServerMessage,
    })
    expect(state.lines[3]).toEqual({
      status: 'failed',
      original: lines[0],
      draft: firstDraft,
      error: lineChangedOnServerMessage,
    })
  },
)

test.each<[string, readonly Line[]]>([
  ['a line less', lines.slice(1)],
  ['a line more', [...lines, newLine]],
])(
  'every line is forgotten when the chapter comes back with %s',
  (_name, returnedLines) => {
    const state = move(0, 3, returnedLines)

    expect(state.lines).toEqual({})
    expect(state.outline.revision).toBe('revision-2')
    expect(state.outline.lines.map((line) => line.number)).toEqual(
      returnedLines.map((line) => line.number),
    )
    expect(state.outline.manuscripts).toBe(loadedState.outline.manuscripts)
  },
)

test.each<[string, readonly Line[]]>([
  ['the order that was asked for', moveItem(lines, 0, 3)],
  ['another order', moveItem(lines, 0, 2)],
  ['a line less', lines.slice(1)],
])(
  'a chapter that comes back with %s starts a new layout',
  (_name, returnedLines) => {
    const state = move(0, 3, returnedLines)

    expect(state.layoutVersion).toBe(1)
    expect(state.lines[4]).toBeUndefined()
    expect(state.newLine).toBe(loadedState.newLine)
    expect(findLineActivity(state)).toBe('idle')
  },
)

test('an edit made for the line that was at a position is not applied to the line that is there now', () => {
  const movedState = move(0, 3, moveItem(lines, 0, 3))
  const lateEdit: EditLiteAction = {
    type: 'lineChanged',
    index: 3,
    draft: lateDraft,
    original: lines[3],
  }

  expect(movedState.lines[3].original).toBe(lines[0])
  expect(movedState.lines[2].original).toBe(lines[3])
  expect(reduceEditLite(movedState, lateEdit)).toBe(movedState)
  expect(reduceEditLite(movedState, { ...lateEdit, original: null })).toBe(
    movedState,
  )
})

test('an edit is applied to the line it was made for', () => {
  const movedState = move(0, 3, moveItem(lines, 0, 3))
  const state = reduceEditLite(movedState, {
    type: 'lineChanged',
    index: 2,
    draft: lateDraft,
    original: lines[3],
  })

  expect(state.lines[2]).toEqual({
    status: 'ready',
    original: lines[3],
    draft: lateDraft,
    error: null,
  })
  expect(state.lines[3]).toBe(movedState.lines[3])
})

test('an edit of the new line is checked in the same way', () => {
  const edit: EditLiteAction = {
    type: 'lineChanged',
    index: 6,
    draft: setLineNumber(newLine, '8'),
    original: newLine,
  }

  expect(reduceEditLite(loadedState, edit).newLine?.draft?.number).toBe('8')
  expect(reduceEditLite(loadedState, { ...edit, original: lines[5] })).toBe(
    loadedState,
  )
})
