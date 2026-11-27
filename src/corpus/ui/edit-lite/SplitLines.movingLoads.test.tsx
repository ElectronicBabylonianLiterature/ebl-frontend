import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { flushSync } from 'react-dom'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import {
  button,
  loadedEditor,
  moveSelectedLineTo,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import {
  createDeferred,
  holdNextAnswer,
  holdNextCall,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

type MoveCase = [
  string,
  () => Promise<void>,
  string[],
  number,
  number,
  number[][],
]

const lines: readonly Line[] = buildEditLiteLines(5)
const selectedPosition = 3
const moveCases: readonly MoveCase[] = [
  ['keeps its place', moveDown, ['2', '1', '3', '4', '5'], 3, 1, [[2, 3]]],
  [
    'changes its place',
    moveToTheEnd,
    ['2', '3', '4', '5', '1'],
    2,
    4,
    [[1, 3]],
  ],
]

async function moveDown(): Promise<void> {
  await userEvent.click(button('Move down'))
}

function moveToTheEnd(): Promise<void> {
  return moveSelectedLineTo('After line 5')
}

async function expectLineAndDraftInPlace(
  getState: () => EditLiteState,
  movedPosition: number,
  draftPosition: number,
): Promise<void> {
  const editor = await loadedEditor('4')

  expect(selectedOptions()).toEqual([options()[movedPosition]])
  expect(within(editor).getByLabelText('Number')).toHaveValue('4')
  expect(screen.queryByText('Loading line...')).not.toBeInTheDocument()
  expect(getState().lines[movedPosition].original).toBe(lines[3])
  expect(getState().lines[draftPosition].original).toBe(lines[0])
  expect(getState().lines[draftPosition].draft?.number).toBe('1x')
  expect(within(options()[draftPosition]).getByText('edited')).toBeVisible()
}

test.each(moveCases)(
  'a selected line that %s is loaded again after a move and the answer from before it is dropped',
  async (_name, startMove, order, movedPosition, draftPosition) => {
    const source = createFakeChapterEditSource({ lines })
    const answerBeforeMove = createDeferred<readonly Line[]>()
    const { getState } = renderSplit(0, { source, lines })
    await typeIntoNumber('1', 'x')
    const heldMove = holdNextCall(source.moveLine)
    await startMove()
    source.loadLines.mockReturnValueOnce(answerBeforeMove.promise)
    await userEvent.click(options()[selectedPosition])

    expect(screen.getByText('Loading line...')).toBeVisible()
    expect(source.loadLines).toHaveBeenLastCalledWith(2, 3)

    await act(async () => heldMove.resolve())
    await waitForOrder(order)
    await loadedEditor('4')
    await act(async () => answerBeforeMove.resolve(lines.slice(2)))

    await expectLineAndDraftInPlace(getState, movedPosition, draftPosition)
  },
)

test.each(moveCases)(
  'a line that %s is asked for once in the new order when it was asked for in the step that completed the move',
  async (_name, startMove, order, movedPosition, draftPosition, requests) => {
    const source = createFakeChapterEditSource({ lines })
    const { getState, getContext } = renderSplit(0, { source, lines })
    const ensureLines = jest.spyOn(getContext().actions, 'ensureLines')
    const requestsBeforeAnswer: number[][] = []
    await typeIntoNumber('1', 'x')
    const prepareAnswer = holdNextAnswer(source.moveLine)
    await startMove()
    const answerMove = await prepareAnswer()
    source.loadLines.mockClear()
    ensureLines.mockClear()
    await act(async () => {
      answerMove()
      flushSync(() => {
        fireEvent.click(options()[selectedPosition])
      })
      requestsBeforeAnswer.push(...ensureLines.mock.calls)
    })
    await waitForOrder(order)
    await expectLineAndDraftInPlace(getState, movedPosition, draftPosition)

    expect(requestsBeforeAnswer).toEqual([
      [selectedPosition, 1],
      [selectedPosition - 1, 3],
    ])
    expect(source.loadLines.mock.calls).toEqual(requests)
  },
)
