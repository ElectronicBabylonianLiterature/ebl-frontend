import {
  chapterId,
  chapterUrl,
} from 'corpus/application/TextService.testSupport'
import {
  createChapterCacheTestContext,
  freshDisplayDto,
  noLineChanges,
} from 'corpus/application/TextService.cacheInvalidation.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

test('invalidates every line and variant selection for the saved chapter', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  const selections: readonly [number[], number[]][] = [
    [[], []],
    [[1, 2], [0]],
    [[3], [1]],
  ]
  await Promise.all(
    selections.map(([lines, variants]) =>
      service.findChapterDisplay(chapterId, lines, variants),
    ),
  )

  await service.updateEditedLines(chapterId, noLineChanges)
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  const displays = await Promise.all(
    selections.map(([lines, variants]) =>
      service.findChapterDisplay(chapterId, lines, variants),
    ),
  )
  expect(displays.map((display) => display.atf)).toEqual([
    'saved display',
    'saved display',
    'saved display',
  ])
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(6)
})

test('preserves a different chapter whose URL shares the saved chapter prefix', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  const otherId = { ...chapterId, name: `${chapterId.name}2` }
  await service.findChapterDisplay(chapterId)
  await service.findChapterDisplay(otherId)

  await service.updateEditedLines(chapterId, noLineChanges)
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(otherId)).resolves.toMatchObject({
    atf: 'old display',
  })
  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(3)
})

test('retains a warm display after a rejected save', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  await service.findChapterDisplay(chapterId)
  apiClient.postJson.mockRejectedValue(new Error('rejected'))

  await expect(
    service.updateEditedLines(chapterId, noLineChanges),
  ).rejects.toThrow('rejected')
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'old display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
})

test('invalidates a successful save even if its response cannot be decoded', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  await service.findChapterDisplay(chapterId)
  apiClient.postJson.mockImplementationOnce(
    (_path, _body, _authenticate, onHttpSuccess) => {
      onHttpSuccess?.()
      return Promise.reject(new SyntaxError('Unexpected end of JSON input'))
    },
  )

  await expect(
    service.updateEditedLines(chapterId, noLineChanges),
  ).rejects.toBeInstanceOf(SyntaxError)
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('keeps successful display requests deduplicated after invalidation', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  await service.findChapterDisplay(chapterId)
  await service.updateEditedLines(chapterId, noLineChanges)
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  const [first, second] = await Promise.all([
    service.findChapterDisplay(chapterId),
    service.findChapterDisplay(chapterId),
  ])
  expect(first).toBe(second)
  expect(apiClient.fetchJson).toHaveBeenLastCalledWith(
    `${chapterUrl}/display`,
    false,
  )
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})
