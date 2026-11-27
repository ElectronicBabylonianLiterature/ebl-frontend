import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLineSavedActions,
  buildLinesFailedActions,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  isLineDirty,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { findMissingIndices } from 'corpus/ui/edit-lite/lineLoading'

const lines: readonly Line[] = buildEditLiteLines(5)
const savedLine: Line = setLineNumber(lines[0], '1a')
const draft: Line = setLineNumber(lines[3], '4a')
const linesWithoutSecond: readonly Line[] = [savedLine, ...lines.slice(2)]
const savedOutline: ChapterOutline = buildEditLiteOutline(
  [savedLine, ...lines.slice(1)],
  'revision-2',
)
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines),
  { type: 'lineChanged', index: 3, draft },
)
const storedState: EditLiteState = reduceEditLite(
  loadedState,
  ...buildLineSavedActions(0, savedOutline, savedLine).slice(0, 2),
)

function saveFirstLine(
  state: EditLiteState,
  serverLines: readonly Line[],
): EditLiteState {
  return reduceEditLite(
    state,
    ...buildLineSavedActions(0, buildEditLiteOutline(serverLines), savedLine),
  )
}

test('saveSucceeded forgets the clean lines whose outline changed', () => {
  const state = saveFirstLine(loadedState, linesWithoutSecond)

  expect(state.outline.lines.map((line) => line.number)).toEqual([
    '1a',
    '3',
    '4',
    '5',
  ])
  expect(Object.keys(state.lines)).toEqual(['0', '3'])
  expect(state.lines[0]).toEqual({
    status: 'ready',
    original: savedLine,
    draft: savedLine,
    error: null,
  })
})

test('saveSucceeded keeps the draft of a line whose outline changed', () => {
  const state = saveFirstLine(loadedState, linesWithoutSecond)

  expect(state.lines[3]).toEqual({
    status: 'failed',
    original: lines[3],
    draft,
    error: lineChangedOnServerMessage,
  })
  expect(isLineDirty(state.lines[3])).toBe(true)
})

test('saveSucceeded forgets a line that failed to load when its outline changed', () => {
  const state = saveFirstLine(
    reduceEditLite(
      loadedState,
      ...buildLinesFailedActions([2], 'Network error'),
    ),
    linesWithoutSecond,
  )

  expect(Object.keys(state.lines)).toEqual(['0', '3'])
})

test('saveSucceeded keeps the lines whose outline did not change', () => {
  const state = saveFirstLine(loadedState, [savedLine, ...lines.slice(1)])

  expect(Object.keys(state.lines)).toEqual(['0', '1', '2', '3', '4'])
  expect(state.lines[1]).toBe(loadedState.lines[1])
  expect(state.lines[2]).toBe(loadedState.lines[2])
  expect(state.lines[3]).toBe(loadedState.lines[3])
  expect(state.lines[4]).toBe(loadedState.lines[4])
})

test.each<[string, EditLiteAction]>([
  ['loading', { type: 'linesRequested', indices: [2, 4] }],
  ['saving', { type: 'saveStarted', index: 2 }],
])(
  'saveSucceeded leaves a %s line alone when its outline changed',
  (_status, action) => {
    const waitingState = reduceEditLite(loadedState, action)
    const state = saveFirstLine(waitingState, linesWithoutSecond)

    expect(state.lines[2]).toBe(waitingState.lines[2])
    expect(state.lines[1]).toBeUndefined()
  },
)

test('saveSucceeded leaves a loading line alone that is past the new end', () => {
  const waitingState = reduceEditLite(loadedState, {
    type: 'linesRequested',
    indices: [4],
  })
  const state = saveFirstLine(waitingState, linesWithoutSecond)

  expect(state.lines[4]).toBe(waitingState.lines[4])
})

test('the outline of a save is stored while the line is still being saved', () => {
  expect(storedState.outline.revision).toBe('revision-2')
  expect(storedState.outline.lines[0].number).toBe('1a')
  expect(storedState.lines[0]).toEqual({
    status: 'saving',
    original: lines[0],
    draft: lines[0],
    error: null,
  })
  expect(storedState.lines[3]).toBe(loadedState.lines[3])
})

test('saveSucceeded stores the reloaded line and leaves the outline as it is', () => {
  const laterState = reduceEditLite(storedState, {
    type: 'outlineReplaced',
    outline: { ...savedOutline, revision: 'revision-3' },
  })
  const state = reduceEditLite(laterState, {
    type: 'saveSucceeded',
    index: 0,
    line: savedLine,
  })

  expect(state.outline).toBe(laterState.outline)
  expect(state.outline.revision).toBe('revision-3')
  expect(state.lines[0]).toEqual({
    status: 'ready',
    original: savedLine,
    draft: savedLine,
    error: null,
  })
  expect(state.lines[1]).toBe(storedState.lines[1])
})

test('saveSucceeded without the reloaded line forgets the line so that it is requested again', () => {
  const state = reduceEditLite(storedState, {
    type: 'saveSucceeded',
    index: 0,
    line: null,
  })

  expect(Object.keys(state.lines)).toEqual(['1', '2', '3', '4'])
  expect(state.outline).toBe(storedState.outline)
  expect(state.lines[3]).toBe(storedState.lines[3])
  expect(findMissingIndices(state, 0, 5)).toEqual([0])
})

test.each<[string, Line | null]>([
  ['the reloaded line', savedLine],
  ['no reloaded line', null],
])(
  'saveSucceeded with %s leaves a line alone that is not being saved',
  (_name, line) => {
    const action: EditLiteAction = { type: 'saveSucceeded', index: 3, line }

    expect(reduceEditLite(storedState, action)).toBe(storedState)
    expect(reduceEditLite(storedState, { ...action, index: 9 })).toBe(
      storedState,
    )
  },
)
