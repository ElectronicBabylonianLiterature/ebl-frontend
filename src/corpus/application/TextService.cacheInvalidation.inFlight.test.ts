import { chapterId } from 'corpus/application/TextService.testSupport'
import { chapterDto } from 'test-support/test-corpus-text'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'
import {
  createChapterCacheTestContext,
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

  await service.updateLines(chapterId, [])
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
  await service.updateLines(chapterId, [])
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
  const saveResponse = deferred<typeof chapterDto>()
  apiClient.postJson.mockReturnValueOnce(saveResponse.promise)
  const save = service.updateLines(chapterId, [])
  await service.findChapterDisplay(chapterId)

  saveResponse.resolve(chapterDto)
  await save
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('invalidates when POST succeeds before provenance loading finishes', async () => {
  const { apiClient, fragmentServiceMock, service } =
    createChapterCacheTestContext()
  await service.findChapterDisplay(chapterId)
  const provenances = deferred<never[]>()
  fragmentServiceMock.fetchProvenances.mockReturnValueOnce(provenances.promise)
  const save = service.updateLines(chapterId, [])
  await settle()
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  provenances.resolve([])
  await save
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('scope changes during a save cannot preserve old display data', async () => {
  const scope = { current: 'user-a' }
  const { apiClient, service } = createChapterCacheTestContext(
    () => scope.current,
  )
  const oldResponse = deferred<typeof staleDisplayDto>()
  const saveResponse = deferred<typeof chapterDto>()
  apiClient.fetchJson.mockReturnValueOnce(oldResponse.promise)
  apiClient.postJson.mockReturnValueOnce(saveResponse.promise)
  const oldRead = service.findChapterDisplay(chapterId)
  const save = service.updateLines(chapterId, [])
  await settle()

  scope.current = 'user-b'
  saveResponse.resolve(chapterDto)
  await save
  oldResponse.resolve(staleDisplayDto)
  await oldRead
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})
