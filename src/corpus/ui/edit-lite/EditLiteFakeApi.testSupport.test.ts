import _ from 'lodash'
import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toDeletedLineDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import EditLiteFakeApi, {
  createChapterRequests,
} from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeChapter from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'

type Expect = (fakeApi: EditLiteFakeApi) => EditLiteFakeApi

const lines: readonly Line[] = buildEditLiteLines(4)
const outline: ChapterOutline = buildEditLiteOutline(lines)
const savedOutline: ChapterOutline = buildEditLiteOutline(lines, 'revision-2')
const manuscripts = { manuscripts: [], uncertainFragments: ['K.1'] }

let fakeApi: EditLiteFakeApi

const { get, post } = createChapterRequests(editLiteChapterId, () => fakeApi)

beforeEach(() => {
  fakeApi = new EditLiteFakeApi()
})

test('the outline is expected at the address of its chapter', async () => {
  fakeApi.expectChapterOutline(outline)

  expect(() => fakeApi.verifyExpectations()).toThrow()
  await expect(get('outline')).resolves.toBe(outline)
  fakeApi.verifyExpectations()
})

test('a page of lines is allowed for the revision of the outline only', async () => {
  fakeApi.allowChapterLines(outline, 1, 2, lines)

  await expect(
    get('lines?offset=1&limit=2&revision=revision-1'),
  ).resolves.toEqual({
    total: 4,
    offset: 1,
    limit: 2,
    lines: [toLineDto(lines[1]), toLineDto(lines[2])],
    revision: 'revision-1',
  })
  await expect(
    get('lines?offset=1&limit=2&revision=revision-2'),
  ).rejects.toThrow('Unexpected not-authenticated fetchJson')
})

test('every page of up to three lines is allowed', async () => {
  fakeApi.allowAllChapterLines(outline, lines)
  const pages = await Promise.all(
    _.range(lines.length).flatMap((offset) =>
      _.range(1, 4).map((limit) =>
        get(`lines?offset=${offset}&limit=${limit}&revision=revision-1`),
      ),
    ),
  )

  expect(pages).toHaveLength(12)
  expect(pages[0]).toMatchObject({ offset: 0, limit: 1 })
  expect(pages[11]).toMatchObject({ offset: 3, limit: 3 })
  await expect(
    get('lines?offset=0&limit=4&revision=revision-1'),
  ).rejects.toThrow('Unexpected not-authenticated fetchJson')
})

test('the manuscripts are served', async () => {
  fakeApi.allowChapterManuscripts(editLiteChapterId, [{ id: 1 }])

  await expect(get('manuscripts')).resolves.toEqual([{ id: 1 }])
  fakeApi.verifyExpectations()
})

test.each<[string, unknown, Expect]>([
  [
    'lines',
    toDeletedLineDto(1),
    (api): EditLiteFakeApi =>
      api.expectUpdateEditedLines(outline, toDeletedLineDto(1), savedOutline),
  ],
  [
    'import',
    { atf: '1. kur' },
    (api): EditLiteFakeApi =>
      api.expectImportLines(outline, '1. kur', savedOutline),
  ],
  [
    'manuscripts',
    manuscripts,
    (api): EditLiteFakeApi =>
      api.expectSaveManuscripts(outline, manuscripts, savedOutline),
  ],
])(
  'an update of %s is expected against the revision of the outline',
  async (endpoint, body, expectUpdate) => {
    expectUpdate(fakeApi)

    expect(() => fakeApi.verifyExpectations()).toThrow()
    await expect(
      post(`${endpoint}?view=outline&revision=revision-2`, body),
    ).rejects.toThrow('Unexpected postJson')
    await expect(
      post(`${endpoint}?view=outline&revision=revision-1`, body),
    ).resolves.toBe(savedOutline)
    fakeApi.verifyExpectations()
  },
)

test('a served chapter answers before the expectations', async () => {
  const chapter = new EditLiteFakeChapter(outline, lines)
  fakeApi.expectChapterOutline(savedOutline).serveChapter(chapter)

  await expect(get('outline')).resolves.toEqual(outline)
  await expect(
    post('lines/move?view=outline&revision=revision-1', { from: 0, to: 3 }),
  ).resolves.toEqual(chapter.outline)
  expect(chapter.lines.map((line) => line.number)).toEqual(['2', '3', '4', '1'])
})
