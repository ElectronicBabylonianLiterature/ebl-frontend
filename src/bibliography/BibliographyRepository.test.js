
import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from './bibliographyEntry'

const apiClient = {
  fetchJson: jest.fn()
}
const wordRepository = new BibliographyRepository(apiClient)
const author = 'Bor Ger'
const year = '1998'
const title = 'The Qualifications'
const id = 'RN 2020'
const resultStub = {}

const testData = [
  ['find', [id], apiClient.fetchJson, new BibliographyEntry(resultStub), [`/bibliography/${encodeURIComponent(id)}`, true], Promise.resolve(resultStub)],
  ['search', [author, year, title], apiClient.fetchJson, [new BibliographyEntry(resultStub)], [`/bibliography?author=${encodeURIComponent(author)}&title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`, true], Promise.resolve([resultStub])]
]

testDelegation(wordRepository, testData)
