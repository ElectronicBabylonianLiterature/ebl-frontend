import { testDelegation } from 'test-support/utils'
import { chapter, chapterDto } from 'test-support/test-corpus-text'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { createWriteTestData } from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const testData = createWriteTestData(apiClient)

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

describe('TextService writes', () => testDelegation(textService, testData))

test('saves a chapter when provenance preload fails', async () => {
  const provenanceError = new Error('provenance request failed')
  fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
    Promise.reject(provenanceError),
  )

  apiClient.postJson.mockResolvedValueOnce(chapterDto)
  await expect(textService.importChapter(chapterId, '1. kur')).resolves.toEqual(
    chapter,
  )

  expect(apiClient.postJson).toHaveBeenCalledWith(`${chapterUrl}/import`, {
    atf: '1. kur',
  })
})
