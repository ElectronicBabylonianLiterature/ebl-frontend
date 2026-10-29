import TextService from 'corpus/application/TextService'
import { Chapter } from 'corpus/domain/chapter'
import { chapter } from 'test-support/test-corpus-text'
import {
  chapterId,
  chapterUrl,
} from 'corpus/application/TextService.testSupport'
import {
  createChapterCacheTestContext,
  freshDisplayDto,
} from 'corpus/application/TextService.cacheInvalidation.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const updates: readonly [string, (service: TextService) => Promise<Chapter>][] =
  [
    [
      'alignment',
      (service) => service.updateAlignment(chapterId, chapter.alignment),
    ],
    ['lemmatization', (service) => service.updateLemmatization(chapterId, [])],
    ['manuscripts', (service) => service.updateManuscripts(chapterId, [], [])],
    ['lines', (service) => service.updateLines(chapterId, [])],
    ['import', (service) => service.importChapter(chapterId, '1. kur')],
  ]

test.each(updates)(
  '%s saves refresh a warm chapter display',
  async (_, update) => {
    const { apiClient, service } = createChapterCacheTestContext()
    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      atf: 'old display',
    })

    await update(service)
    apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      atf: 'saved display',
    })
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  },
)

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

  await service.updateLines(chapterId, [])
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

  await service.updateLines(chapterId, [])
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

  await expect(service.updateLines(chapterId, [])).rejects.toThrow('rejected')
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
    (_path, _body, _authenticate, onHttpSuccess) =>
      Promise.resolve(null).then((response) => {
        onHttpSuccess?.()
        return response
      }),
  )

  await expect(service.updateLines(chapterId, [])).rejects.toBeInstanceOf(
    TypeError,
  )
  apiClient.fetchJson.mockResolvedValue(freshDisplayDto)

  await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
    atf: 'saved display',
  })
  expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
})

test('keeps successful display requests deduplicated after invalidation', async () => {
  const { apiClient, service } = createChapterCacheTestContext()
  await service.findChapterDisplay(chapterId)
  await service.updateLines(chapterId, [])
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
