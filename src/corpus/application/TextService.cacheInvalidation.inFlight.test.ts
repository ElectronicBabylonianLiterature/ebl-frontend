import { noLineChanges } from 'corpus/application/edit-lite/lineEdits'
import { chapterId } from 'corpus/application/TextService.testSupport'
import { apiOutline } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'
import {
  createChapterCacheTestContext,
  createHttpSuccessPostJsonMock,
  freshDisplayDto,
  staleDisplayDto,
} from 'corpus/application/TextService.cacheInvalidation.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

test('an old pending read cannot repopulate the cache after a save', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  const oldResponse = deferred<typeof staleDisplayDto>()
  apiClient.fetchJson.mockReturnValueOnce(oldResponse.promise)
  const oldRead = service.findChapterDisplay(chapterId)
  await settle()

  await service.updateEditedLines(chapterId, noLineChanges)
  oldResponse.resolve(staleDisplayDto)
  await oldRead
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('an old pending read cannot replace a newer display or its request', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  const oldResponse = deferred<typeof staleDisplayDto>()
  const freshResponse = deferred<typeof freshDisplayDto>()
  apiClient.fetchJson
    .mockReturnValueOnce(oldResponse.promise)
    .mockReturnValueOnce(freshResponse.promise)
  const oldRead = service.findChapterDisplay(chapterId)
  await settle()
  await service.updateEditedLines(chapterId, noLineChanges)
  const freshRead = service.findChapterDisplay(chapterId)
  await settle()

  oldResponse.resolve(staleDisplayDto)
  await oldRead
  const sharedFreshRead = service.findChapterDisplay(chapterId)
  freshResponse.resolve(freshDisplayDto)

  await expect(freshRead).resolves.toMatchObject({ atf: 'saved display' })
  await expect(sharedFreshRead).resolves.toMatchObject({ atf: 'saved display' })
  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('invalidates a read started while the save is pending', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  const saveResponse = deferred<ChapterOutline>()
  apiClient.postJson.mockImplementationOnce(
    createHttpSuccessPostJsonMock(saveResponse.promise),
  )
  const save = service.updateEditedLines(chapterId, noLineChanges)
  await service.findChapterDisplay(chapterId)

  saveResponse.resolve(apiOutline)
  await save
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('scope changes during a save cannot preserve old display data', async () => {
  const scope = { current: 'user-a' }
  const { apiClient, service } = createChapterCacheTestContext(
    () => scope.current,
  )
  const oldResponse = deferred<typeof staleDisplayDto>()
  const saveResponse = deferred<ChapterOutline>()
  apiClient.fetchJson.mockReturnValueOnce(oldResponse.promise)
  apiClient.postJson.mockImplementationOnce(
    createHttpSuccessPostJsonMock(saveResponse.promise),
  )
  const oldRead = service.findChapterDisplay(chapterId)
  const save = service.updateEditedLines(chapterId, noLineChanges)
  await settle()

  scope.current = 'user-b'
  saveResponse.resolve(apiOutline)
  await save
  oldResponse.resolve(staleDisplayDto)
  await oldRead
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})
