import { waitFor } from '@testing-library/react'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildLineUrl,
  buildMoveUrl,
  listLineNumbers,
  toSavedLine,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  moveAndWait,
  openServedEditLiteHook,
  ServedEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'
import { ApiError } from 'http/ApiClient'
import {
  createChapterUrl,
  leadingArguments,
} from 'test-support/FakeApiExpectation'

type Editing = ServedEditLiteHook

const chapterUrl = createChapterUrl(editLiteChapterId)
const lines: readonly Line[] = buildEditLiteLines(6)
const draftPosition = 3
const draft: Line = setLineNumber(lines[draftPosition], '4a')
const savedDraft: Line = toSavedLine(draft)

function saveUrl(revision: string): string {
  return `${chapterUrl}/lines?view=outline&revision=${revision}`
}

async function startEditing(): Promise<Editing> {
  const editing = await openServedEditLiteHook(lines)
  editing.view.run((actions) => actions.changeLine(draftPosition, draft))
  return editing
}

async function saveDraft({ view }: Editing, position: number): Promise<void> {
  view.run((actions) => actions.saveLine(position))
  await waitFor(() =>
    expect(view.state().lines[position].original).toEqual(savedDraft),
  )
}

function expectOnlyDraftStored({ chapter }: Editing, position: number): void {
  expect(chapter.lines[position]).toEqual(savedDraft)
  expect(chapter.lines.filter((line) => !lines.includes(line))).toEqual([
    savedDraft,
  ])
  expect(lines.filter((line) => !chapter.lines.includes(line))).toEqual([
    lines[draftPosition],
  ])
}

test.each<[string, number, number, number, string[]]>([
  ['down across the edited line', 0, 4, 2, ['2', '3', '4', '5', '1', '6']],
  ['up across the edited line', 5, 1, 4, ['1', '6', '2', '3', '4', '5']],
  ['down onto its place', 2, 3, 2, ['1', '2', '4', '3', '5', '6']],
  ['up onto its place', 4, 3, 4, ['1', '2', '3', '5', '4', '6']],
  ['down before the edited line', 0, 2, 3, ['2', '3', '1', '4', '5', '6']],
  ['up after the edited line', 5, 4, 3, ['1', '2', '3', '4', '6', '5']],
])(
  'after a line is moved %s the draft is saved to the line it was made for',
  async (_name, from, to, position, numbers) => {
    const editing = await startEditing()
    const { chapter, fakeApi, view } = editing
    await moveAndWait(editing.view, from, to)

    expect(listLineNumbers(chapter.lines)).toEqual(numbers)
    expect(listLineNumbers(view.state().outline.lines)).toEqual(numbers)
    expect(numbers[position]).toBe(lines[draftPosition].number)
    expect(view.state().lines[position]).toEqual({
      status: 'ready',
      original: lines[draftPosition],
      draft,
      error: null,
    })

    await saveDraft(editing, position)

    expect(leadingArguments(fakeApi.client.postJson, 2)).toEqual([
      [buildMoveUrl('revision-1'), { from, to }],
      [saveUrl('revision-2'), toLineEditsDto(position, draft)],
    ])
    expect(fakeApi.client.fetchJson).toHaveBeenCalledWith(
      buildLineUrl(position, 'revision-2'),
      false,
      undefined,
    )
    expect(listLineNumbers(chapter.lines)).toEqual(
      numbers.map((number) => (number === '4' ? '4a' : number)),
    )
    expectOnlyDraftStored(editing, position)
    expect(view.state().outline.revision).toBe('revision-3')
  },
)

test('every request after a move carries the revision of the answer before it', async () => {
  const editing = await startEditing()
  const { chapter, fakeApi } = editing
  await moveAndWait(editing.view, 0, 4)
  await moveAndWait(editing.view, 5, 0)
  await saveDraft(editing, 3)

  expect(leadingArguments(fakeApi.client.postJson, 2)).toEqual([
    [buildMoveUrl('revision-1'), { from: 0, to: 4 }],
    [buildMoveUrl('revision-2'), { from: 5, to: 0 }],
    [saveUrl('revision-3'), toLineEditsDto(3, draft)],
  ])
  expect(listLineNumbers(chapter.lines)).toEqual([
    '6',
    '2',
    '3',
    '4a',
    '5',
    '1',
  ])
  expectOnlyDraftStored(editing, 3)
})

test('a move of a chapter that someone else changed is refused and moves nothing', async () => {
  const editing = await startEditing()
  const { chapter, fakeApi, view } = editing
  const onMoved = jest.fn()
  await fakeApi.client.postJson(buildMoveUrl('revision-1'), { from: 0, to: 1 })
  const linesBefore = view.state().lines
  view.run((actions) => actions.moveLine(draftPosition, 0, onMoved))
  const failedLine = await view.waitForLine(draftPosition, 'failed')

  expect(failedLine).toEqual({
    status: 'failed',
    original: lines[draftPosition],
    draft,
    error: chapterChangedMessage,
  })
  expect(leadingArguments(fakeApi.client.postJson, 2).pop()).toEqual([
    buildMoveUrl('revision-1'),
    { from: draftPosition, to: 0 },
  ])
  expect(listLineNumbers(chapter.lines)).toEqual(['2', '1', '3', '4', '5', '6'])
  expect(chapter.revision).toBe('revision-2')
  expect(view.state().outline).toBe(view.outline)
  expect(view.state().layoutVersion).toBe(0)
  expect({ ...view.state().lines, [draftPosition]: null }).toEqual({
    ...linesBefore,
    [draftPosition]: null,
  })
  expect(onMoved).not.toHaveBeenCalled()
})

test('the reason the server gives for refusing a move is shown and the move can be repeated', async () => {
  const editing = await startEditing()
  const { chapter, fakeApi, view } = editing
  const reason = 'Invalid extent: line 2 is before the translation of line 4'
  fakeApi.client.postJson.mockRejectedValueOnce(
    new ApiError(reason, { description: reason }, 422),
  )
  view.run((actions) => actions.moveLine(draftPosition, 0, jest.fn()))
  const failedLine = await view.waitForLine(draftPosition, 'failed')

  expect(failedLine.error).toBe(reason)
  expect(failedLine.draft).toBe(draft)
  expect(chapter.lines).toBe(lines)
  expect(view.state().layoutVersion).toBe(0)

  await moveAndWait(editing.view, draftPosition, 0)
  await saveDraft(editing, 0)

  expect(leadingArguments(fakeApi.client.postJson, 2)).toEqual([
    [buildMoveUrl('revision-1'), { from: draftPosition, to: 0 }],
    [buildMoveUrl('revision-1'), { from: draftPosition, to: 0 }],
    [saveUrl('revision-2'), toLineEditsDto(0, draft)],
  ])
  expect(listLineNumbers(chapter.lines)).toEqual([
    '4a',
    '1',
    '2',
    '3',
    '5',
    '6',
  ])
  expectOnlyDraftStored(editing, 0)
})
