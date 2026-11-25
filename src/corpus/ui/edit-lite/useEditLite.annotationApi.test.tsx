import { waitFor } from '@testing-library/react'
import {
  toAcceptedAlignmentDto,
  toAcceptedLemmatizationDto,
} from 'corpus/application/edit-lite/acceptedAnnotations'
import { setWordLemma } from 'corpus/application/edit-lite/lemmaEdits'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  buildAlignmentDraft,
  draftOmittedWords,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildAnnotatedLineUrl,
  buildAnnotationUrl,
  buildEditLiteLines,
  buildLineUrl,
  buildMoveUrl,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeDictionary, {
  buildWordsPath,
  lemmaBatchPath,
} from 'corpus/ui/edit-lite/EditLiteFakeDictionary.testSupport'
import { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { AnnotationDraft } from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildDictionaryWord,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { toDeletedLineDto } from 'corpus/application/edit-lite/lineEdits'
import {
  findAnnotation,
  openView,
  saveView,
} from 'corpus/ui/edit-lite/useEditLite.annotations.testSupport'
import {
  moveAndWait,
  openServedEditLiteHook,
  ServedEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'
import {
  createChapterUrl,
  leadingArguments,
} from 'test-support/FakeApiExpectation'
import Lemma from 'transliteration/domain/Lemma'

type Editing = ServedEditLiteHook
type Draft = (editing: Editing) => Promise<[AnnotationDraft, unknown]>
type ChangeLayout = (editing: Editing) => Promise<unknown>

const lines: readonly Line[] = buildEditLiteLines(6)
const draftPosition = 3
const lineWord: Word = buildDictionaryWord('line')
const dictionary = new EditLiteFakeDictionary(
  [lineWord],
  [{ word: 'line', isNormalized: true, lemmas: [['line I']] }],
)

async function draftAlignment({
  view,
}: Editing): Promise<[AnnotationDraft, unknown]> {
  const line = await openView(view, draftPosition, 'alignment')
  const draft = buildAlignmentDraft(line)
  view.run((actions) => actions.changeAnnotation(draftPosition, draft, line))
  return [draft, { alignment: toAcceptedAlignmentDto(draft.alignment) }]
}

async function draftLemmatization({
  view,
}: Editing): Promise<[AnnotationDraft, unknown]> {
  const line = await openView(view, draftPosition, 'lemmatization')
  const loaded = findAnnotation(view, draftPosition)?.lemmas?.value ?? []
  const lemmatization = setWordLemma(
    loaded,
    loaded,
    line,
    { variantIndex: 0, manuscriptIndex: null, tokenIndex: 1 },
    [new Lemma(lineWord)],
  )
  const draft: AnnotationDraft = { view: 'lemmatization', lemmatization }
  view.run((actions) => actions.changeAnnotation(draftPosition, draft, line))
  return [draft, { lemmatization: toAcceptedLemmatizationDto(lemmatization) }]
}

async function deleteAndWait({ view }: Editing, index: number): Promise<void> {
  view.run((actions) => actions.deleteLine(index, jest.fn()))
  await waitFor(() => expect(view.state().layoutVersion).toBe(1))
}

function expectOnlyDraftLineChanged(
  { chapter }: Editing,
  position: number,
): Line {
  const changedLines = chapter.lines.filter((line) => !lines.includes(line))

  expect(changedLines).toEqual([chapter.lines[position]])
  expect(chapter.lines[position].number).toBe(lines[draftPosition].number)
  return chapter.lines[position]
}

describe.each<[string, Draft, (line: Line) => void]>([
  [
    'alignment',
    draftAlignment,
    (line): void => {
      const [manuscript] = line.variants[0].manuscripts
      expect(manuscript.omittedWords).toEqual(draftOmittedWords)
      expect(manuscript.atfTokens.map((token) => token.alignment)).toEqual([
        null,
        null,
      ])
    },
  ],
  [
    'lemmatization',
    draftLemmatization,
    (line): void => {
      const [variant] = line.variants
      expect(
        variant.reconstructionTokens.map((token) => token.uniqueLemma),
      ).toEqual([undefined, ['line I'], [], [], []])
      expect(variant.manuscripts[0].atfTokens[0].uniqueLemma).toEqual([])
    },
  ],
])('a %s draft', (name, makeDraft, expectStored) => {
  const annotation = name as 'alignment' | 'lemmatization'

  test.each<[string, ChangeLayout, number, unknown[], string[]]>([
    [
      'a line is moved down across its line',
      (editing) => moveAndWait(editing.view, 0, 4),
      2,
      [buildMoveUrl('revision-1'), { from: 0, to: 4 }],
      ['2', '3', '4', '5', '1', '6'],
    ],
    [
      'a line is moved up across its line',
      (editing) => moveAndWait(editing.view, 5, 1),
      4,
      [buildMoveUrl('revision-1'), { from: 5, to: 1 }],
      ['1', '6', '2', '3', '4', '5'],
    ],
    [
      'its line is moved',
      (editing) => moveAndWait(editing.view, draftPosition, 0),
      0,
      [buildMoveUrl('revision-1'), { from: draftPosition, to: 0 }],
      ['4', '1', '2', '3', '5', '6'],
    ],
    [
      'a line before its line is deleted',
      (editing) => deleteAndWait(editing, 1),
      2,
      [
        `${createChapterUrl(editLiteChapterId)}/lines?view=outline&revision=revision-1`,
        toDeletedLineDto(1),
      ],
      ['1', '3', '4', '5', '6'],
    ],
  ])(
    'is saved to the line it was made for after %s',
    async (_name, changeLayout, position, layoutRequest, numbers) => {
      const editing = await openServedEditLiteHook(lines, dictionary)
      const { chapter, fakeApi, view } = editing
      const [draft, body] = await makeDraft(editing)
      fakeApi.client.postJson.mockClear()
      await changeLayout(editing)

      expect(listLineNumbers(chapter.lines)).toEqual(numbers)
      expect(findAnnotation(view, position)?.draft).toBe(draft)
      expect(chapter.lines.filter((line) => !lines.includes(line))).toEqual([])

      await saveView(view, position, annotation)

      expect(leadingArguments(fakeApi.client.postJson, 2)).toEqual([
        layoutRequest,
        [buildAnnotationUrl(annotation, position, 'revision-2'), body],
      ])
      expectStored(expectOnlyDraftLineChanged(editing, position))
      expect(listLineNumbers(chapter.lines)).toEqual(numbers)
      expect(view.state().outline.revision).toBe('revision-3')
      expect(fakeApi.client.fetchJson).toHaveBeenLastCalledWith(
        buildLineUrl(position, 'revision-3'),
        false,
        undefined,
      )
      expect(view.state().lines[position].annotation).toBeUndefined()
    },
  )
})

test('the tokens, the suggestions and the words of a line are each requested once', async () => {
  const editing = await openServedEditLiteHook(lines, dictionary)
  const { fakeApi, view } = editing
  await draftLemmatization(editing)
  await saveView(view, draftPosition, 'lemmatization')
  fakeApi.client.fetchJson.mockClear()
  fakeApi.client.postJson.mockClear()
  const savedLine = await openView(view, draftPosition, 'lemmatization')
  await openView(view, draftPosition, 'alignment')
  await openView(view, draftPosition, 'lemmatization')

  expect(savedLine).toEqual(annotateLine(editing.chapter.lines[draftPosition]))
  expect(fakeApi.client.fetchJson.mock.calls).toEqual([
    [buildAnnotatedLineUrl(draftPosition, 'revision-2'), false, undefined],
    [buildWordsPath(['line I']), false, undefined],
  ])
  expect(fakeApi.client.postJson.mock.calls).toEqual([
    [
      lemmaBatchPath,
      {
        words: [
          { word: 'of', isNormalized: true },
          { word: 'line', isNormalized: true },
          { word: '4', isNormalized: true },
        ],
      },
      false,
    ],
  ])
})
