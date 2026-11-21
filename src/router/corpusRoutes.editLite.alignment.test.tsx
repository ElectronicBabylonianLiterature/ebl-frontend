import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  listGets,
  listPosts,
  waitForSavedView,
} from 'corpus/ui/edit-lite/annotationRoute.testSupport'
import {
  editLiteChapterId,
  leavePage,
  openServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import {
  buildAnnotatedLineUrl,
  buildAnnotationUrl,
  buildEditLiteLines,
  buildLineUrl,
  buildMoveUrl,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { duplicateAlignmentMessage } from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import {
  alignWord,
  button,
  manuscriptRow,
  omitWord,
  openLoadedView,
  wordButton,
  wordLabel,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import {
  deleteSelectedLine,
  loadedEditor,
  moveSelectedLineTo,
  options,
  waitForOrder,
} from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)

const chapterUrl = createChapterUrl(editLiteChapterId)
const lines: readonly Line[] = buildEditLiteLines(4)

test('an alignment is loaded with the tokens of its line, saved to its line and shown again', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  await loadedEditor('1')

  expect(listGets(served, 'tokens')).toEqual([])

  await openLoadedView('Alignment')
  await alignWord(manuscriptRow(1), 'e-nu-ma', 'enūma', 'e-nu')
  await omitWord(manuscriptRow(2), 'enūma')

  expect(within(options()[0]).getByText('edited')).toBeVisible()
  expect(leavePage()).not.toBe('')

  await userEvent.click(button('Save alignment'))
  await waitForSavedView()
  await openLoadedView('Alignment')
  const [variant] = served.chapter.lines[0].variants

  expect(listPosts(served)).toEqual([
    [
      buildAnnotationUrl('alignment', 0, 'revision-1'),
      {
        alignment: [
          [
            {
              alignment: [
                {
                  value: 'e-nu-ma',
                  alignment: 1,
                  variant: 'e-nu',
                  type: 'AkkadianWord',
                  language: 'AKKADIAN',
                },
                {
                  value: 'e-liš',
                  alignment: 3,
                  variant: '',
                  type: '',
                  language: '',
                },
              ],
              omittedWords: [],
            },
            {
              alignment: [
                { value: '[x' },
                { value: 'x' },
                { value: 'x]' },
                {
                  value: 'e-li-iš',
                  alignment: 3,
                  variant: '',
                  type: '',
                  language: '',
                },
              ],
              omittedWords: [1],
            },
          ],
        ],
      },
    ],
  ])
  expect(listGets(served, 'tokens')).toEqual([
    buildAnnotatedLineUrl(0, 'revision-1'),
    buildAnnotatedLineUrl(0, 'revision-2'),
  ])
  expect(listGets(served, 'revision-2')).toEqual([
    buildLineUrl(0, 'revision-2'),
    buildAnnotatedLineUrl(0, 'revision-2'),
  ])
  expect(variant.manuscripts[1].omittedWords).toEqual([1])
  expect(variant.manuscripts[0].atfTokens[0]).toMatchObject({
    alignment: 1,
    variant: { value: 'e-nu', type: 'AkkadianWord' },
  })
  expect(served.chapter.lines.slice(1)).toEqual(lines.slice(1))
  expect(wordLabel(manuscriptRow(1), 'e-liš')).not.toHaveClass(
    'Word--suggestion',
  )
  expect(within(manuscriptRow(2)).getByText('enūma')).toBeVisible()
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
  expect(leavePage()).toBe('')
  expect(listGets(served, 'lemma')).toEqual([])
  expect(listGets(served, '/words')).toEqual([])
})

test('an alignment that the server refuses keeps the changes and shows its reason', async () => {
  const served = await openServedEditLiteRoute(lines, '?line=1')
  await loadedEditor('1')
  await openLoadedView('Alignment')
  await alignWord(manuscriptRow(1), 'e-nu-ma', 'eliš')
  await userEvent.click(button('Save alignment'))

  expect(await screen.findByText(duplicateAlignmentMessage)).toBeVisible()
  expect(within(options()[0]).getByText('failed')).toBeVisible()
  expect(wordButton(manuscriptRow(1), 'e-nu-ma')).toHaveTextContent(
    /^e-nu-maeliš$/,
  )
  expect(served.chapter.lines).toBe(lines)

  await served.fakeApi.client.postJson(buildMoveUrl('revision-1'), {
    from: 2,
    to: 3,
  })
  await alignWord(manuscriptRow(1), 'e-nu-ma', 'enūma')
  await userEvent.click(button('Save alignment'))

  expect(await screen.findByText(chapterChangedMessage)).toBeVisible()
  expect(served.chapter.lines[0]).toBe(lines[0])
  expect(listPosts(served).map(([path]) => path)).toEqual([
    buildAnnotationUrl('alignment', 0, 'revision-1'),
    buildMoveUrl('revision-1'),
    buildAnnotationUrl('alignment', 0, 'revision-1'),
  ])
})

test.each<[string, () => Promise<void>, string[], string]>([
  [
    'across a moved line',
    (): Promise<void> => moveSelectedLineTo('After line 3'),
    ['2', '3', '1', '4'],
    buildMoveUrl('revision-1'),
  ],
  [
    'when a line before it is deleted',
    deleteSelectedLine,
    ['2', '3', '4'],
    `${chapterUrl}/lines?view=outline&revision=revision-1`,
  ],
])(
  'an alignment draft follows its line %s and is saved to it',
  async (_name, changeLayout, numbers, layoutRequest) => {
    const served = await openServedEditLiteRoute(lines, '?line=3')
    await loadedEditor('3')
    await openLoadedView('Alignment')
    await omitWord(manuscriptRow(1), 'apsûm-ma')
    await userEvent.click(options()[0])
    await loadedEditor('1')
    await changeLayout()
    await waitForOrder(numbers)
    await userEvent.click(options()[1])
    await within(screen.getByRole('region', { name: 'Line 3' })).findByRole(
      'group',
      { name: 'Reconstruction' },
    )
    await userEvent.click(button('Save alignment'))
    await waitForSavedView()
    const changedLines = served.chapter.lines.filter(
      (line) => !lines.includes(line),
    )

    expect(listPosts(served).map(([path]) => path)).toEqual([
      layoutRequest,
      buildAnnotationUrl('alignment', 1, 'revision-2'),
    ])
    expect(listLineNumbers(served.chapter.lines)).toEqual(numbers)
    expect(listLineNumbers(changedLines)).toEqual(['3'])
    expect(changedLines[0].variants[0].manuscripts[0]).toMatchObject({
      omittedWords: [1],
      atfTokens: [expect.objectContaining({ alignment: 1 })],
    })
  },
)
