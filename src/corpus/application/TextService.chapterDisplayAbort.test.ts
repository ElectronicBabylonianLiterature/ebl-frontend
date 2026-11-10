import {
  chapterDisplayDto,
  chapterId,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { chapterDisplayConcurrencyLimit } from 'corpus/application/textServiceConstants'
import { deferred, settle } from 'test-support/concurrencyLimiterHelpers'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, createService } =
  createTextServiceTestContext()

beforeEach(() => {
  jest.clearAllMocks()
  fragmentServiceMock.fetchProvenances.mockResolvedValue([])
})

function requestedSignal(callIndex: number): AbortSignal {
  return apiClient.fetchJson.mock.calls[callIndex][2] as AbortSignal
}

describe('findChapterDisplay cancellation', () => {
  it('aborts the HTTP request when the only caller aborts', async () => {
    const service = createService()
    apiClient.fetchJson.mockReturnValue(new Promise(() => undefined))
    const controller = new AbortController()

    const request = service.findChapterDisplay(
      chapterId,
      [1],
      [0],
      controller.signal,
    )
    await settle()
    expect(requestedSignal(0).aborted).toBe(false)

    controller.abort()

    expect(requestedSignal(0).aborted).toBe(true)
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('keeps the HTTP request alive for a caller without a signal', async () => {
    const service = createService()
    const response = deferred<typeof chapterDisplayDto>()
    apiClient.fetchJson.mockReturnValue(response.promise)
    const controller = new AbortController()

    const abortable = service.findChapterDisplay(
      chapterId,
      [],
      [],
      controller.signal,
    )
    const pinned = service.findChapterDisplay(chapterId)
    await settle()
    controller.abort()

    await expect(abortable).rejects.toMatchObject({ name: 'AbortError' })
    expect(requestedSignal(0).aborted).toBe(false)

    response.resolve(chapterDisplayDto)
    await expect(pinned).resolves.toBeDefined()
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  it('refetches after an aborted request instead of reusing it', async () => {
    const service = createService()
    apiClient.fetchJson.mockReturnValueOnce(new Promise(() => undefined))
    apiClient.fetchJson.mockResolvedValueOnce(chapterDisplayDto)
    const controller = new AbortController()

    const abandoned = service.findChapterDisplay(
      chapterId,
      [],
      [],
      controller.signal,
    )
    await settle()
    controller.abort()
    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' })

    await expect(service.findChapterDisplay(chapterId)).resolves.toBeDefined()
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })

  it('removes an aborted request from the limiter queue', async () => {
    const service = createService()
    const responses = Array.from(
      { length: chapterDisplayConcurrencyLimit },
      () => deferred<typeof chapterDisplayDto>(),
    )
    responses.forEach((response) =>
      apiClient.fetchJson.mockReturnValueOnce(response.promise),
    )
    apiClient.fetchJson.mockResolvedValue(chapterDisplayDto)

    const active = responses.map((_response, index) =>
      service.findChapterDisplay(chapterId, [index], [0]),
    )
    await settle()
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(responses.length)

    const controller = new AbortController()
    const queued = service.findChapterDisplay(
      chapterId,
      [responses.length],
      [0],
      controller.signal,
    )
    const next = service.findChapterDisplay(
      chapterId,
      [responses.length + 1],
      [0],
    )
    await settle()
    controller.abort()
    await expect(queued).rejects.toMatchObject({ name: 'AbortError' })

    responses.forEach((response) => response.resolve(chapterDisplayDto))
    await Promise.all([...active, next])

    expect(apiClient.fetchJson).toHaveBeenCalledTimes(responses.length + 1)
    expect(apiClient.fetchJson.mock.calls.at(-1)?.[0]).toContain(
      `lines=${responses.length + 1}`,
    )
  })
})
