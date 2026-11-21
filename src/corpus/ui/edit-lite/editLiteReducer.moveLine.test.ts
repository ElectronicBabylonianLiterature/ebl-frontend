import _ from 'lodash'
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
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { failedLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(7)
const firstDraft: Line = setLineNumber(lines[0], '1a')
const fourthDraft: Line = setLineNumber(lines[3], '4a')
const newLine: Line = setLineNumber(lines[6], '8')
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines.slice(0, 5)),
  { type: 'lineChanged', index: 0, draft: firstDraft },
  { type: 'lineChanged', index: 3, draft: fourthDraft },
  { type: 'linesRequested', indices: [5] },
  ...buildLinesFailedActions([6], 'Network error'),
  { type: 'lineAdded', line: newLine },
  { type: 'manuscriptsEdited', hasUnsaved: true },
)
const moves: readonly [string, number, number][] = [
  ['down by one', 1, 2],
  ['up by one', 2, 1],
  ['far down', 0, 4],
  ['far up', 4, 0],
  ['to the end', 1, 6],
  ['up by two', 3, 1],
  ['over the lines that are not loaded', 3, 6],
]

function findPosition(state: EditLiteState, line: Line): number {
  return state.outline.lines.findIndex(
    (lineOutline) => lineOutline.number === line.number,
  )
}

function listStoredLines(state: EditLiteState): Line[] {
  return [...lines].sort(
    (first, second) => findPosition(state, first) - findPosition(state, second),
  )
}

function move(state: EditLiteState, from: number, to: number): EditLiteState {
  return reduceEditLite(
    state,
    { type: 'moveStarted', index: from },
    {
      type: 'lineMoved',
      from,
      to,
      outline: buildEditLiteOutline(
        moveItem(listStoredLines(state), from, to),
        'revision-2',
      ),
    },
  )
}

test('moveStarted marks the line as being moved', () => {
  const failedState = reduceEditLite(loadedState, {
    type: 'saveFailed',
    index: 3,
    error: 'Conflict',
  })
  const movingState = reduceEditLite(failedState, {
    type: 'moveStarted',
    index: 3,
  })

  expect(movingState.lines[3]).toEqual({
    status: 'moving',
    original: lines[3],
    draft: fourthDraft,
    error: null,
  })
  expect(movingState.outline).toBe(loadedState.outline)
  expect(reduceEditLite(loadedState, { type: 'moveStarted', index: 9 })).toBe(
    loadedState,
  )
})

test('a failed move keeps every line in its place and shows the error', () => {
  const failedState = reduceEditLite(
    loadedState,
    { type: 'moveStarted', index: 3 },
    { type: 'saveFailed', index: 3, error: 'The chapter was changed.' },
  )

  expect(failedState.lines[3]).toEqual({
    status: 'failed',
    original: lines[3],
    draft: fourthDraft,
    error: 'The chapter was changed.',
  })
  expect(failedState.outline).toBe(loadedState.outline)
  expect(failedState.layoutVersion).toBe(0)
  expect({ ...failedState.lines, 3: loadedState.lines[3] }).toEqual(
    loadedState.lines,
  )
})

