import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-helpers/utils'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const wordRepository = new BibliographyRepository(apiClient)
const author = 'Bor Ger'
const year = '1998'
const title = 'The Qualifications'
const id = 'RN 2020'
const resultStub = {
  id: id,
}
const entry = new BibliographyEntry(resultStub)

const testData: TestData[] = [
  [
    'find',
    [id],
    apiClient.fetchJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [[author, year, title]],
    apiClient.fetchJson,
    [entry],
    [
      `/bibliography?0=${encodeURIComponent(author)}&1=${encodeURIComponent(
        year
      )}&2=${encodeURIComponent(title)}`,
      true,
    ],
    Promise.resolve([resultStub]),
  ],
  [
    'update',
    [entry],
    apiClient.postJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, resultStub],
    Promise.resolve(resultStub),
  ],
  [
    'create',
    [entry],
    apiClient.postJson,
    entry,
    ['/bibliography', resultStub],
    Promise.resolve(resultStub),
  ],
]

describe('BibliographyRepository', () =>
  testDelegation(wordRepository, testData))
