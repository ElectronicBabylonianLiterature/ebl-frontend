import { apiOutline } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  ChapterEndpoint,
  ChapterRequestBody,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  createChapterCacheTestContext,
  createHttpSuccessPostJsonMock,
  freshDisplayDto,
} from 'corpus/application/TextService.cacheInvalidation.testSupport'
import { chapterId } from 'corpus/application/TextService.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const saves: readonly [ChapterEndpoint, ChapterRequestBody][] = [
  ['lines', { new: [], deleted: [], edited: [] }],
  ['lines/move', { from: 0, to: 1 }],
  ['import', { atf: '1. kur' }],
  ['manuscripts', { manuscripts: [], uncertainFragments: [] }],
  ['lines/3/alignment', { alignment: [] }],
  ['lines/3/lemmatization', { lemmatization: [] }],
]

test.each(saves)(
  '%s saves that return the outline refresh a warm chapter display',
  async (endpoint, body) => {
    const { apiClient, service } = createChapterCacheTestContext()
    apiClient.postJson.mockImplementation(
      createHttpSuccessPostJsonMock(Promise.resolve(apiOutline)),
    )
    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      atf: 'old display',
    })

    await service.updateChapterOutline(chapterId, endpoint, body, 'revision-1')
    apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      atf: 'saved display',
    })
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  },
)

test('a refused save that returns the outline keeps the warm chapter display', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  apiClient.postJson.mockRejectedValue(new Error('refused'))
  await service.findChapterDisplay(chapterId)

  await expect(
    service.updateEditedLines(chapterId, { new: [], deleted: [], edited: [] }),
  ).rejects.toThrow('refused')

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'old display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
})
