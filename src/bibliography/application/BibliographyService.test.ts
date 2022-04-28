import { testDelegation, TestData } from 'test-support/utils'
import BibliographyService from './BibliographyService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

jest.mock('bibliography/infrastructure/BibliographyRepository', () => {
  return function () {
    return {
      find: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    }
  }
})
const resultStub = {}

const bibliographyRepository = new (BibliographyRepository as jest.Mock)()
const bibliographyService = new BibliographyService(bibliographyRepository)

const testData: TestData<BibliographyService>[] = [
  new TestData('find', ['RN2020'], bibliographyRepository.find, [resultStub]),
  new TestData('update', [resultStub], bibliographyRepository.update, [
    resultStub,
  ]),
  new TestData('create', [resultStub], bibliographyRepository.create, [
    resultStub,
  ]),
  new TestData(
    'search',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyRepository.search,
    [resultStub]
  ),
  new TestData('search', ['Alba Cecilia'], bibliographyRepository.search, [
    resultStub,
  ]),
]
describe('BibliographyService', () =>
  testDelegation(bibliographyService, testData))
