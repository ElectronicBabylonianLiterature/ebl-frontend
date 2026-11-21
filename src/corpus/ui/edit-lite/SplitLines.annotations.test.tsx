import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  listDisabledViews,
  manuscriptRow,
  omitWord,
  openLoadedView,
  selectedView,
  viewPanel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  button,
  confirmDeletion,
  listEnabledMoveButtons,
  loadedEditor,
  moveSelectedLineTo,
  options,
  renderSplit,
  selectedOptions,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(5)
const draftIndex = 3

async function draftAlignment(source: FakeChapterEditSource): Promise<void> {
  renderSplit(draftIndex, { source, lines })
  await loadedEditor('4')
  await openLoadedView('Alignment')
  await omitWord(manuscriptRow(1), 'of')
}

function omittedWord(): HTMLElement {
  return within(manuscriptRow(1)).getByText('of', { selector: 'div' })
}

async function listOmittedWords(
  source: FakeChapterEditSource,
): Promise<[string, readonly number[]][]> {
  const storedLines = await source.loadLines(0, lines.length)
  return storedLines.map((line) => [
    line.number,
    line.variants[0].manuscripts[0].omittedWords,
  ])
}

async function selectDraftLine(position: number): Promise<void> {
  await userEvent.click(options()[position])
  await within(screen.getByRole('region', { name: 'Line 4' })).findByRole(
    'group',
    { name: 'Reconstruction' },
  )
}

async function saveAlignment(): Promise<void> {
  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
}

test('an alignment draft marks its line as edited and comes back with its view', async () => {
  const source = createFakeChapterEditSource({ lines })
  await draftAlignment(source)

  expect(within(options()[draftIndex]).getByText('edited')).toBeVisible()
  expect(screen.getAllByText('edited')).toHaveLength(1)

  await userEvent.click(options()[0])
  await loadedEditor('1')

  expect(selectedView()).toBe('Text')
  expect(listDisabledViews()).toEqual([])

  await selectDraftLine(draftIndex)

  expect(selectedView()).toBe('Alignment')
  expect(omittedWord()).toBeVisible()
  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test('a view without a draft is left for the text when another line is selected', async () => {
  const source = createFakeChapterEditSource({ lines })
  renderSplit(draftIndex, { source, lines })
  await loadedEditor('4')
  await openLoadedView('Alignment')
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await userEvent.click(options()[draftIndex])
  await loadedEditor('4')

  expect(selectedView()).toBe('Text')
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
})

test('an alignment draft follows its line across a moved line and is saved to it', async () => {
  const source = createFakeChapterEditSource({ lines })
  await draftAlignment(source)
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await moveSelectedLineTo('After line 5')
  await waitForOrder(['2', '3', '4', '5', '1'])

  expect(within(options()[2]).getByText('edited')).toBeVisible()
  expect(screen.getAllByText('edited')).toHaveLength(1)

  await selectDraftLine(2)

  expect(omittedWord()).toBeVisible()

  await saveAlignment()

  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([2])
  await expect(listOmittedWords(source)).resolves.toEqual([
    ['2', []],
    ['3', []],
    ['4', [2]],
    ['5', []],
    ['1', []],
  ])
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('an alignment draft follows its line when a line before it is deleted and is saved to it', async () => {
  const source = createFakeChapterEditSource({ lines })
  await draftAlignment(source)
  await userEvent.click(options()[1])
  await loadedEditor('2')
  await userEvent.click(button('Delete line'))
  await confirmDeletion()
  await waitForOrder(['1', '3', '4', '5'])
  await selectDraftLine(2)

  expect(omittedWord()).toBeVisible()

  await saveAlignment()

  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([2])
  await expect(listOmittedWords(source)).resolves.toEqual([
    ['1', []],
    ['3', []],
    ['4', [2]],
    ['5', []],
  ])
})

test('a line with an alignment draft is moved with its draft and stays open on its view', async () => {
  const source = createFakeChapterEditSource({ lines })
  await draftAlignment(source)
  await userEvent.click(button('Move up'))
  await waitForOrder(['1', '2', '4', '3', '5'])

  expect(selectedOptions()).toEqual([options()[2]])
  expect(selectedView()).toBe('Alignment')
  expect(omittedWord()).toBeVisible()
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)

  await saveAlignment()

  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([2])
})

test('a refused alignment save marks the line as failed in the list', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.saveAlignment.mockRejectedValueOnce(new Error('Invalid alignment'))
  await draftAlignment(source)
  await userEvent.click(button('Save alignment'))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid alignment',
  )
  expect(within(options()[draftIndex]).getByText('failed')).toBeVisible()
  expect(within(options()[draftIndex]).getByText('edited')).toBeVisible()
  expect(listEnabledMoveButtons()).toEqual([
    'Move up',
    'Move down',
    'Move to...',
  ])
})

test('a new line has only its text', async () => {
  renderSplit(0, { lines })
  await loadedEditor('1')
  await userEvent.click(button('Add line'))
  const editor = await screen.findByRole('region', { name: 'New line' })
  await within(editor).findByLabelText('Number')

  expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  expect(
    within(editor).getByRole('button', { name: 'Save line' }),
  ).toBeVisible()
  expect(viewPanel).toThrow()
})
