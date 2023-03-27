import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import ApiClient from 'http/ApiClient'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()

const wordRepository = new BibliographyRepository(apiClient)
const query = 'Bor Ger 1998 The Qualifications'
const id = 'RN 2020'
const resultStub = {
  id: id,
}
const entry = new BibliographyEntry(resultStub)

const testData: TestData<BibliographyRepository>[] = [
  new TestData(
    'find',
    [id],
    apiClient.fetchJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, false],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'search',
    [query],
    apiClient.fetchJson,
    [entry],
    [`/bibliography?query=${encodeURIComponent(query)}`, false],
    Promise.resolve([resultStub])
  ),
  new TestData(
    'update',
    [entry],
    apiClient.postJson,
    entry,
    [`/bibliography/${encodeURIComponent(id)}`, resultStub],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'create',
    [entry],
    apiClient.postJson,
    entry,
    ['/bibliography', resultStub],
    Promise.resolve(resultStub)
  ),
  new TestData(
    'listAllBibliography',
    [],
    apiClient.fetchJson,
    [entry.id],
    ['/bibliography/all', false],
    Promise.resolve([entry.id])
  ),
]

describe('BibliographyRepository', () =>
  testDelegation(wordRepository, testData))
