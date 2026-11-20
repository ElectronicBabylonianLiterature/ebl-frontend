import ApiChapterEditSource, {
  savingNotPermittedMessage,
} from 'corpus/application/edit-lite/ApiChapterEditSource'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  ChapterChange,
  ChapterEditSource,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import { ChapterEditTextService } from 'corpus/application/edit-lite/createChapterEditSource'
import { createLine, EditStatus, Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import { ApiError } from 'http/ApiClient'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

type Apply = (source: ChapterEditSource) => Promise<ChapterOutline>

const chapterUrl = '/texts/L/1/2/chapters/Standard%20Babylonian/I'
const line: Line = createLine({ number: '9', status: EditStatus.NEW })
const manuscripts: readonly Manuscript[] = [new Manuscript({ id: 1 })]
const savedOutline: ChapterOutline = { ...apiOutline, revision: 'revision-2' }
const laterOutline: ChapterOutline = { ...apiOutline, revision: 'revision-3' }

const operations: readonly [string, ChapterChange, Apply][] = [
  ['addLine', { type: 'addLine', line }, (source) => source.addLine(line)],
  [
    'deleteLine',
    { type: 'deleteLine', index: 4 },
    (source) => source.deleteLine(4),
  ],
  [
    'importLines',
    { type: 'importLines', atf: '1. kur' },
    (source) => source.importLines('1. kur'),
  ],
  [
    'saveManuscripts',
    { type: 'saveManuscripts', manuscripts, uncertainFragments: ['K.1'] },
    (source) => source.saveManuscripts(manuscripts, ['K.1']),
  ],
]

let textService: jest.Mocked<ChapterEditTextService>
let source: ApiChapterEditSource

function postedRevisions(): (string | undefined)[] {
  return textService.updateChapterOutline.mock.calls.map(
    ([, , , revision]) => revision,
  )
}

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
  textService.findChapterLines.mockResolvedValue([])
  textService.updateChapterOutline
    .mockResolvedValueOnce(savedOutline)
    .mockResolvedValue(laterOutline)
  source = new ApiChapterEditSource(textService, editChapterId, true)
})

describe.each(operations)('%s', (_name, change, apply) => {
  const { endpoint, body } = toChapterUpdate(change)

  it('posts the change against the loaded revision', async () => {
    await source.loadOutline()

    await expect(apply(source)).resolves.toBe(savedOutline)

    expect(textService.updateChapterOutline.mock.calls).toEqual([
      [editChapterId, endpoint, body, 'revision-1'],
    ])
    expect(textService.findChapterLines).not.toHaveBeenCalled()
  })

  it('describes exactly the request it sends', async () => {
    await source.loadOutline()

    expect(source.describeChange(change)).toEqual({
      method: 'POST',
      url: `${chapterUrl}/${endpoint}?view=outline&revision=revision-1`,
      body,
    })
  })

  it('continues with the revision of the returned outline', async () => {
    await source.loadOutline()
    await apply(source)
    await source.loadLines(0, 1)
    await expect(apply(source)).resolves.toBe(laterOutline)

    expect(postedRevisions()).toEqual(['revision-1', 'revision-2'])
    expect(textService.findChapterLines.mock.calls).toEqual([
      [editChapterId, 0, 1, undefined, 'revision-2'],
    ])
    expect(source.describeChange(change).url).toBe(
      `${chapterUrl}/${endpoint}?view=outline&revision=revision-3`,
    )
  })

  it('rejects with the reload message when the chapter has moved on', async () => {
    await source.loadOutline()
    textService.updateChapterOutline
      .mockReset()
      .mockRejectedValueOnce(new ApiError('Conflict', {}, 409))
      .mockResolvedValue(savedOutline)

    await expect(apply(source)).rejects.toThrow(
      new Error(chapterChangedMessage),
    )
    await apply(source)

    expect(postedRevisions()).toEqual(['revision-1', 'revision-1'])
  })

  it('passes a validation error on unchanged', async () => {
    const error = new ApiError('Request data failed validation', {}, 422)
    textService.updateChapterOutline.mockReset().mockRejectedValueOnce(error)

    await expect(apply(source)).rejects.toBe(error)
  })

  it('refuses without write permission and sends nothing', async () => {
    const readOnlySource = new ApiChapterEditSource(
      textService,
      editChapterId,
      false,
    )

    await expect(apply(readOnlySource)).rejects.toThrow(
      savingNotPermittedMessage,
    )
    expect(textService.updateChapterOutline).not.toHaveBeenCalled()
  })

  it('waits for the change that was started before it', async () => {
    const firstPost = deferred<ChapterOutline>()
    await source.loadOutline()
    textService.updateChapterOutline
      .mockReset()
      .mockReturnValueOnce(firstPost.promise)
      .mockResolvedValue(laterOutline)

    const first = source.deleteLine(0)
    const second = apply(source)
    await settle()

    expect(postedRevisions()).toEqual(['revision-1'])

    firstPost.resolve(savedOutline)

    await expect(first).resolves.toBe(savedOutline)
    await expect(second).resolves.toBe(laterOutline)
    expect(postedRevisions()).toEqual(['revision-1', 'revision-2'])
  })
})

it('says in plain words that saving is not permitted', () => {
  expect(savingNotPermittedMessage).toBe(
    'You do not have permission to save changes to this chapter.',
  )
})

it('runs a line save and a deletion one after the other', async () => {
  const original = createLine({ number: '5' })
  const firstPost = deferred<ChapterOutline>()
  await source.loadOutline()
  textService.findChapterLines.mockResolvedValue([original])
  textService.updateEditedLines.mockReturnValueOnce(firstPost.promise)

  const save = source.saveLine(0, original, { ...original, number: '5a' })
  const deletion = source.deleteLine(1)
  await settle()

  expect(textService.updateChapterOutline).not.toHaveBeenCalled()

  firstPost.resolve(laterOutline)

  await expect(save).resolves.toBe(laterOutline)
  await expect(deletion).resolves.toBe(savedOutline)
  expect(postedRevisions()).toEqual(['revision-3'])
})
