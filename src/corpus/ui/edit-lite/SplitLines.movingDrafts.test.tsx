import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  expectEditedLineStillSelected,
  listbox,
  listEnabledMoveButtons,
  loadedEditor,
  moveButtonNames,
  optionNumbers,
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
const movedOrder: readonly string[] = ['1', '3', '2', '4', '5']

test('while a line is moved it shows the progress and nothing can be saved', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.moveLine)
  renderSplit(0, { source, lines })
  await typeIntoNumber('1', 'a')
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  const movingEditor = within(await loadedEditor('2'))

  expect(movingEditor.getByText('Moving...')).toBeVisible()
  expect(movingEditor.getByLabelText('Number')).toBeDisabled()
  expect(movingEditor.getByRole('button', { name: 'Reset' })).toBeDisabled()
  expect(button('Save line')).toBeDisabled()
  expect(button('Delete line')).toBeDisabled()
  expect(listEnabledMoveButtons()).toEqual([])

  await userEvent.click(options()[0])
  const otherEditor = within(await loadedEditor('1'))

  expect(otherEditor.queryByText('Moving...')).not.toBeInTheDocument()
  expect(otherEditor.getByLabelText('Number')).toBeEnabled()
  expect(button('Save line')).toBeDisabled()
  expect(button('Delete line')).toBeDisabled()
  expect(listEnabledMoveButtons()).toEqual([])

  await userEvent.type(otherEditor.getByLabelText('Number'), 'b')
  await act(async () => held.resolve())
  await waitForOrder(movedOrder)

  expect(selectedOptions()).toEqual([options()[0]])
  expect(otherEditor.getByLabelText('Number')).toHaveValue('1ab')
  expect(button('Save line')).toBeEnabled()
  expect(button('Delete line')).toBeEnabled()
  expect(listEnabledMoveButtons()).toEqual(['Move down', 'Move to...'])
  expect(source.saveLine).not.toHaveBeenCalled()
})

test.each<[string, number, number]>([
  ['3', 2, 1],
  ['5', 4, 4],
  ['1', 0, 0],
])(
  'line %s selected and edited while another line is moved stays selected',
  async (lineNumber, index, movedIndex) => {
    const source = createFakeChapterEditSource({ lines })
    const held = holdNextCall(source.moveLine)
    const { getState } = renderSplit(1, { source, lines })
    await loadedEditor('2')
    await userEvent.click(button('Move down'))
    await userEvent.click(options()[index])
    await typeIntoNumber(lineNumber, 'x')
    const numberInput = screen.getByLabelText('Number')
    await act(async () => held.resolve())
    await waitForOrder(movedOrder)

    await expectEditedLineStillSelected(lineNumber, movedIndex, 5, numberInput)
    expect(getState().lines[movedIndex].draft?.number).toBe(`${lineNumber}xy`)
  },
)

test('the draft of a line follows it and is saved to its new place', async () => {
  const { source } = renderSplit(3, { lines })
  await typeIntoNumber('4', 'x')
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await userEvent.click(button('Move down'))
  await waitForOrder(['2', '1', '3', '4', '5'])
  await userEvent.click(button('Move down'))
  await waitForOrder(['2', '3', '1', '4', '5'])
  await userEvent.click(button('Move down'))
  await waitForOrder(['2', '3', '4', '1', '5'])

  expect(options().map((option) => option.textContent)).toEqual([
    expect.not.stringContaining('edited'),
    expect.not.stringContaining('edited'),
    expect.stringMatching(/^4.*edited$/),
    expect.not.stringContaining('edited'),
    expect.not.stringContaining('edited'),
  ])

  await userEvent.click(options()[2])
  const editor = await loadedEditor('4')

  expect(within(editor).getByLabelText('Number')).toHaveValue('4x')

  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('region', { name: 'Line 4x' })).toBe(editor)
  expect(source.saveLine.mock.calls).toEqual([
    [2, lines[3], expect.objectContaining({ number: '4x' })],
  ])
  expect((await source.loadLines(0, 5)).map((line) => line.number)).toEqual([
    '2',
    '3',
    '4x',
    '1',
    '5',
  ])
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('a move that fails shows the reason next to the line and can be repeated', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.moveLine.mockRejectedValueOnce(
    new Error('Invalid extent: the translation of line 1 ends before it'),
  )
  const { getState } = renderSplit(1, { source, lines })
  await typeIntoNumber('2', 'a')
  await userEvent.click(button('Move down'))
  const editor = within(await loadedEditor('2'))

  expect(await editor.findByRole('alert')).toHaveTextContent(
    'Invalid extent: the translation of line 1 ends before it',
  )
  expect(optionNumbers()).toEqual(['1', '2', '3', '4', '5'])
  expect(selectedOptions()).toEqual([options()[1]])
  expect(editor.getByLabelText('Number')).toHaveValue('2a')
  expect(getState().layoutVersion).toBe(0)
  expect(listEnabledMoveButtons()).toEqual(moveButtonNames)

  await userEvent.click(button('Move down'))
  await waitForOrder(movedOrder)

  expect(source.moveLine.mock.calls).toEqual([
    [1, 2],
    [1, 2],
  ])
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(selectedOptions()).toEqual([options()[2]])
  expect(within(await loadedEditor('2')).getByLabelText('Number')).toHaveValue(
    '2a',
  )
})

test('the button that moved a line gets the focus back when it was lost', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.moveLine)
  renderSplit(1, { source, lines })
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  act(() => {
    listbox().focus()
    listbox().blur()
  })

  expect(document.body).toHaveFocus()

  await act(async () => held.resolve())
  await waitForOrder(movedOrder)

  expect(button('Move down')).toHaveFocus()
})

test.each<[string, number, string[]]>([
  ['Move up', 1, ['2', '1', '3', '4', '5']],
  ['Move down', 3, ['1', '2', '3', '5', '4']],
])(
  '%s hands the focus on when the line cannot be moved further',
  async (name, index, order) => {
    renderSplit(index, { lines })
    await loadedEditor(`${index + 1}`)
    await userEvent.click(button(name))
    await waitForOrder(order)

    expect(button(name)).toBeDisabled()
    expect(button('Move to...')).toHaveFocus()
  },
)
