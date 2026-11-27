import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  EditLiteRenderOptions,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import { describeLockedViews } from 'corpus/ui/edit-lite/LineViews'
import {
  button,
  expectActiveWord,
  lemmatizeWord,
  lineViewNames,
  listDisabledViews,
  manuscriptRow,
  omitWord,
  openLineView,
  openLoadedView,
  queryActivePopover,
  reconstructionRow,
  selectedView,
  viewPanel,
  viewTab,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)
const elish: Word = buildDictionaryWord('eliš')
const options: EditLiteRenderOptions = { lines, words: [elish] }

function note(): HTMLElement {
  return screen.getByRole('note')
}

function expectOthersLocked(
  view: 'text' | 'alignment' | 'lemmatization',
): void {
  const explanation = `Save or reset the unsaved ${view} changes of this line to open the other views.`

  expect(describeLockedViews(view)).toBe(explanation)
  expect(note()).toHaveTextContent(explanation)
  listDisabledViews().forEach((name) => {
    expect(viewTab(name)).toHaveAccessibleDescription(explanation)
    expect(viewTab(name)).toHaveAttribute('aria-disabled', 'true')
  })
}

test('a stored line has three views and opens with its text', async () => {
  const { source } = await renderLoadedContainer(options)
  const tablist = screen.getByRole('tablist', { name: 'Views of the line' })

  expect(
    within(tablist)
      .getAllByRole('tab')
      .map((tab) => tab.textContent),
  ).toEqual(lineViewNames)
  expect(selectedView()).toBe('Text')
  expect(within(viewPanel('Text')).getByLabelText('Number')).toHaveValue('1')
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  expect(listDisabledViews()).toEqual([])
  expect(screen.queryByRole('note')).not.toBeInTheDocument()
  expect(source.loadAnnotatedLine).not.toHaveBeenCalled()
  expect(source.loadLemmatization).not.toHaveBeenCalled()
})

test('the views are switched with the arrow keys and only one is mounted', async () => {
  await renderLoadedContainer(options)
  viewTab('Text').focus()
  await userEvent.keyboard('{ArrowRight}')
  await within(viewPanel('Alignment')).findByRole('group', {
    name: 'Reconstruction',
  })

  expect(selectedView()).toBe('Alignment')
  expectActiveWord(manuscriptRow(1), 'e-nu-ma', 'Ideal word')
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
  expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()

  await userEvent.keyboard('{Escape}')
  viewTab('Alignment').focus()
  await userEvent.keyboard('{ArrowRight}')
  await openLoadedView('Lemmatization')

  expect(selectedView()).toBe('Lemmatization')
  expectActiveWord(reconstructionRow(), 'enūma', 'Lemma')

  await userEvent.keyboard('{Escape}')
  viewTab('Lemmatization').focus()
  await userEvent.keyboard('{ArrowLeft}')

  expect(selectedView()).toBe('Alignment')
  expectActiveWord(manuscriptRow(1), 'e-nu-ma', 'Ideal word')

  await openLineView('Text')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(screen.getByLabelText('Number')).toBeVisible()
})

test('unsaved text changes lock the other views until they are reset', async () => {
  const { source } = await renderLoadedContainer(options)
  await userEvent.type(screen.getByLabelText('Number'), 'a')

  expect(listDisabledViews()).toEqual(['Alignment', 'Lemmatization'])
  expectOthersLocked('text')

  await userEvent.click(viewTab('Alignment'))
  viewTab('Text').focus()
  await userEvent.keyboard('{ArrowRight}')

  expect(selectedView()).toBe('Text')
  expect(source.loadAnnotatedLine).not.toHaveBeenCalled()

  await userEvent.click(button('Reset'))

  expect(listDisabledViews()).toEqual([])
  expect(screen.queryByRole('note')).not.toBeInTheDocument()
  expect(viewTab('Alignment')).not.toHaveAttribute('aria-describedby')
})

test('saved text changes release the other views and the tokens are loaded afterwards', async () => {
  const { source } = await renderLoadedContainer(options)
  await userEvent.type(screen.getByLabelText('Number'), 'a')
  await userEvent.click(button('Save line'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
  await openLoadedView('Alignment')

  expect(source.loadAnnotatedLine.mock.calls).toEqual([[0]])
  expect(source.saveLine).toHaveBeenCalledTimes(1)
})

test('unsaved alignment changes lock the other views until they are saved', async () => {
  const { source } = await renderLoadedContainer(options)
  await openLoadedView('Alignment')

  expect(listDisabledViews()).toEqual([])

  await omitWord(manuscriptRow(1), 'eliš')

  expect(listDisabledViews()).toEqual(['Text', 'Lemmatization'])
  expectOthersLocked('alignment')

  await userEvent.click(viewTab('Lemmatization'))

  expect(selectedView()).toBe('Alignment')
  expect(source.loadLemmatization).not.toHaveBeenCalled()

  await userEvent.click(button('Save alignment'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  expect(selectedView()).toBe('Alignment')
  expect(screen.queryByRole('note')).not.toBeInTheDocument()
})

test('unsaved lemmatization changes lock the other views until they are reset', async () => {
  await renderLoadedContainer(options)
  await openLoadedView('Lemmatization')
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))

  expect(listDisabledViews()).toEqual(['Text', 'Alignment'])
  expectOthersLocked('lemmatization')

  await userEvent.click(button('Reset'))

  expect(listDisabledViews()).toEqual([])
  expect(selectedView()).toBe('Lemmatization')

  await openLineView('Text')

  expect(screen.getByLabelText('Number')).toHaveValue('1')
})

test('a line whose text save failed shows the reason above every view it can open', async () => {
  const source = createFakeChapterEditSource(options)
  source.saveLine.mockRejectedValueOnce(new Error('Invalid line'))
  await renderLoadedContainer({ source, lines })
  await userEvent.type(screen.getByLabelText('Number'), 'a')
  await userEvent.click(button('Save line'))

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid line')
  expect(listDisabledViews()).toEqual(['Alignment', 'Lemmatization'])
  expect(screen.getByLabelText('Number')).toHaveValue('1a')
})
