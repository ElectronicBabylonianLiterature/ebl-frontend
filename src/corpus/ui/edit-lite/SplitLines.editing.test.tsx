import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import * as editLiteReducer from 'corpus/ui/edit-lite/editLiteReducer'
import {
  button,
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

test('a draft survives selecting another line', async () => {
  const { getState } = renderSplit()
  const editor = await loadedEditor('1')
  await userEvent.type(within(editor).getByLabelText('Number'), 'a')

  expect(options()[0]).toHaveTextContent('edited')
  expect(options()[1]).not.toHaveTextContent('edited')

  await userEvent.click(options()[1])
  await loadedEditor('2')

  expect(options()[0]).toHaveTextContent('edited')
  expect(getState().lines[0].draft?.number).toBe('1a')

  await userEvent.click(options()[0])

  expect(within(await loadedEditor('1')).getByLabelText('Number')).toHaveValue(
    '1a',
  )
})

test('typing renders the option of the edited line only', async () => {
  const isLineDirty = jest.spyOn(editLiteReducer, 'isLineDirty')
  renderSplit()
  const editor = await loadedEditor('1')
  isLineDirty.mockClear()
  await userEvent.type(within(editor).getByLabelText('Number'), 'b')

  expect(
    new Set(
      isLineDirty.mock.calls.map(([lineState]) => lineState?.original?.number),
    ),
  ).toEqual(new Set(['1']))
})

test('a saved line keeps the selection and updates the list', async () => {
  const { source } = renderSplit()
  const editor = await loadedEditor('1')
  await userEvent.type(within(editor).getByLabelText('Number'), 'a')
  await userEvent.click(
    within(editor).getByRole('button', { name: 'Save line' }),
  )

  expect(await screen.findByRole('region', { name: 'Line 1a' })).toBe(editor)
  expect(selectedOptions()).toEqual([options()[0]])
  expect(options()[0]).toHaveTextContent('1a')
  expect(options()[0]).not.toHaveTextContent('edited')
  expect(source.saveLine).toHaveBeenCalledTimes(1)
})

test('the selection stays inside a chapter that became shorter', async () => {
  const lines = buildEditLiteLines()
  const { source } = renderSplit(2, { lines })
  const editor = await loadedEditor('3')
  source.saveLine.mockResolvedValueOnce(buildEditLiteOutline(lines.slice(0, 2)))
  await userEvent.type(within(editor).getByLabelText('Number'), 'a')
  await userEvent.click(
    within(editor).getByRole('button', { name: 'Save line' }),
  )

  expect(await screen.findByRole('region', { name: 'Line 2' })).toBeVisible()
  expect(options()).toHaveLength(2)
  expect(selectedOptions()).toEqual([options()[1]])
  expect(button('Next')).toBeDisabled()
})
