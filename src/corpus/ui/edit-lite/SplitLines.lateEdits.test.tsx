import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  deleteSelectedLine,
  loadedEditor,
  options,
  renderSplit,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)

function changeValueAtOnce(input: HTMLElement, value: string): void {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

test('an edit that arrives between the answer to a move and the next render stays off the other line', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.moveLine)
  const { getState } = renderSplit(1, { source, lines })
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  await userEvent.click(options()[2])
  await typeIntoNumber('3', 'x')
  const numberInput = screen.getByLabelText('Number')

  await act(async () => {
    held.resolve()
    await source.moveLine.mock.results[0].value
    changeValueAtOnce(numberInput, '3xy')
  })
  await waitForOrder(['1', '3', '2', '4', '5'])

  expect(getState().lines[1].draft?.number).toBe('3x')
  expect(getState().lines[2].draft?.number).toBe('2')
  expect(screen.getAllByText('edited')).toHaveLength(1)
})

test('an edit that arrives between the answer to a delete and the next render stays off the other line', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.deleteLine)
  const { getState } = renderSplit(1, { source, lines })
  await loadedEditor('2')
  await deleteSelectedLine()
  await userEvent.click(options()[2])
  await typeIntoNumber('3', 'x')
  const numberInput = screen.getByLabelText('Number')

  await act(async () => {
    held.resolve()
    await source.deleteLine.mock.results[0].value
    changeValueAtOnce(numberInput, '3xy')
  })
  await waitForOrder(['1', '3', '4', '5'])

  expect(getState().lines[1].draft?.number).toBe('3x')
  expect(getState().lines[2].draft?.number).toBe('4')
  expect(screen.getAllByText('edited')).toHaveLength(1)
})
