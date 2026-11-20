import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import * as editLiteReducer from 'corpus/ui/edit-lite/editLiteReducer'
import {
  button,
  editors,
  listbox,
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

afterEach(() => {
  jest.restoreAllMocks()
})

async function newLineEditor(): Promise<HTMLElement> {
  const editor = screen.getByRole('region', { name: 'New line' })
  await within(editor).findByLabelText('Number')
  return editor
}

async function addLine(): Promise<HTMLElement> {
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  return newLineEditor()
}

test('Add line appends a line marked new, selects it and opens its editor', async () => {
  const { source, getState } = renderSplit()
  const editor = await addLine()

  expect(options()).toHaveLength(4)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(listbox()).toHaveAttribute('aria-activedescendant', options()[3].id)
  expect(options()[3]).toHaveTextContent(/^4%n/)
  expect(within(options()[3]).getByText('new')).toBeVisible()
  expect(within(options()[3]).queryByText('edited')).not.toBeInTheDocument()
  expect(within(editor).getByLabelText('Number')).toHaveValue('4')
  expect(within(editor).getByText('4 of 4')).toBeVisible()
  expect(editors()).toHaveLength(1)
  expect(editors()[0]).toHaveAccessibleName('Editor for the line at position 4')
  expect(getState().outline.lines).toHaveLength(3)
  expect(source.addLine).not.toHaveBeenCalled()
})

test('only one new line can be waiting at a time', async () => {
  await renderSplit()
  await addLine()

  expect(button('Add line')).toBeDisabled()
  expect(button('Next')).toBeDisabled()

  await userEvent.click(button('Previous'))
  await loadedEditor('3')

  expect(button('Add line')).toBeDisabled()
  expect(options()).toHaveLength(4)
})

test('the new line shows what is typed into it and renders no other option', async () => {
  const isLineDirty = jest.spyOn(editLiteReducer, 'isLineDirty')
  renderSplit()
  const editor = await addLine()
  isLineDirty.mockClear()
  await userEvent.type(within(editor).getByLabelText('Number'), 'b')

  expect(options()[3]).toHaveTextContent(/^4b%n/)
  expect(isLineDirty).not.toHaveBeenCalled()
})

test('the new line can be left and selected again like any line', async () => {
  renderSplit()
  const editor = await addLine()
  await userEvent.type(within(editor).getByLabelText('Number'), 'b')
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await userEvent.keyboard('{End}')

  expect(within(await newLineEditor()).getByLabelText('Number')).toHaveValue(
    '4b',
  )
  expect(selectedOptions()).toEqual([options()[3]])
})

test('discarding the new line returns to the last line', async () => {
  const { getState } = renderSplit()
  const editor = await addLine()
  await userEvent.click(
    within(editor).getByRole('button', { name: 'Discard new line' }),
  )
  await loadedEditor('3')

  expect(options()).toHaveLength(3)
  expect(selectedOptions()).toEqual([options()[2]])
  expect(button('Add line')).toBeEnabled()
  expect(screen.queryByText('new')).not.toBeInTheDocument()
  expect(getState().newLine).toBeNull()
})

test('a saved new line becomes the last line and stays selected', async () => {
  const { source } = renderSplit()
  const editor = await addLine()
  await userEvent.type(within(editor).getByLabelText('Number'), 'b')
  await userEvent.click(
    within(editor).getByRole('button', { name: 'Save line' }),
  )

  expect(await screen.findByRole('region', { name: 'Line 4b' })).toBe(editor)
  expect(options()).toHaveLength(4)
  expect(selectedOptions()).toEqual([options()[3]])
  expect(options()[3]).toHaveTextContent(/^4b%n/)
  expect(within(options()[3]).queryByText('new')).not.toBeInTheDocument()
  expect(button('Add line')).toBeEnabled()
  expect(source.addLine).toHaveBeenCalledTimes(1)

  await userEvent.click(button('Add line'))

  expect(within(await newLineEditor()).getByLabelText('Number')).toHaveValue('')
  expect(options()).toHaveLength(5)
})

test('an empty chapter can get its first line', async () => {
  const { source } = renderSplit(0, { lines: [] })
  await userEvent.click(button('Add line'))
  const editor = await newLineEditor()

  expect(
    screen.queryByText('This chapter has no lines.'),
  ).not.toBeInTheDocument()
  expect(options()).toHaveLength(1)
  expect(selectedOptions()).toEqual([options()[0]])
  expect(within(editor).getByText('1 of 1')).toBeVisible()
  expect(button('Previous')).toBeDisabled()
  expect(button('Next')).toBeDisabled()
  expect(source.loadLines).not.toHaveBeenCalled()

  await userEvent.click(
    within(editor).getByRole('button', { name: 'Discard new line' }),
  )

  expect(screen.getByText('This chapter has no lines.')).toBeVisible()
  expect(button('Add line')).toBeEnabled()
})

test.each([
  ['a chapter with lines', buildEditLiteLines()],
  ['an empty chapter', []],
])('a reader cannot add a line to %s', async (_name, lines) => {
  renderSplit(0, { lines, canWrite: false })
  await screen.findAllByText(/./)

  expect(
    screen.queryByRole('button', { name: 'Add line' }),
  ).not.toBeInTheDocument()
})
