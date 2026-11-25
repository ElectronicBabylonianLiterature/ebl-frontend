import { act, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import { Line } from 'corpus/domain/line'
import {
  createFakeChapterEditSource,
  EditLiteRenderOptions,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  elish,
  lemmaLines,
  lemmaOptions,
  otherElish,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
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

const lines: readonly Line[] = lemmaLines
const options: EditLiteRenderOptions = lemmaOptions

function createSource(): FakeChapterEditSource {
  return createFakeChapterEditSource(options)
}

test('the lemmatization view loads the tokens and the lemmas of its line once', async () => {
  const source = createSource()
  const heldTokens = holdNextCall(source.loadAnnotatedLine)
  const heldLemmas = holdNextCall(source.loadLemmatization)
  await renderLoadedContainer({ source, lines })

  expect(source.loadAnnotatedLine).not.toHaveBeenCalled()
  expect(source.loadLemmatization).not.toHaveBeenCalled()

  await openLineView('Lemmatization')
  const panel = within(viewPanel('Lemmatization'))

  expect(panel.getByText('Loading lemmatization...')).toBeVisible()
  expect(source.loadLemmatization).not.toHaveBeenCalled()

  await act(async () => heldTokens.resolve())

  expect(panel.getByText('Loading lemmatization...')).toBeVisible()
  expect(panel.queryByRole('group')).not.toBeInTheDocument()

  await act(async () => heldLemmas.resolve())
  await openLoadedView('Lemmatization')
  await openLineView('Alignment')
  await openLoadedView('Alignment')
  await openLineView('Text')
  await openLoadedView('Lemmatization')

  expect(source.loadAnnotatedLine.mock.calls).toEqual([[0]])
  expect(source.loadLemmatization).toHaveBeenCalledTimes(1)
  expect(reconstructionRow()).toHaveTextContent(/^%n enūmaenūma \| eliš$/)
  expect(wordLabel(reconstructionRow(), 'enūma')).toHaveClass(
    'Word--suggestion',
  )
  expect(manuscriptRow(1)).toHaveTextContent(/^NinNA1ao 1e-nu-ma e-liš$/)
  expect(manuscriptRow(2)).toHaveTextContent(
    /^BabaNBSch1o i 6'\[x x x\] e-li-išeliš II$/,
  )
  expect(wordLabel(manuscriptRow(2), 'e-li-iš')).not.toHaveClass(
    'Word--suggestion',
  )
})

test('a lemma set on a reconstruction word is accepted for the aligned words without a stored lemma', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))

  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišeliš$/,
  )
  expect(wordLabel(reconstructionRow(), 'eliš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(/^e-nu-ma$/)
  expect(wordButton(manuscriptRow(2), 'e-li-iš')).toHaveTextContent(
    /^e-li-išeliš II$/,
  )

  await userEvent.keyboard('{Backspace}')
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(otherElish))

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(
    /^e-lišeliš II$/,
  )
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(source.searchLemma).toHaveBeenCalledWith('el')
  expect(source.saveLemmatization).not.toHaveBeenCalled()
})

test('the lemmas that were set or carried are saved and shown again, the suggestions are not', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))
  await lemmatizeWord(manuscriptRow(1), 'e-nu-ma', new Lemma(otherElish))
  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(button('Reset')).toBeDisabled())
  const [savedVariant] = (await source.loadAnnotatedLine(0)).variants

  expect(source.saveLemmatization).toHaveBeenCalledTimes(1)
  expect(
    savedVariant.reconstructionTokens.map((token) => token.uniqueLemma),
  ).toEqual([undefined, [], undefined, ['eliš I']])
  expect(
    savedVariant.manuscripts.map((manuscript) =>
      manuscript.atfTokens.map((token) => token.uniqueLemma),
    ),
  ).toEqual([
    [['eliš II'], ['eliš I']],
    [undefined, undefined, undefined, ['eliš II']],
  ])
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(3)
  expect(source.loadLemmatization).toHaveBeenCalledTimes(2)
  expect(reconstructionRow()).toHaveTextContent(/^%n enūmaenūma \| elišeliš$/)
  expect(wordLabel(reconstructionRow(), 'enūma')).toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(button('Save lemmatization')).toBeDisabled()
})

test('a suggested lemma that was not accepted is no unsaved change and is not saved', async () => {
  const { source, getState } = await renderLoadedView('Lemmatization', options)

  expect(wordLabel(reconstructionRow(), 'enūma')).toHaveClass(
    'Word--suggestion',
  )
  expect(button('Save lemmatization')).toBeDisabled()
  expect(button('Reset')).toBeDisabled()

  await userEvent.keyboard('{Tab}{Tab}{Shift>}{Tab}{/Shift}{Escape}')

  expect(getState().lines[0].annotation?.draft).toBeNull()
  expect(listDisabledViews()).toEqual([])
  expect(button('Save lemmatization')).toBeDisabled()
  expect(source.saveLemmatization).not.toHaveBeenCalled()
})

test('reset discards the lemmas that were set and keeps what was loaded', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(manuscriptRow(1), 'e-liš', new Lemma(elish))

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )

  await userEvent.click(button('Reset'))

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-liš$/)
  expect(source.loadAnnotatedLine).toHaveBeenCalledTimes(1)
  expect(source.loadLemmatization).toHaveBeenCalledTimes(1)
})

test('saving sends the lemmatization of the line as the body of the request', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(manuscriptRow(1), 'e-liš', new Lemma(elish))
  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(source.loadLemmatization).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(button('Reset')).toBeDisabled())
  const [[index, lemmatization]] = source.saveLemmatization.mock.calls

  expect(index).toBe(0)
  expect(
    toChapterUpdate({ type: 'saveLemmatization', index, lemmatization }).body,
  ).toEqual({
    lemmatization: [
      {
        reconstruction: [
          { value: '%n' },
          { value: 'enūma', uniqueLemma: [] },
          { value: '|' },
          { value: 'eliš', uniqueLemma: [] },
        ],
        manuscripts: [
          [
            { value: 'e-nu-ma', uniqueLemma: [] },
            { value: 'e-liš', uniqueLemma: ['eliš I'] },
          ],
          [
            { value: '[x' },
            { value: 'x' },
            { value: 'x]' },
            { value: 'e-li-iš', uniqueLemma: ['eliš II'] },
          ],
        ],
      },
    ],
  })
})
