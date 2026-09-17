import TextService from 'corpus/application/TextService'
import { text, chapterDto } from 'test-support/test-corpus-text'
import {
  chapterId,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { textsDto } from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService, createService } =
  createTextServiceTestContext()

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

describe('list caching', () => {
  let service: TextService

  beforeEach(() => {
    service = createService()
  })

  test('returns cached result on second call', async () => {
    apiClient.fetchJson.mockReturnValue(Promise.resolve(textsDto))

    const first = await service.list()
    const second = await service.list()

    expect(first).toEqual([text])
    expect(second).toEqual([text])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(1)
  })

  test('clears cache on error and allows retry', async () => {
    const error = new Error('network error')

    apiClient.fetchJson.mockReturnValueOnce(Promise.reject(error))

    await expect(service.list()).rejects.toThrow('network error')

    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(textsDto))

    await expect(service.list()).resolves.toEqual([text])
    expect(apiClient.fetchJson).toHaveBeenCalledTimes(2)
  })
})

describe('loadProvenances delegation', () => {
  test('delegates to fragmentService.fetchProvenances', async () => {
    fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
    apiClient.fetchJson.mockReturnValue(Promise.resolve(chapterDto))

    await textService.findChapter(chapterId)

    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalled()
  })
})
