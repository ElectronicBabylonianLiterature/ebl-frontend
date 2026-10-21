import { testDelegation } from 'test-support/utils'
import { createTextServiceTestContext } from 'corpus/application/TextService.testSupport'
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
