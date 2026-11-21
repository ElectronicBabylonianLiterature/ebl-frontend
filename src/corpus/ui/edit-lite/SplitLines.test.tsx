import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  editors,
  listbox,
  loadedEditor,
  options,
  pressKeys,
  renderSplit,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

test('lists every line and edits the first one', async () => {
  const { source } = renderSplit()
  const editor = await loadedEditor('1')

  expect(options()).toHaveLength(3)
  expect(options()[0]).toHaveTextContent('When on high')
  expect(options()[1]).toHaveTextContent('2 variants')
  expect(selectedOptions()).toEqual([options()[0]])
  expect(listbox()).toHaveAttribute('aria-activedescendant', options()[0].id)
  expect(within(editor).getByLabelText('Number')).toHaveValue('1')
  expect(within(editor).getByText('1 of 3')).toBeVisible()
  expect(editors()).toHaveLength(1)
  expect(source.loadLines.mock.calls).toEqual([[0, 2]])
})

test('clicking an option edits that line and prefetches its neighbours', async () => {
  const { source } = renderSplit(undefined, { lines: buildEditLiteLines(6) })
  await loadedEditor('1')
  const firstEditor = editors()[0]
  await userEvent.click(options()[3])
  const editor = await loadedEditor('4')

  expect(selectedOptions()).toEqual([options()[3]])
  expect(listbox()).toHaveFocus()
  expect(listbox()).toHaveAttribute('aria-activedescendant', options()[3].id)
  expect(within(editor).getByLabelText('Number')).toHaveValue('4')
  expect(within(editor).getByText('4 of 6')).toBeVisible()
  expect(editors()).toHaveLength(1)
  expect(editors()[0]).not.toBe(firstEditor)
  expect(editors()[0]).toHaveAccessibleName('Editor for the line at position 4')
  expect(source.loadLines.mock.calls).toEqual([
    [0, 2],
    [2, 3],
  ])
})

test('the arrow keys move the selection one line at a time', async () => {
  const { source } = renderSplit()
  await loadedEditor('1')
  await userEvent.tab()

  expect(listbox()).toHaveFocus()

  await pressKeys('{ArrowDown}', '2')

  expect(selectedOptions()).toEqual([options()[1]])
  expect(listbox()).toHaveAttribute('aria-activedescendant', options()[1].id)
  expect(source.loadLines.mock.calls).toEqual([
    [0, 2],
    [2, 1],
  ])

  await pressKeys('{ArrowDown}{ArrowDown}', '3')

  expect(selectedOptions()).toEqual([options()[2]])

  await pressKeys('{ArrowUp}{ArrowUp}{ArrowUp}', '1')

  expect(selectedOptions()).toEqual([options()[0]])
  expect(editors()).toHaveLength(1)
  expect(source.loadLines).toHaveBeenCalledTimes(2)
})

test('Home, End and the page keys jump through the list', async () => {
  renderSplit(undefined, { lines: buildEditLiteLines(14) })
  await loadedEditor('1')
  await userEvent.tab()
  await pressKeys('{End}', '14')

  expect(selectedOptions()).toEqual([options()[13]])

  await pressKeys('{Home}', '1')

  expect(selectedOptions()).toEqual([options()[0]])

  await pressKeys('{PageDown}', '11')
  await pressKeys('{PageDown}', '14')
  await pressKeys('{PageUp}', '4')
  await pressKeys('{PageUp}', '1')

  expect(selectedOptions()).toEqual([options()[0]])
})

test('only the navigation keys are handled by the list', async () => {
  renderSplit()
  await loadedEditor('1')

  expect(fireEvent.keyDown(listbox(), { key: 'a' })).toBe(true)
  expect(selectedOptions()).toEqual([options()[0]])
  expect(fireEvent.keyDown(listbox(), { key: 'ArrowDown' })).toBe(false)
  expect(selectedOptions()).toEqual([options()[1]])

  await loadedEditor('2')
})

test('the previous and next buttons move the selection', async () => {
  renderSplit()
  await loadedEditor('1')

  expect(button('Previous')).toBeDisabled()

  await userEvent.click(button('Next'))
  await loadedEditor('2')

  expect(selectedOptions()).toEqual([options()[1]])
  expect(button('Previous')).toBeEnabled()

  await userEvent.click(button('Next'))
  await loadedEditor('3')

  expect(button('Next')).toBeDisabled()

  await userEvent.click(button('Previous'))
  await loadedEditor('2')

  expect(selectedOptions()).toEqual([options()[1]])
  expect(editors()).toHaveLength(1)
})

test('starts at the initial line', async () => {
  const { source } = renderSplit(2)
  const editor = await loadedEditor('3')

  expect(selectedOptions()).toEqual([options()[2]])
  expect(within(editor).getByLabelText('Number')).toHaveValue('3')
  expect(source.loadLines.mock.calls).toEqual([[1, 2]])
})

test.each([-1, 1.5, 3, Number.NaN])(
  'an initial line of %s starts at the first line',
  async (initialLine: number) => {
    renderSplit(initialLine)
    await loadedEditor('1')

    expect(selectedOptions()).toEqual([options()[0]])
  },
)

test('says so when the chapter has no lines', () => {
  const { source } = renderSplit(0, { lines: [] })

  expect(screen.getByText('This chapter has no lines.')).toBeVisible()
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(source.loadLines).not.toHaveBeenCalled()
})
