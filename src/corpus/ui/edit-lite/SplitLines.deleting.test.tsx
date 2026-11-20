import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)

async function deleteSelectedLine(): Promise<void> {
  await userEvent.click(button('Delete line'))
  await userEvent.click(
    within(screen.getByRole('dialog', { name: 'Delete line' })).getByRole(
      'button',
      { name: 'Delete line' },
    ),
  )
}

async function typeIntoNumber(lineNumber: string, text: string): Promise<void> {
  const editor = await loadedEditor(lineNumber)
  await userEvent.type(within(editor).getByLabelText('Number'), text)
}

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
