import { testDelegation } from 'test-helpers/utils'
import BibliographyService from './BibliographyService'

const resultStub = {}

const bibliographyRepository = {
  find: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  create: jest.fn()
}

const bibliographyService = new BibliographyService(bibliographyRepository)

const testData = [
  ['find', ['RN2020'], bibliographyRepository.find, [resultStub]],
  ['update', [resultStub], bibliographyRepository.update, [resultStub]],
  ['create', [resultStub], bibliographyRepository.create, [resultStub]],
  [
    'search',
    ['Alba Cecilia 1998 The Qualifications'],
    bibliographyRepository.search,
    [resultStub],
    ['Alba Cecilia', '1998', 'The Qualifications']
  ],
  [
    'search',
    ['Alba Cecilia'],
    bibliographyRepository.search,
    [resultStub],
    ['Alba Cecilia', '', '']
  ]
]

testDelegation(bibliographyService, testData)

test('Search with empty query', async () => {
  await expect(bibliographyService.search('')).resolves.toEqual([])
})
