import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createManuscriptLine, Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  buildAnnotationUrl,
  buildEditLiteLines,
  createFakeChapterEditSource,
  EditLiteRenderOptions,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  buildDictionaryWord,
  createWordToken,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { buildAlignedLine } from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import {
  setLineVariant,
  setVariantManuscriptLine,
} from 'corpus/ui/edit-lite/lineDraft'
import { renderLoadedContainer } from 'corpus/ui/edit-lite/LineEditContainer.testSupport'
import {
  button,
  lemmatizeWord,
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

const enuma: Word = buildDictionaryWord('enūma')
const elish: Word = buildDictionaryWord('eliš')
const otherElish: Word = buildDictionaryWord('eliš', 'II')
const [alignedLine, ...otherLines]: Line[] =
  buildEditLiteLines(2).map(buildAlignedLine)
const [variant] = alignedLine.variants
const [, secondManuscript] = variant.manuscripts
const lines: readonly Line[] = [
  setLineVariant(
    alignedLine,
    0,
    setVariantManuscriptLine(
      variant,
      1,
      createManuscriptLine({
        ...secondManuscript,
        atfTokens: [
          ...secondManuscript.atfTokens.slice(0, 3),
          createWordToken('e-li-iš', 'Word', {
            alignment: 3,
            uniqueLemma: ['eliš II'],
          }),
        ],
      }),
    ),
  ),
  ...otherLines,
]
const options: EditLiteRenderOptions = {
  lines,
  words: [enuma, elish, otherElish],
  suggestions: [{ word: 'enūma', isNormalized: true, lemmas: [['enūma I']] }],
}

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

test('a lemma set on a reconstruction word goes to the aligned words without a lemma of their own', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))

  expect(wordButton(reconstructionRow(), 'eliš')).toHaveTextContent(
    /^elišeliš$/,
  )
  expect(wordLabel(reconstructionRow(), 'eliš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-lišeliš$/)
  expect(wordLabel(manuscriptRow(1), 'e-liš')).toHaveClass('Word--suggestion')
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(/^e-nu-ma$/)
  expect(wordButton(manuscriptRow(2), 'e-li-iš')).toHaveTextContent(
    /^e-li-išeliš II$/,
  )

  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(otherElish))

  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(
    /^e-lišeliš II$/,
  )
  expect(source.searchLemma).toHaveBeenCalledWith('el')
  expect(source.saveLemmatization).not.toHaveBeenCalled()
})

test('the lemmas on screen are saved as values and shown again', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))
  await lemmatizeWord(manuscriptRow(1), 'e-nu-ma', new Lemma(otherElish))
  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(button('Reset')).toBeDisabled())
  await waitFor(() => expect(button('Preview request')).toBeEnabled())
  const [savedVariant] = (await source.loadAnnotatedLine(0)).variants

  expect(source.saveLemmatization).toHaveBeenCalledTimes(1)
  expect(
    savedVariant.reconstructionTokens.map((token) => token.uniqueLemma),
  ).toEqual([undefined, ['enūma I'], undefined, ['eliš I']])
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
  expect(wordLabel(reconstructionRow(), 'enūma')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(button('Save lemmatization')).toBeDisabled()
})

test('a suggested lemma is saved as a value without any other change', async () => {
  const { source } = await renderLoadedView('Lemmatization', options)

  expect(button('Save lemmatization')).toBeEnabled()
  expect(button('Reset')).toBeDisabled()

  await userEvent.click(button('Save lemmatization'))
  await waitFor(() => expect(button('Save lemmatization')).toBeDisabled())
  const [savedVariant] = (await source.loadAnnotatedLine(0)).variants

  expect(savedVariant.reconstructionTokens[1].uniqueLemma).toEqual(['enūma I'])
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

test('the request preview shows the address and the body of the save', async () => {
  await renderLoadedView('Lemmatization', options)
  await userEvent.click(button('Preview request'))
  const preview = within(
    screen.getByRole('dialog', { name: 'Request preview' }),
  )

  expect(
    preview.getByText(
      `POST ${buildAnnotationUrl('lemmatization', 0, 'revision-1')}`,
    ),
  ).toBeVisible()
  expect(
    JSON.parse(preview.getByLabelText('Request body').textContent ?? ''),
  ).toEqual({
    lemmatization: [
      {
        reconstruction: [
          { value: '%n' },
          { value: 'enūma', uniqueLemma: ['enūma I'] },
          { value: '|' },
          { value: 'eliš', uniqueLemma: [] },
        ],
        manuscripts: [
          [
            { value: 'e-nu-ma', uniqueLemma: [] },
            { value: 'e-liš', uniqueLemma: [] },
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
