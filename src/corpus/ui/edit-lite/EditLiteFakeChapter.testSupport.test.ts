import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toDeletedLineDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  listLineNumbers,
  toSavedLine,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import EditLiteFakeApi, {
  createChapterRequests,
} from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeChapter, {
  emptyRevisionMessage,
  invalidRequestMessage,
  missingRevisionMessage,
  positionOutOfRangeMessage,
  samePositionMessage,
  staleRevisionMessage,
  toChapterId,
} from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { ApiError } from 'http/ApiClient'
import { createChapterUrl } from 'test-support/FakeApiExpectation'

const chapterUrl = createChapterUrl(editLiteChapterId)
const lines: readonly Line[] = buildEditLiteLines(4)
const outline: ChapterOutline = buildEditLiteOutline(lines)
const moveUrl = 'lines/move?view=outline&revision=revision-1'

let chapter: EditLiteFakeChapter
let fakeApi: EditLiteFakeApi

const { get, post } = createChapterRequests(editLiteChapterId, () => fakeApi)

async function expectRefusal(
  request: Promise<unknown>,
  status: number,
  message: string,
): Promise<void> {
  const error = await request.catch((reason: unknown) => reason)

  expect(error).toBeInstanceOf(ApiError)
  expect(error).toMatchObject({
    status,
    message,
    data: { description: message },
  })
  expect(chapter.lines).toBe(lines)
  expect(chapter.revision).toBe('revision-1')
}

beforeEach(() => {
  chapter = new EditLiteFakeChapter(outline, lines)
  fakeApi = new EditLiteFakeApi().serveChapter(chapter)
})

test('the chapter is found by the address of its outline', () => {
  expect(toChapterId(outline)).toEqual(editLiteChapterId)
})

test('the outline lists the stored lines by position', async () => {
  await expect(get('outline')).resolves.toEqual(outline)
  expect(chapter.outline).toEqual(outline)
  expect(chapter.revision).toBe(outline.revision)
  expect(chapter.lines).toBe(lines)
})

test('lines are served by position at the stored revision or without one', async () => {
  await expect(
    get('lines?offset=1&limit=2&revision=revision-1'),
  ).resolves.toEqual({
    total: 4,
    offset: 1,
    limit: 2,
    lines: [toLineDto(lines[1]), toLineDto(lines[2])],
    revision: 'revision-1',
  })
  await expect(get('lines?offset=3&limit=5')).resolves.toMatchObject({
    lines: [toLineDto(lines[3])],
  })
})

test('lines of another revision are refused as a conflict', async () => {
  await expectRefusal(
    get('lines?offset=0&limit=1&revision=revision-2'),
    409,
    staleRevisionMessage,
  )
})

test.each<[number, number, string[]]>([
  [0, 2, ['2', '3', '1', '4']],
  [3, 0, ['4', '1', '2', '3']],
  [1, 2, ['1', '3', '2', '4']],
  [2, 1, ['1', '3', '2', '4']],
  [0, 3, ['2', '3', '4', '1']],
])(
  'a move from %i to %i reorders the stored lines without renumbering',
  async (from, to, numbers) => {
    const movedOutline = (await post(moveUrl, { from, to })) as ChapterOutline

    expect(listLineNumbers(movedOutline.lines)).toEqual(numbers)
    expect(movedOutline.lines.map((line) => line.index)).toEqual([0, 1, 2, 3])
    expect(movedOutline.revision).toBe('revision-2')
    expect(listLineNumbers(chapter.lines)).toEqual(numbers)
    expect(chapter.lines[to]).toBe(lines[from])
    expect(chapter.lines.filter((line) => !lines.includes(line))).toEqual([])
    await expect(get('outline')).resolves.toEqual(movedOutline)
    await expect(
      get('lines?offset=0&limit=4&revision=revision-2'),
    ).resolves.toMatchObject({ lines: chapter.lines.map(toLineDto) })
    await expect(
      get('lines?offset=0&limit=4&revision=revision-1'),
    ).rejects.toThrow(staleRevisionMessage)
  },
)

