import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFakeChapterEditSource } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  elish,
  lemmaLines,
  lemmaOptions,
  listStoredLemmas,
  otherElish,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import {
  activePopover,
  button,
  chooseLemma,
  expectActiveWord,
  findLemmaOption,
  listDisabledViews,
  manuscriptRow,
  openLineView,
  popoverField,
  queryActivePopover,
  reconstructionRow,
  renderLoadedView,
  viewPanel,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'
import { lemmatizationKeysHint } from 'corpus/ui/edit-lite/wordKeys'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

test('the first word is active once the tokens and the lemmas of the line are loaded', async () => {
  const source = createFakeChapterEditSource(lemmaOptions)
  const heldLemmas = holdNextCall(source.loadLemmatization)
  await renderLoadedContainer({ source, lines: lemmaLines })
  await openLineView('Lemmatization')
  await waitFor(() => expect(source.loadLemmatization).toHaveBeenCalled())

  expect(queryActivePopover()).not.toBeInTheDocument()

  await act(async () => heldLemmas.resolve())
  await within(viewPanel('Lemmatization')).findByRole('group', {
    name: 'Reconstruction',
  })

  expectActiveWord(reconstructionRow(), 'enūma', 'Lemma')
  expect(activePopover()).toHaveClass('popover')
  expect(activePopover()).toHaveTextContent(/enūma, guide word of enūma \(N\)/)
  expect(activePopover()).not.toHaveClass('modal')
  expect(screen.queryByLabelText('Complex')).not.toBeInTheDocument()
  expect(
    within(viewPanel('Lemmatization')).getByText(lemmatizationKeysHint),
  ).toBeVisible()
  expect(lemmatizationKeysHint).toBe(
    'Enter accepts the lemma and goes on, Tab skips the word, Shift+Tab goes back, Escape closes the word and F2 moves between the lemma and the actions of the word. In the reconstruction the keys go from word to word and then to the next line; a lemma accepted on a reconstruction word is also set on the manuscript words aligned to it that have no lemma. Click a manuscript word to change it.',
  )
})

test('Enter accepts a suggested lemma, Tab skips a word and Shift+Tab goes back', async () => {
  const { source } = await renderLoadedView('Lemmatization', lemmaOptions)
  await userEvent.keyboard('{Enter}')

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(wordLabel(reconstructionRow(), 'enūma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maenūma$/,
  )
  expect(wordLabel(manuscriptRow(1), 'e-nu-ma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(listDisabledViews()).toEqual(['Text', 'Alignment'])

  await userEvent.keyboard('{Shift>}{Tab}{Tab}{/Shift}')

  expectActiveWord(reconstructionRow(), 'enūma', 'Lemma')

  await userEvent.keyboard('{Tab}')

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')

  await userEvent.keyboard('{Escape}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveFocus()

  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  await expect(listStoredLemmas(source)).resolves.toEqual([
    [['enūma I'], []],
    [['enūma I'], []],
    [['eliš II']],
  ])
})

test('Enter chooses the highlighted option while the menu is open and leaves the line from the last reconstruction word once it is closed', async () => {
  const { source } = await renderLoadedView('Lemmatization', lemmaOptions)
  await userEvent.keyboard('{Tab}el')
  await findLemmaOption(new Lemma(elish))
  await userEvent.keyboard('{Enter}')

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišeliš$/,
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)

  await userEvent.keyboard('{Enter}')
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  expect(queryActivePopover()).not.toBeInTheDocument()
  await expect(listStoredLemmas(source)).resolves.toEqual([
    [[], ['eliš I']],
    [[], ['eliš I']],
    [['eliš II']],
  ])
})

test('Tab leaves a word with an open menu without choosing an option', async () => {
  const { getState } = await renderLoadedView('Lemmatization', lemmaOptions)
  await userEvent.keyboard('el')
  await findLemmaOption(new Lemma(elish))
  await userEvent.keyboard('{Tab}')

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(wordButton(reconstructionRow(), 'enūma')).toHaveTextContent(
    /^enūmaenūma$/,
  )
  expect(wordLabel(reconstructionRow(), 'enūma')).toHaveClass(
    'Word--suggestion',
  )
  expect(getState().lines[0].annotation?.draft).toBeNull()
})

test('several suggestions are offered as options and several options are a complex lemma', async () => {
  const { source } = await renderLoadedView('Lemmatization', {
    ...lemmaOptions,
    suggestions: [
      { word: 'eliš', isNormalized: true, lemmas: [['eliš I'], ['eliš II']] },
    ],
  })
  await userEvent.keyboard('{Tab}{ArrowDown}')

  expect(
    screen.getAllByRole('option').map((option) => option.textContent),
  ).toEqual(['eliš, guide word of eliš (N)', 'eliš II, guide word of eliš (N)'])
  expect(source.searchLemma).not.toHaveBeenCalled()
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(/^eliš$/)

  await userEvent.keyboard('{Enter}')
  await chooseLemma(new Lemma(otherElish))

  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišeliš, eliš II$/,
  )
  expect(popoverField('Lemma')).toHaveFocus()

  await userEvent.keyboard('{Backspace}')

  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišeliš$/,
  )

  await chooseLemma(new Lemma(otherElish))
  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  await expect(listStoredLemmas(source)).resolves.toEqual([
    [[], ['eliš I', 'eliš II']],
    [[], ['eliš I', 'eliš II']],
    [['eliš II']],
  ])
})

test('on the last word Tab or Enter leaves no word active and saves nothing that was not accepted', async () => {
  const { source } = await renderLoadedView('Lemmatization', lemmaOptions)
  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))
  await userEvent.keyboard('{Tab}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(source.saveLemmatization).not.toHaveBeenCalled()

  await userEvent.click(wordButton(manuscriptRow(2), 'e-li-iš'))
  await userEvent.keyboard('{Enter}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(source.saveLemmatization).not.toHaveBeenCalled()

  await userEvent.click(wordButton(reconstructionRow(), 'eliš'))
  await userEvent.keyboard('{Enter}')

  expect(queryActivePopover()).not.toBeInTheDocument()
  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(/^eliš$/)
  expect(source.saveLemmatization).not.toHaveBeenCalled()
})
