import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
  isLineDirty,
  lineChangedOnServerMessage,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'

const lines: readonly Line[] = buildEditLiteLines(5)
const savedLine: Line = setLineNumber(lines[0], '1a')
const draft: Line = setLineNumber(lines[3], '4a')
const linesWithoutSecond: readonly Line[] = [savedLine, ...lines.slice(2)]
const loadedState: EditLiteState = reduce(
  createEditLiteState(buildEditLiteOutline(lines)),
  { type: 'linesLoaded', offset: 0, lines },
  { type: 'lineChanged', index: 3, draft },
)

function reduce(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

function saveFirstLine(
  state: EditLiteState,
  serverLines: readonly Line[],
): EditLiteState {
  return editLiteReducer(state, {
    type: 'saveSucceeded',
    index: 0,
    outline: buildEditLiteOutline(serverLines),
    line: savedLine,
  })
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
    reduce(loadedState, {
      type: 'linesFailed',
      indices: [2],
      error: 'Network error',
    }),
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
    const waitingState = reduce(loadedState, action)
    const state = saveFirstLine(waitingState, linesWithoutSecond)

    expect(state.lines[2]).toBe(waitingState.lines[2])
    expect(state.lines[1]).toBeUndefined()
  },
)

test('saveSucceeded leaves a loading line alone that is past the new end', () => {
  const waitingState = reduce(loadedState, {
    type: 'linesRequested',
    indices: [4],
  })
  const state = saveFirstLine(waitingState, linesWithoutSecond)

  expect(state.lines[4]).toBe(waitingState.lines[4])
})