test.each<[string, string, { from: number; to: number }, number, string]>([
  [
    'another revision',
    'lines/move?view=outline&revision=revision-0',
    { from: 0, to: 2 },
    409,
    staleRevisionMessage,
  ],
  [
    'no revision',
    'lines/move?view=outline',
    { from: 0, to: 2 },
    422,
    missingRevisionMessage,
  ],
  [
    'an empty revision',
    'lines/move?view=outline&revision=',
    { from: 0, to: 2 },
    422,
    emptyRevisionMessage,
  ],
  [
    'a line that is not there',
    moveUrl,
    { from: 4, to: 0 },
    422,
    positionOutOfRangeMessage(4, 4),
  ],
  [
    'a place that is not there',
    moveUrl,
    { from: 0, to: 5 },
    422,
    positionOutOfRangeMessage(5, 4),
  ],
  [
    'the place of the line',
    moveUrl,
    { from: 2, to: 2 },
    422,
    samePositionMessage,
  ],
])(
  'a move with %s is refused and moves nothing',
  async (_name, path, body, status, message) => {
    await expectRefusal(post(path, body), status, message)
  },
)

test.each<[string, unknown]>([
  ['no source', { to: 1 }],
  ['no target', { from: 0 }],
  ['a text as a position', { from: '0', to: 1 }],
  ['a truth value as a position', { from: 0, to: true }],
  ['a fraction as a position', { from: 0.5, to: 1 }],
  ['a negative position', { from: 0, to: -1 }],
  ['nothing as a position', { from: null, to: 1 }],
  ['an unknown field', { from: 0, to: 1, extra: 1 }],
  ['a list of positions', [0, 1]],
  ['no body', null],
])('a move with %s is not valid', async (_name, body) => {
  await expectRefusal(post(moveUrl, body), 400, invalidRequestMessage)
})

test('edited, deleted and new lines are stored by position', async () => {
  const edited = setLineNumber(lines[1], '2a')
  const added = setLineNumber(lines[3], '9')
  const savedOutline = (await post('lines?view=outline&revision=revision-1', {
    new: [toLineDto(added)],
    deleted: [0],
    edited: [{ index: 1, line: toLineDto(edited) }],
  })) as ChapterOutline

  expect(listLineNumbers(savedOutline.lines)).toEqual(['2a', '3', '4', '9'])
  expect(savedOutline.lines.map((line) => line.index)).toEqual([0, 1, 2, 3])
  expect(savedOutline.revision).toBe('revision-2')
  expect(chapter.lines).toEqual([
    toSavedLine(edited),
    lines[2],
    lines[3],
    toSavedLine(added),
  ])
  expect(chapter.lines[1]).toBe(lines[2])
})

test('a line update is checked against the revision when it has one', async () => {
  await expectRefusal(
    post('lines?view=outline&revision=revision-9', toDeletedLineDto(0)),
    409,
    staleRevisionMessage,
  )
  await post('lines?view=outline', toDeletedLineDto(0))

  expect(chapter.lines).toEqual(lines.slice(1))
  expect(chapter.revision).toBe('revision-2')
})

test('requests the chapter does not answer are left to the expectations', async () => {
  const importedOutline = buildEditLiteOutline(lines, 'revision-7')
  fakeApi
    .allowChapterManuscripts(editLiteChapterId, [{ id: 1 }])
    .expectImportLines(outline, '1. kur', importedOutline)

  await expect(get('manuscripts')).resolves.toEqual([{ id: 1 }])
  await expect(
    post('import?view=outline&revision=revision-1', { atf: '1. kur' }),
  ).resolves.toBe(importedOutline)
  await expect(get('display')).rejects.toThrow(
    `Unexpected not-authenticated fetchJson: ${chapterUrl}/display`,
  )
  await expect(
    post('lines/move?revision=revision-1', { from: 0, to: 2 }),
  ).rejects.toThrow('Unexpected postJson')
  await expect(
    fakeApi.client.fetchJson(`${chapterUrl}I/outline`, false),
  ).rejects.toThrow('Unexpected not-authenticated fetchJson')
  expect(chapter.lines).toBe(lines)
})
