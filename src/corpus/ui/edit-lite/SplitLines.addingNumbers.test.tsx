import { waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  listEnabledMoveButtons,
  loadedEditor,
  loadedNewLineEditor,
  moveSelectedLineTo,
  renderSplit,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)

async function addLine(): Promise<HTMLElement> {
  await userEvent.click(button('Add line'))
  return within(await loadedNewLineEditor()).getByLabelText('Number')
}

test('a line that was appended and moved to its place is not proposed again', async () => {
  const { source } = renderSplit(4, { lines })
  await loadedEditor('5')

  expect(await addLine()).toHaveValue('6')

  await userEvent.click(button('Save line'))
  await loadedEditor('6')
  await waitFor(() =>
    expect(listEnabledMoveButtons()).toEqual(['Move up', 'Move to...']),
  )
  await moveSelectedLineTo('After line 2')
  await waitForOrder(['1', '2', '6', '3', '4', '5'])

  expect(await addLine()).toHaveValue('7')
  expect(source.addLine).toHaveBeenCalledTimes(1)
})

test.each<[string, number, string, string[]]>([
  [
    'the last line was moved to the beginning',
    4,
    'At the beginning',
    ['5', '1', '2', '3', '4'],
  ],
  [
    'the first line was moved to the end',
    0,
    'After line 5',
    ['2', '3', '4', '5', '1'],
  ],
  ['a line was moved to the end', 2, 'After line 5', ['1', '2', '4', '5', '3']],
])(
  'when %s the new line gets the first number that no line has',
  async (_name, index, place, order) => {
    renderSplit(index, { lines })
    await loadedEditor(`${index + 1}`)
    await moveSelectedLineTo(place)
    await waitForOrder(order)

    expect(await addLine()).toHaveValue('6')
  },
)
