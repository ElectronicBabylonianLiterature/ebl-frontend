import { testDelegation } from 'test-support/utils'
import { chapter, chapterDto } from 'test-support/test-corpus-text'
import { createWriteTestData } from 'corpus/application/TextService.update.testSupport'
import {
  apiClient,
  chapterId,
  chapterUrl,
  fragmentServiceMock,
  setupProvenances,
  testService,
} from 'corpus/application/TextService.regression.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const testData = createWriteTestData(apiClient)

beforeEach(() => {
  setupProvenances()
})

describe('TextService', () => testDelegation(testService, testData))

test('saves a chapter when provenance preload fails', async () => {
  const provenanceError = new Error('provenance request failed')
  fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
    Promise.reject(provenanceError),
  )

  apiClient.postJson.mockResolvedValueOnce(chapterDto)
  await expect(testService.importChapter(chapterId, '1. kur')).resolves.toEqual(
    chapter,
  )

  expect(apiClient.postJson).toHaveBeenCalledWith(`${chapterUrl}/import`, {
    atf: '1. kur',
  })
})