describe.each(moves)('a line moved %s', (_name, from, to) => {
  const state = move(loadedState, from, to)

  it('takes over the order of the server without renumbering', () => {
    expect(state.outline.revision).toBe('revision-2')
    expect(state.outline.lines.map((line) => line.number)).toEqual(
      moveItem(lines, from, to).map((line) => line.number),
    )
    expect(state.outline.lines.map((line) => line.index)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ])
    expect(state.outline.manuscripts).toBe(loadedState.outline.manuscripts)
  })

  it('keeps the outline entries outside the moved range', () => {
    const first = Math.min(from, to)
    const last = Math.max(from, to)

    loadedState.outline.lines.forEach((line, index) => {
      expect(state.outline.lines[index] === line).toBe(
        index < first || index > last,
      )
    })
  })

  it('keeps the original and the draft of every line on its line', () => {
    lines.slice(0, 5).forEach((line, index) => {
      const lineState = state.lines[findPosition(state, line)]

      expect(lineState.original).toBe(line)
      expect(lineState.draft).toBe(loadedState.lines[index].draft)
    })
    expect(isLineDirty(state.lines[findPosition(state, lines[0])])).toBe(true)
    expect(isLineDirty(state.lines[findPosition(state, lines[3])])).toBe(true)
    expect(isLineDirty(state.lines[findPosition(state, lines[1])])).toBe(false)
  })

  it('leaves no line busy', () => {
    expect(
      Object.values(state.lines).map((lineState) => lineState.status),
    ).toEqual(['ready', 'ready', 'ready', 'ready', 'ready'])
    expect(state.lines[findPosition(state, lines[from])].error).toBeNull()
  })

  it('forgets the lines that were still being loaded or could not be loaded', () => {
    const missingPositions = _.sortBy(
      [lines[5], lines[6]].map((line) => findPosition(state, line)),
    )

    expect(loadedState.lines[5].status).toBe('loading')
    expect(loadedState.lines[6]).toEqual(failedLine('Network error'))
    expect(findMissingIndices(state, 0, 7)).toEqual(missingPositions)
    expect(Object.keys(state.lines)).toHaveLength(5)
  })

  it('starts a new layout and keeps what does not belong to a line', () => {
    expect(loadedState.layoutVersion).toBe(0)
    expect(state.layoutVersion).toBe(1)
    expect(move(state, to, from).layoutVersion).toBe(2)
    expect(state.newLine).toBe(loadedState.newLine)
    expect(state.manuscriptsVersion).toBe(0)
    expect(state.hasUnsavedManuscripts).toBe(true)
  })
})

test('a line moved down takes its unsaved draft along', () => {
  const state = move(loadedState, 0, 4)

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3', '4'])
  expect(state.lines[4]).toEqual({
    status: 'ready',
    original: lines[0],
    draft: firstDraft,
    error: null,
  })
  expect(state.lines[2]).toBe(loadedState.lines[3])
  expect(state.lines[2].draft).toBe(fourthDraft)
  expect(state.lines[0]).toBe(loadedState.lines[1])
})

test('a line moved up pushes the drafts between the two places down', () => {
  const state = move(loadedState, 4, 0)

  expect(state.lines[0].original).toBe(lines[4])
  expect(state.lines[1]).toBe(loadedState.lines[0])
  expect(state.lines[1].draft).toBe(firstDraft)
  expect(state.lines[4]).toBe(loadedState.lines[3])
  expect(state.lines[4].draft).toBe(fourthDraft)
})

test('moving a line there and back restores the places of all drafts', () => {
  const state = move(move(loadedState, 0, 4), 4, 0)

  expect(state.outline.lines).toEqual(loadedState.outline.lines)
  expect(state.lines[0].draft).toBe(firstDraft)
  expect(state.lines[3]).toBe(loadedState.lines[3])
  expect(state.lines[1]).toBe(loadedState.lines[1])
})

test.each<[string, number]>([
  ['is still being loaded', 5],
  ['could not be loaded', 6],
])('a moved line that %s is requested again', (_name, from) => {
  const state = move(loadedState, from, 2)

  expect(Object.keys(state.lines)).toEqual(['0', '1', '3', '4', '5'])
  expect(state.lines[2]).toBeUndefined()
  expect(state.lines[4]).toBe(loadedState.lines[3])
  expect(state.outline.lines[2].number).toBe(lines[from].number)
  expect(
    Object.values(state.lines).map((lineState) => lineState.status),
  ).not.toContain('moving')
})

test('a line whose save failed keeps its draft and its error when another line is moved', () => {
  const failedState = reduceEditLite(loadedState, {
    type: 'saveFailed',
    index: 3,
    error: 'Conflict',
  })
  const state = move(failedState, 0, 4)

  expect(state.lines[2]).toBe(failedState.lines[3])
  expect(state.lines[2]).toEqual({
    status: 'failed',
    original: lines[3],
    draft: fourthDraft,
    error: 'Conflict',
  })
})
