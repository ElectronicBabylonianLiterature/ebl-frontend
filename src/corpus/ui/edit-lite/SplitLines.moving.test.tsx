import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  deleteSelectedLine,
  editors,
  listbox,
  listEnabledMoveButtons,
  loadedEditor,
  loadedNewLineEditor,
  moveButtonNames,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import {
  Deferred,
  holdNextCall,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

type Hold = (source: FakeChapterEditSource) => Deferred<void>

const lines: readonly Line[] = buildEditLiteLines(5)

async function saveFirstLine(): Promise<void> {
  await typeIntoNumber('1', 'a')
  await userEvent.click(button('Save line'))
}

async function deleteFirstLine(): Promise<void> {
  await loadedEditor('1')
  await deleteSelectedLine()
}

test.each<[string, number, string[], number, string]>([
  ['Move down', 2, ['1', '3', '2', '4', '5'], 3, 'Move down'],
  ['Move up', 0, ['2', '1', '3', '4', '5'], 1, 'Move to...'],
])(
  '%s moves the selected line by one place and keeps it selected',
  async (name, to, numbers, position, focusedButton) => {
    const { source } = renderSplit(1, { lines })
    await loadedEditor('2')
    await userEvent.click(button(name))
    await waitForOrder(numbers)
    const editor = await loadedEditor('2')

    expect(source.moveLine.mock.calls).toEqual([[1, to]])
    expect(selectedOptions()).toEqual([options()[to]])
    expect(listbox()).toHaveAttribute('aria-activedescendant', options()[to].id)
    expect(within(editor).getByText(`${position} of 5`)).toBeVisible()
    expect(within(editor).getByLabelText('Number')).toHaveValue('2')
    expect(within(editor).getByLabelText('Number')).toBeEnabled()
    expect(editors()).toHaveLength(1)
    expect(editors()[0]).toHaveAccessibleName(
      `Editor for the line at position ${position}`,
    )
    expect(button(focusedButton)).toHaveFocus()
    expect(screen.queryByText('edited')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  },
)

test('a line can be moved step by step to the end of the chapter', async () => {
  const { source } = renderSplit(2, { lines })
  await loadedEditor('3')
  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '2', '4', '3', '5'])
  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '2', '4', '5', '3'])

  expect(source.moveLine.mock.calls).toEqual([
    [2, 3],
    [3, 4],
  ])
  expect(selectedOptions()).toEqual([options()[4]])
  expect(listEnabledMoveButtons()).toEqual(['Move up', 'Move to...'])
  expect((await source.loadLines(0, 5)).map((line) => line.number)).toEqual([
    '1',
    '2',
    '4',
    '5',
    '3',
  ])
})

test.each<[string, number, number, readonly string[]]>([
  ['the first line', 5, 0, ['Move down', 'Move to...']],
  ['a line in the middle', 5, 2, moveButtonNames],
  ['the last line', 5, 4, ['Move up', 'Move to...']],
  ['the only line', 1, 0, []],
])(
  'the move buttons fit %s',
  async (_name, lineCount, index, enabledButtons) => {
    renderSplit(index, { lines: buildEditLiteLines(lineCount) })
    await loadedEditor(`${index + 1}`)

    expect(
      within(screen.getByRole('group', { name: 'Move line' })).getAllByRole(
        'button',
      ),
    ).toEqual(moveButtonNames.map(button))
    expect(listEnabledMoveButtons()).toEqual(enabledButtons)
  },
)

test('a line cannot be moved before it is loaded', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.loadLines)
  renderSplit(2, { source, lines })

  expect(screen.getByText('Loading line...')).toBeVisible()
  expect(listEnabledMoveButtons()).toEqual([])

  await act(async () => held.resolve())
  await loadedEditor('3')

  expect(listEnabledMoveButtons()).toEqual(moveButtonNames)
})

test('a line whose request failed cannot be moved', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  renderSplit(2, { source, lines })

  expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  expect(listEnabledMoveButtons()).toEqual([])
})

test.each<[string, Hold, () => Promise<void>, number]>([
  ['saved', (source) => holdNextCall(source.saveLine), saveFirstLine, 2],
  ['deleted', (source) => holdNextCall(source.deleteLine), deleteFirstLine, 1],
])(
  'no line can be moved while a line is being %s',
  async (_name, hold, start, position) => {
    const source = createFakeChapterEditSource({ lines })
    const held = hold(source)
    renderSplit(0, { source, lines })
    await start()

    expect(listEnabledMoveButtons()).toEqual([])

    await userEvent.click(options()[2])
    await loadedEditor('3')

    expect(listEnabledMoveButtons()).toEqual([])

    await act(async () => held.resolve())

    await waitFor(() =>
      expect(listEnabledMoveButtons()).toEqual(moveButtonNames),
    )
    expect(selectedOptions()).toEqual([options()[position]])
    expect(await loadedEditor('3')).toBeVisible()
    expect(source.moveLine).not.toHaveBeenCalled()
  },
)

test.each([
  ['a chapter with lines', buildEditLiteLines()],
  ['an empty chapter', []],
])('a reader cannot move a line of %s', async (_name, readerLines) => {
  renderSplit(0, { lines: readerLines, canWrite: false })
  await screen.findAllByText(/./)

  expect(
    screen.queryByRole('group', { name: 'Move line' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /^Move/ }),
  ).not.toBeInTheDocument()
})

test('the unsaved new line cannot be moved', async () => {
  const { source } = renderSplit(0, { lines })
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  await loadedNewLineEditor()

  expect(
    screen.queryByRole('group', { name: 'Move line' }),
  ).not.toBeInTheDocument()

  await userEvent.click(button('Previous'))
  await loadedEditor('5')

  expect(listEnabledMoveButtons()).toEqual(['Move up', 'Move to...'])

  await userEvent.click(button('Move up'))
  await waitForOrder(['1', '2', '3', '5', '4', '6'])

  expect(source.moveLine.mock.calls).toEqual([[4, 3]])
  expect(selectedOptions()).toEqual([options()[3]])
  expect(within(options()[5]).getByText('new')).toBeVisible()
})
