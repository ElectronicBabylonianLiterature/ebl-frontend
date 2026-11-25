import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import {
  listGets,
  listPosts,
} from 'corpus/ui/edit-lite/annotationRoute.testSupport'
import {
  leavePage,
  openServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildAnnotatedLineUrl,
  buildAnnotationUrl,
  buildEditLiteLines,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeDictionary, {
  lemmaBatchPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import {
  elish,
  lemmaLines,
  lemmaOptions,
} from 'corpus/ui/edit-lite/lemmaFixtures.testSupport'
import {
  chooseIdealWord,
  expectActiveWord,
  findLemmaOption,
  listAlignments,
  manuscriptRow,
  openLoadedView,
  queryActivePopover,
  reconstructionRow,
  selectedView,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  loadedEditor,
  options,
  selectedOptions,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const lines: readonly Line[] = buildEditLiteLines(4)

function alignmentToken(value: string, alignment: number | null): unknown {
  return { value, alignment, variant: '', type: '', language: '' }
}

async function waitForLine(position: number): Promise<void> {
  await waitFor(() => expect(selectedOptions()).toEqual([options()[position]]))
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())
}

test('an alignment line gone through with Enter and Tab stores what was accepted or set', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  await loadedEditor('1')
  await openLoadedView('Alignment')
  await userEvent.keyboard('{Enter}{Tab}')
  await chooseIdealWord('enūma')

  expect(leavePage()).not.toBe('')

  await userEvent.keyboard('{Enter}')
  await waitForLine(1)

  expect(listPosts(served)).toEqual([
    [
      buildAnnotationUrl('alignment', 0, 'revision-1'),
      {
        alignment: [
          [
            {
              alignment: [
                alignmentToken('e-nu-ma', 1),
                alignmentToken('e-liš', null),
              ],
              omittedWords: [],
            },
            {
              alignment: [
                { value: '[x' },
                { value: 'x' },
                { value: 'x]' },
                alignmentToken('e-li-iš', 1),
              ],
              omittedWords: [],
            },
          ],
        ],
      },
    ],
  ])
  expect(listAlignments(served.chapter.lines[0])).toEqual([[1, null], [1]])
  expect(served.chapter.lines.slice(1)).toEqual(lines.slice(1))
  expect(selectedView()).toBe('Alignment')
  expectActiveWord(manuscriptRow(1), 'šap-liš', 'Ideal word')
  expect(leavePage()).toBe('')
})

test('two lines in a row are aligned and stored with the keyboard only', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  await loadedEditor('1')
  await openLoadedView('Alignment')
  await userEvent.keyboard('{Enter}{Enter}{Enter}')
  await waitForLine(1)
  await userEvent.keyboard('{Tab}{Enter}')
  await waitForLine(2)

  expectActiveWord(manuscriptRow(1), 'ap-su-um-ma', 'Ideal word')
  expect(selectedView()).toBe('Alignment')
  expect(listPosts(served).map(([path]) => path)).toEqual([
    buildAnnotationUrl('alignment', 0, 'revision-1'),
    buildAnnotationUrl('alignment', 1, 'revision-2'),
  ])
  expect(served.chapter.lines.map(listAlignments)).toEqual([
    [[1, 3], [3]],
    [[null, 3]],
    [[]],
    [[]],
  ])
  expect(listGets(served, 'tokens')).toEqual([
    buildAnnotatedLineUrl(0, 'revision-1'),
    buildAnnotatedLineUrl(1, 'revision-2'),
    buildAnnotatedLineUrl(2, 'revision-3'),
  ])
  expect(served.chapter.revision).toBe('revision-3')
  expect(leavePage()).toBe('')
})

test('a lemmatization line gone through with Enter and Tab stores the reconstruction lemmas and carries them to the aligned words without a stored lemma', async () => {
  const served = await openServedEditLiteRoute(
    lemmaLines,
    '?line=1',
    new EditLiteFakeDictionary(
      lemmaOptions.words ?? [],
      lemmaOptions.suggestions,
    ),
  )
  await loadedEditor('1')
  await openLoadedView('Lemmatization')
  await userEvent.keyboard('{Enter}el')
  await findLemmaOption(new Lemma(elish))
  await userEvent.keyboard('{Enter}')

  expectActiveWord(reconstructionRow(), 'eliš', 'Lemma')
  expect(manuscriptRow(1)).toHaveTextContent(/e-nu-maenūma e-lišeliš$/)
  expect(manuscriptRow(2)).toHaveTextContent(/e-li-išeliš II$/)

  await userEvent.keyboard('{Tab}')
  await waitForLine(1)
  const [variant] = served.chapter.lines[0].variants

  expect(listPosts(served)).toEqual([
    [
      lemmaBatchPath,
      {
        words: [
          { word: 'enūma', isNormalized: true },
          { word: 'eliš', isNormalized: true },
        ],
      },
    ],
    [
      buildAnnotationUrl('lemmatization', 0, 'revision-1'),
      {
        lemmatization: [
          {
            reconstruction: [
              { value: '%n' },
              { value: 'enūma', uniqueLemma: ['enūma I'] },
              { value: '|' },
              { value: 'eliš', uniqueLemma: ['eliš I'] },
            ],
            manuscripts: [
              [
                { value: 'e-nu-ma', uniqueLemma: ['enūma I'] },
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
      },
    ],
    [
      lemmaBatchPath,
      {
        words: [
          { word: 'šapliš', isNormalized: true },
          { word: 'ammatu', isNormalized: true },
          { word: 'erṣetu', isNormalized: true },
        ],
      },
    ],
  ])
  expect(
    variant.manuscripts[0].atfTokens.map((token) => token.uniqueLemma),
  ).toEqual([['enūma I'], ['eliš I']])
  expect(variant.manuscripts[1].atfTokens[3].uniqueLemma).toEqual(['eliš II'])
  expect(
    variant.reconstructionTokens.map((token) => token.uniqueLemma),
  ).toEqual([undefined, ['enūma I'], undefined, ['eliš I']])
  expect(served.chapter.lines.slice(1)).toEqual(lemmaLines.slice(1))
  expect(selectedView()).toBe('Lemmatization')
  expectActiveWord(
    screen.getAllByRole('group', { name: 'Reconstruction' })[0],
    'šapliš',
    'Lemma',
  )
})
