import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { createLine, EditStatus, Line } from 'corpus/domain/line'
import { ApiError } from 'http/ApiClient'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

const original: Line = createLine({ number: '5' })
const neighbour: Line = createLine({ number: '6' })
const draft: Line = { ...original, status: EditStatus.EDITED }
const savedOutline: ChapterOutline = { ...apiOutline, revision: 'revision-2' }
const conflict = new ApiError('Conflict', {}, 409)

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

function requestedLineRevisions(): unknown[] {
  return textService.findChapterLines.mock.calls.map(
    ([, , , , options]) => options?.revision,
  )
}

beforeEach(async () => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterLines.mockResolvedValue([original])
  source = new ApiChapterEditSource(textService, editChapterId, true)
  await source.loadOutline()
})

it('retries a read that conflicted with a save in flight', async () => {
  const save = deferred<ChapterOutline>()
  textService.updateEditedLines.mockReturnValueOnce(save.promise)
  const saved = source.saveLine(0, original, draft)
  await settle()
  textService.findChapterLines
    .mockRejectedValueOnce(conflict)
    .mockResolvedValueOnce([neighbour])

  const lines = source.loadLines(1, 1)
  await settle()
  save.resolve(savedOutline)

  await expect(lines).resolves.toEqual([neighbour])
  await saved
  expect(requestedLineRevisions()).toEqual([
    apiOutline.revision,
    apiOutline.revision,
    'revision-2',
  ])
})

it('retries a word count that conflicted with a save in flight', async () => {
  const instances = {
    word: 'kur',
    words: 1,
    lemmatized: 0,
    lines: [0],
    revision: 'revision-2',
  }
  const save = deferred<ChapterOutline>()
  textService.updateEditedLines.mockReturnValueOnce(save.promise)
  textService.countWordInstances
    .mockRejectedValueOnce(conflict)
    .mockResolvedValueOnce(instances)
  const saved = source.saveLine(0, original, draft)
  await settle()

  const counted = source.countWordInstances('kur')
  await settle()
  save.resolve(savedOutline)

  await expect(counted).resolves.toEqual(instances)
  await saved
  expect(
    textService.countWordInstances.mock.calls.map(([, , revision]) => revision),
  ).toEqual([apiOutline.revision, 'revision-2'])
})
