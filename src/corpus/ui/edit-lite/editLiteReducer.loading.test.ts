import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesFailedActions,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { failedLine, readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(4)
const draft: Line = setLineNumber(lines[0], '1a')
const initialState: EditLiteState = createEditLiteState(
  buildEditLiteOutline(lines),
)
const draftedState: EditLiteState = reduceEditLite(
  initialState,
  ...buildLinesLoadedActions(0, lines.slice(0, 1)),
  { type: 'lineChanged', index: 0, draft },
)
const waitingState: EditLiteState = reduceEditLite(draftedState, {
  type: 'linesRequested',
  indices: [1, 3],
})
const settledStates: readonly [string, EditLiteState][] = [
  ['has no state', initialState],
  ['holds an unsaved draft', draftedState],
  [
    'is being saved',
    reduceEditLite(draftedState, { type: 'saveStarted', index: 0 }),
  ],
  [
    'is being deleted',
    reduceEditLite(draftedState, { type: 'deleteStarted', index: 0 }),
  ],
  [
    'is being moved',
    reduceEditLite(draftedState, { type: 'moveStarted', index: 0 }),
  ],
  [
    'could not be saved',
    reduceEditLite(draftedState, {
      type: 'saveFailed',
      index: 0,
      error: 'Conflict',
    }),
  ],
  [
    'could not be loaded',
    reduceEditLite(
      initialState,
      ...buildLinesFailedActions([0], 'Network error'),
    ),
  ],
]

describe.each(settledStates)('a line that %s', (_name, state) => {
  it('is not replaced by a line that arrives for its place', () => {
    expect(
      reduceEditLite(state, {
        type: 'linesLoaded',
        offset: 0,
        lines: lines.slice(0, 1),
      }),
    ).toBe(state)
  })

  it('is not marked as failed by a request that fails for its place', () => {
    expect(
      reduceEditLite(state, {
        type: 'linesFailed',
        indices: [0],
        error: 'Timeout',
      }),
    ).toBe(state)
  })
})

test('lines that arrive fill the places that wait for them and no other', () => {
  const state = reduceEditLite(waitingState, {
    type: 'linesLoaded',
    offset: 0,
    lines,
  })

  expect(state.lines).toEqual({
    0: waitingState.lines[0],
    1: readyLine(lines[1]),
    3: readyLine(lines[3]),
  })
  expect(state.lines[0]).toBe(waitingState.lines[0])
  expect(state.lines[0].draft).toBe(draft)
})

test('a failed request marks the places that wait for it and no other', () => {
  const state = reduceEditLite(waitingState, {
    type: 'linesFailed',
    indices: [0, 1, 2, 3],
    error: 'Timeout',
  })

  expect(state.lines).toEqual({
    0: waitingState.lines[0],
    1: failedLine('Timeout'),
    3: failedLine('Timeout'),
  })
  expect(state.lines[0]).toBe(waitingState.lines[0])
})
