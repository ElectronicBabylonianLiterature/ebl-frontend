import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  confirmDeletion,
  deleteDialog,
  deleteSelectedLine,
  expectEditedLineStillSelected,
  loadedEditor,
  loadedNewLineEditor,
  optionNumbers,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import {
  createDeferred,
  Deferred,
  holdNextCall,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(6)
const initialOrder: readonly string[] = ['1', '2', '3', '4', '5', '6']
const orderWithoutSecondLine: readonly string[] = ['1', '3', '4', '5', '6']

async function deleteSecondLine(source: FakeChapterEditSource): Promise<void> {
  renderSplit(1, { source, lines })
  await loadedEditor('2')
  await deleteSelectedLine()
}

async function holdDeletionOfSecondLine(): Promise<Deferred<void>> {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.deleteLine)
  await deleteSecondLine(source)
  return held
}

test.each<[string, number, number]>([
  ['4', 3, 2],
  ['6', 5, 4],
  ['1', 0, 0],
])(
  'line %s selected and edited while another line is deleted stays selected',
  async (lineNumber, index, shiftedIndex) => {
    const held = await holdDeletionOfSecondLine()
    await userEvent.click(options()[index])
    await typeIntoNumber(lineNumber, 'x')
    const numberInput = screen.getByLabelText('Number')
    await act(async () => held.resolve())
    await waitForOrder(orderWithoutSecondLine)

    await expectEditedLineStillSelected(
      lineNumber,
      shiftedIndex,
      5,
      numberInput,
    )
  },
)

test('Delete line names and deletes the line that was selected during another deletion', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.deleteLine)
  await deleteSecondLine(source)
  await userEvent.click(options()[3])
  await loadedEditor('4')
  await act(async () => held.resolve())
  await waitForOrder(orderWithoutSecondLine)
  await waitFor(() => expect(button('Delete line')).toBeEnabled())
  await userEvent.click(button('Delete line'))

  expect(deleteDialog()).toHaveTextContent('Delete line 4 from the chapter?')

  await confirmDeletion()
  await waitForOrder(['1', '3', '5', '6'])

  expect(source.deleteLine.mock.calls).toEqual([[1], [2]])
  expect(selectedOptions()).toEqual([options()[2]])
  expect(await loadedEditor('5')).toHaveTextContent('3 of 4')
})

test.each<[string, number, string, string]>([
  ['a line', 1, '3', '2 of 5'],
  ['the last line', 5, '5', '5 of 5'],
])(
  'deleting %s while it is selected opens a new editor for the line now at its place',
  async (_name, index, shownNumber, position) => {
    renderSplit(index, { lines })
    const deletedEditor = await loadedEditor(`${index + 1}`)
    const numberInput = within(deletedEditor).getByLabelText('Number')
    await deleteSelectedLine()
    await waitFor(() => expect(options()).toHaveLength(5))
    const editor = await loadedEditor(shownNumber)

    expect(selectedOptions()).toHaveLength(1)
    expect(selectedOptions()[0]).toHaveTextContent(
      new RegExp(`^${shownNumber}`),
    )
    expect(within(editor).getByText(position)).toBeVisible()
    expect(numberInput).not.toBeInTheDocument()
    expect(within(editor).getByLabelText('Number')).toHaveValue(shownNumber)
    expect(within(editor).getByLabelText('Number')).toBeEnabled()
  },
)

test('a deletion that fails leaves the selection and the drafts where they are', async () => {
  const source = createFakeChapterEditSource({ lines })
  const pending = createDeferred<ChapterOutline>()
  source.deleteLine.mockReturnValueOnce(pending.promise)
  const { getState } = renderSplit(1, { source, lines })
  await loadedEditor('2')
  await deleteSelectedLine()
  await userEvent.click(options()[3])
  await typeIntoNumber('4', 'x')
  const numberInput = screen.getByLabelText('Number')
  await act(async () => pending.reject(new Error('The chapter was changed.')))
  await waitFor(() => expect(button('Delete line')).toBeEnabled())
  await userEvent.keyboard('y')

  expect(optionNumbers()).toEqual(initialOrder)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(await loadedEditor('4')).getByLabelText('Number')).toBe(
    numberInput,
  )
  expect(numberInput).toHaveFocus()
  expect(numberInput).toHaveValue('4xy')
  expect(getState().layoutVersion).toBe(0)

  await userEvent.click(options()[1])

  expect(
    await within(await loadedEditor('2')).findByRole('alert'),
  ).toHaveTextContent('The chapter was changed.')
})

test('the new line selected and edited while a line is deleted stays selected', async () => {
  const held = await holdDeletionOfSecondLine()
  await userEvent.click(button('Add line'))
  const numberInput = within(await loadedNewLineEditor()).getByLabelText(
    'Number',
  )
  await userEvent.type(numberInput, 'x')
  await act(async () => held.resolve())
  await waitForOrder([...orderWithoutSecondLine, '7x'])
  await userEvent.keyboard('y')
  const editor = await loadedNewLineEditor()

  expect(selectedOptions()).toEqual([options()[5]])
  expect(within(options()[5]).getByText('new')).toBeVisible()
  expect(within(editor).getByLabelText('Number')).toBe(numberInput)
  expect(numberInput).toHaveFocus()
  expect(numberInput).toHaveValue('7xy')
  expect(within(editor).getByText('6 of 6')).toBeInTheDocument()
})
