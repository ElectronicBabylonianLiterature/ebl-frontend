import Bluebird from 'bluebird'
import TextService from 'corpus/application/TextService'
import {
  chapter,
  chapterDto,
  text,
  textDto,
} from 'test-support/test-corpus-text'
import {
  apiClient,
  bibliographyServiceMock,
  chapterDisplay,
  chapterDisplayDto,
  chapterId,
  chapterUrl,
  fragmentServiceMock,
  setupProvenances,
  testService,
  wordServiceMock,
} from 'corpus/application/textService.testSupport'

const textsDto = [textDto]

beforeEach(() => {
  setupProvenances()
})

describe('findManuscripts provenance preload', () => {
  test('propagates provenance preload errors', async () => {
    const service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
    )
    const provenanceError = new Error('provenance request failed')

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Bluebird.reject(provenanceError),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    await expect(service.findManuscripts(chapterId)).rejects.toBe(
      provenanceError,
    )

    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalledTimes(1)
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `${chapterUrl}/manuscripts`,
      false,
    )
  })

  test('retries provenance preload after a failed first attempt', async () => {
    const service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
    )
    const provenanceError = new Error('temporary provenance failure')

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Bluebird.reject(provenanceError),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Bluebird.resolve([]),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    await expect(service.findManuscripts(chapterId)).rejects.toBe(
      provenanceError,
    )
    await expect(service.findManuscripts(chapterId)).resolves.toEqual(
      chapter.manuscripts,
    )

    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalledTimes(2)
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })
})

describe('list caching', () => {
  let service: TextService

  beforeEach(() => {
    service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
    )
  })

  test('returns cached result on second call', async () => {
    apiClient.fetchJson.mockReturnValue(Bluebird.resolve(textsDto))

    const first = await service.list()
    const second = await service.list()

    expect(first).toEqual([text])
    expect(second).toEqual([text])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  test('clears cache on error and allows retry', async () => {
    const error = new Error('network error')

    apiClient.fetchJson.mockReturnValueOnce(Bluebird.reject(error))

    await expect(service.list()).rejects.toThrow('network error')

    apiClient.fetchJson.mockReturnValueOnce(Bluebird.resolve(textsDto))

    await expect(service.list()).resolves.toEqual([text])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })

  test('a stale scope rejection does not clear the current cached request', async () => {
    const scope = { current: 'guest' }
    service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
      () => scope.current,
    )
    const staleError = new Error('stale request failed')
    let rejectStaleRequest: (error: Error) => void = () => undefined
    const staleRequest = new Bluebird<unknown[]>((_resolve, reject) => {
      rejectStaleRequest = reject
    })
    apiClient.fetchJson
      .mockReturnValueOnce(staleRequest)
      .mockReturnValueOnce(Bluebird.resolve(textsDto))

    const firstRequest = service.list()
    scope.current = 'authenticated:user-a'
    await expect(service.list()).resolves.toEqual([text])

    const staleExpectation = expect(firstRequest).rejects.toBe(staleError)
    rejectStaleRequest(staleError)
    await staleExpectation

    await expect(service.list()).resolves.toEqual([text])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })
})

describe('findChapterDisplay caching', () => {
  test('deduplicates in-flight chapter display requests', async () => {
    const service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
    )
    fragmentServiceMock.fetchProvenances.mockReturnValue(Bluebird.resolve([]))

    apiClient.fetchJson.mockResolvedValue(chapterDisplayDto)

    const [firstRequest, secondRequest] = await Promise.all([
      service.findChapterDisplay(chapterId),
      service.findChapterDisplay(chapterId),
    ])

    expect(firstRequest).toMatchObject({
      id: chapterDisplay.id,
    })
    expect(secondRequest).toMatchObject({
      id: chapterDisplay.id,
    })
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  test('clears chapter display cache when scope changes', async () => {
    const scope = { current: 'guest' }
    const service = new TextService(
      apiClient,
      fragmentServiceMock,
      wordServiceMock,
      bibliographyServiceMock,
      () => scope.current,
    )

    fragmentServiceMock.fetchProvenances.mockReturnValue(Bluebird.resolve([]))
    apiClient.fetchJson.mockResolvedValue(chapterDisplayDto)

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })
    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })

    scope.current = 'authenticated:user-a'

    await expect(service.findChapterDisplay(chapterId)).resolves.toMatchObject({
      id: chapterDisplay.id,
    })

    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })
})

describe('loadProvenances delegation', () => {
  test('delegates to fragmentService.fetchProvenances', async () => {
    fragmentServiceMock.fetchProvenances.mockReturnValue(Bluebird.resolve([]))
    apiClient.fetchJson.mockReturnValue(Bluebird.resolve(chapterDto))

    await testService.findChapter(chapterId)

    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalled()
  })
})
