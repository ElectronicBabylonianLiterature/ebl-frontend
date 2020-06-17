import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const wordRepository = new BibliographyRepository(apiClient)
const query = 'Bor Ger 1998 The Qualifications'
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
    [query],
    apiClient.fetchJson,
    [entry],
    [`/bibliography?query=${encodeURIComponent(query)}`, true],
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
