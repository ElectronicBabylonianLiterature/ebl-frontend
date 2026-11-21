import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  button,
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { findImplementation } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

type ChangeOutline = (outline: ChapterOutline) => ChapterOutline

const lines: readonly Line[] = buildEditLiteLines(5)
const askedOrder: readonly string[] = ['1', '3', '2', '4', '5']
const otherOrder: readonly string[] = ['1', '3', '4', '5', '2']

function createSourceMovingTo(target: number): FakeChapterEditSource {
  const source = createFakeChapterEditSource({ lines })
  const moveInSource = findImplementation(source.moveLine)
  source.moveLine.mockImplementationOnce((from: number) =>
    moveInSource(from, target),
  )
  return source
}

function createSourceAnswering(change: ChangeOutline): FakeChapterEditSource {
  const source = createFakeChapterEditSource({ lines })
  const moveInSource = findImplementation(source.moveLine)
  source.moveLine.mockImplementationOnce(async (from: number, to: number) =>
    change(await moveInSource(from, to)),
  )
  return source
}

function renameThirdLine(outline: ChapterOutline): ChapterOutline {
  return {
    ...outline,
    lines: outline.lines.map((line) =>
      line.number === '3' ? { ...line, number: '3z' } : line,
    ),
  }
}

function dropLastLine(outline: ChapterOutline): ChapterOutline {
  return { ...outline, lines: outline.lines.slice(0, 4) }
}

test.each<[string, number, readonly string[], string]>([
  ['the line that was moved', 2, askedOrder, '2'],
  ['the line that the server put there', 4, otherOrder, '4'],
])(
  'the selection goes to the place that was asked for and shows %s when the server moves the line to place %i',
  async (_name, target, order, selectedNumber) => {
    const source = createSourceMovingTo(target)
    renderSplit(1, { source, lines })
    await loadedEditor('2')
    await userEvent.click(button('Move down'))
    await waitForOrder(order)
    const editor = await loadedEditor(selectedNumber)

    expect(source.moveLine.mock.calls).toEqual([[1, 2]])
    expect(selectedOptions()).toEqual([options()[2]])
    expect(within(editor).getByLabelText('Number')).toHaveValue(selectedNumber)
    expect(within(editor).getByText('3 of 5')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  },
)

test('the draft of the moved line is flagged at the place that was asked for when the server puts another line there', async () => {
  const source = createSourceMovingTo(4)
  const { getState } = renderSplit(1, { source, lines })
  await typeIntoNumber('2', 'a')
  await userEvent.click(button('Move down'))
  await waitForOrder(otherOrder)

  expect(selectedOptions()).toEqual([options()[2]])
  expect(await screen.findByRole('alert')).toHaveTextContent(
    lineChangedOnServerMessage,
  )
  expect(screen.getByLabelText('Number')).toHaveValue('2a')
  expect(getState().lines[2].original).toBe(lines[1])
  expect(getState().lines[1].original).toBe(lines[2])
  expect(getState().lines[0].original).toBe(lines[0])
})

test('the selection and the drafts follow the move when a line that was not moved differs on the server', async () => {
  const source = createSourceAnswering(renameThirdLine)
  const { getState } = renderSplit(2, { source, lines })
  await typeIntoNumber('3', 'x')
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await userEvent.click(button('Move down'))
  await waitForOrder(['1', '3z', '2', '4', '5'])
  const editor = await loadedEditor('2')

  expect(selectedOptions()).toEqual([options()[2]])
  expect(within(editor).getByLabelText('Number')).toHaveValue('2')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(getState().lines[2].original).toBe(lines[1])
  expect(getState().lines[3].original).toBe(lines[3])
  expect(getState().lines[1]).toMatchObject({
    status: 'failed',
    original: lines[2],
    error: lineChangedOnServerMessage,
  })

  await userEvent.click(options()[1])
  const flaggedEditor = await loadedEditor('3z')

  expect(within(flaggedEditor).getByLabelText('Number')).toHaveValue('3x')
  expect(within(flaggedEditor).getByRole('alert')).toHaveTextContent(
    lineChangedOnServerMessage,
  )
})

test('the selection stays and every line is loaded again when the chapter comes back with another number of lines', async () => {
  const source = createSourceAnswering(dropLastLine)
  const { getState } = renderSplit(1, { source, lines })
  await typeIntoNumber('2', 'a')
  await userEvent.click(button('Move down'))
  await waitFor(() => expect(options()).toHaveLength(4))
  const editor = await loadedEditor('3')

  expect(selectedOptions()).toEqual([options()[1]])
  expect(within(editor).getByLabelText('Number')).toHaveValue('3')
  expect(within(editor).getByText('2 of 4')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(Object.values(getState().lines).map((line) => line.status)).toEqual([
    'ready',
    'ready',
    'ready',
  ])
})
