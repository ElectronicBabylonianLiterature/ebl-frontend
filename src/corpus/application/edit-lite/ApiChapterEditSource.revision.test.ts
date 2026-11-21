import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
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
const draft: Line = {
  ...original,
  translation: '#tr.en: They mingled their waters',
  status: EditStatus.EDITED,
}
const savedOutline: ChapterOutline = { ...apiOutline, revision: 'revision-2' }
const laterOutline: ChapterOutline = { ...apiOutline, revision: 'revision-3' }
const conflict = new ApiError('Conflict', {}, 409)

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

function requestedLineRevisions(): (string | undefined)[] {
  return textService.findChapterLines.mock.calls.map(
    ([, , , , revision]) => revision,
  )
}

function postedRevisions(): (string | undefined)[] {
  return textService.updateEditedLines.mock.calls.map(
    ([, , revision]) => revision,
  )
}

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterLines.mockImplementation(() =>
    Promise.resolve([original]),
  )
  textService.updateEditedLines
    .mockResolvedValueOnce(savedOutline)
    .mockResolvedValue(laterOutline)
  source = new ApiChapterEditSource(textService, editChapterId, true)
})

it('describes a changed chapter in words a user can act on', () => {
  expect(chapterChangedMessage).toBe(
    'The chapter was changed by someone else since it was loaded. Reload the chapter and apply your changes again.',
  )
})

it('sends no revision before the outline is loaded', async () => {
  await source.loadLines(0, 1)
  await source.saveLine(4, original, draft)

  expect(requestedLineRevisions()).toEqual([undefined, undefined])
  expect(postedRevisions()).toEqual([undefined])
})

it('sends the revision of the loaded outline with every lines request', async () => {
  const signal = new AbortController().signal
  await source.loadOutline()

  await source.loadLines(0, 15, signal)

  expect(textService.findChapterLines.mock.calls).toEqual([
    [editChapterId, 0, 10, signal, 'revision-1'],
    [editChapterId, 10, 5, signal, 'revision-1'],
  ])
})

it('sends the revision of the outline that was loaded last', async () => {
  await source.loadOutline()
  textService.findChapterOutline.mockResolvedValueOnce(savedOutline)
  await source.loadOutline()

  await source.loadLines(0, 1)

  expect(requestedLineRevisions()).toEqual(['revision-2'])
})

it('saves against the revision of the loaded outline', async () => {
  await source.loadOutline()

  await expect(source.saveLine(4, original, draft)).resolves.toBe(savedOutline)

  expect(textService.findChapterLines.mock.calls).toEqual([
    [editChapterId, 4, 1, undefined, 'revision-1'],
  ])
  expect(textService.updateEditedLines.mock.calls).toEqual([
    [editChapterId, source.describeSave(4, draft), 'revision-1'],
  ])
})

it('continues with the revision of the saved outline', async () => {
  await source.loadOutline()
  await source.saveLine(4, original, draft)

  await source.loadLines(4, 1)
  await expect(source.saveLine(4, original, draft)).resolves.toBe(laterOutline)
  await source.loadLines(4, 1)

  expect(requestedLineRevisions()).toEqual([
    'revision-1',
    'revision-2',
    'revision-2',
    'revision-3',
  ])
  expect(postedRevisions()).toEqual(['revision-1', 'revision-2'])
})

it('sends queued lines requests with the revision of a save that finished meanwhile', async () => {
  const pending = deferred<readonly Line[]>()
  await source.loadOutline()
  textService.findChapterLines
    .mockReturnValueOnce(pending.promise)
    .mockReturnValueOnce(pending.promise)
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce([original])

  const lines = source.loadLines(0, 40)
  await settle()
  await source.saveLine(4, original, draft)
  pending.resolve([original])
  await lines

  expect(requestedLineRevisions()).toEqual([
    'revision-1',
    'revision-1',
    'revision-1',
    'revision-1',
    'revision-2',
  ])
})

describe('when the chapter is no longer at the sent revision', () => {
  beforeEach(async () => {
    await source.loadOutline()
  })

  it('rejects loading lines with the reload message', async () => {
    textService.findChapterLines.mockRejectedValueOnce(conflict)

    await expect(source.loadLines(0, 1)).rejects.toThrow(
      new Error(chapterChangedMessage),
    )
    await source.loadLines(0, 1)

    expect(requestedLineRevisions()).toEqual(['revision-1', 'revision-1'])
  })

  it('rejects the save with the reload message when the refetch conflicts', async () => {
    textService.findChapterLines.mockRejectedValueOnce(conflict)

    await expect(source.saveLine(4, original, draft)).rejects.toThrow(
      new Error(chapterChangedMessage),
    )
    await source.loadLines(0, 1)

    expect(textService.updateEditedLines).not.toHaveBeenCalled()
    expect(requestedLineRevisions()).toEqual(['revision-1', 'revision-1'])
  })

  it('rejects the save with the reload message when the post conflicts', async () => {
    textService.updateEditedLines.mockReset().mockRejectedValueOnce(conflict)

    await expect(source.saveLine(4, original, draft)).rejects.toThrow(
      new Error(chapterChangedMessage),
    )
    await source.loadLines(0, 1)

    expect(postedRevisions()).toEqual(['revision-1'])
    expect(requestedLineRevisions()).toEqual(['revision-1', 'revision-1'])
  })
})

it.each([
  ['an unprocessable request', new ApiError('Invalid line', {}, 422)],
  ['a response without a status', new ApiError('Failed to fetch', {})],
])('passes %s on unchanged and keeps the revision', async (_name, error) => {
  await source.loadOutline()
  textService.findChapterLines.mockRejectedValueOnce(error)
  textService.updateEditedLines.mockReset().mockRejectedValueOnce(error)

  await expect(source.loadLines(0, 1)).rejects.toBe(error)
  await expect(source.saveLine(4, original, draft)).rejects.toBe(error)
  await source.loadLines(0, 1)

  expect(requestedLineRevisions()).toEqual([
    'revision-1',
    'revision-1',
    'revision-1',
  ])
})
