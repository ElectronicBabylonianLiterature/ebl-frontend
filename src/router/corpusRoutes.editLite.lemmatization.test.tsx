import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  listGets,
  listPosts,
  waitForSavedView,
} from 'corpus/ui/edit-lite/annotationRoute.testSupport'
import {
  editLiteChapterId,
  openServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildAnnotatedLineUrl,
  buildAnnotationUrl,
  buildEditLiteLines,
  buildMoveUrl,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeDictionary, {
  buildWordsPath,
  lemmaBatchPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { buildAlignedLine } from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import {
  button,
  lemmatizeWord,
  manuscriptRow,
  openLineView,
  openLoadedView,
  reconstructionRow,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  deleteSelectedLine,
  loadedEditor,
  options,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const enuma: Word = buildDictionaryWord('enūma')
const elish: Word = buildDictionaryWord('eliš')
const alignedLines: readonly Line[] =
  buildEditLiteLines(4).map(buildAlignedLine)

function createDictionary(): EditLiteFakeDictionary {
  return new EditLiteFakeDictionary(
    [enuma, elish],
    [{ word: 'enūma', isNormalized: true, lemmas: [['enūma I']] }],
  )
}

test('the lemmas of a line are asked for in one batch and one word request when its view opens', async () => {
  const served = await openServedEditLiteRoute(
    alignedLines,
    '?line=1',
    createDictionary(),
  )
  await loadedEditor('1')
  await openLoadedView('Alignment')

  expect(listPosts(served)).toEqual([])
  expect(listGets(served, '/words')).toEqual([])

  await openLoadedView('Lemmatization')
  await lemmatizeWord(reconstructionRow(), 'eliš', new Lemma(elish))
  await userEvent.click(button('Save lemmatization'))
  await waitForSavedView()
  await openLoadedView('Lemmatization')
  await openLineView('Text')
  await openLoadedView('Lemmatization')
  await openLoadedView('Alignment')
  await openLoadedView('Lemmatization')
  const lemmatizationBody = {
    lemmatization: [
      {
        reconstruction: [
          { value: '%n' },
          { value: 'enūma', uniqueLemma: [] },
          { value: '|' },
          { value: 'eliš', uniqueLemma: ['eliš I'] },
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
            { value: 'e-li-iš', uniqueLemma: [] },
          ],
        ],
      },
    ],
  }

  expect(listPosts(served, 3)).toEqual([
    [
      lemmaBatchPath,
      {
        words: [
          { word: 'enūma', isNormalized: true },
          { word: 'eliš', isNormalized: true },
        ],
      },
      false,
    ],
    [
      buildAnnotationUrl('lemmatization', 0, 'revision-1'),
      lemmatizationBody,
      true,
    ],
    [lemmaBatchPath, { words: [{ word: 'enūma', isNormalized: true }] }, false],
  ])
  expect(listGets(served, '/words')).toEqual([
    '/words?lemma=e',
    '/words?lemma=el',
    buildWordsPath(['eliš I']),
  ])
  expect(listGets(served, 'tokens')).toEqual([
    buildAnnotatedLineUrl(0, 'revision-1'),
    buildAnnotatedLineUrl(0, 'revision-2'),
  ])
  expect(wordButton(manuscriptRow(1), 'e-liš')).toHaveTextContent(/^e-liš$/)
  expect(wordLabel(reconstructionRow(), 'eliš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(wordButton(reconstructionRow(), 'enūma')).toHaveTextContent(
    /^enūmaenūma$/,
  )
})

test.each<[string, () => Promise<void>, string[], string[]]>([
  [
    'across a moved line',
    async (): Promise<void> => {
      await userEvent.click(button('Move down'))
      await waitForOrder(['2', '1', '3', '4'])
      await userEvent.click(button('Move down'))
    },
    ['2', '3', '1', '4'],
    [buildMoveUrl('revision-1'), buildMoveUrl('revision-2')],
  ],
  [
    'when a line before it is deleted',
    deleteSelectedLine,
    ['2', '3', '4'],
    [`${chapterUrl}/lines?view=outline&revision=revision-1`],
  ],
])(
  'a lemmatization draft follows its line %s and is saved to it',
  async (_name, changeLayout, numbers, layoutRequests) => {
    const served = await openServedEditLiteRoute(
      alignedLines,
      '?line=3',
      createDictionary(),
    )
    await loadedEditor('3')
    await openLoadedView('Lemmatization')
    await lemmatizeWord(reconstructionRow(), 'apsûm-ma', new Lemma(elish))
    await userEvent.click(options()[0])
    await loadedEditor('1')
    await changeLayout()
    await waitForOrder(numbers)
    await userEvent.click(options()[1])
    await within(screen.getByRole('region', { name: 'Line 3' })).findByRole(
      'group',
      { name: 'Reconstruction' },
    )
    await userEvent.click(button('Save lemmatization'))
    await waitForSavedView()
    const changedLines = served.chapter.lines.filter(
      (line) => !alignedLines.includes(line),
    )

    expect(listPosts(served).map(([path]) => path)).toEqual([
      lemmaBatchPath,
      ...layoutRequests,
      buildAnnotationUrl(
        'lemmatization',
        1,
        `revision-${layoutRequests.length + 1}`,
      ),
    ])
    expect(listLineNumbers(served.chapter.lines)).toEqual(numbers)
    expect(listLineNumbers(changedLines)).toEqual(['3'])
    expect(
      changedLines[0].variants[0].reconstructionTokens.map(
        (token) => token.uniqueLemma,
      ),
    ).toEqual([undefined, ['eliš I']])
    expect(
      changedLines[0].variants[0].manuscripts[0].atfTokens[0],
    ).toMatchObject({ alignment: 1, uniqueLemma: [] })
  },
)
