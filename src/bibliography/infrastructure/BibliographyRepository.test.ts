import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import ApiClient from 'http/ApiClient'

const apiClient = new (ApiClient as jest.Mock<ApiClient>)()
const apiClientFetchJson = jest.fn()
const apiClientPostJson = jest.fn()
apiClient.fetchJson = apiClientFetchJson
apiClient.postJson = apiClientPostJson
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
    apiClientFetchJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [query],
    apiClientFetchJson,
    [entry],
    [`/bibliography?query=${encodeURIComponent(query)}`, true],
    Promise.resolve([resultStub]),
  ],
  [
    'update',
    [entry],
    apiClientPostJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, resultStub],
    Promise.resolve(resultStub),
  ],
  [
    'create',
    [entry],
    apiClientPostJson,
    entry,
    ['/bibliography', resultStub],
    Promise.resolve(resultStub),
  ],
]

describe('BibliographyRepository', () =>
  testDelegation(wordRepository, testData))
