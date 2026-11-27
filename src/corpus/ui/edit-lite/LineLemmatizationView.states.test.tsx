import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { wordNotFoundMessage } from 'corpus/application/edit-lite/lineLemmatization'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
  EditLiteRenderOptions,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import {
  button,
  lemmatizeWord,
  listDisabledViews,
  manuscriptRow,
  openLineView,
  openLoadedView,
  reconstructionRow,
  renderLoadedView,
  viewPanel,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { holdNextCall } from 'corpus/ui/edit-lite/useEditLite.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(3)
const elish: Word = buildDictionaryWord('eliš')
const options: EditLiteRenderOptions = {
  lines,
  words: [elish],
  suggestions: [{ word: 'eliš', isNormalized: true, lemmas: [['eliš I']] }],
}

test('lemmas that fail to load show the reason and only they are requested again', async () => {
  const source = createFakeChapterEditSource(options)
  source.loadLemmatization.mockRejectedValueOnce(
    new Error(wordNotFoundMessage('eliš I')),
  )
  await renderLoadedContainer({ source, lines })
  await openLineView('Lemmatization')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The dictionary has no word with the id "eliš I".',
  )
  expect(
    within(viewPanel('Lemmatization')).queryByRole('group'),
  ).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await openLoadedView('Lemmatization')

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
  expect(source.loadLemmatization).toHaveBeenCalledTimes(2)
  expect(wordLabel(reconstructionRow(), 'eliš')).toHaveClass('Word--suggestion')
})

test('tokens that fail to load for the lemmatization are requested again before the lemmas', async () => {
  const source = createFakeChapterEditSource(options)
  source.loadAnnotatedLine.mockRejectedValueOnce(new Error('Network error'))
  await renderLoadedContainer({ source, lines })
  await openLineView('Lemmatization')

  expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  expect(source.loadLemmatization).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await openLoadedView('Lemmatization')

  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(2)
  expect(source.loadLemmatization).toHaveBeenCalledTimes(1)
})

test('while the lemmatization is saved the line shows the progress and is locked', async () => {
  const source = createFakeChapterEditSource(options)
  const held = holdNextCall(source.saveLemmatization)
  await renderLoadedView('Lemmatization', { source, lines })
  await lemmatizeWord(manuscriptRow(1), 'e-liš', new Lemma(elish))
  await userEvent.click(button('Save lemmatization'))
  const panel = within(viewPanel('Lemmatization'))

  expect(panel.getByText('Saving...')).toBeVisible()
  expect(panel.queryByRole('button', { name: /^e/ })).not.toBeInTheDocument()
  expect(manuscriptRow(1)).toHaveTextContent(/^NinNA1ao 1e-nu-ma e-lišeliš$/)
  expect(button('Save lemmatization')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()

  await act(async () => held.resolve())
  await waitFor(() => expect(listDisabledViews()).toEqual([]))
  await openLoadedView('Lemmatization')

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(source.saveLemmatization).toHaveBeenCalledTimes(1)
})

test('a refused save keeps the lemmas and shows the reason of the server', async () => {
  const source = createFakeChapterEditSource(options)
  source.saveLemmatization.mockRejectedValueOnce(new Error('Invalid lemma'))
  const { getState } = await renderLoadedView('Lemmatization', {
    source,
    lines,
  })
  await lemmatizeWord(manuscriptRow(1), 'e-liš', new Lemma(elish))
  await userEvent.click(button('Save lemmatization'))

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid lemma')
  expect(getState().lines[0].status).toBe('failed')
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(listDisabledViews()).toEqual(['Text', 'Alignment'])
  expect(button('Save lemmatization')).toBeEnabled()
})

test('without permission to write the lemmatization is shown read-only', async () => {
  const { source } = await renderLoadedView('Lemmatization', {
    ...options,
    canWrite: false,
  })
  const panel = within(viewPanel('Lemmatization'))

  expect(panel.queryByRole('button')).not.toBeInTheDocument()
  expect(reconstructionRow()).toHaveTextContent(/^%n enūma \| elišeliš$/)
  expect(wordLabel(reconstructionRow(), 'eliš')).toHaveClass('Word--suggestion')
  expect(manuscriptRow(2)).toHaveTextContent(
    /^BabaNBSch1o i 6'\[x x x\] e-li-iš$/,
  )
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
  expect(source.loadLemmatization).toHaveBeenCalledTimes(1)
})

test('every variant is lemmatized on its own', async () => {
  const { source } = await renderLoadedView('Lemmatization', {
    ...options,
    lines: lines.slice(1),
  })
  const second = within(screen.getByRole('group', { name: 'Variant 2' }))
  await userEvent.click(
    within(second.getByRole('group', { name: 'Reconstruction' })).getByRole(
      'button',
      { name: 'erṣetu' },
    ),
  )
  await userEvent.type(screen.getByLabelText('Lemma'), 'el')
  await userEvent.click(
    await screen.findByText(
      (_text, element) => element?.getAttribute('role') === 'option',
    ),
  )
  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(listDisabledViews()).toEqual([]))

  expect(source.saveLemmatization).toHaveBeenCalledTimes(1)
  expect(
    (await source.loadAnnotatedLine(0)).variants.map((variant) =>
      variant.reconstructionTokens.map((token) => token.uniqueLemma),
    ),
  ).toEqual([
    [undefined, [], undefined, []],
    [undefined, [], undefined, ['eliš I']],
  ])
})
