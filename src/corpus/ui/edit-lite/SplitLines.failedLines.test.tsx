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
  deleteSelectedLine,
  listEnabledMoveButtons,
  loadedEditor,
  loadedNewLineEditor,
  moveButtonNames,
  optionNumbers,
  options,
  renderSplit,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createDeferred } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

type Failure = [
  string,
  (source: FakeChapterEditSource, error: Error) => void,
  () => Promise<void>,
  string[],
]

const lines: readonly Line[] = buildEditLiteLines(5)
const refusal = 'Invalid extent 5 in line 2.'
const failures: readonly Failure[] = [
  [
    'move',
    (source, error): void => {
      source.moveLine.mockRejectedValueOnce(error)
    },
    (): Promise<void> => userEvent.click(button('Move down')),
    ['failed'],
  ],
  [
    'delete',
    (source, error): void => {
      source.deleteLine.mockRejectedValueOnce(error)
    },
    deleteSelectedLine,
    ['failed'],
  ],
  [
    'save',
    (source, error): void => {
      source.saveLine.mockRejectedValueOnce(error)
    },
    async (): Promise<void> => {
      await typeIntoNumber('2', 'x')
      await userEvent.click(button('Save line'))
    },
    ['edited', 'failed'],
  ],
]

function failedMarks(): HTMLElement[] {
  return screen.queryAllByText('failed')
}

test('a move that fails while another line is shown marks the line that was to move', async () => {
  const source = createFakeChapterEditSource({ lines })
  const pending = createDeferred<ChapterOutline>()
  source.moveLine.mockReturnValueOnce(pending.promise)
  renderSplit(1, { source, lines })
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  await userEvent.click(options()[3])
  await loadedEditor('4')

  expect(failedMarks()).toEqual([])

  await act(async () => pending.reject(new Error(refusal)))
  await waitFor(() => expect(listEnabledMoveButtons()).toEqual(moveButtonNames))

  expect(optionNumbers()).toEqual(['1', '2', '3', '4', '5'])
  expect(failedMarks()).toEqual([within(options()[1]).getByText('failed')])
  expect(failedMarks()[0]).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()

  await userEvent.click(options()[1])

  expect(
    await within(await loadedEditor('2')).findByRole('alert'),
  ).toHaveTextContent(refusal)

  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '3', '2', '4', '5'])

  expect(failedMarks()).toEqual([])
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test.each(failures)(
  'a %s that fails marks the line until it is reset',
  async (_name, refuse, change, badges) => {
    const source = createFakeChapterEditSource({ lines })
    refuse(source, new Error(refusal))
    renderSplit(1, { source, lines })
    await loadedEditor('2')
    await change()

    expect(await screen.findByRole('alert')).toHaveTextContent(refusal)
    expect(failedMarks()).toEqual([within(options()[1]).getByText('failed')])
    expect(
      badges.map((badge) => within(options()[1]).getByText(badge).className),
    ).toEqual(
      badges.map((badge) => `edit-lite-badge edit-lite-badge--${badge}`),
    )

    await userEvent.click(button('Reset'))

    expect(failedMarks()).toEqual([])
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(optionNumbers()).toEqual(['1', '2', '3', '4', '5'])
  },
)

test('a line that could not be loaded is not marked in the list', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  renderSplit(2, { source, lines })

  expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  expect(failedMarks()).toEqual([])
})

test('a new line that could not be saved is marked while another line is shown', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.addLine.mockRejectedValueOnce(new Error('Duplicate line numbers'))
  renderSplit(4, { source, lines })
  await loadedEditor('5')
  await userEvent.click(button('Add line'))
  const editor = await loadedNewLineEditor()
  await userEvent.click(button('Save line'))

  expect(await within(editor).findByRole('alert')).toHaveTextContent(
    'Duplicate line numbers',
  )

  await userEvent.click(options()[0])
  await loadedEditor('1')

  expect(failedMarks()).toEqual([within(options()[5]).getByText('failed')])
  expect(within(options()[5]).getByText('new')).toBeVisible()
})
