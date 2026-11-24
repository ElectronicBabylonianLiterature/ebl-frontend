import ApiChapterEditSource, {
  savingNotPermittedMessage,
} from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  apiOutline,
  createTextServiceMock,
  editChapterId,
} from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import createChapterEditSource, {
  ChapterEditTextService,
  createChapterEditSource as namedCreateChapterEditSource,
} from 'corpus/application/edit-lite/createChapterEditSource'

const apiError = new Error('Not Found')

let textService: jest.Mocked<ChapterEditTextService>

beforeEach(() => {
  textService = createTextServiceMock()
  textService.findChapterOutline.mockResolvedValue(apiOutline)
})

it('is exported by name and as default', () => {
  expect(namedCreateChapterEditSource).toBe(createChapterEditSource)
})

it('loads the outline from the chapter api', async () => {
  const signal = new AbortController().signal

  const { source, outline } = await createChapterEditSource({
    textService,
    id: editChapterId,
    canWrite: true,
    signal,
  })

  expect(source).toBeInstanceOf(ApiChapterEditSource)
  expect(outline).toBe(apiOutline)
  expect(textService.findChapterOutline.mock.calls).toEqual([
    [editChapterId, signal],
  ])
})

it('creates a source that refuses to save without write permission', async () => {
  const { source } = await createChapterEditSource({
    textService,
    id: editChapterId,
    canWrite: false,
  })

  await expect(source.deleteLine(0)).rejects.toThrow(savingNotPermittedMessage)
  expect(textService.updateChapterOutline).not.toHaveBeenCalled()
})

it('rejects when the outline request fails', async () => {
  textService.findChapterOutline.mockRejectedValue(apiError)

  await expect(
    createChapterEditSource({
      textService,
      id: editChapterId,
      canWrite: true,
    }),
  ).rejects.toBe(apiError)
})
