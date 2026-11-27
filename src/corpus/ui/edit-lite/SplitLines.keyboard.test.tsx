import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { lemmaOptions } from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import {
  expectActiveWord,
  listAlignments,
  listDisabledViews,
  manuscriptRow,
  openLoadedView,
  queryActivePopover,
  reconstructionRow,
  selectedView,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  listbox,
  loadedEditor,
  options,
  renderSplit,
  selectedOptions,
  typeIntoNumber,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(4)

async function openAlignment(
  lineNumber: string,
  source: FakeChapterEditSource = createFakeChapterEditSource({ lines }),
): Promise<FakeChapterEditSource> {
  renderSplit(Number(lineNumber) - 1, { source, lines })
  await loadedEditor(lineNumber)
  await openLoadedView('Alignment')
  return source
}

function editor(lineNumber: string): HTMLElement {
  return screen.getByRole('region', { name: `Line ${lineNumber}` })
}

test('Enter on the last word saves the line and opens the next one in the same view', async () => {
  const source = await openAlignment('1')
  await userEvent.keyboard('{Tab}{Tab}{Enter}')
  await waitFor(() => expect(selectedOptions()).toEqual([options()[1]]))
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())

  expect(editor('2')).toBeVisible()
  expect(selectedView()).toBe('Alignment')
  expectActiveWord(manuscriptRow(1), 'šap-liš', 'Ideal word')
  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([0])
  expect(listAlignments(await source.loadAnnotatedLine(0))).toEqual([
    [null, null],
    [3],
  ])
  expect(screen.queryByText('edited')).not.toBeInTheDocument()

  await userEvent.keyboard('{Enter}{Enter}')
  await waitFor(() => expect(selectedOptions()).toEqual([options()[2]]))
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())

  expectActiveWord(manuscriptRow(1), 'ap-su-um-ma', 'Ideal word')
  expect(source.saveAlignment.mock.calls.map(([index]) => index)).toEqual([
    0, 1,
  ])
  expect(listAlignments(await source.loadAnnotatedLine(1))).toEqual([[1, 3]])
})

test('Tab on the last word goes to the next line without a request when nothing was accepted', async () => {
  const source = await openAlignment('1')
  await userEvent.keyboard('{Tab}{Tab}{Tab}')

  expect(selectedOptions()).toEqual([options()[1]])
  expectActiveWord(manuscriptRow(1), 'šap-liš', 'Ideal word')
  expect(source.saveAlignment).not.toHaveBeenCalled()
  expect(source.loadAnnotatedLine.mock.calls).toEqual([[0], [1]])
})

test('a refused save stays on the line with the reason and without an active word', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.saveAlignment.mockRejectedValueOnce(new Error('Invalid alignment'))
  await openAlignment('1', source)
  await userEvent.keyboard('{Tab}{Tab}{Enter}')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid alignment',
  )
  expect(selectedOptions()).toEqual([options()[0]])
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(editor('1')).toHaveFocus()
  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])
  expect(screen.getByText('failed')).toBeVisible()
})

test('the last stored line is saved and stays without an active word', async () => {
  const source = await openAlignment('4')
  await userEvent.keyboard('{Enter}{Enter}')
  await waitFor(() => expect(source.saveAlignment).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  expect(selectedOptions()).toEqual([options()[3]])
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(editor('4')).toHaveFocus()
  expect(selectedView()).toBe('Alignment')
  expect(listAlignments(await source.loadAnnotatedLine(3))).toEqual([[3, 4]])
})

test('the next line is not opened when another line was selected during the save', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.saveAlignment)
  await openAlignment('1', source)
  await userEvent.keyboard('{Tab}{Tab}{Enter}')
  await userEvent.click(options()[2])
  await loadedEditor('3')
  await act(async () => held.resolve())
  await waitFor(() =>
    expect(screen.queryByText('edited')).not.toBeInTheDocument(),
  )

  expect(selectedOptions()).toEqual([options()[2]])
  expect(selectedView()).toBe('Text')
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(source.saveAlignment).toHaveBeenCalledTimes(1)
})

test('the next line opens without taking the focus that went elsewhere during the save', async () => {
  const source = createFakeChapterEditSource({ lines })
  const held = holdNextCall(source.saveAlignment)
  await openAlignment('1', source)
  await userEvent.keyboard('{Tab}{Tab}{Enter}')

  expect(editor('1')).toHaveFocus()

  act(() => listbox().focus())
  await act(async () => held.resolve())
  await waitFor(() => expect(selectedOptions()).toEqual([options()[1]]))
  await within(editor('2')).findAllByRole('group', { name: 'Reconstruction' })

  expect(selectedView()).toBe('Alignment')
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(listbox()).toHaveFocus()
})

test('the next line opens with its unsaved text when it has some', async () => {
  const source = createFakeChapterEditSource({ lines })
  renderSplit(1, { source, lines })
  await typeIntoNumber('2', 'a')
  await userEvent.click(options()[0])
  await loadedEditor('1')
  await openLoadedView('Alignment')
  await userEvent.keyboard('{Tab}{Tab}{Tab}')
  await loadedEditor('2')

  expect(selectedView()).toBe('Text')
  expect(listDisabledViews()).toEqual(['Alignment', 'Lemmatization'])
  expect(queryActivePopover()).not.toBeInTheDocument()

  await userEvent.click(options()[2])
  await loadedEditor('3')

  expect(selectedView()).toBe('Text')
})

test('the lemmas of the next line are loaded before its first word is active', async () => {
  const source = createFakeChapterEditSource(lemmaOptions)
  renderSplit(0, { ...lemmaOptions, source })
  await loadedEditor('1')
  await openLoadedView('Lemmatization')
  const heldLemmas = holdNextCall(source.loadLemmatization)
  await userEvent.click(within(manuscriptRow(2)).getByRole('button'))
  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(source.loadLemmatization).toHaveBeenCalledTimes(2))

  expect(selectedOptions()).toEqual([options()[1]])
  expect(selectedView()).toBe('Lemmatization')
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(editor('2')).toHaveFocus()

  await act(async () => heldLemmas.resolve())
  await openLoadedView('Lemmatization')

  expectActiveWord(
    screen.getAllByRole('group', { name: 'Reconstruction' })[0],
    'šapliš',
    'Lemma',
  )
  expect(source.saveLemmatization).not.toHaveBeenCalled()
  expect(reconstructionRow).toThrow()
})
