import { testDelegation, TestData } from 'test-support/utils'
import BibliographyService from './BibliographyService'

const resultStub = {}

const bibliographyRepository = {
  find: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
}

const bibliographyService = new BibliographyService(bibliographyRepository)

const testData: TestData[] = [
  ['find', ['RN2020'], bibliographyRepository.find, [resultStub]],
  ['update', [resultStub], bibliographyRepository.update, [resultStub]],
  ['create', [resultStub], bibliographyRepository.create, [resultStub]],
  [
    'search',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyRepository.search,
    [resultStub],
  ],
  ['search', ['Alba Cecilia'], bibliographyRepository.search, [resultStub]],
]
describe('BibliographyService', () =>
  testDelegation(bibliographyService, testData))
