import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemorySession from 'auth/Session'
import {
  listGets,
  listPosts,
  waitForSavedView,
} from 'corpus/ui/edit-lite/annotationRoute.testSupport'
import {
  editLiteChapterId,
  openServedEditLiteRoute,
  ServedEditLiteRoute,
} from 'corpus/ui/edit-lite/ChapterEditLiteView.testSupport'
import { buildAnnotationUrl } from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeDictionary, {
  lemmaBatchPath,
  properNounPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import {
  confirmUpdateAll,
  instanceLines,
  instanceOptions,
  listReconstructionLemmas,
  openWordActions,
} from 'corpus/ui/edit-lite/instances.testSupport'
import {
  activePopover,
  button,
  expectActiveWord,
  openLoadedView,
  openWord,
  popoverField,
  queryActivePopover,
  reconstructionRow,
} from 'corpus/ui/edit-lite/LineViews.testSupport'
import { loadedEditor } from 'corpus/ui/edit-lite/SplitLines.testSupport'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

jest.mock('editor/Editor', () =>
  jest.requireActual('editor/Editor.testSupport'),
)
jest.mock('@restart/ui/usePopper', () =>
  jest.requireActual('corpus/ui/edit-lite/usePopper.testSupport'),
)

const instancesUrl = `${createChapterUrl(editLiteChapterId)}/lemmatization/instances`
const lineLemmatization = {
  lemmatization: [
    {
      reconstruction: [
        { value: '%n' },
        { value: 'reconstruction', uniqueLemma: [] },
        { value: 'of', uniqueLemma: [] },
        { value: 'line', uniqueLemma: ['line I'] },
        { value: '4', uniqueLemma: [] },
      ],
      manuscripts: [
        [
          { value: 'kur', uniqueLemma: [] },
          { value: '4', uniqueLemma: [] },
        ],
      ],
    },
  ],
}

function openLine(session?: MemorySession): Promise<ServedEditLiteRoute> {
  return openServedEditLiteRoute(
    instanceLines,
    '?line=4',
    new EditLiteFakeDictionary(
      instanceOptions.words ?? [],
      instanceOptions.suggestions,
    ),
    session,
  )
}

function listChapterPosts(served: ServedEditLiteRoute): unknown[][] {
  return listPosts(served).filter(([path]) => path !== lemmaBatchPath)
}

test('the line is saved first and then every instance of the word in the chapter gets the lemma', async () => {
  const served = await openLine()
  await loadedEditor('4')
  await openLoadedView('Lemmatization')
  await openWord(reconstructionRow(), 'line')
  await confirmUpdateAll()
  await waitFor(() => expect(queryActivePopover()).toBeInTheDocument())

  expectActiveWord(reconstructionRow(), 'line', 'Lemma')
  expect(listGets(served, 'instances')).toEqual([
    `${instancesUrl}?word=line&revision=revision-1`,
  ])
  expect(listChapterPosts(served)).toEqual([
    [buildAnnotationUrl('lemmatization', 3, 'revision-1'), lineLemmatization],
    [
      `${instancesUrl}?view=outline&revision=revision-2`,
      { word: 'line', uniqueLemma: ['line I'] },
    ],
  ])
  expect(listReconstructionLemmas(served.chapter.lines.slice(3))).toEqual([
    [undefined, [], [], ['line I'], []],
    [undefined, [], [], ['line I'], []],
    [undefined, [], [], ['line I'], []],
  ])
  expect(
    served.chapter.lines
      .slice(3)
      .flatMap((line) => line.variants[0].manuscripts[0].atfTokens)
      .map((token) => token.uniqueLemma),
  ).toEqual([[], [], [], [], [], []])
  expect(served.chapter.lines.slice(0, 3)).toEqual(instanceLines.slice(0, 3))
  served.chapter.lines
    .slice(0, 3)
    .forEach((line, index) => expect(line).toBe(instanceLines[index]))
  expect(served.chapter.revision).toBe('revision-3')
  expect(screen.queryByText('edited')).not.toBeInTheDocument()
})

test('a proper noun is created in the dictionary and stored when the line is saved', async () => {
  const served = await openLine(
    new MemorySession(['read:texts', 'write:texts', 'create:proper_nouns']),
  )
  await loadedEditor('4')
  await openLoadedView('Lemmatization')
  await openWordActions()
  await userEvent.click(
    within(activePopover()).getByRole('button', {
      name: 'Create a new proper noun for reconstruction',
    }),
  )
  await userEvent.keyboard('Marduk')
  await userEvent.selectOptions(
    within(activePopover()).getByLabelText('properNoun-type-select'),
    'DN',
  )
  await userEvent.click(
    within(activePopover()).getByRole('button', {
      name: 'save-properNoun-creation',
    }),
  )
  await waitFor(() => expect(popoverField('Lemma')).toHaveFocus())

  expect(listChapterPosts(served)).toEqual([
    [properNounPath, { lemma: 'Marduk', namedEntityTags: ['DN'] }],
  ])
  expect(served.chapter.lines).toBe(instanceLines)

  await userEvent.click(button('Save lemmatization'))
  await waitForSavedView()

  expect(listChapterPosts(served).slice(1)).toEqual([
    [
      buildAnnotationUrl('lemmatization', 3, 'revision-1'),
      {
        lemmatization: [
          {
            ...lineLemmatization.lemmatization[0],
            reconstruction: [
              { value: '%n' },
              { value: 'reconstruction', uniqueLemma: ['Marduk DN'] },
              { value: 'of', uniqueLemma: [] },
              { value: 'line', uniqueLemma: [] },
              { value: '4', uniqueLemma: [] },
            ],
          },
        ],
      },
    ],
  ])
  expect(listReconstructionLemmas([served.chapter.lines[3]])).toEqual([
    [undefined, ['Marduk DN'], [], [], []],
  ])
  expect(reconstructionRow()).toHaveTextContent(
    /^%n reconstructionMarduk DN of lineline 4$/,
  )
})
