import { chapter, chapterDto } from 'test-support/test-corpus-text'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
  word,
} from 'corpus/application/TextService.testSupport'
import { lemmatization } from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const {
  apiClient,
  fragmentServiceMock,
  wordServiceMock,
  textService,
  createService,
} = createTextServiceTestContext()

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

test('findSuggestions', async () => {
  wordServiceMock.find.mockReturnValue(Promise.resolve(word))
  fragmentServiceMock.findSuggestions.mockReturnValue(Promise.resolve([]))
  await expect(textService.findSuggestions(chapter)).resolves.toEqual(
    lemmatization,
  )
})

test('listAllTexts', async () => {
  textService.listAllTexts()
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/corpus/texts/all', false)
})

test('listAllChapters', async () => {
  textService.listAllChapters()
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/corpus/chapters/all',
    false,
  )
})

describe('findManuscripts provenance preload', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('logs provenance preload errors and still returns manuscripts', async () => {
    const service = createService()
    const provenanceError = new Error('provenance request failed')
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Promise.reject(provenanceError),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    await expect(service.findManuscripts(chapterId)).resolves.toEqual(
      chapter.manuscripts,
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to preload provenances',
      provenanceError,
    )
    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalled()
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `${chapterUrl}/manuscripts`,
      false,
    )
  })

  test('retries provenance preload after a failed first attempt', async () => {
    const service = createService()
    const provenanceError = new Error('temporary provenance failure')

    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Promise.reject(provenanceError),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      Promise.resolve([]),
    )
    apiClient.fetchJson.mockResolvedValueOnce(chapterDto.manuscripts)

    await expect(service.findManuscripts(chapterId)).resolves.toEqual(
      chapter.manuscripts,
    )
    await expect(service.findManuscripts(chapterId)).resolves.toEqual(
      chapter.manuscripts,
    )

    expect(fragmentServiceMock.fetchProvenances).toHaveBeenCalledTimes(2)
  })
})
