import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { createFakeChapterEditSource } from 'corpus/ui/edit-lite/editLite.testSupport'
import { sameLemmaMessage } from 'corpus/ui/edit-lite/EditLiteFakeInstances.testSupport'
import {
  confirmUpdateAll,
  instanceOptions,
  lineWord,
  listReconstructionLemmas,
  openLemmatization,
  openWordActions,
  requestUpdateAll,
  selectLine,
  updateAllItem,
  waitForReloadedWord,
} from 'corpus/ui/edit-lite/instances.testSupport'
import { describeBlockingDraft } from 'corpus/ui/edit-lite/LemmaWord'
import {
  button,
  chooseLemma,
  expectActiveWord,
  listDisabledViews,
  manuscriptRow,
  openLoadedView,
  openWord,
  queryActivePopover,
  reconstructionRow,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { options } from 'corpus/ui/edit-lite/SplitLines.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

test('the confirmation says how many words in how many lines get the lemma and can be cancelled', async () => {
  const source = await openLemmatization('4')
  await openWord(reconstructionRow(), 'line')
  const dialog = await requestUpdateAll()

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(dialog).toHaveTextContent(
    'Set the lemma line on every instance of line?3 words in 3 lines of this chapter.',
  )
  expect(dialog).not.toHaveTextContent('already')
  expect(source.countWordInstances.mock.calls).toEqual([['line']])

  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

  expect(
    screen.queryByRole('dialog', { name: 'Update all instances' }),
  ).not.toBeInTheDocument()
  expectActiveWord(reconstructionRow(), 'line', 'Lemma')
  expect(wordLabel(reconstructionRow(), 'line')).toHaveClass('Word--suggestion')
  expect(source.lemmatizeWordInstances).not.toHaveBeenCalled()
  expect(source.saveLemmatization).not.toHaveBeenCalled()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('the lemma is accepted, the line is saved and then every instance of the chapter gets the lemma', async () => {
  const source = await openLemmatization('4')
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()
  await waitForReloadedWord('line')

  expect(source.saveLemmatization.mock.calls.map(([index]) => index)).toEqual([
    3,
  ])
  expect(source.lemmatizeWordInstances.mock.calls).toEqual([
    ['line', ['line I']],
  ])
  expect(source.saveLemmatization.mock.invocationCallOrder[0]).toBeLessThan(
    source.lemmatizeWordInstances.mock.invocationCallOrder[0],
  )
  expect(
    listReconstructionLemmas(await source.loadLines(3, 3)).map(
      (lemmas) => lemmas[3],
    ),
  ).toEqual([['line I'], ['line I'], ['line I']])
  expect(wordLabel(reconstructionRow(), 'line')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(listDisabledViews()).toEqual([])
})

test('instances that have a lemma are counted and a save that changes nothing is refused', async () => {
  const source = createFakeChapterEditSource(instanceOptions)
  await source.lemmatizeWordInstances('kur', ['kur I'])
  await openLemmatization('4', source)
  await openWord(manuscriptRow(1), 'kur')
  const dialog = await requestUpdateAll()

  expect(dialog).toHaveTextContent(
    '3 words in 3 lines of this chapter.3 of them already have a lemma, which will be replaced.',
  )

  await userEvent.click(
    within(dialog).getByRole('button', { name: 'Update all instances' }),
  )

  expect(await screen.findByRole('alert')).toHaveTextContent(
    sameLemmaMessage('kur', ['kur I']),
  )
  expect(source.saveLemmatization).not.toHaveBeenCalled()
  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(within(options()[3]).getByText('failed')).toBeVisible()

  await userEvent.click(button('Reset'))

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('a refused save of the line stops before the chapter is changed', async () => {
  const source = createFakeChapterEditSource(instanceOptions)
  source.saveLemmatization.mockRejectedValueOnce(new Error('Invalid lemma'))
  await openLemmatization('4', source)
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid lemma')
  expect(source.lemmatizeWordInstances).not.toHaveBeenCalled()
  expect(within(options()[3]).getByText('edited')).toBeVisible()
  expect(wordLabel(reconstructionRow(), 'line')).not.toHaveClass(
    'Word--suggestion',
  )
})

test('a count that fails shows its reason and gives the word back', async () => {
  const source = createFakeChapterEditSource(instanceOptions)
  source.countWordInstances.mockRejectedValueOnce(
    new Error(chapterChangedMessage),
  )
  await openLemmatization('4', source)
  await openWord(reconstructionRow(), 'line')
  await openWordActions()
  await userEvent.click(updateAllItem())

  expect(await screen.findByRole('alert')).toHaveTextContent(
    chapterChangedMessage,
  )
  await waitForReloadedWord('line')
  expect(
    screen.queryByRole('dialog', { name: 'Update all instances' }),
  ).not.toBeInTheDocument()

  const dialog = await requestUpdateAll()

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(dialog).toBeVisible()
})

test('unsaved lemmatization changes of another line block the update with their line number', async () => {
  const source = await openLemmatization('5')
  await chooseLemma(new Lemma(lineWord))
  await selectLine('4')
  await openLoadedView('Lemmatization')
  await openWord(reconstructionRow(), 'line')
  await openWordActions()

  expect(updateAllItem()).toHaveClass('disabled')
  expect(updateAllItem()).toHaveTextContent(
    'Update all instances of lineSave or reset the lemmatization changes of line 5 first.',
  )
  expect(describeBlockingDraft('5')).toBe(
    'Save or reset the lemmatization changes of line 5 first.',
  )

  await userEvent.click(updateAllItem())

  expect(source.countWordInstances).not.toHaveBeenCalled()
})
