import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { discardedChangesNote } from 'corpus/ui/edit-lite/LineEditToolbar'
import {
  button,
  confirmDeletion,
  deleteDialog,
  deleteSelectedLine,
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)

test('deleting a line selects the line that follows it', async () => {
  const { source } = renderSplit(1, { lines })
  await loadedEditor('2')
  await deleteSelectedLine()
  const editor = await loadedEditor('3')

  expect(source.deleteLine.mock.calls).toEqual([[1]])
  expect(options()).toHaveLength(4)
  expect(options().map((option) => option.textContent?.[0])).toEqual([
    '1',
    '3',
    '4',
    '5',
  ])
  expect(selectedOptions()).toEqual([options()[1]])
  expect(within(editor).getByText('2 of 4')).toBeVisible()
  expect(within(editor).getByLabelText('Number')).toHaveValue('3')
})

test('deleting the last line selects the line before it', async () => {
  renderSplit(4, { lines })
  await loadedEditor('5')
  await deleteSelectedLine()
  const editor = await loadedEditor('4')

  expect(options()).toHaveLength(4)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(editor).getByText('4 of 4')).toBeVisible()
  expect(button('Next')).toBeDisabled()
})

test('the dialog names the stored line when another number was typed and not saved', async () => {
  const { source } = renderSplit(2, { lines })
  const numberInput = within(await loadedEditor('3')).getByLabelText('Number')
  await userEvent.clear(numberInput)
  await userEvent.type(numberInput, '5')
  await userEvent.click(button('Delete line'))

  expect(screen.getByRole('heading', { name: 'Line 3' })).toBeVisible()
  expect(options()[2]).toHaveTextContent(/^3.*edited$/)
  expect(deleteDialog()).toHaveTextContent(
    `Delete line 3 from the chapter? Its variants and manuscript lines are removed with it. ${discardedChangesNote} This cannot be undone.`,
  )

  await confirmDeletion()
  await waitForOrder(['1', '2', '4', '5'])

  expect(source.deleteLine.mock.calls).toEqual([[2]])
})

test('the drafts of the other lines stay on their lines', async () => {
  const { getState } = renderSplit(0, { lines })
  await typeIntoNumber('1', 'a')
  await userEvent.click(options()[3])
  await typeIntoNumber('4', 'x')
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await deleteSelectedLine()
  await loadedEditor('3')

  expect(options().map((option) => option.textContent)).toEqual([
    expect.stringMatching(/^1.*edited$/),
    expect.not.stringContaining('edited'),
    expect.stringMatching(/^4.*edited$/),
    expect.not.stringContaining('edited'),
  ])
  expect(getState().lines[0].draft?.number).toBe('1a')
  expect(getState().lines[2].draft?.number).toBe('4x')
  expect(getState().lines[2].original).toBe(lines[3])

  await userEvent.click(options()[2])

  expect(
    within(screen.getByRole('region', { name: 'Line 4' })).getByLabelText(
      'Number',
    ),
  ).toHaveValue('4x')
})

test('nothing else can be saved or deleted while a line is being deleted', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.deleteLine)
  renderSplit(0, { source })
  await typeIntoNumber('1', 'a')
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await deleteSelectedLine()
  await userEvent.click(options()[0])
  const editor = within(await loadedEditor('1'))

  expect(editor.getByRole('button', { name: 'Save line' })).toBeDisabled()
  expect(editor.getByRole('button', { name: 'Delete line' })).toBeDisabled()
  expect(editor.getByRole('button', { name: 'Reset' })).toBeEnabled()
  expect(source.saveLine).not.toHaveBeenCalled()

  await act(async () => held.resolve())

  expect(await editor.findByRole('button', { name: 'Save line' })).toBeEnabled()
  expect(editor.getByRole('button', { name: 'Delete line' })).toBeEnabled()
  expect(options()).toHaveLength(4)
})

test('a line cannot be deleted while another line is being saved', async () => {
  const source = createFakeChapterEditSource({ lines })
  const saved = holdNextCall(source.saveLine)
  renderSplit(0, { source })
  await typeIntoNumber('1', 'a')
  await userEvent.click(button('Save line'))
  await userEvent.click(options()[1])
  await loadedEditor('2')

  expect(button('Delete line')).toBeDisabled()
  expect(button('Save line')).toBeDisabled()

  await act(async () => saved.resolve())

  await waitFor(() => expect(button('Delete line')).toBeEnabled())
  expect(options()[0]).toHaveTextContent(/^1a%n/)
  expect(options()[0]).not.toHaveTextContent('edited')
})
